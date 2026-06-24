"use client"

import { useState } from "react"
import {
  Sparkles,
  Loader2,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Lightbulb,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/page-header"
import { TwinChart } from "@/components/twin-chart"
import { useStore } from "@/lib/store"
import { formatINR } from "@/lib/finance"
import { simulateFinancialTwin, type TwinResult } from "@/app/actions/ai"

const scenarios = [
  "My salary increases by ₹10,000 per month",
  "I take a ₹8 lakh home loan over 10 years",
  "I get married in 2 years",
  "I buy a car worth ₹9 lakh on EMI",
  "I start a ₹5,000/month SIP in equity",
  "I do an upskilling course and switch to a ₹60,000 job",
]

const verdictStyle = {
  Recommended: { icon: CheckCircle2, className: "text-primary", badge: "default" as const },
  "Proceed with caution": {
    icon: AlertTriangle,
    className: "text-chart-4",
    badge: "secondary" as const,
  },
  "Not advisable": {
    icon: XCircle,
    className: "text-destructive",
    badge: "destructive" as const,
  },
}

export default function TwinPage() {
  const { profile } = useStore()
  const [scenario, setScenario] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TwinResult | null>(null)
  const [error, setError] = useState(false)

  async function run(text: string) {
    if (!text.trim() || loading) return
    setLoading(true)
    setError(false)
    setResult(null)
    try {
      const r = await simulateFinancialTwin(profile, text)
      setResult(r)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const currentNetWorth = profile.savings + profile.investments - profile.loans
  const Verdict = result ? verdictStyle[result.verdict] : null

  return (
    <div className="space-y-6 p-5 md:p-8">
      <PageHeader
        title="Financial Twin & Life Planner"
        description="Your digital financial clone. Simulate a major life or money decision and see how it reshapes your net worth over the next 5 years."
        action={
          <div className="rounded-xl border border-border bg-card px-4 py-2 text-right">
            <p className="text-xs text-muted-foreground">Current net worth</p>
            <p className="text-lg font-bold tabular-nums">
              {formatINR(currentNetWorth)}
            </p>
          </div>
        }
      />

      <Card>
        <CardContent className="space-y-4 p-5">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              run(scenario)
            }}
            className="flex flex-col gap-2 sm:flex-row"
          >
            <Input
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              placeholder="Describe a decision, e.g. 'I take a ₹5 lakh bike loan'"
            />
            <Button type="submit" disabled={loading || !scenario.trim()}>
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Simulating…
                </>
              ) : (
                <>
                  <Sparkles className="size-4" /> Simulate
                </>
              )}
            </Button>
          </form>
          <div className="flex flex-wrap gap-2">
            {scenarios.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setScenario(s)
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
              Your Financial Twin is running the projection…
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

      {result && !loading && Verdict && (
        <div className="space-y-4">
          <Card className="border-primary/30 bg-accent/40">
            <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <Verdict.icon className={"mt-0.5 size-6 shrink-0 " + Verdict.className} />
                <div>
                  <p className="text-lg font-semibold text-balance">
                    {result.headline}
                  </p>
                  <Badge variant={Verdict.badge} className="mt-2">
                    {result.verdict}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">Projected net worth (5 yr)</p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-primary">
                  {formatINR(result.netWorth5yr)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">Monthly savings after change</p>
                <p className="mt-1 text-2xl font-bold tabular-nums">
                  {formatINR(result.monthlySavingsAfter)}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Net worth: current path vs with change</CardTitle>
              <Badge variant="secondary" className="gap-1">
                <TrendingUp className="size-3" /> 5-year forecast
              </Badge>
            </CardHeader>
            <CardContent>
              <TwinChart data={result.yearly} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="size-5 text-primary" /> Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2.5">
                {result.insights.map((insight, i) => (
                  <li key={i} className="flex gap-2.5 text-sm">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    <span className="leading-relaxed text-muted-foreground">
                      {insight}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
