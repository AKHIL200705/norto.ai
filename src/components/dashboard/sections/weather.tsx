'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  Sun, Cloud, CloudRain, CloudLightning, Snowflake, CloudFog,
  Droplets, Wind, Sun as SunIcon, RefreshCw, Loader2, MapPin,
  Shirt, Plane, AlertTriangle, Sparkles, ChevronRight, CloudSun,
  LocateFixed, Crosshair,
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Area, AreaChart,
} from 'recharts'
import { useAppStore } from '@/lib/store'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface ForecastDay {
  day: string
  temp: string
  condition: string
  icon: string
  humidity: string
  wind: string
  uv: string
}

interface WeatherPayload {
  current: {
    temp: string
    condition: string
    humidity: string
    wind: string
    uv: string
    feelsLike: string
  }
  forecast: ForecastDay[]
  clothing: string
  travelTip: string
}

const ICON_MAP: Record<string, React.ElementType> = {
  sun: Sun,
  cloud: Cloud,
  rain: CloudRain,
  storm: CloudLightning,
  snow: Snowflake,
  fog: CloudFog,
}

// Determine a sky-themed gradient based on the dominant condition.
function skyGradient(condition: string): string {
  const c = (condition || '').toLowerCase()
  if (c.includes('rain') || c.includes('drizzle')) {
    return 'from-slate-700 via-slate-600 to-teal-700'
  }
  if (c.includes('storm') || c.includes('thunder')) {
    return 'from-slate-800 via-slate-700 to-teal-800'
  }
  if (c.includes('snow') || c.includes('cold')) {
    return 'from-slate-400 via-teal-300 to-emerald-200'
  }
  if (c.includes('fog') || c.includes('mist') || c.includes('haze')) {
    return 'from-slate-500 via-slate-400 to-teal-400'
  }
  if (c.includes('cloud') || c.includes('overcast')) {
    return 'from-slate-500 via-teal-600 to-emerald-600'
  }
  // sunny / clear
  return 'from-amber-500 via-amber-500 to-emerald-600'
}

// Parse a temperature string like "31°C" or "32°/24°" → primary number
function tempNumber(t: string): number | null {
  if (!t) return null
  const m = t.match(/-?\d+(\.\d+)?/)
  return m ? parseFloat(m[0]) : null
}

// Parse UV value: "High" → 8, "6" → 6, "Low" → 2
function uvNumber(uv: string): number {
  if (!uv) return 0
  const lower = uv.toLowerCase()
  if (lower.includes('very high') || lower.includes('extreme')) return 11
  if (lower.includes('high')) return 8
  if (lower.includes('mod')) return 5
  if (lower.includes('low')) return 2
  const m = uv.match(/\d+/)
  return m ? parseInt(m[0], 10) : 0
}

function uvColor(uv: number): string {
  if (uv <= 2) return 'bg-emerald-500'
  if (uv <= 5) return 'bg-amber-500'
  if (uv <= 7) return 'bg-orange-500'
  if (uv <= 10) return 'bg-rose-500'
  return 'bg-rose-700'
}

function uvLabel(uv: number): string {
  if (uv <= 2) return 'Low'
  if (uv <= 5) return 'Moderate'
  if (uv <= 7) return 'High'
  if (uv <= 10) return 'Very High'
  return 'Extreme'
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
}

