import { useEffect, useState } from 'react'
import {
  getAllFacilities, getCurrentPosition, sortByDistance, filterFacilities, buildDirectionsUrl,
} from '../facilities'

function formatDistance(km) {
  if (km == null) return ''
  if (km < 1) return `${Math.round(km * 1000)} m`
  if (km < 10) return `${km.toFixed(1)} km`
  return `${Math.round(km)} km`
}

export default function Facilities() {
  const [list, setList] = useState(() => getAllFacilities())
  const [loc, setLoc] = useState(null)
  const [locStatus, setLocStatus] = useState('idle') // idle | loading | ok | error
  const [locError, setLocError] = useState('')
  const [query, setQuery] = useState('')

  const requestLocation = async () => {
    setLocStatus('loading')
    setLocError('')
    try {
      const pos = await getCurrentPosition()
      setLoc(pos)
      setList(sortByDistance(getAllFacilities(), pos.lat, pos.lng))
      setLocStatus('ok')
    } catch (e) {
      setLocError(e?.message || 'Could not get your location')
      setLocStatus('error')
    }
  }

  const filtered = filterFacilities(list, query)

  return (
    <>
      <header className="app-header">
        <div className="brand">
          <div className="logo" style={{ fontSize: 20 }}>🏥</div>
          <div>
            <h1>Facilities</h1>
            <div className="subtitle">Find a health facility near you</div>
          </div>
        </div>
      </header>

      <main className="app-main">
        {/* Location prompt */}
        {locStatus === 'idle' && (
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-title">Use your location?</div>
            <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: 16 }}>
              We can show facilities sorted by how close they are to you. Your location stays only on your phone — we never send it anywhere.
            </p>
            <button className="btn btn-primary" onClick={requestLocation}>
              📍 Find facilities near me
            </button>
          </div>
        )}

        {locStatus === 'loading' && (
          <div className="card" style={{ marginBottom: 16, textAlign: 'center', padding: '24px' }}>
            <p style={{ color: 'var(--ink-mute)', fontSize: 14 }}>Getting your location…</p>
          </div>
        )}

        {locStatus === 'error' && (
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="advice warn">
              <div className="label">Couldn't get your location</div>
              <p>{locError}</p>
              <p style={{ marginTop: 6 }}>You can still browse all facilities below, or search by name.</p>
            </div>
            <button className="btn btn-ghost" onClick={requestLocation} style={{ marginTop: 12 }}>
              Try again
            </button>
          </div>
        )}

        {locStatus === 'ok' && (
          <div style={{ background: 'var(--forest-tint)', borderRadius: 12, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: 'var(--forest)' }}>
            ✓ Showing facilities sorted by distance from you
          </div>
        )}

        {/* Search */}
        <div className="field" style={{ marginBottom: 16 }}>
          <input
            type="search"
            placeholder="Search by name, town, or region…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="card">
            <div className="empty-state">No facilities match your search.</div>
          </div>
        ) : (
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(f => (
              <li key={f.id}>
                <FacilityCard facility={f} hasLocation={locStatus === 'ok'} />
              </li>
            ))}
          </ul>
        )}

        <p style={{ fontSize: 11, color: 'var(--ink-mute)', textAlign: 'center', marginTop: 24, padding: '0 16px', lineHeight: 1.5 }}>
          Showing {filtered.length} of {list.length} facilities. Some entries may be unverified or out of date.
          If you find a wrong entry, please tell your nurse so it can be corrected.
        </p>
      </main>
    </>
  )
}

function FacilityCard({ facility, hasLocation }) {
  const f = facility

  const handleDirections = () => {
    window.open(buildDirectionsUrl(f), '_system')
  }

  const handleCall = () => {
    if (!f.phone) return
    window.location.href = `tel:${f.phone}`
  }

  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.3 }}>
            {f.name}
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 2 }}>
            {f.type} · {f.town}, {f.district}
          </div>
        </div>
        {hasLocation && f.distanceKm != null && (
          <div style={{
            background: 'var(--terracotta-tint)',
            color: 'var(--terracotta)',
            padding: '4px 10px',
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 700,
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}>
            {formatDistance(f.distanceKm)}
          </div>
        )}
      </div>

      {f.services && (
        <div style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5, marginBottom: 8 }}>
          {f.services}
        </div>
      )}

      {f.notes && (
        <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontStyle: 'italic', marginBottom: 8 }}>
          {f.notes}
        </div>
      )}

      {f.verified === 'unverified' && (
        <div style={{ fontSize: 11, color: 'var(--gold)', marginBottom: 10 }}>
          ⓘ Unverified — confirm details before relying on this entry
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button
          onClick={handleDirections}
          className="btn btn-ghost"
          style={{ padding: '10px 12px', fontSize: 13, minHeight: 0 }}
        >
          🧭 Directions
        </button>
        {f.phone && (
          <button
            onClick={handleCall}
            className="btn btn-ghost"
            style={{ padding: '10px 12px', fontSize: 13, minHeight: 0 }}
          >
            📞 Call
          </button>
        )}
      </div>
    </div>
  )
}
