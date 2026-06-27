import type { ReactNode } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { AuthGuard } from "@/components/auth-guard"

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <AppSidebar />
      <main className="min-w-0 flex-1">
        <AuthGuard>{children}</AuthGuard>
      </main>
    </div>
  )
}
