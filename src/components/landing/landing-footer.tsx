'use client'

import * as React from 'react'
import { Compass, Twitter, Github, Linkedin, Mail, ArrowUpRight } from 'lucide-react'
import { useAppStore } from '@/lib/store'

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'How it works', href: '#how-it-works' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'FAQ', href: '#faq' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'City guides', href: '#' },
      { label: 'Relocation blog', href: '#' },
      { label: 'Help center', href: '#' },
      { label: 'API docs', href: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy policy', href: '#' },
      { label: 'Terms of service', href: '#' },
      { label: 'Cookie policy', href: '#' },
      { label: 'Refund policy', href: '#' },
    ],
  },
]

const SOCIALS = [
  { icon: Twitter, label: 'Twitter', href: '#' },
  { icon: Github, label: 'GitHub', href: '#' },
  { icon: Linkedin, label: 'LinkedIn', href: '#' },
  { icon: Mail, label: 'Email', href: '#' },
]

export function LandingFooter() {
  const setView = useAppStore((s) => s.setView)

  const handleNav = (href: string) => {
    if (href.startsWith('#') && href.length > 1) {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <footer className="mt-auto border-t border-border/60 bg-gradient-to-b from-transparent to-emerald-500/5">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          {/* Brand column */}
          <div className="col-span-2">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
              aria-label="LifeLens AI home"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/30">
                <Compass className="size-5" />
              </span>
              <span className="text-lg font-semibold tracking-tight">
                LifeLens <span className="text-emerald-600 dark:text-emerald-400">AI</span>
              </span>
            </button>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Your AI companion for every new city. Move, settle, and explore
              with confidence — built for India.
            </p>

            <button
              onClick={() => setView('dashboard')}
              className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2 text-sm font-medium text-white shadow-md shadow-emerald-500/25 transition-all hover:from-emerald-700 hover:to-teal-700"
            >
              Launch App
              <ArrowUpRight className="size-4" />
            </button>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="text-sm font-semibold text-foreground">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <button
                      onClick={() => handleNav(l.href)}
                      className="text-sm text-muted-foreground transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
                    >
                      {l.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © 2025 LifeLens AI. Crafted with care in India.
          </p>

          <div className="flex items-center gap-2">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="grid size-9 place-items-center rounded-full border border-border bg-background/50 text-muted-foreground transition-all hover:border-emerald-500/40 hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                <s.icon className="size-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default LandingFooter
