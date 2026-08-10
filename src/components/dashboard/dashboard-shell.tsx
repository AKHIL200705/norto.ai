'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import {
  Compass, Home, Sparkles, Map, Wallet, Languages,
  Siren, UtensilsCrossed, ScanText, Bookmark, User, Menu,
  Sun, Moon, Search, ChevronRight, LogOut, LogIn, ChevronDown,
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
      <div className="size-9 rounded-xl bg-gradient-to-br from-[#DD0200] to-[#55100D] flex items-center justify-center shadow-lg shadow-[#DD0200]/25 group-hover:scale-105 transition-transform">
        <Compass className="size-5 text-white" />
      </div>
      <div className="flex flex-col items-start leading-none">
        <span className="font-bold text-base tracking-tight text-foreground">Norto</span>
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
            ? 'bg-gradient-to-r from-[#DD0200] via-[#8B0906] to-[#55100D] text-white shadow-lg shadow-[#DD0200]/30 font-bold scale-[1.01]'
            : 'font-semibold text-muted-foreground hover:text-foreground hover:bg-accent/70 hover:scale-[1.01]'
        )}
      >
        <Icon className={cn('size-[18px] shrink-0 transition-transform group-hover:scale-110', active ? 'text-white' : 'group-hover:text-[#DD0200]')} />
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
      <div className="mt-4 mx-1 rounded-xl bg-gradient-to-br from-[#DD0200]/10 to-[#55100D]/10 border border-[#DD0200]/20 p-3">
        <div className="flex items-center gap-2 mb-1.5">
          <Map className="size-3.5 text-[#DD0200]" />
          <span className="text-xs font-bold text-foreground">Current City</span>
        </div>
        <p className="text-xs text-muted-foreground font-medium">{city}</p>
      </div>
    </nav>
  )
}

export function DashboardSidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-64 border-r bg-sidebar shrink-0 min-h-screen">
      <div className="p-4 border-b">
        <SidebarLogo />
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        <NavList />
      </div>
    </aside>
  )
}

export function MobileSidebar({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 p-0 bg-sidebar border-r flex flex-col">
        <div className="p-4 border-b">
          <SidebarLogo />
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          <NavList onNavigate={() => onOpenChange(false)} />
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function DashboardTopbar({ onOpenMobileNav }: { onOpenMobileNav?: () => void }) {
  const setSignInOpen = useAppStore((s) => s.setSignInOpen)
  const setSection = useAppStore((s) => s.setSection)
  const user = useAppStore((s) => s.user)
  const isAuth = useAppStore((s) => s.isAuthenticated)
  const authProvider = useAppStore((s) => s.authProvider)
  const signOut = useAppStore((s) => s.signOut)
  const city = useAppStore((s) => s.city)
  const liveLocation = useAppStore((s) => s.liveLocation)
  const locationStatus = useAppStore((s) => s.locationStatus)
  const detectLocation = useAppStore((s) => s.detectLocation)
  const { theme, setTheme } = useTheme()
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const isMobile = useIsMobile()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const displayName = isAuth && user ? user.name : 'Guest Explorer'
  const displayInitials = isAuth && user
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'GE'

  return (
    <header className="h-16 border-b bg-background/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onOpenMobileNav}
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => detectLocation()}
            disabled={locationStatus === 'loading'}
            className="h-8 text-xs gap-1.5 border-[#DD0200]/30 text-[#DD0200] hover:bg-[#DD0200]/10 font-semibold"
          >
            {locationStatus === 'loading' ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <LocateFixed className="size-3.5" />
            )}
            <span>
              {liveLocation ? liveLocation.city : city}
            </span>
          </Button>

          {liveLocation && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${liveLocation.lat},${liveLocation.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex"
            >
              <Badge variant="secondary" className="gap-1 text-[11px] font-medium hover:bg-muted transition-colors border-[#D9D9D9]">
                <Crosshair className="size-3 text-[#DD0200]" />
                Google Maps GPS · {liveLocation.lat.toFixed(3)}, {liveLocation.lng.toFixed(3)} ↗
              </Badge>
            </a>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setSection('emergency')}
          className="hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-lg bg-[#DD0200]/10 text-[#DD0200] text-xs font-bold hover:bg-[#DD0200]/20 transition-colors"
        >
          <Siren className="size-3.5" />
          SOS Emergency
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
            <Avatar className="size-7 ring-2 ring-[#DD0200]/30">
              <AvatarFallback className="bg-gradient-to-br from-[#DD0200] to-[#55100D] text-white text-xs font-bold">
                {displayInitials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden md:inline text-sm font-semibold max-w-[110px] truncate">{displayName}</span>
            <ChevronDown className="hidden md:inline size-3.5 text-muted-foreground" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-12 z-50 w-72 rounded-xl border bg-popover shadow-xl overflow-hidden">
                {/* Account header */}
                <div className="px-4 py-4 bg-gradient-to-br from-[#DD0200] via-[#8B0906] to-[#55100D] text-white">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10 ring-2 ring-white/30">
                      <AvatarFallback className="bg-white/20 text-white text-sm font-bold backdrop-blur-sm">
                        {displayInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate">{displayName}</p>
                      <p className="text-[11px] text-white/90 truncate">
                        {isAuth && user ? user.email : 'Guest mode'}
                      </p>
                    </div>
                  </div>
                  {isAuth && authProvider && (
                    <div className="mt-2 inline-flex items-center gap-1 text-[10px] bg-white/20 rounded-full px-2 py-0.5 backdrop-blur-sm">
                      {authProvider === 'google' && <GoogleIcon className="size-3" />}
                      {authProvider === 'google' ? 'Google account' : 'Email account'}
                    </div>
                  )}
                </div>
                {/* Menu items */}
                <div className="p-1.5">
                  <button
                    onClick={() => { setSection('profile'); setMenuOpen(false) }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors text-left font-medium"
                  >
                    <User className="size-4 text-muted-foreground" />
                    Profile & settings
                  </button>
                  {isAuth ? (
                    <button
                      onClick={() => { setMenuOpen(false); signOut() }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#DD0200] hover:bg-[#DD0200]/10 transition-colors text-left font-bold"
                    >
                      <LogOut className="size-4" />
                      Sign out
                    </button>
                  ) : (
                    <button
                      onClick={() => { setMenuOpen(false); setSignInOpen(true) }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#DD0200] hover:bg-[#DD0200]/10 transition-colors text-left font-bold"
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
