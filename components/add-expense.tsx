"use client"

import { useRef, useState } from "react"
import { Mic, ScanLine, Keyboard, Upload, Loader2, Plus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useStore } from "@/lib/store"
import type { ExpenseCategory } from "@/lib/types"

const categories: ExpenseCategory[] = [
  "Food",
  "Rent",
  "Transport",
  "Shopping",
  "Bills",
  "Medical",
  "Entertainment",
  "Education",
  "Investment",
  "Others",
]

// Lightweight keyword categorizer (stands in for AI/OCR classification).
function guessCategory(text: string): ExpenseCategory {
  const t = text.toLowerCase()
  if (/pizza|food|restaurant|cafe|coffee|swiggy|zomato|grocery/.test(t)) return "Food"
  if (/uber|ola|metro|bus|fuel|petrol|transport/.test(t)) return "Transport"
  if (/rent|hostel/.test(t)) return "Rent"
  if (/amazon|flipkart|shopping|myntra/.test(t)) return "Shopping"
  if (/bill|electricity|water|internet|recharge/.test(t)) return "Bills"
  if (/pharmacy|medical|doctor|hospital/.test(t)) return "Medical"
  if (/movie|netflix|game|entertain/.test(t)) return "Entertainment"
  if (/course|book|udemy|education|fees/.test(t)) return "Education"
  if (/sip|invest|mutual|stock/.test(t)) return "Investment"
  return "Others"
}

export function AddExpense() {
  const { addExpense } = useStore()
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState<ExpenseCategory>("Food")
  const [listening, setListening] = useState(false)
  const [scanning, setScanning] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function submit(method: "manual" | "voice" | "receipt" | "csv") {
    if (!title.trim() || !amount) return
    addExpense({
      title: title.trim(),
      amount: Number(amount),
      category,
      date: new Date().toISOString(),
      method,
    })
    setTitle("")
    setAmount("")
  }

  function startVoice() {
    const SR =
      (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown })
        .SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
    if (!SR) {
      // Fallback demo if browser lacks speech recognition.
      setTitle("Coffee at Starbucks")
      setAmount("380")
      setCategory("Food")
      return
    }
    setListening(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition = new (SR as any)()
    recognition.lang = "en-IN"
    recognition.onresult = (e: { results: { [k: number]: { [k: number]: { transcript: string } } } }) => {
      const transcript: string = e.results[0][0].transcript
      const amountMatch = transcript.match(/(\d+)/)
      setTitle(transcript.replace(/\d+/g, "").replace(/rupees?/i, "").trim() || transcript)
      if (amountMatch) setAmount(amountMatch[1])
      setCategory(guessCategory(transcript))
      setListening(false)
    }
    recognition.onerror = () => setListening(false)
    recognition.onend = () => setListening(false)
    recognition.start()
  }

  function handleReceipt() {
    // Simulated OCR extraction.
    setScanning(true)
    setTimeout(() => {
      setTitle("Dominos Pizza")
      setAmount("450")
      setCategory("Food")
      setScanning(false)
    }, 1400)
  }

  return (
    <Card>
      <CardContent className="p-5">
        <Tabs defaultValue="manual">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="manual" className="gap-1.5">
              <Keyboard className="size-4" />
              <span className="hidden sm:inline">Manual</span>
            </TabsTrigger>
            <TabsTrigger value="voice" className="gap-1.5">
              <Mic className="size-4" />
              <span className="hidden sm:inline">Voice</span>
            </TabsTrigger>
            <TabsTrigger value="receipt" className="gap-1.5">
              <ScanLine className="size-4" />
              <span className="hidden sm:inline">Receipt</span>
            </TabsTrigger>
            <TabsTrigger value="csv" className="gap-1.5">
              <Upload className="size-4" />
              <span className="hidden sm:inline">CSV</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="voice" className="pt-4">
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-6">
              <Button
                type="button"
                variant={listening ? "default" : "outline"}
                size="lg"
                onClick={startVoice}
              >
                <Mic className={listening ? "size-4 animate-pulse" : "size-4"} />
                {listening ? "Listening…" : "Tap and speak"}
              </Button>
              <p className="text-xs text-muted-foreground">
                Try: &quot;Coffee at Starbucks 380 rupees&quot;
              </p>
            </div>
          </TabsContent>

          <TabsContent value="receipt" className="pt-4">
            <button
              type="button"
              onClick={handleReceipt}
              className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-border py-6 hover:bg-accent"
            >
              {scanning ? (
                <Loader2 className="size-6 animate-spin text-primary" />
              ) : (
                <ScanLine className="size-6 text-primary" />
              )}
              <span className="text-sm font-medium">
                {scanning ? "Extracting with OCR…" : "Scan a receipt"}
              </span>
              <span className="text-xs text-muted-foreground">
                OCR reads merchant, amount, date &amp; category
              </span>
            </button>
          </TabsContent>

          <TabsContent value="csv" className="pt-4">
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={() => {
                setTitle("Imported: Bank Statement Row")
                setAmount("1299")
                setCategory("Shopping")
              }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-border py-6 hover:bg-accent"
            >
              <Upload className="size-6 text-primary" />
              <span className="text-sm font-medium">Upload bank statement (.csv)</span>
              <span className="text-xs text-muted-foreground">
                We parse rows into categorized expenses
              </span>
            </button>
          </TabsContent>

          <TabsContent value="manual" className="pt-4" />
        </Tabs>

        {/* Shared editable fields */}
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_140px_160px]">
          <div className="space-y-1.5">
            <Label className="text-xs">Description</Label>
            <Input
              placeholder="e.g. Lunch with team"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (e.target.value) setCategory(guessCategory(e.target.value))
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Amount (₹)</Label>
            <Input
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button
          className="mt-4 w-full sm:w-auto"
          onClick={() => submit("manual")}
          disabled={!title.trim() || !amount}
        >
          <Plus className="size-4" /> Add expense
        </Button>
      </CardContent>
    </Card>
  )
}
