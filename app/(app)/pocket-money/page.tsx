"use client"

import { useState } from "react"
import {
  PiggyBank, Sparkles, Loader2, CalendarDays, Wallet, BookOpen,
  TrendingUp, Target, BarChart3, Lightbulb, Plus, Minus,
  GraduationCap, UtensilsCrossed, Bus, Home, Coffee
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { PageHeader } from "@/components/page-header"
import { formatINR } from "@/lib/finance"

interface PocketPlan {
  dailyLimit: number
  weeklyLimit: number
  monthlyLimit: number
  suggestedSavings: number
  essentials: number
  discretionary: number
  tips: string[]
  categories: { name: string; icon: string; amount: number; color: string }[]
}

function computePocketPlan(fields: {
  pocketMoney: number
  hostelFees: number
  messFees: number
  travelCosts: number
  collegeFees: number
}): PocketPlan {
  const total = fields.pocketMoney
  const fixedCosts = fields.hostelFees + fields.messFees + fields.travelCosts + (fields.collegeFees / 12)
  const disposable = Math.max(0, total - fixedCosts)
  const savings = Math.round(disposable * 0.25)
  const spendable = disposable - savings
  const snacks = Math.round(spendable * 0.25)
  const entertainment = Math.round(spendable * 0.20)
  const stationery = Math.round(spendable * 0.10)
  const misc = spendable - snacks - entertainment - stationery

  return {
    dailyLimit: Math.round(spendable / 30),
    weeklyLimit: Math.round(spendable / 4),
    monthlyLimit: spendable,
    suggestedSavings: savings,
    essentials: fixedCosts,
    discretionary: spendable,
    tips: [
      `Keep a daily cash limit of ${formatINR(Math.round(spendable / 30))} for food & misc.`,
      `Cook at home or use mess more to save ₹${Math.round(fields.messFees * 0.2)}/month.`,
      "Use UPI for all transactions — tracking becomes automatic.",
      `Your ₹${savings} monthly saving grows to ₹${(savings * 12 * 1.08).toFixed(0)} in a year with a savings account.`,
      `Use student discounts on Spotify (₹59/mo) and Amazon Prime (₹179/yr).`,
    ],
    categories: [
      { name: "Snacks & Food", icon: "☕", amount: snacks, color: "bg-orange-500" },
      { name: "Entertainment", icon: "🎬", amount: entertainment, color: "bg-purple-500" },
      { name: "Stationery", icon: "📚", amount: stationery, color: "bg-blue-500" },
      { name: "Miscellaneous", icon: "🎯", amount: misc, color: "bg-green-500" },
    ],
  }
}

const budgetTemplates = [
  { label: "Hostel Student", pocketMoney: "8000", hostelFees: "3000", messFees: "2500", travelCosts: "500", collegeFees: "50000" },
  { label: "Day Scholar", pocketMoney: "5000", hostelFees: "0", messFees: "1000", travelCosts: "1500", collegeFees: "80000" },
  { label: "Metro City", pocketMoney: "12000", hostelFees: "5000", messFees: "3000", travelCosts: "1000", collegeFees: "100000" },
]

export default function PocketMoneyPage() {
  const [form, setForm] = useState({ pocketMoney: "5000", hostelFees: "0", messFees: "2000", travelCosts: "500", collegeFees: "0" })
  const [plan, setPlan] = useState<PocketPlan | null>(null)
  const [loading, setLoading] = useState(false)
  const [trackerItems, setTrackerItems] = useState<{ id: string; label: string; amount: number }[]>([])
  const [newItem, setNewItem] = useState({ label: "", amount: "" })

  function update(key: string, val: string) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  function applyTemplate(t: typeof budgetTemplates[0]) {
    setForm({ pocketMoney: t.pocketMoney, hostelFees: t.hostelFees, messFees: t.messFees, travelCosts: t.travelCosts, collegeFees: t.collegeFees })
    setPlan(null)
  }

  function generate() {
    setLoading(true)
    setTimeout(() => {
      const nums = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, Number(v) || 0])) as Parameters<typeof computePocketPlan>[0]
      setPlan(computePocketPlan(nums))
      setLoading(false)
    }, 800)
  }

  function addTrackerItem() {
    if (!newItem.label || !newItem.amount) return
    setTrackerItems((p) => [...p, { id: Date.now().toString(), label: newItem.label, amount: Number(newItem.amount) }])
    setNewItem({ label: "", amount: "" })
  }

  const trackerTotal = trackerItems.reduce((s, i) => s + i.amount, 0)
  const trackerRemaining = plan ? plan.monthlyLimit - trackerTotal : 0

  const fields = [
    { key: "pocketMoney", label: "Monthly Pocket Money", placeholder: "5000", icon: Wallet },
    { key: "hostelFees", label: "Hostel Fees (monthly)", placeholder: "0", icon: Home },
    { key: "messFees", label: "Mess / Food Fees", placeholder: "2000", icon: UtensilsCrossed },
    { key: "travelCosts", label: "Travel Costs / month", placeholder: "500", icon: Bus },
    { key: "collegeFees", label: "College Fees (annual)", placeholder: "0", icon: GraduationCap },
  ]

  return (
    <div className="space-y-6 p-5 md:p-8">
      <PageHeader
        title="Student Pocket Money Planner"
        description="Enter your monthly pocket money and fixed costs. AI calculates your daily, weekly, and monthly spending limits with a savings forecast."
      />

      {/* Quick Templates */}
      <div className="flex flex-wrap gap-2">
        <p className="text-sm font-medium text-muted-foreground self-center">Quick fill:</p>
        {budgetTemplates.map((t) => (
          <Button key={t.label} variant="outline" size="sm" onClick={() => applyTemplate(t)}>
            {t.label}
          </Button>
        ))}
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="size-5 text-primary" /> Your Monthly Budget Inputs
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {fields.map((f) => {
            const Icon = f.icon
            return (
              <div key={f.key} className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1.5">
                  <Icon className="size-3" /> {f.label} (₹)
                </Label>
                <Input
                  type="number"
                  placeholder={f.placeholder}
                  value={form[f.key as keyof typeof form]}
                  onChange={(e) => update(f.key, e.target.value)}
                />
              </div>
            )
          })}
          <div className="sm:col-span-2">
            <Button onClick={generate} disabled={loading} className="w-full sm:w-auto">
              {loading ? (
                <><Loader2 className="size-4 animate-spin" /> Calculating…</>
              ) : (
                <><Sparkles className="size-4" /> Generate My Plan</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {plan && (
        <div className="space-y-4">
          {/* Stat Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <CalendarDays className="size-4" /> Daily Limit
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-primary">{formatINR(plan.dailyLimit)}</p>
                <p className="mt-1 text-xs text-muted-foreground">Spend no more than this/day</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">Weekly Limit</p>
                <p className="mt-1 text-2xl font-bold tabular-nums">{formatINR(plan.weeklyLimit)}</p>
                <p className="mt-1 text-xs text-muted-foreground">Reset every Monday</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">Monthly Spendable</p>
                <p className="mt-1 text-2xl font-bold tabular-nums">{formatINR(plan.monthlyLimit)}</p>
                <p className="mt-1 text-xs text-muted-foreground">After essentials & savings</p>
              </CardContent>
            </Card>
            <Card className="border-green-500/30 bg-green-50/50 dark:bg-green-500/5">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <PiggyBank className="size-4 text-green-600" /> Save / Month
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-green-600">{formatINR(plan.suggestedSavings)}</p>
                <p className="mt-1 text-xs text-muted-foreground">25% of disposable income</p>
              </CardContent>
            </Card>
          </div>

          {/* Budget Allocation Visual */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="size-5 text-primary" /> Budget Allocation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-3 flex h-5 w-full overflow-hidden rounded-full">
                <div
                  className="bg-destructive/70 flex items-center justify-center text-[10px] text-white font-medium"
                  style={{ width: `${(plan.essentials / Number(form.pocketMoney)) * 100}%` }}
                  title={`Essentials: ${formatINR(plan.essentials)}`}
                >
                  {Math.round((plan.essentials / Number(form.pocketMoney)) * 100) > 15 && "Essentials"}
                </div>
                <div
                  className="bg-primary/60 flex items-center justify-center text-[10px] text-white font-medium"
                  style={{ width: `${(plan.monthlyLimit / Number(form.pocketMoney)) * 100}%` }}
                  title={`Spendable: ${formatINR(plan.monthlyLimit)}`}
                >
                  {Math.round((plan.monthlyLimit / Number(form.pocketMoney)) * 100) > 10 && "Spend"}
                </div>
                <div
                  className="bg-green-500/70 flex items-center justify-center text-[10px] text-white font-medium"
                  style={{ width: `${(plan.suggestedSavings / Number(form.pocketMoney)) * 100}%` }}
                  title={`Savings: ${formatINR(plan.suggestedSavings)}`}
                >
                  {Math.round((plan.suggestedSavings / Number(form.pocketMoney)) * 100) > 8 && "Save"}
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-4 mt-4">
                {plan.categories.map((cat) => (
                  <div key={cat.name} className="rounded-xl border border-border p-3 text-center">
                    <p className="text-xl">{cat.icon}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{cat.name}</p>
                    <p className="mt-0.5 font-semibold tabular-nums text-sm">{formatINR(cat.amount)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Daily Expense Tracker */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="size-5 text-primary" /> Daily Expense Tracker
                <Badge variant={trackerRemaining >= 0 ? "secondary" : "destructive"} className="ml-auto">
                  {trackerRemaining >= 0 ? `${formatINR(trackerRemaining)} left` : `${formatINR(-trackerRemaining)} over!`}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={Math.min(100, (trackerTotal / plan.monthlyLimit) * 100)} className="h-3" />
              <div className="text-xs text-muted-foreground text-right">
                {formatINR(trackerTotal)} of {formatINR(plan.monthlyLimit)} used
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Lunch at canteen"
                  value={newItem.label}
                  onChange={(e) => setNewItem((p) => ({ ...p, label: e.target.value }))}
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="₹ Amount"
                  value={newItem.amount}
                  onChange={(e) => setNewItem((p) => ({ ...p, amount: e.target.value }))}
                  className="w-28"
                />
                <Button size="sm" onClick={addTrackerItem}><Plus className="size-4" /></Button>
              </div>
              {trackerItems.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {trackerItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                      <p className="text-sm">{item.label}</p>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm tabular-nums">{formatINR(item.amount)}</p>
                        <button
                          onClick={() => setTrackerItems((p) => p.filter((i) => i.id !== item.id))}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Minus className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="size-5 text-primary" /> AI Tips for Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2.5">
                {plan.tips.map((tip, i) => (
                  <li key={i} className="flex gap-2.5 text-sm">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed text-muted-foreground">{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Savings Forecast */}
          <Card className="border-primary/20 bg-accent/30">
            <CardContent className="p-5">
              <p className="font-semibold flex items-center gap-2">
                <TrendingUp className="size-5 text-primary" /> Savings Forecast
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Saving {formatINR(plan.suggestedSavings)}/month consistently:
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 text-center">
                {[
                  { label: "6 Months", value: plan.suggestedSavings * 6 },
                  { label: "1 Year", value: plan.suggestedSavings * 12 },
                  { label: "2 Years (8%)", value: Math.round(plan.suggestedSavings * 24 * 1.08) },
                  { label: "4 Years (8%)", value: Math.round(plan.suggestedSavings * 48 * 1.08) },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg border border-border bg-card p-3">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="mt-1 font-bold tabular-nums text-primary">{formatINR(item.value)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
