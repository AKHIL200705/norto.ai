'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  Bookmark, MapPin, Star, Search, Plus, Trash2, RefreshCw, Loader2,
  Map as MapIcon, CheckCircle2, Circle, Calendar, TrendingUp, X,
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { PLACE_CATEGORIES, type SavedPlace } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
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

// Category color map (zero indigo/blue)
const CATEGORY_COLORS: Record<string, string> = {
  restaurant: 'bg-[#DD0200]/15 text-[#DD0200]',
  hotel: 'bg-[#55100D]/15 text-[#55100D] dark:text-red-300',
  hostel: 'bg-[#8B0000]/15 text-[#DD0200]',
  hospital: 'bg-[#DD0200]/15 text-[#DD0200]',
  police: 'bg-[#55100D]/15 text-[#55100D] dark:text-red-300',
  metro: 'bg-[#DD0200]/15 text-[#DD0200]',
  bus: 'bg-[#55100D]/15 text-[#55100D] dark:text-red-300',
  bank: 'bg-[#8B0000]/15 text-[#DD0200]',
  atm: 'bg-[#DD0200]/15 text-[#DD0200]',
  coworking: 'bg-[#55100D]/15 text-[#55100D] dark:text-red-300',
  shopping: 'bg-[#DD0200]/15 text-[#DD0200]',
  pharmacy: 'bg-[#DD0200]/15 text-[#DD0200]',
  fuel: 'bg-[#55100D]/15 text-[#55100D] dark:text-red-300',
  tourist: 'bg-[#8B0000]/15 text-[#DD0200]',
}

function categoryColor(cat: string): string {
  return CATEGORY_COLORS[cat] || 'bg-[#DD0200]/15 text-[#DD0200]'
}

function categoryLabel(cat: string): string {
  return PLACE_CATEGORIES.find((c) => c.id === cat)?.label || cat.charAt(0).toUpperCase() + cat.slice(1)
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
}

