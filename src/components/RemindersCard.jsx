import { useEffect, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { getReminderSettings, saveReminderSettings, applyReminders, ensurePermission } from '../reminders'

const DAYS = [
  { v: 1, label: 'Mon' },
  { v: 2, label: 'Tue' },
  { v: 3, label: 'Wed' },
  { v: 4, label: 'Thu' },
  { v: 5, label: 'Fri' },
  { v: 6, label: 'Sat' },
  { v: 7, label: 'Sun' },
]

function pad(n) { return String(n).padStart(2, '0') }

export default function RemindersCard() {
  const [settings, setSettings] = useState(null)
  const [status, setStatus] = useState('')
  const [permissionDenied, setPermissionDenied] = useState(false)

  useEffect(() => {
    (async () => {
      const s = await getReminderSettings()
      setSettings(s)
    })()
  }, [])

  if (!settings) return null

  const update = (patch) => setSettings({ ...settings, ...patch })

  const handleSave = async () => {
    setStatus('Saving…')

    if (settings.ironTabletEnabled || settings.antenatalEnabled) {
      if (Capacitor.isNativePlatform()) {
        const granted = await ensurePermission()
        if (!granted) {
          setPermissionDenied(true)
          setStatus('')
          return
        }
      } else {
        setStatus('Reminders only work on the phone app.')
        setTimeout(() => setStatus(''), 2500)
        await saveReminderSettings(settings)
        return
      }
    }

    await saveReminderSettings(settings)
    const result = await applyReminders(settings)

    if (result.ok) {
      if (result.scheduled === 0) {
        setStatus('Reminders turned off.')
      } else {
        setStatus(`Reminders set (${result.scheduled} active).`)
      }
    } else {
      setStatus('Could not set reminders: ' + (result.reason || 'unknown'))
    }

    setTimeout(() => setStatus(''), 3000)
  }

  const ironTime = `${pad(settings.ironTabletHour)}:${pad(settings.ironTabletMinute)}`
  const antenatalTime = `${pad(settings.antenatalHour)}:${pad(settings.antenatalMinute)}`

  return (
    <div className="card">
      <div className="card-title">Reminders</div>
      <div className="card-subtitle">Get gentle prompts on your phone — no internet needed.</div>

      {/* Iron tablet reminder */}
      <div style={{ padding: '12px 0', borderBottom: '1px solid var(--line)' }}>
        <ToggleRow
          label="Daily iron tablet reminder"
          sub="A nudge to take your iron and folate tablet."
          checked={settings.ironTabletEnabled}
          onChange={(v) => update({ ironTabletEnabled: v })}
        />
        {settings.ironTabletEnabled && (
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Time:</span>
            <input
              type="time"
              value={ironTime}
              onChange={(e) => {
                const [h, m] = e.target.value.split(':')
                update({ ironTabletHour: parseInt(h), ironTabletMinute: parseInt(m) })
              }}
              style={{
                padding: '8px 12px',
                border: '1.5px solid var(--line)',
                borderRadius: 10,
                background: 'var(--cream)',
                fontSize: 14,
                color: 'var(--ink)',
              }}
            />
          </div>
        )}
      </div>

      {/* Antenatal reminder */}
      <div style={{ padding: '12px 0' }}>
        <ToggleRow
          label="Weekly antenatal check-in"
          sub="A reminder once a week to check on yourself and your appointments."
          checked={settings.antenatalEnabled}
          onChange={(v) => update({ antenatalEnabled: v })}
        />
        {settings.antenatalEnabled && (
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 6 }}>Day:</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
              {DAYS.map(d => (
                <button
                  key={d.v}
                  onClick={() => update({ antenatalDayOfWeek: d.v })}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    background: settings.antenatalDayOfWeek === d.v ? 'var(--terracotta)' : 'var(--cream-deep)',
                    color: settings.antenatalDayOfWeek === d.v ? 'var(--cream)' : 'var(--ink-soft)',
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Time:</span>
              <input
                type="time"
                value={antenatalTime}
                onChange={(e) => {
                  const [h, m] = e.target.value.split(':')
                  update({ antenatalHour: parseInt(h), antenatalMinute: parseInt(m) })
                }}
                style={{
                  padding: '8px 12px',
                  border: '1.5px solid var(--line)',
                  borderRadius: 10,
                  background: 'var(--cream)',
                  fontSize: 14,
                  color: 'var(--ink)',
                }}
              />
            </div>
          </div>
        )}
      </div>

      <button className="btn btn-primary" onClick={handleSave} style={{ marginTop: 12 }}>
        Save reminders
      </button>

      {status && (
        <div style={{ marginTop: 12, fontSize: 13, color: 'var(--forest)', textAlign: 'center' }}>
          {status}
        </div>
      )}

      {permissionDenied && (
        <div className="advice alert" style={{ marginTop: 12 }}>
          <div className="label">Permission needed</div>
          <p>
            Notifications are blocked for this app. To enable: open your phone's <strong>Settings</strong> → <strong>Apps</strong> → <strong>HB Tracker</strong> → <strong>Notifications</strong> → turn them on. Then come back and try again.
          </p>
        </div>
      )}

      <p style={{ fontSize: 11, color: 'var(--ink-mute)', lineHeight: 1.5, marginTop: 12 }}>
        Reminders run on your phone only. Nothing is sent over the internet. Some phones may delay or skip notifications when in battery-saver mode.
      </p>
    </div>
  )
}

function ToggleRow({ label, sub, checked, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{label}</div>
        <div style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 2 }}>{sub}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        style={{
          width: 48,
          height: 28,
          borderRadius: 14,
          background: checked ? 'var(--terracotta)' : 'var(--line)',
          position: 'relative',
          transition: 'background 0.15s ease',
          flexShrink: 0,
        }}
        aria-label={`Toggle ${label}`}
      >
        <span style={{
          position: 'absolute',
          top: 3,
          left: checked ? 23 : 3,
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: 'white',
          transition: 'left 0.15s ease',
          boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
        }} />
      </button>
    </div>
  )
}
