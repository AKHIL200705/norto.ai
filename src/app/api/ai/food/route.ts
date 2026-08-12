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

function generateFallbackFoods(city: string, vegOnly: boolean): FoodItem[] {
  return [
    {
      name: `Sri Venkateswara Tiffin Center (${city})`,
      type: 'Quick Bite',
      rating: 4.6,
      distance: '0.6 km',
      description: 'Hot ghee masala dosa, fluffy idlis, vada, and authentic filter coffee.',
      veg: true,
    },
    {
      name: `Annapurna Mess & Meals (${city})`,
      type: 'Restaurant',
      rating: 4.5,
      distance: '1.1 km',
      description: 'Traditional South Indian thali served with fresh curries, sambar, rasam, and curd.',
      veg: true,
    },
    {
      name: vegOnly ? `Green Leaf Veg Restaurant` : `Bawarchi Family Restaurant (${city})`,
      type: 'Restaurant',
      rating: 4.4,
      distance: '1.4 km',
      description: vegOnly ? 'Pure vegetarian North & South Indian meals, paneer dishes, and roti.' : 'Famous aromatic Biryani, tandoori chicken, and kebabs.',
      veg: vegOnly,
    },
    {
      name: `Balaji Sweets & Snacks (${city})`,
      type: 'Street Food',
      rating: 4.3,
      distance: '0.8 km',
      description: 'Evening hot Punugulu, Mirchi Bajji, samosas, and sweets.',
      veg: true,
    },
    {
      name: `Cafe Coffee Corner (${city})`,
      type: 'Cafe',
      rating: 4.2,
      distance: '1.8 km',
      description: 'Freshly brewed cold coffee, sandwiches, and evening snacks.',
      veg: true,
    },
    {
      name: `Local Bakery & Juice Bar (${city})`,
      type: 'Quick Bite',
      rating: 4.4,
      distance: '0.4 km',
      description: 'Fresh fruit juices, milkshakes, and freshly baked pastries.',
      veg: true,
    },
  ]
}

function parseFoodArray(text: string): FoodItem[] | null {
  if (!text) return null
  const trimmed = text.trim()

  try {
    const parsed = JSON.parse(trimmed)
    if (Array.isArray(parsed) && parsed.length > 0) return parsed as FoodItem[]
  } catch {
    // continue
  }

  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fenceMatch) {
    try {
      const parsed = JSON.parse(fenceMatch[1].trim())
      if (Array.isArray(parsed) && parsed.length > 0) return parsed as FoodItem[]
    } catch {
      // continue
    }
  }

  const firstBracket = trimmed.indexOf('[')
  const lastBracket = trimmed.lastIndexOf(']')
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    try {
      const parsed = JSON.parse(trimmed.slice(firstBracket, lastBracket + 1))
      if (Array.isArray(parsed) && parsed.length > 0) return parsed as FoodItem[]
    } catch {
      // continue
    }
  }

  return null
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { city, meal, preference } = body as {
      city?: string
      meal?: string
      preference?: string
    }

    const cityName = city && typeof city === 'string' && city.trim() ? city.trim() : 'Singarayakonda'
    const isVeg = preference === 'Veg' || preference === 'Vegetarian'

    try {
      const zai = await ZAI.create()
      const systemPrompt = `You are Norto's food expert. Recommend 6 food items in ${cityName}. Output EXACTLY a JSON array of 6 food items.`
      const userMessage = `City: ${cityName}\nMeal: ${meal || 'All'}\nVeg: ${isVeg}`

      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        thinking: { type: 'disabled' },
      })

      const text = completion.choices[0]?.message?.content ?? ''
      const foods = parseFoodArray(text)
      if (foods) {
        return Response.json({ foods })
      }
    } catch {
      // Fallback
    }

    return Response.json({ foods: generateFallbackFoods(cityName, isVeg) })
  } catch (err) {
    console.error('[api/ai/food] error:', err)
    return Response.json({ foods: generateFallbackFoods('Singarayakonda', true) })
  }
}
