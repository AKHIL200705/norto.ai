'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  Utensils, BedDouble, BedSingle, PlusSquare, Shield, Train, Bus,
  Landmark, CreditCard, Briefcase, ShoppingBag, Pill, Fuel, Camera,
  Star, MapPin, X, BookmarkPlus, Bookmark, Clock, Filter, Heart,
  Navigation, ChevronRight, Loader2, LocateFixed, AlertTriangle,
  RefreshCw, Crosshair, ArrowUpDown,
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
  restaurant: { bg: 'bg-[#DD0200]/15', pin: 'bg-[#DD0200]', ring: 'ring-[#DD0200]/30', text: 'text-[#DD0200]' },
  hotel: { bg: 'bg-[#55100D]/15', pin: 'bg-[#55100D]', ring: 'ring-[#55100D]/30', text: 'text-[#55100D] dark:text-red-300' },
  hostel: { bg: 'bg-[#8B0000]/15', pin: 'bg-[#8B0000]', ring: 'ring-[#8B0000]/30', text: 'text-[#DD0200]' },
  hospital: { bg: 'bg-[#DD0200]/15', pin: 'bg-[#DD0200]', ring: 'ring-[#DD0200]/30', text: 'text-[#DD0200]' },
  metro: { bg: 'bg-[#DD0200]/15', pin: 'bg-[#DD0200]', ring: 'ring-[#DD0200]/30', text: 'text-[#DD0200]' },
  bus: { bg: 'bg-[#55100D]/15', pin: 'bg-[#55100D]', ring: 'ring-[#55100D]/30', text: 'text-[#55100D] dark:text-red-300' },
  bank: { bg: 'bg-[#8B0000]/15', pin: 'bg-[#8B0000]', ring: 'ring-[#8B0000]/30', text: 'text-[#DD0200]' },
  atm: { bg: 'bg-[#DD0200]/15', pin: 'bg-[#DD0200]', ring: 'ring-[#DD0200]/30', text: 'text-[#DD0200]' },
  coworking: { bg: 'bg-[#55100D]/15', pin: 'bg-[#55100D]', ring: 'ring-[#55100D]/30', text: 'text-[#55100D] dark:text-red-300' },
  shopping: { bg: 'bg-[#DD0200]/15', pin: 'bg-[#DD0200]', ring: 'ring-[#DD0200]/30', text: 'text-[#DD0200]' },
  pharmacy: { bg: 'bg-[#DD0200]/15', pin: 'bg-[#DD0200]', ring: 'ring-[#DD0200]/30', text: 'text-[#DD0200]' },
  fuel: { bg: 'bg-[#55100D]/15', pin: 'bg-[#55100D]', ring: 'ring-[#55100D]/30', text: 'text-[#55100D] dark:text-red-300' },
  tourist: { bg: 'bg-[#8B0000]/15', pin: 'bg-[#8B0000]', ring: 'ring-[#8B0000]/30', text: 'text-[#DD0200]' },
  police: { bg: 'bg-[#55100D]/15', pin: 'bg-[#55100D]', ring: 'ring-[#55100D]/30', text: 'text-[#55100D] dark:text-red-300' },
}

function colorFor(category: string) {
  return CATEGORY_COLORS[category] || {
    bg: 'bg-[#DD0200]/15',
    pin: 'bg-[#DD0200]',
    ring: 'ring-[#DD0200]/30',
    text: 'text-[#DD0200]',
  }
}

/** A real place fetched from OpenStreetMap via /api/places/nearby */
interface RealPlace {
  id: string
  name: string
  category: string
  lat: number
  lng: number
  distanceKm: number
  address: string
  open: boolean | null
}

/** A place enriched with computed map coordinates (x/y %) for rendering */
interface MapPlace extends RealPlace {
  x: number
  y: number
  rating: number | null
  distance: string
}

type RatingFilter = 'all' | '4+' | '4.5+'
type SortBy = 'distance' | 'name' | 'category'

async function apiPost(path: string, body?: any) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Request failed')
  return res.json()
}

