'use client'

import * as React from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/lib/store'

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = React.useMemo(() => createClient(), [])
  const signInStore = useAppStore((s) => s.signIn)
  const signOutStore = useAppStore((s) => s.signOut)
  const user = useAppStore((s) => s.user)
  const updateUser = useAppStore((s) => s.updateUser)

  React.useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const email = session.user.email ?? ''
        const name =
          session.user.user_metadata?.full_name ||
          session.user.user_metadata?.name ||
          email.split('@')[0] ||
          'User'
        const avatar =
          session.user.user_metadata?.avatar_url ||
          session.user.user_metadata?.picture ||
          null
        const providerName = session.user.app_metadata?.provider === 'google' ? 'google' : 'email'

        signInStore(
          {
            name,
            email,
            avatar,
          },
          providerName
        )
      } else if (event === 'SIGNED_OUT') {
        signOutStore()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, signInStore, signOutStore])

  return <>{children}</>
}
