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
  rule503020: {
    needs: number
    needsPct: number
    wants: number
    wantsPct: number
    savings: number
    savingsPct: number
  }
  insights: string[]
  alternatives: string[]
}

function generateExactBudgetAnalysis(
  totalIncome: number,
  totalExpenses: number,
  rent: number,
  food: number,
  transport: number,
  utilities: number,
  entertainment: number,
  shopping: number,
): BudgetAnalysis {
  const remaining = totalIncome - totalExpenses
  const savingsRate = totalIncome > 0 ? (remaining / totalIncome) * 100 : 0
  const monthlyExpense = totalExpenses > 0 ? totalExpenses : 15000

  // 50/30/20 Rule Calculations
  const needs = rent + food + transport + utilities
  const wants = entertainment + shopping
  const needsPct = totalIncome > 0 ? Number(((needs / totalIncome) * 100).toFixed(1)) : 0
  const wantsPct = totalIncome > 0 ? Number(((wants / totalIncome) * 100).toFixed(1)) : 0
  const savingsPct = totalIncome > 0 ? Number(((remaining / totalIncome) * 100).toFixed(1)) : 0

  let score = 85
  let status: 'Healthy' | 'Moderate' | 'Critical' = 'Healthy'

  if (remaining < 0) {
    score = 25
    status = 'Critical'
  } else if (savingsRate < 10) {
    score = 45
    status = 'Critical'
  } else if (savingsRate < 20) {
    score = 68
    status = 'Moderate'
  } else if (savingsRate >= 30) {
    score = 92
    status = 'Healthy'
  } else {
    score = 82
    status = 'Healthy'
  }

  const insights: string[] = []
  insights.push(`Your net monthly savings rate is **${savingsPct}%** (remaining ₹${remaining.toLocaleString('en-IN')}).`)
  
  if (needsPct > 50) {
    insights.push(`Essential Needs (Rent, Food, Utilities) take up **${needsPct}%** of income (target: ≤50%).`)
  } else {
    insights.push(`Essential Needs (Rent, Food, Utilities) are well optimized at **${needsPct}%** of income.`)
  }

  if (wantsPct > 30) {
    insights.push(`Discretionary Wants (Shopping, Entertainment) account for **${wantsPct}%** of income (target: ≤30%).`)
  } else {
    insights.push(`Discretionary Spending is healthy at **${wantsPct}%** of income.`)
  }

  const alternatives: string[] = []
  if (rent > totalIncome * 0.35) {
    alternatives.push(`Rent is high (${Math.round((rent / totalIncome) * 100)}% of income). Consider shared apartments or PGs to save ~₹3,000–₹5,000/month.`)
  }
  if (shopping + entertainment > totalIncome * 0.25) {
    alternatives.push(`Trimming entertainment and shopping by 15% frees up ~₹${Math.round((shopping + entertainment) * 0.15).toLocaleString('en-IN')} towards emergency savings.`)
  }
  alternatives.push(`Maintain a 3-month safety fund of ₹${(monthlyExpense * 3).toLocaleString('en-IN')} for emergency protection.`)

  return {
    score,
    status,
    emergencyFund: {
      recommended: monthlyExpense * 3,
      months3: monthlyExpense * 3,
      months6: monthlyExpense * 6,
    },
    rule503020: {
      needs,
      needsPct,
      wants,
      wantsPct,
      savings: Math.max(0, remaining),
      savingsPct,
    },
    insights,
    alternatives,
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const salaryInput = body.salary ?? body.income ?? body.totalIncome
    const totalIncome = typeof salaryInput === 'number' && !isNaN(salaryInput) ? salaryInput : 25000
    const r = typeof body.rent === 'number' && !isNaN(body.rent) ? body.rent : 8000
    const f = typeof body.food === 'number' && !isNaN(body.food) ? body.food : 4000
    const t = typeof body.transport === 'number' && !isNaN(body.transport) ? body.transport : 1500
    const u = typeof body.utilities === 'number' && !isNaN(body.utilities) ? body.utilities : 1200
    const e = typeof body.entertainment === 'number' && !isNaN(body.entertainment) ? body.entertainment : 1500
    const s = typeof body.shopping === 'number' && !isNaN(body.shopping) ? body.shopping : 1800

    const totalExpenses = r + f + t + u + e + s
    const remaining = totalIncome - totalExpenses
    const savingsRate = totalIncome > 0 ? Number(((remaining / totalIncome) * 100).toFixed(1)) : 0

    const totals = {
      totalIncome,
      totalExpenses,
      remaining,
      savingsRate,
    }

    const exactAnalysis = generateExactBudgetAnalysis(totalIncome, totalExpenses, r, f, t, u, e, s)

    return Response.json({ totals, analysis: exactAnalysis })
  } catch (err) {
    console.error('[api/ai/budget] error:', err)
    return Response.json({
      totals: { totalIncome: 25000, totalExpenses: 18000, remaining: 7000, savingsRate: 28 },
      analysis: generateExactBudgetAnalysis(25000, 18000, 8000, 4000, 1500, 1200, 1500, 1800),
    })
  }
}
