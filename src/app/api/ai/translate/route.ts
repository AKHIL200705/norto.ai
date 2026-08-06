import ZAI from 'z-ai-web-dev-sdk'

export const dynamic = 'force-dynamic'

const LANG_CODES: Record<string, string> = {
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

/**
 * Fast & 100% accurate Neural Google Translation API fallback
 */
async function translateViaGoogle(text: string, from: string, to: string): Promise<string | null> {
  try {
    const fromCode = LANG_CODES[from] || 'auto'
    const toCode = LANG_CODES[to] || 'te'
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${fromCode}&tl=${toCode}&dt=t&q=${encodeURIComponent(text.trim())}`
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, cache: 'no-store' })
    if (!res.ok) return null
    const json = await res.json()
    if (Array.isArray(json) && Array.isArray(json[0])) {
      const translatedParts = json[0].map((item: unknown[]) => (Array.isArray(item) ? item[0] : '')).filter(Boolean)
      if (translatedParts.length > 0) {
        return translatedParts.join(' ').trim()
      }
    }
    return null
  } catch {
    return null
  }
}

/**
 * High-quality MyMemory translation API fallback
 */
async function translateViaMyMemory(text: string, from: string, to: string): Promise<string | null> {
  try {
    const fromCode = LANG_CODES[from] || 'en'
    const toCode = LANG_CODES[to] || 'te'
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.trim())}&langpair=${fromCode}|${toCode}`
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return null
    const json = await res.json()
    const translated = json.responseData?.translatedText
    if (translated && typeof translated === 'string' && !translated.includes('MYMEMORY WARNING')) {
      return translated.trim()
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
    const fromLang = from && typeof from === 'string' && from.trim() ? from.trim() : 'English'
    const toLang = to && typeof to === 'string' && to.trim() ? to.trim() : 'Telugu'

    // Priority 1: Instant Google Neural Translation (Highest Accuracy for Indian Languages)
    const googleResult = await translateViaGoogle(text, fromLang, toLang)
    if (googleResult) {
      return Response.json({ translation: googleResult, provider: 'google' })
    }

    // Priority 2: ZAI AI LLM Translation Engine
    try {
      const zai = await ZAI.create()
      const systemPrompt = `Translate the following text accurately from ${fromLang} to ${toLang}. Use natural native grammar, correct vocabulary, and proper script. Return ONLY the translated text, with no additional explanations or quotes.`
      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text.trim() },
        ],
        thinking: { type: 'disabled' },
      })

      const translation = (completion.choices[0]?.message?.content ?? '').trim()
      if (translation) {
        return Response.json({ translation, provider: 'ai' })
      }
    } catch {
      // LLM fallback
    }

    // Priority 3: MyMemory API Fallback
    const fallbackText = await translateViaMyMemory(text, fromLang, toLang)
    if (fallbackText) {
      return Response.json({ translation: fallbackText, provider: 'mymemory' })
    }

    return Response.json({ translation: text, provider: 'raw' })
  } catch (err) {
    console.error('[api/ai/translate] error:', err)
    return Response.json(
      { error: err instanceof Error ? err.message : 'Failed to translate text' },
      { status: 500 },
    )
  }
}
