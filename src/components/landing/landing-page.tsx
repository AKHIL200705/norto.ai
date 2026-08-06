'use client'

import * as React from 'react'
import { LandingNavbar } from './landing-navbar'
import { LandingHero } from './landing-hero'
import { LandingFeatures } from './landing-features'
import { LandingHowItWorks } from './landing-how-itworks'
import { LandingAIPreview } from './landing-ai-preview'
import { LandingTestimonials } from './landing-testimonials'
import { LandingPricing } from './landing-pricing'
import { LandingFAQ } from './landing-faq'
import { LandingFooter } from './landing-footer'

export function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      <LandingNavbar />
      <main className="flex-1">
        <LandingHero />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingAIPreview />
        <LandingTestimonials />
        <LandingPricing />
        <LandingFAQ />
      </main>
      <LandingFooter />
    </div>
  )
}

export default LandingPage
