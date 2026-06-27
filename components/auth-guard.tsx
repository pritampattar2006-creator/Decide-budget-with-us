"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useStore } from "@/lib/store"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitialising, profile } = useStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isInitialising) return // wait until localStorage has been read
    if (!isAuthenticated) {
      router.push("/login")
    } else if (!profile.onboarded && pathname !== "/onboarding") {
      router.push("/onboarding")
    }
  }, [isInitialising, isAuthenticated, profile.onboarded, router, pathname])

  // Show nothing while checking session
  if (isInitialising) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm">Restoring your session…</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null
  if (isAuthenticated && !profile.onboarded && pathname !== "/onboarding") return null

  return <>{children}</>
}
