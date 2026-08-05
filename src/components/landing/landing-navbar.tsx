'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { Compass, Menu, Moon, Sun, Sparkles } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
]

export function LandingNavbar() {
  const setView = useAppStore((s) => s.setView)
  const { theme, setTheme } = useTheme()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

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
          aria-label="LifeLens AI home"
        >
          <span className="relative grid size-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/30 transition-transform group-hover:scale-105">
            <Compass className="size-5" />
            <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-amber-400 ring-2 ring-background" />
          </span>
          <span className="text-lg font-semibold tracking-tight text-foreground">
            LifeLens <span className="text-emerald-600 dark:text-emerald-400">AI</span>
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
              <Moon className="size-5 text-emerald-600" />
            )}
          </Button>

          <Button
            onClick={() => setView('dashboard')}
            className="hidden rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-5 text-white shadow-md shadow-emerald-500/25 hover:from-emerald-700 hover:to-teal-700 sm:inline-flex"
          >
            <Sparkles className="size-4" />
            Launch App
          </Button>

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
                  <span className="text-lg font-semibold">LifeLens AI</span>
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
                <div className="mt-auto px-2 pb-4">
                  <Button
                    onClick={() => setView('dashboard')}
                    className="w-full rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                  >
                    <Sparkles className="size-4" />
                    Launch App
                  </Button>
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
