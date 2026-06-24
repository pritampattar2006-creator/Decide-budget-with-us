"use client"

import { createContext, useContext, useMemo, useState, type ReactNode } from "react"
import type { Expense, Goal, UserProfile } from "./types"
import { defaultProfile, seedExpenses, seedGoals } from "./mock-data"

interface StoreValue {
  profile: UserProfile
  expenses: Expense[]
  goals: Goal[]
  setProfile: (p: UserProfile) => void
  completeOnboarding: (p: Partial<UserProfile>) => void
  addExpense: (e: Omit<Expense, "id">) => void
  deleteExpense: (id: string) => void
  addGoal: (g: Omit<Goal, "id">) => void
  contributeToGoal: (id: string, amount: number) => void
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile)
  const [expenses, setExpenses] = useState<Expense[]>(seedExpenses)
  const [goals, setGoals] = useState<Goal[]>(seedGoals)

  const value = useMemo<StoreValue>(
    () => ({
      profile,
      expenses,
      goals,
      setProfile,
      completeOnboarding: (p) =>
        setProfile((prev) => ({ ...prev, ...p, onboarded: true })),
      addExpense: (e) =>
        setExpenses((prev) => [{ ...e, id: crypto.randomUUID() }, ...prev]),
      deleteExpense: (id) => setExpenses((prev) => prev.filter((e) => e.id !== id)),
      addGoal: (g) => setGoals((prev) => [...prev, { ...g, id: crypto.randomUUID() }]),
      contributeToGoal: (id, amount) =>
        setGoals((prev) =>
          prev.map((g) => (g.id === id ? { ...g, saved: g.saved + amount } : g)),
        ),
    }),
    [profile, expenses, goals],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used within StoreProvider")
  return ctx
}
