import { db } from '@/lib/db'
import { getOrCreateDemoUser } from '@/lib/user'

export const dynamic = 'force-dynamic'

interface CreatePlaceBody {
  name?: string
  category?: string
  address?: string
  rating?: number
  price?: string
  distance?: string
  notes?: string
}

// POST — create a saved place for the demo user
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as CreatePlaceBody

    if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
      return Response.json({ error: 'Missing required field: name' }, { status: 400 })
    }
    if (!body.category || typeof body.category !== 'string' || !body.category.trim()) {
      return Response.json({ error: 'Missing required field: category' }, { status: 400 })
    }

    const user = await getOrCreateDemoUser()

    const data: {
      userId: string
      name: string
      category: string
      address?: string
      rating?: number
      price?: string
      distance?: string
      notes?: string
    } = {
      userId: user.id,
      name: body.name.trim(),
      category: body.category.trim(),
    }

    if (typeof body.address === 'string' && body.address.trim()) {
      data.address = body.address.trim()
    }
    if (typeof body.rating === 'number' && !isNaN(body.rating)) {
      data.rating = body.rating
    }
    if (typeof body.price === 'string' && body.price.trim()) {
      data.price = body.price.trim()
    }
    if (typeof body.distance === 'string' && body.distance.trim()) {
      data.distance = body.distance.trim()
    }
    if (typeof body.notes === 'string' && body.notes.trim()) {
      data.notes = body.notes.trim()
    }

    const place = await db.savedPlace.create({ data })

    return Response.json({ place })
  } catch (err) {
    console.error('[api/places POST] error:', err)
    return Response.json(
      { error: err instanceof Error ? err.message : 'Failed to save place' },
      { status: 500 },
    )
  }
}

// GET — list all saved places for the demo user, newest first
export async function GET() {
  try {
    const user = await getOrCreateDemoUser()
    const places = await db.savedPlace.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })
    return Response.json({ places })
  } catch (err) {
    console.error('[api/places GET] error:', err)
    return Response.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch places' },
      { status: 500 },
    )
  }
}

// DELETE — delete a saved place by id (must belong to the demo user)
export async function DELETE(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { id } = body as { id?: string }

    if (!id || typeof id !== 'string' || !id.trim()) {
      return Response.json({ error: 'Missing required field: id' }, { status: 400 })
    }

    const user = await getOrCreateDemoUser()

    // Ensure the place belongs to this user before deleting
    const existing = await db.savedPlace.findUnique({ where: { id } })
    if (!existing || existing.userId !== user.id) {
      return Response.json({ error: 'Place not found' }, { status: 404 })
    }

    await db.savedPlace.delete({ where: { id } })

    return Response.json({ success: true })
  } catch (err) {
    console.error('[api/places DELETE] error:', err)
    return Response.json(
      { error: err instanceof Error ? err.message : 'Failed to delete place' },
      { status: 500 },
    )
  }
}
