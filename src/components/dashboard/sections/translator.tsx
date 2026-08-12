'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  ArrowLeftRight, Copy, Loader2, Languages, Mic, MicOff, Plus,
  Trash2, Camera, Volume2, Check, Bookmark, Sparkles, MessageSquare, VolumeX,
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { LANGUAGES, SOURCE_LANGUAGES, PHRASE_BOOK } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

async function api(path: string, opts: { method?: string; body?: unknown } = {}) {
  const res = await fetch(path, {
    method: opts.method || 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  })
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Request failed')
  return res.json()
}

interface SavedPhrase {
  id: string
  source: string
  translation: string
  transliteration?: string
  from: string
  to: string
  createdAt: string
}

const STORAGE_KEY = 'norto-saved-phrases'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
}

export function Translator() {
  const setSection = useAppStore((s) => s.setSection)
  const [from, setFrom] = React.useState('Auto Detect')
  const [to, setTo] = React.useState('Telugu')
  const [source, setSource] = React.useState('')
  const [translation, setTranslation] = React.useState('')
  const [transliteration, setTransliteration] = React.useState('')
  const [detectedLanguage, setDetectedLanguage] = React.useState('')
  const [provider, setProvider] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const [saved, setSaved] = React.useState<SavedPhrase[]>([])

  // Voice
  const [listening, setListening] = React.useState(false)
  const [voiceSupported, setVoiceSupported] = React.useState(false)
  const recognitionRef = React.useRef<any>(null)

  React.useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setVoiceSupported(true)
    }
  }, [])

  // Load saved phrases from localStorage & check for OCR prefill
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setSaved(JSON.parse(raw))
    } catch {
      // ignore
    }
    try {
      const prefillRaw = localStorage.getItem('norto-translator-prefill')
      if (prefillRaw) {
        localStorage.removeItem('norto-translator-prefill')
        const data = JSON.parse(prefillRaw)
        if (data.text) setSource(data.text)
        if (data.to) setTo(data.to)
      }
    } catch {
      // ignore
    }
  }, [])

  const persistSaved = (next: SavedPhrase[]) => {
    setSaved(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // ignore
    }
  }

  const doTranslate = React.useCallback(async (text: string, fromLang: string, toLang: string) => {
    if (!text.trim()) {
      setTranslation('')
      setTransliteration('')
      setDetectedLanguage('')
      setProvider('')
      return
    }
    setLoading(true)
    try {
      const json = await api('/api/ai/translate', { body: { text, from: fromLang, to: toLang } })
      setTranslation(json.translation || '')
      setTransliteration(json.transliteration || '')
      setDetectedLanguage(json.detectedLanguage || '')
      setProvider(json.provider || '')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Translation failed')
      setTranslation('')
      setTransliteration('')
      setDetectedLanguage('')
      setProvider('')
    } finally {
      setLoading(false)
    }
  }, [])

  // Live real-time translation as user types
  React.useEffect(() => {
    if (!source.trim()) {
      setTranslation('')
      setTransliteration('')
      setDetectedLanguage('')
      setProvider('')
      return
    }
    const timer = setTimeout(() => {
      doTranslate(source, from, to)
    }, 400)
    return () => clearTimeout(timer)
  }, [source, from, to, doTranslate])

  const handleSwap = () => {
    const nextFrom = from === 'Auto Detect' ? (detectedLanguage && detectedLanguage !== 'Auto Detect' ? detectedLanguage : to) : to
    const nextTo = from === 'Auto Detect' ? 'English' : from
    setFrom(nextFrom)
    setTo(nextTo)
    setSource(translation)
    setTranslation(source)
    setTransliteration('')
  }

  const handleCopy = async () => {
    if (!translation) return
    try {
      const copyText = transliteration ? `${translation}\n(${transliteration})` : translation
      await navigator.clipboard.writeText(copyText)
      setCopied(true)
      toast.success('Copied translation to clipboard')
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error('Copy failed')
    }
  }

  const handleSpeak = (text: string, lang: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text) return
    try {
      const u = new SpeechSynthesisUtterance(text)
      const langMap: Record<string, string> = {
        Hindi: 'hi-IN',
        Telugu: 'te-IN',
        Tamil: 'ta-IN',
        Kannada: 'kn-IN',
        Malayalam: 'ml-IN',
        Marathi: 'mr-IN',
        Gujarati: 'gu-IN',
        Bengali: 'bn-IN',
        Punjabi: 'pa-IN',
        Urdu: 'ur-IN',
        Odia: 'or-IN',
        English: 'en-IN',
      }
      u.lang = langMap[lang] || 'en-IN'
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(u)
    } catch {
      toast.error('Speech synthesis not available on this browser')
    }
  }

  const handlePhrase = (p: { en: string }) => {
    setSource(p.en)
    doTranslate(p.en, from, to)
  }

  const handleSavePhrase = () => {
    if (!source.trim() || !translation.trim()) {
      toast.error('Nothing to save yet')
      return
    }
    const entry: SavedPhrase = {
      id: crypto.randomUUID(),
      source,
      translation,
      transliteration,
      from: from === 'Auto Detect' && detectedLanguage ? detectedLanguage : from,
      to,
      createdAt: new Date().toISOString(),
    }
    persistSaved([entry, ...saved])
    toast.success('Saved to phrases')
  }

  const removeSaved = (id: string) => {
    persistSaved(saved.filter((s) => s.id !== id))
  }

  const startListening = () => {
    if (!voiceSupported) {
      toast.error('Voice input not supported on this browser')
      return
    }
    try {
      const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      const rec = new SR()
      const langMap: Record<string, string> = {
        English: 'en-IN',
        Hindi: 'hi-IN',
        Telugu: 'te-IN',
        Tamil: 'ta-IN',
        Kannada: 'kn-IN',
        Malayalam: 'ml-IN',
        Marathi: 'mr-IN',
        Gujarati: 'gu-IN',
        Bengali: 'bn-IN',
        Punjabi: 'pa-IN',
        Urdu: 'ur-IN',
      }
      rec.lang = langMap[from] || 'en-IN'
      rec.interimResults = false
      rec.maxAlternatives = 1
      rec.onstart = () => setListening(true)
      rec.onresult = (e: any) => {
        const text = e.results[0]?.[0]?.transcript || ''
        setSource(text)
        setListening(false)
        doTranslate(text, from, to)
      }
      rec.onerror = () => {
        setListening(false)
        toast.error('Voice input error')
      }
      rec.onend = () => setListening(false)
      recognitionRef.current = rec
      rec.start()
    } catch {
      toast.error('Failed to start voice input')
    }
  }

  const stopListening = () => {
    try {
      recognitionRef.current?.stop()
    } catch {
      // ignore
    }
    setListening(false)
  }

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-6">
        {/* Header */}
        <motion.div variants={item}>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Languages className="size-3.5 text-emerald-600" />
            <span>High-Precision AI Translation across 10+ Indian Languages</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">AI Multi-Lingual Translator</h1>
        </motion.div>

        <Tabs defaultValue="text" className="w-full">
          <motion.div variants={item}>
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="text"><MessageSquare className="size-3.5 mr-1.5" />Text</TabsTrigger>
              <TabsTrigger value="voice"><Mic className="size-3.5 mr-1.5" />Voice</TabsTrigger>
              <TabsTrigger value="saved"><Bookmark className="size-3.5 mr-1.5" />Saved</TabsTrigger>
            </TabsList>
          </motion.div>

          {/* Text + Voice share the translator UI */}
          <TabsContent value="text" className="mt-4 space-y-4">
            <TranslatorCard
              from={from} to={to} setFrom={setFrom} setTo={setTo}
              source={source} setSource={setSource}
              translation={translation} transliteration={transliteration}
              detectedLanguage={detectedLanguage} provider={provider} loading={loading}
              onSwap={handleSwap} onTranslate={() => doTranslate(source, from, to)}
              onCopy={handleCopy} copied={copied}
              onSpeak={handleSpeak} onSave={handleSavePhrase}
              voiceSlot={null}
            />
            <PhraseBook onPick={handlePhrase} />
            <OcrHintCard onClick={() => setSection('ocr')} />
          </TabsContent>

          <TabsContent value="voice" className="mt-4 space-y-4">
            <TranslatorCard
              from={from} to={to} setFrom={setFrom} setTo={setTo}
              source={source} setSource={setSource}
              translation={translation} transliteration={transliteration}
              detectedLanguage={detectedLanguage} provider={provider} loading={loading}
              onSwap={handleSwap} onTranslate={() => doTranslate(source, from, to)}
              onCopy={handleCopy} copied={copied}
              onSpeak={handleSpeak} onSave={handleSavePhrase}
              voiceSlot={
                <div className="flex flex-col items-center justify-center gap-3 py-3">
                  <Button
                    type="button"
                    size="lg"
                    onClick={listening ? stopListening : startListening}
                    disabled={!voiceSupported}
                    className={cn(
                      'size-20 rounded-full p-0 shadow-lg',
                      listening
                        ? 'bg-rose-500 hover:bg-rose-600 animate-pulse'
                        : 'bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700',
                    )}
                  >
                    {listening ? <MicOff className="size-7 text-white" /> : <Mic className="size-7 text-white" />}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center max-w-xs">
                    {!voiceSupported
                      ? 'Voice input not supported on this browser. Try Chrome or Edge.'
                      : listening
                        ? `Listening in ${from}… Tap to stop.`
                        : `Tap the mic and speak in ${from}. We'll translate to ${to} automatically.`}
                  </p>
                </div>
              }
            />
            <PhraseBook onPick={handlePhrase} />
          </TabsContent>

          <TabsContent value="saved" className="mt-4">
            <SavedPhrasesTab
              phrases={saved}
              onRemove={removeSaved}
              onReuse={(p) => {
                setFrom(p.from)
                setTo(p.to)
                setSource(p.source)
                setTranslation(p.translation)
                setTransliteration(p.transliteration || '')
              }}
            />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}

