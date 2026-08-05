'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  Utensils, BedDouble, BedSingle, PlusSquare, Shield, Train, Bus,
  Landmark, CreditCard, Briefcase, ShoppingBag, Pill, Fuel, Camera,
  Star, MapPin, X, BookmarkPlus, Bookmark, Clock, Filter, Heart,
  Navigation, ChevronRight,
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { PLACE_CATEGORIES } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

// Lucide icon registry keyed by the icon name string in PLACE_CATEGORIES
const ICONS: Record<string, React.ElementType> = {
  Utensils,
  BedDouble,
  BedSingle,
  PlusSquare,
  Shield,
  Train,
  Bus,
  Landmark,
  CreditCard,
  Briefcase,
  ShoppingBag,
  Pill,
  Fuel,
  Camera,
}

const CATEGORY_COLORS: Record<string, { bg: string; pin: string; ring: string; text: string }> = {
  restaurant: { bg: 'bg-amber-500/15', pin: 'bg-amber-500', ring: 'ring-amber-500/30', text: 'text-amber-600 dark:text-amber-400' },
  hotel: { bg: 'bg-violet-500/15', pin: 'bg-violet-500', ring: 'ring-violet-500/30', text: 'text-violet-600 dark:text-violet-400' },
  hostel: { bg: 'bg-fuchsia-500/15', pin: 'bg-fuchsia-500', ring: 'ring-fuchsia-500/30', text: 'text-fuchsia-600 dark:text-fuchsia-400' },
  hospital: { bg: 'bg-rose-500/15', pin: 'bg-rose-600', ring: 'ring-rose-500/30', text: 'text-rose-600 dark:text-rose-400' },
  police: { bg: 'bg-slate-500/15', pin: 'bg-slate-700', ring: 'ring-slate-500/30', text: 'text-slate-600 dark:text-slate-300' },
  metro: { bg: 'bg-emerald-500/15', pin: 'bg-emerald-600', ring: 'ring-emerald-500/30', text: 'text-emerald-600 dark:text-emerald-400' },
  bus: { bg: 'bg-teal-500/15', pin: 'bg-teal-500', ring: 'ring-teal-500/30', text: 'text-teal-600 dark:text-teal-400' },
  bank: { bg: 'bg-amber-600/15', pin: 'bg-amber-600', ring: 'ring-amber-600/30', text: 'text-amber-600 dark:text-amber-400' },
  atm: { bg: 'bg-yellow-500/15', pin: 'bg-yellow-500', ring: 'ring-yellow-500/30', text: 'text-yellow-600 dark:text-yellow-400' },
  coworking: { bg: 'bg-teal-600/15', pin: 'bg-teal-600', ring: 'ring-teal-600/30', text: 'text-teal-600 dark:text-teal-400' },
  shopping: { bg: 'bg-pink-500/15', pin: 'bg-pink-500', ring: 'ring-pink-500/30', text: 'text-pink-600 dark:text-pink-400' },
  pharmacy: { bg: 'bg-rose-400/15', pin: 'bg-rose-500', ring: 'ring-rose-400/30', text: 'text-rose-500 dark:text-rose-300' },
  fuel: { bg: 'bg-orange-500/15', pin: 'bg-orange-500', ring: 'ring-orange-500/30', text: 'text-orange-600 dark:text-orange-400' },
  tourist: { bg: 'bg-yellow-600/15', pin: 'bg-yellow-600', ring: 'ring-yellow-600/30', text: 'text-yellow-600 dark:text-yellow-400' },
}

function colorFor(category: string) {
  return CATEGORY_COLORS[category] || {
    bg: 'bg-emerald-500/15',
    pin: 'bg-emerald-600',
    ring: 'ring-emerald-500/30',
    text: 'text-emerald-600 dark:text-emerald-400',
  }
}

interface Place {
  id: string
  name: string
  category: string
  rating: number
  price: string
  distance: string
  open: boolean
  address: string
  x: number
  y: number
  premium: boolean
}

