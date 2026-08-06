'use client'

export interface GeoCoords {
  lat: number
  lng: number
  accuracy: number // meters
}

export interface GeoResult extends GeoCoords {
  city: string
  locality: string | null
  region: string | null
  country: string | null
}

export type GeoErrorCode =
  | 'unsupported'
  | 'permission-denied'
  | 'position-unavailable'
  | 'timeout'
  | 'geocode-failed'
  | 'unknown'

export class GeoError extends Error {
  code: GeoErrorCode
  constructor(code: GeoErrorCode, message: string) {
    super(message)
    this.code = code
    this.name = 'GeoError'
  }
}

/**
 * Get the device's current geographic position using the browser's
 * high-accuracy Geolocation API. Resolves with lat/lng + accuracy (meters).
 */
export function getCurrentPosition(): Promise<GeoCoords> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new GeoError('unsupported', 'Geolocation is not supported by this browser.'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        })
      },
      (err) => {
        let code: GeoErrorCode = 'unknown'
        let message = 'Could not get your location.'
        switch (err.code) {
          case err.PERMISSION_DENIED:
            code = 'permission-denied'
            message = 'Location permission denied. Please allow location access in your browser.'
            break
          case err.POSITION_UNAVAILABLE:
            code = 'position-unavailable'
            message = 'Your position is unavailable. Check your GPS/network and try again.'
            break
          case err.TIMEOUT:
            code = 'timeout'
            message = 'Location request timed out. Please try again.'
            break
        }
        reject(new GeoError(code, message))
      },
      {
        enableHighAccuracy: true, // use GPS when available for the best accuracy
        timeout: 15000,
        maximumAge: 0, // never use a cached position
      }
    )
  })
}

/**
 * Reverse-geocode lat/lng to a city name via our server-side route.
 */
export async function reverseGeocode(coords: GeoCoords): Promise<{
  city: string
  locality: string | null
  region: string | null
  country: string | null
}> {
  const url = `/api/geocode?lat=${coords.lat}&lng=${coords.lng}`
  const res = await fetch(url)
  if (!res.ok) {
    throw new GeoError('geocode-failed', `Could not determine the city for your location (status ${res.status}).`)
  }
  const data = await res.json()
  return {
    city: data.city || 'Unknown area',
    locality: data.locality ?? null,
    region: data.region ?? null,
    country: data.country ?? null,
  }
}

/**
 * Full detection: get accurate coords, then reverse-geocode to a city.
 * Returns a combined GeoResult.
 */
export async function detectLocation(): Promise<GeoResult> {
  const coords = await getCurrentPosition()
  const place = await reverseGeocode(coords)
  return { ...coords, ...place }
}
