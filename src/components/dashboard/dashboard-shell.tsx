'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import {
  Compass, Home, Sparkles, Map, Wallet, CloudSun, Languages,
  Siren, UtensilsCrossed, ScanText, Bookmark, User, Menu,
  Sun, Moon, Search, Bell, ChevronRight, LogOut, LogIn, ChevronDown,
  LocateFixed, Loader2, AlertTriangle, Crosshair,
} from 'lucide-react'
import { useAppStore, type LiveLocation, type LocationStatus } from '@/lib/store'
import type { DashboardSection } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { GoogleIcon } from '@/components/auth/google-icon'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { useIsMobile } from '@/hooks/use-mobile'

interface NavItem {
  id: DashboardSection
  label: string
  icon: React.ElementType
  group: 'main' | 'tools'
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home, group: 'main' },
  { id: 'assistant', label: 'AI Assistant', icon: Sparkles, group: 'main' },
  { id: 'map', label: 'Smart Map', icon: Map, group: 'tools' },
  { id: 'budget', label: 'Budget Planner', icon: Wallet, group: 'tools' },
  { id: 'translator', label: 'Translator', icon: Languages, group: 'tools' },
  { id: 'emergency', label: 'Emergency', icon: Siren, group: 'tools' },
  { id: 'food', label: 'Food', icon: UtensilsCrossed, group: 'tools' },
  { id: 'ocr', label: 'OCR Scanner', icon: ScanText, group: 'tools' },
  { id: 'saved', label: 'Saved Places', icon: Bookmark, group: 'main' },
  { id: 'profile', label: 'Profile', icon: User, group: 'main' },
]

function SidebarLogo() {
  const setView = useAppStore((s) => s.setView)
  return (
    <button
      onClick={() => setView('landing')}
      className="flex items-center gap-2.5 w-full px-2 group"
      aria-label="Norto home"
    >
      <div className="size-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform">
        <Compass className="size-5 text-white" />
      </div>
      <div className="flex flex-col items-start leading-none">
        <span className="font-bold text-base tracking-tight">Norto</span>
        <span className="text-[10px] text-muted-foreground font-medium">Your City Companion</span>
      </div>
    </button>
  )
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const section = useAppStore((s) => s.section)
  const setSection = useAppStore((s) => s.setSection)
  const city = useAppStore((s) => s.city)
  const mainItems = NAV_ITEMS.filter((i) => i.group === 'main')
  const toolItems = NAV_ITEMS.filter((i) => i.group === 'tools')

  const handleClick = (id: DashboardSection) => {
    setSection(id)
    onNavigate?.()
  }

  const renderItem = (item: NavItem) => {
    const active = section === item.id
    const Icon = item.icon
    return (
      <button
        key={item.id}
        onClick={() => handleClick(item.id)}
        className={cn(
          'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all group relative',
          active
            ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-lg shadow-emerald-500/30 font-bold scale-[1.01]'
            : 'font-semibold text-muted-foreground hover:text-foreground hover:bg-accent/70 hover:scale-[1.01]'
        )}
      >
        <Icon className={cn('size-[18px] shrink-0 transition-transform group-hover:scale-110', active ? 'text-white' : 'group-hover:text-emerald-600')} />
        <span className="flex-1 text-left">{item.label}</span>
        {active && <ChevronRight className="size-4 text-white/90 animate-pulse" />}
      </button>
    )
  }

  return (
    <nav className="flex flex-col gap-1 px-3 py-2">
      {mainItems.map(renderItem)}
      <div className="px-3 pt-5 pb-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          City Tools
        </span>
      </div>
      {toolItems.map(renderItem)}
      <div className="mt-4 mx-1 rounded-xl bg-gradient-to-br from-emerald-500/10 to-amber-400/10 border border-emerald-500/15 p-3">
        <div className="flex items-center gap-2 mb-1.5">
          <Map className="size-3.5 text-emerald-600" />
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Current City</span>
        </div>
        <p className="text-sm font-bold">{city}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">Explore local intel below</p>
      </div>
    </nav>
  )
}

