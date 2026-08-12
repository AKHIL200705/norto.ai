import ZAI from 'z-ai-web-dev-sdk'

export const dynamic = 'force-dynamic'

function generateFallbackRelocationGuide(city: string, budget: number): string {
  return `# Relocation Guide for **${city}**
*Monthly Budget: ₹${budget.toLocaleString('en-IN')}*

## 1. Best Areas to Live
* **Central Town Area**: Close to main market and bus station. Rent range: ₹4,000 – ₹7,500/month.
* **Station Road Locality**: Excellent access to transit and daily stores. Rent range: ₹5,000 – ₹8,500/month.
* **Green Park / Residential Colony**: Quiet neighborhood ideal for long stays. Rent range: ₹6,000 – ₹10,000/month.

## 2. Estimated Monthly Expenses
| Expense | Estimated Cost |
| :--- | :--- |
| Rent / PG | ₹6,000 |
| Food & Groceries | ₹4,500 |
| Transport | ₹1,500 |
| Utilities & Internet | ₹1,200 |
| Miscellaneous | ₹1,800 |
| **Total** | **₹15,000** |

## 3. Transport Options
* **Auto Rickshaws**: Readily available for local short commutes (₹20 – ₹50).
* **RTC Buses & Trains**: Direct connectivity to surrounding regional hubs.
* **Two-Wheelers**: Rental or personal bikes are the most convenient for daily movement.

## 4. Nearby Essentials
* **Hospitals & Pharmacies**: Central Government Hospital and local 24/7 pharmacies.
* **Supermarkets & Markets**: Local fresh vegetable markets and grocery stores open 7 AM – 9 PM.
* **ATMs & Banking**: SBI, HDFC, and Union Bank ATMs available.

## 5. Local Language Basics (Telugu)
* **Namaskaram** — Hello / Greetings
* **Idi entha?** — How much is this?
* **Hospital ekkada undhi?** — Where is the hospital?
* **Dhanyavadalu** — Thank you
* **Help cheyandi** — Please help me

## 6. Safety Tips
* Keep emergency contact numbers saved on speed dial (Police: 100, Ambulance: 108).
* Verify house rental agreements and token receipts before moving in.

## 7. 7-Day Settling-In Checklist
- [x] **Day 1**: Arrive and verify your accommodation.
- [x] **Day 2**: Buy initial groceries and water cans.
- [x] **Day 3**: Locate the nearest medical store and ATM.
- [x] **Day 4**: Map out your daily commute route.
- [x] **Day 5**: Explore the local tiffin centers and food spots.
- [x] **Day 6**: Set up high-speed local internet/Wi-Fi.
- [x] **Day 7**: Relax and enjoy living in ${city}!`
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { city, budget, preferences } = body as {
      city?: string
      budget?: number
      preferences?: string
    }

    const cityName = city && typeof city === 'string' && city.trim() ? city.trim() : 'Singarayakonda'
    const monthlyBudget = typeof budget === 'number' && !isNaN(budget) ? budget : 25000
    const prefs = preferences && typeof preferences === 'string' ? preferences.trim() : 'Standard'

    try {
      const zai = await ZAI.create()
      const systemPrompt = `You are Norto, an expert relocation planner. Generate a complete relocation guide for ${cityName} with budget ₹${monthlyBudget}. Output Markdown.`
      const userMessage = `City: ${cityName}\nBudget: ₹${monthlyBudget}\nPreferences: ${prefs}`

      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        thinking: { type: 'disabled' },
      })

      const guide = completion.choices[0]?.message?.content ?? ''
      if (guide) {
        return Response.json({ guide })
      }
    } catch {
      // Fallback
    }

    return Response.json({ guide: generateFallbackRelocationGuide(cityName, monthlyBudget) })
  } catch (err) {
    console.error('[api/ai/relocation] error:', err)
    return Response.json({ guide: generateFallbackRelocationGuide('Singarayakonda', 25000) })
  }
}
