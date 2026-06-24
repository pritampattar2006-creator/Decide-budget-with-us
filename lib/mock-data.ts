import type { Expense, Goal, UserProfile } from "./types"

export const defaultProfile: UserProfile = {
  name: "Aarav Sharma",
  persona: "Professional",
  income: 40000,
  occupation: "Software Engineer",
  age: 26,
  maritalStatus: "Single",
  familyMembers: 1,
  loans: 180000,
  savings: 95000,
  investments: 60000,
  goals: ["Emergency Fund", "Buy a Laptop", "Trip to Goa"],
  onboarded: true,
}

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

export const seedExpenses: Expense[] = [
  { id: "e1", title: "Dominos Pizza", amount: 450, category: "Food", date: daysAgo(1), method: "receipt" },
  { id: "e2", title: "Uber to office", amount: 220, category: "Transport", date: daysAgo(1), method: "manual" },
  { id: "e3", title: "Monthly Rent", amount: 8000, category: "Rent", date: daysAgo(3), method: "manual" },
  { id: "e4", title: "Amazon order", amount: 1899, category: "Shopping", date: daysAgo(4), method: "manual" },
  { id: "e5", title: "Electricity bill", amount: 1450, category: "Bills", date: daysAgo(5), method: "manual" },
  { id: "e6", title: "Groceries", amount: 2300, category: "Food", date: daysAgo(6), method: "csv" },
  { id: "e7", title: "Movie night", amount: 700, category: "Entertainment", date: daysAgo(7), method: "manual" },
  { id: "e8", title: "Pharmacy", amount: 540, category: "Medical", date: daysAgo(9), method: "receipt" },
  { id: "e9", title: "SIP - Index Fund", amount: 3000, category: "Investment", date: daysAgo(10), method: "manual" },
  { id: "e10", title: "Internet recharge", amount: 799, category: "Bills", date: daysAgo(12), method: "manual" },
  { id: "e11", title: "Coffee & snacks", amount: 320, category: "Food", date: daysAgo(2), method: "voice" },
  { id: "e12", title: "Udemy course", amount: 499, category: "Education", date: daysAgo(14), method: "manual" },
]

function monthsFromNow(n: number): string {
  const d = new Date()
  d.setMonth(d.getMonth() + n)
  return d.toISOString()
}

export const seedGoals: Goal[] = [
  {
    id: "g1",
    name: "Emergency Fund",
    target: 120000,
    saved: 72000,
    monthlyContribution: 6000,
    deadline: monthsFromNow(8),
  },
  {
    id: "g2",
    name: "MacBook Air",
    target: 95000,
    saved: 28000,
    monthlyContribution: 5000,
    deadline: monthsFromNow(14),
  },
  {
    id: "g3",
    name: "Trip to Goa",
    target: 40000,
    saved: 31000,
    monthlyContribution: 4000,
    deadline: monthsFromNow(2),
  },
]

// ─── Module 9: Subscriptions ──────────────────────────────────────────────
export const subscriptions = [
  { id: "s1", name: "Netflix", amount: 649, cycle: "Monthly", lastUsed: "2 days ago", daysUntilRenewal: 8, status: "active" as const, category: "Entertainment" },
  { id: "s2", name: "Spotify", amount: 119, cycle: "Monthly", lastUsed: "Today", daysUntilRenewal: 14, status: "active" as const, category: "Entertainment" },
  { id: "s3", name: "ChatGPT Plus", amount: 1650, cycle: "Monthly", lastUsed: "Today", daysUntilRenewal: 22, status: "active" as const, category: "Productivity" },
  { id: "s4", name: "Prime Video", amount: 299, cycle: "Monthly", lastUsed: "26 days ago", daysUntilRenewal: 4, status: "unused" as const, category: "Entertainment" },
  { id: "s5", name: "YouTube Premium", amount: 149, cycle: "Monthly", lastUsed: "5 days ago", daysUntilRenewal: 18, status: "active" as const, category: "Entertainment" },
  { id: "s6", name: "Notion Pro", amount: 400, cycle: "Monthly", lastUsed: "30 days ago", daysUntilRenewal: 2, status: "unused" as const, category: "Productivity" },
]

