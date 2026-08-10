import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/places/nearby?lat=17.385&lng=78.4867&categories=restaurant,hospital&radius=3000
 *
 * Fetches REAL points of interest near the user's live coordinates using
 * OpenStreetMap's Overpass API. Returns accurate place names, addresses,
 * coordinates, and Haversine distances (in km) from the user.
 *
 * If lat/lng are omitted, falls back to geocoding the ?city= param via
 * Nominatim to get approximate city-centre coordinates.
 */

// Map our internal category IDs → OSM tag filters
const CATEGORY_OSM: Record<string, { key: string; value: string }[]> = {
  restaurant: [{ key: 'amenity', value: 'restaurant' }, { key: 'amenity', value: 'cafe' }, { key: 'amenity', value: 'fast_food' }],
  hotel: [{ key: 'tourism', value: 'hotel' }],
  hostel: [{ key: 'tourism', value: 'hostel' }, { key: 'tourism', value: 'guest_house' }],
  hospital: [{ key: 'amenity', value: 'hospital' }, { key: 'amenity', value: 'clinic' }],
  police: [{ key: 'amenity', value: 'police' }],
  bus: [{ key: 'highway', value: 'bus_stop' }, { key: 'public_transport', value: 'platform' }],
  bank: [{ key: 'amenity', value: 'bank' }],
  atm: [{ key: 'amenity', value: 'atm' }],
  coworking: [{ key: 'amenity', value: 'coworking_space' }, { key: 'office', value: 'company' }],
  shopping: [{ key: 'shop', value: 'mall' }, { key: 'shop', value: 'supermarket' }, { key: 'shop', value: 'department_store' }],
  pharmacy: [{ key: 'amenity', value: 'pharmacy' }],
  fuel: [{ key: 'amenity', value: 'fuel' }],
  tourist: [{ key: 'tourism', value: 'attraction' }, { key: 'tourism', value: 'museum' }, { key: 'tourism', value: 'viewpoint' }],
}

const ALL_CATEGORIES = Object.keys(CATEGORY_OSM)

/** Haversine distance in km between two lat/lng points */
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

interface RawPlace {
  id: string
  name: string
  category: string
  lat: number
  lng: number
  distanceKm: number
  address: string
  open: boolean | null
  osmId: string
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const latParam = searchParams.get('lat')
  const lngParam = searchParams.get('lng')
  const cityParam = searchParams.get('city')
  const catsParam = searchParams.get('categories') || ''
  const radius = Math.min(parseInt(searchParams.get('radius') || '3500'), 8000) // meters, capped

  let lat: number | null = latParam ? parseFloat(latParam) : null
  let lng: number | null = lngParam ? parseFloat(lngParam) : null

