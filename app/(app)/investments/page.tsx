"use client"

import { useState } from "react"
import {
  TrendingUp, TrendingDown, PieChart, Landmark, ShieldCheck,
  AlertTriangle, Plus, RefreshCw, BarChart3, Target, Sparkles,
  ArrowUpRight, Clock, Star, Filter
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { PageHeader } from "@/components/page-header"
import { formatINR } from "@/lib/finance"
import { investments } from "@/lib/mock-data"

const riskColors: Record<string, string> = {
  Low: "text-primary",
  Medium: "text-yellow-600",
  High: "text-destructive",
}
const riskBg: Record<string, string> = {
  Low: "bg-primary/10",
  Medium: "bg-yellow-500/10",
  High: "bg-destructive/10",
}
const typeIcon: Record<string, string> = {
  "Mutual Fund": "📊",
  Stock: "📈",
  FD: "🏦",
  Gold: "🥇",
}

const sipProjections = [
  { years: 5, rate: 12, label: "5 yrs at 12%" },
  { years: 10, rate: 12, label: "10 yrs at 12%" },
  { years: 15, rate: 12, label: "15 yrs at 12%" },
]

function sipFutureValue(monthly: number, years: number, annualRate: number) {
  const n = years * 12
  const r = annualRate / (12 * 100)
  return Math.round(monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r))
}

const performanceData = [
  { month: "Jan", value: 82000 },
  { month: "Feb", value: 84500 },
  { month: "Mar", value: 81200 },
  { month: "Apr", value: 86900 },
  { month: "May", value: 90400 },
  { month: "Jun", value: 99800 },
]

