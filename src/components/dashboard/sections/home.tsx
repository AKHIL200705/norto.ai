'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  Sparkles, Map, Wallet, Languages, UtensilsCrossed,
  MapPin, Wallet as WalletIcon, Bookmark, Languages as LangIcon,
  ArrowRight, TrendingUp, Lightbulb, ChevronRight,
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
}

const QUICK_ACTIONS: QuickAction[] = [
  { id: 'assistant', title: 'AI Assistant', desc: 'Ask anything about your new city', icon: Sparkles },
  { id: 'map', title: 'Smart Map', desc: 'Find nearby essentials & places', icon: Map },
  { id: 'budget', title: 'Budget Planner', desc: 'Track spend & get savings tips', icon: Wallet },
  { id: 'translator', title: 'Translator', desc: 'Local phrases & instant translation', icon: Languages },
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
    { label: 'Current City', value: city, icon: MapPin, section: 'map' as DashboardSection },
    { label: 'Monthly Budget', value: isAuth && user ? `₹${user.budget.toLocaleString('en-IN')}` : '₹25,000', icon: WalletIcon, section: 'budget' as DashboardSection },
    { label: 'Saved Places', value: String(realSavedCount), icon: Bookmark, section: 'saved' as DashboardSection },
    { label: 'Language', value: isAuth && user ? user.language : 'English', icon: LangIcon, section: 'translator' as DashboardSection },
  ]

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto text-[#3D4852]">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-6"
      >
        {/* Hero greeting card — Neumorphic extruded soft card */}
        <motion.div variants={item}>
          <div className="relative overflow-hidden rounded-[32px] bg-[#E0E5EC] neu-extruded p-6 sm:p-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between border-0">
            <div className="flex flex-col gap-3 max-w-2xl">
              <div className="flex items-center gap-2">
                <Badge className="bg-[#6C63FF]/15 text-[#6C63FF] border-0 rounded-full px-3 py-1 font-semibold text-xs">
                  <Sparkles className="size-3 mr-1" />
                  Dashboard
                </Badge>
                <span className="text-xs text-[#6B7280] font-medium">
                  {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-display text-[#3D4852]">
                Welcome back, {firstName} 👋
              </h1>
              <p className="text-[#6B7280] text-sm sm:text-base leading-relaxed">
                You&apos;re all set in <span className="font-bold text-[#3D4852] underline decoration-[#6C63FF] underline-offset-4">{city}</span>. Let&apos;s make your move smoother — explore essentials, plan your budget, and discover the city with AI by your side.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  onClick={() => setSection('assistant')}
                  size="lg"
                  className="bg-[#6C63FF] text-white hover:bg-[#8B84FF] rounded-2xl neu-extruded font-semibold px-6"
                >
                  Plan my move
                  <ArrowRight className="size-4 ml-1" />
                </Button>
                <Button
                  onClick={() => setSection('map')}
                  variant="secondary"
                  size="lg"
                  className="bg-[#E0E5EC] text-[#3D4852] hover:text-[#6C63FF] rounded-2xl neu-extruded font-semibold px-6"
                >
                  <Map className="size-4 mr-2" />
                  Explore the city
                </Button>
              </div>
            </div>
            <div className="hidden lg:flex shrink-0 size-28 rounded-3xl bg-[#E0E5EC] neu-inset-deep items-center justify-center animate-float">
              <Sparkles className="size-12 text-[#6C63FF]" />
            </div>
          </div>
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

        {/* Quick stats cards — Neumorphic extruded cards */}
        <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => {
            const Icon = s.icon
            return (
              <motion.button
                key={s.label}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSection(s.section)}
                className="text-left"
              >
                <div className="rounded-2xl bg-[#E0E5EC] neu-extruded hover:neu-extruded-hover p-5 gap-0 relative overflow-hidden h-full border-0 transition-all duration-300 group cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="size-10 rounded-xl bg-[#E0E5EC] neu-inset-deep flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon className="size-5 text-[#6C63FF]" />
                    </div>
                    <ChevronRight className="size-4 text-[#6B7280] group-hover:text-[#6C63FF] group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-[#6B7280] group-hover:text-[#6C63FF] transition-colors">{s.label}</p>
                  <p className="text-xl sm:text-2xl font-extrabold tracking-tight mt-0.5 text-[#3D4852]">{s.value}</p>
                </div>
              </motion.button>
            )
          })}
        </motion.div>

        {/* Quick actions grid */}
        <motion.div variants={item}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-[#3D4852]">Quick Actions</h2>
            <span className="text-xs font-semibold text-[#6C63FF]">Tap to explore →</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {QUICK_ACTIONS.map((a) => {
              const Icon = a.icon
              return (
                <motion.button
                  key={a.id}
                  onClick={() => setSection(a.id)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="text-left"
                >
                  <div className="rounded-2xl bg-[#E0E5EC] neu-extruded hover:neu-extruded-hover p-5 h-full relative overflow-hidden group transition-all duration-300">
                    <div className="size-11 rounded-xl bg-[#E0E5EC] neu-inset-deep flex items-center justify-center">
                      <Icon className="size-5 text-[#6C63FF]" />
                    </div>
                    <h3 className="mt-3 text-sm font-bold tracking-tight text-[#3D4852]">{a.title}</h3>
                    <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">{a.desc}</p>
                    <ArrowRight className="absolute bottom-4 right-4 size-4 text-[#6C63FF] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all" />
                  </div>
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* AI Insight row */}
        <motion.div variants={item}>
          <div className="rounded-[32px] bg-[#E0E5EC] neu-extruded p-6 relative overflow-hidden border-0">
            <div className="relative flex items-start gap-4">
              <div className="size-11 rounded-2xl bg-[#E0E5EC] neu-inset-deep flex items-center justify-center shrink-0">
                <Lightbulb className="size-5 text-[#6C63FF]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm sm:text-base tracking-tight text-[#3D4852]">AI Insight of the day</h3>
                  <Badge variant="secondary" className="text-[10px] bg-[#6C63FF]/15 text-[#6C63FF] border-0 font-bold rounded-full">
                    <Sparkles className="size-3 mr-1" />
                    Tip
                  </Badge>
                </div>
                <p className="text-sm text-[#6B7280] mt-1.5 leading-relaxed">
                  Tip: Hitech City has the best PG options under <span className="font-bold text-[#3D4852]">₹8,000</span> near metro stations. Areas like <span className="font-bold text-[#3D4852]">Madhapur</span> and <span className="font-bold text-[#3D4852]">Kondapur</span> balance commute, cost, and connectivity perfectly.
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-[#6C63FF] hover:text-[#8B84FF] hover:bg-[#6C63FF]/10 px-0 font-bold"
                  onClick={() => setSection('assistant')}
                >
                  Ask AI for more details
                  <ArrowRight className="size-3.5 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recommended for you */}
        <motion.div variants={item}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight flex items-center gap-2 text-[#3D4852]">
              <TrendingUp className="size-5 text-[#6C63FF]" />
              Recommended for you
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {RECOMMENDED.map((r, i) => (
              <div
                key={i}
                className="rounded-2xl bg-[#E0E5EC] neu-extruded hover:neu-extruded-hover p-5 cursor-pointer group transition-all duration-300"
                onClick={() => setSection('assistant')}
              >
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-[10px] bg-[#6C63FF]/15 text-[#6C63FF] border-0 font-bold rounded-full">
                    {r.tag}
                  </Badge>
                  <ArrowRight className="size-3.5 text-[#6B7280] group-hover:text-[#6C63FF] group-hover:translate-x-0.5 transition-all" />
                </div>
                <h4 className="mt-2.5 text-sm font-bold leading-snug text-[#3D4852]">{r.title}</h4>
                <p className="text-xs text-[#6B7280] mt-1">{r.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

/**
 * Live-location card for the dashboard home with Neumorphism styling.
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
      <div className="rounded-[32px] bg-[#E0E5EC] neu-extruded p-6">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-[#E0E5EC] neu-inset-deep grid place-items-center">
            <Loader2 className="size-6 text-[#6C63FF] animate-spin" />
          </div>
          <div>
            <p className="font-bold text-[#3D4852]">Detecting your location…</p>
            <p className="text-sm text-[#6B7280] mt-0.5">
              Using high-accuracy GPS. This usually takes a few seconds.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="rounded-[32px] bg-[#E0E5EC] neu-extruded p-6">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-[#E0E5EC] neu-inset-deep grid place-items-center shrink-0">
            <AlertTriangle className="size-6 text-[#6C63FF]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[#3D4852]">Couldn&apos;t detect your location</p>
            <p className="text-sm text-[#6B7280] mt-0.5 line-clamp-2">{error}</p>
          </div>
          <Button onClick={onDetect} variant="secondary" size="sm" className="bg-[#E0E5EC] neu-extruded text-[#6C63FF] hover:text-[#8B84FF] font-bold rounded-2xl">
            <LocateFixed className="size-4 mr-1" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  if (status === 'success' && live) {
    const accuracyM = Math.round(live.accuracy)
    const accuracyLabel = accuracyM < 50 ? 'High accuracy' : accuracyM < 200 ? 'Good accuracy' : 'Approximate'
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${live.lat},${live.lng}`
    return (
      <div className="rounded-[32px] bg-[#E0E5EC] neu-extruded p-6 overflow-hidden">
        <div className="grid sm:grid-cols-[1fr_auto] gap-6">
          {/* Details */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#38B2AC]">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[#38B2AC] opacity-75 animate-ping" />
                  <span className="relative inline-flex size-2 rounded-full bg-[#38B2AC]" />
                </span>
                Live location
              </span>
              <Badge variant="secondary" className="text-[10px] bg-[#38B2AC]/15 text-[#38B2AC] border-0 font-bold rounded-full">
                {accuracyLabel} · ±{accuracyM}m
              </Badge>
            </div>
            <h3 className="text-xl font-bold tracking-tight flex items-center gap-2 text-[#3D4852]">
              <MapPin className="size-5 text-[#6C63FF]" />
              {live.city}
            </h3>
            <p className="text-sm text-[#6B7280] mt-1">
              {[live.locality, live.region, live.country].filter(Boolean).join(', ')}
            </p>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="rounded-xl bg-[#E0E5EC] neu-inset-sm px-3 py-2">
                <p className="text-[10px] uppercase tracking-wider text-[#6B7280] font-bold">Latitude</p>
                <p className="text-sm font-mono font-bold mt-0.5 text-[#3D4852]">{live.lat.toFixed(5)}</p>
              </div>
              <div className="rounded-xl bg-[#E0E5EC] neu-inset-sm px-3 py-2">
                <p className="text-[10px] uppercase tracking-wider text-[#6B7280] font-bold">Longitude</p>
                <p className="text-sm font-mono font-bold mt-0.5 text-[#3D4852]">{live.lng.toFixed(5)}</p>
              </div>
              <div className="rounded-xl bg-[#E0E5EC] neu-inset-sm px-3 py-2">
                <p className="text-[10px] uppercase tracking-wider text-[#6B7280] font-bold">Detected</p>
                <p className="text-sm font-bold mt-0.5 text-[#3D4852]">{new Date(live.detectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
              <Button onClick={onDetect} variant="secondary" size="sm" className="bg-[#E0E5EC] neu-extruded text-[#6C63FF] hover:text-[#8B84FF] font-bold rounded-2xl">
                <LocateFixed className="size-4 mr-1" />
                Refresh
              </Button>
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm" className="text-[#3D4852] hover:text-[#6C63FF] font-semibold">
                  <Navigation className="size-4 mr-1" />
                  View on map
                </Button>
              </a>
            </div>
          </div>
          {/* Map well indicator */}
          <div className="relative sm:w-56 h-32 sm:h-auto rounded-2xl bg-[#E0E5EC] neu-inset-deep grid place-items-center p-4">
            <div className="relative text-center">
              <span className="absolute inset-0 -m-4 rounded-full bg-[#6C63FF]/20 animate-ping" />
              <span className="relative grid size-12 place-items-center rounded-full bg-[#6C63FF] text-white shadow-lg mx-auto mb-2">
                <Crosshair className="size-6" />
              </span>
              <p className="text-[10px] font-mono text-[#6B7280] font-bold">{live.lat.toFixed(4)}, {live.lng.toFixed(4)}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // idle
  return (
    <div className="rounded-[32px] bg-[#E0E5EC] neu-extruded p-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="size-12 rounded-2xl bg-[#E0E5EC] neu-inset-deep grid place-items-center shrink-0">
          <Crosshair className="size-6 text-[#6C63FF]" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-[#3D4852]">Detect your live location</h3>
          <p className="text-sm text-[#6B7280] mt-0.5">
            Get accurate, real-time location to personalise maps and recommendations for exactly where you are.
          </p>
        </div>
        <Button onClick={onDetect} className="bg-[#6C63FF] hover:bg-[#8B84FF] text-white font-bold rounded-2xl neu-extruded shrink-0 px-5">
          <LocateFixed className="size-4 mr-1.5" />
          Use my location
        </Button>
      </div>
    </div>
  )
}
