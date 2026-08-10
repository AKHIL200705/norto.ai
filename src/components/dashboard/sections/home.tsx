'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  Sparkles, Map, Wallet, Languages, Siren, UtensilsCrossed,
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
]

const RECENT = [
  { icon: Bookmark, title: 'Saved KIMS Hospital to places', time: '2 hours ago', color: 'text-[#DD0200] bg-[#DD0200]/10' },
  { icon: WalletIcon, title: 'Budget analyzed — Savings rate 32%', time: '5 hours ago', color: 'text-[#55100D] dark:text-[#DD0200] bg-[#55100D]/10' },
  { icon: UtensilsCrossed, title: 'Found 6 veg restaurants near Hitech City', time: 'Yesterday', color: 'text-[#DD0200] bg-[#DD0200]/10' },
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
    { label: 'Current City', value: city, icon: MapPin, color: 'from-[#DD0200] to-[#55100D]', iconColor: 'text-[#DD0200]', section: 'map' as DashboardSection },
    { label: 'Monthly Budget', value: isAuth && user ? `₹${user.budget.toLocaleString('en-IN')}` : '₹25,000', icon: WalletIcon, color: 'from-[#8B0000] to-[#1A0706]', iconColor: 'text-[#55100D]', section: 'budget' as DashboardSection },
    { label: 'Saved Places', value: String(realSavedCount), icon: Bookmark, color: 'from-[#DD0200] to-[#8B0000]', iconColor: 'text-[#DD0200]', section: 'saved' as DashboardSection },
    { label: 'Language', value: isAuth && user ? user.language : 'English', icon: LangIcon, color: 'from-[#55100D] to-[#1A0706]', iconColor: 'text-[#55100D]', section: 'translator' as DashboardSection },
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
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-[#DD0200] via-[#8B0000] to-[#55100D] text-white shadow-xl shadow-[#DD0200]/20">
            <div className="absolute inset-0 mesh-bg opacity-30 pointer-events-none" />
            <div className="absolute -right-16 -top-16 size-64 rounded-full bg-[#DD0200]/30 blur-3xl pointer-events-none" />
            <div className="absolute -left-12 -bottom-12 size-48 rounded-full bg-[#55100D]/40 blur-3xl pointer-events-none" />
            <div className="relative px-6 py-7 sm:px-8 sm:py-9 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-3 max-w-2xl">
                <div className="flex items-center gap-2">
                  <Badge className="bg-white/15 text-white border-0 hover:bg-white/20 backdrop-blur-md">
                    <Sparkles className="size-3 mr-1" />
                    Dashboard
                  </Badge>
                  <span className="text-xs text-red-100/90 font-medium">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                  Welcome back, {firstName} 👋
                </h1>
                <p className="text-red-50/95 text-sm sm:text-base leading-relaxed">
                  You&apos;re all set in <span className="font-bold text-[#D9D9D9] underline decoration-[#DD0200] underline-offset-4">{city}</span>. Let&apos;s make your move smoother — explore essentials, plan your budget, and discover the city with AI by your side.
                </p>
                <div className="flex flex-wrap gap-3 pt-1">
                  <Button
                    onClick={() => setSection('assistant')}
                    className="bg-white text-[#DD0200] hover:bg-[#D9D9D9]/30 hover:text-white shadow-lg font-bold"
                    size="lg"
                  >
                    Plan my move
                    <ArrowRight className="size-4" />
                  </Button>
                  <Button
                    onClick={() => setSection('map')}
                    variant="outline"
                    size="lg"
                    className="bg-white/10 text-white border-white/30 hover:bg-white/20 hover:text-white backdrop-blur-md font-semibold"
                  >
                    <Map className="size-4" />
                    Explore the city
                  </Button>
                </div>
              </div>
              <div className="hidden lg:flex shrink-0 size-32 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 items-center justify-center animate-float shadow-xl">
                <Sparkles className="size-14 text-white" />
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

        {/* Quick stats cards — glass effect */}
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
                <Card className="glass-card p-4 sm:p-5 gap-0 relative overflow-hidden h-full border-[#D9D9D9] hover:border-[#DD0200] hover:bg-[#DD0200]/5 hover:shadow-lg hover:shadow-[#DD0200]/15 transition-all duration-300 group cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className={cn('size-10 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-md group-hover:scale-110 transition-transform', s.color)}>
                      <Icon className="size-5 text-white" />
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground/50 group-hover:text-[#DD0200] group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="mt-3 text-[11px] font-bold uppercase tracking-wide text-muted-foreground group-hover:text-[#DD0200] transition-colors">{s.label}</p>
                  <p className="text-xl sm:text-2xl font-extrabold tracking-tight mt-0.5">{s.value}</p>
                </Card>
              </motion.button>
            )
          })}
        </motion.div>

        {/* Quick actions grid — glass effect */}
        <motion.div variants={item}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">Quick Actions</h2>
            <span className="text-xs font-semibold text-[#DD0200]">Tap to explore →</span>
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
                  <Card className="glass-card p-4 sm:p-5 gap-0 h-full relative overflow-hidden group">
                    <div className={cn('size-11 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-lg', a.gradient)}>
                      <Icon className="size-5 text-white" />
                    </div>
                    <h3 className="mt-3 text-sm font-bold tracking-tight">{a.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{a.desc}</p>
                    {/* Hover arrow */}
                    <ArrowRight className="absolute bottom-4 right-4 size-4 text-[#DD0200] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all" />
                  </Card>
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* AI Insight row — glass effect */}
        <motion.div variants={item}>
          <Card className="glass-card relative overflow-hidden border-[#DD0200]/30 bg-gradient-to-br from-[#DD0200]/5 via-[#55100D]/5 to-transparent p-5 sm:p-6 gap-0">
            <div className="absolute -right-8 -top-8 size-32 rounded-full bg-[#DD0200]/10 blur-2xl pointer-events-none" />
            <div className="relative flex items-start gap-3">
              <div className="size-10 rounded-xl bg-gradient-to-br from-[#DD0200] to-[#55100D] flex items-center justify-center shadow-md shrink-0">
                <Lightbulb className="size-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm sm:text-base tracking-tight">AI Insight of the day</h3>
                  <Badge variant="secondary" className="text-[10px] bg-[#DD0200]/15 text-[#DD0200] border-0 font-bold">
                    <Sparkles className="size-3 mr-1" />
                    Tip
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                  Tip: Hitech City has the best PG options under <span className="font-bold text-foreground">₹8,000</span> near metro stations. Areas like <span className="font-bold text-foreground">Madhapur</span> and <span className="font-bold text-foreground">Kondapur</span> balance commute, cost, and connectivity perfectly.
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 text-[#DD0200] hover:text-[#DD0200] hover:bg-[#DD0200]/10 px-0 -ml-1 font-bold"
                  onClick={() => setSection('assistant')}
                >
                  Ask AI for more details
                  <ArrowRight className="size-3.5" />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Recommended for you — glass effect */}
        <motion.div variants={item}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight flex items-center gap-2">
              <TrendingUp className="size-5 text-[#DD0200]" />
              Recommended for you
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
            {RECOMMENDED.map((r, i) => (
              <Card key={i} className="glass-card p-4 gap-0 cursor-pointer group" onClick={() => setSection('assistant')}>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-[10px] bg-[#DD0200]/15 text-[#DD0200] border-0 font-bold">
                    {r.tag}
                  </Badge>
                  <ArrowRight className="size-3.5 text-muted-foreground/50 group-hover:text-[#DD0200] group-hover:translate-x-0.5 transition-all" />
                </div>
                <h4 className="mt-2.5 text-sm font-bold leading-snug">{r.title}</h4>
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
 * Live-location card for the dashboard home with custom palette & glass effect.
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
      <Card className="glass-card p-5 sm:p-6 gap-0 border-[#DD0200]/30 bg-[#DD0200]/5">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-xl bg-[#DD0200]/15 grid place-items-center">
            <Loader2 className="size-6 text-[#DD0200] animate-spin" />
          </div>
          <div>
            <p className="font-bold">Detecting your location…</p>
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
      <Card className="glass-card p-5 sm:p-6 gap-0 border-[#DD0200]/30 bg-[#DD0200]/5">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-xl bg-[#DD0200]/15 grid place-items-center shrink-0">
            <AlertTriangle className="size-6 text-[#DD0200]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold">Couldn&apos;t detect your location</p>
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{error}</p>
          </div>
          <Button onClick={onDetect} variant="outline" size="sm" className="border-[#DD0200]/30 text-[#DD0200] hover:bg-[#DD0200]/10 shrink-0 font-bold">
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
      <Card className="glass-card p-0 gap-0 overflow-hidden border-[#D9D9D9]">
        <div className="grid sm:grid-cols-[1fr_auto]">
          {/* Details */}
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#DD0200]">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[#DD0200] opacity-75 animate-ping" />
                  <span className="relative inline-flex size-2 rounded-full bg-[#DD0200]" />
                </span>
                Live location
              </span>
              <Badge variant="secondary" className="text-[10px] bg-[#DD0200]/15 text-[#DD0200] border-0 font-bold">
                {accuracyLabel} · ±{accuracyM}m
              </Badge>
            </div>
            <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <MapPin className="size-5 text-[#DD0200]" />
              {live.city}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {[live.locality, live.region, live.country].filter(Boolean).join(', ')}
            </p>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="rounded-lg bg-muted/50 px-3 py-2 border border-[#D9D9D9]/40">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Latitude</p>
                <p className="text-sm font-mono font-bold mt-0.5">{live.lat.toFixed(5)}</p>
              </div>
              <div className="rounded-lg bg-muted/50 px-3 py-2 border border-[#D9D9D9]/40">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Longitude</p>
                <p className="text-sm font-mono font-bold mt-0.5">{live.lng.toFixed(5)}</p>
              </div>
              <div className="rounded-lg bg-muted/50 px-3 py-2 border border-[#D9D9D9]/40">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Detected</p>
                <p className="text-sm font-bold mt-0.5">{new Date(live.detectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <Button onClick={onDetect} variant="outline" size="sm" className="border-[#DD0200]/30 text-[#DD0200] hover:bg-[#DD0200]/10 font-bold">
                <LocateFixed className="size-4" />
                Refresh
              </Button>
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm" className="font-semibold">
                  <Navigation className="size-4" />
                  View on map
                </Button>
              </a>
            </div>
          </div>
          {/* Mini map preview */}
          <div className="relative sm:w-56 h-32 sm:h-auto bg-[#DD0200]/10 mesh-bg overflow-hidden border-t sm:border-t-0 sm:border-l border-[#D9D9D9]">
            <div className="absolute inset-0 grid place-items-center">
              <div className="relative">
                <span className="absolute inset-0 -m-6 rounded-full bg-[#DD0200]/25 animate-ping" />
                <span className="relative grid size-12 place-items-center rounded-full bg-gradient-to-br from-[#DD0200] to-[#55100D] shadow-lg shadow-[#DD0200]/40">
                  <Crosshair className="size-6 text-white" />
                </span>
              </div>
            </div>
            <div className="absolute bottom-2 left-2 right-2 text-[10px] text-[#DD0200] font-bold bg-background/85 backdrop-blur-md rounded px-1.5 py-0.5 border border-[#D9D9D9]">
              {live.lat.toFixed(4)}, {live.lng.toFixed(4)}
            </div>
          </div>
        </div>
      </Card>
    )
  }

  // idle
  return (
    <Card className="glass-card p-5 sm:p-6 gap-0 border-dashed border-[#DD0200]/40 bg-[#DD0200]/[0.03]">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="size-12 rounded-xl bg-[#DD0200]/15 grid place-items-center shrink-0">
          <Crosshair className="size-6 text-[#DD0200]" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold">Detect your live location</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Get accurate, real-time location to personalise maps and recommendations for exactly where you are.
          </p>
        </div>
        <Button onClick={onDetect} className="bg-gradient-to-r from-[#DD0200] via-[#8B0000] to-[#55100D] hover:opacity-95 text-white font-bold shrink-0 shadow-lg shadow-[#DD0200]/25">
          <LocateFixed className="size-4" />
          Use my location
        </Button>
      </div>
    </Card>
  )
}
