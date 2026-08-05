'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'

interface Testimonial {
  name: string
  city: string
  role: string
  avatar: string
  gradient: string
  quote: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Priya Sharma',
    city: 'Hyderabad',
    role: 'Software Engineer',
    avatar: 'PS',
    gradient: 'from-emerald-500 to-teal-500',
    quote:
      "I moved to Hyderabad for work with zero local knowledge. LifeLens AI built me a full week-one plan — found my PG, sorted my metro route, and even taught me basic Telugu. Felt like home in days, not months.",
  },
  {
    name: 'Arjun Mehta',
    city: 'Bangalore',
    role: 'Startup Founder',
    avatar: 'AM',
    gradient: 'from-amber-400 to-orange-500',
    quote:
      'The budget planner is gold. It broke down my ₹35,000 salary across rent, food and transport, then told me exactly where I was overspending. Saved me ₹4,000/month in the first week alone.',
  },
  {
    name: 'Sneha Reddy',
    city: 'Pune',
    role: 'Grad Student',
    avatar: 'SR',
    gradient: 'from-rose-400 to-pink-500',
    quote:
      "As a student new to Pune, the OCR scanner was a lifesaver — I scanned Marathi signboards at the bus stand and got instant English translations. The food recommendations were spot on too!",
  },
]

export function LandingTestimonials() {
  return (
    <section
      id="testimonials"
      className="relative bg-gradient-to-b from-transparent via-amber-500/5 to-transparent py-20 sm:py-28"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-14 max-w-2xl text-center sm:mb-16"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-1.5 text-sm font-medium text-rose-700 dark:text-rose-300">
            Testimonials
          </span>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Loved by relocators{' '}
            <span className="bg-gradient-to-r from-rose-500 to-amber-500 bg-clip-text text-transparent">
              across India
            </span>
          </h2>
          <p className="mt-4 text-pretty text-base text-muted-foreground sm:text-lg">
            Real stories from people who made their new city feel like home.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.article
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="glass relative flex flex-col gap-5 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-emerald-900/10"
            >
              <Quote
                aria-hidden
                className="size-8 text-emerald-500/30"
                fill="currentColor"
              />

              <div className="flex items-center gap-1" aria-label="Rated 5 out of 5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    className="size-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              <p className="flex-1 text-pretty text-sm leading-relaxed text-foreground/90">
                “{t.quote}”
              </p>

              <div className="mt-2 flex items-center gap-3 border-t border-border/60 pt-4">
                <span
                  className={`grid size-11 place-items-center rounded-full bg-gradient-to-br ${t.gradient} text-sm font-semibold text-white shadow-md`}
                  aria-hidden
                >
                  {t.avatar}
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.role} · {t.city}
                  </p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default LandingTestimonials
