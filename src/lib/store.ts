'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { View, DashboardSection, UserProfile, ChatMessage } from './types'

export type AuthProvider = 'google' | 'email' | 'guest' | null

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

  setView: (v: View) => void
  setSection: (s: DashboardSection) => void
  setCity: (c: string) => void
  setSidebarOpen: (o: boolean) => void
  setUser: (u: UserProfile | null) => void
  updateUser: (u: Partial<UserProfile>) => void
  setSignInOpen: (v: boolean) => void
  signIn: (u: { name: string; email: string; avatar?: string | null; occupation?: string | null }, provider: 'google' | 'email') => void
  signOut: () => void
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
    (set) => ({
      view: 'landing',
      section: 'home',
      user: null,
      city: 'Hyderabad',
      sidebarOpen: false,
      isAuthenticated: false,
      authProvider: null,
      signInOpen: false,

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
    }),
    {
      name: 'lifelens-store',
      partialize: (state) => ({
        view: state.view,
        section: state.section,
        user: state.user,
        city: state.city,
        isAuthenticated: state.isAuthenticated,
        authProvider: state.authProvider,
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
