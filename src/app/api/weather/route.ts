import ZAI from 'z-ai-web-dev-sdk'

export const dynamic = 'force-dynamic'

interface CurrentWeather {
  temp: string
  condition: string
  humidity: string
  wind: string
  uv: string
  feelsLike: string
}

interface ForecastDay {
  day: string
  temp: string
  condition: string
  icon: 'sun' | 'cloud' | 'rain' | 'storm' | 'snow' | 'fog'
  humidity: string
  wind: string
  uv: string
}

interface WeatherPayload {
  current: CurrentWeather
  forecast: ForecastDay[]
  clothing: string
  travelTip: string
}

function parseWeather(text: string): WeatherPayload | null {
  if (!text) return null
  const trimmed = text.trim()

  try {
    const parsed = JSON.parse(trimmed)
    if (parsed && typeof parsed === 'object' && parsed.current && Array.isArray(parsed.forecast)) {
      return parsed as WeatherPayload
    }
  } catch {
    // continue
  }

  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fenceMatch) {
    try {
      const parsed = JSON.parse(fenceMatch[1].trim())
      if (parsed && typeof parsed === 'object' && parsed.current && Array.isArray(parsed.forecast)) {
        return parsed as WeatherPayload
      }
    } catch {
      // continue
    }
  }

  const firstBrace = trimmed.indexOf('{')
  const lastBrace = trimmed.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try {
      const parsed = JSON.parse(trimmed.slice(firstBrace, lastBrace + 1))
      if (parsed && typeof parsed === 'object' && parsed.current && Array.isArray(parsed.forecast)) {
        return parsed as WeatherPayload
      }
    } catch {
      // continue
    }
  }

  return null
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const city = searchParams.get('city')

    if (!city || !city.trim()) {
      return Response.json({ error: 'Missing required query param: city' }, { status: 400 })
    }

    const zai = await ZAI.create()

    // Step 1: web search for current weather + forecast
    let searchSnippet = ''
    try {
      const results = await zai.functions.invoke('web_search', {
        query: `current weather and 7-day forecast for ${city} today`,
        num: 8,
      })
      if (Array.isArray(results)) {
        searchSnippet = results
          .map((r: unknown) => {
            if (typeof r === 'string') return r
            if (r && typeof r === 'object') {
              const obj = r as Record<string, unknown>
              const title = typeof obj.title === 'string' ? obj.title : ''
              const snippet = typeof obj.snippet === 'string' ? obj.snippet : ''
              const content = typeof obj.content === 'string' ? obj.content : ''
              return [title, snippet, content].filter(Boolean).join(' — ')
            }
            return ''
          })
          .filter(Boolean)
          .join('\n\n')
      }
    } catch (e) {
      console.warn('[api/weather] web_search failed:', e)
    }

    // Step 2: LLM synthesizes structured JSON from search results
    const systemPrompt = `You are Norto's weather assistant. Using the provided web search results about the weather in ${city}, produce a structured JSON object. ONLY output the JSON, no prose, no markdown fences.

The JSON MUST have this exact shape:
{
  "current": {
    "temp": "string (e.g. '31°C')",
    "condition": "string (e.g. 'Partly Cloudy')",
    "humidity": "string (e.g. '65%')",
    "wind": "string (e.g. '12 km/h')",
    "uv": "string (e.g. 'High' or '6')",
    "feelsLike": "string (e.g. '34°C')"
  },
  "forecast": [
    {
      "day": "string (e.g. 'Mon', 'Tue', or 'Today')",
      "temp": "string (e.g. '32°/24°' or '30°C')",
      "condition": "string",
      "icon": "exactly one of: 'sun' | 'cloud' | 'rain' | 'storm' | 'snow' | 'fog'",
      "humidity": "string",
      "wind": "string",
      "uv": "string"
    }
    // exactly 7 entries, starting today
  ],
  "clothing": "string — 1 sentence clothing suggestion for today",
  "travelTip": "string — 1 sentence travel tip considering the weather"
}

Provide realistic values for ${city} based on the search results and current season. If exact numbers aren't available, give sensible estimates. The forecast array MUST contain exactly 7 entries.`

    const userMessage = `City: ${city}

Web search results:
${searchSnippet || '(no web search results available — use your knowledge of typical weather in this city during the current season)'}

Produce the structured weather JSON now.`

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      thinking: { type: 'disabled' },
    })

    const text = completion.choices[0]?.message?.content ?? ''
    const weather = parseWeather(text)

    if (weather) {
      return Response.json({ weather })
    }

    // Sensible fallback if parsing failed
    const fallback: WeatherPayload = {
      current: {
        temp: 'N/A',
        condition: 'Unable to determine',
        humidity: 'N/A',
        wind: 'N/A',
        uv: 'N/A',
        feelsLike: 'N/A',
      },
      forecast: [],
      clothing: `Dress comfortably for the season in ${city}.`,
      travelTip: `Check a local weather app before heading out in ${city}.`,
    }

    return Response.json({ weather: fallback, raw: text })
  } catch (err) {
    console.error('[api/weather] error:', err)
    return Response.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch weather' },
      { status: 500 },
    )
  }
}
