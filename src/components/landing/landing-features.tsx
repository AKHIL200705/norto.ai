'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  Bot,
  Map,
  Wallet,
  Utensils,
  Languages,
  Siren,
  CloudSun,
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
    icon: Siren,
    title: 'Emergency SOS',
    desc: 'One tap to nearby police, hospitals, and pharmacies — with saved contacts.',
    gradient: 'from-[#DD0200] via-[#8B0000] to-[#55100D]',
    iconColor: 'text-white',
  },
  {
    icon: CloudSun,
    title: 'Weather Forecast',
    desc: '7-day forecasts, clothing tips, and travel advisories for your city.',
    gradient: 'from-[#DD0200] to-rose-600',
    iconColor: 'text-white',
  },
  {
    icon: ScanText,
    title: 'OCR Scanner',
    desc: 'Snap a sign, menu, or document — get instant English translation on the spot.',
    gradient: 'from-[#8B0000] to-[#55100D]',
    iconColor: 'text-white',
    span: 'sm:col-span-2',
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
    <section id="features" className="relative py-20 sm:py-28">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-12 max-w-2xl text-center sm:mb-16"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[#DD0200]/30 bg-[#DD0200]/10 px-4 py-1.5 text-sm font-bold text-[#DD0200]">
            Features
          </span>
          <h2 className="mt-4 text-balance text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Everything you need to{' '}
            <span className="bg-gradient-to-r from-[#DD0200] via-[#8B0000] to-rose-500 bg-clip-text text-transparent">
              settle in
            </span>
          </h2>
          <p className="mt-4 text-pretty text-base text-muted-foreground font-medium sm:text-lg">
            Nine powerful tools, one intelligent companion. Built for relocators,
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
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {FEATURES.map((f) => (
            <motion.article
              key={f.title}
              variants={{
                hidden: { opacity: 0, y: 24 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className={`group glass relative flex flex-col gap-4 overflow-hidden rounded-2xl p-6 border border-[#D9D9D9] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-[#DD0200]/10 hover:border-[#DD0200]/40 ${f.span ?? ''}`}
            >
              <span
                aria-hidden
                className={`pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-gradient-to-br ${f.gradient} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-20`}
              />
              <span
                className={`grid size-12 place-items-center rounded-xl bg-gradient-to-br ${f.gradient} shadow-md ${f.iconColor} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
              >
                <f.icon className="size-6" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-foreground">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground font-medium">
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
