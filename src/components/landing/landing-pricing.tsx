'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Check, Sparkles, ArrowRight, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLaunchApp } from '@/lib/store'
import { cn } from '@/lib/utils'

interface Tier {
  name: string
  price: string
  period?: string
  tagline: string
  features: string[]
  cta: string
  popular?: boolean
  gradient: string
}

const TIERS: Tier[] = [
  {
    name: 'Explorer',
    price: '₹0',
    tagline: 'For first-time visitors getting a feel for a city.',
    features: [
      'AI Assistant — 20 messages / month',
      'Smart Map — 3 categories',
      'Weather forecast — 3 days',
      'Translator — 3 languages',
      'Saved places — up to 10',
    ],
    cta: 'Start for free',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    name: 'Settler',
    price: '₹299',
    period: '/mo',
    tagline: 'For relocators who need the full toolkit to settle in.',
    features: [
      'Unlimited AI Assistant messages',
      'All map categories + filters',
      '7-day weather forecast & tips',
      'All 10 languages + phrasebook',
      'Budget planner with AI insights',
      'OCR scanner — 50 scans / month',
      'Emergency SOS with contacts',
      'Unlimited saved places',
    ],
    cta: 'Get Settler',
    popular: true,
    gradient: 'from-emerald-600 to-teal-600',
  },
  {
    name: 'Nomad',
    price: '₹799',
    period: '/mo',
    tagline: 'For digital nomads managing multiple cities.',
    features: [
      'Everything in Settler, plus:',
      'Multi-city relocation plans',
      'Unlimited OCR scans',
      'Priority AI responses',
      'Custom neighbourhood reports',
      'Early access to new cities',
      'Email + chat support',
    ],
    cta: 'Go Nomad',
    gradient: 'from-amber-500 to-orange-500',
  },
]

export function LandingPricing() {
  const launchApp = useLaunchApp()

  const handleCta = (_tier: Tier) => {
    launchApp()
  }

  return (
    <section id="pricing" className="relative py-20 sm:py-28">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-14 max-w-2xl text-center sm:mb-16"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-300">
            Pricing
          </span>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Simple pricing that{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-amber-500 bg-clip-text text-transparent">
              grows with you
            </span>
          </h2>
          <p className="mt-4 text-pretty text-base text-muted-foreground sm:text-lg">
            Start free. Upgrade when you&apos;re ready to settle in. Cancel
            anytime.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-stretch">
          {TIERS.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={cn(
                'glass relative flex flex-col rounded-3xl p-7 transition-all duration-300',
                tier.popular
                  ? 'ring-2 ring-emerald-500 shadow-2xl shadow-emerald-900/15 lg:-mt-4 lg:mb-4'
                  : 'hover:-translate-y-1.5 hover:shadow-xl hover:shadow-emerald-900/10'
              )}
            >
              {tier.popular && (
                <span className="absolute -top-3.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md">
                  <Star className="size-3 fill-current" />
                  Most Popular
                </span>
              )}

              <div className="mb-5">
                <div
                  className={cn(
                    'mb-3 grid size-11 place-items-center rounded-xl bg-gradient-to-br text-white shadow-md',
                    tier.gradient
                  )}
                >
                  <Sparkles className="size-5" />
                </div>
                <h3 className="text-xl font-bold text-foreground">{tier.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{tier.tagline}</p>
              </div>

              <div className="mb-6 flex items-end gap-1">
                <span className="text-4xl font-bold tracking-tight text-foreground">
                  {tier.price}
                </span>
                {tier.period && (
                  <span className="mb-1 text-sm text-muted-foreground">
                    {tier.period}
                  </span>
                )}
              </div>

              <ul className="mb-7 flex-1 space-y-3">
                {tier.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-sm">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      <Check className="size-3.5" strokeWidth={3} />
                    </span>
                    <span className="text-foreground/90">{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleCta(tier)}
                className={cn(
                  'w-full rounded-full',
                  tier.popular
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/25 hover:from-emerald-700 hover:to-teal-700'
                    : 'border border-emerald-500/40 bg-background text-foreground hover:bg-emerald-500/10'
                )}
              >
                {tier.cta}
                <ArrowRight className="size-4" />
              </Button>
            </motion.div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Prices in INR. GST extra where applicable. All plans include a 7-day
          money-back guarantee.
        </p>
      </div>
    </section>
  )
}

export default LandingPricing
