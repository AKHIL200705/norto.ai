import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Multi-provider reverse geocoding via BigDataCloud client API
 * High precision for Indian towns, villages, mandals, and sub-localities.
 */
async function reverseGeocodeBigDataCloud(lat: number, lng: number) {
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return null
    const data = await res.json()
    if (data && (data.locality || data.city || data.principalSubdivision)) {
      const locality = data.locality || data.localityInfo?.informative?.[0]?.name || null
      const mainCity = data.city || data.localityInfo?.administrative?.[2]?.name || data.localityInfo?.administrative?.[1]?.name || 'Local Area'
      const region = data.principalSubdivision || null
      const country = data.countryName || 'India'
      const city = locality && locality !== mainCity ? `${locality}, ${mainCity}` : mainCity
      const exactAddress = [locality, mainCity, region, country].filter(Boolean).join(', ')

      return {
        city,
        mainCity,
        locality,
        exactAddress,
        region,
        country,
        displayName: exactAddress,
        latitude: lat,
        longitude: lng,
      }
    }
    return null
  } catch {
    return null
  }
}

/**
 * Reverse geocoding via OpenStreetMap Nominatim (Zoom 14 for optimal town/subdistrict balance)
 */
async function reverseGeocodeNominatim(lat: number, lng: number) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&zoom=14&accept-language=en`
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Norto/1.0 (city-assistant app)',
      },
      cache: 'no-store',
    })
    if (!res.ok) return null
    const data = await res.json()
    const addr = data.address || {}

    const locality =
      addr.suburb ||
      addr.neighbourhood ||
      addr.residential ||
      addr.village ||
      addr.hamlet ||
      addr.subdistrict ||
      addr.quarter ||
      null

    const mainCity =
      addr.town ||
      addr.city ||
      addr.municipality ||
      addr.district ||
      addr.county ||
      addr.state_district ||
      addr.state ||
      'Local Area'

    const city = locality && locality !== mainCity ? `${locality}, ${mainCity}` : mainCity

    const parts = [
      addr.road || addr.street,
      locality,
      mainCity,
      addr.state_district,
      addr.state,
      addr.postcode,
      addr.country,
    ].filter((val, i, arr) => val && arr.indexOf(val) === i)

    const exactAddress = parts.length > 0 ? parts.join(', ') : data.display_name || city

    return {
      city,
      mainCity,
      locality,
      exactAddress,
      region: addr.state || null,
      country: addr.country || null,
      displayName: data.display_name || exactAddress,
      latitude: lat,
      longitude: lng,
    }
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  // 1. SEARCH QUERY MODE (?q=CityName)
  if (q && q.trim()) {
    const query = q.trim()
    try {
      // Nominatim search
      const nomUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=1&accept-language=en`
      const nomRes = await fetch(nomUrl, {
        headers: { 'User-Agent': 'Norto/1.0 (city-assistant app)' },
        cache: 'no-store',
      })
      if (nomRes.ok) {
        const nomData = await nomRes.json()
        if (Array.isArray(nomData) && nomData.length > 0) {
          const item = nomData[0]
          const addr = item.address || {}
          const latitude = parseFloat(item.lat)
          const longitude = parseFloat(item.lon)
          const mainCity = addr.city || addr.town || addr.village || item.name || query
          const locality = addr.suburb || addr.neighbourhood || null
          const city = locality && locality !== mainCity ? `${locality}, ${mainCity}` : mainCity

          return Response.json({
            city,
            mainCity,
            locality,
            exactAddress: item.display_name || query,
            region: addr.state || null,
            country: addr.country || 'India',
            displayName: item.display_name || query,
            latitude,
            longitude,
          })
        }
      }

      // Open-Meteo search fallback
      const meteoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`
      const meteoRes = await fetch(meteoUrl, { cache: 'no-store' })
      if (meteoRes.ok) {
        const meteoData = await meteoRes.json()
        if (meteoData.results && meteoData.results.length > 0) {
          const item = meteoData.results[0]
          return Response.json({
            city: item.name || query,
            mainCity: item.name || query,
            locality: null,
            exactAddress: [item.name, item.admin1, item.country].filter(Boolean).join(', '),
            region: item.admin1 || null,
            country: item.country || 'India',
            displayName: [item.name, item.admin1, item.country].filter(Boolean).join(', '),
            latitude: item.latitude,
            longitude: item.longitude,
          })
        }
      }
    } catch {
      // ignore
    }

    return Response.json({
      city: query,
      mainCity: query,
      locality: null,
      exactAddress: query,
      region: null,
      country: 'India',
      displayName: `${query}, India`,
      latitude: 17.385,
      longitude: 78.4867,
    })
  }

  // 2. REVERSE GEOCODE MODE (?lat=15.123&lng=80.456)
  if (!lat || !lng) {
    return Response.json({ error: 'lat and lng query params are required' }, { status: 400 })
  }

  const latitude = parseFloat(lat)
  const longitude = parseFloat(lng)
  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return Response.json({ error: 'lat and lng must be valid numbers' }, { status: 400 })
  }

  // Try Provider 1: BigDataCloud (Precise Indian Mandals, Suburbs & Villages)
  const bigDataResult = await reverseGeocodeBigDataCloud(latitude, longitude)
  if (bigDataResult && bigDataResult.city && bigDataResult.city !== 'Local Area') {
    return Response.json(bigDataResult)
  }

  // Try Provider 2: OpenStreetMap Nominatim
  const nomResult = await reverseGeocodeNominatim(latitude, longitude)
  if (nomResult) {
    return Response.json(nomResult)
  }

  // Final fallback with exact lat/lng display
  return Response.json({
    city: `Location (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`,
    mainCity: 'Local Area',
    locality: null,
    exactAddress: `Lat ${latitude.toFixed(4)}, Lng ${longitude.toFixed(4)}`,
    region: null,
    country: 'India',
    displayName: `Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
    latitude,
    longitude,
  })
}
