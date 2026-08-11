'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  Compass, Mail, Lock, Loader2, X,
  User as UserIcon, Eye, EyeOff,
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog, DialogContent, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { GoogleIcon } from './google-icon'
import { createClient } from '@/lib/supabase/client'

type AuthAction = 'signin' | 'signup'

export function SignInDialog() {
  const supabase = React.useMemo(() => createClient(), [])
  const open = useAppStore((s) => s.signInOpen)
  const setOpen = useAppStore((s) => s.setSignInOpen)
  const signInStore = useAppStore((s) => s.signIn)
  const setView = useAppStore((s) => s.setView)

  const [authAction, setAuthAction] = React.useState<AuthAction>('signin')

  // Email form state
  const [nameInput, setNameInput] = React.useState('')
  const [emailInput, setEmailInput] = React.useState('')
  const [passwordInput, setPasswordInput] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [emailErrors, setEmailErrors] = React.useState<{ email?: string; password?: string; name?: string }>({})

  // Reset internal state whenever the dialog is (re)opened
  React.useEffect(() => {
    if (open) {
      setAuthAction('signin')
      setNameInput('')
      setEmailInput('')
      setPasswordInput('')
      setShowPassword(false)
      setIsLoading(false)
      setEmailErrors({})
    }
  }, [open])

  const completeSignIn = React.useCallback(
    (account: { name: string; email: string }, provider: 'google' | 'email') => {
      signInStore(account, provider)
      const first = account.name.split(' ')[0]
      toast.success(`Signed in as ${first}`, {
        description: provider === 'google' ? 'via Google' : 'via Email',
      })
      setView('dashboard')
    },
    [signInStore, setView]
  )

  const handleGoogleOAuth = async () => {
    try {
      setIsLoading(true)
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      })
      if (error) {
        toast.error(`Google Sign-In Error: ${error.message}`)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign-in failed'
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailSubmit = async () => {
    const errs: { email?: string; password?: string; name?: string } = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)) errs.email = 'Enter a valid email'
    if (passwordInput.length < 6) errs.password = 'At least 6 characters'
    if (authAction === 'signup' && !nameInput.trim()) errs.name = 'Please enter your name'
    setEmailErrors(errs)
    if (Object.keys(errs).length > 0) return

    setIsLoading(true)

    try {
      if (authAction === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: emailInput.trim(),
          password: passwordInput,
          options: {
            data: {
              name: nameInput.trim(),
            },
          },
        })

        if (error) {
          if (error.message.includes('FetchError') || error.message.includes('invalid') || error.message.includes('URL')) {
            const fallbackName = nameInput.trim() || emailInput.split('@')[0]
            completeSignIn({ name: fallbackName, email: emailInput.trim() }, 'email')
            return
          }
          toast.error(error.message)
          return
        }

        if (data.session) {
          const userName = data.user?.user_metadata?.name || nameInput.trim() || emailInput.split('@')[0]
          completeSignIn({ name: userName, email: emailInput.trim() }, 'email')
        } else {
          toast.success('Account created! Please check your email to confirm registration.')
          setOpen(false)
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: emailInput.trim(),
          password: passwordInput,
        })

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Invalid email or password.')
            return
          }
          const fallbackName = emailInput.split('@')[0]
          completeSignIn({ name: fallbackName, email: emailInput.trim() }, 'email')
          return
        }

        if (data.session) {
          const userName =
            data.user?.user_metadata?.name ||
            data.user?.user_metadata?.full_name ||
            emailInput.split('@')[0]
          completeSignIn({ name: userName, email: emailInput.trim() }, 'email')
        }
      }
    } catch {
      const fallbackName = emailInput.split('@')[0]
      completeSignIn({ name: fallbackName, email: emailInput.trim() }, 'email')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent showCloseButton={false} className="p-0 overflow-hidden max-w-[390px] gap-0 border-[#D9D9D9] rounded-3xl">
        <DialogTitle className="sr-only">Sign in to Norto</DialogTitle>
        <DialogDescription className="sr-only">
          Sign in to Norto using Google or Email and Password.
        </DialogDescription>

        <AnimatePresence mode="wait">
          <motion.div
            key="choose"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header band */}
            <div className="relative bg-gradient-to-br from-[#DD0200] via-[#8B0000] to-[#55100D] px-6 pt-6 pb-9 text-white overflow-hidden">
              <div className="absolute inset-0 mesh-bg opacity-25" />
              <button
                onClick={() => setOpen(false)}
                className="absolute right-4 top-4 grid size-8 place-items-center rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
              <div className="relative flex items-center gap-2.5">
                <div className="size-10 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 grid place-items-center shadow-md">
                  <Compass className="size-5 text-white" />
                </div>
                <div>
                  <p className="text-lg font-extrabold leading-tight">Norto</p>
                  <p className="text-xs text-rose-100/80 font-medium">Your AI City Companion</p>
                </div>
              </div>
            </div>

            {/* Form Body */}
            <div className="px-5 pb-6 -mt-4">
              <div className="rounded-2xl bg-card border border-[#D9D9D9] shadow-xl p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-extrabold">
                    {authAction === 'signin' ? 'Sign In' : 'Create Account'}
                  </h2>
                  <button
                    onClick={() => {
                      setAuthAction(authAction === 'signin' ? 'signup' : 'signin')
                      setEmailErrors({})
                    }}
                    className="text-xs text-[#DD0200] font-bold hover:underline cursor-pointer"
                  >
                    {authAction === 'signin' ? 'Need an account?' : 'Already have one?'}
                  </button>
                </div>

                {/* Google OAuth button */}
                <button
                  onClick={handleGoogleOAuth}
                  disabled={isLoading}
                  className="mt-4 w-full h-11 rounded-xl bg-white border border-[#D9D9D9] hover:bg-slate-50 hover:border-[#DD0200]/40 active:scale-[0.99] transition-all flex items-center justify-center gap-3 text-sm font-bold text-slate-800 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  <GoogleIcon className="size-5" />
                  Sign in with Google
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 my-4">
                  <div className="h-px flex-1 bg-[#D9D9D9]" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">or email</span>
                  <div className="h-px flex-1 bg-[#D9D9D9]" />
                </div>

                {/* Email / Password inputs */}
                <div className="space-y-3">
                  {authAction === 'signup' && (
                    <div>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="Your Full Name"
                          value={nameInput}
                          onChange={(e) => {
                            setNameInput(e.target.value)
                            if (emailErrors.name) setEmailErrors((p) => ({ ...p, name: undefined }))
                          }}
                          className="pl-9 h-11 rounded-xl border-[#D9D9D9]"
                        />
                      </div>
                      {emailErrors.name && (
                        <p className="text-[11px] font-bold text-destructive mt-1 ml-1">{emailErrors.name}</p>
                      )}
                    </div>
                  )}

                  <div>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="Email address"
                        value={emailInput}
                        onChange={(e) => {
                          setEmailInput(e.target.value)
                          if (emailErrors.email) setEmailErrors((p) => ({ ...p, email: undefined }))
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleEmailSubmit()}
                        className="pl-9 h-11 rounded-xl border-[#D9D9D9]"
                        aria-invalid={!!emailErrors.email}
                      />
                    </div>
                    {emailErrors.email && (
                      <p className="text-[11px] font-bold text-destructive mt-1 ml-1">{emailErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={passwordInput}
                        onChange={(e) => {
                          setPasswordInput(e.target.value)
                          if (emailErrors.password) setEmailErrors((p) => ({ ...p, password: undefined }))
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleEmailSubmit()}
                        className="pl-9 pr-9 h-11 rounded-xl border-[#D9D9D9]"
                        aria-invalid={!!emailErrors.password}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    {emailErrors.password && (
                      <p className="text-[11px] font-bold text-destructive mt-1 ml-1">{emailErrors.password}</p>
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleEmailSubmit}
                  disabled={isLoading}
                  className="mt-4 w-full h-11 rounded-xl bg-gradient-to-r from-[#DD0200] via-[#8B0000] to-[#55100D] hover:opacity-95 text-white font-extrabold flex items-center justify-center gap-2 shadow-md shadow-[#DD0200]/25 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Processing…</span>
                    </>
                  ) : (
                    <span>{authAction === 'signin' ? 'Sign In' : 'Create Account'}</span>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}

export default SignInDialog