  // If no coords, try forward-geocoding the city name via Nominatim
  if ((lat === null || Number.isNaN(lat) || lng === null || Number.isNaN(lng)) && cityParam) {
    try {
      const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityParam)}&format=json&limit=1&accept-language=en`
      const geoRes = await fetch(geoUrl, {
        headers: { 'User-Agent': 'Norto/1.0 (city-assistant app)', Accept: 'application/json' },
      })
      if (geoRes.ok) {
        const geoData = await geoRes.json()
        if (Array.isArray(geoData) && geoData.length > 0) {
          lat = parseFloat(geoData[0].lat)
          lng = parseFloat(geoData[0].lon)
        }
      }
    } catch {
      // fall through to error
    }
  }

  if (lat === null || Number.isNaN(lat) || lng === null || Number.isNaN(lng)) {
    return Response.json(
      { error: 'Provide lat & lng query params (or a city name to geocode).' },
      { status: 400 }
    )
  }

  // Parse requested categories (default: all)
  const requestedCats = catsParam
    ? catsParam.split(',').filter((c) => ALL_CATEGORIES.includes(c))
    : ALL_CATEGORIES

  if (requestedCats.length === 0) {
    return Response.json({ places: [], lat, lng })
  }

  // Build the Overpass QL query
  const filterParts = requestedCats.flatMap((cat) =>
    CATEGORY_OSM[cat].map(
      (tag) =>
        `node["${tag.key}"="${tag.value}"](around:${radius},${lat},${lng});` +
        `way["${tag.key}"="${tag.value}"](around:${radius},${lat},${lng});`
    )
  )
  const query = `[out:json][timeout:25];(${filterParts.join('')});out center 50;`

  try {
    const overpassUrl = 'https://overpass-api.de/api/interpreter'
    const body = new URLSearchParams()
    body.append('data', query)

    // Try the primary Overpass endpoint first (20s timeout), then the mirror.
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 25000)
    let overpassRes: Response
    try {
      overpassRes = await fetch(overpassUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Norto/1.0 (city-assistant app)',
        },
        body: body.toString(),
        signal: controller.signal,
      })
    } catch {
      // Primary failed/aborted — try the mirror
      const mirrorController = new AbortController()
      const mirrorTimeout = setTimeout(() => mirrorController.abort(), 25000)
      try {
        const mirrorRes = await fetch('https://overpass.kumi.systems/api/interpreter', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Norto/1.0 (city-assistant app)',
          },
          body: body.toString(),
          signal: mirrorController.signal,
        })
        clearTimeout(mirrorTimeout)
        if (!mirrorRes.ok) {
          return Response.json(
            { error: 'Map service is busy right now. Please try again.' },
            { status: 502 }
          )
        }
        const mirrorData = await mirrorRes.json()
        return processOverpass(mirrorData, lat, lng, requestedCats)
      } finally {
        clearTimeout(mirrorTimeout)
      }
    }
    clearTimeout(timeout)

    if (!overpassRes.ok) {
      return Response.json(
        { error: 'Map service is busy right now. Please try again.' },
        { status: 502 }
      )
    }

    const data = await overpassRes.json()
    return processOverpass(data, lat, lng, requestedCats)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown Overpass error'
    return Response.json({ error: message }, { status: 500 })
  }
}

function processOverpass(
  data: { elements?: any[] },
  userLat: number,
  userLng: number,
  requestedCats: string[]
): Response {
  const elements = data.elements || []
  const catLookup: Record<string, string> = {} // osmId → category
  // Build a reverse map: which category does a given OSM tag belong to?
  for (const cat of requestedCats) {
    for (const tag of CATEGORY_OSM[cat]) {
      catLookup[`${tag.key}=${tag.value}`] = cat
    }
  }

  const seen = new Set<string>()
  const places: RawPlace[] = []

  for (const el of elements) {
    const tags = el.tags || {}
    const elLat = el.lat ?? el.center?.lat
    const elLng = el.lon ?? el.center?.lon
    if (elLat == null || elLng == null) continue

    // Determine category from the tags
    let category: string | undefined
    for (const [key, value] of Object.entries(tags)) {
      const cat = catLookup[`${key}=${value}`]
      if (cat) {
        category = cat
        break
      }
    }
    if (!category) continue

    const name = tags.name || tags['name:en'] || tags.brand || generateFallbackName(category, tags)
    const osmId = `${el.type}_${el.id}`
    if (seen.has(osmId)) continue
    seen.add(osmId)

    // Build address from available tags
    const addressParts = [
      tags['addr:housename'],
      tags['addr:street'],
      tags['addr:suburb'],
      tags['addr:neighbourhood'],
      tags['addr:city'] || tags.city,
    ].filter(Boolean)
    const address = addressParts.length > 0 ? addressParts.join(', ') : ''

    // Opening hours — best-effort: assume open if no info, else try to parse
    let open: boolean | null = null
    const oh = tags.opening_hours
    if (oh) {
      open = parseOpenNow(oh)
    }

    const distanceKm = haversine(userLat, userLng, elLat, elLng)

    places.push({
      id: osmId,
      name,
      category,
      lat: elLat,
      lng: elLng,
      distanceKm,
      address,
      open,
      osmId,
    })
  }

  // Sort by distance (nearest first)
  places.sort((a, b) => a.distanceKm - b.distanceKm)

  // Limit to 40 places for performance
  return Response.json({
    places: places.slice(0, 40),
    total: places.length,
    lat: userLat,
    lng: userLng,
    radius: '3500',
  })
}

function generateFallbackName(category: string, tags: Record<string, string>): string {
  const labels: Record<string, string> = {
    restaurant: 'Restaurant',
    hotel: 'Hotel',
    hostel: 'Hostel',
    hospital: 'Hospital',
    police: 'Police Station',
    metro: 'Metro Station',
    bus: 'Bus Stop',
    bank: 'Bank',
    atm: 'ATM',
    coworking: 'Office',
    shopping: 'Shop',
    pharmacy: 'Pharmacy',
    fuel: 'Fuel Station',
    tourist: 'Attraction',
  }
  // Try to use cuisine / shop type for a more descriptive name
  if (tags.cuisine) return `${tags.cuisine.replace(/_/g, ' ')} place`.replace(/\b\w/g, (c) => c.toUpperCase())
  if (tags.shop) return `${tags.shop.replace(/_/g, ' ')}`.replace(/\b\w/g, (c) => c.toUpperCase())
  if (tags.brand) return tags.brand
  return labels[category] || 'Place'
}

/**
 * Very basic opening_hours parser — returns true if likely open now.
 * Full OSM opening_hours spec is complex; this handles the common
 * "Mo-Su 09:00-22:00" style and defaults to null (unknown) otherwise.
 */
function parseOpenNow(oh: string): boolean | null {
  try {
    const now = new Date()
    const day = now.getDay() // 0=Sun ... 6=Sat
    const dayCodes = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
    const todayCode = dayCodes[day]
    const hour = now.getHours() * 100 + now.getMinutes()

    // Match patterns like "09:00-22:00" or "Mo-Su 09:00-22:00"
    const timeMatch = oh.match(/(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})/)
    if (!timeMatch) return null

    const open = parseInt(timeMatch[1]) * 100 + parseInt(timeMatch[2])
    const close = parseInt(timeMatch[3]) * 100 + parseInt(timeMatch[4])

    // Check day range if present
    const dayMatch = oh.match(/([A-Z][a-z])-([A-Z][a-z])/)
    if (dayMatch) {
      const startIdx = dayCodes.indexOf(dayMatch[1])
      const endIdx = dayCodes.indexOf(dayMatch[2])
      if (startIdx <= endIdx) {
        if (day < startIdx || day > endIdx) return false
      } else {
        // wraps around (e.g. Sa-We)
        if (day > endIdx && day < startIdx) return false
      }
    } else {
      // Check if today's code is mentioned
      const dayPattern = new RegExp(`\\b${todayCode}\\b`)
      const allDaysPattern = /Mo|Tu|We|Th|Fr|Sa|Su/
      if (allDaysPattern.test(oh) && !dayPattern.test(oh)) return false
    }

    return hour >= open && hour <= close
  } catch {
    return null
  }
}
