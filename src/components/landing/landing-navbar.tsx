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
  { label: 'FEATURES', href: '#features' },
  { label: 'WORKFLOW', href: '#how-it-works' },
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
      className="flex items-center gap-2.5 h-11 pl-2 pr-4 rounded-lg bg-[#e0e5ec] dark:bg-[#1e2227] neu-card hover:neu-floating active:translate-y-[2px] transition-all cursor-pointer border-0 font-mono"
      aria-label={`Signed in as ${user.name}`}
    >
      <Avatar className="size-8 neu-recessed">
        <AvatarFallback className="bg-[#ff4757] text-white text-xs font-bold">
          {initials}
        </AvatarFallback>
      </Avatar>
      <span className="hidden sm:inline text-xs font-bold text-[#2d3436] dark:text-[#f0f2f5] max-w-[120px] truncate">{user.name.split(' ')[0]}</span>
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
        'sticky top-0 z-50 w-full transition-all duration-300 font-mono',
        scrolled ? 'bg-[#e0e5ec] dark:bg-[#1e2227] neu-card border-0' : 'bg-[#e0e5ec] dark:bg-[#1e2227]'
      )}
    >
      <nav className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="group flex items-center gap-3 outline-none rounded-lg cursor-pointer border-0"
          aria-label="Norto home"
        >
          <span className="relative grid size-11 place-items-center rounded-xl bg-[#e0e5ec] dark:bg-[#1e2227] neu-recessed transition-transform group-hover:scale-105">
            <Compass className="size-6 text-[#ff4757]" />
            <span className="absolute top-1 right-1 size-2 rounded-full bg-[#22c55e] animate-led-pulse neu-glow-green" />
          </span>
          <span className="text-2xl font-extrabold tracking-tight text-[#2d3436] dark:text-[#f0f2f5]">
            Nor<span className="text-[#ff4757]">to</span>
          </span>
        </button>

        {/* Desktop links */}
        <div className="hidden items-center gap-3 md:flex">
          {NAV_LINKS.map((l) => (
            <button
              key={l.href}
              onClick={() => handleNav(l.href)}
              className="rounded-md px-4 py-2 text-xs font-bold text-[#4a5568] transition-all hover:text-[#ff4757] hover:neu-card active:translate-y-[2px] cursor-pointer border-0"
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
            className="neu-button-secondary rounded-lg"
          >
            {theme === 'dark' ? (
              <Sun className="size-5 text-[#ff4757]" />
            ) : (
              <Moon className="size-5 text-[#ff4757]" />
            )}
          </Button>

          {isAuth ? (
            <UserBadge />
          ) : (
            <Button
              onClick={openSignIn}
              className="neu-button-primary rounded-lg h-11 px-6 text-xs font-bold cursor-pointer"
            >
              <GoogleIcon className="size-4" />
              <span className="hidden sm:inline">SIGN IN</span>
              <span className="sm:hidden">SIGN IN</span>
            </Button>
          )}

          {/* Mobile sheet */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open menu"
                className="md:hidden neu-button-secondary rounded-lg"
              >
                <Menu className="size-5 text-[#2d3436]" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px] bg-[#e0e5ec] dark:bg-[#1e2227] border-0 neu-floating text-[#2d3436] font-mono">
              <div className="flex h-full flex-col gap-3 pt-6">
                <div className="mb-4 flex items-center gap-3 px-2">
                  <span className="grid size-11 place-items-center rounded-xl bg-[#e0e5ec] dark:bg-[#1e2227] neu-recessed">
                    <Compass className="size-6 text-[#ff4757]" />
                  </span>
                  <span className="text-xl font-extrabold tracking-tight text-[#2d3436] dark:text-[#f0f2f5]">
                    Nor<span className="text-[#ff4757]">to</span>
                  </span>
                </div>
                {NAV_LINKS.map((l) => (
                  <SheetClose asChild key={l.href}>
                    <button
                      onClick={() => handleNav(l.href)}
                      className="rounded-lg px-4 py-3 text-left text-xs font-bold text-[#4a5568] transition-colors hover:text-[#ff4757] hover:neu-card cursor-pointer border-0"
                    >
                      {l.label}
                    </button>
                  </SheetClose>
                ))}
                <div className="mt-auto px-2 pb-4 space-y-3">
                  {isAuth ? (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#e0e5ec] dark:bg-[#1e2227] neu-card">
                      <Avatar className="size-8 neu-recessed">
                        <AvatarFallback className="bg-[#ff4757] text-white text-xs font-bold">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-bold truncate text-[#2d3436] dark:text-[#f0f2f5]">{user?.name}</span>
                    </div>
                  ) : (
                    <SheetClose asChild>
                      <Button
                        onClick={openSignIn}
                        className="w-full neu-button-primary rounded-lg h-12 text-xs font-bold cursor-pointer"
                      >
                        <GoogleIcon className="size-4" />
                        SIGN IN WITH GOOGLE
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
