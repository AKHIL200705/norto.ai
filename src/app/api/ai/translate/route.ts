import ZAI from 'z-ai-web-dev-sdk'

export const dynamic = 'force-dynamic'

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
    if (!from || typeof from !== 'string' || !from.trim()) {
      return Response.json({ error: 'Missing required field: from' }, { status: 400 })
    }
    if (!to || typeof to !== 'string' || !to.trim()) {
      return Response.json({ error: 'Missing required field: to' }, { status: 400 })
    }

    const systemPrompt = `Translate the following text from ${from} to ${to}. Return ONLY the translated text, nothing else. Do not include any explanation, quotation marks, or formatting.`

    const zai = await ZAI.create()
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: systemPrompt },
        { role: 'user', content: text },
      ],
      thinking: { type: 'disabled' },
    })

    const translation = (completion.choices[0]?.message?.content ?? '').trim()

    return Response.json({ translation })
  } catch (err) {
    console.error('[api/ai/translate] error:', err)
    return Response.json(
      { error: err instanceof Error ? err.message : 'Failed to translate text' },
      { status: 500 },
    )
  }
}
