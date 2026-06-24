"use client"

import { useState } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Send, Sparkles, Bot, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/page-header"
import { useStore } from "@/lib/store"
import { computeHealthScore, totalThisMonth } from "@/lib/finance"
import { emis } from "@/lib/mock-data"

const suggestions = [
  "Can I afford a ₹80,000 iPhone right now?",
  "Should I take a bike loan?",
  "How much can I save each month?",
  "Why am I overspending and how do I fix it?",
]

function messageText(parts: { type: string; text?: string }[] | undefined): string {
  if (!parts) return ""
  return parts
    .filter((p) => p.type === "text")
    .map((p) => p.text ?? "")
    .join("")
}

export default function CoachPage() {
  const { profile, expenses } = useStore()
  const [input, setInput] = useState("")

  const context = {
    name: profile.name,
    persona: profile.persona,
    income: profile.income,
    monthlySpend: totalThisMonth(expenses),
    savings: profile.savings,
    investments: profile.investments,
    loans: profile.loans,
    emiTotal: emis.reduce((s, e) => s + e.emi, 0),
    goals: profile.goals,
    healthScore: computeHealthScore(profile, expenses).score,
  }

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  })

  const busy = status === "streaming" || status === "submitted"

  function send(text: string) {
    if (!text.trim() || busy) return
    sendMessage({ text }, { body: { context } })
    setInput("")
  }

  return (
    <div className="flex h-dvh flex-col p-5 md:p-8">
      <PageHeader
        title="AI Financial Coach"
        description="Ask anything about your money. Answers are grounded in your real income, expenses, EMIs, and goals."
      />

      <div className="mt-6 flex flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-5 text-center">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <Sparkles className="size-7" />
              </span>
              <div>
                <p className="font-semibold">Your money, answered.</p>
                <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                  Tap a question below or type your own. The coach knows your numbers.
                </p>
              </div>
              <div className="grid w-full max-w-lg gap-2 sm:grid-cols-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-xl border border-border bg-background px-4 py-3 text-left text-sm transition-colors hover:border-primary/50 hover:bg-accent"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => {
            const isUser = m.role === "user"
            return (
              <div
                key={m.id}
                className={"flex gap-3 " + (isUser ? "flex-row-reverse" : "")}
              >
                <span
                  className={
                    "flex size-8 shrink-0 items-center justify-center rounded-lg " +
                    (isUser
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-primary text-primary-foreground")
                  }
                >
                  {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
                </span>
                <div
                  className={
                    "max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed " +
                    (isUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground")
                  }
                >
                  {messageText(m.parts) || (
                    <span className="text-muted-foreground">…</span>
                  )}
                </div>
              </div>
            )
          })}

          {status === "submitted" && (
            <div className="flex gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Bot className="size-4" />
              </span>
              <div className="rounded-2xl bg-muted px-4 py-3">
                <span className="flex gap-1">
                  <span className="size-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.3s]" />
                  <span className="size-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.15s]" />
                  <span className="size-2 animate-bounce rounded-full bg-muted-foreground/50" />
                </span>
              </div>
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            send(input)
          }}
          className="flex items-center gap-2 border-t border-border p-4"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your financial coach…"
            disabled={busy}
          />
          <Button type="submit" size="icon" disabled={busy || !input.trim()}>
            <Send className="size-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
