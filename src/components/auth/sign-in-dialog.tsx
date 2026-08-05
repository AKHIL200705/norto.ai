'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  Compass, Mail, Lock, Loader2, ArrowLeft, ShieldCheck, X,
  ChevronRight, User as UserIcon, Eye, EyeOff,
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { GoogleIcon } from './google-icon'

/**
 * Sign-In dialog for LifeLens AI.
 *
 * Production note: This dialog drives a polished, fully-working simulated
 * Google OAuth account-picker flow (the "Choose an account" screen) so the
 * feature is demonstrable end-to-end without real Google Cloud credentials.
 *
 * To switch to REAL Google OAuth in production:
 *   1. Set GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET env vars.
 *   2. Wire NextAuth.js Google provider (see src/lib/auth.config.ts template).
 *   3. Replace `handleGoogleClick` below with a redirect to the NextAuth
 *      sign-in endpoint (`/api/auth/signin/google`).
 * The rest of the app (store.signIn, profile, topbar) stays unchanged.
 */

type Mode = 'choose' | 'google-picker' | 'email' | 'signing-in'
type PickerStage = 'list' | 'loading'

interface GoogleAccount {
  name: string
  email: string
  initials: string
  color: string
}

const SAMPLE_ACCOUNTS: GoogleAccount[] = [
  { name: 'Priya Sharma', email: 'priya.sharma@gmail.com', initials: 'PS', color: 'from-rose-500 to-pink-600' },
  { name: 'Arjun Reddy', email: 'arjun.reddy@gmail.com', initials: 'AR', color: 'from-emerald-500 to-teal-600' },
]

const SIGN_IN_REASONS = [
  'Save places across devices',
  'Sync your budget & chat history',
  'Get personalized AI recommendations',
  'Access saved translations offline',
]

