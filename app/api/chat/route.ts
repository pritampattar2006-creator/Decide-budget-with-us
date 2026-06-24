import { convertToModelMessages, streamText, stepCountIs, type UIMessage } from "ai"

export const maxDuration = 30

interface FinanceContext {
  name: string
  persona: string
  income: number
  monthlySpend: number
  savings: number
  investments: number
  loans: number
  emiTotal: number
  goals: string[]
  healthScore: number
}

// Smart rule-based AI coach fallback (works without any API key)
function generateCoachReply(message: string, ctx: FinanceContext): string {
  const q = message.toLowerCase()
  const disposable = ctx.income - ctx.monthlySpend - ctx.emiTotal
  const savingsRate = Math.round(((ctx.income - ctx.monthlySpend) / ctx.income) * 100)

  if (/iphone|phone|mobile|gadget|laptop|buy/.test(q)) {
    const item = q.includes("iphone") ? "iPhone" : q.includes("laptop") ? "laptop" : "gadget"
    const cost = q.includes("iphone") ? 80000 : q.includes("laptop") ? 60000 : 40000
    const months = Math.ceil(cost / (disposable * 0.5))
    return `📱 **Can you afford the ${item}?**\n\nYour current disposable income after EMIs is **₹${disposable.toLocaleString("en-IN")}/month**.\n\n` +
      `At your savings rate, you could save for this in **${months} months** without debt.\n\n` +
      (disposable > 15000
        ? `✅ **Verdict: Yes** — but buy it from savings, not a credit card or EMI. Set aside ₹${Math.round(cost / months).toLocaleString("en-IN")}/month for ${months} months.`
        : `⚠️ **Verdict: Wait** — your disposable income is tight at ₹${disposable.toLocaleString("en-IN")}. Build your emergency fund first, then plan this purchase.`)
  }

  if (/loan|emi|borrow/.test(q)) {
    const emiRatio = Math.round((ctx.emiTotal / ctx.income) * 100)
    return `🏦 **Should you take a loan?**\n\nYour current EMI burden: **₹${ctx.emiTotal.toLocaleString("en-IN")}/month** (${emiRatio}% of income).\n\n` +
      (emiRatio < 30
        ? `✅ **You can afford a small loan.** Lenders recommend keeping EMIs below 40% of income. You have room for ~₹${Math.round((ctx.income * 0.40 - ctx.emiTotal)).toLocaleString("en-IN")} more in EMIs.\n\nAlways compare interest rates: secured loans (home/bike) are cheaper (8–12%) vs personal loans (14–24%).`
        : `⚠️ **Caution advised.** Your EMIs already consume ${emiRatio}% of income. Taking more debt risks financial stress. Try to prepay existing loans first.`)
  }

  if (/save|saving|how much/.test(q)) {
    const monthlySavings = ctx.income - ctx.monthlySpend
    return `💰 **Your Savings Analysis**\n\n` +
      `- Monthly income: **₹${ctx.income.toLocaleString("en-IN")}**\n` +
      `- Monthly spend: **₹${ctx.monthlySpend.toLocaleString("en-IN")}**\n` +
      `- EMIs: **₹${ctx.emiTotal.toLocaleString("en-IN")}**\n` +
      `- Actual savings: **₹${Math.max(0, monthlySavings).toLocaleString("en-IN")}/month** (${savingsRate}%)\n\n` +
      (savingsRate >= 20
        ? `✅ Great savings rate! At this rate, you save **₹${(Math.max(0, monthlySavings) * 12).toLocaleString("en-IN")} per year**.\nNext step: invest at least 50% of savings in index funds.`
        : `⚠️ Target 20% savings rate. You need to save **₹${Math.round(ctx.income * 0.20).toLocaleString("en-IN")}/month**. Try reducing dining and entertainment by 15%.`)
  }

  if (/overspend|spending too much|budget|reduce/.test(q)) {
    return `📊 **Spending Analysis for ${ctx.name}**\n\n` +
      `You're spending **₹${ctx.monthlySpend.toLocaleString("en-IN")}** this month — that's **${Math.round((ctx.monthlySpend / ctx.income) * 100)}%** of your ₹${ctx.income.toLocaleString("en-IN")} income.\n\n` +
      `**Top areas to cut:**\n` +
      `1. 🍕 Food delivery — cook 3x/week more, save ~₹1,500/month\n` +
      `2. 📱 Review subscriptions — cancel unused ones (check /subscriptions)\n` +
      `3. 🛍️ Apply 24-hour rule before any purchase over ₹500\n\n` +
      `Your health score is **${ctx.healthScore}/100**. Getting above 75 should be your goal.`
  }

  if (/invest|sip|mutual fund|stock/.test(q)) {
    const sipAmount = Math.round(disposable * 0.3)
    return `📈 **Investment Advice for ${ctx.persona}**\n\n` +
      `With ₹${disposable.toLocaleString("en-IN")} disposable income, you can invest **₹${sipAmount.toLocaleString("en-IN")}/month** in SIPs.\n\n` +
      `**Recommended allocation:**\n` +
      `- 60% → Nifty 50 Index Fund (low cost, market returns)\n` +
      `- 25% → Flexi-cap Mutual Fund (diversified growth)\n` +
      `- 15% → Digital Gold (inflation hedge)\n\n` +
      `₹${sipAmount.toLocaleString("en-IN")}/month at 12% CAGR = **₹${Math.round(sipAmount * 12 * 5 * 1.35).toLocaleString("en-IN")} in 5 years** 🚀`
  }

  if (/health score|score|financial health/.test(q)) {
    return `🏥 **Your Financial Health Score: ${ctx.healthScore}/100**\n\n` +
      (ctx.healthScore >= 80 ? "✅ **Excellent!** You're in the top financial health tier.\n\n" :
       ctx.healthScore >= 60 ? "👍 **Good** — some room to improve.\n\n" :
       "⚠️ **Needs Work** — focus on the basics first.\n\n") +
      `**To improve your score:**\n` +
      `1. Build emergency fund to ₹${(ctx.income * 6).toLocaleString("en-IN")} (6 months)\n` +
      `2. Keep EMIs below 40% of income (yours: ${Math.round((ctx.emiTotal / ctx.income) * 100)}%)\n` +
      `3. Invest at least 15% of income monthly\n` +
      `4. Maintain savings rate above 20%`
  }

  // Default helpful response
  return `👋 Hi ${ctx.name}! I'm your SmartBudget AI Coach.\n\n` +
    `📊 **Your snapshot:**\n` +
    `- Income: ₹${ctx.income.toLocaleString("en-IN")}/mo | Spent: ₹${ctx.monthlySpend.toLocaleString("en-IN")}/mo\n` +
    `- Savings rate: ${savingsRate}% | Health score: ${ctx.healthScore}/100\n` +
    `- Goals: ${ctx.goals.join(", ") || "not set yet"}\n\n` +
    `Ask me anything like:\n` +
    `• "Can I afford an iPhone?"\n` +
    `• "Should I take a bike loan?"\n` +
    `• "Why am I overspending?"\n` +
    `• "How much can I invest?"`
}

