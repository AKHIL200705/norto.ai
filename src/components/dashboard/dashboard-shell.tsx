'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import {
  Compass, Home, Sparkles, Map, Wallet, CloudSun, Languages,
  Siren, UtensilsCrossed, ScanText, Bookmark, User, Menu,
  Sun, Moon, Search, ChevronRight, LogOut, LogIn, ChevronDown,
  LocateFixed, Loader2, AlertTriangle, Crosshair, History,
} from 'lucide-react'
import { useAppStore, type LiveLocation, type LocationStatus } from '@/lib/store'
import type { DashboardSection } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { GoogleIcon } from '@/components/auth/google-icon'
import { Sheet, SheetContent } from '@/components/ui/sheet'

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
      className="flex items-center gap-3 w-full px-2 group cursor-pointer border-0"
      aria-label="Norto home"
    >
      <div className="size-11 rounded-xl bg-[#e0e5ec] dark:bg-[#1e2227] neu-recessed flex items-center justify-center group-hover:scale-105 transition-transform relative">
        <Compass className="size-6 text-[#ff4757]" />
        <span className="absolute top-1 right-1 size-2 rounded-full bg-[#22c55e] neu-glow-green" />
      </div>
      <div className="flex flex-col items-start leading-none">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-lg tracking-tight text-[#2d3436] dark:text-[#f0f2f5]">Nor<span className="text-[#ff4757]">to</span></span>
          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#2d3436] text-[#ff4757]">v2.0</span>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#4a5568] font-bold mt-1">SYS_ONLINE</span>
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
          'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all duration-150 group relative cursor-pointer border-0',
          active
            ? 'neu-button-primary text-white'
            : 'text-[#4a5568] hover:text-[#ff4757] hover:neu-card active:neu-pressed'
        )}
      >
        <Icon className={cn('size-[18px] shrink-0 transition-transform group-hover:scale-110', active ? 'text-white' : 'group-hover:text-[#ff4757]')} />
        <span className="flex-1 text-left">{item.label}</span>
        {active && <ChevronRight className="size-4 text-white/90 animate-pulse" />}
      </button>
    )
  }

  return (
    <nav className="flex flex-col gap-1.5 px-3 py-2">
      {mainItems.map(renderItem)}
      <div className="px-3 pt-5 pb-1.5 flex items-center justify-between">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#4a5568]">
          // City Tools
        </span>
        <div className="h-1 w-8 rounded-full bg-[#d1d9e6] neu-recessed" />
      </div>
      {toolItems.map(renderItem)}
      <div className="mt-5 mx-1 rounded-xl bg-[#e0e5ec] dark:bg-[#1e2227] neu-recessed p-4">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-[#22c55e] animate-led-pulse neu-glow-green" />
            <span className="text-[10px] font-mono font-bold text-[#4a5568] uppercase">LOCATION_TAG</span>
          </div>
          <span className="text-[10px] font-mono text-[#ff4757] font-bold">ACTIVE</span>
        </div>
        <p className="text-base font-extrabold text-[#2d3436] dark:text-[#f0f2f5] font-mono">{city}</p>
        <p className="text-[10px] font-mono text-[#4a5568] mt-0.5">LAT/LNG TELEMETRY OK</p>
      </div>
    </nav>
  )
}

