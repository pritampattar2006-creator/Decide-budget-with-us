"use client"

import { useState } from "react"
import {
  BookOpen, CheckCircle2, Clock, AlertTriangle, Plus,
  BarChart3, Bell, Filter, Search, Calendar, Repeat,
  TrendingUp, Sparkles, X
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { PageHeader } from "@/components/page-header"
import { formatINR } from "@/lib/finance"
import { bills as seedBills } from "@/lib/mock-data"

const categoryColors: Record<string, string> = {
  Utility: "bg-blue-500",
  Housing: "bg-purple-500",
  Telecom: "bg-green-500",
  Transport: "bg-orange-500",
}

const categoryIcons: Record<string, string> = {
  Utility: "⚡",
  Housing: "🏠",
  Telecom: "📱",
  Transport: "🚌",
}

const upcomingBillsInsight = [
  { category: "Utility", total: 2699, count: 3 },
  { category: "Housing", total: 8000, count: 1 },
  { category: "Telecom", total: 299, count: 1 },
]

export default function BillsPage() {
  const [bills, setBills] = useState(seedBills)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "unpaid" | "paid">("all")
  const [showAddForm, setShowAddForm] = useState(false)
  const [newBill, setNewBill] = useState({ name: "", amount: "", dueDay: "", category: "Utility", icon: "📄" })

  const unpaid = bills.filter((b) => !b.isPaid)
  const paid = bills.filter((b) => b.isPaid)
  const totalDue = unpaid.reduce((s, b) => s + b.amount, 0)
  const totalMonthly = bills.reduce((s, b) => s + b.amount, 0)
  const overdueCount = unpaid.filter((b) => getDaysUntilDue(b.dueDay) === "Overdue").length

  function markPaid(id: string) {
    setBills((prev) => prev.map((b) => (b.id === id ? { ...b, isPaid: true, lastPaid: new Date().toISOString() } : b)))
  }

  function addBill() {
    if (!newBill.name || !newBill.amount) return
    const bill = {
      id: `b${Date.now()}`,
      name: newBill.name,
      amount: Number(newBill.amount),
      dueDay: Number(newBill.dueDay) || 1,
      category: newBill.category,
      lastPaid: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
      isPaid: false,
      isRecurring: true,
      icon: categoryIcons[newBill.category] ?? "📄",
    }
    setBills((prev) => [...prev, bill])
    setShowAddForm(false)
    setNewBill({ name: "", amount: "", dueDay: "", category: "Utility", icon: "📄" })
  }

  function getDaysUntilDue(dueDay: number) {
    if (dueDay === 0) return "On demand"
    const today = new Date().getDate()
    const days = dueDay >= today ? dueDay - today : dueDay + 30 - today
    if (days === 0) return "Due today"
    if (days < 0) return "Overdue"
    return `${days} days`
  }

  const displayed = bills.filter((b) => {
    const matchFilter = filter === "all" || (filter === "unpaid" ? !b.isPaid : b.isPaid)
    const matchSearch = search === "" || b.name.toLowerCase().includes(search.toLowerCase()) || b.category.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  return (
    <div className="space-y-6 p-5 md:p-8">
      <PageHeader
        title="Bill Book"
        description="Track all recurring and one-time bills. Never miss a payment with due date reminders and payment history."
        action={
          <div className="flex items-center gap-2">
            {overdueCount > 0 && (
              <Badge variant="destructive" className="gap-1.5 animate-pulse">
                <AlertTriangle className="size-3" /> {overdueCount} Overdue
              </Badge>
            )}
            <div className="rounded-xl border border-border bg-card px-4 py-2 text-right">
              <p className="text-xs text-muted-foreground">Due this month</p>
              <p className="text-lg font-bold tabular-nums text-destructive">{formatINR(totalDue)}</p>
            </div>
          </div>
        }
      />

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Monthly Total</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{formatINR(totalMonthly)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{bills.length} bills tracked</p>
          </CardContent>
        </Card>
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Unpaid Bills</p>
            <p className="mt-1 text-2xl font-bold text-destructive">{unpaid.length}</p>
            <p className="mt-1 text-xs text-muted-foreground">{formatINR(totalDue)} outstanding</p>
          </CardContent>
        </Card>
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Paid This Month</p>
            <p className="mt-1 text-2xl font-bold text-primary">{paid.length}</p>
            <p className="mt-1 text-xs text-muted-foreground">{formatINR(paid.reduce((s, b) => s + b.amount, 0))} settled</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Annual Bill Cost</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{formatINR(totalMonthly * 12)}</p>
            <p className="mt-1 text-xs text-muted-foreground">Recurring yearly</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="size-5 text-primary" /> Bills by Category
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingBillsInsight.map((cat) => {
            const pct = Math.round((cat.total / totalMonthly) * 100)
            return (
              <div key={cat.category}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="flex items-center gap-1.5">
                    <span>{categoryIcons[cat.category] ?? "📄"}</span>
                    <span className="font-medium">{cat.category}</span>
                    <Badge variant="secondary" className="text-[10px]">{cat.count} bills</Badge>
                  </span>
                  <span className="font-medium tabular-nums">{formatINR(cat.total)} ({pct}%)</span>
                </div>
                <Progress value={pct} className="h-2" />
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Bills List */}
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="size-5 text-primary" /> All Bills
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search…"
                className="pl-8 h-8 text-sm w-32"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {(["all", "unpaid", "paid"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                  filter === f
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          {displayed.map((bill) => {
            const daysUntil = getDaysUntilDue(bill.dueDay)
            const isOverdue = daysUntil === "Overdue"
            return (
              <div
                key={bill.id}
                className={`flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/30 ${bill.isPaid ? "opacity-60" : ""}`}
              >
                <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl text-xl ${bill.isPaid ? "bg-muted" : "bg-accent"}`}>
                  {bill.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className={`font-medium ${bill.isPaid ? "line-through" : ""}`}>{bill.name}</p>
                    <Badge variant="secondary">{bill.category}</Badge>
                    {bill.isRecurring && <Badge variant="outline"><Repeat className="size-2.5 mr-1" />Recurring</Badge>}
                    {isOverdue && !bill.isPaid && <Badge variant="destructive">Overdue!</Badge>}
                  </div>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    {bill.isPaid ? (
                      <><CheckCircle2 className="size-3 text-primary" /> Paid on {new Date(bill.lastPaid).toLocaleDateString("en-IN")}</>
                    ) : (
                      <><Clock className="size-3" />{bill.dueDay > 0 ? `Due on ${bill.dueDay}th` : "Due on demand"} · {daysUntil}</>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold tabular-nums">{formatINR(bill.amount)}</span>
                  {bill.isPaid ? (
                    <CheckCircle2 className="size-5 text-primary" />
                  ) : (
                    <Button size="sm" onClick={() => markPaid(bill.id)}>Mark Paid</Button>
                  )}
                </div>
              </div>
            )
          })}
          {displayed.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No bills match your filter.</p>
          )}
        </CardContent>
      </Card>

      {/* Add Bill Form */}
      {showAddForm ? (
        <Card className="border-primary/30">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Add New Bill</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}><X className="size-4" /></Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Bill Name</Label>
                <Input placeholder="e.g., Electricity" value={newBill.name} onChange={(e) => setNewBill((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Amount (₹)</Label>
                <Input type="number" placeholder="1450" value={newBill.amount} onChange={(e) => setNewBill((p) => ({ ...p, amount: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Due Day (1-31, or 0 for on-demand)</Label>
                <Input type="number" placeholder="15" value={newBill.dueDay} onChange={(e) => setNewBill((p) => ({ ...p, dueDay: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Category</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={newBill.category}
                  onChange={(e) => setNewBill((p) => ({ ...p, category: e.target.value }))}
                >
                  {Object.keys(categoryIcons).map((cat) => <option key={cat}>{cat}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={addBill} className="flex-1">
                <Plus className="size-4" /> Add Bill
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button variant="outline" className="w-full" onClick={() => setShowAddForm(true)}>
          <Plus className="size-4" /> Add a New Bill
        </Button>
      )}

      {/* AI Tip */}
      <Card className="border-primary/20 bg-accent/30">
        <CardContent className="flex items-start gap-3 p-5">
          <Sparkles className="mt-0.5 size-5 shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">AI Tip:</span> Setting up auto-pay for your Electricity and Internet bills saves an average of 2 late payment penalties per year (₹600 saved).
            Consider bundling your mobile and internet plans — Jio offers a ₹399 combined plan vs your current ₹1,098 total.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
