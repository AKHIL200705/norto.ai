'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import {
  Compass, Home, Sparkles, Map, Wallet, CloudSun, Languages,
  Siren, UtensilsCrossed, ScanText, Bookmark, User, Menu,
  Sun, Moon, Search, Bell, ChevronRight, LogOut, LogIn, ChevronDown,
  LocateFixed, Loader2, AlertTriangle, Crosshair, History,
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
  { id: 'home', label: 'Dashboard', icon: Home, group: 'main' },
  { id: 'assistant', label: 'AI Assistant', icon: Sparkles, group: 'tools' },
  { id: 'history', label: 'Chat History', icon: History, group: 'tools' },
  { id: 'map', label: 'Smart Map', icon: Map, group: 'tools' },
  { id: 'budget', label: 'Budget Planner', icon: Wallet, group: 'tools' },
  { id: 'translator', label: 'Translator', icon: Languages, group: 'tools' },
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
      className="flex items-center gap-3 w-full px-2 group cursor-pointer"
      aria-label="Norto home"
    >
      <div className="size-10 rounded-2xl bg-[#E0E5EC] dark:bg-[#181C24] neu-inset-deep flex items-center justify-center group-hover:scale-105 transition-transform">
        <Compass className="size-5 text-[#6C63FF]" />
      </div>
      <div className="flex flex-col items-start leading-none">
        <span className="font-extrabold text-base tracking-tight text-[#3D4852] dark:text-[#E2E8F0] font-display">Norto</span>
        <span className="text-[10px] text-[#6B7280] font-medium mt-0.5">Your City Companion</span>
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
          'w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-all duration-300 group relative cursor-pointer border-0',
          active
            ? 'bg-[#6C63FF] text-white neu-extruded font-bold -translate-y-0.5'
            : 'font-bold text-[#6B7280] hover:text-[#3D4852] dark:hover:text-[#E2E8F0] hover:neu-extruded-sm active:neu-inset-sm'
        )}
      >
        <Icon className={cn('size-[18px] shrink-0 transition-transform group-hover:scale-110', active ? 'text-white' : 'group-hover:text-[#6C63FF]')} />
        <span className="flex-1 text-left">{item.label}</span>
        {active && <ChevronRight className="size-4 text-white/90 animate-pulse" />}
      </button>
    )
  }

  return (
    <nav className="flex flex-col gap-1.5 px-3 py-2">
      {mainItems.map(renderItem)}
      <div className="px-3 pt-5 pb-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
          City Tools
        </span>
      </div>
      {toolItems.map(renderItem)}
      <div className="mt-5 mx-1 rounded-2xl bg-[#E0E5EC] dark:bg-[#181C24] neu-inset-deep p-4">
        <div className="flex items-center gap-2 mb-1.5">
          <Map className="size-4 text-[#38B2AC]" />
          <span className="text-xs font-bold text-[#38B2AC]">Current City</span>
        </div>
        <p className="text-sm font-extrabold text-[#3D4852] dark:text-[#E2E8F0]">{city}</p>
        <p className="text-[11px] text-[#6B7280] mt-0.5 font-medium">Explore local intel below</p>
      </div>
    </nav>
  )
}

