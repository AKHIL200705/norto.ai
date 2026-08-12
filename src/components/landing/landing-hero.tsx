'use client'

import * as React from 'react'
import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import {
  Sparkles,
  Star,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLaunchApp } from '@/lib/store'

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

  const onMouseMove = (e: React.MouseEvent) => {
    const rect = heroRef.current?.getBoundingClientRect()
    if (!rect) return
    mx.set((e.clientX - rect.left) / rect.width - 0.5)
    my.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  return (
    <section
      ref={heroRef}
      onMouseMove={onMouseMove}
      className="mesh-bg relative isolate overflow-hidden pb-16 pt-16 sm:pt-24 lg:pt-28"
    >
      {/* Floating blurred orbs */}
      <motion.div
        aria-hidden
        style={{ x: orb1X, y: orb1Y }}
        className="animate-float pointer-events-none absolute -left-20 top-10 size-96 rounded-full bg-[#DD0200]/25 blur-3xl"
      />
      <motion.div
        aria-hidden
        style={{ x: orb2X, y: orb2Y }}
        className="animate-float pointer-events-none absolute -right-16 top-32 size-[28rem] rounded-full bg-[#8B0000]/30 blur-3xl"
      />

      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex flex-col items-center gap-6"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[#DD0200]/30 bg-[#DD0200]/10 px-4 py-1.5 text-sm font-bold text-[#DD0200]">
            <Sparkles className="size-4" />
            AI-Powered City Companion
          </span>

          <h1 className="text-balance text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
            Your{' '}
            <span className="animate-gradient bg-gradient-to-r from-[#DD0200] via-[#8B0000] to-rose-500 bg-clip-text text-transparent drop-shadow-sm">
              AI Companion
            </span>{' '}
            for Every New City
          </h1>

          <p className="max-w-2xl text-pretty text-base text-muted-foreground font-medium sm:text-xl">
            Move, settle, and explore with confidence. Norto gives you
            personalised relocation plans, smart maps, budget tools, food
            recommendations, translations, and 24/7 emergency help — all in one
            place.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-center mt-2">
            <Button
              onClick={launchApp}
              size="lg"
              className="rounded-full bg-gradient-to-r from-[#DD0200] via-[#8B0000] to-[#55100D] px-9 py-6 text-base text-white font-extrabold shadow-xl shadow-[#DD0200]/30 hover:scale-[1.03] transition-all cursor-pointer"
            >
              <Sparkles className="size-5" />
              Get Started Now
              <ArrowRight className="size-5" />
            </Button>
          </div>


        </motion.div>
      </div>
    </section>
  )
}

export default LandingHero
