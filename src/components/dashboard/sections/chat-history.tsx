'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import {
  History, Search, Trash2, Download, MessageSquare, ArrowRight,
  Sparkles, Calendar, Bot, User as UserIcon, Clock, Filter, HardDrive,
} from 'lucide-react'
import { useAppStore, useChatStore } from '@/lib/store'
import type { ChatMessage, DashboardSection } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
}

export function ChatHistoryView() {
  const city = useAppStore((s) => s.city)
  const setSection = useAppStore((s) => s.setSection)
  const messagesStore = useChatStore((s) => s.messages)
  const clearSection = useChatStore((s) => s.clearSection)
  const clearAllHistory = useChatStore((s) => s.clearAllHistory)

  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all')
  const [selectedSectionKey, setSelectedSectionKey] = React.useState<string | null>(null)

  const sectionKeys = React.useMemo(() => {
    return Object.keys(messagesStore).filter((k) => (messagesStore[k] || []).length > 0)
  }, [messagesStore])

  // Select first available thread if none selected
  React.useEffect(() => {
    if (!selectedSectionKey && sectionKeys.length > 0) {
      setSelectedSectionKey(sectionKeys[0])
    }
  }, [sectionKeys, selectedSectionKey])

  const totalMessagesCount = React.useMemo(() => {
    return Object.values(messagesStore).reduce((acc, msgs) => acc + (msgs?.length || 0), 0)
  }, [messagesStore])

  const handleExportSection = (secKey: string) => {
    const msgs = messagesStore[secKey] || []
    if (msgs.length === 0) {
      toast.error('No messages to export')
      return
    }
    const formatted = msgs
      .map(
        (m) =>
          `### ${m.role === 'user' ? 'User' : 'Norto AI'} (${new Date(m.createdAt).toLocaleString('en-IN')})\n${m.content}`,
      )
      .join('\n\n---\n\n')
    const fileContent = `# Norto AI Chat History - ${secKey.toUpperCase()} (${city})\nExported: ${new Date().toLocaleString('en-IN')}\n\n${formatted}`
    const blob = new Blob([fileContent], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `norto-chat-${secKey}-${city.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Chat thread exported as Markdown!')
  }

  const handleClearThread = (secKey: string) => {
    clearSection(secKey)
    if (selectedSectionKey === secKey) {
      const remaining = sectionKeys.filter((k) => k !== secKey)
      setSelectedSectionKey(remaining[0] || null)
    }
    toast.success('Chat thread removed')
  }

  const handleClearAll = () => {
    clearAllHistory()
    setSelectedSectionKey(null)
    toast.success('All chat history cleared')
  }

  const activeMessages = React.useMemo(() => {
    if (!selectedSectionKey) return []
    const raw = messagesStore[selectedSectionKey] || []
    if (!searchQuery.trim()) return raw
    const q = searchQuery.toLowerCase().trim()
    return raw.filter((m) => m.content.toLowerCase().includes(q))
  }, [messagesStore, selectedSectionKey, searchQuery])

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-6">
        {/* Header */}
        <motion.div variants={item} className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <History className="size-3.5 text-[#DD0200]" />
              <span>Saved Conversations &amp; AI Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Saved Chat History</h1>
          </div>
          {sectionKeys.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => selectedSectionKey && handleExportSection(selectedSectionKey)}
                className="font-semibold text-foreground border-[#D9D9D9]"
              >
                <Download className="size-3.5" />
                <span>Export Selected</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="text-rose-600 border-rose-200 hover:bg-rose-50 font-semibold"
              >
                <Trash2 className="size-3.5" />
                <span>Purge All</span>
              </Button>
            </div>
          )}
        </motion.div>

        {sectionKeys.length === 0 ? (
          <motion.div variants={item}>
            <Card className="glass-card p-12 text-center flex flex-col items-center justify-center gap-4 border-[#D9D9D9]">
              <div className="size-16 rounded-2xl bg-gradient-to-br from-[#DD0200] via-[#8B0000] to-[#55100D] flex items-center justify-center shadow-lg shadow-[#DD0200]/25">
                <MessageSquare className="size-8 text-white" />
              </div>
              <div className="max-w-md space-y-1">
                <h3 className="text-lg font-extrabold">No Saved Conversations Yet</h3>
                <p className="text-sm text-muted-foreground">
                  Your questions and AI responses across Norto AI Assistant, Food Intel, and City Tools will be saved here automatically.
                </p>
              </div>
              <Button
                onClick={() => setSection('assistant')}
                className="mt-2 font-bold bg-gradient-to-r from-[#DD0200] via-[#8B0000] to-[#55100D] text-white"
              >
                <Sparkles className="size-4 mr-2" />
                Start a New AI Conversation
              </Button>
            </Card>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Sidebar list of saved chat threads */}
            <motion.div variants={item} className="space-y-4 lg:col-span-1">
              <Card className="glass-card p-4 gap-0 border-[#D9D9D9]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-extrabold text-sm flex items-center gap-2">
                    <HardDrive className="size-4 text-[#DD0200]" />
                    Conversations ({sectionKeys.length})
                  </h3>
                  <Badge variant="secondary" className="text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                    {totalMessagesCount} messages
                  </Badge>
                </div>

                {/* Search filter */}
                <div className="relative mb-3">
                  <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search in chat history…"
                    className="pl-8 text-xs border-[#D9D9D9] h-9"
                  />
                </div>

                {/* Section Threads List */}
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {sectionKeys.map((secKey) => {
                    const msgs = messagesStore[secKey] || []
                    const lastMsg = msgs[msgs.length - 1]
                    const isSelected = selectedSectionKey === secKey
                    return (
                      <button
                        key={secKey}
                        onClick={() => setSelectedSectionKey(secKey)}
                        className={cn(
                          'w-full text-left p-3 rounded-xl border transition-all relative group',
                          isSelected
                            ? 'border-[#DD0200] bg-[#DD0200]/5 ring-1 ring-[#DD0200]/30 shadow-xs'
                            : 'border-[#D9D9D9] hover:border-[#DD0200]/50 hover:bg-card/80',
                        )}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider border-[#DD0200]/30 text-[#DD0200]">
                            {secKey}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="size-3" />
                            {msgs.length} msgs
                          </span>
                        </div>
                        {lastMsg && (
                          <p className="text-xs text-foreground font-medium line-clamp-2 leading-relaxed">
                            {lastMsg.role === 'user' ? 'You: ' : 'AI: '}
                            {lastMsg.content.replace(/^#+ .*/gm, '').trim()}
                          </p>
                        )}
                      </button>
                    )
                  })}
                </div>
              </Card>
            </motion.div>

            {/* Conversation detail preview panel */}
            <motion.div variants={item} className="lg:col-span-2">
              <Card className="glass-card p-5 sm:p-6 gap-0 border-[#D9D9D9] flex flex-col h-[650px]">
                {selectedSectionKey ? (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#D9D9D9]">
                      <div className="flex items-center gap-2">
                        <div className="size-9 rounded-xl bg-gradient-to-br from-[#DD0200] to-[#55100D] flex items-center justify-center shadow-md">
                          <Bot className="size-5 text-white" />
                        </div>
                        <div>
                          <h2 className="font-extrabold text-base capitalize">{selectedSectionKey} Chat Thread</h2>
                          <p className="text-xs text-muted-foreground">Saved locally for {city}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSection(selectedSectionKey as DashboardSection)
                          }}
                          className="h-8 text-xs font-bold border-[#DD0200]/30 text-[#DD0200] hover:bg-[#DD0200]/10"
                        >
                          Continue Chat
                          <ArrowRight className="size-3.5 ml-1" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleClearThread(selectedSectionKey)}
                          className="h-8 px-2 text-xs text-muted-foreground hover:text-rose-600"
                          title="Delete thread"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Messages Scroll Panel */}
                    <div className="flex-1 overflow-y-auto py-4 space-y-4">
                      {activeMessages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                          <Search className="size-8 mb-2 text-muted-foreground/50" />
                          <p className="text-sm font-medium">No matching messages found</p>
                        </div>
                      ) : (
                        activeMessages.map((m) => {
                          const isUser = m.role === 'user'
                          return (
                            <div
                              key={m.id}
                              className={cn('flex gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}
                            >
                              <div
                                className={cn(
                                  'size-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm text-white',
                                  isUser
                                    ? 'bg-gradient-to-br from-[#55100D] to-[#1A0706]'
                                    : 'bg-gradient-to-br from-[#DD0200] to-[#55100D]',
                                )}
                              >
                                {isUser ? <UserIcon className="size-4" /> : <Bot className="size-4" />}
                              </div>
                              <div
                                className={cn(
                                  'max-w-[85%] rounded-2xl px-4 py-3 shadow-sm',
                                  isUser
                                    ? 'bg-gradient-to-br from-[#DD0200] via-[#8B0000] to-[#55100D] text-white rounded-tr-sm'
                                    : 'bg-card border border-[#D9D9D9] rounded-tl-sm text-foreground',
                                )}
                              >
                                <div className="flex items-center justify-between gap-2 mb-1 opacity-75">
                                  <span className="text-[10px] font-bold uppercase tracking-wider">
                                    {isUser ? 'You' : 'Norto AI'}
                                  </span>
                                  <span className="text-[10px]">
                                    {new Date(m.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                {isUser ? (
                                  <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{m.content}</p>
                                ) : (
                                  <div className="prose-ll text-sm">
                                    <ReactMarkdown>{m.content}</ReactMarkdown>
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <MessageSquare className="size-10 mb-2 text-muted-foreground/40" />
                    <p className="text-sm">Select a conversation thread on the left to preview history.</p>
                  </div>
                )}
              </Card>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
