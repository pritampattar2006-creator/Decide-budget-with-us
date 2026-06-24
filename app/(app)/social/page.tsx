"use client"

import { useState } from "react"
import {
  Users, Share2, Wallet, Sparkles, Plus, ArrowRight, ArrowLeft,
  CheckCircle2, Clock, UserPlus, BarChart3, TrendingUp, MessageCircle,
  Banknote, QrCode, History
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { PageHeader } from "@/components/page-header"
import { formatINR } from "@/lib/finance"

const circles = [
  { id: "g1", name: "Roommate Roundup", members: 3, total: 14450, due: 8200, settled: 6250, emoji: "🏠", color: "bg-blue-500" },
  { id: "g2", name: "Weekend Trip", members: 5, total: 26800, due: 12400, settled: 14400, emoji: "✈️", color: "bg-purple-500" },
  { id: "g3", name: "Office Lunch Pool", members: 6, total: 9800, due: 3200, settled: 6600, emoji: "🍔", color: "bg-orange-500" },
]

const friendBalances = [
  { id: "f1", name: "Riya", avatar: "RI", role: "Concert split", amount: 1200, status: "You owe", date: "22 Jun" },
  { id: "f2", name: "Neha", avatar: "NE", role: "Gym membership", amount: 450, status: "Owes you", date: "20 Jun" },
  { id: "f3", name: "Amit", avatar: "AM", role: "Dinner bill", amount: 820, status: "You owe", date: "18 Jun" },
  { id: "f4", name: "Priya", avatar: "PR", role: "Movie tickets", amount: 600, status: "Owes you", date: "17 Jun" },
  { id: "f5", name: "Rahul", avatar: "RA", role: "Cab split", amount: 350, status: "Owes you", date: "15 Jun" },
]

const activityFeed = [
  { id: "a1", type: "settled", title: "Amit paid you ₹820", detail: "Dinner at Farzi Cafe · Full settlement", tag: "Settled", time: "2h ago" },
  { id: "a2", type: "added", title: "New expense in Weekend Trip", detail: "Priya added Hotel Stay — ₹4,200 (₹840/person)", tag: "Split", time: "5h ago" },
  { id: "a3", type: "group", title: "Created Grocery Pool group", detail: "8 friends invited via link", tag: "New Group", time: "1d ago" },
  { id: "a4", type: "reminder", title: "Reminder sent to Riya", detail: "Concert split — ₹1,200 pending", tag: "Reminder", time: "2d ago" },
]

const splitMethods = [
  { id: "equal", label: "Split Equally", icon: "⚖️" },
  { id: "percentage", label: "By Percentage", icon: "%" },
  { id: "custom", label: "Custom Amounts", icon: "✏️" },
]

export default function SocialPage() {
  const [settled, setSettled] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<"circles" | "friends" | "activity">("circles")
  const [showNewGroup, setShowNewGroup] = useState(false)
  const [splitMethod, setSplitMethod] = useState("equal")

  const totalOwedToYou = friendBalances.filter((f) => f.status === "Owes you" && !settled.includes(f.id)).reduce((s, f) => s + f.amount, 0)
  const totalYouOwe = friendBalances.filter((f) => f.status === "You owe" && !settled.includes(f.id)).reduce((s, f) => s + f.amount, 0)
  const totalShared = circles.reduce((sum, g) => sum + g.total, 0)

  return (
    <div className="space-y-6 p-5 md:p-8">
      <PageHeader
        title="Social Finance"
        description="Split bills, manage group expenses, track friend balances, and settle dues seamlessly — all in one place."
        action={
          <Button onClick={() => setShowNewGroup(true)}>
            <Plus className="size-4" /> New Group
          </Button>
        }
      />

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">They Owe You</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-primary">{formatINR(totalOwedToYou)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{friendBalances.filter((f) => f.status === "Owes you" && !settled.includes(f.id)).length} friends</p>
          </CardContent>
        </Card>
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">You Owe</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-destructive">{formatINR(totalYouOwe)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{friendBalances.filter((f) => f.status === "You owe" && !settled.includes(f.id)).length} friends</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Active Groups</p>
            <p className="mt-1 text-2xl font-bold">{circles.length}</p>
            <p className="mt-1 text-xs text-muted-foreground">Sharing circles</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total Group Spend</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{formatINR(totalShared)}</p>
            <p className="mt-1 text-xs text-muted-foreground">All circles combined</p>
          </CardContent>
        </Card>
      </div>

      {/* Net Balance Summary */}
      <Card className={`border-${totalOwedToYou > totalYouOwe ? "primary" : "destructive"}/30`}>
        <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold">Your Net Social Balance</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {totalOwedToYou > totalYouOwe
                ? `You're up ${formatINR(totalOwedToYou - totalYouOwe)} overall — others owe you more than you owe.`
                : `You owe ${formatINR(totalYouOwe - totalOwedToYou)} more than what's owed to you.`}
            </p>
          </div>
          <div className="text-right">
            <p className={`text-3xl font-bold tabular-nums ${totalOwedToYou >= totalYouOwe ? "text-primary" : "text-destructive"}`}>
              {totalOwedToYou >= totalYouOwe ? "+" : "-"}{formatINR(Math.abs(totalOwedToYou - totalYouOwe))}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-muted p-1">
        {(["circles", "friends", "activity"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium capitalize transition-all ${
              activeTab === tab
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "circles" ? "🏠 Groups" : tab === "friends" ? "👥 Friends" : "📋 Activity"}
          </button>
        ))}
      </div>

      {/* Tab: Circles */}
      {activeTab === "circles" && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {circles.map((circle) => {
            const settledPct = Math.round((circle.settled / circle.total) * 100)
            return (
              <Card key={circle.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`flex size-11 items-center justify-center rounded-xl ${circle.color} text-white text-xl`}>
                        {circle.emoji}
                      </span>
                      <div>
                        <p className="font-semibold">{circle.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Users className="size-3" /> {circle.members} members
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">{formatINR(Math.round(circle.total / circle.members))}/person</Badge>
                  </div>

                  <div>
                    <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                      <span>Settled</span>
                      <span className="font-medium">{settledPct}%</span>
                    </div>
                    <Progress value={settledPct} className="h-2" />
                    <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
                      <span className="text-primary font-medium">{formatINR(circle.settled)} settled</span>
                      <span className="text-destructive font-medium">{formatINR(circle.due)} due</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <BarChart3 className="size-3.5" /> Details
                    </Button>
                    <Button size="sm" className="flex-1">
                      <Banknote className="size-3.5" /> Settle
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          <Card className="border-dashed border-2 border-muted-foreground/20 hover:border-primary/40 transition-colors cursor-pointer" onClick={() => setShowNewGroup(true)}>
            <CardContent className="flex flex-col items-center justify-center gap-3 p-8 text-center">
              <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
                <Plus className="size-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Create New Group</p>
                <p className="text-sm text-muted-foreground">Start splitting with friends</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab: Friends */}
      {activeTab === "friends" && (
        <div className="space-y-4">
          {/* Quick Split Tool */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="size-5 text-primary" /> Quick Bill Split
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label className="text-xs">Bill Amount (₹)</Label>
                  <Input type="number" placeholder="2400" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Split Among</Label>
                  <Input type="number" placeholder="3 people" />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {splitMethods.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSplitMethod(m.id)}
                    className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                      splitMethod === m.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {m.icon} {m.label}
                  </button>
                ))}
              </div>
              <Button className="w-full sm:w-auto">
                <QrCode className="size-4" /> Generate Split Link
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="size-5 text-primary" /> Friend Balances
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border p-0">
              {friendBalances.map((friend) => {
                const isSettled = settled.includes(friend.id)
                const owesYou = friend.status === "Owes you"
                return (
                  <div key={friend.id} className={`flex items-center gap-4 px-5 py-4 transition-opacity ${isSettled ? "opacity-40" : ""}`}>
                    <span className={`flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${owesYou ? "bg-primary" : "bg-destructive"}`}>
                      {friend.avatar}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">{friend.name}</p>
                      <p className="text-xs text-muted-foreground">{friend.role} · {friend.date}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="flex items-center gap-1.5">
                          {owesYou ? <ArrowLeft className="size-3.5 text-primary" /> : <ArrowRight className="size-3.5 text-destructive" />}
                          <p className={`font-semibold tabular-nums ${owesYou ? "text-primary" : "text-destructive"}`}>{formatINR(friend.amount)}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{friend.status}</p>
                      </div>
                      {!isSettled && (
                        <Button size="sm" variant={owesYou ? "default" : "outline"} onClick={() => setSettled((p) => [...p, friend.id])}>
                          {owesYou ? "Request" : "Pay"}
                        </Button>
                      )}
                      {isSettled && <CheckCircle2 className="size-5 text-primary" />}
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab: Activity */}
      {activeTab === "activity" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="size-5 text-primary" /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border p-0">
            {activityFeed.map((item) => (
              <div key={item.id} className="flex items-start gap-4 px-5 py-4">
                <span className={`flex size-10 shrink-0 items-center justify-center rounded-full text-white text-lg mt-0.5 ${
                  item.type === "settled" ? "bg-primary" :
                  item.type === "added" ? "bg-blue-500" :
                  item.type === "group" ? "bg-purple-500" :
                  "bg-yellow-500"
                }`}>
                  {item.type === "settled" ? "✓" :
                   item.type === "added" ? "+" :
                   item.type === "group" ? "👥" : "🔔"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-sm">{item.title}</p>
                    <Badge variant={item.type === "settled" ? "secondary" : "outline"} className="shrink-0 text-[10px]">
                      {item.tag}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{item.detail}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3" /> {item.time}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* AI Smart Insight */}
      <Card className="border-primary/20 bg-accent/30">
        <CardContent className="flex items-start gap-3 p-5">
          <Sparkles className="mt-0.5 size-5 shrink-0 text-primary" />
          <div>
            <p className="font-semibold">AI Smart Insight</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              You have {formatINR(totalOwedToYou)} pending from friends. Sending a gentle reminder increases settlement rate by 68%.
              Consider using UPI Collect to automate repayments for the Weekend Trip group (₹12,400 due).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* New Group Modal (inline) */}
      {showNewGroup && (
        <Card className="border-primary/30 bg-card">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Create New Group</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setShowNewGroup(false)}>✕</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Group Name</Label>
              <Input placeholder="e.g., Goa 2024, Office Lunch…" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Add Members (emails or phone numbers)</Label>
              <Input placeholder="riya@email.com, +91 9876543210" />
            </div>
            <div className="flex gap-2">
              <Button className="flex-1">
                <UserPlus className="size-4" /> Create Group
              </Button>
              <Button variant="outline" onClick={() => setShowNewGroup(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