export function DashboardSidebar() {
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-[#E0E5EC] dark:bg-[#181C24] neu-inset-sm border-r-0">
      <div className="h-20 flex items-center px-5">
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
      <span className="inline-flex items-center gap-1.5 h-11 px-3 sm:px-4 rounded-2xl bg-[#E0E5EC] dark:bg-[#181C24] neu-inset text-[#6C63FF] text-xs font-bold">
        <Loader2 className="size-3.5 animate-spin text-[#6C63FF]" />
        <span className="hidden sm:inline">Locating…</span>
      </span>
    )
  }

  if (status === 'error') {
    return (
      <div className="inline-flex items-center gap-2">
        <button
          onClick={() => setExactLocation('Singarayakonda')}
          title="Set location to Singarayakonda"
          className="inline-flex items-center gap-1.5 h-11 px-3.5 rounded-2xl bg-[#6C63FF] text-white text-xs font-bold neu-extruded hover:-translate-y-0.5 active:neu-inset-sm transition-all cursor-pointer"
        >
          <LocateFixed className="size-3.5" />
          <span>Set Singarayakonda</span>
        </button>
        <button
          onClick={onDetect}
          title={error || 'Retry auto-detect'}
          className="inline-flex items-center justify-center size-11 rounded-2xl bg-[#E0E5EC] dark:bg-[#181C24] neu-inset text-[#E53E3E] hover:neu-inset-deep transition-all cursor-pointer"
        >
          <AlertTriangle className="size-3.5 text-[#E53E3E]" />
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
          className="inline-flex items-center gap-2 h-11 px-3.5 sm:px-4 rounded-2xl bg-[#E0E5EC] dark:bg-[#181C24] neu-extruded hover:neu-extruded-hover active:neu-inset-sm text-[#38B2AC] text-xs font-bold transition-all cursor-pointer border-0"
        >
          <Crosshair className="size-3.5 text-[#38B2AC]" />
          <span className="max-w-[90px] sm:max-w-[140px] truncate text-[#3D4852] dark:text-[#E2E8F0]">{live.city}</span>
          <span className="hidden sm:inline-flex items-center gap-0.5 text-[10px] text-[#38B2AC] font-extrabold">
            ±{accuracyM}m
          </span>
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-14 z-50 w-72 sm:w-80 rounded-[32px] bg-[#E0E5EC] dark:bg-[#181C24] neu-extruded p-2 overflow-hidden border-0">
              <div className="px-4 py-3.5 rounded-2xl bg-[#38B2AC] text-white neu-extruded">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-white font-extrabold">
                  <Crosshair className="size-3" />
                  Live GPS Location
                </div>
                <p className="text-sm font-extrabold mt-0.5">{live.exactAddress || live.city}</p>
                <p className="text-[11px] text-teal-100">
                  {[live.region, live.country].filter(Boolean).join(', ')}
                </p>
              </div>
              <div className="p-3 space-y-2 text-xs">
                <div className="p-3 rounded-2xl bg-[#E0E5EC] dark:bg-[#181C24] neu-inset text-[#3D4852] dark:text-[#E2E8F0] text-[11px] leading-tight space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="font-extrabold flex items-center gap-1.5 text-[#38B2AC]">
                      <Crosshair className="size-3.5" /> High-Precision GPS
                    </p>
                  </div>
                  <p className="text-[#6B7280] text-[10px] font-medium">
                    Exact coordinates active for smart map and weather recommendations.
                  </p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${live.lat},${live.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-[#6C63FF] hover:underline"
                  >
                    View pin on Google Maps ↗
                  </a>
                </div>
                {live.displayName && (
                  <div className="flex flex-col gap-0.5 p-2.5 rounded-2xl neu-inset-sm">
                    <span className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider">Exact Address</span>
                    <span className="text-xs font-semibold leading-tight text-[#3D4852] dark:text-[#E2E8F0]">{live.displayName}</span>
                  </div>
                )}
                <div className="flex justify-between px-1">
                  <span className="text-[#6B7280] font-semibold">Latitude</span>
                  <span className="font-mono font-bold text-[#6C63FF]">{live.lat.toFixed(5)}</span>
                </div>
                <div className="flex justify-between px-1">
                  <span className="text-[#6B7280] font-semibold">Longitude</span>
                  <span className="font-mono font-bold text-[#6C63FF]">{live.lng.toFixed(5)}</span>
                </div>
                <div className="flex justify-between px-1">
                  <span className="text-[#6B7280] font-semibold">Accuracy</span>
                  <span className="font-extrabold text-[#38B2AC]">
                    ±{accuracyM}m · {accuracyLabel}
                  </span>
                </div>

                <div className="pt-2.5 border-t border-[#6B7280]/20 space-y-2">
                  <p className="text-[10px] text-[#6B7280] uppercase font-extrabold tracking-wider">Set Exact Location</p>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      const val = (e.currentTarget.elements.namedItem('town') as HTMLInputElement)?.value
                      if (val) {
                        setExactLocation(val)
                        setOpen(false)
                      }
                    }}
                    className="flex gap-2"
                  >
                    <input
                      name="town"
                      type="text"
                      placeholder="e.g. Singarayakonda"
                      className="flex-1 h-9 px-3 rounded-xl bg-[#E0E5EC] dark:bg-[#181C24] neu-inset text-xs font-medium text-[#3D4852] dark:text-[#E2E8F0] focus:neu-inset-deep outline-none border-0"
                    />
                    <button
                      type="submit"
                      className="h-9 px-3 rounded-xl bg-[#6C63FF] text-white text-xs font-bold neu-extruded hover:-translate-y-0.5 active:neu-inset-sm transition-all cursor-pointer"
                    >
                      Set
                    </button>
                  </form>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['Singarayakonda', 'Ongole', 'Kavali', 'Hyderabad'].map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => {
                          setExactLocation(loc)
                          setOpen(false)
                        }}
                        className="px-2.5 py-1 rounded-xl bg-[#E0E5EC] dark:bg-[#181C24] neu-extruded-sm hover:neu-extruded text-[11px] font-bold text-[#3D4852] dark:text-[#E2E8F0] hover:text-[#6C63FF] transition-all cursor-pointer"
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-2 pt-0">
                <button
                  onClick={() => { onDetect(); setOpen(false) }}
                  className="w-full flex items-center justify-center gap-1.5 h-10 rounded-2xl bg-[#E0E5EC] dark:bg-[#181C24] neu-inset hover:neu-inset-deep text-xs font-bold text-[#6C63FF] transition-all cursor-pointer"
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
      className="inline-flex items-center gap-1.5 h-11 px-3.5 sm:px-4 rounded-2xl bg-[#E0E5EC] dark:bg-[#181C24] neu-extruded hover:neu-extruded-hover active:neu-inset-sm text-[#6C63FF] text-xs font-bold transition-all cursor-pointer border-0"
    >
      <LocateFixed className="size-3.5 text-[#6C63FF]" />
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
  const [mounted] = React.useState<boolean>(() => typeof window !== 'undefined')
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

  const displayName = isAuth && user ? user.name : 'Explorer'
  const displayInitials = (isAuth && user
    ? user.name
    : 'City Explorer'
  ).split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()

  const [menuOpen, setMenuOpen] = React.useState(false)

  return (
    <header className="sticky top-0 z-30 h-20 bg-[#E0E5EC] dark:bg-[#181C24] neu-extruded-sm flex items-center gap-4 px-4 lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden neu-button"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="size-5 text-[#3D4852] dark:text-[#E2E8F0]" />
      </Button>

      <div className="flex items-center gap-2 flex-1 max-w-md">
        <div className="relative flex-1 hidden sm:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#6B7280]" />
          <input
            type="text"
            placeholder={`Search in ${city}...`}
            className="w-full h-11 pl-10 pr-4 rounded-2xl bg-[#E0E5EC] dark:bg-[#181C24] text-[#3D4852] dark:text-[#E2E8F0] neu-inset focus:neu-inset-deep text-sm outline-none transition-all duration-300 placeholder:text-[#6B7280]"
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

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
          className="neu-button"
        >
          {mounted && theme === 'dark' ? <Sun className="size-5 text-[#6C63FF]" /> : <Moon className="size-5 text-[#6C63FF]" />}
        </Button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2.5 h-11 pl-2 pr-3 rounded-2xl bg-[#E0E5EC] dark:bg-[#181C24] neu-extruded hover:neu-extruded-hover active:neu-inset-sm transition-all duration-300 cursor-pointer border-0"
            aria-label="Account menu"
          >
            <Avatar className="size-8 neu-inset-deep">
              <AvatarFallback className="bg-[#6C63FF] text-white text-xs font-bold">
                {displayInitials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden md:inline text-sm font-bold text-[#3D4852] dark:text-[#E2E8F0] max-w-[110px] truncate">{displayName}</span>
            <ChevronDown className="hidden md:inline size-3.5 text-[#6B7280]" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-14 z-50 w-72 rounded-[32px] bg-[#E0E5EC] dark:bg-[#181C24] neu-extruded p-2 overflow-hidden border-0">
                {/* Account header */}
                <div className="px-5 py-4 rounded-2xl bg-[#6C63FF] text-white neu-extruded">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10 neu-inset-deep">
                      <AvatarFallback className="bg-white/20 text-white text-sm font-bold backdrop-blur-sm">
                        {displayInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-extrabold truncate">{displayName}</p>
                      <p className="text-[11px] text-violet-100 truncate">
                        {isAuth && user ? user.email : 'Guest mode'}
                      </p>
                    </div>
                  </div>
                  {isAuth && authProvider && (
                    <div className="mt-2 inline-flex items-center gap-1 text-[10px] bg-white/20 rounded-full px-2.5 py-0.5 font-bold">
                      {authProvider === 'google' && <GoogleIcon className="size-3" />}
                      {authProvider === 'google' ? 'Google account' : 'Email account'}
                    </div>
                  )}
                </div>
                {/* Menu items */}
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => { setSection('profile'); setMenuOpen(false) }}
                    className="w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-bold text-[#3D4852] dark:text-[#E2E8F0] hover:neu-extruded-sm active:neu-inset-sm transition-all text-left cursor-pointer"
                  >
                    <User className="size-4 text-[#6C63FF]" />
                    Profile & settings
                  </button>
                  {isAuth ? (
                    <button
                      onClick={() => { setMenuOpen(false); signOut() }}
                      className="w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-bold text-[#E53E3E] hover:neu-extruded-sm active:neu-inset-sm transition-all text-left cursor-pointer"
                    >
                      <LogOut className="size-4 text-[#E53E3E]" />
                      Sign out
                    </button>
                  ) : (
                    <button
                      onClick={() => { setMenuOpen(false); setSignInOpen(true) }}
                      className="w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-bold text-[#38B2AC] hover:neu-extruded-sm active:neu-inset-sm transition-all text-left cursor-pointer"
                    >
                      <LogIn className="size-4 text-[#38B2AC]" />
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
