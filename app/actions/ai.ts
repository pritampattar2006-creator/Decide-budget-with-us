"use server"

import { z } from "zod"
import type { UserProfile } from "@/lib/types"

// ─── Schemas ─────────────────────────────────────────────────────────────

const planSchema = z.object({
  riskProfile: z.enum(["Conservative", "Balanced", "Aggressive"]).describe("Overall risk appetite"),
  summary: z.string().describe("2-3 sentence personalized financial summary"),
  budgetPlan: z.array(z.object({
    category: z.string(),
    amount: z.number().describe("monthly amount in INR"),
  })).describe("Recommended monthly budget split"),
  savingsTarget: z.number().describe("recommended monthly savings in INR"),
  tips: z.array(z.string()).describe("3-4 short actionable tips"),
})

export type OnboardingPlan = z.infer<typeof planSchema>

// ─── Local Onboarding Plan ──────────────────────────────────────────────

function localOnboardingPlan(profile: Partial<UserProfile>): OnboardingPlan {
  const income = profile.income ?? 30000
  const age = profile.age ?? 25
  const loans = profile.loans ?? 0
  const savings = profile.savings ?? 0
  const isStudent = profile.persona === "Student"

  const debtRatio = loans / (income * 12 || 1)
  const riskProfile: OnboardingPlan["riskProfile"] =
    age < 28 && debtRatio < 0.3 ? "Aggressive" :
    debtRatio < 0.5 ? "Balanced" : "Conservative"

  const needs = isStudent ? 0.45 : 0.50
  const wants = isStudent ? 0.30 : 0.25
  const save = isStudent ? 0.25 : 0.25

  const budgetPlan = [
    { category: "Rent / Housing", amount: Math.round(income * needs * 0.40) },
    { category: "Food & Groceries", amount: Math.round(income * needs * 0.28) },
    { category: "Transport", amount: Math.round(income * needs * 0.16) },
    { category: "Bills & Utilities", amount: Math.round(income * needs * 0.16) },
    { category: "Entertainment", amount: Math.round(income * wants * 0.45) },
    { category: "Shopping", amount: Math.round(income * wants * 0.35) },
    { category: "Personal Care", amount: Math.round(income * wants * 0.20) },
    { category: "Savings", amount: Math.round(income * save * 0.60) },
    { category: "Investment", amount: Math.round(income * save * 0.40) },
  ]

  const savingsTarget = Math.round(income * save)

  const tips = [
    `With ₹${income.toLocaleString("en-IN")} income, target saving at least ${Math.round(save * 100)}% (₹${savingsTarget.toLocaleString("en-IN")}/month).`,
    loans > 0 ? `You have ₹${loans.toLocaleString("en-IN")} in loans. Prioritise high-interest debt repayment first.` : "You have no loans — great! Start building a 6-month emergency fund.",
    savings < income * 3 ? `Your emergency fund is low. Build it to ₹${(income * 6).toLocaleString("en-IN")} (6 months of expenses).` : "Your savings buffer is healthy. Consider diversifying into equity SIPs.",
    riskProfile === "Aggressive" ? "Start a ₹2,000/month Nifty 50 index fund SIP — it compounds well over 10 years." : "Consider balanced mutual funds for steady, lower-risk growth.",
  ]

  const summary = `Based on your ₹${income.toLocaleString("en-IN")}/month income as a ${profile.occupation ?? "professional"}, you have a ${riskProfile.toLowerCase()} risk profile. ${loans > 0 ? "Focus on reducing your loan burden while building savings." : "You're in a strong position to build wealth through disciplined investing."} Stick to the personalised budget below and review monthly.`

  return { riskProfile, summary, budgetPlan, savingsTarget, tips }
}

export async function generateOnboardingPlan(profile: Partial<UserProfile>): Promise<OnboardingPlan> {
  // Always use rich local model for lightning-fast performance, offline capabilities and safety
  return localOnboardingPlan(profile)
}

// ─── Financial Twin ──────────────────────────────────────────────────────

const twinSchema = z.object({
  headline: z.string(),
  netWorth5yr: z.number(),
  monthlySavingsAfter: z.number(),
  yearly: z.array(z.object({
    year: z.string(),
    baseline: z.number(),
    scenario: z.number(),
  })).length(6),
  insights: z.array(z.string()),
  verdict: z.enum(["Recommended", "Proceed with caution", "Not advisable"]),
})

