import ZAI from 'z-ai-web-dev-sdk'

export const dynamic = 'force-dynamic'

interface FoodItem {
  name: string
  type: string
  rating: number
  distance: string
  description: string
  veg: boolean
}

// Try to extract a JSON array from an LLM response that may contain
// fenced code blocks or extra prose.
function parseFoodArray(text: string): FoodItem[] | null {
  if (!text) return null
  const trimmed = text.trim()

  // Try direct parse first
  try {
    const parsed = JSON.parse(trimmed)
    if (Array.isArray(parsed)) return parsed as FoodItem[]
  } catch {
    // continue
  }

  // Try fenced code block ```json ... ``` or ``` ... ```
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fenceMatch) {
    try {
      const parsed = JSON.parse(fenceMatch[1].trim())
      if (Array.isArray(parsed)) return parsed as FoodItem[]
    } catch {
      // continue
    }
  }

  // Try to find the first '[' and last ']'
  const firstBracket = trimmed.indexOf('[')
  const lastBracket = trimmed.lastIndexOf(']')
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    try {
      const parsed = JSON.parse(trimmed.slice(firstBracket, lastBracket + 1))
      if (Array.isArray(parsed)) return parsed as FoodItem[]
    } catch {
      // continue
    }
  }

  return null
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { city, meal, preference, budget } = body as {
      city?: string
      meal?: string
      preference?: string
      budget?: string
    }

    if (!city || typeof city !== 'string' || !city.trim()) {
      return Response.json({ error: 'Missing required field: city' }, { status: 400 })
    }

    const mealLabel =
      meal && typeof meal === 'string'
        ? meal
        : 'any meal'
    const prefLabel =
      preference && typeof preference === 'string'
        ? preference
        : 'any preference'
    const budgetLabel =
      budget && typeof budget === 'string' ? budget : 'any budget'

    const systemPrompt = `You are Norto's food expert. Recommend food items available in the specified city. Return EXACTLY a JSON array of 6 food items — no prose, no markdown fences, no explanation. ONLY the JSON array.

Each food item MUST be an object with these exact keys:
{
  "name": string,            // dish or restaurant + dish name
  "type": string,            // e.g. "Street Food", "Restaurant", "Cafe", "Quick Bite"
  "rating": number,          // 0-5, one decimal
  "distance": string,        // e.g. "1.2 km" or "800 m"
  "description": string,     // 1-2 sentence description
  "veg": boolean             // true if vegetarian, false otherwise
}

Do NOT include any price or cost information. Match the meal type and dietary preference. Be realistic for the city.`

    const userMessage = `City: ${city}\nMeal: ${mealLabel}\nDietary preference: ${prefLabel}\nBudget: ${budgetLabel}\n\nReturn the JSON array of 6 food items now.`

    const zai = await ZAI.create()
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      thinking: { type: 'disabled' },
    })

    const text = completion.choices[0]?.message?.content ?? ''
    const foods = parseFoodArray(text)

    if (foods) {
      return Response.json({ foods })
    }

    return Response.json({ foods: [], raw: text })
  } catch (err) {
    console.error('[api/ai/food] error:', err)
    return Response.json(
      { error: err instanceof Error ? err.message : 'Failed to generate food recommendations' },
      { status: 500 },
    )
  }
}
