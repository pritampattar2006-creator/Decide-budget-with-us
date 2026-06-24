"use client"

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { formatCompactINR, formatINR } from "@/lib/finance"

const config = {
  baseline: { label: "Current path", color: "var(--color-chart-4)" },
  scenario: { label: "With change", color: "var(--color-chart-1)" },
} satisfies ChartConfig

export function TwinChart({
  data,
}: {
  data: { year: string; baseline: number; scenario: number }[]
}) {
  return (
    <ChartContainer config={config} className="h-72 w-full">
      <LineChart data={data} margin={{ left: 4, right: 12, top: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="year" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={56}
          tickFormatter={(v) => formatCompactINR(Number(v))}
        />
        <ChartTooltip
          content={<ChartTooltipContent formatter={(v) => formatINR(Number(v))} />}
        />
        <Line
          dataKey="baseline"
          type="monotone"
          stroke="var(--color-chart-4)"
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={false}
        />
        <Line
          dataKey="scenario"
          type="monotone"
          stroke="var(--color-chart-1)"
          strokeWidth={2.5}
          dot={{ r: 3 }}
        />
      </LineChart>
    </ChartContainer>
  )
}
