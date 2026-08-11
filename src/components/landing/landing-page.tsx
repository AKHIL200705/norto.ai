'use client'

import * as React from 'react'
import { LandingNavbar } from './landing-navbar'
import { LandingHero } from './landing-hero'
import { LandingFeatures } from './landing-features'
import { LandingHowItWorks } from './landing-how-itworks'

export function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground pb-12">
      <LandingNavbar />
      <main className="flex-1">
        <LandingHero />
        <LandingFeatures />
        <LandingHowItWorks />
      </main>
    </div>
  )
}

export default LandingPage
