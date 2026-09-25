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

interface Feature {
  icon: LucideIcon
  title: string
  desc: string
  gradient: string
  iconColor: string
  span?: string
}

const FEATURES: Feature[] = [
  {
    icon: Bot,
    title: 'AI Assistant',
    desc: 'Ask anything about your city — visas, transport, local quirks. Get instant, contextual answers.',
    gradient: 'from-[#DD0200] via-[#8B0000] to-[#55100D]',
    iconColor: 'text-white',
    span: 'sm:col-span-2',
  },
  {
    icon: Map,
    title: 'Smart Map',
    desc: 'Discover PGs, mess, hospitals, ATMs and more nearby — filtered by your needs.',
    gradient: 'from-[#DD0200] to-rose-600',
    iconColor: 'text-white',
  },
  {
    icon: Wallet,
    title: 'Budget Planner',
    desc: 'Track rent, food, transport and get AI insights on where to save every month.',
    gradient: 'from-[#8B0000] to-[#55100D]',
    iconColor: 'text-white',
  },
  {
    icon: Utensils,
    title: 'Food Recommendations',
    desc: 'Veg, non-veg, Jain, vegan — curated local eats that fit your taste and wallet.',
    gradient: 'from-[#DD0200] to-rose-500',
    iconColor: 'text-white',
  },
  {
    icon: Languages,
    title: 'Translator (10 languages)',
    desc: 'Hindi, Telugu, Tamil, Kannada and more — speak like a local from day one.',
    gradient: 'from-[#8B0000] to-[#DD0200]',
    iconColor: 'text-white',
  },
  {
    icon: ScanText,
    title: 'OCR Scanner',
    desc: 'Snap a sign, menu, or document — get instant English translation on the spot.',
    gradient: 'from-[#8B0000] to-[#55100D]',
    iconColor: 'text-white',
  },
  {
    icon: Bookmark,
    title: 'Saved Places',
    desc: 'Bookmark the spots you love — build your personal city guide over time.',
    gradient: 'from-[#DD0200] to-[#8B0000]',
    iconColor: 'text-white',
  },
]

export function LandingFeatures() {
  return (
    <section id="features" className="relative py-24 sm:py-32 bg-[#E0E5EC] dark:bg-[#181C24]">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-[#E0E5EC] dark:bg-[#181C24] neu-inset px-5 py-2 text-xs font-bold text-[#6C63FF]">
            Features
          </span>
          <h2 className="mt-5 text-balance text-3xl font-extrabold tracking-tight text-[#000000] dark:text-[#FFFFFF] sm:text-4xl lg:text-5xl font-display">
            Everything you need to{' '}
            <span className="text-[#6C63FF]">
              settle in
            </span>
          </h2>
          <p className="mt-4 text-pretty text-base text-[#1A1A1A] dark:text-[#E2E8F0] font-medium sm:text-lg">
            Seven powerful tools, one intelligent companion. Built for relocators,
            students, and digital nomads across India.
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
              className={`group relative flex flex-col gap-5 overflow-hidden rounded-[32px] bg-[#E0E5EC] dark:bg-[#181C24] neu-extruded p-8 transition-all duration-300 hover:-translate-y-1 hover:neu-extruded-hover border-0 ${f.span ?? ''}`}
            >
              <span
                className="grid size-14 place-items-center rounded-2xl bg-[#E0E5EC] dark:bg-[#181C24] neu-inset-deep text-[#6C63FF] transition-all duration-300 group-hover:scale-105"
              >
                <f.icon className="size-6 text-[#6C63FF]" />
              </span>
              <div>
                <h3 className="text-xl font-bold text-[#000000] dark:text-[#FFFFFF] font-display">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#222222] dark:text-[#E2E8F0] font-medium">
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
