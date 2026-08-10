'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  Sparkles, Map, Wallet, CloudSun, Languages, Siren, UtensilsCrossed,
  MapPin, Wallet as WalletIcon, Bookmark, Languages as LangIcon,
  ArrowRight, TrendingUp, Lightbulb, Clock, ChevronRight,
  LocateFixed, Loader2, Crosshair, AlertTriangle, Navigation,
} from 'lucide-react'
import { useAppStore, type LiveLocation, type LocationStatus } from '@/lib/store'
import { toast } from 'sonner'
import type { DashboardSection } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
}

interface QuickAction {
  id: DashboardSection
  title: string
  desc: string
  icon: React.ElementType
  gradient: string
}

const QUICK_ACTIONS: QuickAction[] = [
  { id: 'assistant', title: 'AI Assistant', desc: 'Ask anything about your new city', icon: Sparkles, gradient: 'from-[#DD0200] to-[#55100D]' },
  { id: 'map', title: 'Smart Map', desc: 'Find nearby essentials & places', icon: Map, gradient: 'from-[#8B0000] to-[#1A0706]' },
  { id: 'budget', title: 'Budget Planner', desc: 'Track spend & get savings tips', icon: Wallet, gradient: 'from-[#DD0200] to-[#8B0000]' },
  { id: 'translator', title: 'Translator', desc: 'Local phrases & instant translation', icon: Languages, gradient: 'from-[#55100D] to-[#1A0706]' },
  { id: 'emergency', title: 'Emergency', desc: 'SOS, hospitals & hotlines', icon: Siren, gradient: 'from-[#DD0200] to-[#55100D]' },
]

const RECENT = [
  { icon: Bookmark, title: 'Saved KIMS Hospital to places', time: '2 hours ago', color: 'text-emerald-600 bg-emerald-500/10' },
  { icon: WalletIcon, title: 'Budget analyzed — Savings rate 32%', time: '5 hours ago', color: 'text-amber-500 bg-amber-500/10' },
  { icon: UtensilsCrossed, title: 'Found 6 veg restaurants near Hitech City', time: 'Yesterday', color: 'text-rose-500 bg-rose-500/10' },
]

const RECOMMENDED = [
  { tag: 'Stay', title: 'PG near Hitech City under ₹8,000', desc: '3 verified options near metro stations' },
  { tag: 'Eat', title: 'Best Hyderabadi biryani spots', desc: 'Top-rated by locals in your area' },
  { tag: 'Travel', title: 'Metro pass vs bus — monthly savings', desc: 'Save up to ₹450/month with metro' },
]

