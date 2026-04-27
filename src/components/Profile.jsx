import { useState } from 'react'
import { calculateBMI, bmiCategory } from '../hbLogic'
import { exportData, exportReadingsCSV } from '../exporter'
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip,
} from 'recharts'

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatShort(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export default function Profile({
  profile, readings, weights,
  onUpdate, onClearAll, onAddWeight, onDeleteWeight,
}) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(profile.name || '')
  const [age, setAge] = useState(profile.age?.toString() || '')
  const [edd, setEdd] = useState(profile.edd || '')
  const [weight, setWeight] = useState(profile.weightKg?.toString() || '')
  const [height, setHeight] = useState(profile.heightCm?.toString() || '')

  const [showWeightSheet, setShowWeightSheet] = useState(false)
  const [exportBusy, setExportBusy] = useState(false)
  const [exportMsg, setExportMsg] = useState('')

  // BMI uses pre-pregnancy weight if a prePregnancyWeight is set, else profile weight
  const bmiWeight = profile.prePregnancyWeightKg || profile.weightKg
  const bmi = calculateBMI(bmiWeight, profile.heightCm)
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
    const first = confirm('This will delete EVERYTHING — your profile, all HB readings, and all weight entries. This cannot be undone.\n\nContinue?')
    if (!first) return
    const second = confirm('Are you absolutely sure? This is your last chance to keep your data.')
    if (!second) return
    onClearAll()
  }

  const handleExportJSON = async () => {
    setExportBusy(true)
    setExportMsg('')
    try {
      await exportData()
      setExportMsg('Backup saved.')
    } catch (e) {
      setExportMsg('Export failed: ' + (e?.message || 'unknown error'))
    }
    setExportBusy(false)
    setTimeout(() => setExportMsg(''), 3000)
  }

  const handleExportCSV = async () => {
    setExportBusy(true)
    setExportMsg('')
    try {
      await exportReadingsCSV()
      setExportMsg('Readings shared.')
    } catch (e) {
      setExportMsg('Export failed: ' + (e?.message || 'unknown error'))
    }
    setExportBusy(false)
    setTimeout(() => setExportMsg(''), 3000)
  }

  const weightChartData = [...weights]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(w => ({ date: formatShort(w.date), kg: w.kg }))

  return (
    <>
      <header className="app-header">
        <div className="brand">
          <div className="logo" style={{ fontSize: 20 }}>👤</div>
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
                <button className="btn-text" onClick={() => setEditing(true)}>Edit</button>
              </div>

              <Row label="Name" value={profile.name} />
              <Row label="Age" value={profile.age ? `${profile.age} years` : '—'} />
              <Row label="Expected delivery" value={profile.edd ? formatDate(profile.edd) : '—'} />
              <Row label="Weight" value={profile.weightKg ? `${profile.weightKg} kg` : '—'} />
              <Row label="Height" value={profile.heightCm ? `${profile.heightCm} cm` : '—'} />
              <Row label="Total HB readings" value={readings.length.toString()} last />
            </div>

            {bmi && bmiCat && (
              <div className="card">
                <div className="card-title">Body Mass Index (BMI)</div>
                <div className="card-subtitle">Calculated from your weight and height</div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 36, fontWeight: 600, color: 'var(--ink)' }}>
                    {bmi}
                  </div>
                  <span className={`status-pill status-${bmiCat.tone === 'good' ? 'normal' : 'mild'}`}>
                    {bmiCat.label}
                  </span>
                </div>

                <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--ink-soft)' }}>
                  {bmiCat.note}
                </p>

                <p style={{ fontSize: 11, color: 'var(--ink-mute)', lineHeight: 1.5, marginTop: 12 }}>
                  Note: BMI is most useful when based on your weight before pregnancy. As pregnancy progresses, normal weight gain will change this number — that is expected.
                </p>
              </div>
            )}

            {/* Weight tracking */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
                <div>
                  <div className="card-title" style={{ marginBottom: 0 }}>Weight tracking</div>
                  <div className="card-subtitle" style={{ marginBottom: 0 }}>
                    {weights.length === 0 ? 'No entries yet' : `${weights.length} ${weights.length === 1 ? 'entry' : 'entries'}`}
                  </div>
                </div>
                <button className="btn-text" onClick={() => setShowWeightSheet(true)}>+ Add</button>
              </div>

              {weights.length >= 2 && (
                <div className="chart-wrap" style={{ height: 160 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weightChartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#8C7A6B' }} tickLine={false} axisLine={{ stroke: '#E5DCC8' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#8C7A6B' }} tickLine={false} axisLine={false} width={36} domain={['dataMin - 2', 'dataMax + 2']} />
                      <Tooltip
                        contentStyle={{ background: '#FAF6EE', border: '1px solid #E5DCC8', borderRadius: 12, fontSize: 13 }}
                        formatter={(value) => [`${value} kg`, 'Weight']}
                      />
                      <Line type="monotone" dataKey="kg" stroke="#2F4A38" strokeWidth={2.5} dot={{ fill: '#2F4A38', strokeWidth: 0, r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {weights.length > 0 && (
                <ul className="reading-list" style={{ marginTop: weights.length >= 2 ? 16 : 0 }}>
                  {[...weights].reverse().slice(0, 5).map(w => (
                    <li key={w.id} className="reading-row">
                      <div className="left">
                        <div>
                          <span className="value">{w.kg.toFixed(1)}</span>
                          <span className="unit">kg</span>
                        </div>
                        <div className="date">{formatDate(w.date)}{w.week ? ` · Week ${w.week}` : ''}</div>
                      </div>
                      <button
                        className="btn-text"
                        style={{ color: 'var(--rose)', fontSize: 12 }}
                        onClick={() => {
                          if (confirm('Delete this weight entry?')) onDeleteWeight(w.id)
                        }}
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {weights.length === 0 && (
                <div className="empty-state" style={{ padding: '20px 8px' }}>
                  Track your weight gain through pregnancy.
                </div>
              )}
            </div>

            {/* Backup & Export */}
            <div className="card">
              <div className="card-title">Backup &amp; sharing</div>
              <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: 16 }}>
                Save a copy of all your data, or share your readings with your midwife.
              </p>

              <button
                className="btn btn-ghost"
                onClick={handleExportJSON}
                disabled={exportBusy}
                style={{ marginBottom: 8 }}
              >
                💾 Save full backup
              </button>

              <button
                className="btn btn-ghost"
                onClick={handleExportCSV}
                disabled={exportBusy || readings.length === 0}
              >
                📤 Share readings (CSV)
              </button>

              {exportMsg && (
                <div style={{ marginTop: 12, fontSize: 13, color: 'var(--forest)', textAlign: 'center' }}>
                  {exportMsg}
                </div>
              )}

              <p style={{ fontSize: 11, color: 'var(--ink-mute)', lineHeight: 1.5, marginTop: 12 }}>
                The backup is a JSON file you can save to your phone or send to yourself. To restore on a new phone, contact your nurse or whoever set up this app.
              </p>
            </div>

            {/* About */}
            <div className="card">
              <div className="card-title">About this app</div>
              <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: 12 }}>
                HB Tracker helps pregnant women in Ghana follow their haemoglobin levels and get plain-language guidance grounded in local foods and antenatal best practices.
              </p>
              <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: 12 }}>
                All your information stays only on your phone. Nothing is sent over the internet.
              </p>
              <p style={{ fontSize: 11, color: 'var(--ink-mute)', lineHeight: 1.5 }}>
                The advice in this app is general guidance based on WHO and Ghana Health Service principles. It is not a replacement for your midwife or doctor. Always follow their instructions.
              </p>
            </div>

            <div className="card">
              <div className="card-title" style={{ color: 'var(--rose)' }}>Reset everything</div>
              <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: 12 }}>
                Delete your profile and all readings. This cannot be undone. Use this only if you are giving the phone to someone else, or starting completely fresh.
              </p>
              <p style={{ fontSize: 12, color: 'var(--rose)', lineHeight: 1.5, marginBottom: 16, fontWeight: 600 }}>
                ⚠ Tip: save a backup first so you can recover if you change your mind.
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
                <input type="number" inputMode="numeric" min="13" max="55" value={age} onChange={(e) => setAge(e.target.value)} />
              </div>
              <div className="field">
                <label>Expected delivery</label>
                <input type="date" value={edd} onChange={(e) => setEdd(e.target.value)} />
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label>Weight (kg)</label>
                <input type="number" inputMode="decimal" step="0.1" min="30" max="200" value={weight} onChange={(e) => setWeight(e.target.value)} />
              </div>
              <div className="field">
                <label>Height (cm)</label>
                <input type="number" inputMode="decimal" step="0.5" min="120" max="210" value={height} onChange={(e) => setHeight(e.target.value)} />
              </div>
            </div>

            <button className="btn btn-primary" onClick={handleSave} disabled={!name.trim()} style={{ marginTop: 8 }}>Save changes</button>
            <button className="btn btn-text" onClick={handleCancel} style={{ marginTop: 8, width: '100%' }}>Cancel</button>
          </div>
        )}
      </main>

      {showWeightSheet && (
        <AddWeightSheet
          onClose={() => setShowWeightSheet(false)}
          onSubmit={(data) => {
            onAddWeight(data)
            setShowWeightSheet(false)
          }}
        />
      )}
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

function AddWeightSheet({ onClose, onSubmit }) {
  const today = new Date().toISOString().split('T')[0]
  const [kg, setKg] = useState('')
  const [date, setDate] = useState(today)
  const [week, setWeek] = useState('')

  const num = parseFloat(kg)
  const valid = !isNaN(num) && num > 30 && num < 200

  const handleBackdrop = (e) => {
    if (e.target.classList.contains('sheet-overlay')) onClose()
  }

  return (
    <div className="sheet-overlay" onClick={handleBackdrop}>
      <div className="sheet">
        <div className="sheet-handle" />
        <div className="sheet-title">Add weight</div>
        <div className="sheet-subtitle">Track how your weight changes through pregnancy.</div>

        <div className="field">
          <label>Weight (kg)</label>
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            placeholder="e.g. 64.5"
            value={kg}
            onChange={(e) => setKg(e.target.value)}
            autoFocus
          />
        </div>

        <div className="field-row">
          <div className="field">
            <label>Date</label>
            <input type="date" value={date} max={today} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="field">
            <label>Week of pregnancy</label>
            <input type="number" inputMode="numeric" placeholder="Optional" min="1" max="42" value={week} onChange={(e) => setWeek(e.target.value)} />
          </div>
        </div>

        <button
          className="btn btn-primary"
          disabled={!valid}
          onClick={() => onSubmit({
            id: Date.now().toString(),
            date,
            kg: num,
            week: week ? parseInt(week) : null,
          })}
          style={{ marginTop: 8 }}
        >
          Save weight
        </button>
        <button className="btn btn-text" onClick={onClose} style={{ marginTop: 8, width: '100%' }}>Cancel</button>
      </div>
    </div>
  )
}
