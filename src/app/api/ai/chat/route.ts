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
    const userMsg = message.trim()

    // --- Ground the answer with real-time web search for accuracy ---
    // Search for city-specific, up-to-date info so answers reflect real places,
    // prices, routes, and events — not just the model's training memory.
    let searchContext = ''
    try {
      const zaiForSearch = await ZAI.create()
      const searchQuery = `${userMsg} ${cityName} India`.slice(0, 200)
      const results = await zaiForSearch.functions.invoke('web_search', {
        query: searchQuery,
        num: 6,
      })
      if (Array.isArray(results) && results.length > 0) {
        searchContext =
          '\n\n--- Real-time web search results (use these for accuracy; cite specifics where helpful) ---\n' +
          results
            .map(
              (r: any, i: number) =>
                `[${i + 1}] ${r.name || ''}\n${r.snippet || ''}\nSource: ${r.host_name || r.url || ''}`,
            )
            .join('\n\n')
      }
    } catch {
      // Search is best-effort; continue without it if it fails.
    }

    const systemPrompt = `You are Norto, an expert relocation, city-settlement, and local-living assistant. The user is currently in or asking about **${cityName}**, India.

You answer ALL types of questions accurately and helpfully. The user may ask about anything — adapt your expertise to whatever they need. Common question types include:
- **Relocation & housing**: PGs, hostels, rental flats, best neighbourhoods to live in, rent estimates, broker tips, lease terms.
- **Food & dining**: restaurants, street food, mess/tiffin services, veg/non-veg options, budgets, local cuisine.
- **Transport & commute**: metro routes, bus numbers, auto/cab fares, bike rentals, monthly passes, commute times between areas.
- **Budget & money**: monthly expense breakdowns, cost of living, savings tips, cheap alternatives, banking/ATMs.
- **Safety & emergencies**: safe/unsafe areas (especially at night), nearest hospitals, police stations, emergency numbers (108 ambulance, 100 police, 101 fire), women's helpline 1091.
- **Local language**: useful phrases in the regional language, pronunciation, translation help.
- **Weather & packing**: current season, what to wear, monsoon prep, packing checklist.
- **Jobs & coworking**: coworking spaces, job portals, networking, interview locations.
- **Shopping & services**: markets, malls, supermarkets, pharmacies, internet providers, mobile plans.
- **Weekend & social**: tourist spots, parks, gyms, events, festivals, nightlife.
- **Healthcare**: hospitals, clinics, blood banks, pharmacy availability.
- **Documents & admin**: Aadhaar, PAN, ration card, sim card, local ID requirements.
- **General knowledge**: if the user asks something unrelated to the city (e.g. tech help, study tips, general advice), still help them — be a well-rounded assistant.

Guidelines:
- Answer in well-structured **Markdown**: use short paragraphs, **bold** key info, bullet lists, and headings (##) for longer answers.
- Be **specific to ${cityName}** — use real area names, real prices in ₹, real route/metro info where you know it.
- When unsure of exact current details, give helpful estimates and suggest how the user can verify (e.g. "check the latest on the metro app").
- Be concise but thorough — don't pad, but don't omit actionable detail.
- If the question is urgent/emergency-related, lead with the most important info (numbers, nearest help).
- Always be warm, practical, and encouraging — you're helping someone settle into a new city.
- Use the provided real-time web search results to ground your answer in current, accurate information when relevant.${searchContext}`

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

    messages.push({ role: 'user', content: userMsg })

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
