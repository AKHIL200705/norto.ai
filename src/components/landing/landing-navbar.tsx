'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { Compass, Menu, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { GoogleIcon } from '@/components/auth/google-icon'

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
]

function UserBadge() {
  const user = useAppStore((s) => s.user)
  const isAuth = useAppStore((s) => s.isAuthenticated)
  const setView = useAppStore((s) => s.setView)
  if (!isAuth || !user) return null
  const initials = user.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
  return (
    <button
      onClick={() => setView('dashboard')}
      className="flex items-center gap-2.5 h-11 pl-2 pr-4 rounded-2xl bg-[#E0E5EC] dark:bg-[#181C24] neu-extruded hover:neu-extruded-hover active:neu-inset-sm transition-all cursor-pointer border-0"
      aria-label={`Signed in as ${user.name}`}
    >
      <Avatar className="size-8 neu-inset-deep">
        <AvatarFallback className="bg-[#6C63FF] text-white text-xs font-bold">
          {initials}
        </AvatarFallback>
      </Avatar>
      <span className="hidden sm:inline text-sm font-bold text-[#3D4852] dark:text-[#E2E8F0] max-w-[120px] truncate">{user.name.split(' ')[0]}</span>
    </button>
  )
}

export function LandingNavbar() {
  const setSignInOpen = useAppStore((s) => s.setSignInOpen)
  const isAuth = useAppStore((s) => s.isAuthenticated)
  const user = useAppStore((s) => s.user)
  const { theme, setTheme } = useTheme()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  const userInitials = user?.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase() || 'U'

  const openSignIn = () => setSignInOpen(true)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleNav = (href: string) => {
    setOpen(false)
    const el = document.querySelector(href)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled ? 'bg-[#E0E5EC] dark:bg-[#181C24] neu-extruded-sm border-0' : 'bg-[#E0E5EC] dark:bg-[#181C24]'
      )}
    >
      <nav className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="group flex items-center gap-3 outline-none rounded-2xl cursor-pointer border-0"
          aria-label="Norto home"
        >
          <span className="relative grid size-11 place-items-center rounded-2xl bg-[#E0E5EC] dark:bg-[#181C24] neu-inset-deep transition-transform group-hover:scale-105">
            <Compass className="size-6 text-[#6C63FF]" />
            <span className="absolute right-1 top-1 size-2.5 rounded-full bg-[#38B2AC]" />
          </span>
          <span className="text-2xl font-extrabold tracking-tight text-[#3D4852] dark:text-[#E2E8F0] font-display">
            Nor<span className="text-[#6C63FF]">to</span>
          </span>
        </button>

        {/* Desktop links */}
        <div className="hidden items-center gap-2 md:flex">
          {NAV_LINKS.map((l) => (
            <button
              key={l.href}
              onClick={() => handleNav(l.href)}
              className="rounded-2xl px-4 py-2.5 text-sm font-bold text-[#6B7280] transition-all hover:text-[#3D4852] dark:hover:text-[#E2E8F0] hover:neu-extruded-sm active:neu-inset-sm cursor-pointer border-0"
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="neu-button"
          >
            {theme === 'dark' ? (
              <Sun className="size-5 text-[#6C63FF]" />
            ) : (
              <Moon className="size-5 text-[#6C63FF]" />
            )}
          </Button>

          {isAuth ? (
            <UserBadge />
          ) : (
            <Button
              onClick={openSignIn}
              className="neu-button-primary rounded-2xl h-11 px-6 text-sm font-extrabold cursor-pointer"
            >
              <GoogleIcon className="size-4" />
              <span className="hidden sm:inline">Sign in with Google</span>
              <span className="sm:hidden">Sign in</span>
            </Button>
          )}

          {/* Mobile sheet */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open menu"
                className="md:hidden rounded-full"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <div className="flex h-full flex-col gap-2 pt-6">
                <div className="mb-4 flex items-center gap-2.5 px-2">
                  <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-[#DD0200] via-[#8B0000] to-[#55100D] text-white">
                    <Compass className="size-5" />
                  </span>
                  <span className="text-xl font-extrabold">Norto</span>
                </div>
                {NAV_LINKS.map((l) => (
                  <SheetClose asChild key={l.href}>
                    <button
                      onClick={() => handleNav(l.href)}
                      className="rounded-lg px-3 py-3 text-left text-base font-bold text-foreground transition-colors hover:bg-[#DD0200]/10 hover:text-[#DD0200]"
                    >
                      {l.label}
                    </button>
                  </SheetClose>
                ))}
                <div className="mt-auto px-2 pb-4 space-y-2">
                  {isAuth ? (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#DD0200]/10 border border-[#DD0200]/20">
                      <Avatar className="size-7 ring-2 ring-[#DD0200]/30">
                        <AvatarFallback className="bg-gradient-to-br from-[#DD0200] via-[#8B0000] to-[#55100D] text-white text-xs font-bold">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-bold truncate">{user?.name}</span>
                    </div>
                  ) : (
                    <SheetClose asChild>
                      <Button
                        onClick={openSignIn}
                        className="w-full rounded-full bg-gradient-to-r from-[#DD0200] via-[#8B0000] to-[#55100D] text-white font-bold"
                      >
                        <GoogleIcon className="size-4" />
                        Sign in with Google
                      </Button>
                    </SheetClose>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}

export default LandingNavbar