export function SavedPlaces() {
  const setSection = useAppStore((s) => s.setSection)
  const [places, setPlaces] = React.useState<SavedPlace[]>([])
  const [loading, setLoading] = React.useState(true)
  const [filter, setFilter] = React.useState<string>('All')
  const [search, setSearch] = React.useState('')
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [addOpen, setAddOpen] = React.useState(false)

  // Add form state
  const [form, setForm] = React.useState({
    name: '', category: 'restaurant', address: '', rating: '', notes: '',
  })

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const json = await api('/api/places', { method: 'GET' })
      setPlaces(json.places || [])
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load places')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  // Build category list from loaded places + standard categories
  const categoriesInUse = React.useMemo(() => {
    const set = new Set(places.map((p) => p.category))
    return ['All', ...Array.from(set)]
  }, [places])

  const filtered = React.useMemo(() => {
    return places.filter((p) => {
      if (filter !== 'All' && p.category !== filter) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        if (!p.name.toLowerCase().includes(q) && !(p.address || '').toLowerCase().includes(q) && !(p.notes || '').toLowerCase().includes(q)) {
          return false
        }
      }
      return true
    })
  }, [places, filter, search])

  const byCategory = React.useMemo(() => {
    const counts: Record<string, number> = {}
    places.forEach((p) => { counts[p.category] = (counts[p.category] || 0) + 1 })
    return counts
  }, [places])

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await api('/api/places', { method: 'DELETE', body: { id } })
      setPlaces((prev) => prev.filter((p) => p.id !== id))
      toast.success('Place removed')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete')
    } finally {
      setDeletingId(null)
    }
  }

  const handleAdd = async () => {
    if (!form.name.trim()) {
      toast.error('Place name is required')
      return
    }
    try {
      const body: Record<string, unknown> = {
        name: form.name.trim(),
        category: form.category,
      }
      if (form.address.trim()) body.address = form.address.trim()
      if (form.rating.trim()) body.rating = parseFloat(form.rating)
      if (form.notes.trim()) body.notes = form.notes.trim()
      const json = await api('/api/places', { body })
      setPlaces((prev) => [json.place, ...prev])
      toast.success('Place added')
      setAddOpen(false)
      setForm({ name: '', category: 'restaurant', address: '', rating: '', notes: '' })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to add place')
    }
  }

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-6">
        {/* Header */}
        <motion.div variants={item}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Bookmark className="size-3.5 text-[#DD0200]" />
                <span className="font-semibold">Your bookmarked places across the city</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Saved Places</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={load} disabled={loading} className="font-bold border-[#D9D9D9]">
                <RefreshCw className={cn('size-4 text-[#DD0200]', loading && 'animate-spin')} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="font-bold">
                    <Plus className="size-4" />
                    <span className="hidden sm:inline">Add place</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md glass-card border-[#D9D9D9]">
                  <DialogHeader>
                    <DialogTitle className="font-extrabold">Add a place manually</DialogTitle>
                    <DialogDescription>
                      Save a place you discovered. You can edit details later.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-3 py-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="np-name" className="font-semibold">Name *</Label>
                      <Input id="np-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Paradise Biryani" className="border-[#D9D9D9]" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="np-cat" className="font-semibold">Category</Label>
                        <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                          <SelectTrigger id="np-cat" className="border-[#D9D9D9]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {PLACE_CATEGORIES.map((c) => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="np-rating" className="font-semibold">Rating (0-5)</Label>
                        <Input id="np-rating" type="number" min="0" max="5" step="0.1" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} placeholder="4.5" className="border-[#D9D9D9]" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="np-addr" className="font-semibold">Address</Label>
                      <Input id="np-addr" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street, area, city" className="border-[#D9D9D9]" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="np-notes" className="font-semibold">Notes</Label>
                      <Input id="np-notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes (optional)" className="border-[#D9D9D9]" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                    <Button onClick={handleAdd}>Save place</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </motion.div>

        {/* Stats header */}
        <motion.div variants={item}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card className="glass-card p-4 gap-0 border-[#D9D9D9]">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-xl bg-gradient-to-br from-[#DD0200] via-[#8B0000] to-[#55100D] flex items-center justify-center shadow-md">
                  <Bookmark className="size-4 text-white" />
                </div>
                <p className="text-xs font-bold text-muted-foreground">Total saved</p>
              </div>
              <p className="text-2xl font-extrabold mt-2">{places.length}</p>
            </Card>
            <Card className="glass-card p-4 gap-0 border-[#D9D9D9]">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-xl bg-gradient-to-br from-[#DD0200] to-[#8B0000] flex items-center justify-center shadow-md">
                  <TrendingUp className="size-4 text-white" />
                </div>
                <p className="text-xs font-bold text-muted-foreground">Categories</p>
              </div>
              <p className="text-2xl font-extrabold mt-2">{Object.keys(byCategory).length}</p>
            </Card>
            <Card className="glass-card p-4 gap-0 border-[#D9D9D9]">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-xl bg-gradient-to-br from-[#55100D] to-[#1A0706] flex items-center justify-center shadow-md">
                  <MapPin className="size-4 text-white" />
                </div>
                <p className="text-xs font-bold text-muted-foreground">Top category</p>
              </div>
              <p className="text-base font-extrabold mt-2 truncate">
                {Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]?.[0]
                  ? categoryLabel(Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0][0])
                  : '—'}
              </p>
            </Card>
          </div>
        </motion.div>

        {/* Search + filter chips */}
        <motion.div variants={item}>
          <Card className="glass-card p-4 gap-0 border-[#D9D9D9]">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#DD0200]" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, address, or notes…"
                  className="pl-9 pr-9 border-[#D9D9D9]"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X className="size-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex gap-1.5 overflow-x-auto mt-3 pb-1">
              {categoriesInUse.map((c) => (
                <button
                  key={c}
                  onClick={() => setFilter(c)}
                  className={cn(
                    'px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer',
                    filter === c
                      ? 'bg-gradient-to-r from-[#DD0200] via-[#8B0000] to-[#55100D] text-white shadow-md shadow-[#DD0200]/25'
                      : 'bg-[#D9D9D9]/30 text-foreground hover:bg-[#DD0200]/10 hover:text-[#DD0200]',
                  )}
                >
                  {c === 'All' ? 'All' : categoryLabel(c)}
                  {c !== 'All' && byCategory[c] ? ` · ${byCategory[c]}` : c === 'All' ? ` · ${places.length}` : ''}
                </button>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Loading skeletons */}
        {loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-56 rounded-xl" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && places.length === 0 && (
          <motion.div variants={item}>
            <Card className="glass-card p-10 sm:p-14 flex flex-col items-center text-center gap-4 border-dashed border-[#DD0200]/30 bg-gradient-to-br from-[#DD0200]/5 via-[#55100D]/5 to-transparent">
              <div className="size-16 rounded-2xl bg-gradient-to-br from-[#DD0200] via-[#8B0000] to-[#55100D] flex items-center justify-center shadow-lg shadow-[#DD0200]/25">
                <Bookmark className="size-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold">No saved places yet</h3>
                <p className="text-sm text-muted-foreground mt-1.5 max-w-md">
                  Explore the smart map to discover restaurants, hospitals, metros, and more. Tap the bookmark icon on any place to save it here.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                <Button onClick={() => setSection('map')}>
                  <MapIcon className="size-4" />
                  Explore the map
                </Button>
                <Button variant="outline" onClick={() => setAddOpen(true)}>
                  <Plus className="size-4" />
                  Add place manually
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* No matches */}
        {!loading && places.length > 0 && filtered.length === 0 && (
          <motion.div variants={item}>
            <Card className="glass-card p-10 flex flex-col items-center text-center gap-3 border-[#D9D9D9]">
              <div className="size-12 rounded-full bg-muted/60 flex items-center justify-center">
                <Search className="size-6 text-muted-foreground" />
              </div>
              <h3 className="font-extrabold">No matches found</h3>
              <p className="text-sm text-muted-foreground max-w-sm">Try a different search term or category filter.</p>
              <Button variant="outline" size="sm" onClick={() => { setSearch(''); setFilter('All') }}>
                Clear filters
              </Button>
            </Card>
          </motion.div>
        )}

        {/* Grid */}
        {!loading && filtered.length > 0 && (
          <motion.div variants={item}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((p) => {
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="glass-card p-4 sm:p-5 gap-0 h-full flex flex-col hover:shadow-md hover:border-[#DD0200]/50 transition-all border-[#D9D9D9]">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-extrabold text-sm truncate">{p.name}</h3>
                          </div>
                          <Badge variant="secondary" className={cn('mt-1.5 text-[10px] border-0 font-bold', categoryColor(p.category))}>
                            {categoryLabel(p.category)}
                          </Badge>
                        </div>
                      </div>

                      {p.rating != null && (
                        <div className="mt-2.5 flex items-center gap-1.5">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={cn('size-3', s <= Math.round(p.rating || 0) ? 'fill-[#DD0200] text-[#DD0200]' : 'text-muted-foreground/30')} />
                            ))}
                          </div>
                          <span className="text-[11px] text-muted-foreground font-bold">{p.rating?.toFixed(1)}</span>
                        </div>
                      )}

                      {p.address && (
                        <p className="text-xs text-muted-foreground mt-2 flex items-start gap-1.5 font-medium">
                          <MapPin className="size-3 mt-0.5 shrink-0 text-[#DD0200]" />
                          <span className="leading-snug">{p.address}</span>
                        </p>
                      )}

                      <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground font-semibold">
                        {p.distance && <span className="inline-flex items-center gap-0.5"><MapPin className="size-3 text-[#DD0200]" />{p.distance}</span>}
                      </div>

                      {p.notes && (
                        <p className="text-xs text-muted-foreground mt-2 italic leading-relaxed line-clamp-2 bg-[#DD0200]/5 border border-[#DD0200]/20 rounded-md px-2 py-1.5 font-medium">
                          &quot;{p.notes}&quot;
                        </p>
                      )}

                      <div className="mt-auto pt-3 flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-bold">
                          <Calendar className="size-3 text-[#DD0200]" />
                          {new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                        <div className="flex items-center gap-1">
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.name + ', ' + (p.address || ''))}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 h-7 px-2 text-xs rounded-md border border-[#D9D9D9] bg-background hover:bg-[#DD0200]/10 hover:text-[#DD0200] text-foreground font-bold transition-colors"
                          >
                            <MapPin className="size-3 text-[#DD0200]" />
                            Google Maps
                          </a>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs text-muted-foreground hover:text-[#DD0200]"
                            onClick={() => handleDelete(p.id)}
                            disabled={deletingId === p.id}
                          >
                            {deletingId === p.id ? <Loader2 className="size-3.5 animate-spin text-[#DD0200]" /> : <Trash2 className="size-3.5" />}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
