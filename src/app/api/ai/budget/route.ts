import ZAI from 'z-ai-web-dev-sdk'

export const dynamic = 'force-dynamic'

interface BudgetAnalysis {
  score: number
  emergencyFund: number
  status: 'Excellent' | 'Good' | 'Tight' | 'Risky'
  insights: string[]
  alternatives: string[]
}

function parseBudgetAnalysis(text: string): BudgetAnalysis | null {
  if (!text) return null
  const trimmed = text.trim()

  // Direct parse
  try {
    const parsed = JSON.parse(trimmed)
    if (parsed && typeof parsed === 'object') return parsed as BudgetAnalysis
  } catch {
    // continue
  }

  // Fenced code block
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fenceMatch) {
    try {
      const parsed = JSON.parse(fenceMatch[1].trim())
      if (parsed && typeof parsed === 'object') return parsed as BudgetAnalysis
    } catch {
      // continue
    }
  }

  // First { ... }
  const firstBrace = trimmed.indexOf('{')
  const lastBrace = trimmed.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try {
      const parsed = JSON.parse(trimmed.slice(firstBrace, lastBrace + 1))
      if (parsed && typeof parsed === 'object') return parsed as BudgetAnalysis
    } catch {
      // continue
    }
  }

  return null
}

interface BudgetBody {
  salary?: number
  rent?: number
  food?: number
  transport?: number
  utilities?: number
  entertainment?: number
  shopping?: number
  city?: string
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as BudgetBody

    const requiredFields: (keyof BudgetBody)[] = [
      'salary',
      'rent',
      'food',
      'transport',
      'utilities',
      'entertainment',
      'shopping',
    ]
    for (const f of requiredFields) {
      const v = body[f]
      if (v === undefined || v === null || typeof v !== 'number' || isNaN(v)) {
        return Response.json(
          { error: `Missing or invalid required field: ${f}` },
          { status: 400 },
        )
      }
    }

    const { salary, rent, food, transport, utilities, entertainment, shopping } = body
    const city = body.city && typeof body.city === 'string' ? body.city : 'the city'

    const totalExpenses = rent + food + transport + utilities + entertainment + shopping
    const remaining = salary - totalExpenses
    const savingsRate = salary > 0 ? (remaining / salary) * 100 : 0

    const systemPrompt = `You are a financial advisor for people relocating to a new city. Analyze this budget and return a JSON object with EXACTLY these keys:
{
  "score": number,            // 0-100 overall financial health score
  "emergencyFund": number,    // 3 months estimated expenses as a single number
  "status": string,           // exactly one of: "Excellent" | "Good" | "Tight" | "Risky"
  "insights": [string, string, string],  // exactly 3 short actionable insights
  "alternatives": [string, string]       // exactly 2 cheaper alternatives/suggestions
}

ONLY output the JSON object. No prose, no markdown, no explanation.`

    const userMessage = `City: ${city}
Monthly Salary: ₹${salary}
Monthly Rent: ₹${rent}
Monthly Food: ₹${food}
Monthly Transport: ₹${transport}
Monthly Utilities: ₹${utilities}
Monthly Entertainment: ₹${entertainment}
Monthly Shopping: ₹${shopping}
Total Monthly Expenses: ₹${totalExpenses}
Remaining: ₹${remaining}
Savings Rate: ${savingsRate.toFixed(1)}%

Analyze and return the JSON object.`

    const zai = await ZAI.create()
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      thinking: { type: 'disabled' },
    })

    const text = completion.choices[0]?.message?.content ?? ''
    const analysis = parseBudgetAnalysis(text)

    if (analysis) {
      return Response.json({
        totals: { totalExpenses, remaining, savingsRate },
        analysis,
      })
    }

    return Response.json({
      totals: { totalExpenses, remaining, savingsRate },
      analysis: null,
      raw: text,
    })
  } catch (err) {
    console.error('[api/ai/budget] error:', err)
    return Response.json(
      { error: err instanceof Error ? err.message : 'Failed to analyze budget' },
      { status: 500 },
    )
  }
}