export default function InvestmentsPage() {
  const [activeTab, setActiveTab] = useState<"portfolio" | "sip" | "analysis">("portfolio")
  const [filterType, setFilterType] = useState<string>("All")

  const totalInvested = investments.reduce((s, i) => s + i.invested, 0)
  const totalCurrent = investments.reduce((s, i) => s + i.currentValue, 0)
  const totalGains = totalCurrent - totalInvested
  const totalReturn = ((totalGains / totalInvested) * 100).toFixed(1)
  const totalSIP = investments.filter((i) => i.sipAmount > 0).reduce((s, i) => s + i.sipAmount, 0)

  const types = ["All", ...Array.from(new Set(investments.map((i) => i.type)))]
  const filtered = filterType === "All" ? investments : investments.filter((i) => i.type === filterType)

  const allocationData = [
    { label: "Equity Exposure", value: 58, desc: "Stocks + Mutual Funds — growth-oriented", color: "bg-primary" },
    { label: "Debt / Safe", value: 28, desc: "FD + Debt funds — capital protected", color: "bg-blue-500" },
    { label: "Commodities (Gold)", value: 14, desc: "Inflation hedge", color: "bg-yellow-500" },
  ]

  return (
    <div className="space-y-6 p-5 md:p-8">
      <PageHeader
        title="Investment Planner"
        description="Track your Mutual Funds, SIPs, Stocks, FD, and Gold portfolio. Get AI-powered risk scoring and allocation insights."
        action={
          <div className="rounded-xl border border-border bg-card px-4 py-2 text-right">
            <p className="text-xs text-muted-foreground">Portfolio value</p>
            <p className="text-lg font-bold tabular-nums text-primary">{formatINR(totalCurrent)}</p>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total Invested</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{formatINR(totalInvested)}</p>
          </CardContent>
        </Card>
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Current Value</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-primary">{formatINR(totalCurrent)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total Gains</p>
            <p className="mt-1 flex items-center gap-1.5 text-2xl font-bold tabular-nums text-green-600">
              <TrendingUp className="size-5" /> +{formatINR(totalGains)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">SIP per Month</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{formatINR(totalSIP)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Overall Return Banner */}
      <Card>
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <PieChart className="size-6" />
            </span>
            <div>
              <p className="text-lg font-bold">Overall Portfolio Return</p>
              <p className="text-sm text-muted-foreground">{investments.length} holdings across {new Set(investments.map((i) => i.type)).size} asset classes</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-right">
            <div>
              <p className="text-xs text-muted-foreground">Returns</p>
              <p className="text-3xl font-bold text-primary">+{totalReturn}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Unrealized P&L</p>
              <p className="text-xl font-bold text-green-600">+{formatINR(totalGains)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-muted p-1">
        {(["portfolio", "sip", "analysis"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium capitalize transition-all ${
              activeTab === tab
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "portfolio" ? "📊 Holdings" : tab === "sip" ? "🔁 SIP Planner" : "🧠 Risk Analysis"}
          </button>
        ))}
      </div>

      {/* Portfolio Tab */}
      {activeTab === "portfolio" && (
        <div className="space-y-4">
          {/* Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="size-5 text-primary" /> Portfolio Performance (6 months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-36">
                {performanceData.map((m) => (
                  <div key={m.month} className="flex flex-1 flex-col items-center gap-1.5">
                    <p className="text-[10px] font-medium tabular-nums text-muted-foreground">
                      {(m.value / 1000).toFixed(0)}K
                    </p>
                    <div
                      className="w-full rounded-t-lg bg-primary transition-all"
                      style={{ height: `${(m.value / 105000) * 100}%`, opacity: m.month === "Jun" ? 1 : 0.5 }}
                    />
                    <p className="text-xs text-muted-foreground">{m.month}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Holdings */}
          <Card>
            <CardHeader className="flex-row items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <Landmark className="size-5 text-primary" /> Holdings
              </CardTitle>
              <div className="flex gap-1 flex-wrap">
                {types.map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      filterType === t
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="divide-y divide-border p-0">
              {filtered.map((inv) => {
                const gain = inv.currentValue - inv.invested
                const isPositive = gain >= 0
                const gainPct = ((gain / inv.invested) * 100).toFixed(1)
                return (
                  <div key={inv.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-xl">
                      {typeIcon[inv.type]}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-medium">{inv.name}</p>
                        <Badge variant="secondary">{inv.type}</Badge>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${riskBg[inv.risk]} ${riskColors[inv.risk]}`}>
                          {inv.risk} Risk
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {inv.platform}{inv.sipAmount > 0 ? ` · SIP: ${formatINR(inv.sipAmount)}/mo` : ""}
                      </p>
                      <div className="mt-1 flex gap-2 text-xs text-muted-foreground">
                        <span>Invested: {formatINR(inv.invested)}</span>
                        <span>·</span>
                        <span className={isPositive ? "text-green-600" : "text-destructive"}>
                          P&L: {isPositive ? "+" : ""}{formatINR(gain)} ({isPositive ? "+" : ""}{gainPct}%)
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold tabular-nums">{formatINR(inv.currentValue)}</p>
                      <p className={`mt-0.5 flex items-center justify-end gap-1 text-xs font-medium ${isPositive ? "text-green-600" : "text-destructive"}`}>
                        {isPositive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                        {isPositive ? "+" : ""}{inv.returns}%
                      </p>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      )}

      {/* SIP Planner Tab */}
      {activeTab === "sip" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="size-5 text-primary" /> Your Active SIPs
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border p-0">
              {investments.filter((i) => i.sipAmount > 0).map((inv) => (
                <div key={inv.id} className="flex items-center gap-4 px-5 py-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-lg">
                    {typeIcon[inv.type]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{inv.name}</p>
                    <p className="text-xs text-muted-foreground">{inv.platform} · {inv.risk} Risk</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold tabular-nums">{formatINR(inv.sipAmount)}/mo</p>
                    <p className="text-xs text-primary">{inv.returns}% returns</p>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between bg-muted/50 px-5 py-4">
                <p className="font-semibold">Total SIP / Month</p>
                <p className="font-bold tabular-nums text-primary">{formatINR(totalSIP)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="size-5 text-primary" /> SIP Growth Projections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">If you invest {formatINR(totalSIP)}/month at 12% CAGR:</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {sipProjections.map((proj) => {
                  const futureValue = sipFutureValue(totalSIP, proj.years, proj.rate)
                  const invested = totalSIP * proj.years * 12
                  const gains = futureValue - invested
                  return (
                    <div key={proj.label} className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
                      <p className="text-sm text-muted-foreground">{proj.label}</p>
                      <p className="mt-1 text-2xl font-bold text-primary tabular-nums">{formatINR(futureValue)}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Invested: {formatINR(invested)} · Gains: {formatINR(gains)}
                      </p>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Button className="w-full" variant="outline">
            <Plus className="size-4" /> Start New SIP
          </Button>
        </div>
      )}

      {/* Risk Analysis Tab */}
      {activeTab === "analysis" && (
        <div className="space-y-4">
          <Card className="border-primary/20 bg-accent/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-primary" /> AI Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {allocationData.map((r) => (
                <div key={r.label}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-muted-foreground">{r.label}</span>
                    <span className="font-medium">{r.value}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className={`h-full rounded-full ${r.color}`} style={{ width: `${r.value}%` }} />
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{r.desc}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Diversification Score", value: 78, color: "text-primary", desc: "Good spread across 4 asset classes" },
              { label: "Risk Adjusted Return", value: 85, color: "text-green-600", desc: "Above benchmark Sharpe ratio" },
              { label: "Liquidity Score", value: 62, color: "text-yellow-600", desc: "2/5 holdings are liquid within 24h" },
            ].map((score) => (
              <Card key={score.label}>
                <CardContent className="p-5">
                  <p className="text-sm text-muted-foreground">{score.label}</p>
                  <p className={`mt-1 text-3xl font-bold ${score.color}`}>{score.value}<span className="text-base font-normal text-muted-foreground">/100</span></p>
                  <Progress value={score.value} className="mt-2 h-1.5" />
                  <p className="mt-1.5 text-xs text-muted-foreground">{score.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-yellow-500/20 bg-yellow-50/50 dark:bg-yellow-500/5">
            <CardContent className="flex items-start gap-3 p-5">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-yellow-600" />
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">AI Recommendation:</span> Your equity exposure (58%) is healthy for age 26.
                Consider increasing Gold allocation to 20% for better inflation protection. Starting a ₹2,000/month SIP in an index fund
                now could grow to ₹3.8 Lakh in 10 years at 12% CAGR.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
