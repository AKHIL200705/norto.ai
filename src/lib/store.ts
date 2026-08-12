'use client'

import * as React from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { View, DashboardSection, UserProfile, ChatMessage } from './types'
import {
  detectLocation as detectLocationUtil,
  GeoError,
} from './geolocation'

export type AuthProvider = 'google' | 'email' | 'guest' | null

export type LocationStatus = 'idle' | 'loading' | 'success' | 'error'

export interface LiveLocation {
  lat: number
  lng: number
  accuracy: number // meters
  city: string
  locality: string | null
  exactAddress?: string | null
  displayName?: string | null
  region: string | null
  country: string | null
  detectedAt: number // epoch ms
}

interface AppState {
  view: View
  section: DashboardSection
  user: UserProfile | null
  city: string
  sidebarOpen: boolean
  // auth
  isAuthenticated: boolean
  authProvider: AuthProvider
  signInOpen: boolean
  // live location
  liveLocation: LiveLocation | null
  locationStatus: LocationStatus
  locationError: string | null

  // notification preferences & travel history
  notificationPrefs: { weather: boolean; budget: boolean; festival: boolean; emergency: boolean }
  travelHistory: Array<{ city: string; from: string; to: string; current: boolean }>

  setView: (v: View) => void
  setSection: (s: DashboardSection) => void
  setCity: (c: string) => void
  setSidebarOpen: (o: boolean) => void
  setUser: (u: UserProfile | null) => void
  updateUser: (u: Partial<UserProfile>) => void
  setSignInOpen: (v: boolean) => void
  signIn: (u: { name: string; email: string; avatar?: string | null; occupation?: string | null }, provider: 'google' | 'email') => void
  signOut: () => void
  detectLocation: () => Promise<void>
  setExactLocation: (query: string) => Promise<void>
  clearLocation: () => void
  setNotificationPrefs: (p: Partial<{ weather: boolean; budget: boolean; festival: boolean; emergency: boolean }>) => void
  addTravelCity: (city: string) => void
}

