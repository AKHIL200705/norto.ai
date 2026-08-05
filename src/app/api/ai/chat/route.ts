import ZAI from 'z-ai-web-dev-sdk'

export const dynamic = 'force-dynamic'

interface HistoryMsg {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { message, city, history } = body as {
      message?: string
      city?: string
      history?: HistoryMsg[]
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return Response.json({ error: 'Missing required field: message' }, { status: 400 })
    }

    const cityName = city && typeof city === 'string' ? city : 'the selected city'

    const systemPrompt = `You are LifeLens AI, an expert relocation & city-settlement assistant. The user is in ${cityName}. Provide practical, well-structured answers using Markdown (headings, bullet lists, bold). Cover accommodation, food, transport, budget, safety, local language tips, and emergency info where relevant. Be concise but thorough.`

    const messages: HistoryMsg[] = [{ role: 'assistant', content: systemPrompt }]

    // Include up to last 8 history messages before the new user message
    if (Array.isArray(history) && history.length > 0) {
      const validHistory = history
        .filter(
          (m) =>
            m &&
            (m.role === 'user' || m.role === 'assistant') &&
            typeof m.content === 'string' &&
            m.content.trim(),
        )
        .slice(-8)
      for (const m of validHistory) {
        messages.push({ role: m.role, content: m.content })
      }
    }

    messages.push({ role: 'user', content: message })

    const zai = await ZAI.create()
    const completion = await zai.chat.completions.create({
      messages,
      thinking: { type: 'disabled' },
    })

    const text = completion.choices[0]?.message?.content ?? ''

    return Response.json({ response: text })
  } catch (err) {
    console.error('[api/ai/chat] error:', err)
    return Response.json(
      { error: err instanceof Error ? err.message : 'Failed to generate chat response' },
      { status: 500 },
    )
  }
}