function getProviderBadge(provider: string) {
  if (!provider) return null
  if (provider.startsWith('gemini_ai')) {
    return (
      <Badge variant="outline" className="text-[10px] bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30 font-semibold">
        Gemini Neural AI
      </Badge>
    )
  }
  if (provider === 'zai_ai') {
    return (
      <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30 font-semibold">
        ZAI LLM
      </Badge>
    )
  }
  if (provider === 'google_neural') {
    return (
      <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30 font-semibold">
        Google Neural
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="text-[10px] bg-muted text-muted-foreground font-semibold">
      Web Neural
    </Badge>
  )
}

function TranslatorCard({
  from, to, setFrom, setTo, source, setSource, translation, transliteration, detectedLanguage, provider, loading, onSwap, onTranslate, onCopy, copied, onSpeak, onSave, voiceSlot,
}: {
  from: string; to: string
  setFrom: (s: string) => void; setTo: (s: string) => void
  source: string; setSource: (s: string) => void
  translation: string; transliteration: string; detectedLanguage: string; provider: string
  loading: boolean
  onSwap: () => void
  onTranslate: () => void
  onCopy: () => void; copied: boolean
  onSpeak: (text: string, lang: string) => void
  onSave: () => void
  voiceSlot: React.ReactNode
}) {
  return (
    <Card className="glass-card p-5 sm:p-6 gap-0 border-[#D9D9D9]">
      {/* Language selectors */}
      <div className="flex items-end gap-3">
        <div className="flex-1 space-y-1.5">
          <Label className="text-xs text-muted-foreground font-semibold flex items-center justify-between">
            <span>From</span>
            {from === 'Auto Detect' && detectedLanguage && (
              <span className="text-[10px] text-emerald-600 font-bold">
                Detected: {detectedLanguage}
              </span>
            )}
          </Label>
          <Select value={from} onValueChange={setFrom}>
            <SelectTrigger className="w-full border-[#D9D9D9]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {SOURCE_LANGUAGES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={onSwap}
          className="shrink-0 mb-0.5 rounded-full border-[#D9D9D9]"
          aria-label="Swap languages"
        >
          <ArrowLeftRight className="size-4 text-[#DD0200]" />
        </Button>
        <div className="flex-1 space-y-1.5">
          <Label className="text-xs text-muted-foreground font-semibold">To</Label>
          <Select value={to} onValueChange={setTo}>
            <SelectTrigger className="w-full border-[#D9D9D9]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {voiceSlot && <div className="mt-4">{voiceSlot}</div>}

      {/* Source + Translation panels */}
      <div className="mt-4 grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground font-semibold">
              Source ({from === 'Auto Detect' && detectedLanguage ? `Auto: ${detectedLanguage}` : from})
            </Label>
            <span className="text-[10px] text-muted-foreground font-bold">{source.length} chars</span>
          </div>
          <Textarea
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder={`Type text to translate from ${from}…`}
            rows={6}
            className="resize-none font-medium border-[#D9D9D9]"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground font-semibold">Translation ({to})</Label>
              {getProviderBadge(provider)}
            </div>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onSpeak(translation, to)}
                disabled={!translation}
                title="Listen to translation"
                className="h-7 px-2 text-xs"
              >
                <Volume2 className="size-3.5 text-[#DD0200]" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onCopy}
                disabled={!translation}
                title="Copy translation & phonetics"
                className="h-7 px-2 text-xs"
              >
                {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
              </Button>
            </div>
          </div>
          <div className="min-h-[148px] rounded-xl border border-[#DD0200]/30 bg-[#DD0200]/5 p-4 text-base backdrop-blur-md flex flex-col justify-between">
            {loading ? (
              <div className="flex items-center gap-2 text-[#DD0200] font-bold my-auto">
                <Loader2 className="size-4 animate-spin" />
                Generating high-accuracy translation…
              </div>
            ) : translation ? (
              <div className="space-y-3">
                <p className="text-base sm:text-lg font-extrabold text-foreground leading-relaxed whitespace-pre-wrap">{translation}</p>
              </div>
            ) : (
              <p className="text-muted-foreground/70 italic text-sm my-auto">Translation will appear here…</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button onClick={onTranslate} disabled={loading || !source.trim()}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Languages className="size-4" />}
          Translate
        </Button>
        <Button variant="outline" onClick={onSave} disabled={!translation}>
          <Plus className="size-4" />
          Save phrase
        </Button>
      </div>
    </Card>
  )
}

function PhraseBook({ onPick }: { onPick: (p: { en: string; category: string }) => void }) {
  return (
    <Card className="glass-card p-5 sm:p-6 gap-0 border-[#D9D9D9]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-extrabold text-sm sm:text-base flex items-center gap-2">
          <Sparkles className="size-4 text-[#DD0200]" />
          Quick phrase book
        </h3>
        <span className="text-xs text-muted-foreground font-bold">{PHRASE_BOOK.length} phrases</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {PHRASE_BOOK.map((p, i) => (
          <motion.button
            key={i}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onPick(p)}
            className="text-left p-3 rounded-xl border border-[#D9D9D9] bg-card hover:border-[#DD0200] hover:bg-[#DD0200]/5 transition-all shadow-xs"
          >
            <Badge variant="secondary" className="text-[9px] mb-1.5 bg-[#DD0200]/15 text-[#DD0200] border-0 font-bold">
              {p.category}
            </Badge>
            <p className="text-xs font-semibold leading-snug">{p.en}</p>
          </motion.button>
        ))}
      </div>
    </Card>
  )
}

