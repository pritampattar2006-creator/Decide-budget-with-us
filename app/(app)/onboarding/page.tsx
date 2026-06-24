"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Loader2, Sparkles, ArrowRight, ArrowLeft,
  CheckCircle2, Plus, Trash2, Home, Building2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { PageHeader } from "@/components/page-header"
import { useStore } from "@/lib/store"
import { formatINR } from "@/lib/finance"
import { generateOnboardingPlan, type OnboardingPlan } from "@/app/actions/ai"
import type { UserProfile } from "@/lib/types"

const personas: UserProfile["persona"][] = [
  "Student", "Fresher", "Professional", "Family", "Freelancer",
]

const goalOptions = [
  "Emergency Fund", "Buy a Laptop", "Buy a Bike",
  "Higher Education", "Buy a House", "Travel", "Retirement",
]

interface EMIEntry {
  id: string
  name: string
  amount: string
  dueDate: string
}

const STEPS = ["Basics", "Housing", "Finances", "EMIs", "Goals", "Your Plan"]

export default function OnboardingPage() {
  const router = useRouter()
  const { profile, completeOnboarding } = useStore()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState<OnboardingPlan | null>(null)

  // Basic info
  const [form, setForm] = useState({
    name: profile.name,
    persona: profile.persona,
    income: String(profile.income),
    occupation: profile.occupation,
    age: String(profile.age),
    maritalStatus: profile.maritalStatus,
    familyMembers: String(profile.familyMembers),
    loans: String(profile.loans),
    savings: String(profile.savings),
    investments: String(profile.investments),
    goals: profile.goals,
  })

  // Housing
  const [housingType, setHousingType] = useState<"Own" | "Rent">("Rent")
  const [rentAmount, setRentAmount] = useState("")

  // EMIs
  const [emis, setEmis] = useState<EMIEntry[]>([])
  const [emiForm, setEmiForm] = useState({ name: "", amount: "", dueDate: "" })

  // Custom goal
  const [customGoal, setCustomGoal] = useState("")

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function toggleGoal(goal: string) {
    setForm((f) => ({
      ...f,
      goals: f.goals.includes(goal)
        ? f.goals.filter((g) => g !== goal)
        : [...f.goals, goal],
    }))
  }

  function addCustomGoal() {
    const g = customGoal.trim()
    if (!g || form.goals.includes(g)) return
    setForm((f) => ({ ...f, goals: [...f.goals, g] }))
    setCustomGoal("")
  }

  function addEMI() {
    if (!emiForm.name.trim() || !emiForm.amount) return
    setEmis((prev) => [...prev, { id: Date.now().toString(), ...emiForm }])
    setEmiForm({ name: "", amount: "", dueDate: "" })
  }

  function removeEMI(id: string) {
    setEmis((prev) => prev.filter((e) => e.id !== id))
  }

  const totalEMI = emis.reduce((s, e) => s + (Number(e.amount) || 0), 0)
  const totalLoans = Number(form.loans) || 0

  const profilePayload: Partial<UserProfile> = {
    name: form.name,
    persona: form.persona,
    income: Number(form.income) || 0,
    occupation: form.occupation,
    age: Number(form.age) || 0,
    maritalStatus: form.maritalStatus,
    familyMembers: Number(form.familyMembers) || 1,
    loans: totalLoans + totalEMI * 12,
    savings: Number(form.savings) || 0,
    investments: Number(form.investments) || 0,
    goals: form.goals,
  }

  async function handleGenerate() {
    setLoading(true)
    try {
      const result = await generateOnboardingPlan({
        ...profilePayload,
        // inject housing and EMI context into prompt
        occupation: `${form.occupation} | Housing: ${housingType}${housingType === "Rent" ? ` (₹${rentAmount}/mo)` : ""} | EMIs: ${emis.length > 0 ? emis.map((e) => `${e.name} ₹${e.amount}`).join(", ") : "None"}`,
      })
      setPlan(result)
      setStep(5)
    } catch {
      setPlan(null)
      setStep(5)
    } finally {
      setLoading(false)
    }
  }

  function finish() {
    completeOnboarding(profilePayload)
    router.push("/dashboard")
  }

  const TOTAL_STEPS = STEPS.length

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-5 md:p-8">
      <PageHeader
        title="Smart AI Onboarding"
        description="Tell us about your finances and our AI will generate a personalized budget, savings plan, and risk profile."
      />

      {/* Step indicator */}
      <div className="flex items-center gap-1 overflow-x-auto">
        {STEPS.map((s, i) => (
          <div key={s} className="flex flex-1 items-center gap-1">
            <div
              className={
                "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold " +
                (i < step
                  ? "bg-primary text-primary-foreground"
                  : i === step
                  ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                  : "bg-muted text-muted-foreground")
              }
            >
              {i < step ? <CheckCircle2 className="size-4" /> : i + 1}
            </div>
            <span className="hidden text-xs font-medium sm:block text-muted-foreground whitespace-nowrap">{s}</span>
            {i < STEPS.length - 1 && <div className="h-px flex-1 bg-border" />}
          </div>
        ))}
      </div>

      <Card>
        {/* ── STEP 0: Basics ───────────────────────────────────────────── */}
        {step === 0 && (
          <>
            <CardHeader>
              <CardTitle>About you</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Full name</Label>
                <Input value={form.name} onChange={(e) => update("name", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Persona</Label>
                <Select value={form.persona} onValueChange={(v) => update("persona", v as UserProfile["persona"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {personas.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Occupation</Label>
                <Input value={form.occupation} onChange={(e) => update("occupation", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Age</Label>
                <Input type="number" value={form.age} onChange={(e) => update("age", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Marital status</Label>
                <Select value={form.maritalStatus} onValueChange={(v) => update("maritalStatus", v as UserProfile["maritalStatus"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Single">Single</SelectItem>
                    <SelectItem value="Married">Married</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Family members</Label>
                <Input type="number" value={form.familyMembers} onChange={(e) => update("familyMembers", e.target.value)} />
              </div>
            </CardContent>
          </>
        )}

        {/* ── STEP 1: Housing ─────────────────────────────────────────── */}
        {step === 1 && (
          <>
            <CardHeader>
              <CardTitle>Your housing situation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setHousingType("Rent")}
                  className={
                    "flex flex-col items-center gap-3 rounded-2xl border-2 p-6 transition-all " +
                    (housingType === "Rent"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-accent")
                  }
                >
                  <span className={`flex size-14 items-center justify-center rounded-xl ${housingType === "Rent" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    <Building2 className="size-7" />
                  </span>
                  <div>
                    <p className="font-semibold">Renting</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">I pay monthly rent</p>
                  </div>
                  {housingType === "Rent" && <CheckCircle2 className="size-5 text-primary" />}
                </button>

                <button
                  type="button"
                  onClick={() => setHousingType("Own")}
                  className={
                    "flex flex-col items-center gap-3 rounded-2xl border-2 p-6 transition-all " +
                    (housingType === "Own"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-accent")
                  }
                >
                  <span className={`flex size-14 items-center justify-center rounded-xl ${housingType === "Own" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    <Home className="size-7" />
                  </span>
                  <div>
                    <p className="font-semibold">Own House</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">I own my home</p>
                  </div>
                  {housingType === "Own" && <CheckCircle2 className="size-5 text-primary" />}
                </button>
              </div>

              {housingType === "Rent" && (
                <div className="space-y-2">
                  <Label>Monthly Rent Amount (₹)</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 8000"
                    value={rentAmount}
                    onChange={(e) => setRentAmount(e.target.value)}
                  />
                  {rentAmount && (
                    <p className="text-xs text-muted-foreground">
                      Annual rent: <span className="font-semibold text-foreground">{formatINR(Number(rentAmount) * 12)}</span>
                    </p>
                  )}
                </div>
              )}

              {housingType === "Own" && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <p className="text-sm text-muted-foreground">
                    🏠 Great! If you have a home loan EMI, add it in the <span className="font-semibold text-foreground">EMI step</span> next. Your budget will automatically account for it.
                  </p>
                </div>
              )}
            </CardContent>
          </>
        )}

        {/* ── STEP 2: Finances ─────────────────────────────────────────── */}
        {step === 2 && (
          <>
            <CardHeader>
              <CardTitle>Your finances (monthly / totals in ₹)</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Monthly income</Label>
                <Input type="number" value={form.income} onChange={(e) => update("income", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Outstanding loans (total ₹)</Label>
                <Input type="number" value={form.loans} onChange={(e) => update("loans", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Current savings</Label>
                <Input type="number" value={form.savings} onChange={(e) => update("savings", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Current investments</Label>
                <Input type="number" value={form.investments} onChange={(e) => update("investments", e.target.value)} />
              </div>
            </CardContent>
          </>
        )}

        {/* ── STEP 3: EMIs ──────────────────────────────────────────────── */}
        {step === 3 && (
          <>
            <CardHeader>
              <CardTitle>Your EMIs & Loan Repayments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Add EMI form */}
              <div className="rounded-xl border border-border p-4 space-y-3">
                <p className="text-sm font-medium">Add an EMI</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Loan / EMI Name</Label>
                    <Input
                      placeholder="e.g. Bike Loan"
                      value={emiForm.name}
                      onChange={(e) => setEmiForm((f) => ({ ...f, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Monthly EMI (₹)</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 3200"
                      value={emiForm.amount}
                      onChange={(e) => setEmiForm((f) => ({ ...f, amount: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Due Date (day of month)</Label>
                    <Input
                      type="number"
                      min={1} max={31}
                      placeholder="e.g. 5"
                      value={emiForm.dueDate}
                      onChange={(e) => setEmiForm((f) => ({ ...f, dueDate: e.target.value }))}
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={addEMI}
                  disabled={!emiForm.name.trim() || !emiForm.amount}
                >
                  <Plus className="size-4" /> Add EMI
                </Button>
              </div>

              {/* EMI List */}
              {emis.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Added EMIs</p>
                  {emis.map((emi) => (
                    <div
                      key={emi.id}
                      className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3"
                    >
                      <div>
                        <p className="font-medium">{emi.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatINR(Number(emi.amount))}/month
                          {emi.dueDate ? ` · Due on ${emi.dueDate}${emi.dueDate === "1" ? "st" : emi.dueDate === "2" ? "nd" : emi.dueDate === "3" ? "rd" : "th"}` : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeEMI(emi.id)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5">
                    <p className="text-sm font-semibold">Total EMI / month</p>
                    <p className="font-bold text-primary tabular-nums">{formatINR(totalEMI)}</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border p-6 text-center">
                  <p className="text-sm text-muted-foreground">No EMIs added. If you have no active loans, skip to the next step.</p>
                </div>
              )}
            </CardContent>
          </>
        )}

        {/* ── STEP 4: Goals ─────────────────────────────────────────────── */}
        {step === 4 && (
          <>
            <CardHeader>
              <CardTitle>What are you saving for?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex flex-wrap gap-2">
                {goalOptions.map((g) => {
                  const active = form.goals.includes(g)
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => toggleGoal(g)}
                      className={
                        "rounded-full border px-4 py-2 text-sm font-medium transition-colors " +
                        (active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card hover:bg-accent")
                      }
                    >
                      {g}
                    </button>
                  )
                })}
              </div>

              {/* Other / custom goal */}
              <div className="rounded-xl border border-border p-4 space-y-3">
                <p className="text-sm font-medium">✏️ Add your own goal</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. Wedding, New PC, Family Trip..."
                    value={customGoal}
                    onChange={(e) => setCustomGoal(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addCustomGoal()}
                  />
                  <Button type="button" size="sm" onClick={addCustomGoal} disabled={!customGoal.trim()}>
                    <Plus className="size-4" /> Add
                  </Button>
                </div>
              </div>

              {/* Show custom goals added */}
              {form.goals.filter((g) => !goalOptions.includes(g)).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <p className="w-full text-xs text-muted-foreground font-medium">Your custom goals:</p>
                  {form.goals.filter((g) => !goalOptions.includes(g)).map((g) => (
                    <span
                      key={g}
                      className="flex items-center gap-1.5 rounded-full border border-primary bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium"
                    >
                      {g}
                      <button type="button" onClick={() => toggleGoal(g)} className="opacity-70 hover:opacity-100">✕</button>
                    </span>
                  ))}
                </div>
              )}

              {form.goals.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Selected: <span className="font-medium text-foreground">{form.goals.join(", ")}</span>
                </p>
              )}
            </CardContent>
          </>
        )}

        {/* ── STEP 5: AI Plan ───────────────────────────────────────────── */}
        {step === 5 && (
          <>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="size-5 text-primary" /> Your AI-generated plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {plan ? (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{plan.riskProfile} risk</Badge>
                    <Badge variant="secondary">Save {formatINR(plan.savingsTarget)}/mo</Badge>
                    {housingType === "Rent" && rentAmount && (
                      <Badge variant="outline">Rent: {formatINR(Number(rentAmount))}/mo</Badge>
                    )}
                    {totalEMI > 0 && (
                      <Badge variant="outline">EMIs: {formatINR(totalEMI)}/mo</Badge>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{plan.summary}</p>
                  <div>
                    <p className="mb-2 text-sm font-semibold">Recommended budget</p>
                    <div className="space-y-2">
                      {/* Inject rent into plan display */}
                      {housingType === "Rent" && rentAmount && (
                        <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm">
                          <span className="text-muted-foreground">🏠 Rent</span>
                          <span className="font-medium tabular-nums">{formatINR(Number(rentAmount))}</span>
                        </div>
                      )}
                      {/* Inject EMIs into plan display */}
                      {emis.map((e) => (
                        <div key={e.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                          <span className="text-muted-foreground">💳 {e.name} EMI</span>
                          <span className="font-medium tabular-nums">{formatINR(Number(e.amount))}</span>
                        </div>
                      ))}
                      {plan.budgetPlan.map((b) => (
                        <div key={b.category} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                          <span className="text-muted-foreground">{b.category}</span>
                          <span className="font-medium tabular-nums">{formatINR(b.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-semibold">Tips</p>
                    <ul className="space-y-1.5">
                      {plan.tips.map((t, i) => (
                        <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" /> {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  We couldn&apos;t generate a plan right now, but your profile is saved.
                  You can explore your dashboard and try the AI Coach.
                </p>
              )}
            </CardContent>
          </>
        )}
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          disabled={step === 0 || loading}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
        >
          <ArrowLeft className="size-4" /> Back
        </Button>

        {step < 4 && (
          <Button onClick={() => setStep((s) => s + 1)}>
            Continue <ArrowRight className="size-4" />
          </Button>
        )}
        {step === 4 && (
          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? (
              <><Loader2 className="size-4 animate-spin" /> Generating plan…</>
            ) : (
              <><Sparkles className="size-4" /> Generate AI plan</>
            )}
          </Button>
        )}
        {step === 5 && (
          <Button onClick={finish}>
            Go to dashboard <ArrowRight className="size-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
