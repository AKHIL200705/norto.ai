'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Compass, Sparkles, Terminal, Cpu } from 'lucide-react'

const INTRO_DURATION = 3500 // 3.5 seconds
const SKIP_KEY = 'norto-intro-played'

/**
 * Norto branded intro screen.
 * Industrial Skeuomorphism boot sequence style.
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
          className="fixed inset-0 z-[100] overflow-hidden bg-[#e0e5ec] dark:bg-[#1e2227] font-mono"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          {/* Ambient Neumorphic chassis geometry */}
          <div className="absolute inset-4 sm:inset-8 rounded-2xl bg-[#e0e5ec] dark:bg-[#1e2227] neu-floating p-6 flex flex-col justify-between overflow-hidden screw-corners">
            
            {/* Top industrial status bar */}
            <div className="flex items-center justify-between border-b border-[#d1d9e6] dark:border-[#2a3037] pb-4">
              <div className="flex items-center gap-3">
                <span className="size-3 rounded-full bg-[#ff4757] animate-led-pulse neu-glow-orange" />
                <span className="text-xs font-bold text-[#ff4757]">NORTO_BOOT_SEQUENCE_v2.0</span>
              </div>
              <div className="flex items-center gap-4 text-[10px] text-[#4a5568]">
                <span className="hidden sm:inline-flex items-center gap-1"><Cpu className="size-3 text-[#ff4757]" /> CPU_INIT: OK</span>
                <span className="inline-flex items-center gap-1"><Terminal className="size-3 text-[#22c55e]" /> TELEMETRY: 100%</span>
              </div>
            </div>

            {/* Center Terminal & Brand Module */}
            <div className="relative flex flex-col items-center justify-center my-auto">
              {/* Recessed Icon Housing */}
              <motion.div
                className="relative mb-6"
                initial={{ scale: 0, rotate: -90, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="relative size-24 sm:size-28 rounded-2xl bg-[#e0e5ec] dark:bg-[#1e2227] neu-recessed grid place-items-center">
                  <Compass className="size-12 sm:size-14 text-[#ff4757]" />
                  <span className="absolute top-2 right-2 size-3 rounded-full bg-[#22c55e] neu-glow-green" />
                </div>
              </motion.div>

              {/* Wordmark */}
              <div className="flex items-center justify-center overflow-hidden">
                {'Norto'.split('').map((ch, i) => (
                  <motion.span
                    key={i}
                    className={`text-5xl sm:text-7xl font-extrabold tracking-tight font-sans ${
                      i >= 3
                        ? 'text-[#ff4757]'
                        : 'text-[#2d3436] dark:text-[#f0f2f5]'
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
                className="mt-3 text-xs sm:text-sm text-[#4a5568] dark:text-[#a0aec0] text-center font-bold tracking-wider uppercase"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 1.4 }}
              >
                // TACTILE CITY COMPANION & RELOCATION TELEMETRY
              </motion.p>
            </div>

            {/* Bottom Progress Bar */}
            <div className="w-full max-w-md mx-auto space-y-2">
              <div className="h-3 rounded-md bg-[#e0e5ec] dark:bg-[#15181c] neu-recessed p-0.5 overflow-hidden">
                <div
                  className="h-full bg-[#ff4757] rounded-sm transition-[width] duration-100 ease-linear shadow-sm"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#4a5568] font-bold">
                <span>SYSTEM_INITIALIZING…</span>
                <span className="tabular-nums text-[#ff4757]">{Math.round(progress)}%</span>
              </div>
            </div>
          </div>

          {/* Skip button */}
          <motion.button
            onClick={skip}
            className="absolute top-8 right-8 sm:top-12 sm:right-12 text-xs font-bold text-[#ff4757] bg-[#e0e5ec] dark:bg-[#1e2227] neu-card hover:neu-floating active:translate-y-[2px] rounded-lg px-4 py-2 transition-all cursor-pointer border-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 1.6 }}
          >
            SKIP BOOT →
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
