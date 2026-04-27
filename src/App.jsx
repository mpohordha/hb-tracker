import { useEffect, useState } from 'react'
import {
  getProfile, saveProfile, updateProfile, clearAll,
  getReadings, addReading, deleteReading,
  getWeights, addWeight, deleteWeight,
} from './storage'
import Welcome from './components/Welcome'
import Home from './components/Home'
import Learn from './components/Learn'
import Profile from './components/Profile'
import AddReadingSheet from './components/AddReadingSheet'

export default function App() {
  const [loaded, setLoaded] = useState(false)
  const [profile, setProfile] = useState(null)
  const [readings, setReadings] = useState([])
  const [weights, setWeights] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [tab, setTab] = useState('home')

  useEffect(() => {
    (async () => {
      const p = await getProfile()
      const r = await getReadings()
      const w = await getWeights()
      setProfile(p)
      setReadings(r)
      setWeights(w)
      setLoaded(true)
    })()
  }, [])

  const onCreateProfile = async (data) => {
    await saveProfile(data)
    setProfile(data)
    // If they entered weight at onboarding, also seed the first weight entry
    if (data.weightKg) {
      const first = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        kg: data.weightKg,
        week: null,
      }
      const next = await addWeight(first)
      setWeights(next)
    }
  }

  const onUpdateProfile = async (patch) => {
    const next = await updateProfile(patch)
    setProfile(next)
  }

  const onClearAll = async () => {
    await clearAll()
    setProfile(null)
    setReadings([])
    setWeights([])
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
    const next = await deleteReading(id)
    setReadings(next)
  }

  const onAddWeight = async (entry) => {
    const next = await addWeight(entry)
    setWeights(next)
  }

  const onDeleteWeight = async (id) => {
    const next = await deleteWeight(id)
    setWeights(next)
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
          weights={weights}
          onUpdate={onUpdateProfile}
          onClearAll={onClearAll}
          onAddWeight={onAddWeight}
          onDeleteWeight={onDeleteWeight}
        />
      )}

      <nav className="bottom-nav">
        <button className={`nav-btn ${tab === 'home' ? 'active' : ''}`} onClick={() => setTab('home')}>
          <span className="nav-icon">🏠</span>
          <span>Home</span>
        </button>
        <button className={`nav-btn ${tab === 'learn' ? 'active' : ''}`} onClick={() => setTab('learn')}>
          <span className="nav-icon">📖</span>
          <span>Learn</span>
        </button>
        <button className={`nav-btn ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}>
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
