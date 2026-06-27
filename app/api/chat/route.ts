import { type UIMessage } from "ai"

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

// ─── Rich local rule-based AI coach ──────────────────────────────────────────
function generateCoachReply(message: string, ctx: FinanceContext): string {
  const q = message.toLowerCase()
  const disposable = ctx.income - ctx.monthlySpend - ctx.emiTotal
  const savingsRate = ctx.income > 0
    ? Math.round(((ctx.income - ctx.monthlySpend) / ctx.income) * 100)
    : 0

  // 1. iPhone / buying electronics
  if (/iphone|phone|mobile|gadget|laptop|buy|purchase/.test(q)) {
    const item = q.includes("iphone") ? "iPhone" : q.includes("laptop") ? "laptop" : "gadget"
    const cost = q.includes("iphone") ? 80000 : q.includes("laptop") ? 60000 : 40000
    const safeDivisor = Math.max(disposable * 0.5, 1)
    const months = Math.ceil(cost / safeDivisor)
    
    return `📱 **Can you afford the ${item}?**\n\n` +
      `Your current disposable income (income after expenses & EMIs) is **₹${disposable.toLocaleString("en-IN")}/month**.\n\n` +
      `• Estimated cost: **₹${cost.toLocaleString("en-IN")}**\n` +
      `• Savings timeline: If you save 50% of your disposable income, you can buy it in **${months} months** without any debt.\n\n` +
      (disposable > 15000
        ? `✅ **Verdict: Yes** — You can afford this, but avoid credit card EMI. Set up a recurring deposit of ₹${Math.round(cost / months).toLocaleString("en-IN")}/month for ${months} months to buy it with cash!`
        : `⚠️ **Verdict: Wait** — Your monthly disposable income is tight at ₹${disposable.toLocaleString("en-IN")}. It is highly recommended to build your emergency fund to at least 3 months of expenses first before making luxury purchases.`)
  }

  // 2. Loans / EMIs
  if (/loan|emi|borrow|debt/.test(q)) {
    const emiRatio = ctx.income > 0 ? Math.round((ctx.emiTotal / ctx.income) * 100) : 0
    return `🏦 **Loan & Debt Affordability Review**\n\n` +
      `Your current monthly EMI burden is **₹${ctx.emiTotal.toLocaleString("en-IN")}** (${emiRatio}% of your income).\n\n` +
      `• **Safety limit:** A healthy debt-to-income ratio is under **30%**.\n` +
      `• **Remaining capacity:** You have room for about **₹${Math.max(0, Math.round(ctx.income * 0.35 - ctx.emiTotal)).toLocaleString("en-IN")}/month** in additional EMIs before entering the danger zone.\n\n` +
      (emiRatio < 30
        ? `✅ **Verdict: Manageable** — You have some capacity for leverage. However, prefer secured loans (like vehicle/home loans at 8-10%) over high-interest personal loans or credit card debt (15-36%).`
        : `⚠️ **Verdict: High Debt Risk** — Your EMIs already consume ${emiRatio}% of your income. Taking more loans is **not recommended** right now. Try to clear off existing small-ticket loans (snowball method) to free up cash flow.`)
  }

  // 3. Savings / how much to save
  if (/save|saving|how much/.test(q)) {
    const monthlySavings = ctx.income - ctx.monthlySpend
    return `💰 **Your Savings Analysis**\n\n` +
      `Here is your monthly cash flow layout:\n` +
      `• Monthly Income: **₹${ctx.income.toLocaleString("en-IN")}**\n` +
      `• Monthly Expenses: **₹${ctx.monthlySpend.toLocaleString("en-IN")}**\n` +
      `• Monthly EMIs: **₹${ctx.emiTotal.toLocaleString("en-IN")}**\n` +
      `• Net Monthly Savings: **₹${Math.max(0, monthlySavings).toLocaleString("en-IN")}** (${savingsRate}% savings rate)\n\n` +
      (savingsRate >= 20
        ? `✅ **Excellent job!** You are saving ${savingsRate}% of your income. Over a year, this adds up to **₹${(Math.max(0, monthlySavings) * 12).toLocaleString("en-IN")}**. Consider moving half of this into a high-yield SIP.`
        : `⚠️ **Goal:** Target a minimum **20% savings rate** (₹${Math.round(ctx.income * 0.20).toLocaleString("en-IN")}/month). Let's review your discretionary categories (food delivery, subscriptions) to find where you can save ₹3,000 this month.`)
  }

  // 4. Overspending / reduce budget
  if (/overspend|spending too much|budget|reduce|cut cost/.test(q)) {
    const expenseRatio = ctx.income > 0 ? Math.round((ctx.monthlySpend / ctx.income) * 100) : 0
    return `📊 **Spending & Budget Diagnostics**\n\n` +
      `You have spent **₹${ctx.monthlySpend.toLocaleString("en-IN")}** this month, which is **${expenseRatio}%** of your ₹${ctx.income.toLocaleString("en-IN")} income.\n\n` +
      `**Actionable strategy to cut costs for ${ctx.name}:**\n` +
      `1. **The 50/30/20 Rule:** Allocate 50% for Needs, 30% for Wants, and 20% for Savings. Right now, your wants and expenses are slightly elevated.\n` +
      `2. **The 24-Hour Rule:** Wait 24 hours before buying anything over ₹1,000. This eliminates impulse purchases.\n` +
      `3. **Food & Dining:** Food delivery and dining out are often the largest leaks. Cooking 2 more times a week could save you up to **₹2,000/month**.\n` +
      `4. **Subscriptions:** Audit your active subscriptions and pause any that you haven't used in the last 30 days.`
  }

  // 5. Investments / SIP / stock market
  if (/invest|sip|mutual fund|stock|investing|market/.test(q)) {
    const sipAmount = Math.round(Math.max(disposable, 0) * 0.3)
    return `📈 **Investment Recommendation for ${ctx.persona} Mode**\n\n` +
      `Based on your cash flow, you can comfortably start a monthly SIP of **₹${sipAmount.toLocaleString("en-IN")}**.\n\n` +
      `**Recommended Diversified Allocation:**\n` +
      `• **60% (₹${Math.round(sipAmount * 0.6).toLocaleString("en-IN")})** → Large-Cap / Nifty 50 Index Mutual Fund (for stable market-indexed growth)\n` +
      `• **25% (₹${Math.round(sipAmount * 0.25).toLocaleString("en-IN")})** → Mid-cap or Flexi-cap Fund (for higher growth potential)\n` +
      `• **15% (₹${Math.round(sipAmount * 0.15).toLocaleString("en-IN")})** → Liquid Gold or PPF (conservative hedge)\n\n` +
      `🚀 **Growth Projection:** Investing ₹${sipAmount.toLocaleString("en-IN")}/month at a conservative 12% average CAGR will grow to **₹${Math.round(sipAmount * 12 * 5 * 1.35).toLocaleString("en-IN")} in 5 years**!`
  }

  // 6. Tax / ITR / Section 80C
  if (/tax|itr|gst|income tax|80c|elss/.test(q)) {
    return `📑 **Tax Saving Recommendations (Indian Context)**\n\n` +
      `To optimize your tax liabilities and save under Section 80C (up to ₹1.5 Lakhs limit):\n` +
      `• **ELSS Mutual Funds:** Has the shortest lock-in period (3 years) and provides equity growth. Great for young professionals!\n` +
      `• **Public Provident Fund (PPF):** Government-backed risk-free return (currently ~7.1% tax-free) with a 15-year lock-in.\n` +
      `• **National Pension System (NPS):** Offers an additional deduction of up to ₹50,000 under Section 80CCD(1B).\n` +
      `• **Health Insurance:** Save tax under Section 8D on premiums paid for yourself and family.`
  }

  // 7. Credit Cards / CIBIL / credit score
  if (/credit card|credit|card|score|cibil/.test(q)) {
    return `💳 **Credit Card & Credit Score Rules**\n\n` +
      `To maintain a healthy credit (CIBIL) score above **750**:\n` +
      `• **Credit Utilization:** Try to keep your monthly usage below **30%** of your total limit. E.g., if your limit is ₹1 Lakh, spend under ₹30,000.\n" +
      "• **Pay in Full:** Always pay the "Total Amount Due", never just the "Minimum Amount Due" (interest charges are 36-45% annually!).\n` +
      `• **Automatic Payments:** Set up auto-debit for your credit card bill to avoid accidental late fees which damage your score.`
  }

  // 8. Emergency Fund / FD
  if (/emergency|fd|fixed deposit|safety net/.test(q)) {
    const targetFund = ctx.income * 6
    return `🛡️ **Emergency Fund Strategy**\n\n` +
      `An emergency fund keeps you from taking high-interest loans during emergencies (job loss, medical issues).\n\n` +
      `• **Your Target:** **₹${targetFund.toLocaleString("en-IN")}** (equal to 6 months of income/expenses).\n` +
      `• **Where to keep it:** \n` +
      `  - 30% in a liquid bank account (for instant ATM/UPI access)\n` +
      `  - 70% in high-yield Fixed Deposits (FDs) or Liquid Mutual Funds with low/no exit load.`
  }

  // 9. Health score diagnostics
  if (/health score|score|financial health/.test(q)) {
    const emiRatio = ctx.income > 0 ? Math.round((ctx.emiTotal / ctx.income) * 100) : 0
    return `🏥 **Your Financial Health Score: ${ctx.healthScore}/100**\n\n` +
      (ctx.healthScore >= 80 ? "✅ **Excellent!** You're in a great financial position. Maintain this discipline!" :
       ctx.healthScore >= 60 ? "👍 **Good** — stable, but minor leaks exist. Focus on optimizing savings rate." :
       "⚠️ **Needs Work** — Let's build solid foundations. Reduce high-interest debt first.") +
      `\n\n**To improve your health score:**\n` +
      `1. Target an emergency fund of ₹${(ctx.income * 6).toLocaleString("en-IN")}\n` +
      `2. Keep EMI ratio under 30% of income (currently: ${emiRatio}%)\n` +
      `3. Raise your monthly investments to at least 15% of income.`
  }

  // 10. Default message
  const greetings = [
    `👋 Hello ${ctx.name || "there"}! I'm your SmartBudget Personal Finance Coach.`,
    `📊 Hi ${ctx.name || "there"}, let's review your numbers and financial goals.`,
    `💡 Welcome back ${ctx.name || "there"}! Ask me anything about your budget, loans, or investments.`
  ]
  const greeting = greetings[Math.floor(Math.random() * greetings.length)]

  return `${greeting}\n\n` +
    `💼 **Your Financial Overview:**\n` +
    `• Monthly Income: **₹${ctx.income.toLocaleString("en-IN")}**\n` +
    `• Monthly Spend: **₹${ctx.monthlySpend.toLocaleString("en-IN")}**\n` +
    `• Total Savings: **₹${ctx.savings.toLocaleString("en-IN")}** | Investments: **₹${ctx.investments.toLocaleString("en-IN")}**\n` +
    `• Total EMIs: **₹${ctx.emiTotal.toLocaleString("en-IN")}/mo** | Health Score: **${ctx.healthScore}/100**\n\n` +
    `Ask me questions like:\n` +
    `• "Can I afford a ₹80,000 iPhone?"\n` +
    `• "How much can I save monthly?"\n` +
    `• "Should I invest in mutual funds?"\n` +
    `• "What is a good emergency fund size?"\n` +
    `• "How do I save on income tax?"`
}