export function WeatherView() {
  const city = useAppStore((s) => s.city)
  const detectLocation = useAppStore((s) => s.detectLocation)
  const locationStatus = useAppStore((s) => s.locationStatus)
  const liveLocation = useAppStore((s) => s.liveLocation)
  const [data, setData] = React.useState<WeatherPayload | null>(null)
  const [raw, setRaw] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const locating = locationStatus === 'loading'

  const handleLocate = async () => {
    await detectLocation()
    const st = useAppStore.getState().locationStatus
    if (st === 'success') {
      const loc = useAppStore.getState().liveLocation
      toast.success('Using your live location', {
        description: loc ? `${loc.city} · ±${Math.round(loc.accuracy)}m` : undefined,
      })
      // weather auto-refetches via the [city] effect when city changes
    } else if (st === 'error') {
      toast.error('Could not detect location', {
        description: useAppStore.getState().locationError || undefined,
      })
    }
  }

  const load = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}`)
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || 'Failed to load weather')
      }
      const json = await res.json()
      setData(json.weather || null)
      setRaw(json.raw || null)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load weather'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [city])

  React.useEffect(() => {
    load()
  }, [load])

  const dominant = data?.current?.condition || ''
  const gradient = skyGradient(dominant)
  const CurrentIcon = data ? (ICON_MAP[data.forecast?.[0]?.icon] || ICON_MAP[data.current.condition?.toLowerCase().includes('rain') ? 'rain' : 'sun']) : Sun

  const chartData = React.useMemo(() => {
    if (!data?.forecast?.length) return []
    return data.forecast.map((f) => ({
      day: f.day,
      temp: tempNumber(f.temp) ?? 0,
    }))
  }, [data])

  const uvVal = data ? uvNumber(data.current.uv) : 0

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-6">
        {/* Header */}
        <motion.div variants={item} className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
              <MapPin className="size-3.5 text-emerald-600" />
              <span>{city}</span>
              {liveLocation && (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 rounded-full px-1.5 py-0.5">
                  <Crosshair className="size-2.5" />
                  Live · ±{Math.round(liveLocation.accuracy)}m
                </span>
              )}
              <span className="text-muted-foreground/40">•</span>
              <span>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">Weather Forecast</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLocate}
              disabled={locating}
              className="border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10"
            >
              {locating ? <Loader2 className="size-4 animate-spin" /> : <LocateFixed className="size-4" />}
              <span className="hidden sm:inline">{locating ? 'Locating…' : 'My location'}</span>
            </Button>
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={cn('size-4', loading && 'animate-spin')} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </motion.div>

        {loading && <WeatherSkeleton />}

        {!loading && error && (
          <motion.div variants={item}>
            <Card className="p-8 flex flex-col items-center text-center gap-3 border-rose-500/30 bg-rose-500/5">
              <div className="size-12 rounded-full bg-rose-500/10 flex items-center justify-center">
                <AlertTriangle className="size-6 text-rose-500" />
              </div>
              <h3 className="font-semibold">Couldn&apos;t load weather</h3>
              <p className="text-sm text-muted-foreground max-w-md">{error}</p>
              <Button onClick={load} size="sm" className="mt-1">
                <RefreshCw className="size-4" />
                Try again
              </Button>
            </Card>
          </motion.div>
        )}

        {!loading && !error && data && (
          <>
            {/* Hero current weather card */}
            <motion.div variants={item}>
              <Card className={cn(
                'relative overflow-hidden border-0 text-white shadow-xl shadow-emerald-500/20 bg-gradient-to-br',
                gradient,
              )}>
                <div className="absolute inset-0 mesh-bg opacity-20 pointer-events-none" />
                <div className="absolute -right-20 -top-20 size-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
                <div className="absolute -left-10 -bottom-10 size-48 rounded-full bg-amber-300/10 blur-3xl pointer-events-none" />

                <div className="relative p-6 sm:p-8 grid gap-6 lg:grid-cols-[1.4fr_1fr] items-center">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-white/15 text-white border-0 backdrop-blur-sm">
                        <CloudSun className="size-3 mr-1" />
                        Now in {city}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <motion.div
                        initial={{ scale: 0.85, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 120, damping: 12 }}
                        className="size-20 sm:size-24 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center"
                      >
                        <CurrentIcon className="size-12 sm:size-14 text-amber-300" />
                      </motion.div>
                      <div>
                        <div className="text-5xl sm:text-6xl font-bold tracking-tight">
                          {data.current.temp}
                        </div>
                        <div className="text-base sm:text-lg text-white/85 mt-1">{data.current.condition}</div>
                        <div className="text-xs text-white/70 mt-0.5">Feels like {data.current.feelsLike}</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <Stat icon={Droplets} label="Humidity" value={data.current.humidity} tint="bg-teal-400/20" />
                    <Stat icon={Wind} label="Wind" value={data.current.wind} tint="bg-emerald-300/20" />
                    <Stat icon={SunIcon} label="UV" value={data.current.uv} tint="bg-amber-400/20" />
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* 7-day forecast */}
            {data.forecast?.length > 0 && (
              <motion.div variants={item}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base sm:text-lg font-semibold tracking-tight flex items-center gap-2">
                    <Sparkles className="size-4 text-amber-500" />
                    7-day forecast
                  </h2>
                  <span className="text-xs text-muted-foreground">{data.forecast.length} days</span>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory lg:grid lg:grid-cols-7 lg:overflow-visible lg:pb-0">
                  {data.forecast.map((d, i) => {
                    const Icon = ICON_MAP[d.icon] || Sun
                    return (
                      <Card
                        key={i}
                        className="snap-start shrink-0 w-32 sm:w-36 lg:w-auto p-4 gap-0 text-center hover:shadow-md hover:border-emerald-500/30 transition-all"
                      >
                        <p className="text-xs font-medium text-muted-foreground">{d.day}</p>
                        <div className="my-3 size-12 mx-auto rounded-xl bg-gradient-to-br from-emerald-500/10 to-amber-500/10 flex items-center justify-center">
                          <Icon className="size-6 text-amber-500" />
                        </div>
                        <p className="text-sm font-semibold">{d.temp}</p>
                        <p className="text-[10px] text-muted-foreground mt-1 leading-tight line-clamp-2">{d.condition}</p>
                        <div className="mt-2 pt-2 border-t border-border/60 flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
                          <span className="inline-flex items-center gap-0.5"><Droplets className="size-2.5" />{d.humidity}</span>
                          <span className="inline-flex items-center gap-0.5"><Wind className="size-2.5" />{d.wind}</span>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* Chart + UV gauge */}
            <div className="grid lg:grid-cols-3 gap-4">
              {chartData.length > 0 && (
                <motion.div variants={item} className="lg:col-span-2">
                  <Card className="p-5 sm:p-6 gap-0 h-full">
                    <h3 className="font-semibold text-sm sm:text-base mb-1">Temperature trend</h3>
                    <p className="text-xs text-muted-foreground mb-4">Next 7 days (°C)</p>
                    <div className="h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10b981" stopOpacity={0.55} />
                              <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                          <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="rgba(0,0,0,0.4)" axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 11 }} stroke="rgba(0,0,0,0.4)" axisLine={false} tickLine={false} />
                          <Tooltip
                            contentStyle={{ borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)', fontSize: 12, boxShadow: '0 6px 24px rgba(0,0,0,0.08)' }}
                            formatter={(v: number) => [`${v}°C`, 'Temp']}
                          />
                          <Area type="monotone" dataKey="temp" stroke="#10b981" strokeWidth={2.5} fill="url(#tempGradient)" dot={{ fill: '#10b981', r: 3 }} activeDot={{ r: 5 }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* UV gauge */}
              <motion.div variants={item}>
                <Card className="p-5 sm:p-6 gap-0 h-full flex flex-col">
                  <h3 className="font-semibold text-sm sm:text-base">UV Index</h3>
                  <p className="text-xs text-muted-foreground mb-4">Sun exposure guidance</p>
                  <div className="flex-1 flex flex-col items-center justify-center gap-4">
                    <div className="relative size-32">
                      <svg viewBox="0 0 100 100" className="size-full -rotate-90">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="8" />
                        <circle
                          cx="50" cy="50" r="42" fill="none"
                          stroke={uvVal <= 2 ? '#10b981' : uvVal <= 5 ? '#f59e0b' : uvVal <= 7 ? '#f97316' : '#e11d48'}
                          strokeWidth="8" strokeLinecap="round"
                          strokeDasharray={`${Math.min(uvVal / 11, 1) * 264} 264`}
                          style={{ transition: 'stroke-dasharray 0.8s ease' }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold">{uvVal}</span>
                        <span className="text-[10px] text-muted-foreground">{uvLabel(uvVal)}</span>
                      </div>
                    </div>
                    <div className="w-full">
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                        <span>0</span><span>5</span><span>11+</span>
                      </div>
                      <div className="h-2 rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-600 overflow-hidden">
                        <div className="h-full" style={{ width: `${Math.min((uvVal / 11) * 100, 100)}%` }} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-3 text-center leading-relaxed">
                        {uvVal <= 2 && 'No protection needed.'}
                        {uvVal > 2 && uvVal <= 5 && 'Sunscreen recommended.'}
                        {uvVal > 5 && uvVal <= 7 && 'Seek shade during midday.'}
                        {uvVal > 7 && uvVal <= 10 && 'Limit sun exposure, use SPF 30+.'}
                        {uvVal > 10 && 'Avoid being outside during midday.'}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Clothing + Travel tip */}
            <div className="grid sm:grid-cols-2 gap-4">
              <motion.div variants={item}>
                <Card className="p-5 sm:p-6 gap-0 h-full border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent">
                  <div className="flex items-start gap-3">
                    <div className="size-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shrink-0">
                      <Shirt className="size-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base">Clothing recommendation</h3>
                      <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{data.clothing}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
              <motion.div variants={item}>
                <Card className="p-5 sm:p-6 gap-0 h-full border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
                  <div className="flex items-start gap-3">
                    <div className="size-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-md shrink-0">
                      <Plane className="size-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base">Travel tip</h3>
                      <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{data.travelTip}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Raw fallback */}
            {raw && (
              <motion.div variants={item}>
                <Card className="p-5 gap-0 border-amber-500/30 bg-amber-500/5">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="size-4 text-amber-500" />
                    <h3 className="font-semibold text-sm">Raw weather summary</h3>
                  </div>
                  <pre className="text-xs whitespace-pre-wrap text-muted-foreground max-h-72 overflow-y-auto font-mono leading-relaxed">{raw}</pre>
                </Card>
              </motion.div>
            )}
          </>
        )}
      </motion.div>
    </div>
  )
}

function Stat({ icon: Icon, label, value, tint }: { icon: React.ElementType; label: string; value: string; tint: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 p-3">
      <div className={cn('size-7 rounded-lg flex items-center justify-center', tint)}>
        <Icon className="size-3.5 text-white" />
      </div>
      <div>
        <p className="text-[10px] text-white/70 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  )
}

function WeatherSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-64 rounded-2xl w-full" />
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-xl" />
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <Skeleton className="h-64 rounded-xl lg:col-span-2" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  )
}
