import type { ReactNode } from "react"
import { StoreProvider } from "@/lib/store"
import { AppSidebar } from "@/components/app-sidebar"

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <div className="flex min-h-dvh flex-col md:flex-row">
        <AppSidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </StoreProvider>
  )
}
