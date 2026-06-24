"use client"

import { useState } from "react"
import { Plus, Target, TrendingUp, CalendarClock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/page-header"
import { useStore } from "@/lib/store"
import {
  formatINR,
  goalProgress,
  goalSuccessProbability,
} from "@/lib/finance"

function monthsUntil(deadline: string) {
  return Math.max(
    1,
    Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)),
  )
}

export default function GoalsPage() {
  const { goals, addGoal, contributeToGoal } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [target, setTarget] = useState("")
  const [months, setMonths] = useState("12")

  function create() {
    const t = Number(target)
    const m = Number(months) || 12
    if (!name.trim() || !t) return
    const deadline = new Date()
    deadline.setMonth(deadline.getMonth() + m)
    addGoal({
      name: name.trim(),
      target: t,
      saved: 0,
      monthlyContribution: Math.ceil(t / m),
      deadline: deadline.toISOString(),
    })
    setName("")
    setTarget("")
    setMonths("12")
    setShowForm(false)
  }

  return (
    <div className="space-y-6 p-5 md:p-8">
      <PageHeader
        title="Savings Goals"
        description="Set targets and let the planner calculate the monthly savings needed, completion date, and success probability."
        action={
          <Button onClick={() => setShowForm((v) => !v)}>
            <Plus className="size-4" /> New goal
          </Button>
        }
      />

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create a goal</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-[1fr_160px_140px_auto] sm:items-end">
            <div className="space-y-1.5">
              <Label className="text-xs">Goal name</Label>
              <Input
                placeholder="e.g. New iPhone"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Target (₹)</Label>
              <Input
                type="number"
                placeholder="80000"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Months</Label>
              <Input
                type="number"
                value={months}
                onChange={(e) => setMonths(e.target.value)}
              />
            </div>
            <Button onClick={create}>Add</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {goals.map((g) => {
          const progress = goalProgress(g)
          const probability = goalSuccessProbability(g)
          const remaining = Math.max(0, g.target - g.saved)
          const m = monthsUntil(g.deadline)
          const needed = Math.ceil(remaining / m)
          return (
            <Card key={g.id}>
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                      <Target className="size-5" />
                    </span>
                    <div>
                      <p className="font-semibold">{g.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatINR(g.saved)} of {formatINR(g.target)}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={probability >= 70 ? "default" : "secondary"}
                    className="gap-1"
                  >
                    <TrendingUp className="size-3" /> {probability}%
                  </Badge>
                </div>

                <div>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2.5" />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-muted p-2.5">
                    <p className="text-xs text-muted-foreground">Need / mo</p>
                    <p className="text-sm font-semibold tabular-nums">
                      {formatINR(needed)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted p-2.5">
                    <p className="text-xs text-muted-foreground">Remaining</p>
                    <p className="text-sm font-semibold tabular-nums">
                      {formatINR(remaining)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted p-2.5">
                    <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <CalendarClock className="size-3" /> Left
                    </p>
                    <p className="text-sm font-semibold">{m} mo</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => contributeToGoal(g.id, g.monthlyContribution)}
                  >
                    + {formatINR(g.monthlyContribution)}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => contributeToGoal(g.id, 1000)}
                  >
                    + {formatINR(1000)}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
