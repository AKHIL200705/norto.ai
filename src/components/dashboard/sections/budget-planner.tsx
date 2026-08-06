'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import {
  Wallet, TrendingUp, TrendingDown, Lightbulb, ArrowRight,
  ShieldCheck, PiggyBank, Loader2, Sparkles, IndianRupee, Gauge,
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface Analysis {
  score: number
  emergencyFund: number
  status: 'Excellent' | 'Good' | 'Tight' | 'Risky'
  insights: string[]
  alternatives: string[]
}

interface BudgetResult {
  totals: {
    totalExpenses: number
    remaining: number
    savingsRate: number
  }
  analysis: Analysis | null
  raw?: string
}

const DEFAULTS = {
  salary: 25000,
  rent: 8000,
  food: 4000,
  transport: 1500,
  utilities: 1200,
  entertainment: 1500,
  shopping: 1800,
}

const FIELDS: { key: keyof typeof DEFAULTS; label: string; icon: React.ElementType }[] = [
  { key: 'salary', label: 'Monthly Salary', icon: IndianRupee },
  { key: 'rent', label: 'Rent', icon: Wallet },
  { key: 'food', label: 'Food & Groceries', icon: Wallet },
  { key: 'transport', label: 'Transport', icon: Wallet },
  { key: 'utilities', label: 'Utilities', icon: Wallet },
  { key: 'entertainment', label: 'Entertainment', icon: Wallet },
  { key: 'shopping', label: 'Shopping', icon: Wallet },
]

const PIE_COLORS = ['#10b981', '#f59e0b', '#f43f5e', '#14b8a6', '#fb923c', '#a855f7']
const BAR_COLORS = ['#10b981', '#f59e0b', '#f43f5e', '#14b8a6', '#fb923c', '#a855f7']

async function api(path: string, opts: { method?: string; body?: any } = {}) {
  const res = await fetch(path, {
    method: opts.method || 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  })
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Request failed')
  return res.json()
}

function fmtINR(n: number) {
  return `₹${Math.round(n).toLocaleString('en-IN')}`
}

function GaugeCircle({ value }: { value: number }) {
  const radius = 56
  const circ = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(100, value))
  const offset = circ - (clamped / 100) * circ
  const color =
    clamped >= 75 ? '#10b981' : clamped >= 50 ? '#f59e0b' : clamped >= 30 ? '#fb923c' : '#f43f5e'
  const status = clamped >= 75 ? 'Healthy' : clamped >= 50 ? 'Fair' : clamped >= 30 ? 'Tight' : 'Risky'
  return (
    <div className="relative size-40 mx-auto">
      <svg className="size-full -rotate-90" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="currentColor" strokeWidth="10" className="text-muted/30" />
        <motion.circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tracking-tight" style={{ color }}>
          {Math.round(clamped)}
        </span>
        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
          / 100
        </span>
        <Badge
          variant="secondary"
          className="mt-1 text-[10px] border-0"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {status}
        </Badge>
      </div>
    </div>
  )
}

