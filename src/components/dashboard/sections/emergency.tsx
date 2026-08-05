'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  Siren, Phone, MapPin, Navigation, Bookmark, ShieldAlert, Truck,
  Flame, HeartPulse, Droplet, CloudRain, Lightbulb, Loader2, Share2,
  Square, Plus, Clock, AlertTriangle, ShieldCheck, Cross, Building2,
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion'
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

const EMERGENCY_CONTACTS = [
  { name: 'Ambulance', number: '108', icon: HeartPulse, color: 'from-rose-500 to-red-600', desc: 'Medical emergency' },
  { name: 'Police', number: '100', icon: ShieldAlert, color: 'from-emerald-600 to-teal-700', desc: 'Crime & safety' },
  { name: 'Fire', number: '101', icon: Flame, color: 'from-amber-500 to-orange-600', desc: 'Fire & rescue' },
  { name: 'Women Helpline', number: '1091', icon: HeartPulse, color: 'from-pink-500 to-rose-600', desc: 'Women safety' },
  { name: 'Blood Bank', number: '104', icon: Droplet, color: 'from-rose-600 to-red-700', desc: 'Blood & health' },
  { name: 'Disaster Mgmt', number: '1070', icon: CloudRain, color: 'from-slate-600 to-teal-700', desc: 'Disaster response' },
]

interface NearbyService {
  id: string
  name: string
  type: 'hospital' | 'police' | 'fire' | 'blood'
  address: string
  distance: string
  open247: boolean
  phone: string
}

const NEARBY_SERVICES: NearbyService[] = [
  { id: 'n1', name: 'KIMS Hospital', type: 'hospital', address: 'Minister Rd, Krishna Nagar Colony', distance: '1.2 km', open247: true, phone: '04023354698' },
  { id: 'n2', name: 'Apollo Hospitals', type: 'hospital', address: 'Road No 72, Film Nagar', distance: '2.8 km', open247: true, phone: '04023607777' },
  { id: 'n3', name: 'Yashoda Hospitals', type: 'hospital', address: 'Raj Bhavan Rd, Somajiguda', distance: '3.5 km', open247: true, phone: '04045678900' },
  { id: 'n4', name: 'Banjara Hills PS', type: 'police', address: 'Road No 12, Banjara Hills', distance: '1.8 km', open247: true, phone: '04023381234' },
  { id: 'n5', name: 'Jubilee Hills PS', type: 'police', address: 'Road No 51, Jubilee Hills', distance: '2.4 km', open247: true, phone: '04023541234' },
  { id: 'n6', name: 'Hyderabad Fire Station', type: 'fire', address: 'HQ, Basheerbagh', distance: '3.1 km', open247: true, phone: '101' },
  { id: 'n7', name: 'Sanathnagar Fire Stn', type: 'fire', address: 'Sanathnagar Main Rd', distance: '4.6 km', open247: true, phone: '101' },
  { id: 'n8', name: 'Red Cross Blood Bank', type: 'blood', address: 'Masab Tank, Hyderabad', distance: '2.2 km', open247: false, phone: '04023311511' },
]

const SERVICE_META: Record<NearbyService['type'], { label: string; icon: React.ElementType; color: string }> = {
  hospital: { label: 'Hospital', icon: Cross, color: 'text-rose-600 bg-rose-500/10' },
  police: { label: 'Police Station', icon: ShieldAlert, color: 'text-emerald-600 bg-emerald-500/10' },
  fire: { label: 'Fire Station', icon: Flame, color: 'text-amber-600 bg-amber-500/10' },
  blood: { label: 'Blood Bank', icon: Droplet, color: 'text-rose-500 bg-rose-500/10' },
}

const SAFETY_TIPS = [
  { q: 'What to do during a medical emergency', a: 'Stay calm and call 108 immediately. Share your exact location and the nature of the emergency. If possible, send someone to the road to guide the ambulance. Keep important medical info (blood group, allergies, medications) handy on your phone.' },
  { q: 'Fire safety at home', a: 'Keep fire extinguishers in the kitchen and near electrical panels. Never leave cooking unattended. Know your building\'s emergency exits and assembly points. In case of fire, stay low to avoid smoke inhalation and call 101.' },
  { q: 'Women safety while travelling', a: 'Share live location with a trusted contact when travelling at night. Use only verified cab services. Save 1091 (Women Helpline) on speed dial. Avoid deserted routes after dark and trust your instincts — leave any uncomfortable situation.' },
  { q: 'During floods or heavy rain', a: 'Avoid walking or driving through waterlogged roads — even shallow water can sweep you away. Move to higher floors if water enters your home. Keep emergency supplies (water, food, torch, medicines) ready. Monitor weather alerts and follow evacuation orders.' },
  { q: 'Earthquake safety', a: 'Drop, cover, and hold on under a sturdy table. Stay away from windows and heavy furniture. If outdoors, move to an open area away from buildings and power lines. Do not use elevators during or immediately after an earthquake.' },
]