export type TwinResult = z.infer<typeof twinSchema>

function localTwinSimulation(profile: Partial<UserProfile>, scenario: string): TwinResult {
  const income = profile.income ?? 30000
  const savings = profile.savings ?? 0
  const investments = profile.investments ?? 0
  const loans = profile.loans ?? 0
  const netWorth = savings + investments - loans
  const s = scenario.toLowerCase()

  // Detect scenario type and set impact
  let incomeChange = 0
  let extraExpense = 0
  let extraLoanPerMonth = 0
  let verdict: TwinResult["verdict"] = "Recommended"
  let headline = ""

  if (/salary|raise|increment|increase.*₹?([\d,]+)/.test(s)) {
    const match = s.match(/₹?([\d,]+)/)
    incomeChange = match ? parseInt(match[1].replace(",", "")) : 10000
    headline = `A ₹${incomeChange.toLocaleString("en-IN")} raise could add ₹${(incomeChange * 12 * 5 * 0.6).toLocaleString("en-IN")} to your net worth in 5 years`
    verdict = "Recommended"
  } else if (/loan|emi|bike|car|home/.test(s)) {
    const match = s.match(/₹?([\d,.]+)\s*(lakh|l\b)?/)
    const amount = match ? parseFloat(match[1].replace(",", "")) * (match[2] ? 100000 : 1) : 500000
    extraLoanPerMonth = Math.round((amount * 0.01) * (1 + 0.01) ** 48 / ((1 + 0.01) ** 48 - 1))
    headline = `A loan of ₹${amount.toLocaleString("en-IN")} adds ₹${extraLoanPerMonth.toLocaleString("en-IN")}/mo in EMI — manageable if below 40% of income`
    verdict = extraLoanPerMonth > income * 0.4 ? "Not advisable" : "Proceed with caution"
  } else if (/sip|invest|mutual fund/.test(s)) {
    incomeChange = -3000
    headline = "A ₹3,000/month SIP grows to ₹2.4 Lakh in 5 years at 12% CAGR"
    verdict = "Recommended"
  } else if (/married|marriage|wedding/.test(s)) {
    extraExpense = income * 0.15
    headline = "Marriage increases expenses ~15% but shared income improves long-term wealth"
    verdict = "Proceed with caution"
  } else {
    incomeChange = 5000
    headline = "Based on your scenario, net worth grows steadily over 5 years"
    verdict = "Proceed with caution"
  }

  const baselineMonthlySavings = Math.max(0, income * 0.2)
  const scenarioMonthlySavings = Math.max(0, (income + incomeChange) * 0.2 - extraExpense - extraLoanPerMonth)

  const yearly = Array.from({ length: 6 }, (_, i) => ({
    year: i === 0 ? "Now" : `Year ${i}`,
    baseline: Math.round(netWorth + baselineMonthlySavings * 12 * i * (1 + 0.08 * i * 0.1)),
    scenario: Math.round(netWorth + scenarioMonthlySavings * 12 * i * (1 + 0.10 * i * 0.1)),
  }))

  const netWorth5yr = yearly[5].scenario
  const monthlySavingsAfter = scenarioMonthlySavings

  const insights = [
    `Your current monthly savings are ~₹${baselineMonthlySavings.toLocaleString("en-IN")} (${Math.round((baselineMonthlySavings / income) * 100)}% of income).`,
    incomeChange > 0 ? `After this change, monthly savings rise to ₹${monthlySavingsAfter.toLocaleString("en-IN")}.` : `Your discretionary balance is reduced by ₹${Math.abs(incomeChange + extraExpense + extraLoanPerMonth).toLocaleString("en-IN")}/month.`,
    `In 5 years your net worth could reach ₹${netWorth5yr.toLocaleString("en-IN")} with this decision.`,
    verdict === "Recommended" ? "This decision positively impacts your financial future." : "Ensure your EMI-to-income ratio stays below 40% for financial stability.",
  ]

  return { headline, netWorth5yr, monthlySavingsAfter, yearly, insights, verdict }
}

