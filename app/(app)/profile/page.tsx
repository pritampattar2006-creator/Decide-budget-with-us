"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  User,
  Shield,
  LogOut,
  ChevronRight,
  Bell,
  Palette,
  HelpCircle,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  KeyRound,
  Edit3,
  Camera,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/page-header"
import { useStore } from "@/lib/store"

// ── Extracted component so useState isn't called inside .map() ───────────────
function NotificationRow({
  label,
  desc,
  defaultOn,
}: {
  label: string
  desc: string
  defaultOn: boolean
}) {
  const [on, setOn] = useState(defaultOn)
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <button
        onClick={() => setOn((v) => !v)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
          on ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow transition-transform ${
            on ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
const sections = [
  { id: "account", label: "Account", icon: User },
  { id: "security", label: "Security", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "help", label: "Help & Support", icon: HelpCircle },
]

const notificationItems = [
  { label: "Budget Alerts", desc: "Get notified when you exceed category limits", defaultOn: true },
  { label: "Goal Milestones", desc: "Celebrate when you hit a savings milestone", defaultOn: true },
  { label: "Bill Reminders", desc: "Reminders before your bills are due", defaultOn: true },
  { label: "Weekly Summary", desc: "A weekly digest of your financial activity", defaultOn: false },
  { label: "AI Coach Tips", desc: "Personalized tips from your AI financial coach", defaultOn: true },
  { label: "Fraud Alerts", desc: "Instant alerts for suspicious transactions", defaultOn: true },
]

export default function ProfilePage() {
  const router = useRouter()
  const { profile, setProfile, logout } = useStore()
  const [activeSection, setActiveSection] = useState("account")

  // Account edit state
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(profile.name)
  const [editEmail, setEditEmail] = useState(profile.email ?? "")
  const [editOccupation, setEditOccupation] = useState(profile.occupation)

  // Security state
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [twoFA, setTwoFA] = useState(false)

  function saveAccount() {
    setProfile({ ...profile, name: editName, email: editEmail, occupation: editOccupation })
    setEditing(false)
  }

  function handleLogout() {
    logout()
    router.push("/login")
  }

  const initials = profile.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="mx-auto max-w-5xl p-5 md:p-8 space-y-6">
      <PageHeader
        title="Profile & Settings"
        description="Manage your account, security and preferences."
      />

      <div className="flex gap-6 flex-col md:flex-row">
        {/* ── Left navigation ────────────────────────────── */}
        <nav className="md:w-56 shrink-0 space-y-1">
          {/* Avatar card */}
          <div className="mb-4 rounded-2xl border border-border bg-card p-4 text-center space-y-2">
            <div className="relative inline-block">
              <div className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-xl font-bold mx-auto">
                {initials}
              </div>
              <button className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md border-2 border-background">
                <Camera className="size-3" />
              </button>
            </div>
            <div>
              <p className="font-semibold text-sm">{profile.name}</p>
              <p className="text-xs text-muted-foreground">{profile.email ?? "No email set"}</p>
            </div>
            <Badge variant="secondary" className="text-xs">
              {profile.persona}
            </Badge>
          </div>

          {/* Section nav */}
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors text-left ${
                activeSection === id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </button>
          ))}

          {/* Sign out */}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors mt-2"
          >
            <LogOut className="size-4 shrink-0" />
            Sign Out
          </button>
        </nav>

        {/* ── Right content ──────────────────────────────── */}
        <div className="flex-1 min-w-0">

          {/* ─── ACCOUNT ───────────────────────────────────── */}
          {activeSection === "account" && (
            <div className="space-y-4">
              {/* Personal info */}
              <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-base">Personal Information</h3>
                  <Button
                    size="sm"
                    variant={editing ? "default" : "outline"}
                    onClick={editing ? saveAccount : () => setEditing(true)}
                  >
                    {editing ? (
                      <><CheckCircle2 className="size-4" /> Save</>
                    ) : (
                      <><Edit3 className="size-4" /> Edit</>
                    )}
                  </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    {
                      label: "Full Name",
                      display: profile.name,
                      input: <Input value={editName} onChange={(e) => setEditName(e.target.value)} />,
                    },
                    {
                      label: "Email Address",
                      display: profile.email || <span className="text-muted-foreground italic">Not set</span>,
                      input: <Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />,
                    },
                    {
                      label: "Occupation",
                      display: profile.occupation,
                      input: <Input value={editOccupation} onChange={(e) => setEditOccupation(e.target.value)} />,
                    },
                    { label: "Persona", display: profile.persona, input: null },
                    { label: "Age", display: `${profile.age} years`, input: null },
                    { label: "Marital Status", display: profile.maritalStatus, input: null },
                  ].map(({ label, display, input }) => (
                    <div key={label} className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                        {label}
                      </Label>
                      {editing && input ? input : (
                        <p className="font-medium">{display}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial snapshot */}
              <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <h3 className="font-semibold text-base">Financial Snapshot</h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {[
                    { label: "Monthly Income", value: `₹${profile.income.toLocaleString("en-IN")}` },
                    { label: "Savings", value: `₹${profile.savings.toLocaleString("en-IN")}` },
                    { label: "Investments", value: `₹${profile.investments.toLocaleString("en-IN")}` },
                    { label: "Total Loans", value: `₹${profile.loans.toLocaleString("en-IN")}` },
                    { label: "Family Members", value: String(profile.familyMembers) },
                    { label: "Active Goals", value: String(profile.goals.length) },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-xl bg-muted/50 px-4 py-3">
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{label}</p>
                      <p className="mt-1 font-bold text-sm">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Danger zone */}
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 space-y-3">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="size-4" />
                  <h3 className="font-semibold text-sm">Danger Zone</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Once you delete your account, all your data will be permanently removed.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-destructive/40 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  Delete Account
                </Button>
              </div>
            </div>
          )}

          {/* ─── SECURITY ──────────────────────────────────── */}
          {activeSection === "security" && (
            <div className="space-y-4">
              {/* Change password */}
              <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <KeyRound className="size-5 text-primary" />
                  <h3 className="font-semibold">Change Password</h3>
                </div>
                <div className="space-y-3 max-w-sm">
                  <div className="space-y-1.5">
                    <Label>Current Password</Label>
                    <div className="relative">
                      <Input
                        type={showOld ? "text" : "password"}
                        placeholder="••••••••"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOld((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        {showOld ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>New Password</Label>
                    <div className="relative">
                      <Input
                        type={showNew ? "text" : "password"}
                        placeholder="Min. 8 characters"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>
                  <Button size="sm">Update Password</Button>
                </div>
              </div>

              {/* Two-Factor Authentication */}
              <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="size-5 text-primary" />
                    <div>
                      <h3 className="font-semibold">Two-Factor Authentication</h3>
                      <p className="text-xs text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setTwoFA((v) => !v)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                      twoFA ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow transition-transform ${
                        twoFA ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
                {twoFA && (
                  <div className="rounded-xl bg-primary/5 border border-primary/20 p-3">
                    <p className="text-sm text-muted-foreground">
                      ✅ Two-factor authentication is <strong>enabled</strong>. Your account is protected.
                    </p>
                  </div>
                )}
              </div>

              {/* Active Sessions */}
              <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Lock className="size-5 text-primary" />
                  <h3 className="font-semibold">Active Sessions</h3>
                </div>
                {[
                  {
                    device: "Chrome on Windows",
                    location: "Mumbai, India",
                    time: "Current session",
                    current: true,
                  },
                  {
                    device: "SmartBudget Mobile App",
                    location: "Mumbai, India",
                    time: "2 hours ago",
                    current: false,
                  },
                ].map((s) => (
                  <div
                    key={s.device}
                    className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{s.device}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.location} · {s.time}
                      </p>
                    </div>
                    {s.current ? (
                      <Badge variant="secondary" className="text-xs">
                        Active
                      </Badge>
                    ) : (
                      <button className="text-xs text-destructive hover:underline">Revoke</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── NOTIFICATIONS ─────────────────────────────── */}
          {activeSection === "notifications" && (
            <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
              <h3 className="font-semibold">Notification Preferences</h3>
              {notificationItems.map((item) => (
                <NotificationRow key={item.label} {...item} />
              ))}
            </div>
          )}

          {/* ─── APPEARANCE ────────────────────────────────── */}
          {activeSection === "appearance" && (
            <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
              <h3 className="font-semibold">Appearance</h3>

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Theme</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Light", class: "bg-white border-gray-200 text-gray-900" },
                    { label: "Dark", class: "bg-gray-900 border-gray-700 text-white" },
                    { label: "System", class: "bg-gradient-to-br from-white to-gray-900 border-gray-300 text-gray-600" },
                  ].map((theme) => (
                    <button
                      key={theme.label}
                      className={`rounded-xl border-2 p-4 text-center text-sm font-semibold transition-all hover:scale-105 ${theme.class}`}
                    >
                      {theme.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Language</p>
                <select className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm">
                  <option>English (India)</option>
                  <option>Hindi</option>
                  <option>Tamil</option>
                  <option>Telugu</option>
                </select>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Currency</p>
                <select className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm">
                  <option>₹ Indian Rupee (INR)</option>
                  <option>$ US Dollar (USD)</option>
                  <option>€ Euro (EUR)</option>
                </select>
              </div>
            </div>
          )}

          {/* ─── HELP ──────────────────────────────────────── */}
          {activeSection === "help" && (
            <div className="space-y-3">
              {[
                { label: "Getting Started Guide", desc: "Learn how to use SmartBudget AI" },
                { label: "FAQ", desc: "Answers to common questions" },
                { label: "Contact Support", desc: "Get help from our team" },
                { label: "Privacy Policy", desc: "How we use and protect your data" },
                { label: "Terms of Service", desc: "Our usage terms and conditions" },
              ].map((item) => (
                <button
                  key={item.label}
                  className="flex w-full items-center justify-between rounded-2xl border border-border bg-card px-5 py-4 hover:bg-accent transition-colors"
                >
                  <div className="text-left">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
