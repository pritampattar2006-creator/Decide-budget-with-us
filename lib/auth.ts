// ─── Auth Service ─────────────────────────────────────────────────────────────
// Stores users and sessions in localStorage, simulating a real auth backend.
// Passwords are stored as-is (no backend). For a production app, use a real
// auth provider (Clerk, Supabase, Firebase, etc.).

import type { UserProfile } from "./types"
import { defaultProfile, seedExpenses, seedGoals } from "./mock-data"
import type { Expense, Goal } from "./types"

// ── Storage keys ──────────────────────────────────────────────────────────────
const USERS_KEY = "sb_users"
const SESSION_KEY = "sb_session"
const USER_DATA_PREFIX = "sb_data_"

// ── Types ─────────────────────────────────────────────────────────────────────
export interface StoredUser {
  id: string
  name: string
  username: string
  email: string
  password: string // plain text for demo; hash in production
  createdAt: string
}

export interface Session {
  userId: string
  email: string
  name: string
  username: string
  createdAt: string
  lastActive: string
}

export interface UserData {
  profile: UserProfile
  expenses: Expense[]
  goals: Goal[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getUsers(): StoredUser[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]")
  } catch {
    return []
  }
}

function saveUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function getUserData(userId: string): UserData {
  if (typeof window === "undefined") {
    return { profile: defaultProfile, expenses: seedExpenses, goals: seedGoals }
  }
  try {
    const raw = localStorage.getItem(USER_DATA_PREFIX + userId)
    if (raw) return JSON.parse(raw) as UserData
  } catch {}
  return { profile: { ...defaultProfile, onboarded: false }, expenses: [], goals: [] }
}

export function saveUserData(userId: string, data: UserData): void {
  localStorage.setItem(USER_DATA_PREFIX + userId, JSON.stringify(data))
}

// ── Auth operations ───────────────────────────────────────────────────────────

/** Register a new user. Returns the new user or an error string. */
export function register(
  name: string,
  username: string,
  email: string,
  password: string,
): { user: StoredUser; session: Session } | { error: string } {
  const users = getUsers()

  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return { error: "An account with this email already exists." }
  }
  if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
    return { error: "That username is already taken." }
  }

  const newUser: StoredUser = {
    id: crypto.randomUUID(),
    name,
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    password,
    createdAt: new Date().toISOString(),
  }

  users.push(newUser)
  saveUsers(users)

  // Initialise blank user data
  saveUserData(newUser.id, {
    profile: { ...defaultProfile, name, email: email.toLowerCase(), onboarded: false },
    expenses: [],
    goals: [],
  })

  const session = createSession(newUser)
  return { user: newUser, session }
}

/** Login with email-or-username + password. Returns session or error string. */
export function loginWithCredentials(
  identifier: string, // email or username
  password: string,
): { user: StoredUser; session: Session; data: UserData } | { error: string } {
  const users = getUsers()
  const user = users.find(
    (u) =>
      (u.email.toLowerCase() === identifier.toLowerCase() ||
        u.username.toLowerCase() === identifier.toLowerCase()) &&
      u.password === password,
  )

  if (!user) {
    return { error: "Incorrect username/email or password." }
  }

  const session = createSession(user)
  const data = getUserData(user.id)
  return { user, session, data }
}

function createSession(user: StoredUser): Session {
  const session: Session = {
    userId: user.id,
    email: user.email,
    name: user.name,
    username: user.username,
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

/** Restore session from localStorage. Returns session + user data if valid. */
export function restoreSession(): {
  session: Session
  user: StoredUser
  data: UserData
} | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const session: Session = JSON.parse(raw)

    const users = getUsers()
    const user = users.find((u) => u.id === session.userId)
    if (!user) {
      clearSession()
      return null
    }

    // Update lastActive
    session.lastActive = new Date().toISOString()
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))

    const data = getUserData(session.userId)
    return { session, user, data }
  } catch {
    clearSession()
    return null
  }
}

/** Clear session (logout). */
export function clearSession(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SESSION_KEY)
  }
}

export { getUserData }
