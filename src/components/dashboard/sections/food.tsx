'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  UtensilsCrossed, Star, MapPin, Bookmark, Loader2, Sparkles,
  Shuffle, Leaf, IndianRupee, ShoppingBag, Utensils, Dices,
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

async function api(path: string, opts: { method?: string; body?: unknown } = {}) {
  const res = await fetch(path, {
    method: opts.method || 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  })
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Request failed')
  return res.json()
}

interface FoodItem {
  name: string
  type: string
  price: string
  rating: number
  distance: string
  description: string
  veg: boolean
}

type Meal = 'All' | 'Breakfast' | 'Lunch' | 'Dinner' | 'Street Food' | 'Healthy'
type Preference = 'All' | 'Veg' | 'Non-Veg'
type Budget = 'All' | 'Budget' | 'Premium'

const MEALS: Meal[] = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Street Food', 'Healthy']
const PREFERENCES: Preference[] = ['All', 'Veg', 'Non-Veg']
const BUDGETS: Budget[] = ['All', 'Budget', 'Premium']

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
}

export function FoodView() {
  const city = useAppStore((s) => s.city)
  const setSection = useAppStore((s) => s.setSection)

  const [meal, setMeal] = React.useState<Meal>('All')
  const [pref, setPref] = React.useState<Preference>('All')
  const [budget, setBudget] = React.useState<Budget>('All')
  const [foods, setFoods] = React.useState<FoodItem[]>([])
  const [raw, setRaw] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [hasSearched, setHasSearched] = React.useState(false)
  const [savingIdx, setSavingIdx] = React.useState<number | null>(null)

  const recommend = React.useCallback(async (opts?: { meal?: Meal; pref?: Preference; budget?: Budget }) => {
    const m = opts?.meal ?? meal
    const p = opts?.pref ?? pref
    const b = opts?.budget ?? budget
    setLoading(true)
    setHasSearched(true)
    setFoods([])
    setRaw(null)
    try {
      const json = await api('/api/ai/food', {
        body: {
          city,
          meal: m === 'All' ? undefined : m,
          preference: p === 'All' ? undefined : p,
          budget: b === 'All' ? undefined : b,
        },
      })
      setFoods(json.foods || [])
      setRaw(json.raw || null)
      if ((json.foods || []).length === 0 && !json.raw) {
        toast.error('No food recommendations found. Try different filters.')
      } else if ((json.foods || []).length > 0) {
        toast.success(`Found ${(json.foods || []).length} recommendations`)
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to fetch recommendations')
    } finally {
      setLoading(false)
    }
  }, [city, meal, pref, budget])

  const surpriseMe = () => {
    const m = MEALS[1 + Math.floor(Math.random() * (MEALS.length - 1))]
    const p = PREFERENCES[1 + Math.floor(Math.random() * (PREFERENCES.length - 1))]
    const b = BUDGETS[Math.floor(Math.random() * BUDGETS.length)]
    setMeal(m); setPref(p); setBudget(b)
    recommend({ meal: m, pref: p, budget: b })
  }

  const handleSave = async (f: FoodItem, idx: number) => {
    setSavingIdx(idx)
    try {
      await api('/api/places', {
        body: {
          name: f.name,
          category: 'restaurant',
          rating: f.rating,
          price: f.price,
          distance: f.distance,
          notes: `${f.type} — ${f.description}`,
        },
      })
      toast.success(`Saved ${f.name}`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSavingIdx(null)
    }
  }

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-6">
        {/* Header */}
        <motion.div variants={item}>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Utensils className="size-3.5 text-amber-500" />
            <span>AI-curated food picks in {city}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Food Recommendations</h1>
            <Button variant="outline" size="sm" onClick={surpriseMe} disabled={loading}>
              <Dices className="size-4 text-amber-500" />
              <span className="hidden sm:inline">Surprise me</span>
            </Button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div variants={item}>
          <Card className="p-4 sm:p-5 gap-0">
            <div className="grid sm:grid-cols-3 gap-4">
              <FilterGroup label="Meal" icon={Utensils} options={MEALS} value={meal} onChange={(v) => setMeal(v as Meal)} />
              <FilterGroup label="Preference" icon={Leaf} options={PREFERENCES} value={pref} onChange={(v) => setPref(v as Preference)} />
              <FilterGroup label="Budget" icon={IndianRupee} options={BUDGETS} value={budget} onChange={(v) => setBudget(v as Budget)} />
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={() => recommend()} disabled={loading}>
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                Recommend Food
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Loading skeletons */}
        {loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !hasSearched && (
          <motion.div variants={item}>
            <Card className="p-10 sm:p-14 flex flex-col items-center text-center gap-4 border-dashed border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 via-amber-500/5 to-transparent">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 120, damping: 12 }}
                className="size-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-xl shadow-amber-500/20"
              >
                <UtensilsCrossed className="size-10 text-white" />
              </motion.div>
              <div>
                <h3 className="text-lg font-semibold">Hungry? Let&apos;s find your next meal</h3>
                <p className="text-sm text-muted-foreground mt-1.5 max-w-md">
                  Get personalized food recommendations across {city}. Filter by meal time, preference, and budget — then tap &quot;Recommend Food&quot; to let our AI curate the best picks.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                <Button onClick={() => recommend()}>
                  <Sparkles className="size-4" />
                  Get personalized recommendations
                </Button>
                <Button variant="outline" onClick={surpriseMe}>
                  <Shuffle className="size-4" />
                  Surprise me
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* No results */}
        {!loading && hasSearched && foods.length === 0 && !raw && (
          <motion.div variants={item}>
            <Card className="p-10 flex flex-col items-center text-center gap-3">
              <div className="size-12 rounded-full bg-muted/60 flex items-center justify-center">
                <UtensilsCrossed className="size-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold">No food recommendations found</h3>
              <p className="text-sm text-muted-foreground max-w-sm">Try adjusting your filters or use the Surprise Me button for random picks.</p>
            </Card>
          </motion.div>
        )}

        {/* Raw fallback */}
        {!loading && foods.length === 0 && raw && (
          <motion.div variants={item}>
            <Card className="p-5 gap-0 border-amber-500/30 bg-amber-500/5">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="size-4 text-amber-500" />
                <h3 className="font-semibold text-sm">AI food picks (raw)</h3>
              </div>
              <pre className="text-xs whitespace-pre-wrap text-muted-foreground max-h-80 overflow-y-auto font-mono leading-relaxed">{raw}</pre>
            </Card>
          </motion.div>
        )}

        {/* Results grid */}
        {!loading && foods.length > 0 && (
          <motion.div variants={item}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base sm:text-lg font-semibold tracking-tight flex items-center gap-2">
                <UtensilsCrossed className="size-4 text-amber-500" />
                Top picks in {city}
              </h2>
              <span className="text-xs text-muted-foreground">{foods.length} results</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {foods.map((f, i) => (
                <FoodCard
                  key={i}
                  food={f}
                  onSave={() => handleSave(f, i)}
                  saving={savingIdx === i}
                  onViewMap={() => setSection('map')}
                />
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

function FilterGroup({
  label, icon: Icon, options, value, onChange,
}: {
  label: string
  icon: React.ElementType
  options: readonly string[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <Label2 icon={Icon}>{label}</Label2>
      <div className="flex flex-wrap gap-1.5 mt-2">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={cn(
              'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
              value === o
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  )
}

function Label2({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
      <Icon className="size-3.5" />
      {children}
    </div>
  )
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn(
            'size-3',
            s <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30',
          )}
        />
      ))}
      <span className="text-[10px] text-muted-foreground ml-1 font-medium">{rating.toFixed(1)}</span>
    </div>
  )
}

function FoodCard({
  food, onSave, saving, onViewMap,
}: {
  food: FoodItem
  onSave: () => void
  saving: boolean
  onViewMap: () => void
}) {
  return (
    <motion.div whileHover={{ y: -3 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
      <Card className="p-4 sm:p-5 gap-0 h-full flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'size-3 rounded-full border-2 shrink-0',
                  food.veg
                    ? 'border-emerald-600 fill-emerald-600'
                    : 'border-rose-600 fill-rose-600',
                )}
                title={food.veg ? 'Veg' : 'Non-Veg'}
              />
              <h3 className="font-semibold text-sm truncate">{food.name}</h3>
            </div>
            <Badge variant="secondary" className="mt-1.5 text-[10px] bg-muted/60 text-muted-foreground border-0">
              {food.type}
            </Badge>
          </div>
          <div className="text-right shrink-0">
            <p className="text-base font-bold tracking-tight">{food.price}</p>
          </div>
        </div>

        <div className="mt-2.5 flex items-center gap-3">
          <Stars rating={food.rating} />
          <span className="inline-flex items-center gap-0.5 text-[11px] text-muted-foreground">
            <MapPin className="size-3" />{food.distance}
          </span>
        </div>

        <p className="text-xs text-muted-foreground mt-2.5 leading-relaxed flex-1 line-clamp-3">
          {food.description}
        </p>

        <div className="mt-3 pt-3 border-t border-border/60 flex items-center gap-1.5">
          <Button size="sm" variant="outline" className="h-8 px-2 text-xs flex-1" onClick={onSave} disabled={saving}>
            {saving ? <Loader2 className="size-3 mr-1 animate-spin" /> : <Bookmark className="size-3 mr-1" />}
            Save
          </Button>
          <Button size="sm" variant="ghost" className="h-8 px-2 text-xs flex-1" onClick={onViewMap}>
            <MapPin className="size-3 mr-1" />
            Map
          </Button>
          <Button size="sm" variant="ghost" className="h-8 px-2 text-xs flex-1" onClick={() => toast.info(`Ordering from ${food.name}…`)}>
            <ShoppingBag className="size-3 mr-1" />
            Order
          </Button>
        </div>
      </Card>
    </motion.div>
  )
}
