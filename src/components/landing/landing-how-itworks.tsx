'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Wand2, Compass } from 'lucide-react'

const STEPS = [
  {
    icon: MessageSquare,
    step: 'STEP_01',
    title: 'Input Specs & Budget',
    desc: 'Share where you\'re moving and your monthly budget. Add preferences like food, language, and transport in seconds.',
  },
  {
    icon: Wand2,
    step: 'STEP_02',
    title: 'AI Synthesizes Plan',
    desc: 'Norto crafts a personalised plan — best areas to live, estimated expenses, local tips, and a 7-day checklist.',
  },
  {
    icon: Compass,
    step: 'STEP_03',
    title: 'Deploy & Explore',
    desc: 'Navigate your new city with smart maps, food picks, real-time weather, and one-tap emergency help — anytime.',
  },
]

export function LandingHowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative bg-[#e0e5ec] dark:bg-[#1e2227] py-24 sm:py-32"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-md bg-[#e0e5ec] dark:bg-[#1e2227] neu-recessed px-4 py-1.5 text-xs font-mono font-bold text-[#ff4757]">
            // WORKFLOW_PIPELINE
          </span>
          <h2 className="mt-5 text-balance text-3xl font-extrabold tracking-tight text-[#2d3436] dark:text-[#f0f2f5] sm:text-4xl lg:text-5xl font-sans drop-shadow-[0_1px_0_#ffffff]">
            From Arrival to Settled in <span className="text-[#ff4757]">3 Steps</span>
          </h2>
          <p className="mt-4 text-pretty text-base text-[#4a5568] dark:text-[#a0aec0] font-medium sm:text-lg">
            No spreadsheets, no scattered tabs. Just one tactile system that guides your move.
          </p>
        </motion.div>

        <div className="relative">
          {/* Physical Connector Cylindrical Pipe (Desktop Signature Element) */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 -translate-y-1/2 h-3 rounded-full bg-[#d1d9e6] dark:bg-[#15181c] neu-recessed z-0" />

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 relative z-10">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="relative flex flex-col items-start text-left rounded-2xl bg-[#e0e5ec] dark:bg-[#1e2227] neu-card p-8 transition-all duration-300 hover:-translate-y-1 hover:neu-floating screw-corners"
              >
                {/* Numbered Housing */}
                <div className="relative z-10 mb-6 flex items-center gap-4">
                  <span className="relative grid size-16 place-items-center rounded-xl bg-[#e0e5ec] dark:bg-[#1e2227] neu-recessed text-[#ff4757]">
                    <s.icon className="size-7 text-[#ff4757]" />
                    <span className="absolute -right-2 -top-2 px-2 py-0.5 rounded bg-[#ff4757] text-[10px] font-mono font-bold text-white neu-sharp">
                      {s.step}
                    </span>
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#2d3436] dark:text-[#f0f2f5] font-sans">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#4a5568] dark:text-[#a0aec0] font-medium">
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default LandingHowItWorks