export function SignInDialog() {
  const open = useAppStore((s) => s.signInOpen)
  const setOpen = useAppStore((s) => s.setSignInOpen)
  const signIn = useAppStore((s) => s.signIn)
  const setView = useAppStore((s) => s.setView)

  const [mode, setMode] = React.useState<Mode>('choose')
  const [pickerStage, setPickerStage] = React.useState<PickerStage>('list')
  const [otherName, setOtherName] = React.useState('')
  const [otherEmail, setOtherEmail] = React.useState('')

  // Email form state
  const [emailInput, setEmailInput] = React.useState('')
  const [passwordInput, setPasswordInput] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [emailErrors, setEmailErrors] = React.useState<{ email?: string; password?: string }>({})

  // Reset internal state whenever the dialog is (re)opened
  React.useEffect(() => {
    if (open) {
      setMode('choose')
      setPickerStage('list')
      setOtherName('')
      setOtherEmail('')
      setEmailInput('')
      setPasswordInput('')
      setShowPassword(false)
      setEmailErrors({})
    }
  }, [open])

  const completeSignIn = React.useCallback(
    (account: { name: string; email: string }, provider: 'google' | 'email') => {
      signIn(account, provider)
      const first = account.name.split(' ')[0]
      toast.success(`Signed in as ${first}`, {
        description: provider === 'google' ? 'via Google' : 'via email',
      })
      setView('dashboard')
    },
    [signIn, setView]
  )

  const handleAccountPick = (account: GoogleAccount) => {
    setPickerStage('loading')
    // Simulate the brief OAuth token-exchange round-trip
    window.setTimeout(() => {
      completeSignIn({ name: account.name, email: account.email }, 'google')
    }, 1100)
  }

  const handleOtherAccount = () => {
    if (!otherName.trim() || !otherEmail.trim()) {
      toast.error('Enter your name and Google email')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(otherEmail)) {
      toast.error('Enter a valid email address')
      return
    }
    setPickerStage('loading')
    window.setTimeout(() => {
      completeSignIn({ name: otherName.trim(), email: otherEmail.trim() }, 'google')
    }, 1100)
  }

  const handleEmailSubmit = () => {
    const errs: { email?: string; password?: string } = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)) errs.email = 'Enter a valid email'
    if (passwordInput.length < 6) errs.password = 'At least 6 characters'
    setEmailErrors(errs)
    if (Object.keys(errs).length > 0) return

    const name = emailInput
      .split('@')[0]
      .split(/[._-]/)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(' ')
    setMode('signing-in')
    window.setTimeout(() => {
      completeSignIn({ name: name || 'Explorer', email: emailInput.trim() }, 'email')
    }, 1100)
  }

  const handleGuest = () => {
    setOpen(false)
    setView('dashboard')
    toast.info('Continuing as guest', {
      description: 'Sign in anytime to sync your data',
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 overflow-hidden max-w-[420px] gap-0">
        {/* Hidden a11y titles */}
        <DialogTitle className="sr-only">Sign in to LifeLens AI</DialogTitle>
        <DialogDescription className="sr-only">
          Choose a sign-in method to access your LifeLens AI dashboard.
        </DialogDescription>

        <AnimatePresence mode="wait">
          {/* ===== CHOOSE MODE ===== */}
          {mode === 'choose' && (
            <motion.div
              key="choose"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
            >
              {/* Header band */}
              <div className="relative bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-700 px-6 pt-7 pb-10 text-white overflow-hidden">
                <div className="absolute inset-0 mesh-bg opacity-25" />
                <div className="absolute -right-10 -top-10 size-40 rounded-full bg-amber-400/20 blur-2xl" />
                <button
                  onClick={() => setOpen(false)}
                  className="absolute right-4 top-4 grid size-8 place-items-center rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors"
                  aria-label="Close"
                >
                  <X className="size-4" />
                </button>
                <div className="relative flex items-center gap-2.5">
                  <div className="size-10 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 grid place-items-center">
                    <Compass className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold leading-tight">LifeLens AI</p>
                    <p className="text-[11px] text-emerald-50/80">AI City Companion</p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="px-6 pb-6 -mt-5">
                <div className="rounded-xl bg-card border shadow-sm p-5">
                  <h2 className="text-lg font-bold text-center">Welcome back</h2>
                  <p className="text-xs text-muted-foreground text-center mt-1">
                    Sign in to sync your city data across devices
                  </p>

                  {/* Google button — official styling */}
                  <button
                    onClick={() => setMode('google-picker')}
                    className="mt-5 w-full h-11 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 hover:shadow-sm active:scale-[0.99] transition-all flex items-center justify-center gap-3 text-sm font-medium text-slate-700"
                  >
                    <GoogleIcon className="size-5" />
                    Sign in with Google
                  </button>

                  {/* Divider */}
                  <div className="flex items-center gap-3 my-4">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">or</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  {/* Email form (inline, compact) */}
                  <div className="space-y-2.5">
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
                        className="pl-9 h-10"
                        aria-invalid={!!emailErrors.email}
                      />
                    </div>
                    {emailErrors.email && (
                      <p className="text-[11px] text-destructive ml-1">{emailErrors.email}</p>
                    )}
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
                        className="pl-9 pr-9 h-10"
                        aria-invalid={!!emailErrors.password}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    {emailErrors.password && (
                      <p className="text-[11px] text-destructive ml-1">{emailErrors.password}</p>
                    )}
                  </div>

                  <Button
                    onClick={handleEmailSubmit}
                    className="mt-3 w-full h-10 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                  >
                    Continue with email
                  </Button>

                  <div className="flex items-center justify-between mt-3 text-[11px]">
                    <button className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
                      Forgot password?
                    </button>
                    <button className="text-muted-foreground hover:text-foreground hover:underline">
                      Send OTP instead
                    </button>
                  </div>
                </div>

                {/* Reasons */}
                <ul className="mt-4 grid grid-cols-2 gap-1.5">
                  {SIGN_IN_REASONS.map((r) => (
                    <li key={r} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                      <ShieldCheck className="size-3 mt-0.5 text-emerald-600 shrink-0" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={handleGuest}
                  className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-foreground hover:underline"
                >
                  Continue as guest →
                </button>
              </div>
            </motion.div>
          )}

          {/* ===== GOOGLE ACCOUNT PICKER ===== */}
          {mode === 'google-picker' && (
            <motion.div
              key="picker"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
            >
              <GoogleAccountPicker
                stage={pickerStage}
                accounts={SAMPLE_ACCOUNTS}
                onBack={() => setMode('choose')}
                onPick={handleAccountPick}
                otherName={otherName}
                otherEmail={otherEmail}
                setOtherName={setOtherName}
                setOtherEmail={setOtherEmail}
                onUseOther={() => setPickerStage('list')}
                onSubmitOther={handleOtherAccount}
              />
            </motion.div>
          )}

          {/* ===== EMAIL SIGNING-IN ===== */}
          {mode === 'signing-in' && (
            <motion.div
              key="email-signing-in"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-6 py-16 flex flex-col items-center gap-4 text-center"
            >
              <div className="size-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 grid place-items-center">
                <Loader2 className="size-6 text-white animate-spin" />
              </div>
              <div>
                <p className="font-semibold">Signing you in…</p>
                <p className="text-xs text-muted-foreground mt-1">Verifying your credentials</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}

/* ---------- Google account picker (mimics the real OAuth screen) ---------- */

interface PickerProps {
  stage: PickerStage
  accounts: GoogleAccount[]
  onBack: () => void
  onPick: (a: GoogleAccount) => void
  otherName: string
  otherEmail: string
  setOtherName: (v: string) => void
  setOtherEmail: (v: string) => void
  onUseOther: () => void
  onSubmitOther: () => void
}

function GoogleAccountPicker({
  stage, accounts, onBack, onPick,
  otherName, otherEmail, setOtherName, setOtherEmail,
  onSubmitOther,
}: PickerProps) {
  const [showOtherForm, setShowOtherForm] = React.useState(false)

  if (stage === 'loading') {
    return (
      <div className="px-6 py-16 flex flex-col items-center gap-4 text-center">
        <div className="size-12 grid place-items-center">
          <GoogleIcon className="size-10" />
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Loader2 className="size-4 animate-spin" />
          <span className="text-sm font-medium">Signing in…</span>
        </div>
        <p className="text-[11px] text-slate-400">Redirecting back to LifeLens AI</p>
      </div>
    )
  }

  return (
    <div className="min-h-[440px] flex flex-col">
      {/* Google-style header */}
      <div className="px-6 pt-7 pb-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 mb-4"
        >
          <ArrowLeft className="size-3.5" />
          Back
        </button>
        <div className="flex items-center gap-2 mb-1">
          <GoogleIcon className="size-6" />
          <span className="text-sm font-medium text-slate-500">Sign in with Google</span>
        </div>
        <h2 className="text-xl font-semibold text-slate-800">Choose an account</h2>
        <p className="text-xs text-slate-500 mt-1">
          to continue to <span className="font-medium text-slate-700">LifeLens AI</span>
        </p>
      </div>

      {/* Account list */}
      <div className="px-2 py-2 flex-1">
        {accounts.map((a) => (
          <button
            key={a.email}
            onClick={() => onPick(a)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors text-left group"
          >
            <div className={cn(
              'size-9 rounded-full bg-gradient-to-br grid place-items-center text-white text-xs font-semibold shrink-0',
              a.color
            )}>
              {a.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{a.name}</p>
              <p className="text-xs text-slate-500 truncate">{a.email}</p>
            </div>
            <ChevronRight className="size-4 text-slate-300 group-hover:text-slate-500" />
          </button>
        ))}

        {/* Use another account */}
        {!showOtherForm ? (
          <button
            onClick={() => setShowOtherForm(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors text-left"
          >
            <div className="size-9 rounded-full border-2 border-slate-300 grid place-items-center shrink-0">
              <UserIcon className="size-4 text-slate-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-800">Use another account</p>
            </div>
          </button>
        ) : (
          <div className="px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5 mt-1">
            <div className="relative">
              <Input
                placeholder="Full name"
                value={otherName}
                onChange={(e) => setOtherName(e.target.value)}
                className="h-9 bg-white"
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="you@gmail.com"
                value={otherEmail}
                onChange={(e) => setOtherEmail(e.target.value)}
                className="pl-9 h-9 bg-white"
              />
            </div>
            <Button
              onClick={onSubmitOther}
              size="sm"
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            >
              Continue
            </Button>
          </div>
        )}
      </div>

      {/* Footer (Google-style) */}
      <div className="px-6 py-3 border-t bg-slate-50/60 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
          <ShieldCheck className="size-3" />
          <span>Secure OAuth 2.0</span>
        </div>
        <p className="text-[10px] text-slate-400">
          Powered by Google
        </p>
      </div>
    </div>
  )
}

export default SignInDialog
