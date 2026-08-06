import ZAI from 'z-ai-web-dev-sdk'

export const dynamic = 'force-dynamic'

// Accept a data URL like `data:image/jpeg;base64,...`
function parseDataUrl(dataUrl: string): { mimeType: string; base64: string } | null {
  if (!dataUrl || typeof dataUrl !== 'string') return null
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
  if (!match) return null
  return { mimeType: match[1], base64: match[2] }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { image } = body as { image?: string }

    if (!image || typeof image !== 'string' || !image.trim()) {
      return Response.json({ error: 'Missing required field: image (data URL)' }, { status: 400 })
    }

    const parsed = parseDataUrl(image)
    if (!parsed) {
      return Response.json(
        { error: 'Invalid image data URL. Expected data:<mime>;base64,<...>' },
        { status: 400 },
      )
    }

    const prompt = `Extract ALL text from this image. Then provide:
1) **Extracted Text** — the verbatim text content from the image (preserve line breaks).
2) **Summary** — a 2-3 sentence summary of what the text says.
3) **Translation to English** — if the text is not already in English, translate it. If it is already English, note "Already in English."

Format the response as Markdown with these three exact headings:
## Extracted Text
## Summary
## Translation to English`

    const zai = await ZAI.create()
    const response = await zai.chat.completions.createVision({
      model: 'glm-4v',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: { url: `data:${parsed.mimeType};base64,${parsed.base64}` },
            },
          ],
        },
      ],
      thinking: { type: 'disabled' },
    })

    const result = response.choices[0]?.message?.content ?? ''

    return Response.json({ result })
  } catch (err) {
    console.error('[api/ocr] error:', err)
    return Response.json(
      { error: err instanceof Error ? err.message : 'Failed to perform OCR' },
      { status: 500 },
    )
  }
}
