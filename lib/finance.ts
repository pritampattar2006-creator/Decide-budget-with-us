import type { AllocationItem, Expense, Goal, UserProfile } from "./types"

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(amount))
}

export function formatCompactINR(amount: number): string {
  if (Math.abs(amount) >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`
  if (Math.abs(amount) >= 100000) return `₹${(amount / 100000).toFixed(2)} L`
  if (Math.abs(amount) >= 1000) return `₹${(amount / 1000).toFixed(1)}K`
  return `₹${Math.round(amount)}`
}

// Dynamic AI-style allocation based on income and persona.
export function buildAllocation(profile: UserProfile): AllocationItem[] {
  const income = profile.income || 0
  // Base 50/30/20 with persona adjustments.
  const isStudent = profile.persona === "Student"
  const needs = isStudent ? 0.45 : 0.5
  const wants = isStudent ? 0.35 : 0.3
  const savings = isStudent ? 0.2 : 0.2

  const needsTotal = income * needs
  const wantsTotal = income * wants
  const savingsTotal = income * savings

  return [
    { label: "Rent / Hostel", amount: needsTotal * 0.4, color: "var(--color-chart-1)" },
    { label: "Food", amount: needsTotal * 0.28, color: "var(--color-chart-2)" },
    { label: "Transport", amount: needsTotal * 0.16, color: "var(--color-chart-3)" },
    { label: "Bills", amount: needsTotal * 0.16, color: "var(--color-chart-4)" },
    { label: "Entertainment", amount: wantsTotal * 0.45, color: "var(--color-chart-5)" },
    { label: "Shopping", amount: wantsTotal * 0.35, color: "var(--color-chart-2)" },
    { label: "Others", amount: wantsTotal * 0.2, color: "var(--color-chart-3)" },
    { label: "Savings", amount: savingsTotal * 0.6, color: "var(--color-chart-1)" },
    { label: "Investment", amount: savingsTotal * 0.4, color: "var(--color-chart-4)" },
  ]
}

export interface HealthBreakdown {
  score: number
  savingsRate: number
  debtRatio: number
  emergencyMonths: number
  parts: { label: string; value: number; max: number }[]
}

export function computeHealthScore(
  profile: UserProfile,
  expenses: Expense[],
): HealthBreakdown {
  const income = profile.income || 1
  const monthlySpend = totalThisMonth(expenses) || income * 0.6
  const savingsRate = Math.max(0, (income - monthlySpend) / income)
  const debtRatio = Math.min(1, profile.loans / (income * 12 || 1))
  const emergencyMonths = profile.savings / (monthlySpend || 1)

  // Sub-scores (each weighted to a max).
  const savingsScore = Math.min(30, savingsRate * 100) // up to 30
  const debtScore = Math.max(0, 25 - debtRatio * 25) // up to 25
  const emergencyScore = Math.min(20, (emergencyMonths / 6) * 20) // up to 20
  const investScore = Math.min(15, (profile.investments / (income * 6 || 1)) * 15) // up to 15
  const disciplineScore = Math.min(10, savingsRate > 0.15 ? 10 : savingsRate * 50) // up to 10

  const score = Math.round(
    savingsScore + debtScore + emergencyScore + investScore + disciplineScore,
  )

  return {
    score: Math.min(100, score),
    savingsRate,
    debtRatio,
    emergencyMonths,
    parts: [
      { label: "Savings Rate", value: Math.round(savingsScore), max: 30 },
      { label: "Debt Health", value: Math.round(debtScore), max: 25 },
      { label: "Emergency Fund", value: Math.round(emergencyScore), max: 20 },
      { label: "Investments", value: Math.round(investScore), max: 15 },
      { label: "Discipline", value: Math.round(disciplineScore), max: 10 },
    ],
  }
}

export function isSameMonth(dateStr: string, ref = new Date()): boolean {
  const d = new Date(dateStr)
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth()
}

export function totalThisMonth(expenses: Expense[]): number {
  return expenses.filter((e) => isSameMonth(e.date)).reduce((s, e) => s + e.amount, 0)
}

export function spendByCategory(expenses: Expense[]): { category: string; amount: number }[] {
  const map = new Map<string, number>()
  for (const e of expenses.filter((x) => isSameMonth(x.date))) {
    map.set(e.category, (map.get(e.category) ?? 0) + e.amount)
  }
  return Array.from(map.entries())
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
}

export interface CategoryHeatmapRow {
  category: string
  values: number[]
}

export function spendByCategoryHeatmap(
  expenses: Expense[],
  months = 6,
): { months: string[]; rows: CategoryHeatmapRow[] } {
  const now = new Date()
  const monthDates = Array.from({ length: months }, (_, index) => {
    const d = new Date(now.getFullYear(), now.getMonth() - months + 1 + index, 1)
    return d
  })

  const rows = new Map<string, { category: string; values: number[]; total: number }>()
  const monthLabels = monthDates.map((d) => d.toLocaleString("en-US", { month: "short" }))

  monthDates.forEach((date, monthIndex) => {
    const monthlyTotals = expenses
      .filter((expense) => {
        const ed = new Date(expense.date)
        return ed.getFullYear() === date.getFullYear() && ed.getMonth() === date.getMonth()
      })
      .reduce((map, expense) => {
        map.set(expense.category, (map.get(expense.category) ?? 0) + expense.amount)
        return map
      }, new Map<string, number>())

    for (const [category, amount] of monthlyTotals.entries()) {
      const row = rows.get(category)
      if (row) {
        row.values[monthIndex] = amount
        row.total += amount
      } else {
        const values = Array(months).fill(0)
        values[monthIndex] = amount
        rows.set(category, { category, values, total: amount })
      }
    }

    for (const row of rows.values()) {
      if (row.values[monthIndex] === undefined) {
        row.values[monthIndex] = 0
      }
    }
  })

  return {
    months: monthLabels,
    rows: Array.from(rows.values())
      .sort((a, b) => b.total - a.total)
      .map(({ category, values }) => ({ category, values })),
  }
}

// Last 6 months of income vs expense (mock-derived trend).
export function monthlyTrend(profile: UserProfile, expenses: Expense[]) {
  const months: { month: string; income: number; expense: number; savings: number }[] = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const label = d.toLocaleString("en-US", { month: "short" })
    const monthExpenses = expenses
      .filter((e) => {
        const ed = new Date(e.date)
        return ed.getMonth() === d.getMonth() && ed.getFullYear() === d.getFullYear()
      })
      .reduce((s, e) => s + e.amount, 0)
    // Fall back to a realistic estimate for empty historical months.
    const expense = monthExpenses || Math.round(profile.income * (0.55 + Math.random() * 0.2))
    months.push({
      month: label,
      income: profile.income,
      expense,
      savings: Math.max(0, profile.income - expense),
    })
  }
  return months
}

export function goalProgress(goal: Goal): number {
  return Math.min(100, Math.round((goal.saved / goal.target) * 100))
}

export function goalSuccessProbability(goal: Goal): number {
  const remaining = goal.target - goal.saved
  if (remaining <= 0) return 100
  const months = Math.max(
    1,
    Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)),
  )
  const needed = remaining / months
  const ratio = goal.monthlyContribution / needed
  return Math.max(5, Math.min(99, Math.round(ratio * 85)))
}
