import ZAI from 'z-ai-web-dev-sdk'

export const dynamic = 'force-dynamic'

const LANG_CODES: Record<string, string> = {
  'Auto Detect': 'auto',
  English: 'en',
  Hindi: 'hi',
  Telugu: 'te',
  Tamil: 'ta',
  Kannada: 'kn',
  Malayalam: 'ml',
  Marathi: 'mr',
  Gujarati: 'gu',
  Bengali: 'bn',
  Punjabi: 'pa',
  Urdu: 'ur',
  Odia: 'or',
}

interface TranslationResult {
  translation: string
  transliteration?: string
  detectedLanguage?: string
  provider: string
}

/**
 * Helper to clean JSON strings returned by LLMs
 */
function cleanJsonText(rawText: string): string {
  let text = rawText.trim()
  if (text.startsWith('```json')) {
    text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '')
  } else if (text.startsWith('```')) {
    text = text.replace(/^```\s*/, '').replace(/\s*```$/, '')
  }
  return text.trim()
}

/**
 * Priority 1: Google Gemini AI Engine
 * Provides state-of-the-art context-aware translation, correct native grammar, and phonetic transliteration.
 */
async function translateViaGemini(text: string, from: string, to: string): Promise<TranslationResult | null> {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_API_KEY
  if (!geminiKey || !geminiKey.trim()) return null

  const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro']
  const fromDesc = from === 'Auto Detect' ? 'auto-detected source language' : from
  const systemPrompt = `You are a world-class translation engine specializing in Indian languages and English.
Translate the text below accurately from ${fromDesc} to ${to}.

Requirements:
1. Translate accurately into native script using correct grammar, natural vocabulary, proper honorifics, and appropriate context.
2. If ${to} is not English, also provide a Romanized phonetic transliteration (pronunciation guide).
3. If source is "Auto Detect", identify the source language name in English.
4. Output MUST be valid JSON only with this exact structure:
{
  "translation": "translated text in native script",
  "transliteration": "Romanized phonetic pronunciation guide (leave empty string if target is English)",
  "detectedLanguage": "name of detected or input source language"
}`

  for (const model of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey.trim()}`
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: `${systemPrompt}\n\nInput Text to Translate:\n"${text.trim()}"` },
              ],
            },
          ],
          generationConfig: {
            response_mime_type: 'application/json',
          },
        }),
      })

      if (!response.ok) continue
      const data = await response.json()
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text
      if (!rawText) continue

      const cleaned = cleanJsonText(rawText)
      const parsed = JSON.parse(cleaned) as {
        translation?: string
        transliteration?: string
        detectedLanguage?: string
      }

      if (parsed.translation && typeof parsed.translation === 'string' && parsed.translation.trim()) {
        return {
          translation: parsed.translation.trim(),
          transliteration: (parsed.transliteration || '').trim(),
          detectedLanguage: (parsed.detectedLanguage || (from === 'Auto Detect' ? 'Detected' : from)).trim(),
          provider: `gemini_ai_${model}`,
        }
      }
    } catch {
      // try next model
    }
  }
  return null
}

/**
 * Priority 2: ZAI AI LLM Translation Engine
 */
async function translateViaZAI(text: string, from: string, to: string): Promise<TranslationResult | null> {
  try {
    const zai = await ZAI.create()
    const fromDesc = from === 'Auto Detect' ? 'auto-detected source language' : from
    const systemPrompt = `You are an expert multi-lingual translation engine for Indian languages and English.
Translate the text below accurately from ${fromDesc} to ${to}.

Requirements:
1. Provide accurate native translation with correct grammar and honorifics.
2. If ${to} is not English, also provide a Romanized phonetic transliteration.
3. Output MUST be valid JSON only:
{
  "translation": "translated text in native script",
  "transliteration": "Romanized phonetic pronunciation",
  "detectedLanguage": "detected or input source language name"
}`

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text.trim() },
      ],
      thinking: { type: 'disabled' },
    })

    const rawText = (completion.choices[0]?.message?.content ?? '').trim()
    if (!rawText) return null

    try {
      const cleaned = cleanJsonText(rawText)
      const parsed = JSON.parse(cleaned)
      if (parsed.translation && typeof parsed.translation === 'string' && parsed.translation.trim()) {
        return {
          translation: parsed.translation.trim(),
          transliteration: (parsed.transliteration || '').trim(),
          detectedLanguage: (parsed.detectedLanguage || (from === 'Auto Detect' ? 'Detected' : from)).trim(),
          provider: 'zai_ai',
        }
      }
    } catch {
      // If LLM returned raw text instead of JSON
      if (rawText.length > 0 && !rawText.includes('{')) {
        return {
          translation: rawText,
          transliteration: '',
          detectedLanguage: from === 'Auto Detect' ? 'Detected' : from,
          provider: 'zai_ai',
        }
      }
    }
    return null
  } catch {
    return null
  }
}

/**
 * Priority 3: Neural Google Translation API (GTX) with transliteration & auto-detect
 */
async function translateViaGoogle(text: string, from: string, to: string): Promise<TranslationResult | null> {
  try {
    const fromCode = LANG_CODES[from] || 'auto'
    const toCode = LANG_CODES[to] || 'te'
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${fromCode}&tl=${toCode}&dt=t&dt=rm&q=${encodeURIComponent(text.trim())}`
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, cache: 'no-store' })
    if (!res.ok) return null
    const json = await res.json()

    let translatedText = ''
    let transliteration = ''
    let detectedLang = from

    if (Array.isArray(json)) {
      if (Array.isArray(json[0])) {
        const parts: string[] = []
        for (const item of json[0]) {
          if (Array.isArray(item)) {
            if (typeof item[0] === 'string' && item[0]) {
              parts.push(item[0])
            }
            if (typeof item[2] === 'string' && item[2]) {
              transliteration += item[2] + ' '
            } else if (typeof item[3] === 'string' && item[3]) {
              transliteration += item[3] + ' '
            }
          }
        }
        translatedText = parts.join(' ').replace(/\s+/g, ' ').trim()
      }

      if (json[2] && typeof json[2] === 'string') {
        const detectedCode = json[2]
        const matched = Object.entries(LANG_CODES).find(([, code]) => code === detectedCode)
        if (matched) detectedLang = matched[0]
      }
    }

    if (translatedText) {
      return {
        translation: translatedText,
        transliteration: transliteration.trim(),
        detectedLanguage: detectedLang === 'Auto Detect' ? 'Detected' : detectedLang,
        provider: 'google_neural',
      }
    }
    return null
  } catch {
    return null
  }
}

