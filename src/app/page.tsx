'use client'

import * as React from 'react'
import { useAppStore } from '@/lib/store'
import { DashboardSidebar, DashboardTopbar, MobileSidebar } from '@/components/dashboard/dashboard-shell'
import { DashboardHome } from '@/components/dashboard/sections/home'
import { AiAssistant } from '@/components/dashboard/sections/ai-assistant'
import { SmartMap } from '@/components/dashboard/sections/smart-map'
import { BudgetPlanner } from '@/components/dashboard/sections/budget-planner'
import { WeatherView } from '@/components/dashboard/sections/weather'
import { Translator } from '@/components/dashboard/sections/translator'
import { Emergency } from '@/components/dashboard/sections/emergency'
import { FoodView } from '@/components/dashboard/sections/food'
import { OcrScanner } from '@/components/dashboard/sections/ocr'
import { SavedPlaces } from '@/components/dashboard/sections/saved-places'
import { Profile } from '@/components/dashboard/sections/profile'

function DashboardSection() {
  const section = useAppStore((s) => s.section)

  switch (section) {
    case 'home': return <DashboardHome />
    case 'assistant': return <AiAssistant />
    case 'map': return <SmartMap />
    case 'budget': return <BudgetPlanner />
    case 'weather': return <WeatherView />
    case 'translator': return <Translator />
    case 'emergency': return <Emergency />
    case 'food': return <FoodView />
    case 'ocr': return <OcrScanner />
    case 'saved': return <SavedPlaces />
    case 'profile': return <Profile />
    default: return <DashboardHome />
  }
}

function Dashboard() {
  return (
    <div className="min-h-screen flex bg-background">
      <DashboardSidebar />
      <MobileSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardTopbar />
        <main className="flex-1 overflow-y-auto">
          <DashboardSection />
        </main>
      </div>
    </div>
  )
}

export default function Home() {
  const view = useAppStore((s) => s.view)
  const [LandingPage, setLandingPage] = React.useState<React.ComponentType | null>(null)

  React.useEffect(() => {
    if (view === 'landing') {
      import('@/components/landing/landing-page').then((mod) => {
        setLandingPage(() => mod.default)
      })
    }
  }, [view])

  if (view === 'landing') {
    // SSR-safe fallback while the landing chunk loads
    if (!LandingPage) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="size-10 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
        </div>
      )
    }
    return <LandingPage />
  }

  return <Dashboard />
}
