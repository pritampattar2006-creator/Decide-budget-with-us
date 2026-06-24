export type ExpenseCategory =
  | "Food"
  | "Rent"
  | "Transport"
  | "Shopping"
  | "Bills"
  | "Medical"
  | "Entertainment"
  | "Education"
  | "Investment"
  | "Others"

export interface Expense {
  id: string
  title: string
  amount: number
  category: ExpenseCategory
  date: string // ISO date
  method: "manual" | "voice" | "receipt" | "csv"
}

export interface Goal {
  id: string
  name: string
  target: number
  saved: number
  monthlyContribution: number
  deadline: string // ISO date
}

export interface UserProfile {
  name: string
  persona: "Student" | "Fresher" | "Professional" | "Family" | "Freelancer"
  income: number
  occupation: string
  age: number
  maritalStatus: "Single" | "Married"
  familyMembers: number
  loans: number
  savings: number
  investments: number
  goals: string[]
  onboarded: boolean
}

export interface AllocationItem {
  label: string
  amount: number
  color: string
}
