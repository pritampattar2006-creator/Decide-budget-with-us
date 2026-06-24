"use client"

import { useState } from "react"
import {
  Trash2,
  Mic,
  ScanLine,
  Keyboard,
  Upload,
  Utensils,
  Home,
  Car,
  ShoppingBag,
  Receipt as ReceiptIcon,
  HeartPulse,
  Clapperboard,
  GraduationCap,
  LineChart,
  Boxes,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PageHeader } from "@/components/page-header"
import { AddExpense } from "@/components/add-expense"
import { useStore } from "@/lib/store"
import { formatINR, isSameMonth, totalThisMonth } from "@/lib/finance"
import type { ExpenseCategory } from "@/lib/types"

const categoryIcon: Record<ExpenseCategory, typeof Utensils> = {
  Food: Utensils,
  Rent: Home,
  Transport: Car,
  Shopping: ShoppingBag,
  Bills: ReceiptIcon,
  Medical: HeartPulse,
  Entertainment: Clapperboard,
  Education: GraduationCap,
  Investment: LineChart,
  Others: Boxes,
}

const methodIcon = {
  manual: Keyboard,
  voice: Mic,
  receipt: ScanLine,
  csv: Upload,
}

export default function ExpensesPage() {
  const { expenses, deleteExpense } = useStore()
  const [filter, setFilter] = useState<string>("all")

  const filtered = expenses.filter((e) => filter === "all" || e.category === filter)
  const monthTotal = totalThisMonth(expenses)
  const monthCount = expenses.filter((e) => isSameMonth(e.date)).length

  return (
    <div className="space-y-6 p-5 md:p-8">
      <PageHeader
        title="Expenses"
        description="Add expenses manually, by voice, receipt scan (OCR), or CSV import. Everything is auto-categorized."
        action={
          <div className="rounded-xl border border-border bg-card px-4 py-2 text-right">
            <p className="text-xs text-muted-foreground">This month</p>
            <p className="text-lg font-bold tabular-nums">{formatINR(monthTotal)}</p>
          </div>
        }
      />

      <AddExpense />

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {monthCount} transactions this month
        </p>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {Object.keys(categoryIcon).map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="divide-y divide-border p-0">
          {filtered.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No expenses found.
            </p>
          )}
          {filtered.map((e) => {
            const Icon = categoryIcon[e.category]
            const MethodIcon = methodIcon[e.method]
            return (
              <div key={e.id} className="flex items-center gap-4 p-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{e.title}</p>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{new Date(e.date).toLocaleDateString("en-IN")}</span>
                    <span className="flex items-center gap-1">
                      <MethodIcon className="size-3" /> {e.method}
                    </span>
                  </div>
                </div>
                <Badge variant="secondary" className="hidden sm:inline-flex">
                  {e.category}
                </Badge>
                <span className="font-semibold tabular-nums">{formatINR(e.amount)}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => deleteExpense(e.id)}
                  aria-label="Delete expense"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
