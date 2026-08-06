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

      setView: (v) => set({ view: v }),
      setSection: (s) => set({ section: s, sidebarOpen: false }),
      setCity: (c) => set({ city: c }),
      setSidebarOpen: (o) => set({ sidebarOpen: o }),
      setUser: (u) => set({ user: u }),
      updateUser: (u) => set((state) => ({ user: state.user ? { ...state.user, ...u } : null })),
      setSignInOpen: (v) => set({ signInOpen: v }),
      signIn: (u, provider) =>
        set((state) => ({
          isAuthenticated: true,
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
      }),
    }
  )
)

// Chat history is kept in a separate non-persisted store per section to avoid huge localStorage
interface ChatState {
  messages: Record<string, ChatMessage[]>
  addMessage: (section: string, msg: ChatMessage) => void
  clearSection: (section: string) => void
}

export const useChatStore = create<ChatState>((set) => ({
  messages: {},
  addMessage: (section, msg) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [section]: [...(state.messages[section] || []), msg],
      },
    })),
  clearSection: (section) =>
    set((state) => {
      const next = { ...state.messages }
      delete next[section]
      return { messages: next }
    }),
}))

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
