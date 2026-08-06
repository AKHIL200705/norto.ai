'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Compass, Sparkles } from 'lucide-react'

const INTRO_DURATION = 5000 // 5 seconds
const SKIP_KEY = 'norto-intro-played'

/**
 * Norto branded intro screen.
 *
 * Plays a 5-second animated brand sequence on the first load of a browser
 * session (tracked via sessionStorage so it doesn't replay on every reload).
 * After the sequence — or when the user clicks "Skip" — calls `onComplete`.
 *
 * Animation timeline:
 *  0.0s  Dark emerald gradient + mesh fades in, floating orbs begin drifting
 *  0.4s  Compass badge scales + rotates in, pulsing ring expands
 *  1.1s  "Norto" wordmark reveals letter-by-letter (two-tone: Nor white, to emerald)
 *  1.9s  Tagline "Your AI Companion for Every New City" fades up
 *  2.4s  Progress bar begins filling toward 100%
 *  4.3s  Hero scales up + fades out
 *  4.8s  Background fades to reveal the app
 *  5.0s  Complete → onComplete()
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
    // Allow the exit animation to play before unmounting
    window.setTimeout(onComplete, 650)
  }, [onComplete])

  // Drive the 5s timeline
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
          className="fixed inset-0 z-[100] overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          {/* Background — deep emerald gradient + mesh */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
          <div className="absolute inset-0 mesh-bg opacity-40" />

          {/* Floating brand orbs */}
          <motion.div
            className="absolute -top-24 -left-24 size-96 rounded-full bg-emerald-500/25 blur-3xl"
            animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -bottom-32 -right-24 size-[28rem] rounded-full bg-amber-400/20 blur-3xl"
            animate={{ x: [0, -50, 0], y: [0, -20, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-1/3 right-1/4 size-72 rounded-full bg-teal-400/20 blur-3xl"
            animate={{ x: [0, 30, 0], y: [0, -40, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Center content */}
          <div className="relative h-full w-full flex flex-col items-center justify-center px-6">
            {/* Compass badge with pulsing ring */}
            <motion.div
              className="relative mb-8"
              initial={{ scale: 0, rotate: -90, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Expanding pulse rings */}
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="absolute inset-0 rounded-3xl border-2 border-emerald-400/40"
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: [1, 1.8, 1.8], opacity: [0.6, 0, 0] }}
                  transition={{
                    duration: 2.4,
                    repeat: Infinity,
                    delay: 0.8 + i * 0.8,
                    ease: 'easeOut',
                  }}
                />
              ))}
              {/* Glow */}
              <div className="absolute inset-0 rounded-3xl bg-emerald-500/40 blur-2xl scale-110" />
              {/* Badge */}
              <motion.div
                className="relative size-20 sm:size-24 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 grid place-items-center shadow-2xl shadow-emerald-500/40"
                animate={{ rotate: [0, 8, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              >
                <Compass className="size-10 sm:size-12 text-white" />
                <span className="absolute -top-1 -right-1 size-3.5 rounded-full bg-amber-400 ring-2 ring-emerald-950" />
              </motion.div>
            </motion.div>

            {/* "Norto" wordmark — letter reveal, two-tone */}
            <div className="flex items-center justify-center overflow-hidden">
              {'Norto'.split('').map((ch, i) => (
                <motion.span
                  key={i}
                  className={`text-5xl sm:text-7xl font-bold tracking-tight ${
                    i >= 3
                      ? 'text-emerald-400'
                      : 'text-white'
                  }`}
                  initial={{ y: '110%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    duration: 0.6,
                    delay: 1.1 + i * 0.1,
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
              className="mt-4 text-sm sm:text-base text-emerald-100/80 text-center max-w-md"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.9 }}
            >
              Your AI Companion for Every New City
            </motion.p>

            {/* Feature pills */}
            <motion.div
              className="mt-8 flex flex-wrap items-center justify-center gap-2 max-w-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 2.4 }}
            >
              {['Relocation', 'Maps', 'Budget', 'Translator', 'Weather'].map((f, i) => (
                <motion.span
                  key={f}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-100/90 bg-white/10 border border-white/15 rounded-full px-2.5 py-1 backdrop-blur-sm"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 2.4 + i * 0.12 }}
                >
                  <Sparkles className="size-2.5 text-amber-300" />
                  {f}
                </motion.span>
              ))}
            </motion.div>

            {/* Progress bar */}
            <motion.div
              className="absolute bottom-10 left-1/2 -translate-x-1/2 w-56 sm:w-72"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 2.2 }}
            >
              <div className="h-1 rounded-full bg-white/15 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-amber-300 transition-[width] duration-100 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] text-emerald-100/60">
                <span>Loading your city companion</span>
                <span className="tabular-nums">{Math.round(progress)}%</span>
              </div>
            </motion.div>
          </div>

          {/* Skip button */}
          <motion.button
            onClick={skip}
            className="absolute top-5 right-5 text-xs font-medium text-emerald-100/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-3 py-1.5 backdrop-blur-sm transition-colors"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 2.8 }}
          >
            Skip intro →
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Returns true if the intro has already played in this browser session.
 * Use this to decide whether to render <IntroScreen/>.
 */
export function shouldPlayIntro(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return sessionStorage.getItem(SKIP_KEY) !== '1'
  } catch {
    return false
  }
}

export default IntroScreen
