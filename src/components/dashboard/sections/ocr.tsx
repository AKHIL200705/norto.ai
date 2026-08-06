'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import {
  UploadCloud, FileImage, ScanLine, Copy, Check, Loader2,
  Trash2, Clock, Sparkles, FileText, Utensils, Map as MapIcon,
  Landmark, Camera, ImageIcon, X,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  createdAt: string
}

const STORAGE_KEY = 'norto-recent-scans'

const USE_CASES = [
  { id: 'rent', title: 'Rent Agreement', desc: 'Extract terms, dates, and amounts', icon: FileText, tint: 'from-emerald-500 to-teal-600' },
  { id: 'menu', title: 'Restaurant Menu', desc: 'Translate dishes and prices', icon: Utensils, tint: 'from-amber-500 to-orange-500' },
  { id: 'sign', title: 'Street Sign', desc: 'Translate local language signs', icon: MapIcon, tint: 'from-rose-500 to-pink-600' },
  { id: 'form', title: 'Government Form', desc: 'Extract fields & instructions', icon: Landmark, tint: 'from-violet-500 to-fuchsia-600' },
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
  const [dataUrl, setDataUrl] = React.useState<string | null>(null)
  const [fileName, setFileName] = React.useState<string>('')
  const [context, setContext] = React.useState<string>('')
  const [loading, setLoading] = React.useState(false)
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
    reader.onerror = () => toast.error('Failed to read file')
    reader.readAsDataURL(file)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    handleFile(file)
  }

  const onPick = () => inputRef.current?.click()

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0])
  }

  const clearImage = () => {
    setDataUrl(null)
    setFileName('')
    setResult('')
    if (inputRef.current) inputRef.current.value = ''
  }

  const extract = async () => {
    if (!dataUrl) {
      toast.error('Please select an image first')
      return
    }
    setLoading(true)
    setProgress('Uploading image…')
    setResult('')
    try {
      // Fake progress messages while waiting
      const timers: number[] = []
      timers.push(window.setTimeout(() => setProgress('Analyzing image with AI…'), 800))
      timers.push(window.setTimeout(() => setProgress('Extracting text & structure…'), 1800))
      timers.push(window.setTimeout(() => setProgress('Formatting Markdown output…'), 2800))

      const json = await api('/api/ocr', { body: { image: dataUrl } })
      timers.forEach((t) => clearTimeout(t))

      setResult(json.result || '')
      toast.success('Text extracted successfully')

      // Save to recents
      const entry: RecentScan = {
        id: crypto.randomUUID(),
        fileName: fileName || `scan-${Date.now()}.jpg`,
        preview: dataUrl,
        result: json.result || '',
        context: context || 'General scan',
        createdAt: new Date().toISOString(),
      }
      persistRecents([entry, ...recents].slice(0, 8))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'OCR failed')
    } finally {
      setLoading(false)
      setProgress('')
    }
  }

  const handleCopy = async () => {
    if (!result) return
    try {
      await navigator.clipboard.writeText(result)
      setCopied(true)
      toast.success('Copied to clipboard')
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error('Copy failed')
    }
  }

  const removeRecent = (id: string) => {
    persistRecents(recents.filter((r) => r.id !== id))
  }

  const reuseRecent = (r: RecentScan) => {
    setDataUrl(r.preview)
    setFileName(r.fileName)
    setContext(r.context)
    setResult(r.result)
  }

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-6">
        {/* Header */}
        <motion.div variants={item}>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <ScanLine className="size-3.5 text-emerald-600" />
            <span>Extract &amp; translate text from any image</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">OCR Scanner</h1>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Upload zone */}
          <motion.div variants={item}>
            <Card className="p-5 sm:p-6 gap-0 h-full">
              <h3 className="font-semibold text-sm sm:text-base mb-3">Upload image</h3>

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
                      ? 'border-emerald-500 bg-emerald-500/10 scale-[1.01]'
                      : 'border-border hover:border-emerald-500/50 hover:bg-emerald-500/5',
                  )}
                >
                  <motion.div
                    animate={dragging ? { y: -4 } : { y: 0 }}
                    className="size-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20"
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
                    <Badge variant="secondary" className="text-[10px] border-0 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
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

              <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={extract} disabled={loading || !dataUrl} className="flex-1 min-w-32">
                  {loading ? <Loader2 className="size-4 animate-spin" /> : <ScanLine className="size-4" />}
                  {loading ? 'Extracting…' : 'Extract Text'}
                </Button>
                <Button variant="outline" onClick={onPick} disabled={loading}>
                  <Camera className="size-4" />
                  <span className="hidden sm:inline">Choose file</span>
                </Button>
              </div>

              {loading && progress && (
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin text-emerald-600" />
                  {progress}
                </div>
              )}
            </Card>
          </motion.div>

          {/* Result */}
          <motion.div variants={item}>
            <Card className="p-5 sm:p-6 gap-0 h-full flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
                  <FileText className="size-4 text-emerald-600" />
                  Extracted text
                </h3>
                {result && (
                  <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 px-2 text-xs">
                    {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                )}
              </div>
              <div className="flex-1 min-h-64 rounded-md border border-border bg-muted/30 p-4">
                {loading ? (
                  <div className="space-y-2">
                    {[100, 90, 95, 70, 85, 60, 80].map((w, i) => (
                      <div key={i} className="h-3 rounded bg-muted/70 animate-pulse" style={{ width: `${w}%` }} />
                    ))}
                  </div>
                ) : result ? (
                  <div className="prose-ll max-w-none text-sm">
                    <ReactMarkdown>{result}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-8 gap-2">
                    <ImageIcon className="size-10 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground/70">Extracted text &amp; translation will appear here</p>
                    <p className="text-xs text-muted-foreground/50 max-w-xs">Upload an image and tap &quot;Extract Text&quot; to get a Markdown summary with translation.</p>
                  </div>
                )}
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
                      <Badge variant="secondary" className="text-[9px] mt-1 border-0 bg-muted/60 text-muted-foreground">{r.context}</Badge>
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