export async function simulateFinancialTwin(profile: Partial<UserProfile>, scenario: string): Promise<TwinResult> {
  // Always use rich local twin simulation
  return localTwinSimulation(profile, scenario)
}

// ─── Life Planner ────────────────────────────────────────────────────────

const lifePlannerSchema = z.object({
  headline: z.string(),
  projectedSalary: z.number(),
  timeframe: z.string(),
  growthRate: z.number(),
  milestones: z.array(z.object({
    month: z.number(),
    title: z.string(),
    impact: z.string(),
  })).length(4),
  recommendedCourses: z.array(z.string()),
})

export type LifePlannerResult = z.infer<typeof lifePlannerSchema>

const skillSalaryMap: Record<string, { multiplier: number; months: string; courses: string[] }> = {
  "ai": { multiplier: 2.2, months: "30 Months", courses: ["DeepLearning.AI — AI for Everyone", "Fast.ai — Practical Deep Learning", "Coursera — Machine Learning Specialization", "Google — Generative AI Learning Path"] },
  "cloud": { multiplier: 1.8, months: "18 Months", courses: ["AWS Cloud Practitioner (Free tier)", "Google Cloud Digital Leader", "Microsoft Azure Fundamentals AZ-900", "A Cloud Guru free courses"] },
  "data": { multiplier: 1.9, months: "24 Months", courses: ["Google Data Analytics Certificate", "IBM Data Science Professional (Coursera)", "Kaggle free ML courses", "DataCamp Python for Data Science"] },
  "full stack": { multiplier: 1.7, months: "18 Months", courses: ["The Odin Project (free)", "freeCodeCamp Full Stack", "Next.js official docs + projects", "CS50 Web Programming (free)"] },
  "web": { multiplier: 1.6, months: "12 Months", courses: ["freeCodeCamp Web Development", "The Odin Project HTML/CSS/JS", "Scrimba — React free courses", "JavaScript.info (free)"] },
  "ui ux": { multiplier: 1.5, months: "12 Months", courses: ["Google UX Design Certificate (Coursera)", "Figma free tutorials (YouTube)", "Nielsen Norman Group free articles", "Interaction Design Foundation free tier"] },
  "product": { multiplier: 1.8, months: "18 Months", courses: ["Product School free events", "Coursera — Digital Product Management", "Reforge blog (free)", "Lenny's Newsletter"] },
  "digital marketing": { multiplier: 1.4, months: "9 Months", courses: ["Google Digital Marketing Certificate (free)", "HubSpot Academy (free)", "Meta Blueprint (free)", "SEMrush Academy (free)"] },
}

function localLifePlanner(profile: Partial<UserProfile>, skills: string): LifePlannerResult {
  const income = profile.income ?? 25000
  const skillKey = Object.keys(skillSalaryMap).find((k) => skills.toLowerCase().includes(k)) ?? "cloud"
  const skill = skillSalaryMap[skillKey]

  const projectedSalary = Math.round(income * skill.multiplier)
  const growthRate = Math.round((skill.multiplier - 1) * 100)

  const milestones = [
    { month: 2, title: `Start ${skills.split(" ")[0]} fundamentals`, impact: "Build core vocabulary, get comfortable with the basics" },
    { month: 6, title: "Complete first certification", impact: `Eligible for junior ${skillKey} roles, +20% interview calls` },
    { month: 12, title: "Build 2–3 portfolio projects", impact: "Demonstrate real-world skills to employers and freelance clients" },
    { month: parseInt(skill.months), title: "Land target role", impact: `Reach ₹${projectedSalary.toLocaleString("en-IN")}/month salary — ${growthRate}% growth from today` },
  ]

  return {
    headline: `Learning ${skills} could take your salary from ₹${income.toLocaleString("en-IN")} to ₹${projectedSalary.toLocaleString("en-IN")}/month in ${skill.months}`,
    projectedSalary,
    timeframe: skill.months,
    growthRate,
    milestones,
    recommendedCourses: skill.courses,
  }
}

export async function simulateLifePlanner(profile: Partial<UserProfile>, skills: string): Promise<LifePlannerResult> {
  // Always use rich local life planner simulation
  return localLifePlanner(profile, skills)
}
