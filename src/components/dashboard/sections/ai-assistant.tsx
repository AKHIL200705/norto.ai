'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { v4 as uuid } from 'uuid'
import ReactMarkdown from 'react-markdown'
import { toast } from 'sonner'
import {
  Sparkles, Send, Trash2, Bot, User as UserIcon, BookOpen,
  Loader2, Download, Check,
} from 'lucide-react'
import { useAppStore, useChatStore } from '@/lib/store'
import type { ChatMessage } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const SECTION = 'assistant'

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
          className="size-2 rounded-full bg-[#DD0200]"
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
          'size-8 rounded-lg flex items-center justify-center shrink-0 shadow-md',
          isUser
            ? 'bg-gradient-to-br from-[#55100D] to-[#1A0706]'
            : 'bg-gradient-to-br from-[#DD0200] to-[#55100D]'
        )}
      >
        {isUser ? <UserIcon className="size-4 text-white" /> : <Bot className="size-4 text-white" />}
      </div>
      <div
        className={cn(
          'max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-2.5 shadow-md backdrop-blur-md',
          isUser
            ? 'bg-gradient-to-br from-[#DD0200] via-[#8B0000] to-[#55100D] text-white rounded-tr-sm'
            : 'bg-card border border-[#D9D9D9]/80 rounded-tl-sm text-foreground'
        )}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{msg.content}</p>
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
        <div className="size-20 rounded-2xl bg-gradient-to-br from-[#DD0200] via-[#8B0000] to-[#55100D] flex items-center justify-center shadow-xl shadow-[#DD0200]/25 animate-float">
          <Sparkles className="size-10 text-white" />
        </div>
      </motion.div>
      <h3 className="mt-5 text-lg font-extrabold">How can I help you today?</h3>
      <p className="mt-1.5 text-sm text-muted-foreground max-w-md">
        Ask me anything about hospitals, PGs, food spots, local transport, budget, or safety in your city.
      </p>
    </div>
  )
}

const EMPTY_MESSAGES: ChatMessage[] = []