// ─── Stream reply using AI SDK v6 UIMessage data-stream protocol ─────────────
function streamReply(reply: string): Response {
  const encoder = new TextEncoder()
  const msgId = crypto.randomUUID()

  const lines: Uint8Array[] = []

  // 1. Message start
  lines.push(encoder.encode(`f:${JSON.stringify({ messageId: msgId })}\n`))

  // 2. Text deltas in 6-char chunks
  for (let i = 0; i < reply.length; i += 6) {
    lines.push(encoder.encode(`0:${JSON.stringify(reply.slice(i, i + 6))}\n`))
  }

  // 3. Step finish
  lines.push(encoder.encode(
    `e:${JSON.stringify({ finishReason: "stop", usage: { promptTokens: 0, completionTokens: 0 }, isContinued: false })}\n`
  ))

  // 4. Message finish
  lines.push(encoder.encode(
    `d:${JSON.stringify({ finishReason: "stop", usage: { promptTokens: 0, completionTokens: 0 } })}\n`
  ))

  let idx = 0
  const stream = new ReadableStream({
    async pull(controller) {
      if (idx >= lines.length) {
        controller.close()
        return
      }
      controller.enqueue(lines[idx])
      idx++
      // Typing delay for text chunks only
      if (idx > 1 && idx < lines.length - 2) {
        await new Promise((r) => setTimeout(r, 10))
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Vercel-AI-Data-Stream": "v1",
    },
  })
}

// ─── POST handler (ALWAYS local fallback for privacy, speed and reliability) ──
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const messages: UIMessage[] = body.messages ?? []
    const context: FinanceContext = body.context ?? {
      name: "User",
      persona: "Balanced",
      income: 50000,
      monthlySpend: 25000,
      savings: 20000,
      investments: 10000,
      loans: 0,
      emiTotal: 0,
      goals: [],
      healthScore: 70
    }

    const lastMessage = messages[messages.length - 1]
    const userText =
      lastMessage?.parts?.find((p: { type: string }) => p.type === "text")?.text as string ?? ""

    console.log("[AI Coach] Processing request in local mode for query:", userText)
    const reply = generateCoachReply(userText, context)
    return streamReply(reply)
  } catch (err) {
    console.error("[AI Coach] POST handler error:", err)
    return streamReply("Sorry, I encountered an issue processing that. Please try asking again.")
  }
}