export function DashboardSidebar() {
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-[#e0e5ec] dark:bg-[#1e2227] neu-card border-r-0">
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
      <SheetContent side="left" className="w-72 p-0 bg-[#e0e5ec] dark:bg-[#1e2227] border-0 neu-card">
        <div className="h-20 flex items-center px-5 border-b border-[#d1d9e6]/40">
          <SidebarLogo />
        </div>
        <div className="overflow-y-auto h-[calc(100vh-5rem)]">
          <NavList onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  )
}

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
  const accuracyLabel =
    accuracyM === null ? '' : accuracyM < 50 ? 'High' : accuracyM < 200 ? 'Good' : 'Approx.'

  if (status === 'loading') {
    return (
      <span className="inline-flex items-center gap-2 h-11 px-4 rounded-lg bg-[#e0e5ec] dark:bg-[#1e2227] neu-recessed text-[#ff4757] text-xs font-mono font-bold">
        <Loader2 className="size-3.5 animate-spin text-[#ff4757]" />
        <span className="hidden sm:inline">GPS_LOCKING…</span>
      </span>
    )
  }

  if (status === 'error') {
    return (
      <div className="inline-flex items-center gap-2">
        <button
          onClick={() => setExactLocation('Singarayakonda')}
          title="Set location to Singarayakonda"
          className="inline-flex items-center gap-2 h-11 px-4 rounded-lg neu-button-primary text-xs font-mono font-bold cursor-pointer"
        >
          <LocateFixed className="size-3.5" />
          <span>SET_SINGARAYAKONDA</span>
        </button>
        <button
          onClick={onDetect}
          title={error || 'Retry auto-detect'}
          className="inline-flex items-center justify-center size-11 rounded-lg bg-[#e0e5ec] dark:bg-[#1e2227] neu-recessed text-[#ff4757] hover:brightness-110 cursor-pointer"
        >
          <AlertTriangle className="size-4 text-[#ff4757]" />
        </button>
      </div>
    )
  }

  if (status === 'success' && live) {
    return (
      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-2 h-11 px-4 rounded-lg bg-[#e0e5ec] dark:bg-[#1e2227] neu-card hover:neu-floating text-[#ff4757] text-xs font-mono font-bold transition-all cursor-pointer border-0"
        >
          <span className="size-2 rounded-full bg-[#22c55e] animate-led-pulse neu-glow-green" />
          <span className="max-w-[90px] sm:max-w-[140px] truncate text-[#2d3436] dark:text-[#f0f2f5]">{live.city}</span>
          <span className="hidden sm:inline-flex text-[10px] text-[#22c55e] font-bold">
            ±{accuracyM}m
          </span>
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-14 z-50 w-72 sm:w-80 rounded-2xl bg-[#e0e5ec] dark:bg-[#1e2227] neu-floating p-4 overflow-hidden border-0">
              <div className="px-4 py-3 rounded-xl bg-[#2d3436] text-white neu-sharp mb-3">
                <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#ff4757] uppercase">
                  <span className="flex items-center gap-1.5"><Crosshair className="size-3" /> GPS_TELEMETRY</span>
                  <span className="text-[#22c55e]">LOCKED</span>
                </div>
                <p className="text-sm font-extrabold mt-1 font-mono">{live.exactAddress || live.city}</p>
                <p className="text-[11px] text-[#a0aec0] font-mono">
                  {[live.region, live.country].filter(Boolean).join(', ')}
                </p>
              </div>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between px-1">
                  <span className="text-[#4a5568]">LATITUDE</span>
                  <span className="font-bold text-[#ff4757]">{live.lat.toFixed(5)}</span>
                </div>
                <div className="flex justify-between px-1">
                  <span className="text-[#4a5568]">LONGITUDE</span>
                  <span className="font-bold text-[#ff4757]">{live.lng.toFixed(5)}</span>
                </div>
                <div className="flex justify-between px-1">
                  <span className="text-[#4a5568]">ACCURACY</span>
                  <span className="font-bold text-[#22c55e]">±{accuracyM}m · {accuracyLabel}</span>
                </div>

                <div className="pt-3 border-t border-[#d1d9e6] dark:border-[#2a3037] space-y-2">
                  <p className="text-[10px] text-[#4a5568] uppercase font-bold tracking-wider">// Override Location</p>
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
                      className="flex-1 h-9 px-3 rounded-md bg-[#e0e5ec] dark:bg-[#15181c] neu-recessed text-xs font-mono text-[#2d3436] dark:text-[#f0f2f5] outline-none border-0"
                    />
                    <button
                      type="submit"
                      className="h-9 px-3 rounded-md neu-button-primary text-xs font-mono font-bold cursor-pointer"
                    >
                      SET
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
                        className="px-2.5 py-1 rounded-md bg-[#e0e5ec] dark:bg-[#1e2227] neu-card hover:text-[#ff4757] text-[11px] font-mono font-bold transition-all cursor-pointer border-0"
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <button
      onClick={onDetect}
      className="inline-flex items-center gap-2 h-11 px-4 rounded-lg bg-[#e0e5ec] dark:bg-[#1e2227] neu-card hover:neu-floating text-[#ff4757] text-xs font-mono font-bold transition-all cursor-pointer border-0"
    >
      <LocateFixed className="size-4 text-[#ff4757]" />
      <span className="hidden sm:inline">LOCATE_GPS</span>
    </button>
  )
}

export function DashboardTopbar() {
  const { theme, setTheme } = useTheme()
  const [mounted] = React.useState<boolean>(() => typeof window !== 'undefined')
  const setSection = useAppStore((s) => s.section)
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
    <header className="sticky top-0 z-30 h-20 bg-[#e0e5ec] dark:bg-[#1e2227] neu-card flex items-center gap-4 px-4 lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden neu-button-secondary"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="size-5 text-[#2d3436] dark:text-[#f0f2f5]" />
      </Button>

      <div className="flex items-center gap-2 flex-1 max-w-md">
        <div className="relative flex-1 hidden sm:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#4a5568]" />
          <input
            type="text"
            placeholder={`Search in ${city}...`}
            className="w-full h-11 pl-10 pr-4 rounded-lg bg-[#e0e5ec] dark:bg-[#15181c] text-[#2d3436] dark:text-[#f0f2f5] neu-recessed focus:ring-2 focus:ring-[#ff4757] text-xs font-mono outline-none transition-all duration-200 placeholder:text-[#4a5568]"
          />
        </div>
      </div>

      <LocationChip
        status={locationStatus}
        live={liveLocation}
        error={locationError}
        onDetect={detectLocation}
      />

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
          className="neu-button-secondary rounded-lg"
        >
          {mounted && theme === 'dark' ? <Sun className="size-5 text-[#ff4757]" /> : <Moon className="size-5 text-[#ff4757]" />}
        </Button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2.5 h-11 pl-2 pr-3 rounded-lg bg-[#e0e5ec] dark:bg-[#1e2227] neu-card hover:neu-floating active:translate-y-[2px] transition-all cursor-pointer border-0"
            aria-label="Account menu"
          >
            <Avatar className="size-8 neu-recessed">
              <AvatarFallback className="bg-[#ff4757] text-white text-xs font-mono font-bold">
                {displayInitials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden md:inline text-xs font-mono font-bold text-[#2d3436] dark:text-[#f0f2f5] max-w-[110px] truncate">{displayName}</span>
            <ChevronDown className="hidden md:inline size-3.5 text-[#4a5568]" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-14 z-50 w-72 rounded-2xl bg-[#e0e5ec] dark:bg-[#1e2227] neu-floating p-2 overflow-hidden border-0">
                <div className="px-5 py-4 rounded-xl bg-[#2d3436] text-white neu-sharp">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10 neu-recessed">
                      <AvatarFallback className="bg-[#ff4757] text-white text-xs font-mono font-bold">
                        {displayInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 font-mono">
                      <p className="text-xs font-bold truncate">{displayName}</p>
                      <p className="text-[10px] text-[#a0aec0] truncate">
                        {isAuth && user ? user.email : 'GUEST_USER'}
                      </p>
                    </div>
                  </div>
                  {isAuth && authProvider && (
                    <div className="mt-2.5 inline-flex items-center gap-1.5 text-[10px] font-mono bg-[#ff4757]/20 text-[#ff4757] border border-[#ff4757]/30 rounded px-2 py-0.5 font-bold">
                      {authProvider === 'google' && <GoogleIcon className="size-3" />}
                      {authProvider === 'google' ? 'GOOGLE_AUTH' : 'EMAIL_AUTH'}
                    </div>
                  )}
                </div>
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => { useAppStore.getState().setSection('profile'); setMenuOpen(false) }}
                    className="w-full flex items-center gap-2.5 px-4 py-3 rounded-lg text-xs font-mono font-bold text-[#2d3436] dark:text-[#f0f2f5] hover:text-[#ff4757] hover:neu-card transition-all text-left cursor-pointer border-0"
                  >
                    <User className="size-4 text-[#ff4757]" />
                    USER_PROFILE
                  </button>
                  {isAuth ? (
                    <button
                      onClick={() => { setMenuOpen(false); signOut() }}
                      className="w-full flex items-center gap-2.5 px-4 py-3 rounded-lg text-xs font-mono font-bold text-[#ff4757] hover:neu-card transition-all text-left cursor-pointer border-0"
                    >
                      <LogOut className="size-4 text-[#ff4757]" />
                      LOGOUT_SYS
                    </button>
                  ) : (
                    <button
                      onClick={() => { setMenuOpen(false); setSignInOpen(true) }}
                      className="w-full flex items-center gap-2.5 px-4 py-3 rounded-lg text-xs font-mono font-bold text-[#22c55e] hover:neu-card transition-all text-left cursor-pointer border-0"
                    >
                      <LogIn className="size-4 text-[#22c55e]" />
                      SIGN_IN
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
