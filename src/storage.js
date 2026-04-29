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
const WEIGHTS_KEY = 'hb.weights.v1'
const FEEDBACK_KEY = 'hb.feedback.v1'

export async function getProfile() {
  const raw = await getItem(PROFILE_KEY)
  return raw ? JSON.parse(raw) : null
}

export async function saveProfile(profile) {
  await setItem(PROFILE_KEY, JSON.stringify(profile))
}

export async function updateProfile(patch) {
  const current = (await getProfile()) || {}
  const next = { ...current, ...patch, updatedAt: new Date().toISOString() }
  await saveProfile(next)
  return next
}

export async function clearAll() {
  await removeItem(PROFILE_KEY)
  await removeItem(READINGS_KEY)
  await removeItem(WEIGHTS_KEY)
  await removeItem(FEEDBACK_KEY)
}

// ===== HB readings =====
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

// ===== Weight measurements =====
export async function getWeights() {
  const raw = await getItem(WEIGHTS_KEY)
  return raw ? JSON.parse(raw) : []
}

export async function saveWeights(weights) {
  await setItem(WEIGHTS_KEY, JSON.stringify(weights))
}

export async function addWeight(entry) {
  const weights = await getWeights()
  weights.push(entry)
  weights.sort((a, b) => new Date(a.date) - new Date(b.date))
  await saveWeights(weights)
  return weights
}

export async function deleteWeight(id) {
  const weights = await getWeights()
  const next = weights.filter(w => w.id !== id)
  await saveWeights(next)
  return next
}

// ===== Feedback =====
export async function getFeedback() {
  const raw = await getItem(FEEDBACK_KEY)
  return raw ? JSON.parse(raw) : []
}

export async function saveFeedback(items) {
  await setItem(FEEDBACK_KEY, JSON.stringify(items))
}

export async function addFeedback(entry) {
  const items = await getFeedback()
  items.push(entry)
  items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  await saveFeedback(items)
  return items
}

export async function deleteFeedback(id) {
  const items = await getFeedback()
  const next = items.filter(f => f.id !== id)
  await saveFeedback(next)
  return next
}

// ===== Export / Backup =====
export async function exportAll() {
  const profile = await getProfile()
  const readings = await getReadings()
  const weights = await getWeights()
  const feedback = await getFeedback()
  return {
    appName: 'HB Tracker',
    exportVersion: 2,
    exportedAt: new Date().toISOString(),
    profile,
    readings,
    weights,
    feedback,
  }
}
