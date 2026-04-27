import { useState } from 'react'
import { calculateBMI, bmiCategory } from '../hbLogic'

export default function Profile({ profile, readings, onUpdate, onClearAll }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(profile.name || '')
  const [age, setAge] = useState(profile.age?.toString() || '')
  const [edd, setEdd] = useState(profile.edd || '')
  const [weight, setWeight] = useState(profile.weightKg?.toString() || '')
  const [height, setHeight] = useState(profile.heightCm?.toString() || '')

  const bmi = calculateBMI(profile.weightKg, profile.heightCm)
  const bmiCat = bmiCategory(bmi)

  const handleSave = () => {
    if (!name.trim()) return
    onUpdate({
      name: name.trim(),
      age: age ? parseInt(age) : null,
      edd: edd || null,
      weightKg: weight ? parseFloat(weight) : null,
      heightCm: height ? parseFloat(height) : null,
    })
    setEditing(false)
  }

  const handleCancel = () => {
    setName(profile.name || '')
    setAge(profile.age?.toString() || '')
    setEdd(profile.edd || '')
    setWeight(profile.weightKg?.toString() || '')
    setHeight(profile.heightCm?.toString() || '')
    setEditing(false)
  }

  const handleClear = () => {
    if (confirm('This will delete your profile and all your HB readings. This cannot be undone. Continue?')) {
      onClearAll()
    }
  }

  return (
    <>
      <header className="app-header">
        <div className="brand">
          <div className="logo">👤</div>
          <div>
            <h1>Profile</h1>
            <div className="subtitle">Your details and app information</div>
          </div>
        </div>
      </header>

      <main className="app-main">
        {!editing ? (
          <>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
                <div className="card-title" style={{ marginBottom: 0 }}>Your details</div>
                <button className="btn-text" onClick={() => setEditing(true)} style={{ padding: '4px 8px' }}>
                  Edit
                </button>
              </div>

              <Row label="Name" value={profile.name} />
              <Row label="Age" value={profile.age ? `${profile.age} years` : '—'} />
              <Row label="Expected delivery" value={profile.edd ? formatDate(profile.edd) : '—'} />
              <Row label="Weight" value={profile.weightKg ? `${profile.weightKg} kg` : '—'} />
              <Row label="Height" value={profile.heightCm ? `${profile.heightCm} cm` : '—'} />
              <Row label="Total readings" value={readings.length.toString()} last />
            </div>

            {bmi && bmiCat && (
              <div className="card">
                <div className="card-title">Body Mass Index (BMI)</div>
                <div className="card-subtitle">Calculated from your weight and height</div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 12 }}>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 36, fontWeight: 600, color: 'var(--ink)' }}>
                    {bmi}
                  </div>
                  <span className={`status-pill status-${bmiCat.tone === 'good' ? 'normal' : 'mild'}`}>
                    {bmiCat.label}
                  </span>
                </div>

                <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--ink-soft)', marginBottom: 8 }}>
                  {bmiCat.note}
                </p>

                <p style={{ fontSize: 11, color: 'var(--ink-mute)', lineHeight: 1.5, marginTop: 12 }}>
                  Note: BMI is most useful when based on your weight before pregnancy. As pregnancy progresses, normal weight gain will change this number — that is expected.
                </p>
              </div>
            )}

            <div className="card">
              <div className="card-title">About this app</div>
              <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: 12 }}>
                HB Tracker helps pregnant women in Ghana follow their haemoglobin levels and get plain-language guidance grounded in local foods and antenatal best practices.
              </p>
              <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: 12 }}>
                All your information stays only on your phone. Nothing is sent over the internet.
              </p>
              <p style={{ fontSize: 12, color: 'var(--ink-mute)', lineHeight: 1.5 }}>
                The advice in this app is general guidance based on WHO and Ghana Health Service principles. It is not a replacement for your midwife or doctor. Always follow their instructions.
              </p>
            </div>

            <div className="card">
              <div className="card-title" style={{ color: 'var(--rose)' }}>Reset everything</div>
              <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: 16 }}>
                Delete your profile and all readings. This cannot be undone. Use this if you are giving the phone to someone else, or starting fresh.
              </p>
              <button
                className="btn"
                onClick={handleClear}
                style={{ background: 'var(--rose-tint)', color: 'var(--rose)' }}
              >
                Delete all data
              </button>
            </div>
          </>
        ) : (
          <div className="card">
            <div className="card-title">Edit your details</div>
            <div className="card-subtitle">Update any of these and save.</div>

            <div className="field">
              <label>First name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="field-row">
              <div className="field">
                <label>Age</label>
                <input
                  type="number"
                  inputMode="numeric"
                  min="13"
                  max="55"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>
              <div className="field">
                <label>Expected delivery</label>
                <input
                  type="date"
                  value={edd}
                  onChange={(e) => setEdd(e.target.value)}
                />
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label>Weight (kg)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  min="30"
                  max="200"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>
              <div className="field">
                <label>Height (cm)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  min="120"
                  max="210"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                />
              </div>
            </div>

            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={!name.trim()}
              style={{ marginTop: 8 }}
            >
              Save changes
            </button>
            <button
              className="btn btn-text"
              onClick={handleCancel}
              style={{ marginTop: 8, width: '100%' }}
            >
              Cancel
            </button>
          </div>
        )}
      </main>
    </>
  )
}

function Row({ label, value, last }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      padding: '12px 0',
      borderBottom: last ? 'none' : '1px solid var(--line)',
    }}>
      <span style={{ fontSize: 13, color: 'var(--ink-mute)' }}>{label}</span>
      <span style={{ fontSize: 15, color: 'var(--ink)', fontWeight: 500 }}>{value}</span>
    </div>
  )
}

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
