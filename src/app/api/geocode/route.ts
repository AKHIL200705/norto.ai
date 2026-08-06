import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Reverse-geocode endpoint.
 *
 * GET /api/geocode?lat=17.385&lng=78.4867
 *
 * Server-side reverse geocoding via OpenStreetMap's Nominatim API
 * (free, no API key, works server-side with a proper User-Agent).
 * Doing this on the server avoids any client-side CORS / ad-blocker issues
 * and keeps the request on a relative path.
 *
 * Returns: { city, locality, region, country, latitude, longitude }
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  if (!lat || !lng) {
    return Response.json({ error: 'lat and lng query params are required' }, { status: 400 })
  }

  const latitude = parseFloat(lat)
  const longitude = parseFloat(lng)
  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return Response.json({ error: 'lat and lng must be valid numbers' }, { status: 400 })
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&accept-language=en`
    const upstream = await fetch(url, {
      headers: {
        Accept: 'application/json',
        // Nominatim usage policy requires a valid identifying User-Agent
        'User-Agent': 'Norto/1.0 (city-assistant app)',
      },
      next: { revalidate: 60 },
    })

    if (!upstream.ok) {
      return Response.json(
        { error: `Geocode upstream returned ${upstream.status}` },
        { status: 502 }
      )
    }

    const data = await upstream.json()
    const addr = data.address || {}

    // Nominatim uses different fields depending on place size — pick the
    // most specific settlement name available.
    const city =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.municipality ||
      addr.county ||
      addr.state_district ||
      addr.state ||
      (data.name as string | undefined) ||
      'Unknown area'

    const locality =
      addr.neighbourhood || addr.suburb || addr.city_district || addr.quarter || null
    const region = addr.state || null
    const country = addr.country || null

    return Response.json({
      city,
      locality,
      region,
      country,
      latitude,
      longitude,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown geocode error'
    return Response.json({ error: message }, { status: 500 })
  }
}
