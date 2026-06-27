"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Wallet, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react"
import { useStore } from "@/lib/store"

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "At least 8 characters", pass: password.length >= 8 },
    { label: "Contains a number", pass: /\d/.test(password) },
    { label: "Contains a letter", pass: /[a-zA-Z]/.test(password) },
  ]
  if (!password) return null
  return (
    <div className="space-y-1 text-left">
      {checks.map((c) => (
        <div key={c.label} className="flex items-center gap-1.5">
          {c.pass ? (
            <CheckCircle2 className="size-3 text-green-500 shrink-0" />
          ) : (
            <XCircle className="size-3 text-muted-foreground shrink-0" />
          )}
          <span className={`text-[11px] ${c.pass ? "text-green-600" : "text-muted-foreground"}`}>
            {c.label}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function SignUpPage() {
  const router = useRouter()
  const { signup, isAuthenticated, isInitialising, authError, clearAuthError } = useStore()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fieldError, setFieldError] = useState("")
  const [step, setStep] = useState<1 | 2>(1) // step 1: email+name; step 2: username+password

  useEffect(() => {
    if (!isInitialising && isAuthenticated) {
      router.replace("/onboarding")
    }
  }, [isInitialising, isAuthenticated, router])

  useEffect(() => {
    if (authError) setFieldError(authError)
  }, [authError])

  function validateStep1() {
    if (!name.trim()) return "Enter your full name."
    if (!email.trim()) return "Enter your email address."
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address."
    return ""
  }

  function validateStep2() {
    if (!username.trim()) return "Choose a username."
    if (username.length < 3) return "Username must be at least 3 characters."
    if (!/^[a-zA-Z0-9._]+$/.test(username)) return "Only letters, numbers, dots and underscores."
    if (!password) return "Choose a password."
    if (password.length < 6) return "Password must be at least 6 characters."
    return ""
  }

  function handleNext(e: React.FormEvent) {
    e.preventDefault()
    const err = validateStep1()
    if (err) { setFieldError(err); return }
    setFieldError("")
    setStep(2)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const err = validateStep2()
    if (err) { setFieldError(err); return }
    setFieldError("")
    clearAuthError()

    setLoading(true)
    const ok = await signup(name.trim(), username.trim(), email.trim(), password)
    setLoading(false)
    if (ok) router.push("/onboarding")
  }

  if (isInitialising) return null

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-[350px] space-y-3">

        {/* Card */}
        <div className="rounded-none border border-border bg-card px-10 py-10 text-center space-y-4 sm:rounded-sm">

          {/* Logo */}
          <div className="flex justify-center mb-2">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
              <Wallet className="size-7" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">SmartBudget</h1>

          <p className="text-sm font-semibold text-muted-foreground leading-snug">
            Sign up to see your finances, track expenses and reach your goals.
          </p>

          {/* Step indicator */}
          <div className="flex items-center gap-1 justify-center py-1">
            <div className={`h-1.5 w-12 rounded-full transition-colors ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
            <div className={`h-1.5 w-12 rounded-full transition-colors ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
          </div>

          {/* ── Step 1: Name + Email ── */}
          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-2 text-left">
              <input
                type="text"
                placeholder="Full Name"
                autoComplete="name"
                value={name}
                onChange={(e) => { setName(e.target.value); setFieldError("") }}
                className={`w-full rounded-sm border bg-muted/50 px-3 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all ${fieldError ? "border-destructive" : "border-border"}`}
              />
              <input
                type="email"
                placeholder="Email address"
                autoComplete="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFieldError("") }}
                className={`w-full rounded-sm border bg-muted/50 px-3 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all ${fieldError ? "border-destructive" : "border-border"}`}
              />
              {fieldError && (
                <p className="text-xs text-destructive pt-1">{fieldError}</p>
              )}
              <button
                type="submit"
                disabled={!name || !email}
                className="mt-1 w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </form>
          )}

          {/* ── Step 2: Username + Password ── */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-2 text-left">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground select-none">@</span>
                <input
                  type="text"
                  placeholder="Username"
                  autoComplete="username"
                  autoCapitalize="none"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, "")); setFieldError("") }}
                  className={`w-full rounded-sm border bg-muted/50 pl-7 pr-3 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all ${fieldError ? "border-destructive" : "border-border"}`}
                />
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldError("") }}
                  className={`w-full rounded-sm border bg-muted/50 px-3 py-2.5 pr-12 text-sm placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all ${fieldError ? "border-destructive" : "border-border"}`}
                />
                {password && (
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                )}
              </div>

              <PasswordStrength password={password} />

              {fieldError && (
                <p className="text-xs text-destructive pt-1">{fieldError}</p>
              )}

              <p className="text-[11px] text-muted-foreground leading-snug pt-1">
                By signing up, you agree to our{" "}
                <span className="text-foreground cursor-pointer hover:underline">Terms</span>,{" "}
                <span className="text-foreground cursor-pointer hover:underline">Privacy Policy</span> and{" "}
                <span className="text-foreground cursor-pointer hover:underline">Cookies Policy</span>.
              </p>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setStep(1); setFieldError("") }}
                  className="flex-1 rounded-lg border border-border py-2.5 text-sm font-semibold text-foreground hover:bg-accent transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || !username || !password}
                  className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      Creating…
                    </>
                  ) : "Sign up"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Log in link */}
        <div className="rounded-none border border-border bg-card px-10 py-5 text-center text-sm sm:rounded-sm">
          Have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
            Log in
          </Link>
        </div>

      </div>
    </div>
  )
}
