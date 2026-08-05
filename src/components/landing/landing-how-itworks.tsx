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
      className="relative bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent py-20 sm:py-28"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-14 max-w-2xl text-center sm:mb-20"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-sm font-medium text-amber-700 dark:text-amber-300">
            How it works
          </span>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            From overwhelmed to{' '}
            <span className="bg-gradient-to-r from-amber-500 to-emerald-600 bg-clip-text text-transparent">
              settled in 3 steps
            </span>
          </h2>
          <p className="mt-4 text-pretty text-base text-muted-foreground sm:text-lg">
            No spreadsheets, no scattered tabs. Just one assistant that gets you
            from arrival to feeling at home.
          </p>
        </motion.div>

        <div className="relative">
          {/* Desktop horizontal connector */}
          <div
            aria-hidden
            className="absolute left-0 right-0 top-10 hidden h-0.5 bg-gradient-to-r from-emerald-500/10 via-emerald-500/40 to-amber-500/10 lg:block"
          />

          <div className="grid grid-cols-1 gap-10 sm:gap-12 lg:grid-cols-3 lg:gap-8">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="relative flex flex-col items-center text-center lg:items-start lg:text-left"
              >
                {/* Numbered circle */}
                <div className="relative z-10 mb-6 flex flex-col items-center lg:items-start">
                  <span className="relative grid size-20 place-items-center">
                    <span className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 opacity-20 blur-md" />
                    <span className="relative grid size-16 place-items-center rounded-full bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30 ring-4 ring-background">
                      <s.icon className="size-7" />
                    </span>
                    <span className="absolute -right-1 -top-1 grid size-7 place-items-center rounded-full bg-amber-400 text-[11px] font-bold text-amber-950 shadow ring-2 ring-background">
                      {s.step}
                    </span>
                  </span>
                </div>

                {/* Mobile vertical connector */}
                {i < STEPS.length - 1 && (
                  <div
                    aria-hidden
                    className="absolute left-1/2 top-16 h-full w-0.5 -translate-x-1/2 bg-gradient-to-b from-emerald-500/40 to-transparent lg:hidden"
                  />
                )}

                <h3 className="text-xl font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
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
