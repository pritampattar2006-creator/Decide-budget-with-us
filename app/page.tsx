import Link from "next/link"
import {
  Wallet,
  Sparkles,
  MessageSquareText,
  Target,
  Receipt,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const features = [
  {
    icon: Sparkles,
    title: "Financial Twin AI",
    desc: "Simulate raises, loans, marriage, and big purchases to see your future net worth before you decide.",
  },
  {
    icon: MessageSquareText,
    title: "AI Financial Coach",
    desc: "Ask 'Can I afford an iPhone?' and get answers grounded in your real income, EMIs, and goals.",
  },
  {
    icon: Receipt,
    title: "Smart Expense Tracking",
    desc: "Add expenses by typing, voice, receipt scan (OCR), or CSV bank import — auto-categorized.",
  },
  {
    icon: Target,
    title: "Goal Planner",
    desc: "Set goals for a laptop, bike, or emergency fund and get a monthly savings plan with success odds.",
  },
  {
    icon: TrendingUp,
    title: "Health Score",
    desc: "A 0–100 financial health score across savings rate, debt, emergency fund, and discipline.",
  },
  {
    icon: ShieldCheck,
    title: "Salary Distribution",
    desc: "Dynamic AI allocation beyond plain 50/30/20, tuned to your persona and lifestyle.",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Wallet className="size-5" />
          </span>
          <span className="text-lg font-semibold">SmartBudget AI</span>
        </div>
        <Button render={<Link href="/dashboard" />}>
          Open App <ArrowRight className="size-4" />
        </Button>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-16 pt-12 text-center md:pt-20">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
          <span className="size-2 rounded-full bg-primary" />
          AI-Powered Financial Operating System
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl text-balance text-4xl font-bold leading-tight tracking-tight md:text-6xl">
          Don&apos;t just track money. Predict your financial future.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
          SmartBudget AI plans your salary, coaches your decisions, and runs a
          digital twin of your finances — so students, professionals, and
          families can build wealth with confidence.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button render={<Link href="/dashboard" />} size="lg">
            Launch Dashboard <ArrowRight className="size-4" />
          </Button>
          <Button
            render={<Link href="/onboarding" />}
            size="lg"
            variant="outline"
          >
            Start onboarding
          </Button>
        </div>

        <div className="mx-auto mt-14 grid max-w-3xl grid-cols-3 gap-4 text-center">
          {[
            { stat: "0–100", label: "Health Score" },
            { stat: "5 yr", label: "Net Worth Forecast" },
            { stat: "22", label: "Money Modules" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
              <p className="text-2xl font-bold text-primary md:text-3xl">{s.stat}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {f.desc}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 text-sm text-muted-foreground sm:flex-row">
          <p>SmartBudget AI — built as a product MVP demo.</p>
          <Link href="/dashboard" className="font-medium text-primary">
            Open the app →
          </Link>
        </div>
      </footer>
    </div>
  )
}