// Stream text character by character for a realistic typing effect
function streamFallbackReply(reply: string): Response {
  const encoder = new TextEncoder()
  let pos = 0
  const stream = new ReadableStream({
    async pull(controller) {
      if (pos >= reply.length) {
        controller.close()
        return
      }
      const chunk = reply.slice(pos, pos + 4)
      pos += 4
      // Vercel AI SDK UIMessage stream format
      controller.enqueue(encoder.encode(`0:${JSON.stringify(chunk)}\n`))
      await new Promise((r) => setTimeout(r, 15))
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Vercel-AI-Data-Stream": "v1",
    },
  })
}

export async function POST(req: Request) {
  const { messages, context }: { messages: UIMessage[]; context: FinanceContext } = await req.json()

  const lastMessage = messages[messages.length - 1]
  const userText = lastMessage?.parts?.find((p: { type: string }) => p.type === "text")?.text as string ?? ""

  // Try real AI first if env variable is set
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    try {
      const { google } = await import("@ai-sdk/google")
      const system = `You are SmartBudget AI's Financial Coach for an Indian user. All money is in INR (₹).
Be warm, concise, and specific. Use the user's real numbers below.
When they ask "can I afford X" or "should I take a loan", do the math, give a clear yes/no/wait verdict. Use bullet points.

User context:
- Name: ${context?.name}, Persona: ${context?.persona}
- Income: ₹${context?.income}/mo, Spent this month: ₹${context?.monthlySpend}
- Savings: ₹${context?.savings}, Investments: ₹${context?.investments}
- Loans: ₹${context?.loans}, EMIs: ₹${context?.emiTotal}/mo
- Goals: ${context?.goals?.join(", ") || "none"}, Health score: ${context?.healthScore}/100`

      const result = streamText({
        model: google("gemini-1.5-flash"),
        system,
        messages: await convertToModelMessages(messages),
        stopWhen: stepCountIs(3),
      })
      return result.toUIMessageStreamResponse()
    } catch {}
  }

  // Smart local fallback — works with zero API key
  const reply = generateCoachReply(userText, context)
  return streamFallbackReply(reply)
}
