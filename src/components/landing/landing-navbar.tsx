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
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
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
      className="flex items-center gap-2 h-9 pl-1 pr-3 rounded-full border bg-background/70 hover:bg-accent transition-colors"
      aria-label={`Signed in as ${user.name}`}
    >
      <Avatar className="size-7 ring-2 ring-emerald-500/20">
        <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs font-bold">
          {initials}
        </AvatarFallback>
      </Avatar>
      <span className="hidden sm:inline text-sm font-medium max-w-[120px] truncate">{user.name.split(' ')[0]}</span>
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
        scrolled ? 'glass shadow-sm' : 'bg-transparent'
      )}
    >
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="group flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
          aria-label="Norto home"
        >
          <span className="relative grid size-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/30 transition-transform group-hover:scale-105">
            <Compass className="size-5" />
            <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-amber-400 ring-2 ring-background" />
          </span>
          <span className="text-lg font-semibold tracking-tight text-foreground">
            Nor<span className="text-emerald-600 dark:text-emerald-400">to</span>
          </span>
        </button>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <button
              key={l.href}
              onClick={() => handleNav(l.href)}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-accent/60"
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-full"
          >
            {theme === 'dark' ? (
              <Sun className="size-5 text-amber-400" />
            ) : (
              <Moon className="size-5 text-[#DD0200]" />
            )}
          </Button>

          {isAuth ? (
            <UserBadge />
          ) : (
            <Button
              onClick={openSignIn}
              className="rounded-xl bg-gradient-to-r from-[#DD0200] via-[#8B0000] to-[#55100D] px-5 text-white shadow-lg shadow-[#DD0200]/25 hover:opacity-95 backdrop-blur-md font-bold"
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
                  <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                    <Compass className="size-5" />
                  </span>
                  <span className="text-lg font-semibold">Norto</span>
                </div>
                {NAV_LINKS.map((l) => (
                  <SheetClose asChild key={l.href}>
                    <button
                      onClick={() => handleNav(l.href)}
                      className="rounded-lg px-3 py-3 text-left text-base font-medium text-foreground transition-colors hover:bg-accent"
                    >
                      {l.label}
                    </button>
                  </SheetClose>
                ))}
                <div className="mt-auto px-2 pb-4 space-y-2">
                  {isAuth ? (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <Avatar className="size-7 ring-2 ring-emerald-500/20">
                        <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs font-bold">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium truncate">{user?.name}</span>
                    </div>
                  ) : (
                    <SheetClose asChild>
                      <Button
                        onClick={openSignIn}
                        className="w-full rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
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
