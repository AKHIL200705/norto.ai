'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import {
  UploadCloud, FileImage, ScanLine, Copy, Check, Loader2,
  Trash2, Clock, Sparkles, FileText, Utensils, Map as MapIcon,
  Landmark, Camera, ImageIcon, X, Languages, ArrowRight, RefreshCw,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { LANGUAGES } from '@/lib/types'
import { useAppStore } from '@/lib/store'
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

interface RecentScan {
  id: string
  fileName: string
  preview: string
  result: string
  context: string
  targetLanguage: string
  createdAt: string
}

const STORAGE_KEY = 'norto-recent-scans'

const USE_CASES = [
  { id: 'rent', title: 'Rent Agreement', desc: 'Extract terms, dates, and amounts', icon: FileText, tint: 'from-[#DD0200] to-[#55100D]' },
  { id: 'menu', title: 'Restaurant Menu', desc: 'Translate dishes and prices', icon: Utensils, tint: 'from-[#8B0000] to-[#1A0706]' },
  { id: 'sign', title: 'Street Sign', desc: 'Translate local language signs', icon: MapIcon, tint: 'from-[#DD0200] to-[#8B0000]' },
  { id: 'form', title: 'Government Form', desc: 'Extract fields & instructions', icon: Landmark, tint: 'from-[#55100D] to-[#1A0706]' },
]

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
}

