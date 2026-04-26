// Works in browser (localStorage) and on Capacitor (Preferences)
import { Preferences } from '@capacitor/preferences'
import { Capacitor } from '@capacitor/core'

const isNative = Capacitor.isNativePlatform()

export async function getItem(key) {
  if (isNative) {
    const { value } = await Preferences.get({ key })
    return value
  }
  return localStorage.getItem(key)
}

export async function setItem(key, value) {
  if (isNative) {
    await Preferences.set({ key, value })
  } else {
    localStorage.setItem(key, value)
  }
}

export async function removeItem(key) {
  if (isNative) {
    await Preferences.remove({ key })
  } else {
    localStorage.removeItem(key)
  }
}

const PROFILE_KEY = 'hb.profile.v1'
const READINGS_KEY = 'hb.readings.v1'

export async function getProfile() {
  const raw = await getItem(PROFILE_KEY)
  return raw ? JSON.parse(raw) : null
}

export async function saveProfile(profile) {
  await setItem(PROFILE_KEY, JSON.stringify(profile))
}

export async function getReadings() {
  const raw = await getItem(READINGS_KEY)
  return raw ? JSON.parse(raw) : []
}

export async function saveReadings(readings) {
  await setItem(READINGS_KEY, JSON.stringify(readings))
}

export async function addReading(reading) {
  const readings = await getReadings()
  readings.push(reading)
  readings.sort((a, b) => new Date(a.date) - new Date(b.date))
  await saveReadings(readings)
  return readings
}

export async function deleteReading(id) {
  const readings = await getReadings()
  const next = readings.filter(r => r.id !== id)
  await saveReadings(next)
  return next
}
