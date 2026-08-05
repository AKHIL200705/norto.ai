'use client'

import * as React from 'react'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Send, Home, Utensils, Languages, Sparkles } from 'lucide-react'

interface Prompt {
  chip: string
  question: string
  response: {
    text: string
    bullets?: { icon: typeof Home; text: string }[]
  }
}

const PROMPTS: Prompt[] = [
  {
    chip: 'Find me a PG near Hitech City under ₹8000',
    question: 'Find me a PG near Hitech City under ₹8000',
    response: {
      text: 'Here are 3 PGs near Hitech City within your budget:',
      bullets: [
        { icon: Home, text: 'Sri Sai PG (Madhapur) — ₹7,000/mo · 1.2 km · 4.3★' },
        { icon: Home, text: 'Anand Residency (Kondapur) — ₹7,500/mo · 2.0 km · 4.5★' },
        { icon: Home, text: 'Venkat Nest (Hafeezpet) — ₹6,800/mo · 3.1 km · 4.1★' },
      ],
    },
  },
  {
    chip: 'Suggest vegetarian dinner options',
    question: 'Suggest vegetarian dinner options near me',
    response: {
      text: 'Top vegetarian dinner picks near you 👇',
      bullets: [
        { icon: Utensils, text: 'Ohri\'s Nautanki Galli — thali ₹350 · 4.6★' },
        { icon: Utensils, text: 'Chutneys (Banjara Hills) — dosa & curd rice · ₹250 · 4.4★' },
        { icon: Utensils, text: 'Saravana Bhavan — South Indian meals · ₹200 · 4.5★' },
      ],
    },
  },
  {
    chip: "Translate 'Where is the hospital?' to Telugu",
    question: "Translate 'Where is the hospital?' to Telugu",
    response: {
      text: "Here's your translation to Telugu:",
      bullets: [
        {
          icon: Languages,
          text: 'ఆసుపత్రి ఎక్కడ ఉంది? (Āsupatri ekkaḍa uṇḍi?)',
        },
        {
          icon: Languages,
          text: 'Pronunciation: Aa-su-pa-thri ek-ka-da un-di?',
        },
      ],
    },
  },
]

export function LandingAIPreview() {
  const [active, setActive] = useState<Prompt>(PROMPTS[0])
  const [phase, setPhase] = useState<'idle' | 'typing' | 'done'>('done')
  const [typed, setTyped] = useState(PROMPTS[0].response.text)
  const [showBullets, setShowBullets] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  const runAnimation = (p: Prompt) => {
    clearTimers()
    setPhase('typing')
    setTyped('')
    setShowBullets(false)

    let i = 0
    const tick = () => {
      if (i <= p.response.text.length) {
        setTyped(p.response.text.slice(0, i))
        i += 1
        timersRef.current.push(setTimeout(tick, 22))
      } else {
        timersRef.current.push(
          setTimeout(() => {
            setShowBullets(true)
            setPhase('done')
          }, 300)
        )
      }
    }
    timersRef.current.push(setTimeout(tick, 250))
  }

  useEffect(() => {
    return clearTimers
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [typed, showBullets])

  const handlePick = (p: Prompt) => {
    setActive(p)
    runAnimation(p)
  }

  return (
    <section id="ai-preview" className="relative py-20 sm:py-28">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-12 max-w-2xl text-center sm:mb-16"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-300">
            <Sparkles className="size-4" />
            Try it now
          </span>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            See LifeLens AI in{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              action
            </span>
          </h2>
          <p className="mt-4 text-pretty text-base text-muted-foreground sm:text-lg">
            Tap a prompt below to see how LifeLens AI responds — no signup
            required.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55 }}
          className="mx-auto max-w-3xl"
        >
          <div className="glass overflow-hidden rounded-3xl shadow-2xl shadow-emerald-900/10">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/60 bg-gradient-to-r from-emerald-500/10 to-amber-500/10 px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                  <Bot className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    LifeLens Assistant
                  </p>
                  <p className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Interactive demo
                  </p>
                </div>
              </div>
              <div className="hidden gap-1.5 sm:flex">
                <span className="size-2.5 rounded-full bg-rose-400/70" />
                <span className="size-2.5 rounded-full bg-amber-400/70" />
                <span className="size-2.5 rounded-full bg-emerald-400/70" />
              </div>
            </div>

            {/* Chat body */}
            <div
              ref={scrollRef}
              className="max-h-[420px] min-h-[320px] space-y-4 overflow-y-auto px-5 py-6"
            >
              {/* User message */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.question}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3 }}
                  className="flex justify-end"
                >
                  <div className="max-w-[80%] rounded-2xl rounded-br-md bg-gradient-to-br from-emerald-600 to-teal-600 px-4 py-2.5 text-sm text-white shadow-md">
                    {active.question}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* AI message */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.question + '-ai'}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.15 }}
                  className="flex gap-2.5"
                >
                  <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                    <Bot className="size-4" />
                  </span>
                  <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-muted/60 px-4 py-3 text-sm text-foreground">
                    <span>{typed}</span>
                    {phase === 'typing' && (
                      <span className="ml-0.5 inline-block size-3 animate-pulse rounded-sm bg-emerald-500 align-middle" />
                    )}
                    {showBullets && active.response.bullets && (
                      <motion.ul
                        initial="hidden"
                        animate="visible"
                        variants={{
                          hidden: {},
                          visible: {
                            transition: { staggerChildren: 0.15, delayChildren: 0.05 },
                          },
                        }}
                        className="mt-3 space-y-2"
                      >
                        {active.response.bullets.map((b, i) => (
                          <motion.li
                            key={i}
                            variants={{
                              hidden: { opacity: 0, y: 8 },
                              visible: { opacity: 1, y: 0 },
                            }}
                            className="flex items-start gap-2 text-sm"
                          >
                            <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                              <b.icon className="size-3.5" />
                            </span>
                            <span className="text-foreground/90">{b.text}</span>
                          </motion.li>
                        ))}
                      </motion.ul>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Prompt chips */}
            <div className="border-t border-border/60 px-5 py-4">
              <p className="mb-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Try a prompt
              </p>
              <div className="flex flex-wrap gap-2">
                {PROMPTS.map((p) => {
                  const isActive = p.chip === active.chip
                  return (
                    <button
                      key={p.chip}
                      onClick={() => handlePick(p)}
                      className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                        isActive
                          ? 'border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 shadow-sm'
                          : 'border-border bg-background/50 text-muted-foreground hover:border-emerald-500/50 hover:text-foreground'
                      }`}
                    >
                      <Sparkles className="size-3" />
                      {p.chip}
                    </button>
                  )
                })}
              </div>

              {/* Fake input */}
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-background/60 px-3 py-2">
                <input
                  readOnly
                  placeholder="Ask LifeLens anything… (try a prompt above)"
                  className="flex-1 bg-transparent text-sm text-muted-foreground outline-none"
                />
                <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-emerald-600 to-teal-600 text-white">
                  <Send className="size-4" />
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default LandingAIPreview
