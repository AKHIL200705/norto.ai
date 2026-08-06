import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

const POPULAR_LOCATIONS: Record<
  string,
  {
    lat: number
    lng: number
    city: string
    mainCity: string
    locality: string | null
    region: string
    country: string
    exactAddress: string
    displayName: string
  }
> = {
  singarayakonda: {
    lat: 15.2507,
    lng: 80.0213,
    city: 'Singarayakonda',
    mainCity: 'Singarayakonda',
    locality: null,
    region: 'Andhra Pradesh',
    country: 'India',
    exactAddress: 'Singarayakonda, Prakasam, Andhra Pradesh, 523101',
    displayName: 'Singarayakonda, Prakasam, Andhra Pradesh, 523101, India',
  },
  ongole: {
    lat: 15.5057,
    lng: 80.0499,
    city: 'Ongole',
    mainCity: 'Ongole',
    locality: null,
    region: 'Andhra Pradesh',
    country: 'India',
    exactAddress: 'Ongole, Prakasam, Andhra Pradesh, 523001',
    displayName: 'Ongole, Prakasam, Andhra Pradesh, 523001, India',
  },
  kavali: {
    lat: 14.9132,
    lng: 79.9926,
    city: 'Kavali',
    mainCity: 'Kavali',
    locality: null,
    region: 'Andhra Pradesh',
    country: 'India',
    exactAddress: 'Kavali, Nellore, Andhra Pradesh, 524201',
    displayName: 'Kavali, Nellore, Andhra Pradesh, 524201, India',
  },
  narasaraopet: {
    lat: 16.2307,
    lng: 80.041,
    city: 'Narasaraopet',
    mainCity: 'Narasaraopet',
    locality: null,
    region: 'Andhra Pradesh',
    country: 'India',
    exactAddress: 'Narasaraopet, Palnadu, Andhra Pradesh, 522601',
    displayName: 'Narasaraopet, Palnadu, Andhra Pradesh, 522601, India',
  },
  hyderabad: {
    lat: 17.385,
    lng: 78.4867,
    city: 'Hyderabad',
    mainCity: 'Hyderabad',
    locality: null,
    region: 'Telangana',
    country: 'India',
    exactAddress: 'Hyderabad, Telangana, 500001',
    displayName: 'Hyderabad, Telangana, India',
  },
  bengaluru: {
    lat: 12.9716,
    lng: 77.5946,
    city: 'Bengaluru',
    mainCity: 'Bengaluru',
    locality: null,
    region: 'Karnataka',
    country: 'India',
    exactAddress: 'Bengaluru, Karnataka, 560001',
    displayName: 'Bengaluru, Karnataka, India',
  },
  bangalore: {
    lat: 12.9716,
    lng: 77.5946,
    city: 'Bengaluru',
    mainCity: 'Bengaluru',
    locality: null,
    region: 'Karnataka',
    country: 'India',
    exactAddress: 'Bengaluru, Karnataka, 560001',
    displayName: 'Bengaluru, Karnataka, India',
  },
  vijayawada: {
    lat: 16.5062,
    lng: 80.648,
    city: 'Vijayawada',
    mainCity: 'Vijayawada',
    locality: null,
    region: 'Andhra Pradesh',
    country: 'India',
    exactAddress: 'Vijayawada, NTR, Andhra Pradesh, 520001',
    displayName: 'Vijayawada, NTR, Andhra Pradesh, 520001, India',
  },
  guntur: {
    lat: 16.3067,
    lng: 80.4365,
    city: 'Guntur',
    mainCity: 'Guntur',
    locality: null,
    region: 'Andhra Pradesh',
    country: 'India',
    exactAddress: 'Guntur, Andhra Pradesh, 522002',
    displayName: 'Guntur, Andhra Pradesh, India',
  },
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  // 1. FORWARD SEARCH MODE
  if (q && q.trim().length > 0) {
    const rawQuery = q.trim()
    const cleanKey = rawQuery.toLowerCase().replace(/[^a-z]/g, '')

    // Check fast local dictionary first
    if (POPULAR_LOCATIONS[cleanKey]) {
      const match = POPULAR_LOCATIONS[cleanKey]
      return Response.json({
        city: match.city,
        mainCity: match.mainCity,
        locality: match.locality,
        exactAddress: match.exactAddress,
        region: match.region,
        country: match.country,
        displayName: match.displayName,
        latitude: match.lat,
        longitude: match.lng,
      })
    }

    try {
      // Primary search: Nominatim
      const searchUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(rawQuery)}&format=json&addressdetails=1&accept-language=en&limit=1`
      const searchUpstream = await fetch(searchUrl, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'Norto/1.0 (city-assistant app)',
        },
        next: { revalidate: 300 },
      })

      if (searchUpstream.ok) {
        const results = await searchUpstream.json()
        if (Array.isArray(results) && results.length > 0) {
          const data = results[0]
          const addr = data.address || {}
          const latitude = parseFloat(data.lat)
          const longitude = parseFloat(data.lon)

          const locality =
            addr.neighbourhood ||
            addr.suburb ||
            addr.residential ||
            addr.quarter ||
            addr.city_district ||
            addr.hamlet ||
            addr.road ||
            null

          const mainCity =
            addr.village ||
            addr.town ||
            addr.city ||
            addr.municipality ||
            addr.county ||
            addr.state_district ||
            addr.state ||
            data.name ||
            rawQuery

          const city = locality && locality !== mainCity ? `${locality}, ${mainCity}` : mainCity

          const parts = [
            addr.house_number || addr.building,
            addr.road || addr.street,
            locality,
            mainCity,
            addr.postcode,
          ].filter((val, i, arr) => val && arr.indexOf(val) === i)

          const exactAddress = parts.length > 0 ? parts.join(', ') : city
          const region = addr.state || null
          const country = addr.country || null
          const displayName = data.display_name || null

          return Response.json({
            city,
            mainCity,
            locality,
            exactAddress,
            region,
            country,
            displayName,
            latitude,
            longitude,
          })
        }
      }

      // Secondary search fallback: Open-Meteo Geocoding
      const meteoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(rawQuery)}&count=1&language=en&format=json`
      const meteoUpstream = await fetch(meteoUrl)
      if (meteoUpstream.ok) {
        const meteoData = await meteoUpstream.json()
        if (meteoData.results && meteoData.results.length > 0) {
          const item = meteoData.results[0]
          const city = item.name || rawQuery
          const region = item.admin1 || null
          const country = item.country || null
          const exactAddress = [city, region, country].filter(Boolean).join(', ')
          return Response.json({
            city,
            mainCity: city,
            locality: null,
            exactAddress,
            region,
            country,
            displayName: exactAddress,
            latitude: item.latitude,
            longitude: item.longitude,
          })
        }
      }

      // Ultimate search fallback
      return Response.json({
        city: rawQuery,
        mainCity: rawQuery,
        locality: null,
        exactAddress: rawQuery,
        region: null,
        country: 'India',
        displayName: `${rawQuery}, India`,
        latitude: 15.2507,
        longitude: 80.0213,
      })
    } catch {
      return Response.json({
        city: rawQuery,
        mainCity: rawQuery,
        locality: null,
        exactAddress: rawQuery,
        region: null,
        country: 'India',
        displayName: `${rawQuery}, India`,
        latitude: 15.2507,
        longitude: 80.0213,
      })
    }
  }

  // 2. REVERSE GEOCODE MODE
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
        'User-Agent': 'Norto/1.0 (city-assistant app)',
      },
      next: { revalidate: 60 },
    })

    if (!upstream.ok) {
      // Fallback response instead of 500 error
      return Response.json({
        city: 'Local Area',
        mainCity: 'Local Area',
        locality: null,
        exactAddress: `Lat ${latitude.toFixed(4)}, Lng ${longitude.toFixed(4)}`,
        region: null,
        country: null,
        displayName: `Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        latitude,
        longitude,
      })
    }

    const data = await upstream.json()
    const addr = data.address || {}

    const locality =
      addr.neighbourhood ||
      addr.suburb ||
      addr.residential ||
      addr.quarter ||
      addr.city_district ||
      addr.hamlet ||
      addr.road ||
      null

    const mainCity =
      addr.village ||
      addr.town ||
      addr.city ||
      addr.municipality ||
      addr.county ||
      addr.state_district ||
      addr.state ||
      (data.name as string | undefined) ||
      'Local Area'

    const city = locality && locality !== mainCity ? `${locality}, ${mainCity}` : mainCity

    const parts = [
      addr.house_number || addr.building,
      addr.road || addr.street,
      locality,
      mainCity,
      addr.postcode,
    ].filter((val, i, arr) => val && arr.indexOf(val) === i)

    const exactAddress = parts.length > 0 ? parts.join(', ') : city
    const region = addr.state || null
    const country = addr.country || null
    const displayName = data.display_name || null

    return Response.json({
      city,
      mainCity,
      locality,
      exactAddress,
      region,
      country,
      displayName,
      latitude,
      longitude,
    })
  } catch {
    return Response.json({
      city: 'Local Area',
      mainCity: 'Local Area',
      locality: null,
      exactAddress: `Lat ${latitude.toFixed(4)}, Lng ${longitude.toFixed(4)}`,
      region: null,
      country: null,
      displayName: `Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      latitude,
      longitude,
    })
  }
}
