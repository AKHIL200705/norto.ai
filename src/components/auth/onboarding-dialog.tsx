'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  Compass, Briefcase, Wallet, Languages, Utensils, Check, Sparkles, ArrowRight, X,
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
  const user = useAppStore((s) => s.user)
  const updateUser = useAppStore((s) => s.updateUser)

  const [occupation, setOccupation] = React.useState('Software Engineer')
  const [budget, setBudget] = React.useState(25000)
  const [language, setLanguage] = React.useState('English')
  const [foodPref, setFoodPref] = React.useState('Vegetarian')
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Sync state when dialog opens or user loads
  React.useEffect(() => {
    if (open && user) {
      const timer = setTimeout(() => {
        setOccupation(user.occupation || 'Software Engineer')
        setBudget(user.budget || 25000)
        setLanguage(user.language || 'English')
        setFoodPref(user.foodPref || 'Vegetarian')
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [open, user])

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
    })

    toast.success(`Welcome ${user?.name || 'Explorer'}! Your profile preferences have been saved. 🌿`)
    setIsSubmitting(false)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent showCloseButton={false} className="p-0 overflow-hidden max-w-[480px] gap-0 border-[#D9D9D9] rounded-3xl">
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
            {/* Header band */}
            <div className="relative bg-gradient-to-br from-[#DD0200] via-[#8B0000] to-[#55100D] px-6 pt-6 pb-8 text-white overflow-hidden">
              <div className="absolute inset-0 mesh-bg opacity-25" />
              <button
                onClick={() => setOpen(false)}
                className="absolute right-4 top-4 grid size-8 place-items-center rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
              <div className="relative flex items-center gap-3">
                <div className="size-11 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 grid place-items-center shadow-lg">
                  <Compass className="size-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xl font-extrabold leading-tight">Complete Your Profile</p>
                    <Sparkles className="size-4 text-amber-300 animate-pulse" />
                  </div>
                  <p className="text-xs text-rose-100/80 font-medium mt-0.5">
                    Help Norto personalize recommendations for you
                  </p>
                </div>
              </div>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSave} className="px-5 pb-6 -mt-3">
              <div className="rounded-2xl bg-card border border-[#D9D9D9] shadow-xl p-5 backdrop-blur-xl space-y-4">
                
                {/* 1. Occupation */}
                <div className="space-y-2">
                  <Label htmlFor="ob-occ" className="text-xs text-muted-foreground font-bold flex items-center gap-1.5">
                    <Briefcase className="size-3.5 text-[#DD0200]" />
                    <span>Occupation / Profession *</span>
                  </Label>
                  <Input
                    id="ob-occ"
                    required
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder="e.g. Software Engineer, Student, Designer..."
                    className="border-[#D9D9D9] font-medium"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {OCCUPATION_SUGGESTIONS.map((occ) => (
                      <button
                        key={occ}
                        type="button"
                        onClick={() => setOccupation(occ)}
                        className={cn(
                          'text-[11px] px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer',
                          occupation === occ
                            ? 'bg-[#DD0200]/15 text-[#DD0200] border-[#DD0200]/40'
                            : 'border-[#D9D9D9] bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground',
                        )}
                      >
                        {occ}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Monthly Budget */}
                <div className="space-y-2">
                  <Label htmlFor="ob-budget" className="text-xs text-muted-foreground font-bold flex items-center gap-1.5">
                    <Wallet className="size-3.5 text-[#DD0200]" />
                    <span>Monthly Living Budget (₹) *</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">
                      ₹
                    </span>
                    <Input
                      id="ob-budget"
                      type="number"
                      required
                      min={1000}
                      value={budget === 0 ? '' : budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                      className="pl-7 font-bold text-base border-[#D9D9D9]"
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
                          'text-[11px] px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer',
                          budget === b
                            ? 'bg-[#DD0200]/15 text-[#DD0200] border-[#DD0200]/40'
                            : 'border-[#D9D9D9] bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground',
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
                    <Label htmlFor="ob-lang" className="text-xs text-muted-foreground font-bold flex items-center gap-1.5">
                      <Languages className="size-3.5 text-[#DD0200]" />
                      <span>Preferred Language</span>
                    </Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger id="ob-lang" className="w-full border-[#D9D9D9] font-medium">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
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
                    <Label className="text-xs text-muted-foreground font-bold flex items-center gap-1.5">
                      <Utensils className="size-3.5 text-[#DD0200]" />
                      <span>Food Preference</span>
                    </Label>
                    <Select value={foodPref} onValueChange={setFoodPref}>
                      <SelectTrigger className="w-full border-[#D9D9D9] font-medium">
                        <SelectValue placeholder="Food pref" />
                      </SelectTrigger>
                      <SelectContent>
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
                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 rounded-xl bg-gradient-to-br from-[#DD0200] via-[#8B0000] to-[#55100D] hover:opacity-95 text-white font-extrabold text-sm shadow-md shadow-[#DD0200]/30 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Save &amp; Continue to Norto</span>
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
