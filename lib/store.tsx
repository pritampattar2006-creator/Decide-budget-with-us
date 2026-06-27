"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import type { Expense, Goal, UserProfile } from "./types"
import { seedExpenses, seedGoals } from "./mock-data"
import {
  loginWithCredentials,
  register,
  restoreSession,
  clearSession,
  saveUserData,
  getUserData,
  type Session,
} from "./auth"

// ── Store types ───────────────────────────────────────────────────────────────
interface StoreValue {
  // Auth
  isAuthenticated: boolean
  isInitialising: boolean        // true while we're reading localStorage on mount
  session: Session | null
  authError: string | null

  // User data
  profile: UserProfile
  expenses: Expense[]
  goals: Goal[]

  // Auth actions
  login: (identifier: string, password: string) => Promise<boolean>
  signup: (name: string, username: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  clearAuthError: () => void

  // Data actions
  setProfile: (p: UserProfile) => void
  completeOnboarding: (p: Partial<UserProfile>) => void
  addExpense: (e: Omit<Expense, "id">) => void
  deleteExpense: (id: string) => void
  addGoal: (g: Omit<Goal, "id">) => void
  contributeToGoal: (id: string, amount: number) => void
}

const StoreContext = createContext<StoreValue | null>(null)

// ── Empty / loading state defaults ────────────────────────────────────────────
const EMPTY_PROFILE: UserProfile = {
  name: "",
  email: "",
  persona: "Professional",
  income: 0,
  occupation: "",
  age: 0,
  maritalStatus: "Single",
  familyMembers: 1,
  loans: 0,
  savings: 0,
  investments: 0,
  goals: [],
  onboarded: false,
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function StoreProvider({ children }: { children: ReactNode }) {
  const [isInitialising, setIsInitialising] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)

  const [profile, setProfileState] = useState<UserProfile>(EMPTY_PROFILE)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [goals, setGoals] = useState<Goal[]>([])

  // ── Restore session on mount ────────────────────────────────────────────────
  useEffect(() => {
    const restored = restoreSession()
    if (restored) {
      setSession(restored.session)
      setProfileState(restored.data.profile)
      setExpenses(restored.data.expenses)
      setGoals(restored.data.goals)
      setIsAuthenticated(true)
    }
    setIsInitialising(false)
  }, [])

  // ── Persist user data whenever it changes ───────────────────────────────────
  useEffect(() => {
    if (isAuthenticated && session) {
      saveUserData(session.userId, { profile, expenses, goals })
    }
  }, [isAuthenticated, session, profile, expenses, goals])

  // ── Auth actions ────────────────────────────────────────────────────────────
  const login = useCallback(
    async (identifier: string, password: string): Promise<boolean> => {
      setAuthError(null)
      // Small artificial delay so it feels like a real network call
      await new Promise((r) => setTimeout(r, 700))
      const result = loginWithCredentials(identifier, password)
      if ("error" in result) {
        setAuthError(result.error)
        return false
      }
      setSession(result.session)
      setProfileState(result.data.profile)
      setExpenses(result.data.expenses)
      setGoals(result.data.goals)
      setIsAuthenticated(true)
      return true
    },
    [],
  )

  const signup = useCallback(
    async (
      name: string,
      username: string,
      email: string,
      password: string,
    ): Promise<boolean> => {
      setAuthError(null)
      await new Promise((r) => setTimeout(r, 700))
      const result = register(name, username, email, password)
      if ("error" in result) {
        setAuthError(result.error)
        return false
      }
      const data = getUserData(result.user.id)
      setSession(result.session)
      setProfileState(data.profile)
      setExpenses(data.expenses)
      setGoals(data.goals)
      setIsAuthenticated(true)
      return true
    },
    [],
  )

  const logout = useCallback(() => {
    clearSession()
    setIsAuthenticated(false)
    setSession(null)
    setProfileState(EMPTY_PROFILE)
    setExpenses([])
    setGoals([])
    setAuthError(null)
  }, [])

  const clearAuthError = useCallback(() => setAuthError(null), [])

  // ── Data actions ────────────────────────────────────────────────────────────
  const setProfile = useCallback((p: UserProfile) => setProfileState(p), [])

  const completeOnboarding = useCallback((p: Partial<UserProfile>) => {
    setProfileState((prev) => ({ ...prev, ...p, onboarded: true }))
  }, [])

  const addExpense = useCallback((e: Omit<Expense, "id">) => {
    setExpenses((prev) => [{ ...e, id: crypto.randomUUID() }, ...prev])
  }, [])

  const deleteExpense = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const addGoal = useCallback((g: Omit<Goal, "id">) => {
    setGoals((prev) => [...prev, { ...g, id: crypto.randomUUID() }])
  }, [])

  const contributeToGoal = useCallback((id: string, amount: number) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, saved: g.saved + amount } : g)),
    )
  }, [])

  // ── Value ───────────────────────────────────────────────────────────────────
  const value: StoreValue = {
    isAuthenticated,
    isInitialising,
    session,
    authError,
    profile,
    expenses,
    goals,
    login,
    signup,
    logout,
    clearAuthError,
    setProfile,
    completeOnboarding,
    addExpense,
    deleteExpense,
    addGoal,
    contributeToGoal,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used within StoreProvider")
  return ctx
}
