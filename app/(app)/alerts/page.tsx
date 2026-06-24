"use client"

import { useState } from "react"
import {
  Bell, AlertTriangle, CheckCircle2, Info, ShieldAlert, TrendingUp,
  Eye, Zap, Brain, BarChart3, Calendar, ArrowRight, RefreshCw,
  TrendingDown, Lightbulb, Clock, X
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { PageHeader } from "@/components/page-header"
import { predictions, fraudAlerts } from "@/lib/mock-data"
import { formatINR } from "@/lib/finance"

const aiInsights = [
  {
    id: "i1", type: "warning" as const,
    title: "End-of-Month Cash Crunch Predicted",
    message: "At current spend rate, you'll have only ₹2,100 left by June 30. You've spent 68% of your budget in 15 days.",
    metric: { label: "Budget used", value: 68, max: 100, color: "bg-yellow-500" },
    action: "Cut Expenses",
    priority: "High",
  },
  {
    id: "i2", type: "info" as const,
    title: "Prime Video Renewal in 4 Days",
    message: "₹299 will be charged on June 27. You haven't used Prime Video in 26 days — consider cancelling before renewal.",
    metric: { label: "Days since last use", value: 26, max: 30, color: "bg-blue-500" },
    action: "Manage Subs",
    priority: "Medium",
  },
  {
    id: "i3", type: "success" as const,
    title: "Emergency Fund Goal Ahead of Schedule",
    message: "At current savings rate, your Emergency Fund will complete in 6 months — 2 months ahead of your 8-month deadline!",
    metric: { label: "Goal progress", value: 60, max: 100, color: "bg-primary" },
    action: "View Goal",
    priority: "Low",
  },
  {
    id: "i4", type: "warning" as const,
    title: "Food Spending 40% Above Average",
    message: "You've spent ₹3,070 on food this month vs your 3-month average of ₹2,190. Cooking at home 3x/week saves ~₹900.",
    metric: { label: "Above average", value: 40, max: 100, color: "bg-orange-500" },
    action: "Track Food",
    priority: "Medium",
  },
  {
    id: "i5", type: "info" as const,
    title: "SIP Investment Opportunity",
    message: "You have ₹8,000 idle in savings this month. Starting a ₹2,000/month ELSS SIP now grows to ₹3.8L in 10 years at 12% CAGR.",
    metric: { label: "Idle cash utilization", value: 0, max: 100, color: "bg-purple-500" },
    action: "Start SIP",
    priority: "Low",
  },
]

const cashFlowForecast = [
  { month: "Jul", income: 40000, predictedSpend: 27400, confidence: 89 },
  { month: "Aug", income: 40000, predictedSpend: 28100, confidence: 82 },
  { month: "Sep", income: 40000, predictedSpend: 26900, confidence: 74 },
  { month: "Oct", income: 40000, predictedSpend: 29500, confidence: 65 },
  { month: "Nov", income: 40000, predictedSpend: 31200, confidence: 58 },
  { month: "Dec", income: 40000, predictedSpend: 34000, confidence: 51 },
]

const howItWorks = [
  { icon: "🔍", title: "Duplicate Detection", desc: "Flags identical charges within 24 hours from the same merchant." },
  { icon: "📊", title: "Spending Baseline", desc: "Builds a 90-day spending pattern and alerts on significant deviations." },
  { icon: "📅", title: "Cash Flow Forecast", desc: "Predicts end-of-month balance based on current spend trajectory." },
  { icon: "🔔", title: "Renewal Alerts", desc: "Notifies 7 days before unused subscriptions auto-renew." },
]

const predictionIcon = {
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle2,
}
const predictionStyle = {
  warning: "border-yellow-500/30 bg-yellow-50/50 dark:bg-yellow-500/5",
  info: "border-blue-500/30 bg-blue-50/50 dark:bg-blue-500/5",
  success: "border-primary/30 bg-primary/5",
}
const predictionIconStyle = {
  warning: "text-yellow-600",
  info: "text-blue-600",
  success: "text-primary",
}
const fraudStyle = {
  high: "border-destructive/40 bg-destructive/5",
  medium: "border-yellow-500/30 bg-yellow-50/50 dark:bg-yellow-500/5",
}
const fraudBadge = {
  high: "destructive" as const,
  medium: "secondary" as const,
}

export default function AlertsPage() {
  const [dismissed, setDismissed] = useState<string[]>([])
  const [activeFilter, setActiveFilter] = useState<"all" | "warning" | "info" | "success">("all")

  const visibleInsights = aiInsights.filter(
    (i) => !dismissed.includes(i.id) && (activeFilter === "all" || i.type === activeFilter)
  )

  const activeCount = aiInsights.filter((i) => !dismissed.includes(i.id)).length

  return (
    <div className="space-y-6 p-5 md:p-8">
      <PageHeader
        title="Alerts, Predictions & AI Engine"
        description="AI-powered alerts predict overspending, catch duplicate transactions, and detect abnormal charges before they hurt your finances."
        action={
          <Badge variant="destructive" className="gap-1.5 animate-pulse px-3 py-1.5">
            <Bell className="size-3.5" /> {activeCount + fraudAlerts.length} Active
          </Badge>
        }
      />

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="border-yellow-500/30 bg-yellow-50/50 dark:bg-yellow-500/5">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Warnings</p>
            <p className="mt-1 text-2xl font-bold text-yellow-600">
              {aiInsights.filter((i) => i.type === "warning" && !dismissed.includes(i.id)).length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-blue-500/30 bg-blue-50/50 dark:bg-blue-500/5">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Insights</p>
            <p className="mt-1 text-2xl font-bold text-blue-600">
              {aiInsights.filter((i) => i.type === "info" && !dismissed.includes(i.id)).length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Good News</p>
            <p className="mt-1 text-2xl font-bold text-primary">
              {aiInsights.filter((i) => i.type === "success" && !dismissed.includes(i.id)).length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Fraud Alerts</p>
            <p className="mt-1 text-2xl font-bold text-destructive">{fraudAlerts.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Fraud Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="size-5 text-destructive" /> Fraud & Anomaly Detection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {fraudAlerts.map((alert) => (
            <div key={alert.id} className={`rounded-xl border p-4 ${fraudStyle[alert.severity]}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <ShieldAlert className={`mt-0.5 size-5 shrink-0 ${alert.severity === "high" ? "text-destructive" : "text-yellow-600"}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{alert.title}</p>
                      <Badge variant={fraudBadge[alert.severity]}>
                        {alert.severity === "high" ? "High Risk" : "Medium Risk"}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">{alert.message}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="size-3" /> {alert.time}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button size="sm" variant="outline"><Eye className="size-3.5" /> Review</Button>
                  <Button size="sm" variant="destructive">Dispute</Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* AI Predictions */}
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Brain className="size-5 text-primary" /> AI Prediction Engine
          </CardTitle>
          <div className="flex gap-1">
            {(["all", "warning", "info", "success"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                  activeFilter === f
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {f === "all" ? "All" : f === "warning" ? "⚠ Warnings" : f === "info" ? "ℹ Info" : "✓ Good"}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {visibleInsights.map((pred) => {
            const Icon = predictionIcon[pred.type]
            return (
              <div key={pred.id} className={`rounded-xl border p-4 ${predictionStyle[pred.type]}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <Icon className={`mt-0.5 size-5 shrink-0 ${predictionIconStyle[pred.type]}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="font-semibold">{pred.title}</p>
                        <Badge variant={pred.priority === "High" ? "destructive" : pred.priority === "Medium" ? "secondary" : "outline"} className="text-[10px]">
                          {pred.priority} Priority
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{pred.message}</p>
                      <div className="mt-3">
                        <div className="mb-1 flex justify-between text-xs">
                          <span className="text-muted-foreground">{pred.metric.label}</span>
                          <span className="font-medium">{pred.metric.value}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
                          <div className={`h-full rounded-full ${pred.metric.color}`} style={{ width: `${pred.metric.value}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button size="sm" variant="outline">{pred.action} <ArrowRight className="size-3" /></Button>
                    <button
                      onClick={() => setDismissed((p) => [...p, pred.id])}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
          {visibleInsights.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No active alerts for this filter.</p>
          )}
        </CardContent>
      </Card>

      {/* Cash Flow Forecast */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="size-5 text-primary" /> 6-Month Spend Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {cashFlowForecast.map((m) => {
              const savingsPct = Math.round(((m.income - m.predictedSpend) / m.income) * 100)
              const spendPct = Math.round((m.predictedSpend / m.income) * 100)
              return (
                <div key={m.month} className="flex items-center gap-4">
                  <span className="w-8 shrink-0 text-sm font-medium text-muted-foreground">{m.month}</span>
                  <div className="flex-1">
                    <div className="flex h-6 overflow-hidden rounded-full bg-muted">
                      <div
                        className="flex items-center justify-center bg-destructive/70 text-[10px] text-white font-medium transition-all"
                        style={{ width: `${spendPct}%` }}
                      >
                        {spendPct > 20 && `${spendPct}%`}
                      </div>
                      <div
                        className="flex items-center justify-center bg-primary/60 text-[10px] text-primary-foreground font-medium transition-all"
                        style={{ width: `${savingsPct}%` }}
                      >
                        {savingsPct > 10 && `${savingsPct}%`}
                      </div>
                    </div>
                  </div>
                  <div className="w-32 text-right">
                    <p className="text-sm font-medium tabular-nums">{formatINR(m.predictedSpend)}</p>
                    <p className="text-xs text-muted-foreground">{m.confidence}% confidence</p>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-4 flex items-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="size-3 rounded-full bg-destructive/70 inline-block" /> Predicted Spend</span>
            <span className="flex items-center gap-1.5"><span className="size-3 rounded-full bg-primary/60 inline-block" /> Savings</span>
          </div>
        </CardContent>
      </Card>

      {/* How it works */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="size-5 text-primary" /> How SmartBudget AI Detects Issues
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {howItWorks.map((item) => (
              <div key={item.title} className="rounded-xl border border-border p-4">
                <span className="text-2xl">{item.icon}</span>
                <p className="mt-2 font-semibold">{item.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
