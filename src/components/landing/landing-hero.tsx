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

  const orb1X = useTransform(sx, [-0.5, 0.5], [-20, 20])
  const orb1Y = useTransform(sy, [-0.5, 0.5], [-20, 20])
  const orb2X = useTransform(sx, [-0.5, 0.5], [20, -20])
  const orb2Y = useTransform(sy, [-0.5, 0.5], [15, -15])

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
      className="relative isolate overflow-hidden bg-[#E0E5EC] dark:bg-[#181C24] py-24 sm:py-32 lg:py-36"
    >
      {/* Decorative Neumorphic Tactile Concentric Depth Circles */}
      <motion.div
        aria-hidden
        style={{ x: orb1X, y: orb1Y }}
        className="pointer-events-none absolute -left-20 top-10 size-[32rem] rounded-full bg-[#E0E5EC] dark:bg-[#181C24] neu-inset-deep opacity-60"
      />
      <motion.div
        aria-hidden
        style={{ x: orb2X, y: orb2Y }}
        className="pointer-events-none absolute -right-16 top-32 size-[26rem] rounded-full bg-[#E0E5EC] dark:bg-[#181C24] neu-extruded opacity-70"
      />

      <div className="relative mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex flex-col items-center gap-7"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-[#E0E5EC] dark:bg-[#181C24] neu-inset px-5 py-2 text-xs font-bold text-[#6C63FF]">
            <Sparkles className="size-4 text-[#6C63FF] animate-pulse" />
            <span>AI-Powered City Companion</span>
          </span>

          <h1 className="text-balance text-4xl font-extrabold leading-[1.1] tracking-tight text-[#000000] dark:text-[#FFFFFF] sm:text-6xl lg:text-7xl font-display">
            Your{' '}
            <span className="text-[#6C63FF]">
              AI Companion
            </span>{' '}
            for Every New City
          </h1>

          <p className="max-w-2xl text-pretty text-base text-[#1A1A1A] dark:text-[#E2E8F0] font-medium sm:text-xl leading-relaxed">
            Move, settle, and explore with confidence. Norto gives you
            personalised relocation plans, smart maps, budget tools, food
            recommendations, translations, and 24/7 emergency help — all in one
            tactile place.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-center mt-3">
            <Button
              onClick={launchApp}
              size="lg"
              className="neu-button-primary rounded-2xl h-14 px-10 text-base font-extrabold neu-extruded hover:-translate-y-0.5 active:neu-inset-sm transition-all cursor-pointer border-0 flex items-center gap-3"
            >
              <Sparkles className="size-5" />
              <span>Get Started Now</span>
              <ArrowRight className="size-5" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default LandingHero
