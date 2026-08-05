'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { v4 as uuid } from 'uuid'
import ReactMarkdown from 'react-markdown'
import { toast } from 'sonner'
import {
  Sparkles, Send, Trash2, Bot, User as UserIcon, BookOpen,
  Loader2, MessageSquareText, Lightbulb, ArrowRight,
} from 'lucide-react'
import { useAppStore, useChatStore } from '@/lib/store'
import type { ChatMessage } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const SECTION = 'assistant'

const SUGGESTED_PROMPTS = [
  "I'm moving to Hyderabad",
  "Find a PG near Hitech City under ₹8000",
  "Suggest vegetarian restaurants",
  "How safe is the city at night?",
  "Show nearby hospitals",
  "Local Telugu phrases I should know",
  "Best metro route from Madhapur to LB Nagar",
  "Monthly budget for a student here?",
  "Weekend places to visit",
  "How to get a local SIM card?",
]

async function api(path: string, opts: { method?: string; body?: any } = {}) {
  const res = await fetch(path, {
    method: opts.method || 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  })
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Request failed')
  return res.json()
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-2 rounded-full bg-emerald-500"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
      className={cn('flex gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      <div
        className={cn(
          'size-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm',
          isUser
            ? 'bg-gradient-to-br from-amber-500 to-orange-600'
            : 'bg-gradient-to-br from-emerald-500 to-teal-600'
        )}
      >
        {isUser ? <UserIcon className="size-4 text-white" /> : <Bot className="size-4 text-white" />}
      </div>
      <div
        className={cn(
          'max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-2.5',
          isUser
            ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-tr-sm'
            : 'bg-card border rounded-tl-sm'
        )}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
        ) : (
          <div className="prose-ll text-sm">
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </motion.div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <div className="size-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/25 animate-float">
          <Sparkles className="size-10 text-white" />
        </div>
        <div className="absolute -top-2 -right-2 size-6 rounded-full bg-amber-400 flex items-center justify-center shadow-md">
          <span className="text-[10px]">✨</span>
        </div>
      </motion.div>
      <h3 className="mt-5 text-lg font-semibold">Ask me anything about your new city</h3>
      <p className="mt-1.5 text-sm text-muted-foreground max-w-md">
        From finding a PG to translating Telugu phrases — your AI city companion is ready. Try a suggested prompt to get started.
      </p>
    </div>
  )
}

export function AiAssistant() {
  const city = useAppStore((s) => s.city)
  const messages = useChatStore((s) => s.messages[SECTION] || [])
  const addMessage = useChatStore((s) => s.addMessage)
  const clearSection = useChatStore((s) => s.clearSection)

  const [input, setInput] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [guideLoading, setGuideLoading] = React.useState(false)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const greetedRef = React.useRef(false)

  // Inject a local greeting once on first mount when no history exists
  React.useEffect(() => {
    if (!greetedRef.current && messages.length === 0) {
      greetedRef.current = true
      addMessage(SECTION, {
        id: uuid(),
        role: 'assistant',
        content: `Hi! I'm your **Norto** assistant 🌿\n\nI can help you settle into ${city} with ease — ask me about **accommodation**, **food**, **transport**, **budget**, **safety**, or **local language phrases**.\n\nWhat would you like to explore first?`,
        createdAt: new Date().toISOString(),
      })
    }
  }, [addMessage, city, messages.length])

  // Auto-scroll to bottom on new message
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading, guideLoading])

  // Auto-grow textarea
  React.useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }, [input])

  const buildHistory = (extra: ChatMessage[] = []) => {
    const all = [...messages, ...extra]
    return all
      .slice(-8)
      .map((m) => ({ role: m.role, content: m.content }))
  }

  const send = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return
    const userMsg: ChatMessage = {
      id: uuid(),
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    }
    addMessage(SECTION, userMsg)
    setInput('')
    setLoading(true)
    try {
      const data = await api('/api/ai/chat', {
        body: { message: trimmed, city, history: buildHistory([userMsg]) },
      })
      addMessage(SECTION, {
        id: uuid(),
        role: 'assistant',
        content: data.response || 'Sorry, I could not generate a response. Please try again.',
        createdAt: new Date().toISOString(),
      })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to get AI response')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void send(input)
    }
  }

  const handleClear = () => {
    clearSection(SECTION)
    greetedRef.current = true // prevent greeting re-injection
    toast.success('Chat cleared')
  }

  const handleGenerateGuide = async () => {
    if (guideLoading) return
    setGuideLoading(true)
    addMessage(SECTION, {
      id: uuid(),
      role: 'user',
      content: 'Generate a full relocation guide for me, please.',
      createdAt: new Date().toISOString(),
    })
    try {
      const data = await api('/api/ai/relocation', {
        body: { city, budget: 25000 },
      })
      addMessage(SECTION, {
        id: uuid(),
        role: 'assistant',
        content: data.guide || 'Sorry, I could not generate a relocation guide right now.',
        createdAt: new Date().toISOString(),
      })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate guide')
    } finally {
      setGuideLoading(false)
    }
  }

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-[1fr_300px] gap-4 lg:gap-6">
        {/* Chat column */}
        <div className="flex flex-col min-w-0 order-2 lg:order-1">
          {/* Header */}
          <Card className="p-4 sm:p-5 gap-0 mb-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="size-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shrink-0">
                  <Sparkles className="size-5 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="font-semibold tracking-tight">AI Assistant</h1>
                    <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-0">
                      <span className="size-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
                      Online
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Relocation expert for <span className="font-medium text-foreground">{city}</span>
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10"
                disabled={messages.length === 0}
              >
                <Trash2 className="size-4" />
                <span className="hidden sm:inline">Clear</span>
              </Button>
            </div>

            {/* Generate full guide CTA */}
            <div className="mt-4 rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-amber-400/5 p-3 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="size-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
                  <BookOpen className="size-4 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">Generate Full Relocation Guide</p>
                  <p className="text-[11px] text-muted-foreground">A complete Markdown plan for {city} on a ₹25,000 budget</p>
                </div>
              </div>
              <Button
                onClick={handleGenerateGuide}
                disabled={guideLoading}
                size="sm"
                className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md shrink-0"
              >
                {guideLoading ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <BookOpen className="size-3.5" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Chat area */}
          <Card className="flex flex-col flex-1 min-h-0 p-0 gap-0 overflow-hidden">
            <div
              ref={scrollRef}
              className="flex-1 min-h-0 max-h-[58vh] overflow-y-auto p-4 sm:p-5"
            >
              {messages.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="flex flex-col gap-4">
                  <AnimatePresence initial={false}>
                    {messages.map((m) => (
                      <MessageBubble key={m.id} msg={m} />
                    ))}
                  </AnimatePresence>
                  {loading && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                      <div className="size-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
                        <Bot className="size-4 text-white" />
                      </div>
                      <div className="bg-card border rounded-2xl rounded-tl-sm px-4 py-3">
                        <TypingDots />
                      </div>
                    </motion.div>
                  )}
                  {guideLoading && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                      <div className="size-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0">
                        <BookOpen className="size-4 text-white" />
                      </div>
                      <div className="bg-card border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                        <Loader2 className="size-4 animate-spin text-amber-500" />
                        <span className="text-xs text-muted-foreground">Drafting your relocation guide...</span>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile suggested prompts (horizontal chips) */}
            <div className="lg:hidden border-t bg-muted/30 px-3 py-2 overflow-x-auto flex gap-2">
              {SUGGESTED_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => void send(p)}
                  disabled={loading || guideLoading}
                  className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-full bg-background border hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-colors disabled:opacity-50"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Input bar */}
            <div className="border-t p-3 sm:p-4 bg-background">
              <div className="flex items-end gap-2 rounded-2xl border bg-card focus-within:ring-2 focus-within:ring-emerald-500/30 focus-within:border-emerald-500/40 transition-all p-1.5">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  placeholder={`Ask about ${city}...`}
                  disabled={loading || guideLoading}
                  className="flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50 max-h-40"
                />
                <Button
                  onClick={() => void send(input)}
                  disabled={!input.trim() || loading || guideLoading}
                  size="icon"
                  className="rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shrink-0 h-9 w-9"
                  aria-label="Send message"
                >
                  {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5 px-1">
                Press <kbd className="font-mono">Enter</kbd> to send · <kbd className="font-mono">Shift+Enter</kbd> for newline
              </p>
            </div>
          </Card>
        </div>

        {/* Suggested prompts sidebar (desktop) */}
        <div className="order-1 lg:order-2">
          <Card className="p-4 lg:sticky lg:top-20 gap-0">
            <div className="flex items-center gap-2 mb-1">
              <Lightbulb className="size-4 text-amber-500" />
              <h3 className="font-semibold text-sm">Suggested prompts</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Tap a prompt to send it instantly
            </p>
            <div className="flex flex-col gap-2">
              {SUGGESTED_PROMPTS.map((p, i) => (
                <motion.button
                  key={p}
                  onClick={() => void send(p)}
                  disabled={loading || guideLoading}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  className="group flex items-center justify-between gap-2 text-left px-3 py-2.5 rounded-xl border bg-background hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-colors disabled:opacity-50 disabled:hover:bg-background disabled:hover:border-border"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="size-6 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-xs font-medium leading-snug">{p}</span>
                  </div>
                  <ArrowRight className="size-3.5 text-muted-foreground/40 group-hover:text-emerald-600 transition-colors shrink-0" />
                </motion.button>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MessageSquareText className="size-3.5" />
                <span>{messages.length} messages in this chat</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