export function BudgetPlanner() {
  const city = useAppStore((s) => s.city)
  const [values, setValues] = React.useState<Record<keyof typeof DEFAULTS, number>>(DEFAULTS)
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<BudgetResult | null>(null)

  const setField = (key: keyof typeof DEFAULTS, v: number) =>
    setValues((prev) => ({ ...prev, [key]: isNaN(v) ? 0 : v }))

  const handleAnalyze = async () => {
    setLoading(true)
    try {
      const data = await api('/api/ai/budget', {
        body: {
          salary: values.salary,
          rent: values.rent,
          food: values.food,
          transport: values.transport,
          utilities: values.utilities,
          entertainment: values.entertainment,
          shopping: values.shopping,
          city,
        },
      })
      setResult(data)
      toast.success('Budget analyzed!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to analyze budget')
    } finally {
      setLoading(false)
    }
  }

  // Local quick totals for live preview
  const liveTotal =
    values.rent + values.food + values.transport + values.utilities + values.entertainment + values.shopping
  const liveRemaining = values.salary - liveTotal
  const liveSavings = values.salary > 0 ? (liveRemaining / values.salary) * 100 : 0

  const chartData = [
    { name: 'Rent', value: values.rent },
    { name: 'Food', value: values.food },
    { name: 'Transport', value: values.transport },
    { name: 'Utilities', value: values.utilities },
    { name: 'Entertainment', value: values.entertainment },
    { name: 'Shopping', value: values.shopping },
  ].filter((d) => d.value > 0)

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
          <Wallet className="size-5 text-emerald-600" />
          Budget Planner
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Plan your monthly budget for <span className="font-medium text-foreground">{city}</span> and get AI-powered insights
        </p>
      </div>

      <div className="grid lg:grid-cols-[420px_1fr] gap-4 lg:gap-6">
        {/* Input form */}
        <Card className="p-5 sm:p-6 gap-0 h-fit lg:sticky lg:top-20">
          <div className="flex items-center gap-2 mb-4">
            <div className="size-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Wallet className="size-4 text-white" />
            </div>
            <h2 className="font-semibold text-sm">Your monthly finances</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {FIELDS.map((f) => {
              const Icon = f.icon
              const isSalary = f.key === 'salary'
              return (
                <div key={f.key} className={cn('flex flex-col gap-1.5', isSalary && 'col-span-2')}>
                  <Label htmlFor={f.key} className="text-xs text-muted-foreground">
                    {f.label}
                  </Label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                      ₹
                    </span>
                    <Input
                      id={f.key}
                      type="number"
                      inputMode="numeric"
                      min={0}
                      value={values[f.key] === 0 ? '' : values[f.key]}
                      onChange={(e) => setField(f.key, Number(e.target.value))}
                      className={cn(
                        'pl-7',
                        isSalary && 'border-emerald-500/30 bg-emerald-500/5 focus-visible:border-emerald-500/60'
                      )}
                      placeholder="0"
                    />
                    <Icon className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/60" />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Live preview */}
          <div className="mt-4 rounded-xl bg-muted/40 p-3 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total</p>
              <p className="text-sm font-bold">{fmtINR(liveTotal)}</p>
            </div>
            <div className="border-x">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Left</p>
              <p className={cn('text-sm font-bold', liveRemaining >= 0 ? 'text-emerald-600' : 'text-rose-600')}>
                {fmtINR(liveRemaining)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Save %</p>
              <p className={cn(
                'text-sm font-bold',
                liveSavings >= 20 ? 'text-emerald-600' : liveSavings >= 10 ? 'text-amber-500' : 'text-rose-600'
              )}>
                {liveSavings.toFixed(0)}%
              </p>
            </div>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={loading}
            className="mt-4 w-full bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md h-10"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                Analyze Budget
              </>
            )}
          </Button>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            AI will score your budget & suggest savings
          </p>
        </Card>

        {/* Results */}
        <div className="flex flex-col gap-4 min-w-0">
          {!result && !loading && (
            <Card className="p-10 text-center border-dashed">
              <div className="size-14 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500/15 to-amber-400/15 flex items-center justify-center">
                <Wallet className="size-7 text-emerald-600" />
              </div>
              <h3 className="mt-4 font-semibold">Your analysis will appear here</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                Fill in your monthly income & expenses, then hit <span className="font-medium text-foreground">Analyze Budget</span> for a full AI breakdown.
              </p>
            </Card>
          )}

          {loading && (
            <>
              <div className="grid sm:grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-4 gap-0">
                    <Skeleton className="h-3 w-20 mb-2" />
                    <Skeleton className="h-7 w-24" />
                  </Card>
                ))}
              </div>
              <Card className="p-6 gap-0">
                <Skeleton className="h-4 w-32 mb-4" />
                <div className="grid lg:grid-cols-2 gap-4">
                  <Skeleton className="h-64 w-full" />
                  <Skeleton className="h-64 w-full" />
                </div>
              </Card>
              <Card className="p-6 gap-0">
                <Skeleton className="h-4 w-40 mb-3" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </Card>
            </>
          )}

          {result && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col gap-4 min-w-0"
            >
              {/* Summary cards */}
              <div className="grid sm:grid-cols-3 gap-3">
                <Card className="p-4 gap-0">
                  <div className="flex items-center gap-2">
                    <div className="size-7 rounded-md bg-amber-500/10 flex items-center justify-center">
                      <Wallet className="size-3.5 text-amber-500" />
                    </div>
                    <span className="text-xs text-muted-foreground">Total Expenses</span>
                  </div>
                  <p className="mt-2 text-2xl font-bold tracking-tight">{fmtINR(result.totals.totalExpenses)}</p>
                </Card>
                <Card className="p-4 gap-0">
                  <div className="flex items-center gap-2">
                    <div className="size-7 rounded-md bg-emerald-500/10 flex items-center justify-center">
                      <PiggyBank className="size-3.5 text-emerald-600" />
                    </div>
                    <span className="text-xs text-muted-foreground">Remaining</span>
                  </div>
                  <p className={cn(
                    'mt-2 text-2xl font-bold tracking-tight',
                    result.totals.remaining >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  )}>
                    {fmtINR(result.totals.remaining)}
                  </p>
                </Card>
                <Card className="p-4 gap-0">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'size-7 rounded-md flex items-center justify-center',
                      result.totals.savingsRate >= 20 ? 'bg-emerald-500/10' :
                      result.totals.savingsRate >= 10 ? 'bg-amber-500/10' : 'bg-rose-500/10'
                    )}>
                      <TrendingUp className={cn(
                        'size-3.5',
                        result.totals.savingsRate >= 20 ? 'text-emerald-600' :
                        result.totals.savingsRate >= 10 ? 'text-amber-500' : 'text-rose-600'
                      )} />
                    </div>
                    <span className="text-xs text-muted-foreground">Savings Rate</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <p className={cn(
                      'text-2xl font-bold tracking-tight',
                      result.totals.savingsRate >= 20 ? 'text-emerald-600' :
                      result.totals.savingsRate >= 10 ? 'text-amber-500' : 'text-rose-600'
                    )}>
                      {result.totals.savingsRate.toFixed(1)}%
                    </p>
                    {result.analysis && (
                      <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-0">
                        {result.analysis.status}
                      </Badge>
                    )}
                  </div>
                </Card>
              </div>

              {/* Charts row */}
              {chartData.length > 0 && (
                <div className="grid lg:grid-cols-2 gap-4">
                  <Card className="p-5 gap-0">
                    <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                      <PieChart className="size-4 text-emerald-600" />
                      Expense Breakdown
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={85}
                            paddingAngle={3}
                          >
                            {chartData.map((_, i) => (
                              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(v: any) => fmtINR(Number(v || 0))}
                            contentStyle={{
                              borderRadius: '0.5rem',
                              border: '1px solid var(--border)',
                              background: 'var(--popover)',
                              color: 'var(--popover-foreground)',
                              fontSize: '12px',
                            }}
                          />
                          <Legend
                            iconType="circle"
                            iconSize={8}
                            wrapperStyle={{ fontSize: '11px' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  <Card className="p-5 gap-0">
                    <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                      <BarChart className="size-4 text-amber-500" />
                      Spend by Category
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 4, left: -16 }}>
                          <XAxis
                            dataKey="name"
                            tick={{ fontSize: 10, fill: 'currentColor' }}
                            className="text-muted-foreground"
                            tickLine={false}
                            axisLine={false}
                            interval={0}
                            angle={-15}
                            textAnchor="end"
                            height={50}
                          />
                          <YAxis
                            tick={{ fontSize: 10, fill: 'currentColor' }}
                            className="text-muted-foreground"
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(v: number) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                          />
                          <Tooltip
                            formatter={(v: any) => fmtINR(Number(v || 0))}
                            cursor={{ fill: 'var(--accent)', opacity: 0.3 }}
                            contentStyle={{
                              borderRadius: '0.5rem',
                              border: '1px solid var(--border)',
                              background: 'var(--popover)',
                              color: 'var(--popover-foreground)',
                              fontSize: '12px',
                            }}
                          />
                          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                            {chartData.map((_, i) => (
                              <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </div>
              )}

              {/* AI analysis */}
              {result.analysis && (
                <>
                  <div className="grid lg:grid-cols-3 gap-4">
                    {/* AI Score gauge */}
                    <Card className="p-5 gap-0 lg:col-span-1">
                      <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <Gauge className="size-4 text-emerald-600" />
                        AI Financial Score
                      </h3>
                      <GaugeCircle value={result.analysis.score} />
                      <p className="text-xs text-muted-foreground text-center mt-3">
                        Based on your savings rate, expense mix, and city benchmarks
                      </p>
                    </Card>

                    {/* Emergency Fund */}
                    <Card className="p-5 gap-0 lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-emerald-500/5 via-amber-400/5 to-transparent border-emerald-500/20">
                      <div className="absolute -right-10 -top-10 size-32 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />
                      <div className="relative">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="size-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
                            <ShieldCheck className="size-4 text-white" />
                          </div>
                          <h3 className="font-semibold text-sm">Recommended Emergency Fund</h3>
                        </div>
                        <p className="text-4xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent">
                          {fmtINR(result.analysis.emergencyFund)}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1.5">
                          ≈ 3 months of expenses kept aside for unexpected situations in {city}
                        </p>
                        <div className="mt-4 grid grid-cols-3 gap-2">
                          {[
                            { label: '1 month', value: result.totals.totalExpenses },
                            { label: '3 months', value: result.analysis.emergencyFund },
                            { label: '6 months', value: result.totals.totalExpenses * 6 },
                          ].map((m) => (
                            <div key={m.label} className="rounded-lg bg-background/60 backdrop-blur p-2 text-center border">
                              <p className="text-[10px] text-muted-foreground">{m.label}</p>
                              <p className="text-xs font-semibold mt-0.5">{fmtINR(m.value)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Insights */}
                  <Card className="p-5 gap-0">
                    <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                      <Lightbulb className="size-4 text-amber-500" />
                      AI Insights
                      <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-400 border-0 ml-auto">
                        {result.analysis.insights.length} tips
                      </Badge>
                    </h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {result.analysis.insights.map((insight, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.08 }}
                          className="rounded-xl border bg-gradient-to-br from-amber-500/5 to-transparent p-3"
                        >
                          <div className="flex items-start gap-2">
                            <div className="size-6 rounded-md bg-amber-500/15 flex items-center justify-center shrink-0">
                              <Lightbulb className="size-3.5 text-amber-500" />
                            </div>
                            <p className="text-xs leading-relaxed text-foreground/90">{insight}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </Card>

                  {/* Better alternatives */}
                  <Card className="p-5 gap-0">
                    <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                      <TrendingDown className="size-4 text-emerald-600" />
                      Better Alternatives
                      <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-0 ml-auto">
                        {result.analysis.alternatives.length} ideas
                      </Badge>
                    </h3>
                    <div className="flex flex-col gap-2">
                      {result.analysis.alternatives.map((alt, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08 }}
                          className="flex items-center gap-3 rounded-xl border bg-gradient-to-r from-emerald-500/5 to-transparent p-3 hover:border-emerald-500/30 transition-colors group"
                        >
                          <div className="size-7 rounded-md bg-emerald-500/15 flex items-center justify-center shrink-0">
                            <ArrowRight className="size-3.5 text-emerald-600" />
                          </div>
                          <p className="text-sm flex-1">{alt}</p>
                          <TrendingDown className="size-4 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </motion.div>
                      ))}
                    </div>
                  </Card>
                </>
              )}

              {/* Fallback: raw text if analysis null */}
              {result.analysis === null && result.raw && (
                <Card className="p-5 gap-0">
                  <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <Sparkles className="size-4 text-emerald-600" />
                    AI Analysis (raw)
                  </h3>
                  <pre className="text-xs font-mono whitespace-pre-wrap bg-muted/40 p-3 rounded-lg overflow-x-auto max-h-80 overflow-y-auto">
                    {result.raw}
                  </pre>
                </Card>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