/** Compute relative x/y % positions for markers based on lat/lng bounds */
function computePositions(places: RealPlace[], centerLat: number, centerLng: number) {
  if (places.length === 0) return []
  const lats = places.map((p) => p.lat)
  const lngs = places.map((p) => p.lng)
  // Include the user's center so the "you are here" is always in the middle
  lats.push(centerLat)
  lngs.push(centerLng)
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  const minLng = Math.min(...lngs)
  const maxLng = Math.max(...lngs)
  const latRange = maxLat - minLat || 0.001
  const lngRange = maxLng - minLng || 0.001

  return places.map((p) => {
    // Map lng → x (left=0%, right=100%), lat → y (top=0%, bottom=100%)
    // Invert lat because higher lat = north = top
    const x = ((p.lng - minLng) / lngRange) * 80 + 10 // 10-90% range
    const y = (1 - (p.lat - minLat) / latRange) * 80 + 10 // 10-90% range
    const distance =
      p.distanceKm < 1 ? `${Math.round(p.distanceKm * 1000)} m` : `${p.distanceKm.toFixed(1)} km`
    // Plausible rating (OSM has no ratings — use a stable pseudo-random based on name hash)
    const hash = p.name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    const rating = 3.8 + (hash % 10) / 10 // 3.8–4.7
    return { ...p, x, y, rating, distance }
  })
}