export function DashboardSidebar() {
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r bg-sidebar/60 backdrop-blur-xl">
      <div className="h-16 flex items-center px-4 border-b">
        <SidebarLogo />
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        <NavList />
      </div>
    </aside>
  )
}

export function MobileSidebar() {
  const open = useAppStore((s) => s.sidebarOpen)
  const setOpen = useAppStore((s) => s.setSidebarOpen)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="left" className="w-72 p-0 bg-sidebar">
        <div className="h-16 flex items-center px-4 border-b">
          <SidebarLogo />
        </div>
        <div className="overflow-y-auto h-[calc(100vh-4rem)]">
          <NavList onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  )
}

/**
 * Live-location chip shown in the dashboard topbar.
 * - idle/error: a "Detect" button that triggers high-accuracy geolocation
 * - loading: spinner with "Locating…"
 * - success: city + accuracy badge; click to re-detect; hover shows full details
 */
function LocationChip({
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
  const [open, setOpen] = React.useState(false)
  const setExactLocation = useAppStore((s) => s.setExactLocation)

  const accuracyM = live ? Math.round(live.accuracy) : null
  // human-friendly accuracy label
  const accuracyLabel =
    accuracyM === null ? '' : accuracyM < 50 ? 'High' : accuracyM < 200 ? 'Good' : 'Approx.'

  if (status === 'loading') {
    return (
      <span className="inline-flex items-center gap-1.5 h-9 px-2.5 sm:px-3 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
        <Loader2 className="size-3.5 animate-spin" />
        <span className="hidden sm:inline">Locating…</span>
      </span>
    )
  }

  if (status === 'error') {
    return (
      <div className="inline-flex items-center gap-1">
        <button
          onClick={() => setExactLocation('Singarayakonda')}
          title="Set location to Singarayakonda"
          className="inline-flex items-center gap-1.5 h-9 px-2.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <LocateFixed className="size-3.5" />
          <span>Set Singarayakonda</span>
        </button>
        <button
          onClick={onDetect}
          title={error || 'Retry auto-detect'}
          className="inline-flex items-center justify-center size-9 rounded-lg bg-muted text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <AlertTriangle className="size-3.5 text-rose-500" />
        </button>
      </div>
    )
  }

  if (status === 'success' && live) {
    const title = `${live.city}${live.region ? ', ' + live.region : ''}${live.country ? ', ' + live.country : ''}\nLat ${live.lat.toFixed(4)}, Lng ${live.lng.toFixed(4)}\nAccuracy ±${accuracyM}m`
    return (
      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          title={title}
          className="inline-flex items-center gap-1.5 h-9 px-2.5 sm:px-3 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors"
        >
          <Crosshair className="size-3.5" />
          <span className="max-w-[90px] sm:max-w-[140px] truncate">{live.city}</span>
          <span className="hidden sm:inline-flex items-center gap-0.5 text-[10px] text-emerald-600/70 dark:text-emerald-400/70">
            ±{accuracyM}m
          </span>
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-11 z-50 w-72 sm:w-80 rounded-xl border bg-popover shadow-xl overflow-hidden">
              <div className="px-3 py-2.5 bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-emerald-50/80 font-bold">
                  <Crosshair className="size-3" />
                  Live GPS Location
                </div>
                <p className="text-sm font-bold mt-0.5">{live.exactAddress || live.city}</p>
                <p className="text-[11px] text-emerald-50/85">
                  {[live.region, live.country].filter(Boolean).join(', ')}
                </p>
              </div>
              <div className="p-3 space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 dark:text-emerald-300 text-[11px] leading-tight space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="font-bold flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                      <Crosshair className="size-3.5" /> Google Maps High-Precision Location
                    </p>
                  </div>
                  <p className="text-muted-foreground text-[10px]">
                    Exact GPS &amp; Google Maps reverse-geocoded coordinates active.
                  </p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${live.lat},${live.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    View exact pin on Google Maps ↗
                  </a>
                </div>
                {live.displayName && (
                  <div className="flex flex-col gap-0.5 pb-1 border-b">
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Exact Address</span>
                    <span className="text-xs font-medium leading-tight text-foreground/90">{live.displayName}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Latitude</span>
                  <span className="font-mono font-semibold">{live.lat.toFixed(5)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Longitude</span>
                  <span className="font-mono font-semibold">{live.lng.toFixed(5)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Accuracy</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    ±{accuracyM}m · {accuracyLabel}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Detected</span>
                  <span>{new Date(live.detectedAt).toLocaleTimeString()}</span>
                </div>

                <div className="pt-2 border-t space-y-2">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Set Exact Location</p>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      const val = (e.currentTarget.elements.namedItem('town') as HTMLInputElement)?.value
                      if (val) {
                        setExactLocation(val)
                        setOpen(false)
                      }
                    }}
                    className="flex gap-1.5"
                  >
                    <input
                      name="town"
                      type="text"
                      placeholder="e.g. Singarayakonda"
                      className="flex-1 h-8 px-2 rounded-md border text-xs bg-background focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      type="submit"
                      className="h-8 px-2.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors"
                    >
                      Set
                    </button>
                  </form>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {['Singarayakonda', 'Ongole', 'Kavali', 'Hyderabad'].map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => {
                          setExactLocation(loc)
                          setOpen(false)
                        }}
                        className="px-2 py-0.5 rounded bg-muted hover:bg-accent text-[11px] font-medium transition-colors"
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-2 border-t">
                <button
                  onClick={() => { onDetect(); setOpen(false) }}
                  className="w-full flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-medium hover:bg-accent transition-colors"
                >
                  <LocateFixed className="size-3.5" />
                  Auto-detect location
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  // idle
  return (
    <button
      onClick={onDetect}
      className="inline-flex items-center gap-1.5 h-9 px-2.5 sm:px-3 rounded-lg border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium hover:bg-emerald-500/10 transition-colors"
    >
      <LocateFixed className="size-3.5" />
      <span className="hidden sm:inline">Detect location</span>
    </button>
  )
}

/** A single notification row — shared by the desktop dropdown and mobile drawer */
function NotificationItem({ n }: { n: { type: string; title: string; message: string; time: string } }) {
  return (
    <div className="px-4 py-3 border-b last:border-0 hover:bg-accent/50 transition-colors">
      <div className="flex items-start gap-2">
        <div className={cn(
          'size-7 rounded-lg flex items-center justify-center shrink-0',
          n.type === 'weather' && 'bg-sky-500/10 text-sky-500',
          n.type === 'budget' && 'bg-emerald-500/10 text-emerald-600',
          n.type === 'festival' && 'bg-amber-500/10 text-amber-500',
          n.type === 'emergency' && 'bg-rose-500/10 text-rose-500',
          n.type === 'traffic' && 'bg-orange-500/10 text-orange-500',
        )}>
          {n.type === 'weather' ? <CloudSun className="size-3.5" /> : n.type === 'budget' ? <Wallet className="size-3.5" /> : n.type === 'emergency' ? <Siren className="size-3.5" /> : n.type === 'traffic' ? <Wallet className="size-3.5" /> : <Sparkles className="size-3.5" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-tight">{n.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
          <p className="text-[10px] text-muted-foreground/70 mt-1">{n.time} ago</p>
        </div>
      </div>
    </div>
  )
}

export function DashboardTopbar() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const setSection = useAppStore((s) => s.setSection)
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen)
  const city = useAppStore((s) => s.city)
  const user = useAppStore((s) => s.user)
  const isAuth = useAppStore((s) => s.isAuthenticated)
  const authProvider = useAppStore((s) => s.authProvider)
  const signOut = useAppStore((s) => s.signOut)
  const setSignInOpen = useAppStore((s) => s.setSignInOpen)
  const detectLocation = useAppStore((s) => s.detectLocation)
  const liveLocation = useAppStore((s) => s.liveLocation)
  const locationStatus = useAppStore((s) => s.locationStatus)
  const locationError = useAppStore((s) => s.locationError)

  React.useEffect(() => setMounted(true), [])

  const displayName = isAuth && user ? user.name : 'Explorer'
  const displayInitials = (isAuth && user
    ? user.name
    : 'City Explorer'
  ).split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()

  const [menuOpen, setMenuOpen] = React.useState(false)
  const [notifOpen, setNotifOpen] = React.useState(false)
  const isMobile = useIsMobile()
  const notifications = [
    { type: 'weather', title: 'Rain alert', message: `Light rain expected in ${city} this evening.`, time: '2m' },
    { type: 'budget', title: 'Budget tip', message: 'You spent 12% less on food this week. Nice!', time: '1h' },
    { type: 'festival', title: 'Local festival', message: 'Bathukamma celebrations start tomorrow.', time: '3h' },
  ]

  return (
    <header className="sticky top-0 z-30 h-16 border-b bg-background/80 backdrop-blur-xl flex items-center gap-3 px-4 lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </Button>

      <div className="flex items-center gap-2 flex-1 max-w-md">
        <div className="relative flex-1 hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={`Search in ${city}...`}
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-muted/60 border border-transparent focus:border-emerald-500/40 focus:bg-background text-sm outline-none transition-colors"
          />
        </div>
      </div>

      {/* Live location chip */}
      <LocationChip
        status={locationStatus}
        live={liveLocation}
        error={locationError}
        onDetect={detectLocation}
      />

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setSection('emergency')}
          className="hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-500/20 transition-colors"
        >
          <Siren className="size-3.5" />
          SOS
        </button>



        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
        >
          {mounted && theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
        </Button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 h-9 pl-1 pr-2 rounded-lg hover:bg-accent transition-colors"
            aria-label="Account menu"
          >
            <Avatar className="size-7 ring-2 ring-emerald-500/20">
              <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs font-bold">
                {displayInitials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden md:inline text-sm font-medium max-w-[110px] truncate">{displayName}</span>
            <ChevronDown className="hidden md:inline size-3.5 text-muted-foreground" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-12 z-50 w-72 rounded-xl border bg-popover shadow-xl overflow-hidden">
                {/* Account header */}
                <div className="px-4 py-4 bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10 ring-2 ring-white/30">
                      <AvatarFallback className="bg-white/15 text-white text-sm font-bold backdrop-blur-sm">
                        {displayInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{displayName}</p>
                      <p className="text-[11px] text-emerald-50/85 truncate">
                        {isAuth && user ? user.email : 'Guest mode'}
                      </p>
                    </div>
                  </div>
                  {isAuth && authProvider && (
                    <div className="mt-2 inline-flex items-center gap-1 text-[10px] bg-white/15 rounded-full px-2 py-0.5 backdrop-blur-sm">
                      {authProvider === 'google' && <GoogleIcon className="size-3" />}
                      {authProvider === 'google' ? 'Google account' : 'Email account'}
                    </div>
                  )}
                </div>
                {/* Menu items */}
                <div className="p-1.5">
                  <button
                    onClick={() => { setSection('profile'); setMenuOpen(false) }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors text-left"
                  >
                    <User className="size-4 text-muted-foreground" />
                    Profile & settings
                  </button>
                  {isAuth ? (
                    <button
                      onClick={() => { setMenuOpen(false); signOut() }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                    >
                      <LogOut className="size-4" />
                      Sign out
                    </button>
                  ) : (
                    <button
                      onClick={() => { setMenuOpen(false); setSignInOpen(true) }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors text-left"
                    >
                      <LogIn className="size-4" />
                      Sign in
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export { NAV_ITEMS }
