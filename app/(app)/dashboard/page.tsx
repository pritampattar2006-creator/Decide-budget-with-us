"use client"

import Link from "next/link"
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Wallet,
  CreditCard,
  ArrowUpRight,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Info,
  ShieldAlert,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"
import { HealthScore } from "@/components/health-score"
import { CategoryHeatmap, CategoryPie, TrendChart } from "@/components/dashboard-charts"
import { useStore } from "@/lib/store"
import {
  buildAllocation,
  computeHealthScore,
  formatINR,
  monthlyTrend,
  spendByCategory,
  spendByCategoryHeatmap,
  totalThisMonth,
} from "@/lib/finance"
import { emis, predictions, fraudAlerts, subscriptions } from "@/lib/mock-data"

export default function DashboardPage() {
  const { profile, expenses } = useStore()

  const spent = totalThisMonth(expenses)
  const saved = Math.max(0, profile.income - spent)
  const health = computeHealthScore(profile, expenses)
  const trend = monthlyTrend(profile, expenses)
  const byCategory = spendByCategory(expenses)
  const allocation = buildAllocation(profile)
  const totalEmi = emis.reduce((s, e) => s + e.emi, 0)
  const subscriptionBurn = subscriptions.reduce((s, sub) => s + sub.amount, 0)
  const heatmap = spendByCategoryHeatmap(expenses)
  const avgDailySpend = Math.round(spent / new Date().getDate())
  const monthlyExpenseRange = Math.max(...trend.map((m) => m.expense)) - Math.min(...trend.map((m) => m.expense))
  const expenseVolatility = Math.round((monthlyExpenseRange / profile.income) * 100)
  const topCategory = byCategory[0]?.category ?? "None"

  const stats = [
    {
      label: "Monthly Income",
      value: formatINR(profile.income),
      delta: "Fixed",
      icon: Wallet,
      tone: "neutral" as const,
    },
    {
      label: "Spent This Month",
      value: formatINR(spent),
      delta: `${Math.round((spent / profile.income) * 100)}% of income`,
      icon: TrendingDown,
      tone: "down" as const,
    },
    {
      label: "Saved This Month",
      value: formatINR(saved),
      delta: `${Math.round((saved / profile.income) * 100)}% rate`,
      icon: PiggyBank,
      tone: "up" as const,
    },
    {
      label: "EMIs / Month",
      value: formatINR(totalEmi),
      delta: `${emis.length} active loans`,
      icon: CreditCard,
      tone: "down" as const,
    },
  ]

  return (
    <div className="space-y-6 p-5 md:p-8">
      <PageHeader
        title={`Welcome back, ${profile.name.split(" ")[0]}`}
        description="Here's your financial snapshot for this month, with AI-tuned salary allocation and health scoring."
        action={
          <Button render={<Link href="/coach" />}>
            <Sparkles className="size-4" /> Ask AI Coach
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{s.label}</span>
                  <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <Icon className="size-4" />
                  </span>
                </div>
                <p className="mt-3 text-2xl font-bold tabular-nums">{s.value}</p>
                <p
                  className={
                    "mt-1 text-xs font-medium " +
                    (s.tone === "up"
                      ? "text-primary"
                      : s.tone === "down"
                        ? "text-muted-foreground"
                        : "text-muted-foreground")
                  }
                >
                  {s.delta}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Average Daily Spend</p>
            <p className="mt-3 text-2xl font-bold tabular-nums">{formatINR(avgDailySpend)}</p>
            <p className="mt-1 text-xs text-muted-foreground">Current month daily average</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Expense Volatility</p>
            <p className="mt-3 text-2xl font-bold tabular-nums">{expenseVolatility}%</p>
            <p className="mt-1 text-xs text-muted-foreground">6-month range vs income</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Subscription Burn</p>
            <p className="mt-3 text-2xl font-bold tabular-nums">{formatINR(subscriptionBurn)}</p>
            <p className="mt-1 text-xs text-muted-foreground">Recurring monthly costs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Top Spend Category</p>
            <p className="mt-3 text-2xl font-bold">{topCategory}</p>
            <p className="mt-1 text-xs text-muted-foreground">Largest monthly expense area</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Income vs Expense vs Savings</CardTitle>
            <Badge variant="secondary" className="gap-1">
              <TrendingUp className="size-3" /> Last 6 months
            </Badge>
          </CardHeader>
          <CardContent>
            <TrendChart data={trend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {byCategory.length > 0 ? (
              <>
                <CategoryPie data={byCategory} />
                <div className="mt-4 space-y-2">
                  {byCategory.slice(0, 4).map((c) => (
                    <div key={c.category} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{c.category}</span>
                      <span className="font-medium tabular-nums">
                        {formatINR(c.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="py-12 text-center text-sm text-muted-foreground">
                No expenses yet this month.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Spend Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryHeatmap months={heatmap.months} rows={heatmap.rows} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Financial Health Score</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <HealthScore breakdown={health} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>AI Salary Allocation</CardTitle>
            <Badge variant="secondary">{profile.persona}</Badge>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {allocation.map((a) => {
              const pct = (a.amount / profile.income) * 100
              return (
                <div key={a.label}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{a.label}</span>
                    <span className="font-medium tabular-nums">
                      {formatINR(a.amount)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: a.color }}
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/30 bg-accent/40">
        <CardContent className="flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="size-5" />
            </span>
            <div>
              <p className="font-semibold">Run your Financial Twin</p>
              <p className="text-sm text-muted-foreground">
                See how a raise, a new loan, or a big purchase changes your net worth over 5 years.
              </p>
            </div>
          </div>
          <Button render={<Link href="/twin" />} variant="default">
            Simulate future <ArrowUpRight className="size-4" />
          </Button>
        </CardContent>
      </Card>

      {/* AI Prediction Engine (Module 19) */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Info className="size-5 text-primary" /> AI Prediction Alerts
          </CardTitle>
          <Button render={<Link href="/alerts" />} variant="outline" size="sm">View all</Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {predictions.map((pred) => {
            const Icon = pred.type === "warning" ? AlertTriangle : pred.type === "success" ? CheckCircle2 : Info
            const style = pred.type === "warning"
              ? "border-yellow-500/30 bg-yellow-50/50 dark:bg-yellow-500/5"
              : pred.type === "success"
              ? "border-primary/20 bg-primary/5"
              : "border-blue-500/30 bg-blue-50/50 dark:bg-blue-500/5"
            const iconStyle = pred.type === "warning" ? "text-yellow-600" : pred.type === "success" ? "text-primary" : "text-blue-600"
            return (
              <div key={pred.id} className={`flex items-start gap-3 rounded-xl border p-3.5 ${style}`}>
                <Icon className={`mt-0.5 size-4 shrink-0 ${iconStyle}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{pred.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{pred.message}</p>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Fraud Detection (Module 20) */}
      {fraudAlerts.length > 0 && (
        <Card className="border-destructive/30">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="size-5 text-destructive" /> Fraud Alerts
            </CardTitle>
            <Button render={<Link href="/alerts" />} variant="outline" size="sm">Review</Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {fraudAlerts.map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-3.5">
                <ShieldAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
                <div>
                  <p className="text-sm font-semibold">{alert.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{alert.message}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{alert.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

