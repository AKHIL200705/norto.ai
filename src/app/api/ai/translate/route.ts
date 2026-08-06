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
}

async function translateViaMyMemory(text: string, from: string, to: string): Promise<string | null> {
  try {
    const fromCode = LANG_CODES[from] || 'en'
    const toCode = LANG_CODES[to] || 'te'
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.trim())}&langpair=${fromCode}|${toCode}`
    const res = await fetch(url, { next: { revalidate: 3600 } })
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

    // Primary attempt: ZAI SDK
    try {
      const zai = await ZAI.create()
      const systemPrompt = `Translate the following text from ${fromLang} to ${toLang}. Return ONLY the translated text, nothing else. Do not include any explanation, quotation marks, or formatting.`
      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text.trim() },
        ],
        thinking: { type: 'disabled' },
      })

      const translation = (completion.choices[0]?.message?.content ?? '').trim()
      if (translation) {
        return Response.json({ translation })
      }
    } catch {
      // SDK failed or unconfigured, fallback to MyMemory API below
    }

    // Secondary attempt: High-quality MyMemory translation API
    const fallbackText = await translateViaMyMemory(text, fromLang, toLang)
    if (fallbackText) {
      return Response.json({ translation: fallbackText })
    }

    // Ultimate fallback
    return Response.json({ translation: text })
  } catch (err) {
    console.error('[api/ai/translate] error:', err)
    return Response.json(
      { error: err instanceof Error ? err.message : 'Failed to translate text' },
      { status: 500 },
    )
  }
}
