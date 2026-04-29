import { Capacitor } from '@capacitor/core'
import { Geolocation } from '@capacitor/geolocation'
import { FACILITIES } from './facilitiesData'

// Haversine — distance in km between two lat/lng pairs
export function haversineKm(lat1, lng1, lat2, lng2) {
  if (lat1 == null || lng1 == null || lat2 == null || lng2 == null) return null
  const toRad = (deg) => (deg * Math.PI) / 180
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export async function getCurrentPosition() {
  if (!Capacitor.isNativePlatform() && navigator.geolocation) {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => reject(err),
        { enableHighAccuracy: false, maximumAge: 60_000, timeout: 10_000 },
      )
    })
  }
  if (Capacitor.isNativePlatform()) {
    const perm = await Geolocation.checkPermissions()
    if (perm.location !== 'granted') {
      const req = await Geolocation.requestPermissions()
      if (req.location !== 'granted') {
        throw new Error('Location permission denied')
      }
    }
    const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: false, timeout: 10_000 })
    return { lat: pos.coords.latitude, lng: pos.coords.longitude }
  }
  throw new Error('Geolocation not available')
}

export function sortByDistance(facilities, userLat, userLng) {
  return [...facilities]
    .map(f => ({
      ...f,
      distanceKm: haversineKm(userLat, userLng, f.lat, f.lng),
    }))
    .sort((a, b) => {
      if (a.distanceKm == null) return 1
      if (b.distanceKm == null) return -1
      return a.distanceKm - b.distanceKm
    })
}

export function filterFacilities(facilities, query) {
  if (!query) return facilities
  const q = query.toLowerCase().trim()
  return facilities.filter(f =>
    f.name.toLowerCase().includes(q) ||
    f.town?.toLowerCase().includes(q) ||
    f.district?.toLowerCase().includes(q) ||
    f.region?.toLowerCase().includes(q) ||
    f.type?.toLowerCase().includes(q)
  )
}

export function buildDirectionsUrl(facility) {
  return `https://www.google.com/maps/dir/?api=1&destination=${facility.lat},${facility.lng}&travelmode=driving`
}

export function getAllFacilities() {
  return FACILITIES
}
