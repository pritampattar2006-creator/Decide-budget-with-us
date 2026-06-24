"use client"

import { useState } from "react"
import {
  ShieldAlert, Eye, AlertTriangle, CheckCircle2, XCircle,
  TrendingUp, Activity, Clock, MapPin, Smartphone, CreditCard,
  RefreshCw, Search, Filter, Shield, Zap, BarChart3
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { PageHeader } from "@/components/page-header"
import { fraudAlerts } from "@/lib/mock-data"
import { formatINR } from "@/lib/finance"

const extendedAlerts = [
  ...fraudAlerts,
  { id: "fr3", severity: "medium" as const, title: "Geolocation Mismatch", message: "Transaction from Bengaluru while you're in Delhi. Online purchase of ₹2,400 at an unknown merchant.", time: "3 days ago" },
  { id: "fr4", severity: "high" as const, title: "Midnight Transaction", message: "₹6,200 charged at 2:47 AM — outside your usual spending hours. Merchant: GamingZone24.", time: "5 days ago" },
]

const suspiciousTransactions = [
  { id: "t1", merchant: "Dominos Pizza", amount: 450, date: "23 Jun, 2:15 PM", flag: "Duplicate", risk: "high", location: "Koramangala, Bengaluru", device: "Web Browser" },
  { id: "t2", merchant: "Dominos Pizza", amount: 450, date: "23 Jun, 2:18 PM", flag: "Duplicate", risk: "high", location: "Koramangala, Bengaluru", device: "Web Browser" },
  { id: "t3", merchant: "GamingZone24", amount: 6200, date: "19 Jun, 2:47 AM", flag: "Odd Hours", risk: "high", location: "Unknown IP", device: "New Device" },
  { id: "t4", merchant: "AmazonPay", amount: 2400, date: "20 Jun, 11:22 AM", flag: "Geo Mismatch", risk: "medium", location: "Bengaluru (VPN?)", device: "Mobile" },
  { id: "t5", merchant: "Swiggy", amount: 8900, date: "21 Jun, 7:30 PM", flag: "High Amount", risk: "medium", location: "Mumbai", device: "Mobile App" },
]

const mlSignals = [
  { label: "Duplicate Transaction Pattern", score: 94, color: "text-destructive", bg: "bg-destructive" },
  { label: "Odd-Hour Spend Detection", score: 78, color: "text-orange-500", bg: "bg-orange-500" },
  { label: "Geo Anomaly Score", score: 65, color: "text-yellow-600", bg: "bg-yellow-500" },
  { label: "Merchant Trust Index", score: 42, color: "text-primary", bg: "bg-primary" },
  { label: "Device Fingerprint Match", score: 88, color: "text-destructive", bg: "bg-destructive" },
]

const howItWorks = [
  { icon: "🔍", title: "Duplicate Detection", desc: "Catches repeated charges from same merchant within 24 hours.", active: true },
  { icon: "📊", title: "Spend Deviation", desc: "Flags amounts >3x your normal transaction size.", active: true },
  { icon: "🌐", title: "Geo Anomaly", desc: "Detects transactions from unusual or distant locations.", active: true },
  { icon: "⏰", title: "Odd-Hour Alerts", desc: "Monitors 11PM–5AM transactions against your behavior.", active: false },
  { icon: "📱", title: "Device Fingerprint", desc: "Tracks new devices accessing your account.", active: true },
  { icon: "🔁", title: "Recurring Risk", desc: "Alerts when subscription charges exceed expected amounts.", active: false },
]

export default function FraudPage() {
  const [resolved, setResolved] = useState<string[]>([])
  const [disputed, setDisputed] = useState<string[]>([])
  const [search, setSearch] = useState("")

  const totalRisk = extendedAlerts.filter((a) => !resolved.includes(a.id) && !disputed.includes(a.id)).length
  const highRisk = extendedAlerts.filter((a) => a.severity === "high" && !resolved.includes(a.id)).length
  const overallRiskScore = Math.round((highRisk / extendedAlerts.length) * 100)

  const filteredTx = suspiciousTransactions.filter(
    (tx) =>
      search === "" ||
      tx.merchant.toLowerCase().includes(search.toLowerCase()) ||
      tx.flag.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 p-5 md:p-8">
      <PageHeader
        title="Fraud Detection Centre"
        description="AI-powered security monitoring with real-time anomaly detection, duplicate transaction flagging, and dispute management."
        action={
          <div className="flex items-center gap-3">
            <Badge variant="destructive" className="gap-1.5 animate-pulse px-3 py-1.5">
              <ShieldAlert className="size-4" /> {totalRisk} Active Alerts
            </Badge>
          </div>
        }
      />

      {/* Risk Score + Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-destructive/30 bg-destructive/5 lg:col-span-1">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Overall Risk Score</p>
            <p className="mt-1 text-4xl font-black text-destructive tabular-nums">{overallRiskScore}<span className="text-lg font-normal">/100</span></p>
            <p className="mt-1 text-xs text-destructive font-medium">⚠ High Risk — Action needed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">High Risk Alerts</p>
            <p className="mt-1 text-2xl font-bold text-destructive tabular-nums">{highRisk}</p>
            <p className="mt-1 text-xs text-muted-foreground">Require immediate action</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Resolved This Month</p>
            <p className="mt-1 text-2xl font-bold text-primary tabular-nums">{resolved.length}</p>
            <p className="mt-1 text-xs text-muted-foreground">Marked safe by you</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Amount at Risk</p>
            <p className="mt-1 text-2xl font-bold text-destructive tabular-nums">{formatINR(
              suspiciousTransactions
                .filter((t) => t.risk === "high")
                .reduce((s, t) => s + t.amount, 0)
            )}</p>
            <p className="mt-1 text-xs text-muted-foreground">High-risk transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* ML Signals */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="size-5 text-primary" /> AI Detection Signals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {mlSignals.map((sig) => (
            <div key={sig.label}>
              <div className="mb-1.5 flex justify-between text-sm">
                <span className="text-muted-foreground">{sig.label}</span>
                <span className={`font-bold tabular-nums ${sig.color}`}>{sig.score}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${sig.bg}`}
                  style={{ width: `${sig.score}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Active Alerts */}
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="size-5 text-destructive" /> Fraud Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {extendedAlerts.map((alert) => {
            const isResolved = resolved.includes(alert.id)
            const isDisputed = disputed.includes(alert.id)
            return (
              <div
                key={alert.id}
                className={`rounded-xl border p-4 transition-opacity ${
                  isResolved || isDisputed ? "opacity-50" : ""
                } ${
                  alert.severity === "high"
                    ? "border-destructive/30 bg-destructive/5"
                    : "border-yellow-500/30 bg-yellow-50/50 dark:bg-yellow-500/5"
                }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <AlertTriangle
                      className={`mt-0.5 size-5 shrink-0 ${
                        alert.severity === "high" ? "text-destructive" : "text-yellow-600"
                      }`}
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{alert.title}</p>
                        <Badge variant={alert.severity === "high" ? "destructive" : "secondary"}>
                          {alert.severity === "high" ? "High Risk" : "Medium Risk"}
                        </Badge>
                        {isResolved && <Badge variant="outline" className="text-primary border-primary/30">Resolved</Badge>}
                        {isDisputed && <Badge variant="destructive">Disputed</Badge>}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{alert.message}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="size-3" /> {alert.time}
                      </p>
                    </div>
                  </div>
                  {!isResolved && !isDisputed && (
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => setResolved((p) => [...p, alert.id])}>
                        <CheckCircle2 className="size-3.5" /> Mark Safe
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => setDisputed((p) => [...p, alert.id])}>
                        <XCircle className="size-3.5" /> Dispute
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Suspicious Transactions Table */}
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Activity className="size-5 text-primary" /> Suspicious Transactions
          </CardTitle>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search transactions…"
              className="pl-9 h-9 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">Merchant</th>
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">Amount</th>
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">Date & Time</th>
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">Flag</th>
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">Location</th>
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">Device</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTx.map((tx) => (
                <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3.5 font-medium">{tx.merchant}</td>
                  <td className="px-5 py-3.5 tabular-nums font-semibold">{formatINR(tx.amount)}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{tx.date}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant={tx.risk === "high" ? "destructive" : "secondary"}>
                      {tx.flag}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="size-3 shrink-0" /> {tx.location}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      {tx.device.includes("Mobile") ? <Smartphone className="size-3 shrink-0" /> : <CreditCard className="size-3 shrink-0" />}
                      {tx.device}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card className="border-primary/20 bg-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="size-5 text-primary" /> How SmartBudget AI Detects Fraud
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {howItWorks.map((item) => (
            <div key={item.title} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
              <span className="text-2xl">{item.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm">{item.title}</p>
                  <div className={`size-2 rounded-full ${item.active ? "bg-primary" : "bg-muted-foreground"}`} />
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Security Tips */}
      <Card className="border-yellow-500/20 bg-yellow-50/50 dark:bg-yellow-500/5">
        <CardContent className="flex items-start gap-3 p-5">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-yellow-600" />
          <div>
            <p className="font-semibold text-yellow-700 dark:text-yellow-400">Security Recommendation</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Enable 2FA on all payment apps. Review your UPI permissions monthly. Never share OTPs.
              Consider setting a per-transaction limit of ₹5,000 on your bank account for extra protection.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
