import ZAI from 'z-ai-web-dev-sdk'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { city, budget, preferences } = body as {
      city?: string
      budget?: number
      preferences?: string
    }

    if (!city || typeof city !== 'string' || !city.trim()) {
      return Response.json({ error: 'Missing required field: city' }, { status: 400 })
    }
    if (budget === undefined || budget === null || typeof budget !== 'number' || isNaN(budget)) {
      return Response.json({ error: 'Missing or invalid required field: budget' }, { status: 400 })
    }

    const prefs =
      preferences && typeof preferences === 'string' && preferences.trim()
        ? preferences.trim()
        : 'No specific preferences stated.'

    const systemPrompt = `You are LifeLens AI, an expert relocation planner. Generate a complete relocation guide for the user's destination city. Output well-structured Markdown with the following sections:

1. **Best Areas to Live** — within the user's stated budget (₹{budget}/month). Mention 3-5 neighborhoods with rough rent ranges, pros, and cons.
2. **Estimated Monthly Expenses** — itemized table/breakdown (rent, food, transport, utilities, internet, misc) with realistic ₹ figures for the city.
3. **Transport Options** — public transit, ride-hailing, two-wheeler, walking/cycling; cost comparisons.
4. **Nearby Essentials** — grocery, pharmacy, hospital, ATMs, mobile recharge, SIM providers.
5. **Local Language Basics** — 5-8 essential phrases (greetings, directions, food, emergency) in the local language with transliteration + English meaning.
6. **Safety Tips** — neighborhood awareness, documents to carry, women safety, scams to avoid.
7. **7-Day Settling-In Checklist** — day-by-day actionable checklist (Day 1 to Day 7).

Be specific to the city. Be concise but thorough. Use headings (##), bullet lists, and bold text. Use ₹ for all monetary values.`

    const userMessage = `City: ${city}\nMonthly Budget: ₹${budget}\nPreferences: ${prefs}\n\nPlease generate the full relocation guide as Markdown.`

    const zai = await ZAI.create()
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      thinking: { type: 'disabled' },
    })

    const guide = completion.choices[0]?.message?.content ?? ''

    return Response.json({ guide })
  } catch (err) {
    console.error('[api/ai/relocation] error:', err)
    return Response.json(
      { error: err instanceof Error ? err.message : 'Failed to generate relocation guide' },
      { status: 500 },
    )
  }
}
