"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Receipt,
  Target,
  MessageSquareText,
  Sparkles,
  Wallet,
  Menu,
  X,
  GraduationCap,
  CreditCard,
  FileText,
  TrendingUp,
  Users,
  Trophy,
  Bell,
  BookOpen,
  RefreshCcw,
  PiggyBank,
  Share2,
  ShieldAlert,
} from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

const navGroups = [
  {
    label: "Main",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/expenses", label: "Expenses", icon: Receipt },
      { href: "/goals", label: "Savings Goals", icon: Target },
    ],
  },
  {
    label: "Finance",
    items: [
      { href: "/subscriptions", label: "Subscriptions", icon: RefreshCcw },
      { href: "/emis", label: "EMI Manager", icon: CreditCard },
      { href: "/bills", label: "Bill Book", icon: BookOpen },
      { href: "/investments", label: "Investments", icon: TrendingUp },
    ],
  },
  {
    label: "AI Tools",
    items: [
      { href: "/coach", label: "AI Coach", icon: MessageSquareText },
      { href: "/twin", label: "Financial Twin", icon: Sparkles },
      { href: "/life-planner", label: "Life Planner", icon: GraduationCap },
      { href: "/pocket-money", label: "Pocket Money", icon: PiggyBank },
    ],
  },
  {
    label: "More",
    items: [
      { href: "/family", label: "Family Finance", icon: Users },
      { href: "/achievements", label: "Achievements", icon: Trophy },
      { href: "/reports", label: "Reports", icon: FileText },
      { href: "/social", label: "Social Finance", icon: Share2 },
      { href: "/alerts", label: "Alerts & Fraud", icon: Bell },
      { href: "/fraud", label: "Fraud Detection", icon: ShieldAlert },
    ],
  },
]

const allNavItems = navGroups.flatMap((g) => g.items)

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <nav className="flex flex-col gap-4 overflow-y-auto">
      {navGroups.map((group) => (
        <div key={group.label}>
          <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
            {group.label}
          </p>
          <div className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const active = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </nav>
  )
}

function Brand() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5 px-1">
      <span className="flex size-9 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
        <Wallet className="size-5" />
      </span>
      <div className="leading-tight">
        <p className="text-sm font-semibold text-sidebar-foreground">SmartBudget</p>
        <p className="text-xs text-sidebar-foreground/60">AI Financial OS</p>
      </div>
    </Link>
  )
}

export function AppSidebar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-sidebar-border bg-sidebar px-4 py-3 md:hidden">
        <Brand />
        <button
          aria-label="Toggle navigation"
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg p-2 text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-20 overflow-y-auto bg-sidebar/95 px-4 pt-20 md:hidden">
          <NavLinks onNavigate={() => setOpen(false)} />
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col gap-5 border-r border-sidebar-border bg-sidebar p-4 md:flex">
        <div className="pt-2">
          <Brand />
        </div>
        <NavLinks />
        <div className="mt-auto rounded-xl bg-sidebar-accent p-3.5">
          <p className="text-xs font-semibold text-sidebar-accent-foreground">
            22 AI Modules Active
          </p>
          <p className="mt-0.5 text-[11px] text-sidebar-foreground/60">
            SmartBudget AI — Financial Operating System
          </p>
        </div>
      </aside>
    </>
  )
}

export { allNavItems }
