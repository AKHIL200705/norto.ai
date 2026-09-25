'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Wand2, Compass } from 'lucide-react'

const STEPS = [
  {
    icon: MessageSquare,
    step: '01',
    title: 'Tell us your city & budget',
    desc: 'Share where you\'re moving and your monthly budget. Add preferences like food, language, and transport in seconds.',
  },
  {
    icon: Wand2,
    step: '02',
    title: 'AI builds your relocation plan',
    desc: 'Norto crafts a personalised plan — best areas to live, estimated expenses, local tips, and a 7-day checklist.',
  },
  {
    icon: Compass,
    step: '03',
    title: 'Explore maps, food, weather & emergencies',
    desc: 'Navigate your new city with smart maps, food picks, real-time weather, and one-tap emergency help — anytime.',
  },
]

export function LandingHowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative bg-[#E0E5EC] dark:bg-[#181C24] py-24 sm:py-32"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-[#E0E5EC] dark:bg-[#181C24] neu-inset px-5 py-2 text-xs font-bold text-[#6C63FF]">
            How it works
          </span>
          <h2 className="mt-5 text-balance text-3xl font-extrabold tracking-tight text-[#000000] dark:text-[#FFFFFF] sm:text-4xl lg:text-5xl font-display">
            From overwhelmed to{' '}
            <span className="text-[#6C63FF]">
              settled in 3 steps
            </span>
          </h2>
          <p className="mt-4 text-pretty text-base text-[#1A1A1A] dark:text-[#E2E8F0] font-medium sm:text-lg">
            No spreadsheets, no scattered tabs. Just one assistant that gets you
            from arrival to feeling at home.
          </p>
        </motion.div>

        <div className="relative">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="relative flex flex-col items-start text-left rounded-[32px] bg-[#E0E5EC] dark:bg-[#181C24] neu-extruded p-8 transition-all duration-300 hover:-translate-y-1 hover:neu-extruded-hover"
              >
                {/* Numbered circle */}
                <div className="relative z-10 mb-6 flex items-center gap-4">
                  <span className="relative grid size-16 place-items-center rounded-2xl bg-[#E0E5EC] dark:bg-[#181C24] neu-inset-deep text-[#6C63FF]">
                    <s.icon className="size-7 text-[#6C63FF]" />
                    <span className="absolute -right-2 -top-2 grid size-8 place-items-center rounded-xl bg-[#6C63FF] text-xs font-extrabold text-white neu-extruded">
                      {s.step}
                    </span>
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[#000000] dark:text-[#FFFFFF] font-display">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#222222] dark:text-[#E2E8F0] font-medium">
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
