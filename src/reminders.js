import { LocalNotifications } from '@capacitor/local-notifications'
import { Capacitor } from '@capacitor/core'
import { getItem, setItem } from './storage'

const SETTINGS_KEY = 'hb.reminders.v1'

const DEFAULTS = {
  ironTabletEnabled: false,
  ironTabletHour: 20,
  ironTabletMinute: 0,
  antenatalEnabled: false,
  antenatalDayOfWeek: 1, // 1=Monday, 7=Sunday (matches Capacitor)
  antenatalHour: 9,
  antenatalMinute: 0,
}

export const IRON_TABLET_ID = 1001
export const ANTENATAL_ID = 1002

export async function getReminderSettings() {
  const raw = await getItem(SETTINGS_KEY)
  if (!raw) return { ...DEFAULTS }
  try {
    return { ...DEFAULTS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULTS }
  }
}

export async function saveReminderSettings(settings) {
  await setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export async function ensurePermission() {
  if (!Capacitor.isNativePlatform()) return false
  const current = await LocalNotifications.checkPermissions()
  if (current.display === 'granted') return true
  if (current.display === 'denied') return false
  const requested = await LocalNotifications.requestPermissions()
  return requested.display === 'granted'
}

export async function applyReminders(settings) {
  if (!Capacitor.isNativePlatform()) return { ok: false, reason: 'not-native' }

  // Cancel any existing scheduled reminders for these IDs
  try {
    const pending = await LocalNotifications.getPending()
    const toCancel = pending.notifications.filter(n =>
      n.id === IRON_TABLET_ID || n.id === ANTENATAL_ID
    ).map(n => ({ id: n.id }))
    if (toCancel.length) {
      await LocalNotifications.cancel({ notifications: toCancel })
    }
  } catch (e) {
    // not fatal
  }

  const toSchedule = []

  if (settings.ironTabletEnabled) {
    toSchedule.push({
      id: IRON_TABLET_ID,
      title: 'Time for your iron tablet',
      body: 'Take with water or fruit juice — never with tea, coffee, or milk. Pair with an orange or pawpaw if you have one.',
      schedule: {
        on: { hour: settings.ironTabletHour, minute: settings.ironTabletMinute },
        allowWhileIdle: true,
      },
    })
  }

  if (settings.antenatalEnabled) {
    toSchedule.push({
      id: ANTENATAL_ID,
      title: 'Antenatal check-in',
      body: 'A weekly reminder — visit your antenatal clinic if you have one scheduled, or check in with how you are feeling this week.',
      schedule: {
        on: {
          weekday: settings.antenatalDayOfWeek,
          hour: settings.antenatalHour,
          minute: settings.antenatalMinute,
        },
        allowWhileIdle: true,
      },
    })
  }

  if (toSchedule.length === 0) {
    return { ok: true, scheduled: 0 }
  }

  try {
    await LocalNotifications.schedule({ notifications: toSchedule })
    return { ok: true, scheduled: toSchedule.length }
  } catch (e) {
    return { ok: false, reason: e?.message || 'schedule-failed' }
  }
}
