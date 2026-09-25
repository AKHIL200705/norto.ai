'use client'

import * as React from 'react'
import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Sparkles, ArrowRight, Activity, Terminal, Shield, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLaunchApp } from '@/lib/store'

export function LandingHero() {
  const launchApp = useLaunchApp()
  const heroRef = useRef<HTMLElement>(null)

  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 60, damping: 20 })
  const sy = useSpring(my, { stiffness: 60, damping: 20 })

  const deviceRotateX = useTransform(sy, [-0.5, 0.5], [6, -6])
  const deviceRotateY = useTransform(sx, [-0.5, 0.5], [-8, 8])

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
      className="relative isolate overflow-hidden bg-[#e0e5ec] dark:bg-[#1e2227] py-20 sm:py-28 lg:py-32"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Text Column */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="lg:col-span-7 flex flex-col items-start text-left gap-6"
          >
            {/* Status LED Badge */}
            <div className="inline-flex items-center gap-2.5 rounded-lg bg-[#e0e5ec] dark:bg-[#1e2227] neu-card px-4 py-2 text-xs font-mono font-bold text-[#2d3436] dark:text-[#f0f2f5]">
              <span className="size-2.5 rounded-full bg-[#ff4757] animate-led-pulse neu-glow-orange" />
              <span className="text-[#ff4757] uppercase">Norto OS 2.0</span>
              <span className="text-[#4a5568]">// AI_CITY_OPERATING_SYSTEM</span>
            </div>

            <h1 className="text-balance text-4xl font-extrabold leading-[1.1] tracking-tight text-[#2d3436] dark:text-[#f0f2f5] sm:text-6xl lg:text-7xl font-sans drop-shadow-[0_1px_0_#ffffff]">
              Tactile Intelligence for Every <span className="text-[#ff4757]">New City</span>
            </h1>

            <p className="max-w-2xl text-pretty text-base text-[#4a5568] dark:text-[#a0aec0] font-medium sm:text-lg leading-relaxed">
              Move, settle, and explore with industrial reliability. Norto combines personalized relocation telemetry, smart maps, budget calculators, and 24/7 emergency response into a physical, high-contrast interface.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center mt-2 w-full sm:w-auto font-mono">
              <Button
                onClick={launchApp}
                size="lg"
                className="neu-button-primary rounded-lg h-14 px-8 text-sm font-bold flex items-center justify-center gap-3 w-full sm:w-auto cursor-pointer"
              >
                <Zap className="size-4" />
                <span>INITIALIZE_NORTO</span>
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </motion.div>

          {/* Right Signature 3D Industrial Device Mockup */}
          <motion.div
            style={{ rotateX: deviceRotateX, rotateY: deviceRotateY }}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5 relative perspective-1000"
          >
            {/* Outer Chassis */}
            <div className="relative rounded-2xl bg-[#2d3436] p-4 sm:p-5 neu-floating border-4 border-[#1e2227] screw-corners">
              
              {/* Top hardware bezel controls */}
              <div className="flex items-center justify-between pb-3 px-1 border-b border-[#4a5568]/30 font-mono text-[10px] text-[#a0aec0]">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-[#22c55e] animate-led-pulse neu-glow-green" />
                  <span className="text-[#22c55e] font-bold">PWR_ON</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[#ff4757] font-bold">GPS_ACTIVE</span>
                  <div className="flex gap-1">
                    <div className="h-4 w-1 rounded-full bg-[#d1d9e6]/40" />
                    <div className="h-4 w-1 rounded-full bg-[#d1d9e6]/40" />
                    <div className="h-4 w-1 rounded-full bg-[#d1d9e6]/40" />
                  </div>
                </div>
              </div>

              {/* Inner CRT Display Screen */}
              <div className="relative mt-3 rounded-lg bg-[#15181c] p-4 text-[#f0f2f5] crt-scanlines overflow-hidden neu-recessed min-h-[280px] font-mono flex flex-col justify-between">
                
                {/* Screen Header */}
                <div className="flex items-center justify-between text-xs pb-3 border-b border-[#2a3037]">
                  <div className="flex items-center gap-2">
                    <Terminal className="size-4 text-[#ff4757]" />
                    <span className="font-bold text-[#ff4757]">NORTO_CORE_TERMINAL</span>
                  </div>
                  <span className="text-[10px] text-[#a0aec0]">SYS_LATENCY: 12ms</span>
                </div>

                {/* Simulated Screen Content */}
                <div className="py-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between bg-[#1e2227] p-2.5 rounded border border-[#2a3037]">
                    <span className="text-[#a0aec0]">TARGET_CITY:</span>
                    <span className="font-bold text-[#22c55e]">Hyderabad, IN</span>
                  </div>
                  <div className="flex items-center justify-between bg-[#1e2227] p-2.5 rounded border border-[#2a3037]">
                    <span className="text-[#a0aec0]">MONTHLY_BUDGET:</span>
                    <span className="font-bold text-[#ff4757]">₹25,000 / mo</span>
                  </div>
                  <div className="flex items-center justify-between bg-[#1e2227] p-2.5 rounded border border-[#2a3037]">
                    <span className="text-[#a0aec0]">PG_RECOM_STATUS:</span>
                    <span className="font-bold text-white">3 Verified PGs Found</span>
                  </div>
                </div>

                {/* Screen Footer Status */}
                <div className="pt-2 border-t border-[#2a3037] flex items-center justify-between text-[10px] text-[#a0aec0]">
                  <span className="flex items-center gap-1"><Activity className="size-3 text-[#22c55e]" /> TELEMETRY_STREAMING</span>
                  <span className="font-bold text-[#ff4757]">READY</span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}

export default LandingHero
