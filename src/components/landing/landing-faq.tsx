'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { HelpCircle } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'

interface FAQ {
  q: string
  a: string
}

const FAQS: FAQ[] = [
  {
    q: 'How does LifeLens AI work?',
    a: "LifeLens AI combines large-language-model reasoning with city-specific data sources — local listings, weather APIs, transport maps, and curated phrasebooks. Tell us your city, budget, and preferences, and the AI builds a personalised relocation plan, answers questions, and surfaces nearby services in real time.",
  },
  {
    q: 'Which cities are supported?',
    a: 'LifeLens AI is live in 12 Indian cities including Hyderabad, Bangalore, Pune, Chennai, Mumbai, Delhi NCR, Kolkata, Ahmedabad, Jaipur, Kochi, Indore, and Chandigarh. Five more cities are launching soon. You can still use the AI assistant for any city — listings and live map data are richest in supported metros.',
  },
  {
    q: 'Is my data safe?',
    a: "Yes. Your chats, saved places, and budget data are stored securely and tied to your account. We never sell your data to third parties. You can delete your account and all associated data anytime from your profile settings, and we'll wipe everything within 30 days.",
  },
  {
    q: 'Can I use it offline?',
    a: 'Most features need an internet connection because they rely on live AI responses, maps, and weather. However, your saved places, phrasebook, and previously generated relocation guides are cached locally so you can access them on the go — even with poor connectivity.',
  },
  {
    q: 'Do I need to pay?',
    a: 'No. The free Explorer plan covers the essentials — 20 AI messages a month, a 3-day weather forecast, 3 map categories, and 10 saved places. Upgrade to Settler (₹299/mo) or Nomad (₹799/mo) only when you need unlimited AI, all languages, OCR, and advanced insights.',
  },
  {
    q: 'How accurate are the AI recommendations?',
    a: "LifeLens AI blends live web search, curated local data, and LLM reasoning. Prices, ratings, and distances refresh frequently. We always show sources and encourage you to verify before committing to large expenses (like rent). For emergencies, we route you to official numbers whenever possible.",
  },
]

export function LandingFAQ() {
  const setView = useAppStore((s) => s.setView)

  return (
    <section id="faq" className="relative py-20 sm:py-28">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-12 max-w-2xl text-center sm:mb-14"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-sm font-medium text-amber-700 dark:text-amber-300">
            <HelpCircle className="size-4" />
            FAQ
          </span>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Questions?{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-amber-500 bg-clip-text text-transparent">
              We&apos;ve got answers
            </span>
          </h2>
          <p className="mt-4 text-pretty text-base text-muted-foreground sm:text-lg">
            Everything you need to know before moving with LifeLens AI.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass rounded-3xl p-2 sm:p-4"
        >
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((f, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="rounded-xl px-4 transition-colors data-[state=open]:bg-emerald-500/5 sm:px-5"
              >
                <AccordionTrigger className="text-base font-semibold text-foreground hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10 flex flex-col items-center justify-center gap-3 text-center"
        >
          <p className="text-sm text-muted-foreground">
            Still have questions? Try LifeLens AI free — no card required.
          </p>
          <Button
            onClick={() => setView('dashboard')}
            className="rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-6 text-white shadow-md shadow-emerald-500/25 hover:from-emerald-700 hover:to-teal-700"
          >
            Launch the app
          </Button>
        </motion.div>
      </div>
    </section>
  )
}

export default LandingFAQ