const GUEST_DEFAULTS: Omit<UserProfile, 'name' | 'email' | 'avatar' | 'occupation'> = {
  language: 'English',
  budget: 25000,
  foodPref: 'Veg',
  transport: 'Public',
  city: 'Hyderabad',
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      view: 'landing',
      section: 'home',
      user: null,
      city: 'Hyderabad',
      sidebarOpen: false,
      isAuthenticated: false,
      authProvider: null,
      signInOpen: false,
      liveLocation: null,
      locationStatus: 'idle',
      locationError: null,
      notificationPrefs: {
        weather: true,
        budget: true,
        festival: false,
        emergency: true,
      },
      travelHistory: [
        { city: 'Autonagar, Koppuravuru', from: 'Recently', to: 'Present', current: true },
        { city: 'Hyderabad', from: 'Oct 2024', to: 'Present', current: false },
        { city: 'Bangalore', from: 'Jun 2024', to: 'Sep 2024', current: false },
        { city: 'Pune', from: 'Feb 2024', to: 'May 2024', current: false },
        { city: 'Chennai', from: 'Nov 2023', to: 'Jan 2024', current: false },
      ],

      setView: (v) => set({ view: v }),
      setSection: (s) => {
        set({ section: s, sidebarOpen: false })
        if (typeof window !== 'undefined') {
          try {
            window.history.pushState({ section: s }, '', `/#/${s}`)
          } catch {
            // fallback
          }
        }
      },
      setCity: (c) => {
        set({ city: c })
        get().addTravelCity(c)
      },
      setSidebarOpen: (o) => set({ sidebarOpen: o }),
      setUser: (u) => set({ user: u }),
      updateUser: (u) => set((state) => ({ user: state.user ? { ...state.user, ...u } : null })),
      setSignInOpen: (v) => set({ signInOpen: v }),
      signIn: (u, provider) =>
        set((state) => ({
          isAuthenticated: true,
          view: 'dashboard',
          section: 'home',
          authProvider: provider,
          signInOpen: false,
          user: {
            ...GUEST_DEFAULTS,
            city: state.city,
            name: u.name,
            email: u.email,
            avatar: u.avatar ?? null,
            occupation: u.occupation ?? state.user?.occupation ?? null,
            language: state.user?.language ?? GUEST_DEFAULTS.language,
            budget: state.user?.budget ?? GUEST_DEFAULTS.budget,
            foodPref: state.user?.foodPref ?? GUEST_DEFAULTS.foodPref,
            transport: state.user?.transport ?? GUEST_DEFAULTS.transport,
            createdAt: state.user?.createdAt || new Date().toISOString(),
          },
        })),
      signOut: () =>
        set({
          isAuthenticated: false,
          authProvider: null,
          user: null,
          view: 'landing',
          section: 'home',
        }),
      setNotificationPrefs: (p) =>
        set((state) => ({
          notificationPrefs: { ...state.notificationPrefs, ...p },
        })),
      addTravelCity: (newCity) => {
        if (!newCity || !newCity.trim()) return
        const cityTrimmed = newCity.trim()
        set((state) => {
          const updatedHistory = state.travelHistory.map((item) => ({ ...item, current: false }))
          const existingIdx = updatedHistory.findIndex((h) => h.city.toLowerCase() === cityTrimmed.toLowerCase())
          if (existingIdx !== -1) {
            const [item] = updatedHistory.splice(existingIdx, 1)
            return {
              travelHistory: [{ ...item, current: true, to: 'Present' }, ...updatedHistory],
            }
          }
          return {
            travelHistory: [
              { city: cityTrimmed, from: 'Recently', to: 'Present', current: true },
              ...updatedHistory,
            ],
          }
        })
      },
      detectLocation: async () => {
        if (get().locationStatus === 'loading') return
        set({ locationStatus: 'loading', locationError: null })
        try {
          const result = await detectLocationUtil()
          const live: LiveLocation = {
            lat: result.lat,
            lng: result.lng,
            accuracy: result.accuracy,
            city: result.city,
            locality: result.locality,
            exactAddress: result.exactAddress,
            displayName: result.displayName,
            region: result.region,
            country: result.country,
            detectedAt: Date.now(),
          }
          set({
            liveLocation: live,
            locationStatus: 'success',
            locationError: null,
            // Update the active city so weather / map / AI use the real location
            city: live.city,
            user: get().user ? { ...get().user!, city: live.city } : get().user,
          })
        } catch (err) {
          const message =
            err instanceof GeoError
              ? err.message
              : err instanceof Error
                ? err.message
                : 'Could not detect your location.'
          set({ locationStatus: 'error', locationError: message })
        }
      },
      setExactLocation: async (query: string) => {
        if (!query.trim()) return
        set({ locationStatus: 'loading', locationError: null })
        try {
          const res = await fetch(`/api/geocode?q=${encodeURIComponent(query.trim())}`)
          if (!res.ok) {
            throw new Error('Could not find location.')
          }
          const data = await res.json()
          if (data.error) {
            throw new Error(data.error)
          }
          const live: LiveLocation = {
            lat: data.latitude,
            lng: data.longitude,
            accuracy: 15, // High manual precision
            city: data.city,
            locality: data.locality,
            exactAddress: data.exactAddress,
            displayName: data.displayName,
            region: data.region,
            country: data.country,
            detectedAt: Date.now(),
          }
          set({
            liveLocation: live,
            locationStatus: 'success',
            locationError: null,
            city: live.city,
            user: get().user ? { ...get().user!, city: live.city } : get().user,
          })
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Could not find that location.'
          set({ locationStatus: 'error', locationError: msg })
        }
      },
      clearLocation: () =>
        set({ liveLocation: null, locationStatus: 'idle', locationError: null }),
    }),
    {
      name: 'norto-store',
      partialize: (state) => ({
        view: state.view,
        section: state.section,
        user: state.user,
        city: state.city,
        isAuthenticated: state.isAuthenticated,
        authProvider: state.authProvider,
        liveLocation: state.liveLocation,
        notificationPrefs: state.notificationPrefs,
        travelHistory: state.travelHistory,
      }),
    }
  )
)

// Chat history is persisted in localStorage per section
interface ChatState {
  messages: Record<string, ChatMessage[]>
  addMessage: (section: string, msg: ChatMessage) => void
  clearSection: (section: string) => void
  clearAllHistory: () => void
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: {},
      addMessage: (section, msg) =>
        set((state) => {
          const current = state.messages[section] || []
          // Keep up to 50 messages per section for optimal performance
          const nextSectionMsgs = [...current, msg].slice(-50)
          return {
            messages: {
              ...state.messages,
              [section]: nextSectionMsgs,
            },
          }
        }),
      clearSection: (section) =>
        set((state) => {
          const next = { ...state.messages }
          delete next[section]
          return { messages: next }
        }),
      clearAllHistory: () => set({ messages: {} }),
    }),
    {
      name: 'norto-chat-store',
    }
  )
)

/**
 * Auth-aware launcher for the dashboard.
 *
 * Signed-in users go straight to the dashboard. Signed-out users are sent to
 * the sign-in dialog first — the dashboard is reachable ONLY after signing in
 * (Google or email). There is no guest bypass.
 */
export function useLaunchApp() {
  const isAuth = useAppStore((s) => s.isAuthenticated)
  const setView = useAppStore((s) => s.setView)
  const setSignInOpen = useAppStore((s) => s.setSignInOpen)
  return React.useCallback(() => {
    if (isAuth) setView('dashboard')
    else setSignInOpen(true)
  }, [isAuth, setView, setSignInOpen])
}