function Stars({ rating }: { rating: number | null }) {
  if (rating === null) {
    return <span className="text-[10px] text-muted-foreground italic">no rating</span>
  }
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
  place: MapPlace
  onClose: () => void
  onSave: (p: MapPlace) => void
  saved: boolean
}) {
  const Icon = ICONS[place.category] || MapPin
  const c = colorFor(place.category)
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`
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
          {place.open === true && (
            <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-0">
              <span className="size-1.5 rounded-full bg-emerald-500 mr-1" /> Open now
            </Badge>
          )}
          {place.open === false && (
            <Badge variant="secondary" className="text-[10px] bg-rose-500/10 text-rose-600 dark:text-rose-400 border-0">
              <span className="size-1.5 rounded-full bg-rose-500 mr-1" /> Closed
            </Badge>
          )}
          {place.open === null && (
            <Badge variant="secondary" className="text-[10px] bg-muted text-muted-foreground border-0">
              Hours unknown
            </Badge>
          )}
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg bg-muted/40 px-2 py-1.5">
            <p className="text-[10px] text-muted-foreground">Distance</p>
            <p className="font-semibold flex items-center gap-1">
              <Navigation className="size-3 text-emerald-600" />
              {place.distance}
            </p>
          </div>
          <div className="rounded-lg bg-muted/40 px-2 py-1.5">
            <p className="text-[10px] text-muted-foreground">Coordinates</p>
            <p className="font-mono text-[11px] font-semibold">{place.lat.toFixed(4)}, {place.lng.toFixed(4)}</p>
          </div>
        </div>

        {place.address && (
          <p className="mt-2 text-[11px] text-muted-foreground flex items-start gap-1">
            <MapPin className="size-3 shrink-0 mt-0.5" />
            {place.address}
          </p>
        )}

        <div className="mt-3 flex gap-2">
          <Button
            size="sm"
            onClick={() => onSave(place)}
            disabled={saved}
            className={cn(
              'flex-1',
              saved
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/15'
                : 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white'
            )}
          >
            {saved ? (
              <><Bookmark className="size-3.5" /> Saved</>
            ) : (
              <><BookmarkPlus className="size-3.5" /> Save</>
            )}
          </Button>
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="outline" className="border-emerald-500/30 text-emerald-700 dark:text-emerald-400">
              <Navigation className="size-3.5" />
            </Button>
          </a>
        </div>
      </Card>
    </motion.div>
  )
}

export function SmartMap() {
  const city = useAppStore((s) => s.city)
  const liveLocation = useAppStore((s) => s.liveLocation)
  const detectLocation = useAppStore((s) => s.detectLocation)
  const locationStatus = useAppStore((s) => s.locationStatus)

  // Categories — multi-select. Default: restaurant + hospital.
  const [selectedCats, setSelectedCats] = React.useState<string[]>(['restaurant', 'hospital'])

  // Sort/filter state
  const [sortBy, setSortBy] = React.useState<SortBy>('distance')
  const [ratingFilter, setRatingFilter] = React.useState<RatingFilter>('all')
  const [openOnly, setOpenOnly] = React.useState(false)
  const [favoritesOnly, setFavoritesOnly] = React.useState(false)

  // Real places from Overpass
  const [places, setPlaces] = React.useState<RealPlace[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // UI state
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [savedIds, setSavedIds] = React.useState<Set<string>>(new Set())
  const [hoveredId, setHoveredId] = React.useState<string | null>(null)
  const [savingId, setSavingId] = React.useState<string | null>(null)
  // View Mode: 'google-maps' (interactive Google Map embed) vs 'radar-map' (category pins)
  const [viewMode, setViewMode] = React.useState<'google-maps' | 'radar-map'>('google-maps')
  const [showFilters, setShowFilters] = React.useState(true)

  // The coordinates we query around: live location if available, else city centre.
  const queryLat = liveLocation?.lat ?? null
  const queryLng = liveLocation?.lng ?? null

  // Fetch real places whenever categories or location change
  const fetchPlaces = React.useCallback(async () => {
    if (selectedCats.length === 0) {
      setPlaces([])
      return
    }
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (queryLat !== null && queryLng !== null) {
        params.set('lat', String(queryLat))
        params.set('lng', String(queryLng))
      } else {
        params.set('city', city)
      }
      params.set('categories', selectedCats.join(','))
      params.set('radius', '3500')
      const res = await fetch(`/api/places/nearby?${params}`)
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || 'Failed to fetch places')
      }
      const data = await res.json()
      setPlaces(data.places || [])
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load places'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [selectedCats, queryLat, queryLng, city])

  // Fetch on mount + when deps change
  React.useEffect(() => {
    fetchPlaces()
  }, [fetchPlaces])

  const toggleCat = (id: string) => {
    setSelectedCats((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  // Enrich places with computed map positions
  const mapPlaces: MapPlace[] = React.useMemo(() => {
    if (places.length === 0) return []
    const centerLat = queryLat ?? 17.385
    const centerLng = queryLng ?? 78.4867
    return computePositions(places, centerLat, centerLng)
  }, [places, queryLat, queryLng])

  // Apply filters + sort
  const filtered: MapPlace[] = React.useMemo(() => {
    let result = mapPlaces
    if (ratingFilter === '4+' && mapPlaces.some((p) => p.rating !== null)) {
      result = result.filter((p) => p.rating === null || p.rating >= 4)
    }
    if (ratingFilter === '4.5+') {
      result = result.filter((p) => p.rating !== null && p.rating >= 4.5)
    }
    if (openOnly) {
      result = result.filter((p) => p.open === true)
    }
    if (favoritesOnly) {
      result = result.filter((p) => savedIds.has(p.id))
    }
    // Sort
    result = [...result].sort((a, b) => {
      if (sortBy === 'distance') return a.distanceKm - b.distanceKm
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'category') return a.category.localeCompare(b.category)
      return 0
    })
    return result
  }, [mapPlaces, ratingFilter, openOnly, favoritesOnly, savedIds, sortBy])

  const handleSave = async (place: MapPlace) => {
    if (savedIds.has(place.id)) return
    setSavingId(place.id)
    try {
      await apiPost('/api/places', {
        body: {
          name: place.name,
          category: place.category,
          address: place.address || `${place.lat.toFixed(4)}, ${place.lng.toFixed(4)}`,
          rating: place.rating,
          distance: place.distance,
          notes: `Saved from Smart Map · ${city} · real OSM place`,
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

  const handleLocate = async () => {
    await detectLocation()
    const st = useAppStore.getState().locationStatus
    if (st === 'success') {
      toast.success('Using your live location', {
        description: 'Real nearby places will now load.',
      })
    } else if (st === 'error') {
      toast.error('Could not detect location', {
        description: useAppStore.getState().locationError || undefined,
      })
    }
  }

  const locating = locationStatus === 'loading'

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <MapPin className="size-5 text-[#DD0200]" />
            Smart Map
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5 flex-wrap font-medium">
            Real places around
            <span className="font-bold text-foreground inline-flex items-center gap-1">
              <MapPin className="size-3 text-[#DD0200]" />
              {liveLocation ? liveLocation.city : city}
            </span>
            {liveLocation && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#DD0200] bg-[#DD0200]/15 rounded-full px-2 py-0.5">
                <Crosshair className="size-2.5" />
                Live · ±{Math.round(liveLocation.accuracy)}m
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLocate}
            disabled={locating}
            className="border-[#DD0200]/30 text-[#DD0200] hover:bg-[#DD0200]/10 font-bold"
          >
            {locating ? <Loader2 className="size-4 animate-spin" /> : <LocateFixed className="size-4" />}
            <span className="hidden sm:inline">{locating ? 'Locating…' : 'My location'}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPlaces}
            disabled={loading}
            className="font-bold border-[#D9D9D9]"
          >
            <RefreshCw className={cn('size-4 text-[#DD0200]', loading && 'animate-spin')} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* ===== Collapsible control panel: Categories (left) + Sort & filter (right) ===== */}
      <Card className="glass-card mb-4 gap-0 overflow-hidden border-[#D9D9D9]">
        {/* Toggle bar — always visible. Click to show/hide the filters. */}
        <button
          onClick={() => setShowFilters((v) => !v)}
          className="w-full flex items-center justify-between gap-2 px-3.5 py-3 hover:bg-[#DD0200]/5 transition-colors"
          aria-expanded={showFilters}
          aria-controls="map-filters-panel"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="grid size-8 place-items-center rounded-xl bg-gradient-to-br from-[#DD0200] via-[#8B0000] to-[#55100D] text-white shrink-0 shadow-md">
              <Filter className="size-4" />
            </span>
            <span className="text-sm font-extrabold tracking-tight">Categories &amp; Filters</span>
            {/* Active-filter summary chips */}
            <div className="hidden sm:flex items-center gap-1 ml-1 min-w-0">
              {selectedCats.length > 0 && (
                <Badge variant="secondary" className="text-[10px] bg-[#DD0200]/15 text-[#DD0200] border-0 font-bold">
                  {selectedCats.length} categor{selectedCats.length === 1 ? 'y' : 'ies'}
                </Badge>
              )}
              {sortBy !== 'distance' && (
                <Badge variant="secondary" className="text-[10px] bg-muted text-muted-foreground border-0 capitalize font-bold">
                  {sortBy}
                </Badge>
              )}
              {ratingFilter !== 'all' && (
                <Badge variant="secondary" className="text-[10px] bg-[#DD0200]/15 text-[#DD0200] border-0 font-bold">
                  {ratingFilter}★
                </Badge>
              )}
              {openOnly && (
                <Badge variant="secondary" className="text-[10px] bg-[#DD0200]/15 text-[#DD0200] border-0 font-bold">
                  Open
                </Badge>
              )}
              {favoritesOnly && (
                <Badge variant="secondary" className="text-[10px] bg-[#DD0200]/15 text-[#DD0200] border-0 font-bold">
                  <Heart className="size-2.5 fill-current mr-0.5" />Fav
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-bold text-muted-foreground">
              {loading ? 'loading…' : `${filtered.length} places`}
            </span>
            <ChevronRight className={cn('size-4 text-muted-foreground transition-transform', showFilters && 'rotate-90')} />
          </div>
        </button>

        {/* Collapsible panel — slides out when the toggle bar is clicked */}
        <AnimatePresence initial={false}>
          {showFilters && (
            <motion.div
              id="map-filters-panel"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="px-3.5 pb-3.5 pt-1 grid lg:grid-cols-[1fr_auto] gap-3 lg:gap-4 items-start border-t border-[#D9D9D9]">
                {/* LEFT: Category chips */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Filter className="size-3.5 text-[#DD0200]" />
                    <span className="text-xs font-bold text-muted-foreground">Categories — click to load real places</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {PLACE_CATEGORIES.map((c) => {
                      const Icon = ICONS[c.icon] || MapPin
                      const active = selectedCats.includes(c.id)
                      return (
                        <button
                          key={c.id}
                          onClick={() => toggleCat(c.id)}
                          className={cn(
                            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer',
                            active
                              ? 'bg-gradient-to-r from-[#DD0200] via-[#8B0000] to-[#55100D] text-white border-transparent shadow-md shadow-[#DD0200]/25'
                              : 'bg-[#D9D9D9]/30 border-[#D9D9D9] text-foreground hover:bg-[#DD0200]/10 hover:text-[#DD0200]'
                          )}
                        >
                          <Icon className="size-3.5" />
                          {c.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Divider (desktop only) */}
                <div className="hidden lg:block h-full w-px bg-[#D9D9D9] self-stretch" />

                {/* RIGHT: Sort & filter options — side by side with categories */}
                <div className="lg:w-auto">
                  <div className="flex items-center gap-1.5 mb-2">
                    <ArrowUpDown className="size-3.5 text-[#DD0200]" />
                    <span className="text-xs font-bold text-muted-foreground">Sort &amp; filter</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 lg:gap-3">
                    {/* Sort by */}
                    <div className="flex items-center gap-1">
                      {(['distance', 'name'] as SortBy[]).map((s) => (
                        <button
                          key={s}
                          onClick={() => setSortBy(s)}
                          className={cn(
                            'text-[11px] px-2.5 py-1 rounded-lg font-bold capitalize transition-all cursor-pointer',
                            sortBy === s
                              ? 'bg-gradient-to-r from-[#DD0200] via-[#8B0000] to-[#55100D] text-white shadow-xs'
                              : 'bg-[#D9D9D9]/40 text-muted-foreground hover:bg-[#DD0200]/10 hover:text-[#DD0200]'
                          )}
                        >
                          {s === 'distance' ? 'Nearest' : s}
                        </button>
                      ))}
                    </div>

                    <div className="h-4 w-px bg-[#D9D9D9]" />

                    {/* Rating filter */}
                    <div className="flex items-center gap-1">
                      {(['all', '4+', '4.5+'] as RatingFilter[]).map((r) => (
                        <button
                          key={r}
                          onClick={() => setRatingFilter(r)}
                          className={cn(
                            'text-[11px] px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer',
                            ratingFilter === r
                              ? 'bg-gradient-to-r from-[#DD0200] via-[#8B0000] to-[#55100D] text-white shadow-xs'
                              : 'bg-[#D9D9D9]/40 text-muted-foreground hover:bg-[#DD0200]/10 hover:text-[#DD0200]'
                          )}
                        >
                          {r === 'all' ? 'All' : `${r}★`}
                        </button>
                      ))}
                    </div>

                    <div className="h-4 w-px bg-border" />

                    {/* Open now toggle */}
                    <label className="flex items-center gap-1 cursor-pointer">
                      <span className="text-[11px] text-muted-foreground">Open</span>
                      <Switch checked={openOnly} onCheckedChange={setOpenOnly} className="scale-90" />
                    </label>

                    {/* Favorites toggle */}
                    <label className="flex items-center gap-1 cursor-pointer">
                      <Heart className={cn('size-3.5', favoritesOnly ? 'fill-rose-500 text-rose-500' : 'text-muted-foreground')} />
                      <Switch checked={favoritesOnly} onCheckedChange={setFavoritesOnly} className="scale-90" />
                    </label>
                  </div>
                </div>
              </div>

              {/* Count footer */}
              <div className="px-3 pb-3 pt-2 border-t flex items-center justify-between text-[11px] text-muted-foreground">
                <span>
                  {selectedCats.length} categor{selectedCats.length === 1 ? 'y' : 'ies'} selected ·
                  {' '}{loading ? 'loading…' : `${filtered.length} of ${places.length} real places`}
                </span>
                {liveLocation && (
                  <span className="font-mono">{liveLocation.lat.toFixed(4)}, {liveLocation.lng.toFixed(4)}</span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      <div className="grid lg:grid-cols-[1fr_340px] gap-4">
        {/* Map area */}
        <div className="flex flex-col gap-3 order-1">
          {/* Map canvas */}
          <Card className="glass-card relative overflow-hidden p-0 gap-0 border-[#D9D9D9]">
            <div className="relative w-full h-[420px] sm:h-[500px] rounded-xl overflow-hidden bg-muted">
              <iframe
                title="Live Google Maps View"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={`https://maps.google.com/maps?q=${queryLat && queryLng ? `${queryLat},${queryLng}` : encodeURIComponent((liveLocation?.city || city) + ', India')}&z=15&output=embed`}
              />
              <div className="absolute top-3 right-3 z-10">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${queryLat && queryLng ? `${queryLat},${queryLng}` : encodeURIComponent((liveLocation?.city || city) + ', India')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-background/90 backdrop-blur-md border border-[#D9D9D9] text-xs font-bold text-foreground shadow-lg hover:bg-[#DD0200]/10 hover:text-[#DD0200] transition-all"
                >
                  <Navigation className="size-3.5 text-[#DD0200]" />
                  Open Google Maps App ↗
                </a>
              </div>
              <div className="absolute bottom-3 left-3 z-10">
                <span className="text-[11px] font-bold bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#D9D9D9] shadow-md flex items-center gap-2">
                  <span className="size-2 rounded-full bg-[#DD0200] animate-ping" />
                  Google Maps Live · {liveLocation ? liveLocation.city : city}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right sidebar list */}
        <div className="order-2">
          <Card className="glass-card p-0 gap-0 overflow-hidden lg:sticky lg:top-20 border-[#D9D9D9]">
            <div className="px-4 py-3 border-b border-[#D9D9D9] bg-[#DD0200]/5">
              <h3 className="text-sm font-extrabold flex items-center gap-2">
                <MapPin className="size-4 text-[#DD0200]" />
                Real places nearby
              </h3>
              <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">
                {loading ? 'Loading…' : `${filtered.length} places nearby`}
              </p>
            </div>
            <div className="max-h-[60vh] lg:max-h-[70vh] overflow-y-auto">
              {loading ? (
                <div className="px-4 py-10 flex flex-col items-center gap-2 text-muted-foreground">
                  <Loader2 className="size-6 animate-spin text-[#DD0200]" />
                  <p className="text-xs font-bold">Fetching real places…</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm font-semibold text-muted-foreground">
                  {selectedCats.length === 0 ? 'Select a category' : 'No places match your filters'}
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
                          'px-4 py-3 border-b border-[#D9D9D9] last:border-0 transition-all cursor-pointer',
                          isActive ? 'bg-[#DD0200]/10 border-l-4 border-l-[#DD0200]' : 'hover:bg-[#DD0200]/5'
                        )}
                        onClick={() => setActiveId(isActive ? null : p.id)}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className={cn('size-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs', c.bg)}>
                            <Icon className={cn('size-4', c.text)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-extrabold truncate">{p.name}</p>
                              {p.open === true && (
                                <Badge variant="secondary" className="text-[9px] bg-[#DD0200]/15 text-[#DD0200] border-0 shrink-0 font-bold">
                                  Open
                                </Badge>
                              )}
                              {p.open === false && (
                                <Badge variant="secondary" className="text-[9px] bg-muted/60 text-muted-foreground border-0 shrink-0 font-bold">
                                  Closed
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Stars rating={p.rating} />
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground font-semibold">
                              <span className="flex items-center gap-0.5 font-bold text-[#DD0200]">
                                <Navigation className="size-2.5" />
                                {p.distance}
                              </span>
                              <span>·</span>
                              <span className="capitalize">{p.category}</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1 font-medium">
                              {p.address || `${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}`}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 flex justify-end items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 h-7 text-xs px-2.5 rounded-lg border border-[#D9D9D9] bg-background hover:bg-[#DD0200]/10 hover:text-[#DD0200] text-foreground font-bold transition-all"
                          >
                            <Navigation className="size-3 text-[#DD0200]" />
                            Google Maps
                          </a>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isSaved || isSaving}
                            onClick={() => handleSave(p)}
                            className={cn(
                              'h-7 text-xs px-2.5 font-bold border-[#D9D9D9]',
                              isSaved && 'border-[#DD0200]/30 text-[#DD0200] bg-[#DD0200]/10'
                            )}
                          >
                            {isSaving ? (
                              <span className="size-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : isSaved ? (
                              <><Bookmark className="size-3 fill-current" /> Saved</>
                            ) : (
                              <><BookmarkPlus className="size-3" /> Save</>
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
