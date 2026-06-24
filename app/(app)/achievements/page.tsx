"use client"

import { useState } from "react"
import {
  Trophy, Star, Flame, Lock, CheckCircle2, Zap, Medal, Crown,
  TrendingUp, Target, Users, Gift, Award, ChevronRight, Sparkles,
  Calendar
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { PageHeader } from "@/components/page-header"
import { achievements, challenges } from "@/lib/mock-data"

const LEVELS = [
  { name: "Rookie Saver", minXP: 0, maxXP: 500, color: "text-gray-500", bg: "bg-gray-500" },
  { name: "Budget Starter", minXP: 500, maxXP: 1000, color: "text-blue-500", bg: "bg-blue-500" },
  { name: "Smart Spender", minXP: 1000, maxXP: 2000, color: "text-purple-500", bg: "bg-purple-500" },
  { name: "Finance Pro", minXP: 2000, maxXP: 5000, color: "text-primary", bg: "bg-primary" },
  { name: "Money Master", minXP: 5000, maxXP: 10000, color: "text-yellow-500", bg: "bg-yellow-500" },
]

const leaderboard = [
  { rank: 1, name: "Priya M.", xp: 4250, streak: 32, avatar: "PM", isYou: false },
  { rank: 2, name: "Rahul K.", xp: 3980, streak: 28, avatar: "RK", isYou: false },
  { rank: 3, name: "You", xp: 3650, streak: 14, avatar: "AS", isYou: true },
  { rank: 4, name: "Neha S.", xp: 3200, streak: 21, avatar: "NS", isYou: false },
  { rank: 5, name: "Amit V.", xp: 2800, streak: 9, avatar: "AV", isYou: false },
]

const weeklyProgress = [
  { day: "Mon", tasks: 3, max: 3 },
  { day: "Tue", tasks: 2, max: 3 },
  { day: "Wed", tasks: 3, max: 3 },
  { day: "Thu", tasks: 1, max: 3 },
  { day: "Fri", tasks: 3, max: 3 },
  { day: "Sat", tasks: 2, max: 3 },
  { day: "Sun", tasks: 0, max: 3 },
]

const dailyTasks = [
  { id: "dt1", task: "Log today's expenses", xp: 10, done: true },
  { id: "dt2", task: "Check your budget limit", xp: 5, done: true },
  { id: "dt3", task: "Review one investment", xp: 15, done: false },
]

export default function AchievementsPage() {
  const [activeTab, setActiveTab] = useState<"badges" | "leaderboard" | "daily">("badges")
  const [completedTasks, setCompletedTasks] = useState<string[]>(dailyTasks.filter((t) => t.done).map((t) => t.id))

  const earned = achievements.filter((a) => a.earned)
  const locked = achievements.filter((a) => !a.earned)
  const totalPoints = earned.reduce((s, a) => s + a.points, 0) + 2250 // extra mock XP
  const streak = 14

  const currentLevel = LEVELS.findLast((l) => totalPoints >= l.minXP) ?? LEVELS[0]
  const nextLevel = LEVELS[LEVELS.indexOf(currentLevel) + 1]
  const levelProgress = nextLevel
    ? Math.round(((totalPoints - currentLevel.minXP) / (nextLevel.minXP - currentLevel.minXP)) * 100)
    : 100

  return (
    <div className="space-y-6 p-5 md:p-8">
      <PageHeader
        title="Achievements & Gamification"
        description="Earn XP, unlock badges, complete challenges, and climb the leaderboard by building smart money habits."
        action={
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2">
            <Sparkles className="size-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Level</p>
              <p className={`text-sm font-bold ${currentLevel.color}`}>{currentLevel.name}</p>
            </div>
          </div>
        }
      />

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex items-center gap-4 p-5">
            <span className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Trophy className="size-6" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">Badges Earned</p>
              <p className="text-2xl font-bold">{earned.length} / {achievements.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <span className="flex size-12 items-center justify-center rounded-xl bg-orange-500 text-white">
              <Flame className="size-6" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">Current Streak</p>
              <p className="text-2xl font-bold">{streak} days 🔥</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <span className="flex size-12 items-center justify-center rounded-xl bg-yellow-500 text-white">
              <Star className="size-6" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">Total XP</p>
              <p className="text-2xl font-bold">{totalPoints.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <span className="flex size-12 items-center justify-center rounded-xl bg-purple-500 text-white">
              <Medal className="size-6" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">Leaderboard Rank</p>
              <p className="text-2xl font-bold">#3 of 247</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/30">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-bold text-lg">{currentLevel.name}</p>
              <p className="text-sm text-muted-foreground">{totalPoints.toLocaleString()} XP total</p>
            </div>
            {nextLevel && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Next level</p>
                <p className={`font-bold ${nextLevel.color}`}>{nextLevel.name}</p>
                <p className="text-xs text-muted-foreground">{(nextLevel.minXP - totalPoints).toLocaleString()} XP away</p>
              </div>
            )}
          </div>
          <Progress value={levelProgress} className="h-3" />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>{currentLevel.minXP.toLocaleString()} XP</span>
            {nextLevel && <span>{nextLevel.minXP.toLocaleString()} XP</span>}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-muted p-1">
        {(["badges", "leaderboard", "daily"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium capitalize transition-all ${
              activeTab === tab
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "badges" ? "🏅 Badges" : tab === "leaderboard" ? "👑 Leaderboard" : "📅 Daily"}
          </button>
        ))}
      </div>

      {/* Badges Tab */}
      {activeTab === "badges" && (
        <div className="space-y-4">
          {/* Active Challenges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="size-5 text-primary" /> Active Challenges
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {challenges.map((ch) => (
                <div key={ch.id} className="rounded-xl border border-border p-4 hover:border-primary/30 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold">{ch.title}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{ch.desc}</p>
                    </div>
                    <Badge variant="secondary" className="shrink-0 ml-3">+{ch.reward} XP</Badge>
                  </div>
                  <div className="mt-3">
                    <div className="mb-1.5 flex justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium text-primary">{ch.progress}% · {ch.daysLeft}d left</span>
                    </div>
                    <Progress value={ch.progress} className="h-2" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Earned Badges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-primary" /> Earned Badges ({earned.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {earned.map((a) => (
                  <div key={a.id} className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 hover:border-primary/40 transition-colors">
                    <span className="mt-0.5 text-3xl">{a.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{a.title}</p>
                        <Badge variant="default" className="text-[10px]">+{a.points} XP</Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{a.desc}</p>
                      {a.earnedDate && (
                        <p className="mt-1 flex items-center gap-1 text-xs font-medium text-primary">
                          <Calendar className="size-3" />
                          {new Date(a.earnedDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Locked Badges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="size-5 text-muted-foreground" /> Locked Badges ({locked.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {locked.map((a) => (
                  <div key={a.id} className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-4 opacity-60 hover:opacity-80 transition-opacity">
                    <span className="mt-0.5 text-3xl grayscale">{a.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{a.title}</p>
                        <Badge variant="outline" className="text-[10px]">+{a.points} XP</Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{a.desc}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <Lock className="size-3" /> Keep going to unlock
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === "leaderboard" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="size-5 text-yellow-500" /> Community Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border p-0">
              {leaderboard.map((player) => (
                <div
                  key={player.rank}
                  className={`flex items-center gap-4 px-5 py-4 ${
                    player.isYou ? "bg-primary/5 border-l-4 border-l-primary" : ""
                  }`}
                >
                  <div className="flex w-8 shrink-0 justify-center">
                    {player.rank === 1 ? (
                      <span className="text-xl">🥇</span>
                    ) : player.rank === 2 ? (
                      <span className="text-xl">🥈</span>
                    ) : player.rank === 3 ? (
                      <span className="text-xl">🥉</span>
                    ) : (
                      <span className="text-lg font-bold text-muted-foreground">#{player.rank}</span>
                    )}
                  </div>
                  <span className={`flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
                    player.isYou ? "bg-primary" : "bg-muted-foreground"
                  }`}>
                    {player.avatar}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{player.name}</p>
                      {player.isYou && <Badge variant="default" className="text-[10px]">You</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Flame className="size-3 text-orange-500" /> {player.streak} day streak
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold tabular-nums text-primary">{player.xp.toLocaleString()} XP</p>
                    <div className="mt-1 w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${(player.xp / leaderboard[0].xp) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-accent/30">
            <CardContent className="flex items-start gap-3 p-5">
              <TrendingUp className="mt-0.5 size-5 shrink-0 text-primary" />
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">You're ranked #3!</span> Complete 3 more challenges this week to overtake Rahul and claim the #2 spot.
                Maintaining your 14-day streak gives you +25 bonus XP per day.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Daily Tab */}
      {activeTab === "daily" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="size-5 text-primary" /> Daily Tasks
                <Badge variant="secondary" className="ml-auto">{completedTasks.length}/{dailyTasks.length} done</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {dailyTasks.map((task) => {
                const done = completedTasks.includes(task.id)
                return (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between rounded-xl border p-4 transition-all ${
                      done ? "border-primary/30 bg-primary/5 opacity-70" : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {done ? (
                        <CheckCircle2 className="size-5 shrink-0 text-primary" />
                      ) : (
                        <div className="size-5 shrink-0 rounded-full border-2 border-muted-foreground" />
                      )}
                      <p className={`font-medium ${done ? "line-through text-muted-foreground" : ""}`}>{task.task}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={done ? "secondary" : "outline"}>+{task.xp} XP</Badge>
                      {!done && (
                        <Button size="sm" onClick={() => setCompletedTasks((p) => [...p, task.id])}>
                          Done
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Weekly Heatmap */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="size-5 text-primary" /> This Week's Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                {weeklyProgress.map((day) => {
                  const ratio = day.tasks / day.max
                  return (
                    <div key={day.day} className="flex flex-1 flex-col items-center gap-2">
                      <div className="relative h-16 w-full rounded-lg overflow-hidden bg-muted">
                        <div
                          className="absolute bottom-0 left-0 right-0 bg-primary rounded-lg transition-all"
                          style={{ height: `${ratio * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">{day.day}</p>
                      <p className="text-xs font-medium tabular-nums">{day.tasks}/{day.max}</p>
                    </div>
                  )
                })}
              </div>
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <div className="size-3 rounded-sm bg-primary" />
                <span>Tasks completed per day (3 max)</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-500/20 bg-orange-50/50 dark:bg-orange-500/5">
            <CardContent className="flex items-start gap-3 p-5">
              <Flame className="mt-0.5 size-5 shrink-0 text-orange-500" />
              <div>
                <p className="font-semibold">🔥 {streak}-Day Streak!</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  You've logged expenses for {streak} consecutive days. Complete today's tasks to keep your streak alive and earn 25 bonus XP tonight!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
