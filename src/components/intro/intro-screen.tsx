'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Compass, Sparkles } from 'lucide-react'

const INTRO_DURATION = 3500 // 3.5 seconds
const SKIP_KEY = 'norto-intro-played'

/**
 * Norto branded intro screen.
 * Styled with Neumorphism Soft UI aesthetics.
 */
export function IntroScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = React.useState(0)
  const [exiting, setExiting] = React.useState(false)
  const completedRef = React.useRef(false)

  const finish = React.useCallback(() => {
    if (completedRef.current) return
    completedRef.current = true
    try {
      sessionStorage.setItem(SKIP_KEY, '1')
    } catch {
      // ignore storage errors
    }
    setExiting(true)
    window.setTimeout(onComplete, 600)
  }, [onComplete])

  React.useEffect(() => {
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const elapsed = now - start
      const pct = Math.min(100, (elapsed / INTRO_DURATION) * 100)
      setProgress(pct)
      if (elapsed < INTRO_DURATION) {
        raf = requestAnimationFrame(tick)
      } else {
        finish()
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [finish])

  const skip = () => finish()

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          key="intro"
          className="fixed inset-0 z-[100] overflow-hidden bg-[#E0E5EC] dark:bg-[#181C24]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          {/* Neumorphic ambient tactile depth circles */}
          <motion.div
            className="absolute -top-24 -left-24 size-96 rounded-full bg-[#E0E5EC] dark:bg-[#181C24] neu-inset-deep opacity-60"
            animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -bottom-32 -right-24 size-[28rem] rounded-full bg-[#E0E5EC] dark:bg-[#181C24] neu-extruded opacity-70"
            animate={{ x: [0, -50, 0], y: [0, -20, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Center content */}
          <div className="relative h-full w-full flex flex-col items-center justify-center px-6">
            {/* Compass badge with Neumorphic inset well */}
            <motion.div
              className="relative mb-8"
              initial={{ scale: 0, rotate: -90, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Badge */}
              <motion.div
                className="relative size-24 sm:size-28 rounded-[32px] bg-[#E0E5EC] dark:bg-[#181C24] neu-inset-deep grid place-items-center"
                animate={{ rotate: [0, 6, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
              >
                <Compass className="size-12 sm:size-14 text-[#6C63FF]" />
                <span className="absolute top-2 right-2 size-3 rounded-full bg-[#38B2AC]" />
              </motion.div>
            </motion.div>

            {/* "Norto" wordmark */}
            <div className="flex items-center justify-center overflow-hidden">
              {'Norto'.split('').map((ch, i) => (
                <motion.span
                  key={i}
                  className={`text-5xl sm:text-7xl font-extrabold tracking-tight font-display ${
                    i >= 3
                      ? 'text-[#6C63FF]'
                      : 'text-[#3D4852] dark:text-[#E2E8F0]'
                  }`}
                  initial={{ y: '110%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    duration: 0.6,
                    delay: 0.8 + i * 0.1,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  style={{ display: 'inline-block' }}
                >
                  {ch}
                </motion.span>
              ))}
            </div>

            {/* Tagline */}
            <motion.p
              className="mt-4 text-sm sm:text-base text-[#6B7280] dark:text-[#94A3B8] text-center max-w-md font-medium tracking-wide"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.4 }}
            >
              Your AI Companion for Every New City
            </motion.p>

            {/* Feature pills */}
            <motion.div
              className="mt-8 flex flex-wrap items-center justify-center gap-2 max-w-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.6 }}
            >
              {['Relocation', 'Maps', 'Budget', 'Translator', 'Weather'].map((f, i) => (
                <motion.span
                  key={f}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#6C63FF] bg-[#E0E5EC] dark:bg-[#181C24] neu-inset px-3.5 py-1.5 rounded-full"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 1.6 + i * 0.1 }}
                >
                  <Sparkles className="size-3 text-[#6C63FF]" />
                  {f}
                </motion.span>
              ))}
            </motion.div>

            {/* Progress bar */}
            <motion.div
              className="absolute bottom-12 left-1/2 -translate-x-1/2 w-56 sm:w-72"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.6 }}
            >
              <div className="h-2 rounded-full bg-[#E0E5EC] dark:bg-[#181C24] neu-inset-sm p-0.5 overflow-hidden">
                <div
                  className="h-full bg-[#6C63FF] rounded-full transition-[width] duration-100 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-2.5 flex items-center justify-between text-[10px] text-[#6B7280] font-semibold">
                <span>Loading your city companion</span>
                <span className="tabular-nums font-mono font-bold">{Math.round(progress)}%</span>
              </div>
            </motion.div>
          </div>

          {/* Skip button */}
          <motion.button
            onClick={skip}
            className="absolute top-6 right-6 text-xs font-bold text-[#3D4852] dark:text-[#E2E8F0] bg-[#E0E5EC] dark:bg-[#181C24] neu-extruded hover:neu-extruded-hover active:neu-inset-sm rounded-2xl px-4 py-2 transition-all cursor-pointer border-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 1.8 }}
          >
            Skip intro →
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function shouldPlayIntro(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return sessionStorage.getItem(SKIP_KEY) !== '1'
  } catch {
    return false
  }
}

export default IntroScreen