const ALERTS = [
  { level: 'yellow', title: 'Heavy rain warning', desc: 'Heavy rainfall expected over next 48 hours. Avoid low-lying areas.', icon: CloudRain, tint: 'border-amber-500/30 bg-amber-500/5' },
  { level: 'orange', title: 'Traffic congestion', desc: 'Major delays expected on Hitech City Rd due to waterlogging.', icon: Truck, tint: 'border-orange-500/30 bg-orange-500/5' },
]

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
}

export function Emergency() {
  const city = useAppStore((s) => s.city)
  const [sosActive, setSosActive] = React.useState(false)
  const [sosCountdown, setSosCountdown] = React.useState(5)
  const [sharing, setSharing] = React.useState(false)
  const [savingId, setSavingId] = React.useState<string | null>(null)

  // Countdown when SOS is active
  React.useEffect(() => {
    if (!sosActive) return
    if (sosCountdown <= 0) return
    const t = setTimeout(() => setSosCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [sosActive, sosCountdown])

  const activateSOS = () => {
    setSosActive(true)
    setSosCountdown(5)
    toast.success('SOS activated. Help is on the way.')
  }

  const cancelSOS = () => {
    setSosActive(false)
    setSosCountdown(5)
    toast.info('SOS cancelled')
  }

  const toggleShare = () => {
    if (!sharing) {
      setSharing(true)
      toast.success('Sharing live location with emergency contacts')
    } else {
      setSharing(false)
      toast.info('Stopped sharing live location')
    }
  }

  const handleSavePlace = async (s: NearbyService) => {
    setSavingId(s.id)
    try {
      await api('/api/places', {
        body: {
          name: s.name,
          category: s.type,
          address: s.address,
          distance: s.distance,
          notes: SERVICE_META[s.type].label,
        },
      })
      toast.success(`Saved ${s.name}`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-6">
        {/* Header */}
        <motion.div variants={item}>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <ShieldAlert className="size-3.5 text-rose-600" />
            <span>Emergency resources for {city}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Emergency &amp; Safety</h1>
        </motion.div>

        {/* SOS hero */}
        <motion.div variants={item}>
          <Card className={cn(
            'relative overflow-hidden border-0 text-white shadow-xl bg-gradient-to-br',
            sosActive ? 'from-rose-700 via-red-700 to-rose-800 shadow-rose-500/30' : 'from-rose-600 via-red-600 to-rose-700 shadow-rose-500/20',
          )}>
            <div className="absolute inset-0 mesh-bg opacity-20 pointer-events-none" />
            <div className="absolute -right-16 -top-16 size-64 rounded-full bg-amber-300/10 blur-3xl pointer-events-none" />
            <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
              {!sosActive ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      className="relative size-32 sm:size-36 rounded-full bg-white text-rose-600 font-bold flex flex-col items-center justify-center shadow-2xl shadow-rose-900/40"
                    >
                      <span className="absolute inset-0 rounded-full bg-white/40 animate-ping" />
                      <Siren className="size-9 mb-1" />
                      <span className="text-lg tracking-wider">SOS</span>
                    </motion.button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Activate SOS?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will trigger an emergency alert. Your live location will be shared with nearby emergency services and your saved contacts. Use only in real emergencies.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={activateSOS}
                        className="bg-rose-600 hover:bg-rose-700 text-white"
                      >
                        <Siren className="size-4 mr-1" />
                        Activate SOS
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <div className="size-32 sm:size-36 rounded-full bg-white/15 backdrop-blur-md border border-white/30 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold tabular-nums">{sosCountdown || '!'}</span>
                  <span className="text-[10px] uppercase tracking-wide text-white/80">{sosCountdown > 0 ? 'Notifying' : 'Active'}</span>
                </div>
              )}

              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl font-bold">
                  {sosActive ? (sosCountdown > 0 ? 'SOS Activating…' : 'SOS Active — Help is on the way') : 'Emergency SOS'}
                </h2>
                <p className="text-sm text-white/85 mt-1 max-w-md">
                  {sosActive
                    ? 'Your live location is being shared with emergency contacts and nearby services. Stay where you are if safe.'
                    : 'Tap the button to instantly alert emergency services and share your live location.'}
                </p>
                {sosActive && (
                  <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
                    <Badge className="bg-white/15 text-white border-0">
                      <span className="size-1.5 rounded-full bg-emerald-300 animate-pulse mr-1.5" />
                      Sharing live location…
                    </Badge>
                    <Badge className="bg-white/15 text-white border-0">Notifying 3 contacts</Badge>
                  </div>
                )}
                {sosActive && (
                  <Button variant="outline" size="sm" onClick={cancelSOS} className="mt-4 bg-white/10 text-white border-white/30 hover:bg-white/20 hover:text-white">
                    Cancel SOS
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Emergency contacts grid */}
        <motion.div variants={item}>
          <h2 className="text-base sm:text-lg font-semibold tracking-tight mb-3 flex items-center gap-2">
            <Phone className="size-4 text-rose-600" />
            Emergency Hotlines
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {EMERGENCY_CONTACTS.map((c) => {
              const Icon = c.icon
              return (
                <a
                  key={c.name}
                  href={`tel:${c.number}`}
                  className="block group"
                >
                  <Card className="p-4 gap-0 h-full hover:shadow-md hover:border-rose-500/30 transition-all">
                    <div className={cn('size-10 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-md group-hover:scale-105 transition-transform', c.color)}>
                      <Icon className="size-5 text-white" />
                    </div>
                    <p className="mt-2.5 text-xs font-medium text-muted-foreground">{c.name}</p>
                    <p className="text-xl font-bold tracking-tight">{c.number}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{c.desc}</p>
                  </Card>
                </a>
              )
            })}
          </div>
        </motion.div>

        {/* Nearby services + share location */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Nearby services */}
          <motion.div variants={item} className="lg:col-span-2">
            <Card className="p-5 sm:p-6 gap-0 h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
                  <MapPin className="size-4 text-emerald-600" />
                  Nearby emergency services
                </h3>
                <span className="text-xs text-muted-foreground">{NEARBY_SERVICES.length} found</span>
              </div>
              <div className="flex flex-col gap-2.5 max-h-[28rem] overflow-y-auto pr-1">
                {NEARBY_SERVICES.map((s) => {
                  const meta = SERVICE_META[s.type]
                  const Icon = meta.icon
                  return (
                    <div key={s.id} className="rounded-xl border border-border/60 p-3 hover:border-emerald-500/30 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={cn('size-9 rounded-lg flex items-center justify-center shrink-0', meta.color)}>
                          <Icon className="size-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold truncate">{s.name}</p>
                            {s.open247 && (
                              <Badge variant="secondary" className="text-[9px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-0">
                                Open 24/7
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 text-[11px] text-muted-foreground">
                            <span className="inline-flex items-center gap-0.5"><MapPin className="size-3" />{s.distance}</span>
                            <span className="truncate">{s.address}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-2">
                            <Button asChild size="sm" variant="outline" className="h-7 px-2 text-xs">
                              <a href={`tel:${s.phone}`}><Phone className="size-3 mr-1" />Call</a>
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => toast.info(`Opening directions to ${s.name}`)}>
                              <Navigation className="size-3 mr-1" />Directions
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-xs"
                              onClick={() => handleSavePlace(s)}
                              disabled={savingId === s.id}
                            >
                              {savingId === s.id ? <Loader2 className="size-3 mr-1 animate-spin" /> : <Bookmark className="size-3 mr-1" />}
                              Save
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          </motion.div>

          {/* Share location + alerts */}
          <motion.div variants={item} className="flex flex-col gap-4">
            <Card className="p-5 gap-0">
              <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2 mb-3">
                <Share2 className="size-4 text-emerald-600" />
                Share live location
              </h3>
              {!sharing ? (
                <p className="text-xs text-muted-foreground mb-3">Share your real-time location with trusted contacts for safety while travelling.</p>
              ) : (
                <div className="mb-3 rounded-lg border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent p-3">
                  <div className="relative h-24 rounded-md overflow-hidden bg-emerald-500/5 mesh-bg">
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className="relative">
                        <span className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping" />
                        <div className="size-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-md" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live · {city}
                    </span>
                    <span>17.3850° N, 78.4867° E</span>
                  </div>
                </div>
              )}
              <Button
                variant={sharing ? 'outline' : 'default'}
                onClick={toggleShare}
                className="w-full"
              >
                {sharing ? <><Square className="size-4" />Stop sharing</> : <><Share2 className="size-4" />Share live location</>}
              </Button>
            </Card>

            <Card className="p-5 gap-0">
              <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2 mb-3">
                <AlertTriangle className="size-4 text-amber-500" />
                Disaster alerts
              </h3>
              <div className="flex flex-col gap-2">
                {ALERTS.map((a, i) => {
                  const Icon = a.icon
                  return (
                    <div key={i} className={cn('rounded-lg border p-3', a.tint)}>
                      <div className="flex items-start gap-2.5">
                        <Icon className="size-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold">{a.title}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{a.desc}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Safety tips accordion */}
        <motion.div variants={item}>
          <Card className="p-5 sm:p-6 gap-0">
            <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2 mb-3">
              <Lightbulb className="size-4 text-amber-500" />
              Safety tips &amp; preparedness
            </h3>
            <Accordion type="single" collapsible className="w-full">
              {SAFETY_TIPS.map((t, i) => (
                <AccordionItem key={i} value={`tip-${i}`}>
                  <AccordionTrigger className="text-sm hover:no-underline">
                    {t.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                    {t.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