function OcrHintCard({ onClick }: { onClick: () => void }) {
  return (
    <Card className="glass-card p-5 sm:p-6 gap-0 border-[#DD0200]/30 bg-gradient-to-br from-[#DD0200]/5 to-transparent">
      <div className="flex items-center gap-4">
        <div className="size-11 rounded-xl bg-gradient-to-br from-[#DD0200] via-[#8B0000] to-[#55100D] flex items-center justify-center shadow-md shrink-0">
          <Camera className="size-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-extrabold text-sm">Scan a sign, menu, or document</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Use your camera to capture text — our OCR will transcribe and translate it for you.</p>
        </div>
        <Button variant="outline" size="sm" onClick={onClick} className="shrink-0 font-bold">
          Open OCR
          <ArrowLeftRight className="size-3.5" />
        </Button>
      </div>
    </Card>
  )
}

function SavedPhrasesTab({
  phrases, onRemove, onReuse,
}: {
  phrases: SavedPhrase[]
  onRemove: (id: string) => void
  onReuse: (p: SavedPhrase) => void
}) {
  if (phrases.length === 0) {
    return (
      <Card className="p-10 flex flex-col items-center text-center gap-3">
        <div className="size-14 rounded-full bg-muted/60 flex items-center justify-center">
          <Bookmark className="size-6 text-muted-foreground" />
        </div>
        <h3 className="font-semibold">No saved phrases yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm">Translate something on the Text or Voice tab and tap &quot;Save phrase&quot; to keep it here for quick access.</p>
      </Card>
    )
  }
  return (
    <div className="flex flex-col gap-3">
      {phrases.map((p) => (
        <Card key={p.id} className="p-4 sm:p-5 gap-0 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-0">
                  {p.from} → {p.to}
                </Badge>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(p.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-sm font-medium leading-snug">{p.source}</p>
              <p className="text-sm font-semibold text-foreground mt-1 leading-snug">{p.translation}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button variant="ghost" size="sm" onClick={() => onReuse(p)} className="h-8 px-2 text-xs">
                Reuse
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onRemove(p.id)} className="size-8 text-muted-foreground hover:text-rose-600">
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
