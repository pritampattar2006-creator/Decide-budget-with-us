"use client"

import { useState } from "react"
import {
  RefreshCcw, AlertTriangle, CheckCircle2, TrendingDown, Bell,
  Plus, Search, BarChart3, Clock, Sparkles, Tag, X, Calendar
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { PageHeader } from "@/components/page-header"
import { formatINR } from "@/lib/finance"
import { subscriptions as seedSubs } from "@/lib/mock-data"

const categoryColors: Record<string, string> = {
  Entertainment: "bg-purple-500",
  Productivity: "bg-blue-500",
  Education: "bg-green-500",
  Health: "bg-red-500",
}

const categoryEmojis: Record<string, string> = {
  Entertainment: "🎬",
  Productivity: "⚡",
  Education: "📚",
  Health: "💪",
}

const spendByCategory = [
  { category: "Entertainment", amount: 1216, count: 3 },
  { category: "Productivity", amount: 2050, count: 2 },
]

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState(seedSubs)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "unused">("all")

  const total = subs.reduce((s, sub) => s + sub.amount, 0)
  const unusedCost = subs.filter((s) => s.status === "unused").reduce((s, sub) => s + sub.amount, 0)
  const renewingSoon = subs.filter((s) => s.daysUntilRenewal <= 7)
  const annualCost = total * 12

  function cancel(id: string) {
    setSubs((prev) => prev.filter((s) => s.id !== id))
  }

  const filtered = subs.filter(
    (s) =>
      (filterStatus === "all" || s.status === filterStatus) &&
      (search === "" || s.name.toLowerCase().includes(search.toLowerCase()) || s.category.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-6 p-5 md:p-8">
      <PageHeader
        title="Subscription Manager"
        description="Track all recurring subscriptions, spot unused ones, get renewal alerts, and stop paying for what you don't use."
        action={
          <div className="rounded-xl border border-border bg-card px-4 py-2 text-right">
            <p className="text-xs text-muted-foreground">Monthly total</p>
            <p className="text-lg font-bold tabular-nums">{formatINR(total)}</p>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Active Subscriptions</p>
            <p className="mt-1 text-2xl font-bold">{subs.filter((s) => s.status === "active").length}</p>
            <p className="mt-1 text-xs text-muted-foreground">Currently using</p>
          </CardContent>
        </Card>
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Wasted on Unused</p>
            <p className="mt-1 text-2xl font-bold text-destructive">{formatINR(unusedCost)}/mo</p>
            <p className="mt-1 text-xs text-muted-foreground">= {formatINR(unusedCost * 12)}/year</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Renewing This Week</p>
            <p className="mt-1 text-2xl font-bold text-yellow-600">{renewingSoon.length} subs</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {renewingSoon.length > 0 ? `Next: ${renewingSoon[0].name}` : "None this week"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Annual Spend</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{formatINR(annualCost)}</p>
            <p className="mt-1 text-xs text-muted-foreground">All subscriptions × 12</p>
          </CardContent>
        </Card>
      </div>

      {/* Spend by Category */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="size-5 text-primary" /> Spend by Category
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {spendByCategory.map((cat) => {
            const pct = Math.round((cat.amount / total) * 100)
            return (
              <div key={cat.category}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="flex items-center gap-1.5">
                    <span>{categoryEmojis[cat.category] ?? "📦"}</span>
                    <span className="font-medium">{cat.category}</span>
                    <Badge variant="secondary" className="text-[10px]">{cat.count} subs</Badge>
                  </span>
                  <span className="font-medium tabular-nums">{formatINR(cat.amount)}/mo ({pct}%)</span>
                </div>
                <Progress value={pct} className="h-2" />
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Unused Cost Alert */}
      {unusedCost > 0 && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-start gap-3 p-5">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
            <div>
              <p className="font-semibold text-destructive">Cost Optimization Alert</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                You're spending {formatINR(unusedCost)}/month on subscriptions you haven't used recently.
                Cancelling them saves <span className="font-semibold text-foreground">{formatINR(unusedCost * 12)}</span> per year.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Renewing Soon */}
      {renewingSoon.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="size-5 text-primary" /> Renewing Soon
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {renewingSoon.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className={`flex size-9 items-center justify-center rounded-lg text-white text-sm ${categoryColors[s.category] ?? "bg-muted-foreground"}`}>
                    {categoryEmojis[s.category] ?? "📦"}
                  </span>
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="size-3" /> Renews in {s.daysUntilRenewal} days · Last used: {s.lastUsed}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold tabular-nums">{formatINR(s.amount)}</span>
                  {s.status === "unused" && (
                    <Button size="sm" variant="destructive" onClick={() => cancel(s.id)}>Cancel</Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* All Subscriptions */}
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <RefreshCcw className="size-5 text-primary" /> All Subscriptions
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search…"
                className="pl-8 h-8 text-sm w-36"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {(["all", "active", "unused"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilterStatus(f)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                  filterStatus === f
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
          {filtered.map((s) => (
            <div key={s.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors">
              <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl text-white text-lg ${categoryColors[s.category] ?? "bg-muted-foreground"}`}>
                {categoryEmojis[s.category] ?? s.name.charAt(0)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{s.name}</p>
                  <Badge variant={s.status === "unused" ? "destructive" : "secondary"}>
                    {s.status === "unused" ? "Unused" : "Active"}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">{s.category}</Badge>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Last used: {s.lastUsed} · Renews in {s.daysUntilRenewal}d
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-semibold tabular-nums">{formatINR(s.amount)}</p>
                  <p className="text-xs text-muted-foreground">/{s.cycle.toLowerCase()}</p>
                </div>
                {s.status === "unused" ? (
                  <Button size="sm" variant="destructive" onClick={() => cancel(s.id)}>
                    <X className="size-3.5" /> Cancel
                  </Button>
                ) : (
                  <CheckCircle2 className="size-5 text-primary" />
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No subscriptions match your filter.</p>
          )}
        </CardContent>
      </Card>

      {/* Add Subscription */}
      <Card className="border-dashed border-2 border-muted-foreground/20 hover:border-primary/40 transition-colors">
        <CardContent className="flex items-center justify-between p-5">
          <div>
            <p className="font-semibold">Add a Subscription</p>
            <p className="text-sm text-muted-foreground">Track a new service or recurring payment</p>
          </div>
          <Button variant="outline">
            <Plus className="size-4" /> Add
          </Button>
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-accent/30">
        <CardContent className="flex items-center gap-3 p-5">
          <TrendingDown className="size-5 shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">AI Tip:</span> Switching Netflix from 4K to Standard plan saves ₹350/month.
            Consider sharing plans with family members to cut costs further. Bundling Spotify + YouTube Premium = ₹200 savings.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
