import ZAI from 'z-ai-web-dev-sdk'

export const dynamic = 'force-dynamic'

interface HistoryMsg {
  role: 'user' | 'assistant' | 'system'
  content: string
}

function generateFallbackChatResponse(query: string, city: string): string {
  const q = query.toLowerCase()
  if (q.includes('pg') || q.includes('flat') || q.includes('rent') || q.includes('stay') || q.includes('hostel')) {
    return `### Accommodation & Stays in **${city}**

Here are recommended options for finding a PG or rental place:

* **Popular Local Areas**: Centrally located residential areas with good access to markets and transport.
* **Single / Shared PG Rooms**: Range from **₹4,500 – ₹8,500/month** (including food, Wi-Fi, and water/electricity).
* **1 BHK / 2 BHK Apartments**: Ranges from **₹8,000 – ₹15,000/month** depending on furnishing.

> 💡 **Pro-Tip**: Always inspect water supply, Wi-Fi coverage, and meal quality before paying an advance token.`
  }

  if (q.includes('food') || q.includes('eat') || q.includes('restaurant') || q.includes('mess') || q.includes('dinner') || q.includes('lunch') || q.includes('breakfast')) {
    return `### Food & Dining Options in **${city}**

Delicious local food recommendations:

1. **South Indian Breakfast Tiffins**: Fresh Idli, Masala Dosa, Puri, and Vada at local tiffin centers.
2. **Thali / Meals**: Traditional Andhra vegetarian & non-vegetarian thali meals.
3. **Evening Street Snacks**: Mirchi Bajji, Punugulu, Tea, and Samosas.

> 🌶️ **Tip**: Specify spice levels when ordering local specialties!`
  }

  if (q.includes('bus') || q.includes('train') || q.includes('transport') || q.includes('metro') || q.includes('cab') || q.includes('auto')) {
    return `### Transport & Commute in **${city}**

Getting around **${city}**:

* **Local Auto Rickshaws**: Readily available for short distances (share autos or meter/fixed rates).
* **RTC Bus Station & Railway**: Direct bus and train connections to all major nearby cities and towns.
* **Cab / Two-Wheeler Apps**: Rapido, Ola, and Uber services for direct pickup.`
  }

  return `### Assistance for **${city}**

Thank you for your question about **${city}**!

Here is helpful information for your query **"${query}"**:
* **Local Guidance**: ${city} is well-connected with access to local markets, essential utilities, healthcare, and public transport.
* **Recommendation**: Check out the **Smart Map**, **Food**, and **Weather** tabs in Norto for real-time local places and guidelines.

Feel free to ask more specific questions about housing, food, transport, or local services!`
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

    const cityName = city && typeof city === 'string' && city.trim() ? city.trim() : 'Singarayakonda'
    const userMsg = message.trim()

    try {
      const zai = await ZAI.create()
      let searchContext = ''
      try {
        const searchQuery = `${userMsg} ${cityName} India`.slice(0, 200)
        const results = await zai.functions.invoke('web_search', {
          query: searchQuery,
          num: 6,
        })
        if (Array.isArray(results) && results.length > 0) {
          searchContext =
            '\n\n--- Real-time web search results ---\n' +
            results
              .map((r: any, i: number) => `[${i + 1}] ${r.name || ''}: ${r.snippet || ''}`)
              .join('\n\n')
        }
      } catch {
        // search optional
      }

      const systemPrompt = `You are Norto, an expert relocation and local assistant. The user is in or asking about **${cityName}**, India. Answer clearly in Markdown. ${searchContext}`
      const messages: HistoryMsg[] = [{ role: 'system', content: systemPrompt }]

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

      const completion = await zai.chat.completions.create({
        messages,
        thinking: { type: 'disabled' },
      })

      const text = completion.choices[0]?.message?.content ?? ''
      if (text) {
        return Response.json({ response: text })
      }
    } catch {
      // Fallback
    }

    return Response.json({ response: generateFallbackChatResponse(userMsg, cityName) })
  } catch (err) {
    console.error('[api/ai/chat] error:', err)
    return Response.json({ response: generateFallbackChatResponse('Help', 'Singarayakonda') })
  }
}