const PLACES: Place[] = [
  { id: 'p1', name: 'Sri Sai Tiffin Center', category: 'restaurant', rating: 4.6, price: '₹80', distance: '0.4 km', open: true, address: 'Madhapur, Hitech City Rd', x: 28, y: 38, premium: false },
  { id: 'p2', name: 'Paradise Biryani', category: 'restaurant', rating: 4.4, price: '₹350', distance: '1.2 km', open: true, address: 'Kondapur Main Rd', x: 52, y: 22, premium: true },
  { id: 'p3', name: 'Ohri\'s Jiva Imperio', category: 'restaurant', rating: 4.7, price: '₹1200', distance: '2.1 km', open: false, address: 'Banjara Hills Rd 12', x: 78, y: 48, premium: true },
  { id: 'p4', name: 'Chutneys Veg', category: 'restaurant', rating: 4.5, price: '₹250', distance: '0.9 km', open: true, address: 'Madhapur, beside Metro', x: 35, y: 55, premium: false },
  { id: 'p5', name: 'Apollo Pharmacy', category: 'pharmacy', rating: 4.3, price: '—', distance: '0.3 km', open: true, address: 'Kondapur, opposite Hitech Metro', x: 44, y: 44, premium: false },
  { id: 'p6', name: 'MedPlus Pharmacy', category: 'pharmacy', rating: 4.1, price: '—', distance: '0.7 km', open: true, address: 'Madhapur, Kavuri Hills', x: 22, y: 62, premium: false },
  { id: 'p7', name: 'Hitech City Metro', category: 'metro', rating: 4.6, price: '₹40', distance: '0.2 km', open: true, address: 'Hitech City Station, Blue Line', x: 50, y: 42, premium: false },
  { id: 'p8', name: 'Madhapur Metro', category: 'metro', rating: 4.5, price: '₹40', distance: '0.8 km', open: true, address: 'Madhapur Station, Blue Line', x: 40, y: 65, premium: false },
  { id: 'p9', name: 'Kondapur Metro', category: 'metro', rating: 4.4, price: '₹40', distance: '1.1 km', open: true, address: 'Kondapur Station, Blue Line', x: 60, y: 30, premium: false },
  { id: 'p10', name: 'KIMS Hospital', category: 'hospital', rating: 4.8, price: '₹800+', distance: '1.5 km', open: true, address: 'Kondapur, Minerals & Metals Rd', x: 62, y: 18, premium: true },
  { id: 'p11', name: 'CARE Hospitals Banjara', category: 'hospital', rating: 4.6, price: '₹700+', distance: '2.4 km', open: true, address: 'Banjara Hills Rd 1', x: 82, y: 60, premium: true },
  { id: 'p12', name: 'Continental Hospital', category: 'hospital', rating: 4.5, price: '₹900+', distance: '3.1 km', open: true, address: 'Gachibowli, Financial District', x: 14, y: 18, premium: true },
  { id: 'p13', name: 'Madhapur Police Station', category: 'police', rating: 4.0, price: '—', distance: '0.6 km', open: true, address: 'Madhapur, Hitech City Rd', x: 32, y: 72, premium: false },
  { id: 'p14', name: 'State Bank of India', category: 'bank', rating: 4.2, price: '—', distance: '0.5 km', open: true, address: 'Hitech City Rd 2', x: 56, y: 56, premium: false },
  { id: 'p15', name: 'HDFC Bank ATM', category: 'atm', rating: 4.1, price: '—', distance: '0.2 km', open: true, address: 'Madhapur, beside Metro Pillar 32', x: 47, y: 50, premium: false },
  { id: 'p16', name: 'Cowrks Coworking', category: 'coworking', rating: 4.7, price: '₹8000/mo', distance: '0.7 km', open: true, address: 'WaveRock, Hitech City', x: 70, y: 36, premium: true },
  { id: 'p17', name: 'Awfis Gachibowli', category: 'coworking', rating: 4.5, price: '₹7000/mo', distance: '2.5 km', open: true, address: 'The Skyview, Gachibowli', x: 18, y: 30, premium: true },
  { id: 'p18', name: 'Inorbit Mall', category: 'shopping', rating: 4.4, price: '—', distance: '1.4 km', open: true, address: 'Mind Space, Madhapur', x: 68, y: 70, premium: false },
  { id: 'p19', name: 'Sarath City Capital Mall', category: 'shopping', rating: 4.6, price: '—', distance: '1.8 km', open: true, address: 'Gachibowli Expressway', x: 10, y: 40, premium: false },
  { id: 'p20', name: 'Indian Oil Fuel Station', category: 'fuel', rating: 4.0, price: '₹106/L', distance: '1.0 km', open: true, address: 'Kondapur, NH 9', x: 75, y: 22, premium: false },
  { id: 'p21', name: 'Cyber Towers Bus Stop', category: 'bus', rating: 4.2, price: '₹20', distance: '0.4 km', open: true, address: 'Hitech City, Cyber Towers', x: 38, y: 30, premium: false },
  { id: 'p22', name: 'Shilparamam Bus Stop', category: 'bus', rating: 3.9, price: '₹20', distance: '0.8 km', open: true, address: 'Madhapur, Shilparamam', x: 25, y: 48, premium: false },
  { id: 'p23', name: 'Shilparamam Craft Village', category: 'tourist', rating: 4.3, price: '₹40', distance: '0.9 km', open: true, address: 'Madhapur, Hitech City', x: 22, y: 32, premium: false },
  { id: 'p24', name: 'Taramati Baradari', category: 'tourist', rating: 4.1, price: '₹100', distance: '4.2 km', open: true, address: 'Ibrahim Bagh, Gandipet Rd', x: 88, y: 80, premium: false },
]

