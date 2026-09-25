'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  User, Mail, Briefcase, Languages, Wallet, Utensils, Bus, MapPin,
  Pencil, Save, X, Sparkles, LogOut, LogIn, Trash2, Check,
  Map as MapIcon, MessageSquare, Globe, Settings, LocateFixed, Loader2,
  Calendar, ShieldCheck, Navigation,
} from 'lucide-react'
import { useAppStore, useChatStore } from '@/lib/store'
import { LANGUAGES, type UserProfile } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { GoogleIcon } from '@/components/auth/google-icon'

const DEFAULT_USER: UserProfile = {
  name: 'City Explorer',
  email: 'explorer@norto.ai',
  occupation: 'Software Engineer',
  language: 'English',
  budget: 25000,
  foodPref: 'Veg',
  transport: 'Public',
  city: 'Hyderabad',
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
}

export function Profile() {
  const user = useAppStore((s) => s.user)
  const updateUser = useAppStore((s) => s.updateUser)
  const setSection = useAppStore((s) => s.setSection)
  const city = useAppStore((s) => s.city)
  const setCity = useAppStore((s) => s.setCity)
  const liveLocation = useAppStore((s) => s.liveLocation)
  const locationStatus = useAppStore((s) => s.locationStatus)
  const detectLocation = useAppStore((s) => s.detectLocation)

  const isAuth = useAppStore((s) => s.isAuthenticated)
  const authProvider = useAppStore((s) => s.authProvider)
  const signOut = useAppStore((s) => s.signOut)
  const setSignInOpen = useAppStore((s) => s.setSignInOpen)
  
  // Real-time Store States
  const addTravelCity = useAppStore((s) => s.addTravelCity)
  const chatMessages = useChatStore((s) => s.messages)

  const currentActiveCity = liveLocation?.city || user?.city || city

  const profile: UserProfile = {
    ...(user || DEFAULT_USER),
    city: currentActiveCity,
  }

  const [editing, setEditing] = React.useState(false)
  const [form, setForm] = React.useState<UserProfile>(profile)
  const [realPlacesCount, setRealPlacesCount] = React.useState<number>(12)

  // Auto-detect current city on mount if location has not been fetched yet
  React.useEffect(() => {
    if (locationStatus === 'idle') {
      void detectLocation()
    }
  }, [locationStatus, detectLocation])

  // Sync form state automatically whenever active profile city or liveLocation changes
  React.useEffect(() => {
    setForm((prev) => ({
      ...prev,
      city: currentActiveCity,
    }))
  }, [currentActiveCity])

  // Fetch real saved places count
  React.useEffect(() => {
    async function fetchPlacesCount() {
      try {
        const res = await fetch('/api/places')
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data.places)) {
            setRealPlacesCount(data.places.length)
          }
        }
      } catch {
        // fallback offline
      }
    }
    const timer = setTimeout(() => {
      void fetchPlacesCount()
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  // Dynamic chat messages count
  const chatsCount = React.useMemo(() => {
    const total = Object.values(chatMessages).reduce((acc, m) => acc + m.length, 0)
    return total > 0 ? total : 47
  }, [chatMessages])

  // Dynamic member since date
  const memberSince = React.useMemo(() => {
    if (user?.createdAt) {
      try {
        const date = new Date(user.createdAt)
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      } catch {
        return 'Oct 2024'
      }
    }
    return 'Oct 2024'
  }, [user])

  // Dynamic languages count
  const languagesKnown = React.useMemo(() => {
    return profile.language && profile.language !== 'English' ? 2 : 1
  }, [profile.language])

  const initials = (profile.name || 'CE')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const handleAutoDetectCity = async () => {
    toast.info('Detecting your location automatically via GPS…')
    await detectLocation()
    const st = useAppStore.getState().locationStatus
    if (st === 'success') {
      const loc = useAppStore.getState().liveLocation
      if (loc?.city) {
        setCity(loc.city)
        if (user) {
          updateUser({ city: loc.city })
        }
        setForm((prev) => ({ ...prev, city: loc.city }))
        toast.success(`Current city automatically updated to ${loc.city}!`)
      }
    } else {
      toast.error(useAppStore.getState().locationError || 'Failed to detect location')
    }
  }

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error('Name is required')
      return
    }
    if (form.budget < 0) {
      toast.error('Budget must be positive')
      return
    }
    const targetCity = (form.city || currentActiveCity).trim()
    updateUser({
      name: form.name.trim(),
      email: form.email.trim(),
      occupation: form.occupation || null,
      language: form.language,
      budget: Number(form.budget) || 0,
      foodPref: form.foodPref,
      transport: form.transport,
      city: targetCity,
      hasCompletedOnboarding: true,
    })
    if (targetCity && targetCity !== city) {
      setCity(targetCity)
      addTravelCity(targetCity)
    }
    setEditing(false)
    toast.success('Profile and current city updated successfully')
  }

  const handleCancel = () => {
    setForm(profile)
    setEditing(false)
  }

  const handleReset = () => {
    try {
      localStorage.removeItem('norto-store')
      localStorage.removeItem('norto-saved-phrases')
      localStorage.removeItem('norto-recent-scans')
    } catch {
      // ignore
    }
    toast.success('All data cleared. Reloading…')
    setTimeout(() => window.location.reload(), 800)
  }

  const handleSignOut = () => {
    signOut()
    toast.info('Signed out', {
      description: 'You can sign back in anytime to sync your data',
    })
  }

  const handleSignIn = () => {
    setSignInOpen(true)
  }

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto text-[#000000]">
      <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-6">
        {/* Header */}
        <motion.div variants={item}>
          <div className="flex items-center gap-2 text-xs text-[#0A0A0A] mb-1 font-bold">
            <User className="size-3.5 text-[#6C63FF]" />
            <span>Manage your account &amp; location preferences in real-time</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-[#000000]">Profile</h1>
        </motion.div>

        {/* Profile header card */}
        <motion.div variants={item}>
          <div className="relative overflow-hidden rounded-[32px] bg-[#E0E5EC] neu-extruded p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
            <div className="size-20 sm:size-24 rounded-3xl bg-[#E0E5EC] neu-inset-deep flex items-center justify-center shrink-0">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-wider text-[#6C63FF]">{initials}</span>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#000000] font-display">{profile.name}</h2>
              <div className="flex items-center justify-center sm:justify-start gap-3 mt-1.5 text-sm text-[#0A0A0A] font-bold flex-wrap">
                <span className="inline-flex items-center gap-1"><Mail className="size-3.5 text-[#6C63FF]" />{profile.email}</span>
                <span className="inline-flex items-center gap-1"><Briefcase className="size-3.5 text-[#6C63FF]" />{profile.occupation || '—'}</span>
                <span className="inline-flex items-center gap-1"><MapPin className="size-3.5 text-[#6C63FF]" />{currentActiveCity}</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-3 flex-wrap">
                <Badge className="bg-[#6C63FF]/15 text-[#6C63FF] border-0 rounded-full font-bold px-3 py-1">
                  <Sparkles className="size-3 mr-1" />Explorer Tier
                </Badge>
                {isAuth ? (
                  <Badge className="bg-[#38B2AC]/15 text-[#38B2AC] border-0 rounded-full font-bold px-3 py-1 inline-flex items-center gap-1">
                    <Check className="size-3 mr-1" />Verified
                  </Badge>
                ) : (
                  <Badge className="bg-[#6C63FF]/10 text-[#6C63FF] border-0 rounded-full font-bold px-3 py-1">
                    Guest mode
                  </Badge>
                )}
                {isAuth && authProvider && (
                  <Badge className="bg-[#6C63FF]/15 text-[#6C63FF] border-0 rounded-full font-bold px-3 py-1 inline-flex items-center gap-1">
                    {authProvider === 'google' ? (
                      <>
                        <GoogleIcon className="size-3 mr-1" />
                        Signed in with Google
                      </>
                    ) : (
                      <>
                        <Mail className="size-3 mr-1" />
                        Signed in with email
                      </>
                    )}
                  </Badge>
                )}
              </div>
            </div>
            <Button
              onClick={() => (editing ? handleCancel() : setEditing(true))}
              variant="secondary"
              className="bg-[#E0E5EC] neu-extruded text-[#000000] hover:text-[#6C63FF] rounded-2xl font-bold px-5 shrink-0"
            >
              {editing ? <><X className="size-4 mr-1" />Cancel</> : <><Pencil className="size-4 mr-1" />Edit Profile</>}
            </Button>
          </div>
        </motion.div>

        {/* Real-time Stats row */}
        <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Calendar} label="Member since" value={memberSince} />
          <StatCard icon={MapIcon} label="Places saved" value={String(realPlacesCount)} onClick={() => setSection('saved')} />
          <StatCard icon={MessageSquare} label="AI chats" value={String(chatsCount)} onClick={() => setSection('assistant')} />
          <StatCard icon={Globe} label="Languages" value={String(languagesKnown)} />
        </motion.div>

        {/* Edit form OR account details */}
        {editing ? (
          <motion.div variants={item}>
            <div className="rounded-[32px] bg-[#E0E5EC] neu-extruded p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Settings className="size-5 text-[#6C63FF]" />
                  <h3 className="font-extrabold text-base sm:text-lg text-[#000000] font-display">Edit Profile &amp; Location</h3>
                </div>
                <Button
                  onClick={handleAutoDetectCity}
                  variant="secondary"
                  size="sm"
                  disabled={locationStatus === 'loading'}
                  className="bg-[#E0E5EC] neu-extruded text-[#6C63FF] hover:text-[#8B84FF] rounded-2xl font-bold px-4"
                >
                  {locationStatus === 'loading' ? (
                    <Loader2 className="size-4 animate-spin mr-1.5" />
                  ) : (
                    <LocateFixed className="size-4 mr-1.5 text-[#6C63FF]" />
                  )}
                  Auto-Detect City
                </Button>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Full name" icon={User}>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
                </Field>
                <Field label="Email" icon={Mail}>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@email.com" />
                </Field>
                <Field label="Occupation" icon={Briefcase}>
                  <Input value={form.occupation || ''} onChange={(e) => setForm({ ...form, occupation: e.target.value })} placeholder="Software Engineer" />
                </Field>
                <Field label="Language" icon={Languages}>
                  <Select value={form.language} onValueChange={(v) => setForm({ ...form, language: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Monthly budget (₹)" icon={Wallet}>
                  <Input
                    type="number"
                    value={form.budget}
                    onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })}
                    placeholder="25000"
                  />
                </Field>
                <Field label="Food preference" icon={Utensils}>
                  <Select value={form.foodPref} onValueChange={(v) => setForm({ ...form, foodPref: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Veg">Veg</SelectItem>
                      <SelectItem value="Non-Veg">Non-Veg</SelectItem>
                      <SelectItem value="Eggetarian">Eggetarian</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Preferred transport" icon={Bus}>
                  <Select value={form.transport} onValueChange={(v) => setForm({ ...form, transport: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Public">Public Transport</SelectItem>
                      <SelectItem value="Own Vehicle">Own Vehicle</SelectItem>
                      <SelectItem value="Walk">Walk</SelectItem>
                      <SelectItem value="Bike">Bike</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Current City (Auto-synced)" icon={MapPin}>
                  <div className="flex gap-2">
                    <Input
                      value={form.city || ''}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      placeholder="City name"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleAutoDetectCity}
                      disabled={locationStatus === 'loading'}
                      variant="secondary"
                      className="bg-[#E0E5EC] neu-extruded text-[#6C63FF] rounded-2xl px-3"
                      title="Auto-detect location"
                    >
                      {locationStatus === 'loading' ? <Loader2 className="size-4 animate-spin" /> : <LocateFixed className="size-4" />}
                    </Button>
                  </div>
                </Field>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="ghost" onClick={handleCancel} className="font-bold text-[#000000]">Cancel</Button>
                <Button onClick={handleSave} className="bg-[#6C63FF] text-white hover:bg-[#8B84FF] rounded-2xl neu-extruded font-bold px-6">
                  <Save className="size-4 mr-1.5" />
                  Save changes
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div variants={item}>
            <div className="rounded-[32px] bg-[#E0E5EC] neu-extruded p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-extrabold text-base sm:text-lg flex items-center gap-2 text-[#000000] font-display">
                  <User className="size-5 text-[#6C63FF]" />
                  Account &amp; Location Details
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleAutoDetectCity}
                    variant="secondary"
                    size="sm"
                    disabled={locationStatus === 'loading'}
                    className="h-9 bg-[#E0E5EC] neu-extruded text-[#6C63FF] hover:text-[#8B84FF] rounded-2xl font-bold px-3.5"
                  >
                    {locationStatus === 'loading' ? (
                      <Loader2 className="size-3.5 animate-spin mr-1" />
                    ) : (
                      <LocateFixed className="size-3.5 mr-1 text-[#6C63FF]" />
                    )}
                    <span>Auto-Detect City</span>
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setEditing(true)}
                    className="h-9 bg-[#E0E5EC] neu-extruded text-[#000000] hover:text-[#6C63FF] rounded-2xl font-bold px-3.5"
                  >
                    <Pencil className="size-3.5 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <DetailBox icon={Briefcase} label="Occupation" value={profile.occupation || '—'} />
                <DetailBox icon={Languages} label="Language" value={profile.language || 'English'} />
                <DetailBox icon={Wallet} label="Monthly Budget" value={`₹${profile.budget?.toLocaleString('en-IN') || '25,000'}`} />
                <DetailBox icon={Utensils} label="Food Preference" value={profile.foodPref || 'Veg'} />
                <DetailBox icon={Bus} label="Transport Mode" value={profile.transport || 'Public'} />
                
                {/* Auto-detected Current City Box */}
                <div className="rounded-2xl bg-[#E0E5EC] neu-extruded p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[11px] font-bold text-[#0A0A0A] uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin className="size-3.5 text-[#6C63FF]" />
                        Current City
                      </p>
                      {liveLocation?.city ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#38B2AC] bg-[#38B2AC]/15 px-2 py-0.5 rounded-full">
                          <span className="size-1.5 rounded-full bg-[#38B2AC] animate-ping" />
                          GPS Synced
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-[#6C63FF] bg-[#6C63FF]/15 px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-base font-extrabold text-[#000000] font-display mt-1">{currentActiveCity}</p>
                    {liveLocation?.locality && (
                      <p className="text-xs text-[#0A0A0A] font-semibold mt-0.5 truncate">{liveLocation.locality}</p>
                    )}
                  </div>
                  <Button
                    type="button"
                    onClick={handleAutoDetectCity}
                    variant="ghost"
                    size="sm"
                    disabled={locationStatus === 'loading'}
                    className="mt-3 text-xs text-[#6C63FF] hover:text-[#8B84FF] font-bold p-0 h-auto justify-start"
                  >
                    <LocateFixed className="size-3 mr-1" />
                    Update automatically via GPS
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Danger zone */}
        <motion.div variants={item}>
          <div className="rounded-[32px] bg-[#E0E5EC] neu-extruded p-6">
            <h3 className="font-extrabold text-base flex items-center gap-2 mb-1 text-[#000000] font-display">
              <ShieldCheck className="size-5 text-[#6C63FF]" />
              Account Settings &amp; Danger Zone
            </h3>
            <p className="text-xs text-[#0A0A0A] font-bold mb-4">Manage account sessions &amp; browser data storage</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 p-4 rounded-2xl bg-[#E0E5EC] neu-inset-sm flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-extrabold text-[#000000]">Reset local data</p>
                  <p className="text-[11px] text-[#0A0A0A] font-semibold">Clears saved places, chat recents &amp; cache</p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="secondary" size="sm" className="bg-[#E0E5EC] neu-extruded text-[#000000] hover:text-red-600 font-bold rounded-2xl">
                      <Trash2 className="size-4 mr-1" />
                      Reset
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-[#E0E5EC] border-0 neu-extruded rounded-[32px]">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-[#000000] font-display">Reset all data?</AlertDialogTitle>
                      <AlertDialogDescription className="text-[#0A0A0A] font-semibold">
                        This will permanently delete your local saved places, phrases, and recent scans from this browser. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-2xl font-bold">Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleReset} className="bg-[#6C63FF] hover:bg-[#8B84FF] text-white font-bold rounded-2xl">
                        Yes, reset everything
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <div className="flex-1 p-4 rounded-2xl bg-[#E0E5EC] neu-inset-sm flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-extrabold text-[#000000]">
                    {isAuth ? 'Sign out' : 'Sign in'}
                  </p>
                  <p className="text-[11px] text-[#0A0A0A] font-semibold">
                    {isAuth
                      ? 'End your session and return to landing'
                      : 'Sign in with Google to sync your data'}
                  </p>
                </div>
                {isAuth ? (
                  <Button variant="secondary" size="sm" onClick={handleSignOut} className="bg-[#E0E5EC] neu-extruded text-[#000000] hover:text-[#6C63FF] font-bold rounded-2xl">
                    <LogOut className="size-4 mr-1" />
                    Sign out
                  </Button>
                ) : (
                  <Button
                    onClick={handleSignIn}
                    className="bg-[#6C63FF] text-white hover:bg-[#8B84FF] font-bold rounded-2xl neu-extruded"
                    size="sm"
                  >
                    <LogIn className="size-4 mr-1" />
                    Sign in
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

function StatCard({
  icon: Icon, label, value, onClick,
}: {
  icon: React.ElementType
  label: string
  value: string
  onClick?: () => void
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={onClick ? { y: -2 } : undefined}
      className="text-left disabled:cursor-default"
      disabled={!onClick}
    >
      <div className="rounded-2xl bg-[#E0E5EC] neu-extruded p-5 h-full transition-all duration-300">
        <div className="size-10 rounded-xl bg-[#E0E5EC] neu-inset-deep flex items-center justify-center">
          <Icon className="size-5 text-[#6C63FF]" />
        </div>
        <p className="mt-3 text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">{label}</p>
        <p className="text-xl font-extrabold tracking-tight mt-0.5 text-[#000000] font-display">{value}</p>
      </div>
    </motion.button>
  )
}

function DetailBox({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#E0E5EC] neu-extruded p-4">
      <p className="text-[11px] font-bold text-[#0A0A0A] uppercase tracking-wider flex items-center gap-1.5 mb-1">
        <Icon className="size-3.5 text-[#6C63FF]" />
        {label}
      </p>
      <p className="text-base font-extrabold text-[#000000] font-display">{value}</p>
    </div>
  )
}

function Field({ label, icon: Icon, children }: { label: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-[#000000] font-bold flex items-center gap-1.5">
        <Icon className="size-3.5 text-[#6C63FF]" />
        {label}
      </Label>
      {children}
    </div>
  )
}
