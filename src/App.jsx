import { useEffect, useState } from 'react'
import { getProfile, saveProfile, getReadings, addReading, deleteReading } from './storage'
import { classify, STATUS_META, getAdvice, getTrendMessage } from './hbLogic'
import Welcome from './components/Welcome'
import Home from './components/Home'
import AddReadingSheet from './components/AddReadingSheet'

export default function App() {
  const [loaded, setLoaded] = useState(false)
  const [profile, setProfile] = useState(null)
  const [readings, setReadings] = useState([])
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => {
    (async () => {
      const p = await getProfile()
      const r = await getReadings()
      setProfile(p)
      setReadings(r)
      setLoaded(true)
    })()
  }, [])

  const onCreateProfile = async (data) => {
    await saveProfile(data)
    setProfile(data)
  }

  const onAddReading = async (data) => {
    const reading = {
      id: Date.now().toString(),
      date: data.date,
      hb: parseFloat(data.hb),
      week: data.week ? parseInt(data.week) : null,
      note: data.note || '',
    }
    const next = await addReading(reading)
    setReadings(next)
    setShowAdd(false)
  }

  const onDeleteReading = async (id) => {
    if (!confirm('Delete this reading?')) return
    const next = await deleteReading(id)
    setReadings(next)
  }

  if (!loaded) {
    return (
      <div className="app">
        <div className="welcome">
          <p style={{ color: 'var(--ink-mute)' }}>Loading…</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="app">
        <Welcome onSubmit={onCreateProfile} />
      </div>
    )
  }

  return (
    <div className="app">
      <Home
        profile={profile}
        readings={readings}
        onAddClick={() => setShowAdd(true)}
        onDelete={onDeleteReading}
      />
      {showAdd && (
        <AddReadingSheet
          onClose={() => setShowAdd(false)}
          onSubmit={onAddReading}
          profile={profile}
        />
      )}
    </div>
  )
}
