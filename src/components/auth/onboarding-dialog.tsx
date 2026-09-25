'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  Compass, Briefcase, Wallet, Languages, Utensils, Sparkles, ArrowRight, X,
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { LANGUAGES } from '@/lib/types'
import {
  Dialog, DialogContent, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const OCCUPATION_SUGGESTIONS = [
  'Software Engineer',
  'Student',
  'Designer',
  'Consultant',
  'Entrepreneur',
  'Healthcare Professional',
  'Freelancer',
]

const BUDGET_PRESETS = [15000, 25000, 40000, 60000, 100000]

const FOOD_PREFERENCES = [
  { id: 'Vegetarian', label: 'Vegetarian', icon: '🥗' },
  { id: 'Non-Vegetarian', label: 'Non-Veg', icon: '🍗' },
  { id: 'Eggetarian', label: 'Eggetarian', icon: '🥚' },
  { id: 'Vegan', label: 'Vegan', icon: '🥑' },
  { id: 'Jain', label: 'Jain', icon: '🌿' },
]

export function OnboardingDialog() {
  const open = useAppStore((s) => s.onboardingOpen)
  const setOpen = useAppStore((s) => s.setOnboardingOpen)
  const isAuth = useAppStore((s) => s.isAuthenticated)
  const user = useAppStore((s) => s.user)
  const updateUser = useAppStore((s) => s.updateUser)

  const [occupation, setOccupation] = React.useState('Software Engineer')
  const [budget, setBudget] = React.useState(25000)
  const [language, setLanguage] = React.useState('English')
  const [foodPref, setFoodPref] = React.useState('Vegetarian')
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (!isAuth) {
      setOpen(false)
      return
    }
    if (open && user) {
      if (user.hasCompletedOnboarding) {
        setOpen(false)
        return
      }
      const timer = setTimeout(() => {
        setOccupation(user.occupation || 'Software Engineer')
        setBudget(user.budget || 25000)
        setLanguage(user.language || 'English')
        setFoodPref(user.foodPref || 'Vegetarian')
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [open, isAuth, user, setOpen])

  const handleClose = () => {
    if (user) {
      updateUser({ hasCompletedOnboarding: true })
    }
    setOpen(false)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!occupation.trim()) {
      toast.error('Please enter or select your occupation')
      return
    }
    if (budget <= 0) {
      toast.error('Please enter a valid monthly budget')
      return
    }

    setIsSubmitting(true)

    updateUser({
      occupation: occupation.trim(),
      budget: Number(budget) || 25000,
      language,
      foodPref,
      hasCompletedOnboarding: true,
    })

    toast.success(`Welcome ${user?.name || 'Explorer'}! Your profile preferences have been saved. 🌿`)
    setIsSubmitting(false)
    setOpen(false)
  }

  const isOpen = Boolean(open && isAuth && !user?.hasCompletedOnboarding)

  return (
    <Dialog open={isOpen} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(v); }}>
      <DialogContent showCloseButton={false} className="p-0 overflow-hidden max-w-[500px] gap-0 border-0 bg-[#e0e5ec] dark:bg-[#1e2227] neu-floating rounded-2xl">
        <DialogTitle className="sr-only">Complete Your Profile</DialogTitle>
        <DialogDescription className="sr-only">
          Set up your occupation, monthly budget, preferred language, and food preference for Norto.
        </DialogDescription>

        <AnimatePresence mode="wait">
          <motion.div
            key="onboarding-content"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
          >
            {/* Dark industrial header band */}
            <div className="relative bg-[#2d3436] px-6 pt-6 pb-8 text-white neu-sharp">
              <button
                onClick={handleClose}
                className="absolute right-4 top-4 grid size-8 place-items-center rounded-md bg-[#ff4757]/20 hover:bg-[#ff4757] text-white transition-all cursor-pointer border-0"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
              <div className="relative flex items-center gap-3">
                <div className="size-12 rounded-xl bg-[#15181c] neu-recessed grid place-items-center">
                  <Compass className="size-6 text-[#ff4757]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-extrabold leading-tight font-mono">USER_PROFILE_SETUP</p>
                    <Sparkles className="size-4 text-[#ff4757] animate-pulse" />
                  </div>
                  <p className="text-xs text-[#a0aec0] font-mono mt-0.5">
                    // CONFIG_PARAMETRIC_PREFERENCES
                  </p>
                </div>
              </div>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSave} className="p-6 space-y-5 font-mono">
              <div className="rounded-xl bg-[#e0e5ec] dark:bg-[#1e2227] neu-recessed p-5 space-y-4">
                
                {/* 1. Occupation */}
                <div className="space-y-2">
                  <Label htmlFor="ob-occ" className="text-xs text-[#4a5568] font-bold uppercase flex items-center gap-1.5">
                    <Briefcase className="size-3.5 text-[#ff4757]" />
                    <span>1. OCCUPATION / PROFESSION *</span>
                  </Label>
                  <Input
                    id="ob-occ"
                    required
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder="Software Engineer"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {OCCUPATION_SUGGESTIONS.map((occ) => (
                      <button
                        key={occ}
                        type="button"
                        onClick={() => setOccupation(occ)}
                        className={cn(
                          'text-[11px] px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer border-0',
                          occupation === occ
                            ? 'neu-button-primary text-white'
                            : 'bg-[#e0e5ec] dark:bg-[#1e2227] neu-card text-[#2d3436] dark:text-[#f0f2f5] hover:text-[#ff4757]',
                        )}
                      >
                        {occ}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Monthly Budget */}
                <div className="space-y-2">
                  <Label htmlFor="ob-budget" className="text-xs text-[#4a5568] font-bold uppercase flex items-center gap-1.5">
                    <Wallet className="size-3.5 text-[#ff4757]" />
                    <span>2. MONTHLY LIVING BUDGET (₹) *</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-extrabold text-[#4a5568]">
                      ₹
                    </span>
                    <Input
                      id="ob-budget"
                      type="number"
                      required
                      min={1000}
                      value={budget === 0 ? '' : budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                      className="pl-8 font-extrabold text-base"
                      placeholder="25000"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {BUDGET_PRESETS.map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setBudget(b)}
                        className={cn(
                          'text-[11px] px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer border-0',
                          budget === b
                            ? 'neu-button-primary text-white'
                            : 'bg-[#e0e5ec] dark:bg-[#1e2227] neu-card text-[#2d3436] dark:text-[#f0f2f5] hover:text-[#ff4757]',
                        )}
                      >
                        ₹{b.toLocaleString('en-IN')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Preferred Language & 4. Food Preference side by side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  
                  {/* Preferred Language */}
                  <div className="space-y-2">
                    <Label htmlFor="ob-lang" className="text-xs text-[#4a5568] font-bold uppercase flex items-center gap-1.5">
                      <Languages className="size-3.5 text-[#ff4757]" />
                      <span>3. LANGUAGE</span>
                    </Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger id="ob-lang" className="w-full h-11 rounded-md bg-[#e0e5ec] dark:bg-[#15181c] neu-recessed border-0 font-bold text-[#2d3436] dark:text-[#f0f2f5]">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#e0e5ec] dark:bg-[#1e2227] neu-floating rounded-lg border-0 font-mono">
                        {LANGUAGES.map((lang) => (
                          <SelectItem key={lang} value={lang}>
                            {lang}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Food Preference */}
                  <div className="space-y-2">
                    <Label className="text-xs text-[#4a5568] font-bold uppercase flex items-center gap-1.5">
                      <Utensils className="size-3.5 text-[#ff4757]" />
                      <span>4. DIETARY</span>
                    </Label>
                    <Select value={foodPref} onValueChange={setFoodPref}>
                      <SelectTrigger className="w-full h-11 rounded-md bg-[#e0e5ec] dark:bg-[#15181c] neu-recessed border-0 font-bold text-[#2d3436] dark:text-[#f0f2f5]">
                        <SelectValue placeholder="Food pref" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#e0e5ec] dark:bg-[#1e2227] neu-floating rounded-lg border-0 font-mono">
                        {FOOD_PREFERENCES.map((f) => (
                          <SelectItem key={f.id} value={f.id}>
                            <span className="mr-1.5">{f.icon}</span>
                            {f.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-3">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 rounded-lg neu-button-primary text-white font-mono font-bold text-xs flex items-center justify-center gap-2 cursor-pointer border-0"
                  >
                    <span>SAVE_CONFIGURATION</span>
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>
            </form>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}

export default OnboardingDialog