/**
 * Priority 4: MyMemory Translation API Fallback
 */
async function translateViaMyMemory(text: string, from: string, to: string): Promise<TranslationResult | null> {
  try {
    const fromCode = LANG_CODES[from] && LANG_CODES[from] !== 'auto' ? LANG_CODES[from] : 'en'
    const toCode = LANG_CODES[to] || 'te'
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.trim())}&langpair=${fromCode}|${toCode}`
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return null
    const json = await res.json()
    const translated = json.responseData?.translatedText
    if (translated && typeof translated === 'string' && !translated.includes('MYMEMORY WARNING')) {
      return {
        translation: translated.trim(),
        transliteration: '',
        detectedLanguage: from === 'Auto Detect' ? 'Detected' : from,
        provider: 'mymemory',
      }
    }
    return null
  } catch {
    return null
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { text, from, to } = body as {
      text?: string
      from?: string
      to?: string
    }

    if (!text || typeof text !== 'string' || !text.trim()) {
      return Response.json({ error: 'Missing required field: text' }, { status: 400 })
    }

    const fromLang = from && typeof from === 'string' && from.trim() ? from.trim() : 'Auto Detect'
    const toLang = to && typeof to === 'string' && to.trim() ? to.trim() : 'Telugu'

    // Priority 1: Google Gemini AI (SOTA context, grammar, and transliteration)
    const geminiResult = await translateViaGemini(text, fromLang, toLang)
    if (geminiResult) {
      return Response.json(geminiResult)
    }

    // Priority 2: ZAI AI LLM Engine
    const zaiResult = await translateViaZAI(text, fromLang, toLang)
    if (zaiResult) {
      return Response.json(zaiResult)
    }

    // Priority 3: Google Neural GTX API
    const googleResult = await translateViaGoogle(text, fromLang, toLang)
    if (googleResult) {
      return Response.json(googleResult)
    }

    // Priority 4: MyMemory API Fallback
    const fallbackResult = await translateViaMyMemory(text, fromLang, toLang)
    if (fallbackResult) {
      return Response.json(fallbackResult)
    }

    return Response.json({
      translation: text.trim(),
      transliteration: '',
      detectedLanguage: fromLang,
      provider: 'raw',
    })
  } catch (err) {
    console.error('[api/ai/translate] error:', err)
    return Response.json(
      { error: err instanceof Error ? err.message : 'Failed to translate text' },
      { status: 500 },
    )
  }
}