type BudgetFilter = 'all' | 'budget' | 'premium'
type RatingFilter = 'all' | '4+' | '4.5+'

async function api(path: string, opts: { method?: string; body?: any } = {}) {
  const res = await fetch(path, {
    method: opts.method || 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  })
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Request failed')
  return res.json()
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            'size-3',
            i <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
          )}
        />
      ))}
      <span className="text-xs font-semibold ml-1">{rating.toFixed(1)}</span>
    </div>
  )
}

function PlaceDetailPopover({
  place,
  onClose,
  onSave,
  saved,
}: {
  place: Place
  onClose: () => void
  onSave: (p: Place) => void
  saved: boolean
}) {
  const Icon = ICONS[place.category] || MapPin
  const c = colorFor(place.category)
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: -4 }}
      transition={{ duration: 0.18 }}
      className="absolute z-30 w-64 -translate-x-1/2 -top-2 -translate-y-full left-1/2"
    >
      <Card className="p-3 gap-0 shadow-2xl border-2 border-emerald-500/30">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className={cn('size-8 rounded-lg flex items-center justify-center shrink-0', c.bg)}>
              <Icon className={cn('size-4', c.text)} />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-semibold leading-tight truncate">{place.name}</h4>
              <p className="text-[10px] text-muted-foreground capitalize">{place.category}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-6 rounded-md hover:bg-accent flex items-center justify-center shrink-0"
            aria-label="Close"
          >
            <X className="size-3.5" />
          </button>
        </div>

        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <Stars rating={place.rating} />
          {place.open ? (
            <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-0">
              <span className="size-1.5 rounded-full bg-emerald-500 mr-1" /> Open now
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-[10px] bg-rose-500/10 text-rose-600 dark:text-rose-400 border-0">
              <span className="size-1.5 rounded-full bg-rose-500 mr-1" /> Closed
            </Badge>
          )}
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg bg-muted/40 px-2 py-1.5">
            <p className="text-[10px] text-muted-foreground">Price</p>
            <p className="font-semibold">{place.price}</p>
          </div>
          <div className="rounded-lg bg-muted/40 px-2 py-1.5">
            <p className="text-[10px] text-muted-foreground">Distance</p>
            <p className="font-semibold flex items-center gap-1">
              <Navigation className="size-3 text-emerald-600" />
              {place.distance}
            </p>
          </div>
        </div>

        <p className="mt-2 text-[11px] text-muted-foreground flex items-start gap-1">
          <MapPin className="size-3 shrink-0 mt-0.5" />
          {place.address}
        </p>

        <Button
          size="sm"
          onClick={() => onSave(place)}
          disabled={saved}
          className={cn(
            'mt-3 w-full',
            saved
              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/15'
              : 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white'
          )}
        >
          {saved ? (
            <>
              <Bookmark className="size-3.5" /> Saved
            </>
          ) : (
            <>
              <BookmarkPlus className="size-3.5" /> Save place
            </>
          )}
        </Button>
      </Card>
    </motion.div>
  )
}

