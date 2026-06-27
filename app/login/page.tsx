"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Wallet, Eye, EyeOff } from "lucide-react"
import { useStore } from "@/lib/store"

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated, isInitialising, profile, authError, clearAuthError } = useStore()

  const [identifier, setIdentifier] = useState("") // email or username
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fieldError, setFieldError] = useState("")

  // Already logged in → redirect
  useEffect(() => {
    if (!isInitialising && isAuthenticated) {
      router.replace(profile.onboarded ? "/dashboard" : "/onboarding")
    }
  }, [isInitialising, isAuthenticated, profile.onboarded, router])

  // Surface store-level auth errors
  useEffect(() => {
    if (authError) setFieldError(authError)
  }, [authError])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFieldError("")
    clearAuthError()

    if (!identifier.trim()) { setFieldError("Enter your email or username."); return }
    if (!password) { setFieldError("Enter your password."); return }

    setLoading(true)
    const ok = await login(identifier.trim(), password)
    setLoading(false)

    if (ok) {
      // router.push happens inside AuthGuard / useEffect above
      router.push("/dashboard")
    }
  }

  if (isInitialising) return null // don't flash login when session restores

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-[350px] space-y-3">

        {/* Card */}
        <div className="rounded-none border border-border bg-card px-10 py-10 text-center space-y-4 sm:rounded-sm">

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
              <Wallet className="size-7" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-6">SmartBudget</h1>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-2">
            <input
              type="text"
              placeholder="Phone number, username, or email"
              autoComplete="username"
              autoCapitalize="none"
              value={identifier}
              onChange={(e) => { setIdentifier(e.target.value); setFieldError("") }}
              className={`w-full rounded-sm border bg-muted/50 px-3 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all ${fieldError ? "border-destructive" : "border-border"}`}
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setFieldError("") }}
                className={`w-full rounded-sm border bg-muted/50 px-3 py-2.5 pr-12 text-sm placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all ${fieldError ? "border-destructive" : "border-border"}`}
              />
              {password && (
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-foreground hover:text-foreground/70"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              )}
            </div>

            {fieldError && (
              <p className="text-xs text-destructive text-center pt-1">{fieldError}</p>
            )}

            <button
              type="submit"
              disabled={loading || !identifier || !password}
              className="mt-2 w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Logging in…
                </>
              ) : "Log in"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 py-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Forgot password */}
          <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Forgot password?
          </button>
        </div>

        {/* Sign up link */}
        <div className="rounded-none border border-border bg-card px-10 py-5 text-center text-sm sm:rounded-sm">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-primary hover:text-primary/80 transition-colors">
            Sign up
          </Link>
        </div>

        {/* App store links (decorative, like Instagram) */}
        <div className="text-center space-y-3 pt-2">
          <p className="text-xs text-muted-foreground">Get the app.</p>
          <div className="flex items-center justify-center gap-2">
            <div className="rounded border border-border bg-card px-3 py-1.5 text-[11px] font-medium text-muted-foreground cursor-pointer hover:bg-accent transition-colors">
              App Store
            </div>
            <div className="rounded border border-border bg-card px-3 py-1.5 text-[11px] font-medium text-muted-foreground cursor-pointer hover:bg-accent transition-colors">
              Google Play
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
