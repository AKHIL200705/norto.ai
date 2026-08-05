'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import {
  Compass, Home, Sparkles, Map, Wallet, CloudSun, Languages,
  Siren, UtensilsCrossed, ScanText, Bookmark, User, Menu,
  Sun, Moon, Search, Bell, ChevronRight,
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import type { DashboardSection } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent } from '@/components/ui/sheet'

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
  { id: 'weather', label: 'Weather', icon: CloudSun, group: 'tools' },
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
      aria-label="LifeLens AI home"
    >
      <div className="size-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform">
        <Compass className="size-5 text-white" />
      </div>
      <div className="flex flex-col items-start leading-none">
        <span className="font-bold text-base tracking-tight">LifeLens</span>
        <span className="text-[10px] text-muted-foreground font-medium">AI City Companion</span>
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
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative',
          active
            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
        )}
      >
        <Icon className={cn('size-[18px] shrink-0', active ? 'text-white' : 'group-hover:text-emerald-600')} />
        <span className="flex-1 text-left">{item.label}</span>
        {active && <ChevronRight className="size-4 text-white/80" />}
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

export function DashboardTopbar() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const setSection = useAppStore((s) => s.setSection)
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen)
  const city = useAppStore((s) => s.city)

  React.useEffect(() => setMounted(true), [])

  const [notifOpen, setNotifOpen] = React.useState(false)
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

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setSection('emergency')}
          className="hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-500/20 transition-colors"
        >
          <Siren className="size-3.5" />
          SOS
        </button>

        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setNotifOpen((v) => !v)}
            aria-label="Notifications"
          >
            <Bell className="size-5" />
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-rose-500 ring-2 ring-background" />
          </Button>
          {notifOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 top-12 z-50 w-80 rounded-xl border bg-popover shadow-xl overflow-hidden">
                <div className="px-4 py-3 border-b flex items-center justify-between">
                  <span className="font-semibold text-sm">Notifications</span>
                  <Badge variant="secondary" className="text-[10px]">{notifications.length} new</Badge>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((n, i) => (
                    <div key={i} className="px-4 py-3 border-b last:border-0 hover:bg-accent/50 transition-colors">
                      <div className="flex items-start gap-2">
                        <div className={cn(
                          'size-7 rounded-lg flex items-center justify-center shrink-0',
                          n.type === 'weather' && 'bg-sky-500/10 text-sky-500',
                          n.type === 'budget' && 'bg-emerald-500/10 text-emerald-600',
                          n.type === 'festival' && 'bg-amber-500/10 text-amber-500',
                        )}>
                          {n.type === 'weather' ? <CloudSun className="size-3.5" /> : n.type === 'budget' ? <Wallet className="size-3.5" /> : <Sparkles className="size-3.5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium leading-tight">{n.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-[10px] text-muted-foreground/70 mt-1">{n.time} ago</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
        >
          {mounted && theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
        </Button>

        <button
          onClick={() => setSection('profile')}
          className="flex items-center gap-2 h-9 pl-1 pr-2 rounded-lg hover:bg-accent transition-colors"
        >
          <Avatar className="size-7 ring-2 ring-emerald-500/20">
            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs font-bold">
              CE
            </AvatarFallback>
          </Avatar>
          <span className="hidden md:inline text-sm font-medium">Explorer</span>
        </button>
      </div>
    </header>
  )
}

export { NAV_ITEMS }
