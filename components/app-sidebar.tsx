"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
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
  LogOut,
  Settings,
  User,
  ChevronUp,
} from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useStore } from "@/lib/store"

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

function ProfileWidget() {
  const { profile, session, logout } = useStore()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const initials = profile.name
    ? profile.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?"

  function handleLogout() {
    logout()
    router.push("/login")
  }

  return (
    <div ref={ref} className="relative">
      {/* Dropdown */}
      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-2 rounded-xl border border-sidebar-border bg-sidebar shadow-xl overflow-hidden z-50">
          {/* User info */}
          <div className="px-4 py-3 border-b border-sidebar-border">
            <p className="text-sm font-semibold text-sidebar-foreground">{profile.name}</p>
            <p className="text-xs text-sidebar-foreground/60 truncate">@{session?.username ?? profile.email}</p>
          </div>
          {/* Menu items */}
          <div className="py-1">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <User className="size-4" /> View Profile
            </Link>
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <Settings className="size-4" /> Settings
            </Link>
            <Link
              href="/profile#security"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <ShieldAlert className="size-4" /> Security
            </Link>
          </div>
          <div className="border-t border-sidebar-border py-1">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="size-4" /> Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 rounded-xl bg-sidebar-accent px-3 py-2.5 transition-colors hover:bg-sidebar-accent/80"
      >
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground text-xs font-bold">
          {initials}
        </div>
        <div className="min-w-0 flex-1 text-left">
          <p className="truncate text-xs font-semibold text-sidebar-foreground">{profile.name}</p>
          <p className="truncate text-[11px] text-sidebar-foreground/60">{profile.persona}</p>
        </div>
        <ChevronUp className={cn("size-4 text-sidebar-foreground/40 transition-transform", open && "rotate-180")} />
      </button>
    </div>
  )
}

export function AppSidebar() {
  const [open, setOpen] = useState(false)
  const { profile, isAuthenticated } = useStore()

  if (!isAuthenticated || !profile.onboarded) {
    return null
  }

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
        <div className="flex-1 overflow-y-auto">
          <NavLinks />
        </div>
        <ProfileWidget />
      </aside>
    </>
  )
}

export { allNavItems }
