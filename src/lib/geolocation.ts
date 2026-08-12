'use client'

export interface GeoCoords {
  lat: number
  lng: number
  accuracy: number // meters
}

export interface GeoResult extends GeoCoords {
  city: string
  locality: string | null
  exactAddress: string | null
  displayName: string | null
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
        if (err.code === err.PERMISSION_DENIED) {
          reject(
            new GeoError(
              'permission-denied',
              'Location permission blocked. If you see an Android overlay prompt, close floating screen bubbles (e.g. Messenger, recorder) or pick your city manually above.'
            )
          )
          return
        }

        // Low accuracy fallback for Android devices with strict sensor policies
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
            })
          },
          (err2) => {
            let code: GeoErrorCode = 'unknown'
            let message = 'Could not get your location.'
            if (err2.code === err2.PERMISSION_DENIED) {
              code = 'permission-denied'
              message = 'Location access blocked by browser or system settings. Select your city manually.'
            } else if (err2.code === err2.POSITION_UNAVAILABLE) {
              code = 'position-unavailable'
              message = 'Position unavailable. Select your city manually.'
            } else if (err2.code === err2.TIMEOUT) {
              code = 'timeout'
              message = 'Location request timed out.'
            }
            reject(new GeoError(code, message))
          },
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
        )
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
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
  exactAddress: string | null
  displayName: string | null
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
    exactAddress: data.exactAddress ?? null,
    displayName: data.displayName ?? null,
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