export function SmartMap() {
  const city = useAppStore((s) => s.city)
  const [selectedCats, setSelectedCats] = React.useState<string[]>(['restaurant', 'hospital', 'metro'])
  const [budgetFilter, setBudgetFilter] = React.useState<BudgetFilter>('all')
  const [ratingFilter, setRatingFilter] = React.useState<RatingFilter>('all')
  const [openOnly, setOpenOnly] = React.useState(false)
  const [favoritesOnly, setFavoritesOnly] = React.useState(false)
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [savedIds, setSavedIds] = React.useState<Set<string>>(new Set())
  const [hoveredId, setHoveredId] = React.useState<string | null>(null)
  const [savingId, setSavingId] = React.useState<string | null>(null)

  const toggleCat = (id: string) => {
    setSelectedCats((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  const filtered = React.useMemo(() => {
    return PLACES.filter((p) => {
      if (!selectedCats.includes(p.category)) return false
      if (budgetFilter === 'budget' && p.premium) return false
      if (budgetFilter === 'premium' && !p.premium) return false
      if (ratingFilter === '4+' && p.rating < 4) return false
      if (ratingFilter === '4.5+' && p.rating < 4.5) return false
      if (openOnly && !p.open) return false
      if (favoritesOnly && !savedIds.has(p.id)) return false
      return true
    })
  }, [selectedCats, budgetFilter, ratingFilter, openOnly, favoritesOnly, savedIds])

  const handleSave = async (place: Place) => {
    if (savedIds.has(place.id)) return
    setSavingId(place.id)
    try {
      await api('/api/places', {
        body: {
          name: place.name,
          category: place.category,
          address: place.address,
          rating: place.rating,
          price: place.price,
          distance: place.distance,
          notes: `Saved from Smart Map · ${city}`,
        },
      })
      setSavedIds((prev) => new Set(prev).add(place.id))
      toast.success(`Saved "${place.name}" to your places`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save place')
    } finally {
      setSavingId(null)
    }
  }

  const handleSaveAll = async () => {
    const toSave = filtered.filter((p) => !savedIds.has(p.id))
    if (toSave.length === 0) {
      toast.info('All visible places are already saved')
      return
    }
    toast.success(`Saving ${toSave.length} places...`)
    let ok = 0
    for (const p of toSave) {
      try {
        await handleSave(p)
        ok++
      } catch {
        // handled in handleSave
      }
    }
    if (ok > 0) toast.success(`Saved ${ok} places`)
  }

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
            <MapPin className="size-5 text-emerald-600" />
            Smart Map
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Explore essentials around <span className="font-medium text-foreground">{city}</span>
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSaveAll}
          className="border-emerald-500/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10"
        >
          <BookmarkPlus className="size-4" />
          Save all visible ({filtered.filter((p) => !savedIds.has(p.id)).length})
        </Button>
      </div>

      {/* Category chips */}
      <Card className="p-3 mb-4 gap-0">
        <div className="flex items-center gap-1.5 mb-2">
          <Filter className="size-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground">Categories</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PLACE_CATEGORIES.map((c) => {
            const Icon = ICONS[c.icon] || MapPin
            const active = selectedCats.includes(c.id)
            const col = colorFor(c.id)
            return (
              <button
                key={c.id}
                onClick={() => toggleCat(c.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                  active
                    ? cn('border-transparent text-white shadow-sm', col.pin)
                    : 'bg-background hover:bg-accent text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="size-3.5" />
                {c.label}
              </button>
            )
          })}
        </div>
      </Card>

      <div className="grid lg:grid-cols-[1fr_340px] gap-4">
        {/* Map area */}
        <div className="flex flex-col gap-3 order-1">
          {/* Filters bar */}
          <Card className="p-3 gap-0">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-muted-foreground mr-1">Budget</span>
                {(['all', 'budget', 'premium'] as BudgetFilter[]).map((b) => (
                  <button
                    key={b}
                    onClick={() => setBudgetFilter(b)}
                    className={cn(
                      'text-xs px-2.5 py-1 rounded-md font-medium capitalize transition-colors',
                      budgetFilter === b
                        ? 'bg-emerald-600 text-white'
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                    )}
                  >
                    {b === 'all' ? 'All' : b}
                  </button>
                ))}
              </div>

              <div className="h-5 w-px bg-border" />

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-muted-foreground mr-1">Rating</span>
                {(['all', '4+', '4.5+'] as RatingFilter[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRatingFilter(r)}
                    className={cn(
                      'text-xs px-2.5 py-1 rounded-md font-medium transition-colors',
                      ratingFilter === r
                        ? 'bg-amber-500 text-white'
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                    )}
                  >
                    {r === 'all' ? 'All' : `${r}★`}
                  </button>
                ))}
              </div>

              <div className="h-5 w-px bg-border" />

              <label className="flex items-center gap-1.5 cursor-pointer">
                <span className="text-[11px] text-muted-foreground">Open now</span>
                <Switch checked={openOnly} onCheckedChange={setOpenOnly} />
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <Heart className={cn('size-3.5', favoritesOnly ? 'fill-rose-500 text-rose-500' : 'text-muted-foreground')} />
                <span className="text-[11px] text-muted-foreground">Favorites</span>
                <Switch checked={favoritesOnly} onCheckedChange={setFavoritesOnly} />
              </label>

              <Badge variant="secondary" className="text-[10px] ml-auto bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-0">
                {filtered.length} places
              </Badge>
            </div>
          </Card>

          {/* Map canvas */}
          <Card className="relative overflow-hidden p-0 gap-0 border-2">
            <div className="relative w-full h-[400px] sm:h-[480px] mesh-bg bg-gradient-to-br from-emerald-50 via-background to-amber-50/40 dark:from-emerald-950/20 dark:via-background dark:to-amber-950/10">
              {/* Decorative "rivers" / "parks" */}
              <div className="absolute inset-x-6 top-10 h-10 rounded-full bg-emerald-500/10 blur-2xl" />
              <div className="absolute right-10 bottom-12 size-32 rounded-full bg-amber-400/10 blur-2xl" />

              {/* Decorative "roads" — rotated thin divs */}
              <div className="absolute left-0 right-0 top-[42%] h-1.5 bg-foreground/5 rotate-[-2deg] origin-center" />
              <div className="absolute left-0 right-0 top-[68%] h-1 bg-foreground/5 rotate-[1deg] origin-center" />
              <div className="absolute top-0 bottom-0 left-[35%] w-1.5 bg-foreground/5 rotate-[8deg] origin-center" />
              <div className="absolute top-0 bottom-0 left-[68%] w-1 bg-foreground/5 rotate-[-6deg] origin-center" />
              <div className="absolute left-[10%] right-[35%] top-[20%] h-0.5 bg-foreground/[0.04] rotate-[3deg]" />

              {/* "You are here" indicator */}
              <div className="absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="relative">
                  <div className="size-12 rounded-full bg-emerald-500/20 absolute -inset-3 animate-ping" />
                  <div className="size-6 rounded-full bg-emerald-600 border-4 border-white shadow-lg relative flex items-center justify-center">
                    <div className="size-2 rounded-full bg-white" />
                  </div>
                  <div className="absolute top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold bg-background/90 backdrop-blur px-2 py-0.5 rounded-md border shadow-sm">
                    You · {city}
                  </div>
                </div>
              </div>

              {/* Markers */}
              {filtered.map((p) => {
                const Icon = ICONS[p.category] || MapPin
                const c = colorFor(p.category)
                const isActive = activeId === p.id
                const isHovered = hoveredId === p.id
                const isSaved = savedIds.has(p.id)
                return (
                  <div
                    key={p.id}
                    className="absolute z-20"
                    style={{ left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%, -100%)' }}
                  >
                    {/* Label on hover/active */}
                    {(isHovered || isActive) && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap">
                        <span className="text-[10px] font-semibold bg-background/95 backdrop-blur border shadow-sm px-2 py-0.5 rounded-md">
                          {p.name}
                        </span>
                      </div>
                    )}

                    <button
                      onClick={() => setActiveId(isActive ? null : p.id)}
                      onMouseEnter={() => setHoveredId(p.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      className="relative block group"
                      aria-label={`${p.name} — ${p.category}`}
                    >
                      <div className={cn(
                        'flex flex-col items-center transition-transform',
                        (isHovered || isActive) && 'scale-110'
                      )}>
                        <div className={cn(
                          'relative size-7 rounded-full flex items-center justify-center ring-2 ring-background shadow-md transition-all',
                          c.pin,
                          isActive && 'ring-4 ring-emerald-500/30'
                        )}>
                          <Icon className="size-3.5 text-white" />
                          {isSaved && (
                            <span className="absolute -top-1 -right-1 size-3 rounded-full bg-amber-400 border border-background flex items-center justify-center">
                              <Bookmark className="size-2 text-white fill-white" />
                            </span>
                          )}
                        </div>
                        {/* Pin tip */}
                        <div className={cn('w-0 h-0 border-l-[5px] border-r-[5px] border-t-[7px] border-l-transparent border-r-transparent -mt-0.5', c.pin)} style={{ borderBottom: 'none' }} />
                      </div>
                    </button>

                    {/* Detail popover */}
                    <AnimatePresence>
                      {isActive && (
                        <PlaceDetailPopover
                          place={p}
                          onClose={() => setActiveId(null)}
                          onSave={handleSave}
                          saved={isSaved}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}

              {/* Legend (bottom-left, hidden on small screens) */}
              <div className="hidden sm:block absolute bottom-3 left-3 z-10">
                <Card className="p-2.5 gap-0 bg-background/90 backdrop-blur shadow-sm max-w-[200px]">
                  <p className="text-[10px] font-semibold text-muted-foreground mb-1.5 px-1">Legend</p>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                    {selectedCats.slice(0, 6).map((catId) => {
                      const cat = PLACE_CATEGORIES.find((c) => c.id === catId)
                      if (!cat) return null
                      const c = colorFor(catId)
                      return (
                        <div key={catId} className="flex items-center gap-1.5">
                          <span className={cn('size-2 rounded-full', c.pin)} />
                          <span className="text-[10px] text-muted-foreground truncate">{cat.label}</span>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              </div>

              {filtered.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center bg-background/80 backdrop-blur px-6 py-4 rounded-xl border">
                    <MapPin className="size-8 mx-auto text-muted-foreground/50" />
                    <p className="text-sm font-medium mt-2">No places match your filters</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Try adjusting categories or filters above</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right sidebar list */}
        <div className="order-2">
          <Card className="p-0 gap-0 overflow-hidden lg:sticky lg:top-20">
            <div className="px-4 py-3 border-b bg-muted/30">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <MapPin className="size-4 text-emerald-600" />
                Places list
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {filtered.length} of {PLACES.length} visible
              </p>
            </div>
            <div className="max-h-[60vh] lg:max-h-[70vh] overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No places to show
                </div>
              ) : (
                <div className="flex flex-col">
                  {filtered.map((p) => {
                    const Icon = ICONS[p.category] || MapPin
                    const c = colorFor(p.category)
                    const isSaved = savedIds.has(p.id)
                    const isSaving = savingId === p.id
                    const isActive = activeId === p.id
                    return (
                      <div
                        key={p.id}
                        onMouseEnter={() => setHoveredId(p.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        className={cn(
                          'px-4 py-3 border-b last:border-0 transition-colors cursor-pointer',
                          isActive ? 'bg-emerald-500/5' : 'hover:bg-accent/40'
                        )}
                        onClick={() => setActiveId(isActive ? null : p.id)}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className={cn('size-8 rounded-lg flex items-center justify-center shrink-0', c.bg)}>
                            <Icon className={cn('size-4', c.text)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-semibold truncate">{p.name}</p>
                              {p.open ? (
                                <Badge variant="secondary" className="text-[9px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-0 shrink-0">
                                  Open
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-[9px] bg-rose-500/10 text-rose-600 dark:text-rose-400 border-0 shrink-0">
                                  Closed
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Stars rating={p.rating} />
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                              <span className="font-medium text-foreground">{p.price}</span>
                              <span>·</span>
                              <span className="flex items-center gap-0.5">
                                <Navigation className="size-2.5 text-emerald-600" />
                                {p.distance}
                              </span>
                              <span>·</span>
                              <span className="capitalize">{p.category}</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{p.address}</p>
                          </div>
                        </div>
                        <div className="mt-2 flex justify-end" onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isSaved || isSaving}
                            onClick={() => handleSave(p)}
                            className={cn(
                              'h-7 text-xs px-2.5',
                              isSaved && 'border-emerald-500/30 text-emerald-700 dark:text-emerald-400 bg-emerald-500/5'
                            )}
                          >
                            {isSaving ? (
                              <span className="size-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : isSaved ? (
                              <>
                                <Bookmark className="size-3 fill-current" /> Saved
                              </>
                            ) : (
                              <>
                                <BookmarkPlus className="size-3" /> Save
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
