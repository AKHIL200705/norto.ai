'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  Bot,
  Map,
  Wallet,
  Utensils,
  Languages,
  ScanText,
  Bookmark,
  type LucideIcon,
} from 'lucide-react'
import { VentSlots } from '@/components/ui/card'

interface Feature {
  icon: LucideIcon
  title: string
  desc: string
  code: string
  span?: string
}

const FEATURES: Feature[] = [
  {
    icon: Bot,
    title: 'AI Assistant Module',
    code: 'MOD_01',
    desc: 'Ask anything about your city — visas, transport, local quirks. Get instant, contextual answers.',
    span: 'sm:col-span-2',
  },
  {
    icon: Map,
    title: 'Smart Map Telemetry',
    code: 'MOD_02',
    desc: 'Discover PGs, mess, hospitals, ATMs and more nearby — filtered by your custom specs.',
  },
  {
    icon: Wallet,
    title: 'Budget Calculator',
    code: 'MOD_03',
    desc: 'Track rent, food, transport and get AI insights on where to save every month.',
  },
  {
    icon: Utensils,
    title: 'Food Recommendation Engine',
    code: 'MOD_04',
    desc: 'Veg, non-veg, Jain, vegan — curated local eats that fit your taste and wallet.',
  },
  {
    icon: Languages,
    title: 'Multi-Lingual Translator',
    code: 'MOD_05',
    desc: 'Hindi, Telugu, Tamil, Kannada and more — speak like a local from day one.',
  },
  {
    icon: ScanText,
    title: 'OCR Scanner Protocol',
    code: 'MOD_06',
    desc: 'Snap a sign, menu, or document — get instant English translation on the spot.',
  },
  {
    icon: Bookmark,
    title: 'Saved Places Vault',
    code: 'MOD_07',
    desc: 'Bookmark the spots you love — build your personal city guide over time.',
  },
]

export function LandingFeatures() {
  return (
    <section id="features" className="relative py-24 sm:py-32 bg-[#e0e5ec] dark:bg-[#1e2227]">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-md bg-[#e0e5ec] dark:bg-[#1e2227] neu-recessed px-4 py-1.5 text-xs font-mono font-bold text-[#ff4757]">
            // SYSTEM_FEATURES
          </span>
          <h2 className="mt-5 text-balance text-3xl font-extrabold tracking-tight text-[#2d3436] dark:text-[#f0f2f5] sm:text-4xl lg:text-5xl font-sans drop-shadow-[0_1px_0_#ffffff]">
            Seven Modules Built for <span className="text-[#ff4757]">Relocation Precision</span>
          </h2>
          <p className="mt-4 text-pretty text-base text-[#4a5568] dark:text-[#a0aec0] font-medium sm:text-lg">
            Engineered for relocators, students, and digital nomads across India.
          </p>
        </motion.div>

        <motion.div
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.07 } },
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {FEATURES.map((f) => (
            <motion.article
              key={f.title}
              variants={{
                hidden: { opacity: 0, y: 24 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className={`group relative flex flex-col gap-5 overflow-hidden rounded-2xl bg-[#e0e5ec] dark:bg-[#1e2227] neu-card p-8 transition-all duration-300 hover:-translate-y-1 hover:neu-floating border-0 screw-corners ${f.span ?? ''}`}
            >
              {/* Header with Vent Slots and Module Code */}
              <div className="flex items-center justify-between">
                <span
                  className="grid size-14 place-items-center rounded-xl bg-[#e0e5ec] dark:bg-[#1e2227] neu-recessed text-[#ff4757] transition-all duration-300 group-hover:scale-110"
                >
                  <f.icon className="size-6 text-[#ff4757]" />
                </span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] font-bold text-[#ff4757] bg-[#ff4757]/10 px-2 py-1 rounded">
                    {f.code}
                  </span>
                  <VentSlots />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#2d3436] dark:text-[#f0f2f5] font-sans">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#4a5568] dark:text-[#a0aec0] font-medium">
                  {f.desc}
                </p>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default LandingFeatures