export function DashboardHome() {
  const city = useAppStore((s) => s.city)
  const setSection = useAppStore((s) => s.setSection)
  const user = useAppStore((s) => s.user)
  const isAuth = useAppStore((s) => s.isAuthenticated)
  const detectLocation = useAppStore((s) => s.detectLocation)
  const liveLocation = useAppStore((s) => s.liveLocation)
  const locationStatus = useAppStore((s) => s.locationStatus)
  const locationError = useAppStore((s) => s.locationError)
  const [realSavedCount, setRealSavedCount] = React.useState<number>(0)

  React.useEffect(() => {
    async function getCount() {
      try {
        const res = await fetch('/api/places')
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data.places)) {
            setRealSavedCount(data.places.length)
          }
        }
      } catch {
        // fallback
      }
    }
    getCount()
  }, [])

  const firstName = isAuth && user ? (user.name.split(' ')[0] || 'Explorer') : 'Explorer'

  const handleDetect = async () => {
    await detectLocation()
    const st = useAppStore.getState().locationStatus
    if (st === 'success') {
      const loc = useAppStore.getState().liveLocation
      toast.success('Location detected', {
        description: loc ? `You're in ${loc.city}${loc.region ? ', ' + loc.region : ''} · ±${Math.round(loc.accuracy)}m accuracy` : undefined,
      })
    } else if (st === 'error') {
      toast.error('Could not detect location', {
        description: useAppStore.getState().locationError || undefined,
      })
    }
  }

  const stats = [
    { label: 'Current City', value: city, icon: MapPin, color: 'from-emerald-500 to-teal-600', iconColor: 'text-emerald-600', section: 'map' as DashboardSection },
    { label: 'Monthly Budget', value: isAuth && user ? `₹${user.budget.toLocaleString('en-IN')}` : '₹25,000', icon: WalletIcon, color: 'from-amber-500 to-orange-600', iconColor: 'text-amber-500', section: 'budget' as DashboardSection },
    { label: 'Saved Places', value: String(realSavedCount), icon: Bookmark, color: 'from-teal-500 to-emerald-600', iconColor: 'text-teal-600', section: 'saved' as DashboardSection },
    { label: 'Language', value: isAuth && user ? user.language : 'English', icon: LangIcon, color: 'from-rose-500 to-pink-600', iconColor: 'text-rose-500', section: 'translator' as DashboardSection },
  ]

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-6"
      >
        {/* Hero greeting card */}
        <motion.div variants={item}>
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-500/20">
            <div className="absolute inset-0 mesh-bg opacity-30 pointer-events-none" />
            <div className="absolute -right-16 -top-16 size-64 rounded-full bg-amber-400/20 blur-3xl pointer-events-none" />
            <div className="absolute -left-12 -bottom-12 size-48 rounded-full bg-teal-300/20 blur-3xl pointer-events-none" />
            <div className="relative px-6 py-7 sm:px-8 sm:py-9 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-3 max-w-2xl">
                <div className="flex items-center gap-2">
                  <Badge className="bg-white/15 text-white border-0 hover:bg-white/20 backdrop-blur-sm">
                    <Sparkles className="size-3 mr-1" />
                    Dashboard
                  </Badge>
                  <span className="text-xs text-emerald-50/80">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                  Welcome back, {firstName} 👋
                </h1>
                <p className="text-emerald-50/90 text-sm sm:text-base">
                  You&apos;re all set in <span className="font-semibold text-amber-300">{city}</span>. Let&apos;s make your move smoother — explore essentials, plan your budget, and discover the city with AI by your side.
                </p>
                <div className="flex flex-wrap gap-3 pt-1">
                  <Button
                    onClick={() => setSection('assistant')}
                    className="bg-white text-emerald-700 hover:bg-emerald-50 shadow-md"
                    size="lg"
                  >
                    Plan my move
                    <ArrowRight className="size-4" />
                  </Button>
                  <Button
                    onClick={() => setSection('map')}
                    variant="outline"
                    size="lg"
                    className="bg-white/10 text-white border-white/30 hover:bg-white/20 hover:text-white"
                  >
                    <Map className="size-4" />
                    Explore the city
                  </Button>
                </div>
              </div>
              <div className="hidden lg:flex shrink-0 size-32 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 items-center justify-center animate-float">
                <Sparkles className="size-14 text-amber-300" />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Live location card */}
        <motion.div variants={item}>
          <LiveLocationCard
            status={locationStatus}
            live={liveLocation}
            error={locationError}
            onDetect={handleDetect}
          />
        </motion.div>

        {/* Quick stats — bold values, highlighted top accent */}
        <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((s) => {
            const Icon = s.icon
            return (
              <motion.button
                key={s.label}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSection(s.section)}
                className="text-left"
              >
                <Card className="p-4 sm:p-5 gap-0 relative overflow-hidden hover:shadow-lg hover:border-emerald-500/30 transition-all h-full">
                  {/* Top accent bar */}
                  <div className={cn('absolute top-0 left-0 right-0 h-1 bg-gradient-to-r', s.color)} />
                  <div className="flex items-center justify-between">
                    <div className={cn('size-10 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-md', s.color)}>
                      <Icon className="size-5 text-white" />
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground/40" />
                  </div>
                  <p className="mt-3 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{s.label}</p>
                  <p className="text-xl sm:text-2xl font-extrabold tracking-tight mt-0.5">{s.value}</p>
                </Card>
              </motion.button>
            )
          })}
        </motion.div>

        {/* Quick actions grid */}
        <motion.div variants={item}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">Quick Actions</h2>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Tap to explore →</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {QUICK_ACTIONS.map((a) => {
              const Icon = a.icon
              return (
                <motion.button
                  key={a.id}
                  onClick={() => setSection(a.id)}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="text-left"
                >
                  <Card className="p-4 sm:p-5 gap-0 h-full relative overflow-hidden hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 transition-all group">
                    <div className={cn('size-11 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-lg', a.gradient)}>
                      <Icon className="size-5 text-white" />
                    </div>
                    <h3 className="mt-3 text-sm font-bold tracking-tight">{a.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{a.desc}</p>
                    {/* Hover arrow */}
                    <ArrowRight className="absolute bottom-4 right-4 size-4 text-emerald-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all" />
                  </Card>
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* AI Insight + Recent activity row */}
        <div className="grid lg:grid-cols-3 gap-4">
          <motion.div variants={item} className="lg:col-span-2">
            <Card className="relative overflow-hidden border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-amber-400/5 to-transparent p-5 sm:p-6 gap-0">
              <div className="absolute -right-8 -top-8 size-32 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />
              <div className="relative flex items-start gap-3">
                <div className="size-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shrink-0">
                  <Lightbulb className="size-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm sm:text-base tracking-tight">AI Insight of the day</h3>
                    <Badge variant="secondary" className="text-[10px] bg-amber-500/15 text-amber-700 dark:text-amber-400 border-0">
                      <Sparkles className="size-3 mr-1" />
                      Tip
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                    Tip: Hitech City has the best PG options under <span className="font-semibold text-foreground">₹8,000</span> near metro stations. Areas like <span className="font-semibold text-foreground">Madhapur</span> and <span className="font-semibold text-foreground">Kondapur</span> balance commute, cost, and connectivity perfectly.
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3 text-emerald-700 dark:text-emerald-400 hover:text-emerald-700 hover:bg-emerald-500/10 px-0 -ml-1"
                    onClick={() => setSection('assistant')}
                  >
                    Ask AI for more details
                    <ArrowRight className="size-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="p-5 gap-0 h-full">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-extrabold text-sm sm:text-base flex items-center gap-2 tracking-tight">
                  <Clock className="size-4 text-muted-foreground" />
                  Recent activity
                </h3>
              </div>
              <div className="flex flex-col gap-3">
                {RECENT.map((r, i) => {
                  const Icon = r.icon
                  return (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className={cn('size-7 rounded-lg flex items-center justify-center shrink-0', r.color)}>
                        <Icon className="size-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium leading-snug">{r.title}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{r.time}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Recommended for you */}
        <motion.div variants={item}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight flex items-center gap-2">
              <TrendingUp className="size-5 text-amber-500" />
              Recommended for you
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
            {RECOMMENDED.map((r, i) => (
              <Card key={i} className="p-4 gap-0 hover:border-amber-500/30 hover:shadow-md transition-all cursor-pointer group" onClick={() => setSection('assistant')}>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-0">
                    {r.tag}
                  </Badge>
                  <ArrowRight className="size-3.5 text-muted-foreground/50 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <h4 className="mt-2.5 text-sm font-semibold leading-snug">{r.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{r.desc}</p>
              </Card>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

/**
 * Live-location card for the dashboard home.
 * Uses the browser's high-accuracy Geolocation API + server-side reverse
 * geocoding to show the user's real current city, coordinates, and accuracy.
 */
function LiveLocationCard({
  status,
  live,
  error,
  onDetect,
}: {
  status: LocationStatus
  live: LiveLocation | null
  error: string | null
  onDetect: () => void
}) {
  if (status === 'loading') {
    return (
      <Card className="p-5 sm:p-6 gap-0 border-emerald-500/30 bg-emerald-500/5">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-xl bg-emerald-500/15 grid place-items-center">
            <Loader2 className="size-6 text-emerald-600 animate-spin" />
          </div>
          <div>
            <p className="font-semibold">Detecting your location…</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Using high-accuracy GPS. This usually takes a few seconds.
            </p>
          </div>
        </div>
      </Card>
    )
  }

  if (status === 'error') {
    return (
      <Card className="p-5 sm:p-6 gap-0 border-rose-500/30 bg-rose-500/5">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-xl bg-rose-500/15 grid place-items-center shrink-0">
            <AlertTriangle className="size-6 text-rose-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold">Couldn&apos;t detect your location</p>
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{error}</p>
          </div>
          <Button onClick={onDetect} variant="outline" size="sm" className="border-rose-500/30 text-rose-600 hover:bg-rose-500/10 shrink-0">
            <LocateFixed className="size-4" />
            Retry
          </Button>
        </div>
      </Card>
    )
  }

  if (status === 'success' && live) {
    const accuracyM = Math.round(live.accuracy)
    const accuracyLabel = accuracyM < 50 ? 'High accuracy' : accuracyM < 200 ? 'Good accuracy' : 'Approximate'
    const mapsUrl = `https://www.openstreetmap.org/?mlat=${live.lat}&mlon=${live.lng}#map=16/${live.lat}/${live.lng}`
    return (
      <Card className="p-0 gap-0 overflow-hidden border-emerald-500/30">
        <div className="grid sm:grid-cols-[1fr_auto]">
          {/* Details */}
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60 animate-ping" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-600" />
                </span>
                Live location
              </span>
              <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-0">
                {accuracyLabel} · ±{accuracyM}m
              </Badge>
            </div>
            <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <MapPin className="size-5 text-emerald-600" />
              {live.city}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {[live.locality, live.region, live.country].filter(Boolean).join(', ')}
            </p>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="rounded-lg bg-muted/50 px-3 py-2">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Latitude</p>
                <p className="text-sm font-mono font-medium mt-0.5">{live.lat.toFixed(5)}</p>
              </div>
              <div className="rounded-lg bg-muted/50 px-3 py-2">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Longitude</p>
                <p className="text-sm font-mono font-medium mt-0.5">{live.lng.toFixed(5)}</p>
              </div>
              <div className="rounded-lg bg-muted/50 px-3 py-2">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Detected</p>
                <p className="text-sm font-medium mt-0.5">{new Date(live.detectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <Button onClick={onDetect} variant="outline" size="sm" className="border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10">
                <LocateFixed className="size-4" />
                Refresh
              </Button>
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm">
                  <Navigation className="size-4" />
                  View on map
                </Button>
              </a>
            </div>
          </div>
          {/* Mini map preview */}
          <div className="relative sm:w-56 h-32 sm:h-auto bg-emerald-500/10 mesh-bg overflow-hidden border-t sm:border-t-0 sm:border-l border-emerald-500/20">
            <div className="absolute inset-0 grid place-items-center">
              <div className="relative">
                <span className="absolute inset-0 -m-6 rounded-full bg-emerald-500/20 animate-ping" />
                <span className="relative grid size-12 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/40">
                  <Crosshair className="size-6 text-white" />
                </span>
              </div>
            </div>
            <div className="absolute bottom-2 left-2 right-2 text-[10px] text-emerald-700 dark:text-emerald-400 font-medium bg-background/70 backdrop-blur-sm rounded px-1.5 py-0.5">
              {live.lat.toFixed(4)}, {live.lng.toFixed(4)}
            </div>
          </div>
        </div>
      </Card>
    )
  }

  // idle
  return (
    <Card className="p-5 sm:p-6 gap-0 border-dashed border-emerald-500/40 bg-emerald-500/[0.03]">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="size-12 rounded-xl bg-emerald-500/10 grid place-items-center shrink-0">
          <Crosshair className="size-6 text-emerald-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">Detect your live location</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Get accurate, real-time location to personalise weather, maps, and recommendations for exactly where you are.
          </p>
        </div>
        <Button onClick={onDetect} className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shrink-0">
          <LocateFixed className="size-4" />
          Use my location
        </Button>
      </div>
    </Card>
  )
}
