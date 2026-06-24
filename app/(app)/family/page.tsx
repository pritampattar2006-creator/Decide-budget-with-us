"use client"

import { useState } from "react"
import {
  Users, PieChart, Landmark, TrendingDown, TrendingUp, Plus,
  Settings, BarChart3, Wallet, Target, ArrowRight, Sparkles,
  ShoppingBag, Zap, Home, Wifi
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { PageHeader } from "@/components/page-header"
import { formatINR } from "@/lib/finance"
import { familyMembers, sharedBills } from "@/lib/mock-data"

const roleColor: Record<string, string> = {
  Father: "var(--color-chart-3)",
  Mother: "var(--color-chart-2)",
  Self: "var(--color-chart-1)",
  Sister: "var(--color-chart-4)",
}

const roleBg: Record<string, string> = {
  Father: "bg-[hsl(var(--chart-3))]",
  Mother: "bg-[hsl(var(--chart-2))]",
  Self: "bg-[hsl(var(--chart-1))]",
  Sister: "bg-[hsl(var(--chart-4))]",
}

const memberGoals = [
  { memberId: "f1", goal: "Home Renovation", target: 500000, saved: 180000 },
  { memberId: "f2", goal: "Family Vacation", target: 80000, saved: 42000 },
  { memberId: "f3", goal: "Emergency Fund", target: 120000, saved: 72000 },
  { memberId: "f4", goal: "College Fees", target: 100000, saved: 15000 },
]

const sharedExpensesHistory = [
  { month: "Apr", amount: 28400 },
  { month: "May", amount: 31200 },
  { month: "Jun", amount: 29900 },
]

export default function FamilyPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "goals" | "shared">("overview")

  const totalIncome = familyMembers.reduce((s, m) => s + m.income, 0)
  const totalSpent = familyMembers.reduce((s, m) => s + m.spent, 0)
  const totalBillsShared = sharedBills.reduce((s, b) => s + b.amount, 0)
  const perPerson = Math.round(totalBillsShared / familyMembers.length)
  const familySavings = totalIncome - totalSpent
  const savingsRate = Math.round((familySavings / totalIncome) * 100)

  return (
    <div className="space-y-6 p-5 md:p-8">
      <PageHeader
        title="Family Finance"
        description="Manage shared budgets, split household expenses, and track savings goals across all family members."
        action={
          <div className="rounded-xl border border-border bg-card px-4 py-2 text-right">
            <p className="text-xs text-muted-foreground">Family income</p>
            <p className="text-lg font-bold tabular-nums">{formatINR(totalIncome)}/mo</p>
          </div>
        }
      />

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Combined Income</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{formatINR(totalIncome)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{familyMembers.length} earners</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Family Spending</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-destructive">{formatINR(totalSpent)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{Math.round((totalSpent / totalIncome) * 100)}% of income</p>
          </CardContent>
        </Card>
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Family Savings</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-primary">{formatINR(familySavings)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{savingsRate}% savings rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Shared Bills</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{formatINR(totalBillsShared)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{formatINR(perPerson)}/person</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-muted p-1">
        {(["overview", "goals", "shared"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium capitalize transition-all ${
              activeTab === tab
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "overview" ? "👨‍👩‍👧‍👦 Members" : tab === "goals" ? "🎯 Goals" : "🏠 Shared Bills"}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          {/* Member Spending Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="size-5 text-primary" /> Member Spending Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border p-0">
              {familyMembers.map((member) => {
                const spendRate = Math.round((member.spent / member.income) * 100)
                const savingsRate = 100 - spendRate
                return (
                  <div key={member.id} className="flex items-center gap-4 px-5 py-4">
                    <span
                      className="flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                      style={{ backgroundColor: roleColor[member.role] ?? "var(--color-chart-1)" }}
                    >
                      {member.avatar}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{member.name}</p>
                        <Badge variant="secondary">{member.role}</Badge>
                        <Badge variant={savingsRate >= 20 ? "default" : "destructive"} className="text-[10px]">
                          {savingsRate}% saved
                        </Badge>
                      </div>
                      <div className="mt-1.5">
                        <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                          <span>Spent {formatINR(member.spent)} of {formatINR(member.income)}</span>
                        </div>
                        <Progress value={spendRate} className="h-1.5" />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold tabular-nums">{formatINR(member.income)}</p>
                      <p className="text-xs text-muted-foreground">income</p>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Income Contribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="size-5 text-primary" /> Income Contribution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {familyMembers.map((member) => {
                const pct = Math.round((member.income / totalIncome) * 100)
                return (
                  <div key={member.id}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-muted-foreground">{member.name} ({member.role})</span>
                      <span className="font-medium tabular-nums">{formatINR(member.income)} <span className="text-muted-foreground">({pct}%)</span></span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: roleColor[member.role] ?? "var(--color-chart-1)" }}
                      />
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* AI Insight */}
          <Card className="border-primary/20 bg-accent/30">
            <CardContent className="flex items-start gap-3 p-5">
              <Sparkles className="mt-0.5 size-5 shrink-0 text-primary" />
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">AI Insight:</span> Your family saves {formatINR(familySavings)}/month ({savingsRate}% savings rate).
                If invested in a diversified portfolio at 12% CAGR, this grows to{" "}
                <span className="font-semibold text-foreground">{formatINR(Math.round(familySavings * 12 * 5 * 1.4))}</span> in 5 years.
                Riya can benefit from a student savings account for her pocket money.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Goals Tab */}
      {activeTab === "goals" && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {memberGoals.map((goal) => {
              const member = familyMembers.find((m) => m.id === goal.memberId)!
              const progress = Math.round((goal.saved / goal.target) * 100)
              return (
                <Card key={goal.memberId}>
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                        style={{ backgroundColor: roleColor[member.role] }}
                      >
                        {member.avatar}
                      </span>
                      <div>
                        <p className="font-semibold">{goal.goal}</p>
                        <p className="text-xs text-muted-foreground">{member.name} · {member.role}</p>
                      </div>
                      <Badge variant="outline" className="ml-auto">{progress}%</Badge>
                    </div>
                    <div>
                      <Progress value={progress} className="h-2.5" />
                      <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
                        <span>{formatINR(goal.saved)} saved</span>
                        <span>{formatINR(goal.target - goal.saved)} remaining</span>
                      </div>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-2.5 text-xs text-muted-foreground">
                      Target: <span className="font-semibold text-foreground">{formatINR(goal.target)}</span>
                      {" · "}Est. completion: <span className="font-semibold text-foreground">
                        {Math.ceil((goal.target - goal.saved) / (member.income * 0.15))} months
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          <Button variant="outline" className="w-full">
            <Plus className="size-4" /> Add Family Goal
          </Button>
        </div>
      )}

      {/* Shared Bills Tab */}
      {activeTab === "shared" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Landmark className="size-5 text-primary" /> Shared Household Bills
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-0 divide-y divide-border p-0">
              {sharedBills.map((bill, idx) => {
                const icons = [Home, Zap, ShoppingBag, Wifi]
                const Icon = icons[idx % icons.length]
                return (
                  <div key={bill.name} className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 items-center justify-center rounded-lg bg-accent">
                        <Icon className="size-4 text-accent-foreground" />
                      </span>
                      <p className="font-medium">{bill.name}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="tabular-nums font-semibold">{formatINR(bill.amount)}</p>
                      <Badge variant="outline">{formatINR(Math.round(bill.amount / familyMembers.length))}/person</Badge>
                    </div>
                  </div>
                )
              })}
              <div className="flex items-center justify-between bg-muted/50 px-5 py-4">
                <p className="font-semibold">Total Shared</p>
                <div className="flex items-center gap-4">
                  <p className="font-bold tabular-nums">{formatINR(totalBillsShared)}</p>
                  <Badge variant="default">{formatINR(perPerson)}/person</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expense History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="size-5 text-primary" /> 3-Month Household Spend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-4 h-32">
                {sharedExpensesHistory.map((m) => (
                  <div key={m.month} className="flex flex-1 flex-col items-center gap-2">
                    <p className="text-xs font-medium tabular-nums">{formatINR(m.amount)}</p>
                    <div
                      className="w-full rounded-t-lg bg-primary/60"
                      style={{ height: `${(m.amount / 35000) * 100}%` }}
                    />
                    <p className="text-xs text-muted-foreground">{m.month}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button variant="outline" className="w-full">
            <Plus className="size-4" /> Add Shared Bill
          </Button>
        </div>
      )}
    </div>
  )
}
