'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { View, DashboardSection, UserProfile, ChatMessage } from './types'

interface AppState {
  view: View
  section: DashboardSection
  user: UserProfile | null
  city: string
  sidebarOpen: boolean

  setView: (v: View) => void
  setSection: (s: DashboardSection) => void
  setCity: (c: string) => void
  setSidebarOpen: (o: boolean) => void
  setUser: (u: UserProfile | null) => void
  updateUser: (u: Partial<UserProfile>) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      view: 'landing',
      section: 'home',
      user: null,
      city: 'Hyderabad',
      sidebarOpen: false,

      setView: (v) => set({ view: v }),
      setSection: (s) => set({ section: s, sidebarOpen: false }),
      setCity: (c) => set({ city: c }),
      setSidebarOpen: (o) => set({ sidebarOpen: o }),
      setUser: (u) => set({ user: u }),
      updateUser: (u) => set((state) => ({ user: state.user ? { ...state.user, ...u } : null })),
    }),
    {
      name: 'lifelens-store',
      partialize: (state) => ({
        view: state.view,
        section: state.section,
        user: state.user,
        city: state.city,
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
