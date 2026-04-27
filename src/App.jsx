import { useEffect, useState } from 'react'
import { getProfile, saveProfile, updateProfile, getReadings, addReading, deleteReading, clearAll } from './storage'
import Welcome from './components/Welcome'
import Home from './components/Home'
import Learn from './components/Learn'
import Profile from './components/Profile'
import AddReadingSheet from './components/AddReadingSheet'

export default function App() {
  const [loaded, setLoaded] = useState(false)
  const [profile, setProfile] = useState(null)
  const [readings, setReadings] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [tab, setTab] = useState('home')

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

  const onUpdateProfile = async (patch) => {
    const next = await updateProfile(patch)
    setProfile(next)
  }

  const onClearAll = async () => {
    await clearAll()
    setProfile(null)
    setReadings([])
    setTab('home')
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
      {tab === 'home' && (
        <Home
          profile={profile}
          readings={readings}
          onAddClick={() => setShowAdd(true)}
          onDelete={onDeleteReading}
        />
      )}
      {tab === 'learn' && <Learn />}
      {tab === 'profile' && (
        <Profile
          profile={profile}
          readings={readings}
          onUpdate={onUpdateProfile}
          onClearAll={onClearAll}
        />
      )}

      {/* Bottom nav */}
      <nav className="bottom-nav">
        <button
          className={`nav-btn ${tab === 'home' ? 'active' : ''}`}
          onClick={() => setTab('home')}
        >
          <span className="nav-icon">🏠</span>
          <span>Home</span>
        </button>
        <button
          className={`nav-btn ${tab === 'learn' ? 'active' : ''}`}
          onClick={() => setTab('learn')}
        >
          <span className="nav-icon">📖</span>
          <span>Learn</span>
        </button>
        <button
          className={`nav-btn ${tab === 'profile' ? 'active' : ''}`}
          onClick={() => setTab('profile')}
        >
          <span className="nav-icon">👤</span>
          <span>Profile</span>
        </button>
      </nav>

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
