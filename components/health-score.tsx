"use client"

import { Progress } from "@/components/ui/progress"
import type { HealthBreakdown } from "@/lib/finance"

function scoreLabel(score: number) {
  if (score >= 80) return { label: "Excellent", color: "var(--color-chart-1)" }
  if (score >= 60) return { label: "Good", color: "var(--color-chart-2)" }
  if (score >= 40) return { label: "Fair", color: "var(--color-chart-4)" }
  return { label: "Needs Work", color: "var(--color-destructive)" }
}

export function HealthScore({ breakdown }: { breakdown: HealthBreakdown }) {
  const { score, parts } = breakdown
  const { label, color } = scoreLabel(score)
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
      <div className="relative flex size-44 shrink-0 items-center justify-center">
        <svg className="size-44 -rotate-90" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="var(--color-muted)"
            strokeWidth="12"
          />
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-4xl font-bold">{score}</span>
          <span className="text-xs text-muted-foreground">out of 100</span>
          <span
            className="mt-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
            style={{ backgroundColor: `${color}22`, color }}
          >
            {label}
          </span>
        </div>
      </div>

      <div className="w-full flex-1 space-y-3.5">
        {parts.map((p) => (
          <div key={p.label}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{p.label}</span>
              <span className="font-medium tabular-nums">
                {p.value}/{p.max}
              </span>
            </div>
            <Progress value={(p.value / p.max) * 100} className="h-2" />
          </div>
        ))}
      </div>
    </div>
  )
}
