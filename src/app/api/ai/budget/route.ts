import ZAI from 'z-ai-web-dev-sdk'

export const dynamic = 'force-dynamic'

interface BudgetAnalysis {
  score: number
  emergencyFund: {
    recommended: number
    months3: number
    months6: number
  }
  status: 'Healthy' | 'Moderate' | 'Critical'
  insights: string[]
  alternatives: string[]
}

function generateFallbackBudgetAnalysis(
  totalIncome: number,
  totalExpenses: number,
): BudgetAnalysis {
  const remaining = totalIncome - totalExpenses
  const savingsRate = totalIncome > 0 ? (remaining / totalIncome) * 100 : 0
  const monthlyExpense = totalExpenses > 0 ? totalExpenses : 15000

  let score = 75
  let status: 'Healthy' | 'Moderate' | 'Critical' = 'Healthy'

  if (savingsRate < 10) {
    score = 45
    status = 'Critical'
  } else if (savingsRate < 20) {
    score = 65
    status = 'Moderate'
  } else {
    score = 85
    status = 'Healthy'
  }

  return {
    score,
    status,
    emergencyFund: {
      recommended: monthlyExpense * 3,
      months3: monthlyExpense * 3,
      months6: monthlyExpense * 6,
    },
    insights: [
      `Your current monthly savings rate is **${Math.round(savingsRate)}%** (remaining ₹${remaining.toLocaleString('en-IN')}).`,
      `Rent & Food account for the primary share of your monthly budget.`,
      `Maintaining a 3-month emergency fund of ₹${(monthlyExpense * 3).toLocaleString('en-IN')} gives you peace of mind in a new city.`,
    ],
    alternatives: [
      `Opting for shared PG accommodation or cooking at home can save ~₹3,000–₹5,000 monthly.`,
      `Using monthly bus/local transit passes reduces daily commute cost.`,
    ],
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { income, rent, food, transport, utilities, entertainment, shopping } = body as Record<string, number>

    const totalIncome = typeof income === 'number' && !isNaN(income) ? income : 25000
    const r = typeof rent === 'number' && !isNaN(rent) ? rent : 8000
    const f = typeof food === 'number' && !isNaN(food) ? food : 4000
    const t = typeof transport === 'number' && !isNaN(transport) ? transport : 1500
    const u = typeof utilities === 'number' && !isNaN(utilities) ? utilities : 1200
    const e = typeof entertainment === 'number' && !isNaN(entertainment) ? entertainment : 1500
    const s = typeof shopping === 'number' && !isNaN(shopping) ? shopping : 1800

    const totalExpenses = r + f + t + u + e + s
    const remaining = totalIncome - totalExpenses
    const savingsRate = totalIncome > 0 ? Number(((remaining / totalIncome) * 100).toFixed(1)) : 0

    const totals = {
      totalIncome,
      totalExpenses,
      remaining,
      savingsRate,
    }

    try {
      const zai = await ZAI.create()
      const systemPrompt = `You are Norto's financial advisor. Analyze the monthly budget totals: Income ₹${totalIncome}, Expenses ₹${totalExpenses}. Output JSON.`
      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Analyze this budget now.' },
        ],
        thinking: { type: 'disabled' },
      })

      const text = completion.choices[0]?.message?.content ?? ''
      try {
        const parsed = JSON.parse(text)
        if (parsed && typeof parsed === 'object') {
          return Response.json({ totals, analysis: parsed })
        }
      } catch {
        // Fallback
      }
    } catch {
      // Fallback
    }

    return Response.json({
      totals,
      analysis: generateFallbackBudgetAnalysis(totalIncome, totalExpenses),
    })
  } catch (err) {
    console.error('[api/ai/budget] error:', err)
    return Response.json({
      totals: { totalIncome: 25000, totalExpenses: 18000, remaining: 7000, savingsRate: 28 },
      analysis: generateFallbackBudgetAnalysis(25000, 18000),
    })
  }
}
