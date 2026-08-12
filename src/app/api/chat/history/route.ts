import { db } from '@/lib/db'
import { getOrCreateDemoUser } from '@/lib/user'

export const dynamic = 'force-dynamic'

/**
 * GET /api/chat/history
 * Fetches all saved chat messages from Supabase PostgreSQL database
 */
export async function GET(req: Request) {
  try {
    const user = await getOrCreateDemoUser()
    if (!user || !user.id) {
      return Response.json({ history: [] })
    }

    const records = await db.chatHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'asc' },
      take: 200,
    })

    return Response.json({
      history: records.map((r) => ({
        id: r.id,
        role: r.role,
        content: r.content,
        section: r.section || 'assistant',
        createdAt: r.createdAt.toISOString(),
      })),
      source: 'supabase_postgres',
    })
  } catch (err) {
    console.error('[api/chat/history GET] error:', err)
    return Response.json({ history: [], error: 'Failed to fetch Supabase chat history' })
  }
}

/**
 * POST /api/chat/history
 * Saves or syncs chat messages into Supabase PostgreSQL database
 */
export async function POST(req: Request) {
  try {
    const user = await getOrCreateDemoUser()
    if (!user || !user.id) {
      return Response.json({ error: 'User unavailable' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const { role, content, section, messages } = body as {
      role?: string
      content?: string
      section?: string
      messages?: Array<{ role: string; content: string; section?: string }>
    }

    if (Array.isArray(messages) && messages.length > 0) {
      const valid = messages
        .filter((m) => m && m.role && m.content && typeof m.content === 'string' && m.content.trim())
        .map((m) => ({
          userId: user.id,
          role: m.role.trim(),
          content: m.content.trim(),
          section: (m.section || section || 'assistant').trim(),
        }))

      if (valid.length > 0) {
        await db.chatHistory.createMany({ data: valid })
      }
      return Response.json({ success: true, count: valid.length })
    }

    if (!content || typeof content !== 'string' || !content.trim()) {
      return Response.json({ error: 'Missing content field' }, { status: 400 })
    }

    const record = await db.chatHistory.create({
      data: {
        userId: user.id,
        role: (role || 'user').trim(),
        content: content.trim(),
        section: (section || 'assistant').trim(),
      },
    })

    return Response.json({
      success: true,
      message: {
        id: record.id,
        role: record.role,
        content: record.content,
        section: record.section,
        createdAt: record.createdAt.toISOString(),
      },
    })
  } catch (err) {
    console.error('[api/chat/history POST] error:', err)
    return Response.json(
      { error: err instanceof Error ? err.message : 'Failed to save to Supabase' },
      { status: 500 },
    )
  }
}

/**
 * DELETE /api/chat/history
 * Clears chat history for the user from Supabase PostgreSQL database
 */
export async function DELETE(req: Request) {
  try {
    const user = await getOrCreateDemoUser()
    if (!user || !user.id) {
      return Response.json({ success: true })
    }

    const body = await req.json().catch(() => ({}))
    const { section } = body as { section?: string }

    if (section && typeof section === 'string' && section.trim()) {
      await db.chatHistory.deleteMany({
        where: { userId: user.id, section: section.trim() },
      })
    } else {
      await db.chatHistory.deleteMany({
        where: { userId: user.id },
      })
    }

    return Response.json({ success: true })
  } catch (err) {
    console.error('[api/chat/history DELETE] error:', err)
    return Response.json(
      { error: err instanceof Error ? err.message : 'Failed to clear Supabase chat history' },
      { status: 500 },
    )
  }
}
