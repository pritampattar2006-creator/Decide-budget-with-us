"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { formatCompactINR, formatINR } from "@/lib/finance"

const trendConfig = {
  income: { label: "Income", color: "var(--color-chart-3)" },
  expense: { label: "Expense", color: "var(--color-chart-4)" },
  savings: { label: "Savings", color: "var(--color-chart-1)" },
} satisfies ChartConfig

export function TrendChart({
  data,
}: {
  data: { month: string; income: number; expense: number; savings: number }[]
}) {
  return (
    <ChartContainer config={trendConfig} className="h-64 w-full">
      <AreaChart data={data} margin={{ left: 4, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="fillSavings" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.4} />
            <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="fillExpense" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-chart-4)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--color-chart-4)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={48}
          tickFormatter={(v) => formatCompactINR(Number(v))}
        />
        <ChartTooltip
          content={<ChartTooltipContent formatter={(v) => formatINR(Number(v))} />}
        />
        <Area
          dataKey="expense"
          type="monotone"
          fill="url(#fillExpense)"
          stroke="var(--color-chart-4)"
          strokeWidth={2}
        />
        <Area
          dataKey="savings"
          type="monotone"
          fill="url(#fillSavings)"
          stroke="var(--color-chart-1)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  )
}

export function CategoryPie({
  data,
}: {
  data: { category: string; amount: number }[]
}) {
  const palette = [
    "var(--color-chart-1)",
    "var(--color-chart-2)",
    "var(--color-chart-3)",
    "var(--color-chart-4)",
    "var(--color-chart-5)",
  ]
  const config = data.reduce((acc, d, i) => {
    acc[d.category] = { label: d.category, color: palette[i % palette.length] }
    return acc
  }, {} as ChartConfig)

  return (
    <ChartContainer config={config} className="mx-auto aspect-square h-56">
      <PieChart>
        <ChartTooltip
          content={<ChartTooltipContent formatter={(v) => formatINR(Number(v))} />}
        />
        <Pie data={data} dataKey="amount" nameKey="category" innerRadius={55} strokeWidth={3}>
          {data.map((_, i) => (
            <Cell key={i} fill={palette[i % palette.length]} />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}

export function CategoryHeatmap({
  months,
  rows,
}: {
  months: string[]
  rows: { category: string; values: number[] }[]
}) {
  const maxValue = Math.max(0, ...rows.flatMap((row) => row.values))

  return (
    <div className="overflow-auto rounded-3xl border border-border bg-card p-4">
      <div className="grid grid-cols-[minmax(170px,_1fr)_repeat(6,minmax(100px,_1fr))] gap-2 text-sm">
        <div className="py-2 font-semibold text-muted-foreground">Category</div>
        {months.map((month) => (
          <div key={month} className="py-2 text-right font-semibold text-muted-foreground">
            {month}
          </div>
        ))}

        {rows.map((row) => (
          <div key={row.category} className="contents">
            <div className="rounded-2xl bg-muted/80 px-3 py-3 font-medium">
              {row.category}
            </div>
            {row.values.map((value, index) => {
              const intensity = maxValue ? value / maxValue : 0
              const background = `rgba(59, 130, 246, ${Math.max(0.08, intensity * 0.5)})`
              const foreground = intensity > 0.4 ? "text-white" : "text-foreground"
              return (
                <div
                  key={`${row.category}-${index}`}
                  className={`rounded-2xl px-3 py-3 text-right ${foreground}`}
                  style={{ background }}
                >
                  {value > 0 ? formatINR(value) : "-"}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
