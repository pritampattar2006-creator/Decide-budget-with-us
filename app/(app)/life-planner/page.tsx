"use client"

import { useState } from "react"
import {
  GraduationCap,
  Loader2,
  TrendingUp,
  Target,
  BookOpen,
  CheckCircle2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/page-header"
import { useStore } from "@/lib/store"
import { formatINR } from "@/lib/finance"
import { simulateLifePlanner, type LifePlannerResult } from "@/app/actions/ai"

const popularSkills = [
  "AI Cloud Data Analytics",
  "Full Stack Web Development",
  "Product Management",
  "Digital Marketing",
  "UI/UX Design",
]

export default function LifePlannerPage() {
  const { profile } = useStore()
  const [skills, setSkills] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<LifePlannerResult | null>(null)
  const [error, setError] = useState(false)

  async function run(text: string) {
    if (!text.trim() || loading) return
    setLoading(true)
    setError(false)
    setResult(null)
    try {
      const r = await simulateLifePlanner(profile, text)
      setResult(r)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-5 md:p-8">
      <PageHeader
        title="Life Planner AI"
        description="Project your career growth. Input skills or certifications you want to learn, and see your realistic salary progression and a step-by-step roadmap."
        action={
          <div className="rounded-xl border border-border bg-card px-4 py-2 text-right">
            <p className="text-xs text-muted-foreground">Current Salary</p>
            <p className="text-lg font-bold tabular-nums">
              {formatINR(profile.income)}
              <span className="text-xs font-normal text-muted-foreground">/mo</span>
            </p>
          </div>
        }
      />

      <Card>
        <CardContent className="space-y-4 p-5">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              run(skills)
            }}
            className="flex flex-col gap-2 sm:flex-row"
          >
            <Input
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="What do you want to learn? e.g. 'AWS Cloud Certification'"
            />
            <Button type="submit" disabled={loading || !skills.trim()}>
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Analyzing…
                </>
              ) : (
                <>
                  <GraduationCap className="size-4" /> Generate Plan
                </>
              )}
            </Button>
          </form>
          <div className="flex flex-wrap gap-2">
            {popularSkills.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setSkills(s)
                  run(s)
                }}
                disabled={loading}
                className="rounded-full border border-border bg-background px-3 py-1.5 text-xs transition-colors hover:border-primary/50 hover:bg-accent disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {loading && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Mapping your career trajectory…
            </p>
          </CardContent>
        </Card>
      )}

      {error && !loading && (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            The simulation couldn&apos;t run right now. Please try again.
          </CardContent>
        </Card>
      )}

      {result && !loading && (
        <div className="space-y-4">
          <Card className="border-primary/30 bg-accent/40">
            <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <Target className="mt-0.5 size-6 shrink-0 text-primary" />
                <div>
                  <p className="text-lg font-semibold text-balance">
                    {result.headline}
                  </p>
                  <Badge variant="default" className="mt-2">
                    In {result.timeframe}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">Projected Salary</p>
                <div className="flex items-baseline gap-2">
                  <p className="mt-1 text-2xl font-bold tabular-nums text-primary">
                    {formatINR(result.projectedSalary)}
                  </p>
                  <span className="text-sm font-medium text-muted-foreground">/mo</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">Salary Growth</p>
                <p className="mt-1 flex items-center gap-1.5 text-2xl font-bold tabular-nums text-green-500">
                  <TrendingUp className="size-5" /> +{result.growthRate}%
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="size-5 text-primary" /> Recommended Path
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {result.recommendedCourses.map((course, i) => (
                    <li key={i} className="flex gap-2.5 text-sm">
                      <span className="mt-0.5 size-4 shrink-0 rounded-full bg-accent flex items-center justify-center text-primary font-bold text-[10px]">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed font-medium">
                        {course}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="size-5 text-primary" /> Milestones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 border-l-2 border-border ml-2 pl-4 pb-2">
                  {result.milestones.map((milestone, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-[21px] top-1 size-2.5 rounded-full bg-primary ring-4 ring-background" />
                      <p className="text-xs font-semibold text-primary">
                        Month {milestone.month}
                      </p>
                      <p className="font-medium text-sm mt-0.5">{milestone.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {milestone.impact}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
