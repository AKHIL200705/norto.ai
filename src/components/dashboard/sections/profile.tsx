'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  User, Mail, Briefcase, Languages, Wallet, Utensils, Bus, MapPin,
  Pencil, Save, X, Bell, CloudSun, Wallet as WalletIcon, Calendar,
  Sparkles, LogOut, LogIn, Trash2, Check, ShieldCheck, Map as MapIcon,
  MessageSquare, Globe, Settings,
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { LANGUAGES, type UserProfile } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { GoogleIcon } from '@/components/auth/google-icon'

const DEFAULT_USER: UserProfile = {
  name: 'City Explorer',
  email: 'explorer@lifelens.ai',
  occupation: 'Software Engineer',
  language: 'English',
  budget: 25000,
  foodPref: 'Veg',
  transport: 'Public',
  city: 'Hyderabad',
}

const TRAVEL_HISTORY = [
  { city: 'Hyderabad', from: 'Oct 2024', to: 'Present', current: true },
  { city: 'Bangalore', from: 'Jun 2024', to: 'Sep 2024', current: false },
  { city: 'Pune', from: 'Feb 2024', to: 'May 2024', current: false },
  { city: 'Chennai', from: 'Nov 2023', to: 'Jan 2024', current: false },
]

const CONNECTED_SERVICES = [
  { name: 'Gemini AI', desc: 'AI chat & recommendations', status: 'Connected' },
  { name: 'Maps Service', desc: 'Location & places', status: 'Connected' },
  { name: 'Weather API', desc: 'Forecasts & alerts', status: 'Connected' },
  { name: 'OCR Vision', desc: 'Image text extraction', status: 'Connected' },
]

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
  const isAuth = useAppStore((s) => s.isAuthenticated)
  const authProvider = useAppStore((s) => s.authProvider)
  const signOut = useAppStore((s) => s.signOut)
  const setSignInOpen = useAppStore((s) => s.setSignInOpen)

  const profile: UserProfile = user || { ...DEFAULT_USER, city }
  const [editing, setEditing] = React.useState(false)
  const [form, setForm] = React.useState<UserProfile>(profile)
  const [prefs, setPrefs] = React.useState({
    weather: true, budget: true, festival: false, emergency: true,
  })

  React.useEffect(() => {
    setForm(profile)
  }, [user, city])

  const initials = (profile.name || 'CE')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error('Name is required')
      return
    }
    if (form.budget < 0) {
      toast.error('Budget must be positive')
      return
    }
    updateUser({
      name: form.name.trim(),
      email: form.email.trim(),
      occupation: form.occupation || null,
      language: form.language,
      budget: Number(form.budget) || 0,
      foodPref: form.foodPref,
      transport: form.transport,
      city: form.city || city,
    })
    setEditing(false)
    toast.success('Profile updated')
  }

  const handleCancel = () => {
    setForm(profile)
    setEditing(false)
  }

  const handlePrefChange = (key: keyof typeof prefs, value: boolean) => {
    setPrefs((prev) => ({ ...prev, [key]: value }))
    toast.success(`${value ? 'Enabled' : 'Disabled'} ${key} alerts`)
  }

  const handleReset = () => {
    try {
      localStorage.removeItem('lifelens-store')
      localStorage.removeItem('lifelens-saved-phrases')
      localStorage.removeItem('lifelens-recent-scans')
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

  // Stats
  const memberSince = 'Oct 2024'
  const placesSaved = 12
  const chatsCount = 47
  const languagesKnown = 2

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-6">
        {/* Header */}
        <motion.div variants={item}>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <User className="size-3.5 text-emerald-600" />
            <span>Manage your account &amp; preferences</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Profile</h1>
        </motion.div>

        {/* Profile header card */}
        <motion.div variants={item}>
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-500/20">
            <div className="absolute inset-0 mesh-bg opacity-20 pointer-events-none" />
            <div className="absolute -right-16 -top-16 size-64 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />
            <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-5">
              <div className="size-20 sm:size-24 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center shrink-0">
                <span className="text-2xl sm:text-3xl font-bold tracking-wider text-white">{initials}</span>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl font-bold">{profile.name}</h2>
                <div className="flex items-center justify-center sm:justify-start gap-3 mt-1 text-sm text-white/85 flex-wrap">
                  <span className="inline-flex items-center gap-1"><Mail className="size-3.5" />{profile.email}</span>
                  <span className="inline-flex items-center gap-1"><Briefcase className="size-3.5" />{profile.occupation || '—'}</span>
                  <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{profile.city}</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-3 flex-wrap">
                  <Badge className="bg-white/15 text-white border-0 backdrop-blur-sm">
                    <Sparkles className="size-3 mr-1" />Explorer Tier
                  </Badge>
                  {isAuth ? (
                    <Badge className="bg-white/15 text-white border-0 backdrop-blur-sm inline-flex items-center gap-1">
                      <Check className="size-3 mr-1" />Verified
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-400/25 text-amber-50 border-0 backdrop-blur-sm">
                      Guest mode
                    </Badge>
                  )}
                  {isAuth && authProvider && (
                    <Badge className="bg-white/15 text-white border-0 backdrop-blur-sm inline-flex items-center gap-1">
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
                variant="outline"
                onClick={() => (editing ? handleCancel() : setEditing(true))}
                className="bg-white/10 text-white border-white/30 hover:bg-white/20 hover:text-white shrink-0"
              >
                {editing ? <><X className="size-4" />Cancel</> : <><Pencil className="size-4" />Edit Profile</>}
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Stats row */}
        <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard icon={Calendar} label="Member since" value={memberSince} gradient="from-emerald-500 to-teal-600" />
          <StatCard icon={MapIcon} label="Places saved" value={String(placesSaved)} gradient="from-amber-500 to-orange-500" onClick={() => setSection('saved')} />
          <StatCard icon={MessageSquare} label="AI chats" value={String(chatsCount)} gradient="from-rose-500 to-pink-600" onClick={() => setSection('assistant')} />
          <StatCard icon={Globe} label="Languages" value={String(languagesKnown)} gradient="from-violet-500 to-fuchsia-600" />
        </motion.div>

        {/* Edit form OR preferences + travel history */}
        {editing ? (
          <motion.div variants={item}>
            <Card className="p-5 sm:p-6 gap-0">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="size-4 text-emerald-600" />
                <h3 className="font-semibold text-sm sm:text-base">Edit profile</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
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
                <Field label="Current city" icon={MapPin}>
                  <Input value={form.city || ''} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Hyderabad" />
                </Field>
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                <Button onClick={handleSave}>
                  <Save className="size-4" />
                  Save changes
                </Button>
              </div>
            </Card>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Preferences */}
            <motion.div variants={item}>
              <Card className="p-5 sm:p-6 gap-0 h-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
                    <Bell className="size-4 text-amber-500" />
                    Notification preferences
                  </h3>
                </div>
                <div className="flex flex-col gap-1">
                  <PrefRow
                    icon={CloudSun}
                    title="Weather alerts"
                    desc="Daily forecast & severe weather warnings"
                    checked={prefs.weather}
                    onChange={(v) => handlePrefChange('weather', v)}
                  />
                  <PrefRow
                    icon={WalletIcon}
                    title="Budget warnings"
                    desc="Alert when you exceed spending limits"
                    checked={prefs.budget}
                    onChange={(v) => handlePrefChange('budget', v)}
                  />
                  <PrefRow
                    icon={Sparkles}
                    title="Festival alerts"
                    desc="Local festivals & events in your city"
                    checked={prefs.festival}
                    onChange={(v) => handlePrefChange('festival', v)}
                  />
                  <PrefRow
                    icon={ShieldCheck}
                    title="Emergency alerts"
                    desc="Critical safety notifications"
                    checked={prefs.emergency}
                    onChange={(v) => handlePrefChange('emergency', v)}
                  />
                </div>
              </Card>
            </motion.div>

            {/* Travel history */}
            <motion.div variants={item}>
              <Card className="p-5 sm:p-6 gap-0 h-full">
                <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2 mb-4">
                  <MapPin className="size-4 text-emerald-600" />
                  Travel history
                </h3>
                <div className="relative pl-5">
                  <div className="absolute left-[6px] top-1 bottom-1 w-px bg-border" />
                  <div className="flex flex-col gap-4">
                    {TRAVEL_HISTORY.map((t, i) => (
                      <div key={i} className="relative">
                        <div
                          className={cn(
                            'absolute -left-5 top-1 size-3 rounded-full border-2 border-background',
                            t.current ? 'bg-emerald-500' : 'bg-muted-foreground/40',
                          )}
                        />
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold">{t.city}</p>
                          {t.current && (
                            <Badge variant="secondary" className="text-[9px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-0">
                              Current
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{t.from} — {t.to}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Connected services */}
        <motion.div variants={item}>
          <Card className="p-5 sm:p-6 gap-0">
            <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2 mb-4">
              <ShieldCheck className="size-4 text-emerald-600" />
              Connected services
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {CONNECTED_SERVICES.map((s) => (
                <div key={s.name} className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-muted/20">
                  <div>
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-[11px] text-muted-foreground">{s.desc}</p>
                  </div>
                  <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-0">
                    <span className="size-1.5 rounded-full bg-emerald-500 mr-1.5" />
                    {s.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Danger zone */}
        <motion.div variants={item}>
          <Card className="p-5 sm:p-6 gap-0 border-rose-500/30 bg-rose-500/5">
            <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2 mb-1">
              <AlertTriangleIcon />
              Danger zone
            </h3>
            <p className="text-xs text-muted-foreground mb-4">Irreversible &amp; destructive actions</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 p-3 rounded-lg border border-rose-500/20 bg-background/50 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Reset all data</p>
                  <p className="text-[11px] text-muted-foreground">Clears your profile, saved places, phrases &amp; recents</p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="border-rose-500/30 text-rose-600 hover:bg-rose-500/10 hover:text-rose-700">
                      <Trash2 className="size-4" />
                      Reset
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reset all data?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete your profile, saved places, phrases, and recent scans from this browser. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleReset} className="bg-rose-600 hover:bg-rose-700 text-white">
                        Yes, reset everything
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <div className="flex-1 p-3 rounded-lg border border-border/60 bg-background/50 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">
                    {isAuth ? 'Sign out' : 'Sign in'}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {isAuth
                      ? 'End your session and return to landing'
                      : 'Sign in with Google to sync your data'}
                  </p>
                </div>
                {isAuth ? (
                  <Button variant="outline" size="sm" onClick={handleSignOut}>
                    <LogOut className="size-4" />
                    Sign out
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignIn}
                    className="border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10"
                  >
                    <LogIn className="size-4" />
                    Sign in
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}

function AlertTriangleIcon() {
  return <ShieldCheck className="size-4 text-rose-600" />
}

function StatCard({
  icon: Icon, label, value, gradient, onClick,
}: {
  icon: React.ElementType
  label: string
  value: string
  gradient: string
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
      <Card className="p-4 sm:p-5 gap-0 h-full hover:shadow-md transition-shadow">
        <div className={cn('size-9 rounded-lg flex items-center justify-center bg-gradient-to-br shadow-md', gradient)}>
          <Icon className="size-4 text-white" />
        </div>
        <p className="mt-3 text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-lg sm:text-xl font-bold tracking-tight mt-0.5">{value}</p>
      </Card>
    </motion.button>
  )
}

function Field({ label, icon: Icon, children }: { label: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
        <Icon className="size-3" />
        {label}
      </Label>
      {children}
    </div>
  )
}

function PrefRow({
  icon: Icon, title, desc, checked, onChange,
}: {
  icon: React.ElementType
  title: string
  desc: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 p-2.5 rounded-md hover:bg-muted/40 transition-colors">
      <div className="flex items-center gap-3">
        <div className="size-8 rounded-lg bg-muted/60 flex items-center justify-center shrink-0">
          <Icon className="size-4 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-[11px] text-muted-foreground">{desc}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}
