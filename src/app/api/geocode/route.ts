import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * High-precision Google Maps Reverse Geocoding API (when GOOGLE_MAPS_API_KEY is configured)
 */
async function reverseGeocodeGoogle(lat: number, lng: number, apiKey: string) {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return null
    const data = await res.json()
    if (data.status === 'OK' && Array.isArray(data.results) && data.results.length > 0) {
      const result = data.results[0]
      const components = result.address_components || []

      let locality = ''
      let mainCity = ''
      let state = ''
      let country = ''

      for (const comp of components) {
        const types = comp.types || []
        if (types.includes('sublocality') || types.includes('neighborhood') || types.includes('sublocality_level_1')) {
          locality = comp.long_name
        } else if (types.includes('locality') || types.includes('administrative_area_level_2')) {
          mainCity = comp.long_name
        } else if (types.includes('administrative_area_level_1')) {
          state = comp.long_name
        } else if (types.includes('country')) {
          country = comp.long_name
        }
      }

      const city = locality && mainCity && locality !== mainCity ? `${locality}, ${mainCity}` : mainCity || locality || 'Local Area'
      const exactAddress = result.formatted_address || city

      return {
        city,
        mainCity: mainCity || city,
        locality: locality || null,
        exactAddress,
        region: state || null,
        country: country || 'India',
        displayName: exactAddress,
        googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
        latitude: lat,
        longitude: lng,
        source: 'google_maps',
      }
    }
    return null
  } catch {
    return null
  }
}

/**
 * BigDataCloud client API reverse geocoding fallback
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
        googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
        latitude: lat,
        longitude: lng,
        source: 'bigdatacloud',
      }
    }
    return null
  } catch {
    return null
  }
}

/**
 * OpenStreetMap Nominatim reverse geocoding fallback
 */
async function reverseGeocodeNominatim(lat: number, lng: number) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&zoom=16&accept-language=en`
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
      googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
      latitude: lat,
      longitude: lng,
      source: 'openstreetmap',
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

  // 1. SEARCH QUERY MODE (?q=LocationName)
  if (q && q.trim()) {
    const query = q.trim()
    try {
      // Check Google Maps Geocoding API if key exists
      const googleApiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      if (googleApiKey) {
        const gUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${googleApiKey}`
        const gRes = await fetch(gUrl, { cache: 'no-store' })
        if (gRes.ok) {
          const gData = await gRes.json()
          if (gData.status === 'OK' && gData.results?.[0]) {
            const item = gData.results[0]
            const latitude = item.geometry.location.lat
            const longitude = item.geometry.location.lng
            return Response.json({
              city: query,
              mainCity: query,
              locality: null,
              exactAddress: item.formatted_address || query,
              region: null,
              country: 'India',
              displayName: item.formatted_address || query,
              googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
              latitude,
              longitude,
              source: 'google_maps',
            })
          }
        }
      }

      // Nominatim search fallback
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
            googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
            latitude,
            longitude,
            source: 'openstreetmap',
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
      googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
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

  // Option A: Google Maps Geocoding API if key configured
  const googleApiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (googleApiKey) {
    const gResult = await reverseGeocodeGoogle(latitude, longitude, googleApiKey)
    if (gResult) return Response.json(gResult)
  }

  // Option B: BigDataCloud (Precise Indian Suburbs & Villages)
  const bigDataResult = await reverseGeocodeBigDataCloud(latitude, longitude)
  if (bigDataResult && bigDataResult.city && bigDataResult.city !== 'Local Area') {
    return Response.json(bigDataResult)
  }

  // Option C: OpenStreetMap Nominatim
  const nomResult = await reverseGeocodeNominatim(latitude, longitude)
  if (nomResult) {
    return Response.json(nomResult)
  }

  // Final fallback
  return Response.json({
    city: `Location (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`,
    mainCity: 'Local Area',
    locality: null,
    exactAddress: `Lat ${latitude.toFixed(4)}, Lng ${longitude.toFixed(4)}`,
    region: null,
    country: 'India',
    displayName: `Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
    googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
    latitude,
    longitude,
  })
}
