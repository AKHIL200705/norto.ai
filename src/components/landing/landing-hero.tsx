'use client'

import * as React from 'react'
import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import {
  Sparkles,
  Play,
  Star,
  MapPin,
  Utensils,
  Bus,
  Home,
  ArrowRight,
  Bot,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLaunchApp } from '@/lib/store'

const AI_BULLETS = [
  { icon: Home, text: 'PGs in Madhapur & Gachibowli — ₹6,000–₹8,000/mo' },
  { icon: Utensils, text: 'Tiffin budgets ~₹3,500/mo; try local mess for ₹50/plate' },
  { icon: Bus, text: 'Metro from Hitech City to anywhere — ₹10–₹60/trip' },
]

const TYPING_TEXT =
  "Got it! For ₹15,000/mo in Hyderabad, here's a smart plan 👇"

export function LandingHero() {
  const launchApp = useLaunchApp()
  const heroRef = useRef<HTMLElement>(null)

  // Mouse parallax
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 60, damping: 20 })
  const sy = useSpring(my, { stiffness: 60, damping: 20 })

  const orb1X = useTransform(sx, [-0.5, 0.5], [-30, 30])
  const orb1Y = useTransform(sy, [-0.5, 0.5], [-30, 30])
  const orb2X = useTransform(sx, [-0.5, 0.5], [25, -25])
  const orb2Y = useTransform(sy, [-0.5, 0.5], [20, -20])
  const orb3X = useTransform(sx, [-0.5, 0.5], [-15, 15])
  const orb3Y = useTransform(sy, [-0.5, 0.5], [15, -15])

  const onMouseMove = (e: React.MouseEvent) => {
    const rect = heroRef.current?.getBoundingClientRect()
    if (!rect) return
    mx.set((e.clientX - rect.left) / rect.width - 0.5)
    my.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  // Typing animation for AI message
  const [typed, setTyped] = useState('')
  const [showBullets, setShowBullets] = useState(false)

  useEffect(() => {
    let i = 0
    let timer: ReturnType<typeof setTimeout>
    const start = setTimeout(function tick() {
      if (i <= TYPING_TEXT.length) {
        setTyped(TYPING_TEXT.slice(0, i))
        i += 1
        timer = setTimeout(tick, 28)
      } else {
        setTimeout(() => setShowBullets(true), 400)
      }
    }, 600)
    return () => {
      clearTimeout(start)
      clearTimeout(timer)
    }
  }, [])

  const scrollToDemo = () => {
    document
      .querySelector('#ai-preview')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section
      ref={heroRef}
      onMouseMove={onMouseMove}
      className="mesh-bg relative isolate overflow-hidden pb-20 pt-16 sm:pt-20 lg:pt-24"
    >
      {/* Floating blurred orbs */}
      <motion.div
        aria-hidden
        style={{ x: orb1X, y: orb1Y }}
        className="animate-float pointer-events-none absolute -left-20 top-10 size-72 rounded-full bg-emerald-400/30 blur-3xl dark:bg-emerald-500/20"
      />
      <motion.div
        aria-hidden
        style={{ x: orb2X, y: orb2Y }}
        className="animate-float pointer-events-none absolute -right-16 top-32 size-80 rounded-full bg-amber-400/30 blur-3xl dark:bg-amber-500/20"
      />
      <motion.div
        aria-hidden
        style={{ x: orb3X, y: orb3Y }}
        className="animate-float pointer-events-none absolute bottom-0 left-1/3 size-72 rounded-full bg-rose-400/25 blur-3xl dark:bg-rose-500/15"
      />

      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8">
        {/* Left column */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex flex-col items-start gap-6"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-300">
            <Sparkles className="size-4" />
            AI-Powered City Companion
          </span>

          <h1 className="text-balance text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            Your{' '}
            <span className="animate-gradient bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500 bg-clip-text text-transparent">
              AI Companion
            </span>{' '}
            for Every New City
          </h1>

          <p className="max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
            Move, settle, and explore with confidence. Norto gives you
            personalised relocation plans, smart maps, budget tools, food
            recommendations, translations, and 24/7 emergency help — all in one
            place.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              onClick={launchApp}
              size="lg"
              className="rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-7 text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-700 hover:to-teal-700"
            >
              <Sparkles className="size-4" />
              Get Started
              <ArrowRight className="size-4" />
            </Button>
            <Button
              onClick={scrollToDemo}
              size="lg"
              variant="outline"
              className="rounded-full border-emerald-500/30 bg-background/60 px-7 backdrop-blur hover:bg-accent"
            >
              <Play className="size-4" />
              Watch Demo
            </Button>
          </div>

          {/* Trust row */}
          <div className="mt-2 flex flex-wrap items-center gap-4">
            <div className="flex -space-x-2.5">
              {[
                'from-emerald-500 to-teal-500',
                'from-amber-400 to-orange-500',
                'from-rose-400 to-pink-500',
                'from-teal-500 to-cyan-500',
                'from-violet-500 to-purple-500',
              ].map((g, i) => (
                <span
                  key={i}
                  className={`grid size-9 place-items-center rounded-full bg-gradient-to-br ${g} text-xs font-semibold text-white ring-2 ring-background`}
                  aria-hidden
                >
                  {['P', 'A', 'S', 'R', 'K'][i]}
                </span>
              ))}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1" aria-label="Rated 4.9 out of 5 by 2,000+ users">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                ))}
                <span className="ml-1.5 text-sm font-semibold text-foreground">4.9</span>
              </div>
              <span className="text-xs text-muted-foreground">
                Loved by 2,000+ relocators across India
              </span>
            </div>
          </div>
        </motion.div>

        {/* Right column — AI chat preview card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
          className="relative"
        >
          <div className="glass relative rounded-3xl p-5 shadow-2xl shadow-emerald-900/10 sm:p-6">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md">
                  <Bot className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">Norto</p>
                  <p className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online · Ready to help
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                Live preview
              </span>
            </div>

            {/* User bubble */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="mb-4 flex justify-end"
            >
              <div className="max-w-[80%] rounded-2xl rounded-br-md bg-gradient-to-br from-emerald-600 to-teal-600 px-4 py-2.5 text-sm text-white shadow-md">
                I&apos;m moving to Hyderabad with a ₹15,000 monthly budget. Help?
              </div>
            </motion.div>

            {/* AI bubble with typing */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="flex gap-2.5"
            >
              <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                <Bot className="size-4" />
              </span>
              <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-muted/60 px-4 py-3 text-sm text-foreground">
                <span>{typed}</span>
                {typed.length < TYPING_TEXT.length && (
                  <span className="ml-0.5 inline-block size-3 animate-pulse rounded-sm bg-emerald-500 align-middle" />
                )}
                <AnimatePresence>
                  {showBullets && (
                    <motion.ul
                      initial="hidden"
                      animate="visible"
                      variants={{
                        hidden: {},
                        visible: { transition: { staggerChildren: 0.18, delayChildren: 0.1 } },
                      }}
                      className="mt-3 space-y-2"
                    >
                      {AI_BULLETS.map((b, i) => (
                        <motion.li
                          key={i}
                          variants={{
                            hidden: { opacity: 0, y: 8 },
                            visible: { opacity: 1, y: 0 },
                          }}
                          className="flex items-start gap-2 text-sm"
                        >
                          <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                            <b.icon className="size-3.5" />
                          </span>
                          <span className="text-foreground/90">{b.text}</span>
                        </motion.li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Suggested chips */}
            <div className="mt-4 flex flex-wrap gap-2">
              {['Budget split', 'Find a PG', 'Translate to Telugu'].map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-emerald-500/30 bg-emerald-500/5 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* Floating badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2, duration: 0.4 }}
            className="absolute -bottom-4 -left-3 hidden items-center gap-2 rounded-2xl bg-background px-3.5 py-2.5 shadow-lg ring-1 ring-emerald-500/20 sm:flex"
          >
            <span className="grid size-8 place-items-center rounded-lg bg-amber-400/20 text-amber-600 dark:text-amber-400">
              <MapPin className="size-4" />
            </span>
            <div>
              <p className="text-xs font-semibold text-foreground">12 cities live</p>
              <p className="text-[10px] text-muted-foreground">+5 launching soon</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default LandingHero
