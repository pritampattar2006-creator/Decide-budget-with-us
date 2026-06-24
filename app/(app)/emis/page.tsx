"use client"

import { useState } from "react"
import {
  CreditCard, CalendarClock, TrendingDown, Landmark, AlertCircle,
  Plus, Calculator, ArrowRight, ChevronDown, ChevronUp, Zap,
  BarChart3, Target, Sparkles
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { PageHeader } from "@/components/page-header"
import { formatINR } from "@/lib/finance"
import { emis } from "@/lib/mock-data"

function getDueDateStatus(dueDay: number) {
  const today = new Date().getDate()
  const daysLeft = dueDay >= today ? dueDay - today : dueDay + 30 - today
  if (daysLeft <= 3) return { label: `Due in ${daysLeft}d`, variant: "destructive" as const }
  if (daysLeft <= 7) return { label: `Due in ${daysLeft}d`, variant: "secondary" as const }
  return { label: `Due in ${daysLeft}d`, variant: "outline" as const }
}

function calcMonthlyInterest(remaining: number, rate: number) {
  return Math.round((remaining * rate) / (12 * 100))
}

function payoffMonths(remaining: number, emi: number) {
  return Math.ceil(remaining / emi)
}

// Avalanche: highest interest first
const avalancheOrder = [...emis].sort((a, b) => b.rate - a.rate)
// Snowball: smallest remaining first
const snowballOrder = [...emis].sort((a, b) => a.remaining - b.remaining)

export default function EMIPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "strategy" | "calculator">("overview")
  const [expanded, setExpanded] = useState<string | null>(null)
  const [calcPrincipal, setCalcPrincipal] = useState("500000")
  const [calcRate, setCalcRate] = useState("9.5")
  const [calcTenure, setCalcTenure] = useState("60")

  const totalEMI = emis.reduce((s, e) => s + e.emi, 0)
  const totalDebt = emis.reduce((s, e) => s + e.remaining, 0)
  const totalPrincipal = emis.reduce((s, e) => s + e.principal, 0)
  const paidOff = totalPrincipal - totalDebt
  const monthlyInterestTotal = emis.reduce((s, e) => s + calcMonthlyInterest(e.remaining, e.rate), 0)

  // EMI Calculator
  const P = Number(calcPrincipal) || 0
  const r = (Number(calcRate) || 0) / (12 * 100)
  const n = Number(calcTenure) || 1
  const calcEMI = r > 0 ? Math.round((P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)) : Math.round(P / n)
  const calcTotalPayment = calcEMI * n
  const calcTotalInterest = calcTotalPayment - P

  return (
    <div className="space-y-6 p-5 md:p-8">
      <PageHeader
        title="EMI Manager"
        description="Track all loan EMIs with due dates, payoff forecasts, debt avalanche strategy, and interest breakdowns."
        action={
          <div className="rounded-xl border border-border bg-card px-4 py-2 text-right">
            <p className="text-xs text-muted-foreground">Total EMI / month</p>
            <p className="text-lg font-bold tabular-nums text-destructive">{formatINR(totalEMI)}</p>
          </div>
        }
      />

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Outstanding Debt</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{formatINR(totalDebt)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{emis.length} active loans</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Principal Paid Off</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-primary">{formatINR(paidOff)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{Math.round((paidOff / totalPrincipal) * 100)}% of total</p>
          </CardContent>
        </Card>
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Interest This Month</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-destructive">{formatINR(monthlyInterestTotal)}</p>
            <p className="mt-1 text-xs text-muted-foreground">Money lost to interest</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Debt-to-Income</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{Math.round((totalEMI / 40000) * 100)}%</p>
            <p className="mt-1 text-xs text-muted-foreground">Recommended: &lt;40%</p>
          </CardContent>
        </Card>
      </div>

      {/* Overall Repayment Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="size-5 text-primary" /> Overall Debt Repayment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-1.5 flex justify-between text-sm">
            <span className="text-muted-foreground">Paid off</span>
            <span className="font-medium">{Math.round((paidOff / totalPrincipal) * 100)}%</span>
          </div>
          <Progress value={(paidOff / totalPrincipal) * 100} className="h-3" />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>{formatINR(paidOff)} paid</span>
            <span>{formatINR(totalDebt)} remaining</span>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-muted p-1">
        {(["overview", "strategy", "calculator"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium capitalize transition-all ${
              activeTab === tab
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "overview" ? "📋 Loans" : tab === "strategy" ? "⚡ Strategy" : "🔢 Calculator"}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="grid gap-4 md:grid-cols-2">
          {emis.map((emi) => {
            const progress = ((emi.principal - emi.remaining) / emi.principal) * 100
            const monthlyInterest = calcMonthlyInterest(emi.remaining, emi.rate)
            const monthlyPrincipal = emi.emi - monthlyInterest
            const months = payoffMonths(emi.remaining, emi.emi)
            const dueStatus = getDueDateStatus(emi.dueDay)
            const isExpanded = expanded === emi.id

            return (
              <Card key={emi.id}>
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                        <CreditCard className="size-5" />
                      </span>
                      <div>
                        <p className="font-semibold">{emi.name}</p>
                        <p className="text-xs text-muted-foreground">{emi.bank} · {emi.rate}% p.a.</p>
                      </div>
                    </div>
                    <Badge variant={dueStatus.variant}>{dueStatus.label}</Badge>
                  </div>

                  <div>
                    <div className="mb-1.5 flex justify-between text-sm">
                      <span className="text-muted-foreground">Repaid</span>
                      <span className="font-medium">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2.5" />
                    <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
                      <span>{formatINR(emi.principal - emi.remaining)} paid</span>
                      <span>{formatINR(emi.remaining)} left</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-muted p-2.5">
                      <p className="text-xs text-muted-foreground">EMI</p>
                      <p className="text-sm font-semibold tabular-nums">{formatINR(emi.emi)}</p>
                    </div>
                    <div className="rounded-lg bg-muted p-2.5">
                      <p className="text-xs text-muted-foreground">Interest</p>
                      <p className="text-sm font-semibold tabular-nums text-destructive">{formatINR(monthlyInterest)}</p>
                    </div>
                    <div className="rounded-lg bg-muted p-2.5">
                      <p className="text-xs text-muted-foreground">Principal</p>
                      <p className="text-sm font-semibold tabular-nums text-primary">{formatINR(monthlyPrincipal)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-lg bg-accent/50 px-3 py-2">
                    <CalendarClock className="size-4 shrink-0 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      Payoff in <span className="font-semibold text-foreground">{months} months</span> ({" "}
                      {new Date(new Date().setMonth(new Date().getMonth() + months)).toLocaleDateString("en-IN", { month: "short", year: "numeric" })})
                    </p>
                  </div>

                  <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
                    <Landmark className="mt-0.5 size-4 shrink-0 text-primary" />
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">AI Tip:</span> Paying an extra ₹1,000/month shortens this loan by {Math.ceil(months * 0.15)} months and saves {formatINR(monthlyInterest * Math.ceil(months * 0.15))} in interest.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          <Card className="border-dashed border-2 border-muted-foreground/20 hover:border-primary/40 transition-colors cursor-pointer md:col-span-2">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="font-semibold">Add a Loan</p>
                <p className="text-sm text-muted-foreground">Track a new EMI or personal loan</p>
              </div>
              <Button variant="outline"><Plus className="size-4" /> Add Loan</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Strategy Tab */}
      {activeTab === "strategy" && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Zap className="size-5 text-destructive" /> Avalanche Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">Pay highest-interest loan first. Saves the most money overall.</p>
                <div className="space-y-2 mt-3">
                  {avalancheOrder.map((emi, idx) => (
                    <div key={emi.id} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2">
                      <span className="flex size-6 items-center justify-center rounded-full bg-destructive text-white text-xs font-bold shrink-0">{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{emi.name}</p>
                        <p className="text-xs text-muted-foreground">{emi.rate}% p.a. · {formatINR(emi.remaining)} remaining</p>
                      </div>
                      {idx === 0 && <Badge variant="destructive" className="text-[10px]">Priority</Badge>}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-primary font-medium mt-2">💡 Saves ~{formatINR(monthlyInterestTotal * 4)} in total interest</p>
              </CardContent>
            </Card>

            <Card className="border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Target className="size-5 text-primary" /> Snowball Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">Pay smallest loan first. Builds momentum and motivation.</p>
                <div className="space-y-2 mt-3">
                  {snowballOrder.map((emi, idx) => (
                    <div key={emi.id} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2">
                      <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{emi.name}</p>
                        <p className="text-xs text-muted-foreground">{formatINR(emi.remaining)} remaining</p>
                      </div>
                      {idx === 0 && <Badge variant="default" className="text-[10px]">Priority</Badge>}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-primary font-medium mt-2">🎯 Clear first loan in {payoffMonths(snowballOrder[0]?.remaining, snowballOrder[0]?.emi)} months</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-yellow-500/20 bg-yellow-50/50 dark:bg-yellow-500/5">
            <CardContent className="flex items-start gap-3 p-5">
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-yellow-600" />
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Debt-to-Income Ratio:</span> Your total EMIs ({formatINR(totalEMI)}/mo) are{" "}
                <span className="font-medium text-yellow-600">{Math.round((totalEMI / 40000) * 100)}% of income</span>.
                Financial advisors recommend keeping this below 40%. Consider prepaying high-interest loans first.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Calculator Tab */}
      {activeTab === "calculator" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="size-5 text-primary" /> EMI Calculator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Loan Amount (₹)</Label>
                  <Input type="number" value={calcPrincipal} onChange={(e) => setCalcPrincipal(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Interest Rate (% p.a.)</Label>
                  <Input type="number" value={calcRate} onChange={(e) => setCalcRate(e.target.value)} step="0.1" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Tenure (months)</Label>
                  <Input type="number" value={calcTenure} onChange={(e) => setCalcTenure(e.target.value)} />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 text-center mt-4">
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                  <p className="text-xs text-muted-foreground">Monthly EMI</p>
                  <p className="mt-1 text-2xl font-bold text-primary tabular-nums">{formatINR(calcEMI)}</p>
                </div>
                <div className="rounded-xl border border-border p-4">
                  <p className="text-xs text-muted-foreground">Total Payment</p>
                  <p className="mt-1 text-2xl font-bold tabular-nums">{formatINR(calcTotalPayment)}</p>
                </div>
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                  <p className="text-xs text-muted-foreground">Total Interest</p>
                  <p className="mt-1 text-2xl font-bold text-destructive tabular-nums">{formatINR(calcTotalInterest)}</p>
                </div>
              </div>

              {/* Visualization */}
              <div className="space-y-2 mt-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Principal vs Interest</span>
                  <span>{Math.round((P / calcTotalPayment) * 100)}% principal</span>
                </div>
                <div className="flex h-4 w-full overflow-hidden rounded-full">
                  <div className="bg-primary" style={{ width: `${(P / calcTotalPayment) * 100}%` }} />
                  <div className="bg-destructive/70" style={{ width: `${(calcTotalInterest / calcTotalPayment) * 100}%` }} />
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><div className="size-2.5 rounded-full bg-primary" /> Principal: {formatINR(P)}</span>
                  <span className="flex items-center gap-1"><div className="size-2.5 rounded-full bg-destructive/70" /> Interest: {formatINR(calcTotalInterest)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
