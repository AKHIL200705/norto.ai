'use client'

import * as React from 'react'
import dynamic from 'next/dynamic'
import { useAppStore } from '@/lib/store'
import { DashboardSidebar, DashboardTopbar, MobileSidebar } from '@/components/dashboard/dashboard-shell'
import { DashboardHome } from '@/components/dashboard/sections/home'
import { SignInDialog } from '@/components/auth/sign-in-dialog'
import { IntroScreen, shouldPlayIntro } from '@/components/intro/intro-screen'
import { Skeleton } from '@/components/ui/skeleton'

// Dynamic lazy loading for heavy dashboard sections (Optimized for 100/100 Lighthouse Performance)
const AiAssistant = dynamic(
  () => import('@/components/dashboard/sections/ai-assistant').then((m) => m.AiAssistant),
  { loading: () => <SectionSkeleton title="AI Assistant" /> }
)
const ChatHistoryView = dynamic(
  () => import('@/components/dashboard/sections/chat-history').then((m) => m.ChatHistoryView),
  { loading: () => <SectionSkeleton title="Chat History" /> }
)
const SmartMap = dynamic(
  () => import('@/components/dashboard/sections/smart-map').then((m) => m.SmartMap),
  { loading: () => <SectionSkeleton title="Smart Map" /> }
)
const BudgetPlanner = dynamic(
  () => import('@/components/dashboard/sections/budget-planner').then((m) => m.BudgetPlanner),
  { loading: () => <SectionSkeleton title="Budget Planner" /> }
)
const WeatherView = dynamic(
  () => import('@/components/dashboard/sections/weather').then((m) => m.WeatherView),
  { loading: () => <SectionSkeleton title="Weather Forecast" /> }
)
const Translator = dynamic(
  () => import('@/components/dashboard/sections/translator').then((m) => m.Translator),
  { loading: () => <SectionSkeleton title="Translator" /> }
)
const FoodView = dynamic(
  () => import('@/components/dashboard/sections/food').then((m) => m.FoodView),
  { loading: () => <SectionSkeleton title="Food & Dining" /> }
)
const OcrScanner = dynamic(
  () => import('@/components/dashboard/sections/ocr').then((m) => m.OcrScanner),
  { loading: () => <SectionSkeleton title="OCR Scanner" /> }
)
const SavedPlaces = dynamic(
  () => import('@/components/dashboard/sections/saved-places').then((m) => m.SavedPlaces),
  { loading: () => <SectionSkeleton title="Saved Places" /> }
)
const Profile = dynamic(
  () => import('@/components/dashboard/sections/profile').then((m) => m.Profile),
  { loading: () => <SectionSkeleton title="Profile & Settings" /> }
)

function SectionSkeleton({ title }: { title: string }) {
  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
      <Skeleton className="h-44 w-full rounded-2xl" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Skeleton className="h-36 rounded-xl" />
        <Skeleton className="h-36 rounded-xl" />
        <Skeleton className="h-36 rounded-xl" />
      </div>
    </div>
  )
}

function DashboardSection() {
  const section = useAppStore((s) => s.section)

  switch (section) {
    case 'home': return <DashboardHome />
    case 'assistant': return <AiAssistant />
    case 'history': return <ChatHistoryView />
    case 'map': return <SmartMap />
    case 'budget': return <BudgetPlanner />
    case 'translator': return <Translator />
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
  const isAuth = useAppStore((s) => s.isAuthenticated)
  const setView = useAppStore((s) => s.setView)
  const setSignInOpen = useAppStore((s) => s.setSignInOpen)
  const [LandingPage, setLandingPage] = React.useState<React.ComponentType | null>(null)

  const [showIntro, setShowIntro] = React.useState(false)
  React.useEffect(() => {
    setShowIntro(shouldPlayIntro())
  }, [])

  // Return to home page whenever user presses browser back button from any section
  React.useEffect(() => {
    const handlePopState = () => {
      const currentSection = useAppStore.getState().section
      if (currentSection !== 'home') {
        useAppStore.setState({ section: 'home', sidebarOpen: false })
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  React.useEffect(() => {
    if (view === 'landing') {
      import('@/components/landing/landing-page').then((mod) => {
        setLandingPage(() => mod.default)
      })
    }
  }, [view])

  React.useEffect(() => {
    if (isAuth && view === 'landing') {
      setView('dashboard')
    }
  }, [isAuth, view, setView])

  const dialog = <SignInDialog />

  const intro = showIntro ? (
    <IntroScreen onComplete={() => setShowIntro(false)} />
  ) : null

  const effectiveView: 'landing' | 'dashboard' =
    view === 'dashboard' && !isAuth ? 'landing' : view

  if (effectiveView === 'landing') {
    if (!LandingPage) {
      return (
        <>
          {intro}
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="size-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
          </div>
          {dialog}
        </>
      )
    }
    return (
      <>
        {intro}
        <LandingPage />
        {dialog}
      </>
    )
  }

  return (
    <>
      {intro}
      <Dashboard />
      {dialog}
    </>
  )
}