export function OcrScanner() {
  const setSection = useAppStore((s) => s.setSection)
  const [dataUrl, setDataUrl] = React.useState<string | null>(null)
  const [fileName, setFileName] = React.useState<string>('')
  const [context, setContext] = React.useState<string>('')
  const [targetLanguage, setTargetLanguage] = React.useState<string>('Telugu')
  const [loading, setLoading] = React.useState(false)
  const [retranslating, setRetranslating] = React.useState(false)
  const [progress, setProgress] = React.useState<string>('')
  const [result, setResult] = React.useState<string>('')
  const [copied, setCopied] = React.useState(false)
  const [dragging, setDragging] = React.useState(false)
  const [recents, setRecents] = React.useState<RecentScan[]>([])
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Load recents from localStorage
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setRecents(JSON.parse(raw))
    } catch {
      // ignore
    }
  }, [])

  const persistRecents = (next: RecentScan[]) => {
    setRecents(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // ignore
    }
  }

  const handleFile = (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB')
      return
    }
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = () => {
      setDataUrl(reader.result as string)
      setResult('')
    }
    reader.readAsDataURL(file)
  }

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0])
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files?.[0])
  }

  const onPick = () => {
    inputRef.current?.click()
  }

  const clearImage = () => {
    setDataUrl(null)
    setFileName('')
    setResult('')
  }

  const extract = async () => {
    if (!dataUrl) {
      toast.error('Upload an image first')
      return
    }
    setLoading(true)
    setProgress('Uploading image…')
    try {
      setProgress(`Running OCR & translating into ${targetLanguage}…`)
      let json
      try {
        json = await api('/api/ocr', {
          body: { image: dataUrl, context: context || undefined, targetLanguage },
        })
      } catch {
        json = await api('/api/ai/ocr', {
          body: { image: dataUrl, context: context || undefined, targetLanguage },
        })
      }
      const text = json.extractedText || json.result || ''
      setResult(text)
      if (text) {
        toast.success(`Text extracted & translated into ${targetLanguage}`)
        const newEntry: RecentScan = {
          id: crypto.randomUUID(),
          fileName: fileName || 'Image scan',
          preview: dataUrl,
          result: text,
          context: context || 'General',
          targetLanguage,
          createdAt: new Date().toISOString(),
        }
        persistRecents([newEntry, ...recents.slice(0, 9)])
      } else {
        toast.error('No text found in image')
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'OCR failed')
    } finally {
      setLoading(false)
      setProgress('')
    }
  }

  const handleRetranslate = async (newLang: string) => {
    setTargetLanguage(newLang)
    if (!result) return
    setRetranslating(true)
    try {
      // Extract verbatim lines or result text to re-translate via high-precision AI translation route
      const cleanSourceText = result.replace(/^#+ .*/gm, '').trim().slice(0, 2000)
      if (!cleanSourceText) return

      const json = await api('/api/ai/translate', {
        body: { text: cleanSourceText, from: 'Auto Detect', to: newLang },
      })

      const translationText = json.translation || ''

      const updatedMarkdown = `${result}

---
### 🔄 Re-translated to **${newLang}** (${json.provider || 'AI Engine'})
**Translation**:
${translationText}`

      setResult(updatedMarkdown)
      toast.success(`Re-translated to ${newLang}`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Re-translation failed')
    } finally {
      setRetranslating(false)
    }
  }

  const handleCopy = () => {
    if (!result) return
    navigator.clipboard.writeText(result)
    setCopied(true)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleOpenInTranslator = () => {
    if (!result) return
    const rawText = result.replace(/^#+ .*/gm, '').trim()
    try {
      localStorage.setItem('norto-translator-prefill', JSON.stringify({ text: rawText, to: targetLanguage }))
    } catch {
      // ignore
    }
    toast.success('Opening text in Translator…')
    setSection('translator')
  }

  const removeRecent = (id: string) => {
    persistRecents(recents.filter((r) => r.id !== id))
  }

  const reuseRecent = (r: RecentScan) => {
    setDataUrl(r.preview)
    setFileName(r.fileName)
    setContext(r.context)
    if (r.targetLanguage) setTargetLanguage(r.targetLanguage)
    setResult(r.result)
  }

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-6">
        {/* Header */}
        <motion.div variants={item}>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <ScanLine className="size-3.5 text-[#DD0200]" />
            <span className="font-semibold">Extract &amp; translate text from signs, menus, and documents in any language</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">OCR Scanner &amp; Image Translator</h1>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Upload zone */}
          <motion.div variants={item}>
            <Card className="glass-card p-5 sm:p-6 gap-0 h-full border-[#D9D9D9] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-extrabold text-sm sm:text-base">Upload image</h3>
                  <Badge variant="outline" className="text-[10px] bg-[#DD0200]/10 text-[#DD0200] border-[#DD0200]/30 font-bold">
                    AI Vision OCR
                  </Badge>
                </div>

                {/* Target Language Dropdown */}
                <div className="mb-4 p-3 rounded-xl border border-[#D9D9D9] bg-card/60 space-y-1.5">
                  <Label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                    <Languages className="size-3.5 text-[#DD0200]" />
                    Translate OCR Output To
                  </Label>
                  <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                    <SelectTrigger className="w-full border-[#D9D9D9] font-medium"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onInputChange}
                />

                {!dataUrl ? (
                  <div
                    onClick={onPick}
                    onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={onDrop}
                    className={cn(
                      'relative cursor-pointer rounded-xl border-2 border-dashed p-8 sm:p-10 flex flex-col items-center justify-center gap-3 text-center transition-all',
                      dragging
                        ? 'border-[#DD0200] bg-[#DD0200]/10 scale-[1.01]'
                        : 'border-[#D9D9D9] hover:border-[#DD0200]/60 hover:bg-[#DD0200]/5',
                    )}
                  >
                    <motion.div
                      animate={dragging ? { y: -4 } : { y: 0 }}
                      className="size-16 rounded-2xl bg-gradient-to-br from-[#DD0200] via-[#8B0000] to-[#55100D] flex items-center justify-center shadow-lg shadow-[#DD0200]/25"
                    >
                      <UploadCloud className="size-8 text-white" />
                    </motion.div>
                    <div>
                      <p className="font-medium text-sm">Drop an image here or click to upload</p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP · up to 5MB</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative rounded-xl overflow-hidden border border-border bg-muted/30">
                      <img src={dataUrl} alt={fileName || 'Selected'} className="w-full max-h-72 object-contain bg-black/5" />
                      <button
                        onClick={clearImage}
                        className="absolute top-2 right-2 size-8 rounded-full bg-background/80 backdrop-blur-md border border-border flex items-center justify-center hover:bg-background"
                        aria-label="Remove image"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <FileImage className="size-3.5" />
                      <span className="truncate flex-1">{fileName}</span>
                      <Badge variant="secondary" className="text-[10px] border-0 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold">
                        Ready
                      </Badge>
                    </div>
                    {context && (
                      <div className="text-xs text-muted-foreground bg-muted/40 rounded-md px-3 py-2">
                        Context: <span className="text-foreground font-medium">{context}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex flex-wrap gap-2">
                  <Button onClick={extract} disabled={loading || !dataUrl} className="flex-1 min-w-32">
                    {loading ? <Loader2 className="size-4 animate-spin" /> : <ScanLine className="size-4" />}
                    {loading ? 'Extracting & Translating…' : `Extract & Translate to ${targetLanguage}`}
                  </Button>
                  <Button variant="outline" onClick={onPick} disabled={loading}>
                    <Camera className="size-4" />
                    <span className="hidden sm:inline">Choose file</span>
                  </Button>
                </div>

                {loading && progress && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="size-3.5 animate-spin text-emerald-600" />
                    {progress}
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Result */}
          <motion.div variants={item}>
            <Card className="p-5 sm:p-6 gap-0 h-full flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 text-emerald-600" />
                    <h3 className="font-semibold text-sm sm:text-base">Extracted &amp; Translated Text</h3>
                    <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-0 font-bold">
                      {targetLanguage}
                    </Badge>
                  </div>
                  {result && (
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="sm" onClick={handleOpenInTranslator} className="h-7 px-2.5 text-xs font-bold border-[#DD0200]/30 text-[#DD0200] hover:bg-[#DD0200]/5">
                        Open in Translator
                        <ArrowRight className="size-3 ml-1" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 px-2 text-xs">
                        {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                        {copied ? 'Copied' : 'Copy'}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Inline Re-translate Bar */}
                {result && (
                  <div className="mb-3 flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/40 border border-border">
                    <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                      <RefreshCw className={cn('size-3', retranslating && 'animate-spin')} />
                      Re-translate OCR to:
                    </span>
                    <Select value={targetLanguage} onValueChange={handleRetranslate} disabled={retranslating}>
                      <SelectTrigger className="h-7 text-xs w-36 border-border"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="min-h-64 rounded-md border border-border bg-muted/30 p-4">
                  {loading || retranslating ? (
                    <div className="space-y-2">
                      {[100, 90, 95, 70, 85, 60, 80].map((w, i) => (
                        <div key={i} className="h-3 rounded bg-muted/70 animate-pulse" style={{ width: `${w}%` }} />
                      ))}
                    </div>
                  ) : result ? (
                    <div className="prose-ll max-w-none text-sm leading-relaxed">
                      <ReactMarkdown>{result}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center py-8 gap-2">
                      <ImageIcon className="size-10 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground/70">Extracted text &amp; translation will appear here</p>
                      <p className="text-xs text-muted-foreground/50 max-w-xs">Upload an image and tap &quot;Extract &amp; Translate&quot; to get Markdown text, summary, and translation in your target language.</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Use cases */}
        <motion.div variants={item}>
          <h2 className="text-base sm:text-lg font-semibold tracking-tight mb-3 flex items-center gap-2">
            <Sparkles className="size-4 text-amber-500" />
            Common use cases
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {USE_CASES.map((u) => {
              const Icon = u.icon
              return (
                <motion.button
                  key={u.id}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setContext(u.title)}
                  className="text-left"
                >
                  <Card className={cn('p-4 gap-0 h-full hover:shadow-md transition-all', context === u.title && 'ring-2 ring-emerald-500/40')}>
                    <div className={cn('size-9 rounded-lg flex items-center justify-center bg-gradient-to-br shadow-md', u.tint)}>
                      <Icon className="size-4 text-white" />
                    </div>
                    <p className="mt-2.5 text-sm font-semibold">{u.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{u.desc}</p>
                  </Card>
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Recent scans */}
        {recents.length > 0 && (
          <motion.div variants={item}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base sm:text-lg font-semibold tracking-tight flex items-center gap-2">
                <Clock className="size-4 text-muted-foreground" />
                Recent scans
              </h2>
              <span className="text-xs text-muted-foreground">{recents.length} saved</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {recents.map((r) => (
                <Card key={r.id} className="p-3 gap-0 hover:shadow-md transition-all">
                  <div className="flex gap-3">
                    <img src={r.preview} alt={r.fileName} className="size-16 rounded-md object-cover bg-muted/40 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{r.fileName}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {new Date(r.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Badge variant="secondary" className="text-[9px] border-0 bg-muted/60 text-muted-foreground">{r.context}</Badge>
                        {r.targetLanguage && (
                          <Badge variant="secondary" className="text-[9px] border-0 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold">{r.targetLanguage}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2 line-clamp-2 leading-relaxed">{r.result}</p>
                  <div className="mt-2 flex items-center gap-1">
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs flex-1" onClick={() => reuseRecent(r)}>
                      View
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-muted-foreground hover:text-rose-600" onClick={() => removeRecent(r.id)}>
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