// ─── Module 10: EMIs ──────────────────────────────────────────────────────
export const emis = [
  { id: "em1", name: "Education Loan", emi: 7500, remaining: 180000, principal: 300000, rate: 9.2, dueDay: 5, startDate: "2023-06-01", endDate: "2027-06-01", bank: "SBI", paidMonths: 24 },
  { id: "em2", name: "Bike Loan", emi: 3200, remaining: 41600, principal: 80000, rate: 11.5, dueDay: 12, startDate: "2025-01-01", endDate: "2027-01-01", bank: "HDFC", paidMonths: 6 },
]

// ─── Module 11: Bills ─────────────────────────────────────────────────────
export const bills = [
  { id: "b1", name: "Electricity", amount: 1450, dueDay: 15, category: "Utility", lastPaid: daysAgo(18), isPaid: false, isRecurring: true, icon: "⚡" },
  { id: "b2", name: "Internet (Jio)", amount: 799, dueDay: 20, category: "Utility", lastPaid: daysAgo(12), isPaid: true, isRecurring: true, icon: "🌐" },
  { id: "b3", name: "Mobile Recharge", amount: 299, dueDay: 28, category: "Telecom", lastPaid: daysAgo(5), isPaid: true, isRecurring: true, icon: "📱" },
  { id: "b4", name: "Rent", amount: 8000, dueDay: 1, category: "Housing", lastPaid: daysAgo(24), isPaid: false, isRecurring: true, icon: "🏠" },
  { id: "b5", name: "Water", amount: 250, dueDay: 10, category: "Utility", lastPaid: daysAgo(2), isPaid: true, isRecurring: true, icon: "💧" },
  { id: "b6", name: "Gas Cylinder", amount: 920, dueDay: 0, category: "Utility", lastPaid: daysAgo(40), isPaid: false, isRecurring: false, icon: "🔥" },
]

// ─── Module 14: Investments ───────────────────────────────────────────────
export const investments = [
  { id: "i1", name: "Nifty 50 Index Fund", type: "Mutual Fund" as const, invested: 36000, currentValue: 42800, returns: 18.9, sipAmount: 3000, risk: "Low" as const, platform: "Zerodha" },
  { id: "i2", name: "HDFC Flexi Cap Fund", type: "Mutual Fund" as const, invested: 12000, currentValue: 14200, returns: 18.3, sipAmount: 1000, risk: "Medium" as const, platform: "Groww" },
  { id: "i3", name: "Reliance Industries", type: "Stock" as const, invested: 5000, currentValue: 6100, returns: 22.0, sipAmount: 0, risk: "High" as const, platform: "Zerodha" },
  { id: "i4", name: "FD - SBI 2 Year", type: "FD" as const, invested: 25000, currentValue: 27200, returns: 7.1, sipAmount: 0, risk: "Low" as const, platform: "SBI" },
  { id: "i5", name: "Digital Gold", type: "Gold" as const, invested: 8000, currentValue: 9500, returns: 18.75, sipAmount: 500, risk: "Low" as const, platform: "PhonePe" },
]

// ─── Module 13: Family Finance ────────────────────────────────────────────
export const familyMembers = [
  { id: "f1", name: "Rajesh Sharma", role: "Father" as const, income: 65000, spent: 42000, avatar: "RS", color: "var(--color-chart-3)" },
  { id: "f2", name: "Sunita Sharma", role: "Mother" as const, income: 30000, spent: 19500, avatar: "SS", color: "var(--color-chart-2)" },
  { id: "f3", name: "Aarav Sharma", role: "Self" as const, income: 40000, spent: 28000, avatar: "AS", color: "var(--color-chart-1)" },
  { id: "f4", name: "Riya Sharma", role: "Sister" as const, income: 5000, spent: 3200, avatar: "RY", color: "var(--color-chart-4)" },
]