export function AiAssistant() {
  const city = useAppStore((s) => s.city)
  const messages = useChatStore((s) => s.messages[SECTION] ?? EMPTY_MESSAGES)
  const addMessage = useChatStore((s) => s.addMessage)
  const clearSection = useChatStore((s) => s.clearSection)

  const [input, setInput] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [guideLoading, setGuideLoading] = React.useState(false)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const greetedRef = React.useRef(false)

  // Inject local greeting once when no chat history exists
  React.useEffect(() => {
    if (!greetedRef.current && messages.length === 0) {
      greetedRef.current = true
      addMessage(SECTION, {
        id: uuid(),
        role: 'assistant',
        content: `Hi! I'm your **Norto** AI Assistant 🌿\n\nAsk me any question about **${city}** — accommodation, food, hospitals, bus routes, or local tips. What would you like to know?`,
        createdAt: new Date().toISOString(),
      })
    }
  }, [addMessage, city, messages.length])

  // Auto-scroll to bottom
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

  const handleExportChat = () => {
    if (messages.length === 0) {
      toast.error('No chat messages to export')
      return
    }
    const formattedText = messages
      .map(
        (m) =>
          `### ${m.role === 'user' ? 'User' : 'Norto AI'} (${new Date(m.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })})\n${m.content}`,
      )
      .join('\n\n---\n\n')
    const fileContent = `# Norto AI Assistant Chat History - ${city}\nExported on: ${new Date().toLocaleString('en-IN')}\n\n${formattedText}`
    const blob = new Blob([fileContent], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `norto-chat-${city.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Chat history downloaded!')
  }

  const handleClear = () => {
    clearSection(SECTION)
    greetedRef.current = true
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
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <div className="flex flex-col min-w-0">
        {/* Header — Glass Card */}
        <Card className="glass-card p-4 sm:p-5 gap-0 mb-4 border-[#D9D9D9]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="size-10 rounded-xl bg-gradient-to-br from-[#DD0200] via-[#8B0000] to-[#55100D] flex items-center justify-center shadow-md shadow-[#DD0200]/25 shrink-0">
                <Sparkles className="size-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg font-extrabold tracking-tight">AI Assistant</h1>
                  <Badge variant="secondary" className="gap-1 text-xs bg-[#DD0200]/15 text-[#DD0200] border-0 font-bold">
                    <span className="size-1.5 rounded-full bg-[#DD0200] animate-pulse" />
                    City Knowledge Engine
                  </Badge>
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 font-bold">
                    Auto-Saved in Browser
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Ask any question about accommodation, food, transport, or safety in <span className="font-bold text-foreground">{city}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateGuide}
                disabled={guideLoading || loading}
                className="hidden sm:inline-flex border-[#DD0200]/30 text-[#DD0200] hover:bg-[#DD0200]/10 font-bold"
              >
                {guideLoading ? <Loader2 className="size-3.5 animate-spin" /> : <BookOpen className="size-3.5" />}
                <span>Relocation Guide</span>
              </Button>
              {messages.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportChat}
                    className="text-foreground hover:bg-muted font-semibold"
                    title="Export & Save Chat as Markdown"
                  >
                    <Download className="size-3.5" />
                    <span className="hidden sm:inline">Save Chat</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClear}
                    className="text-muted-foreground hover:text-[#DD0200] hover:bg-[#DD0200]/10 font-medium"
                    aria-label="Clear chat history"
                  >
                    <Trash2 className="size-3.5" />
                    <span className="hidden sm:inline">Clear</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Chat Card — Glass UI */}
        <Card className="glass-card flex flex-col h-[560px] sm:h-[620px] p-0 gap-0 overflow-hidden border-[#D9D9D9]">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {messages.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-4">
                <AnimatePresence initial={false}>
                  {messages.map((m) => (
                    <MessageBubble key={m.id} msg={m} />
                  ))}
                </AnimatePresence>
                {loading && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                    <div className="size-8 rounded-lg bg-gradient-to-br from-[#DD0200] to-[#55100D] flex items-center justify-center shrink-0 shadow-md">
                      <Bot className="size-4 text-white" />
                    </div>
                    <div className="bg-card border border-[#D9D9D9] rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                      <TypingDots />
                    </div>
                  </motion.div>
                )}
                {guideLoading && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                    <div className="size-8 rounded-lg bg-gradient-to-br from-[#55100D] to-[#1A0706] flex items-center justify-center shrink-0 shadow-md">
                      <BookOpen className="size-4 text-white" />
                    </div>
                    <div className="bg-card border border-[#D9D9D9] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2 shadow-sm">
                      <Loader2 className="size-4 animate-spin text-[#DD0200]" />
                      <span className="text-xs text-muted-foreground font-medium">Drafting your relocation guide...</span>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* Input bar — Glass styling */}
          <div className="border-t border-[#D9D9D9] p-3 sm:p-4 bg-background/80 backdrop-blur-md">
            <div className="flex items-end gap-2 rounded-2xl border border-[#D9D9D9] bg-card focus-within:ring-2 focus-within:ring-[#DD0200]/30 focus-within:border-[#DD0200] transition-all p-1.5 shadow-sm">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder={`Ask about ${city}...`}
                disabled={loading || guideLoading}
                className="flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50 max-h-40 font-medium"
              />
              <Button
                onClick={() => void send(input)}
                disabled={!input.trim() || loading || guideLoading}
                size="icon"
                className="rounded-xl bg-gradient-to-br from-[#DD0200] via-[#8B0000] to-[#55100D] hover:opacity-95 text-white shrink-0 h-9 w-9 shadow-md shadow-[#DD0200]/30"
                aria-label="Send message"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5 px-1 font-medium">
              Press <kbd className="font-mono">Enter</kbd> to send · <kbd className="font-mono">Shift+Enter</kbd> for newline
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