export const sharedBills = [
  { name: "Home Rent", amount: 18000, splitType: "Equal" as const },
  { name: "Electricity", amount: 2200, splitType: "Equal" as const },
  { name: "Groceries", amount: 8500, splitType: "Equal" as const },
  { name: "Internet", amount: 1200, splitType: "Equal" as const },
]

// ─── Module 17: Achievements / Gamification ───────────────────────────────
export const achievements = [
  { id: "a1", title: "First ₹1,000 Saved", desc: "Saved your first ₹1,000 — the journey begins!", icon: "💰", earned: true, earnedDate: "2025-03-15", points: 100 },
  { id: "a2", title: "30 Day Streak", desc: "Logged expenses for 30 consecutive days", icon: "🔥", earned: true, earnedDate: "2025-04-20", points: 250 },
  { id: "a3", title: "Budget Master", desc: "Stayed within budget for 3 months straight", icon: "🎯", earned: true, earnedDate: "2025-05-01", points: 300 },
  { id: "a4", title: "Emergency Fund Built", desc: "Saved at least 3 months of expenses", icon: "🛡️", earned: false, earnedDate: null, points: 500 },
  { id: "a5", title: "Debt Slayer", desc: "Paid off one complete loan", icon: "⚔️", earned: false, earnedDate: null, points: 750 },
  { id: "a6", title: "Investment Newbie", desc: "Started your first SIP investment", icon: "📈", earned: true, earnedDate: "2025-02-01", points: 150 },
  { id: "a7", title: "Zero Spend Day", desc: "Completed a full day with ₹0 spent", icon: "🧘", earned: true, earnedDate: "2025-06-10", points: 50 },
  { id: "a8", title: "Goal Crusher", desc: "Completed a savings goal ahead of deadline", icon: "🏆", earned: false, earnedDate: null, points: 400 },
  { id: "a9", title: "Smart Subscriber", desc: "Cancelled an unused subscription", icon: "✂️", earned: false, earnedDate: null, points: 100 },
  { id: "a10", title: "Tax Ready", desc: "Generated your first tax summary report", icon: "📋", earned: false, earnedDate: null, points: 200 },
]

export const challenges = [
  { id: "c1", title: "No-Spend Weekend", desc: "Don't spend on entertainment this weekend", reward: 75, daysLeft: 2, progress: 60 },
  { id: "c2", title: "Save ₹5,000 this month", desc: "Add ₹5,000 to your Emergency Fund goal", reward: 200, daysLeft: 8, progress: 72 },
  { id: "c3", title: "Cook 5 meals at home", desc: "Reduce food spend by cooking instead of ordering", reward: 100, daysLeft: 5, progress: 40 },
]

// ─── Modules 19 & 20: AI Predictions + Fraud Alerts ──────────────────────
export const predictions = [
  { id: "p1", type: "warning" as const, title: "Overspending Risk", message: "You've spent 68% of your budget in 15 days. At this rate, you'll overshoot by ₹4,200.", action: "Review expenses" },
  { id: "p2", type: "info" as const, title: "Subscription Renewal", message: "Prime Video renews in 4 days (₹299). You haven't used it in 26 days.", action: "Cancel subscription" },
  { id: "p3", type: "success" as const, title: "Goal on Track", message: "Emergency Fund will complete 2 months ahead of schedule at this rate!", action: "View goal" },
]

export const fraudAlerts = [
  { id: "fr1", severity: "high" as const, title: "Duplicate Transaction", message: "₹450 at Dominos was charged twice on 23 Jun.", time: "2 hours ago" },
  { id: "fr2", severity: "medium" as const, title: "Unusual Large Spend", message: "₹8,000 expense detected — higher than your typical ₹2,500 daily average.", time: "1 day ago" },
]
