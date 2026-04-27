import { useState } from 'react'

export default function Welcome({ onSubmit }) {
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [edd, setEdd] = useState('')
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')

  const canSubmit = name.trim().length > 0

  const handleSubmit = () => {
    if (!canSubmit) return
    onSubmit({
      name: name.trim(),
      age: age ? parseInt(age) : null,
      edd: edd || null,
      weightKg: weight ? parseFloat(weight) : null,
      heightCm: height ? parseFloat(height) : null,
      createdAt: new Date().toISOString(),
    })
  }

  return (
    <>
      <div className="welcome">
        <div className="welcome-icon">HB</div>
        <h2>Welcome,<br/>let’s track your blood level together</h2>
        <p>
          This app helps you keep track of your haemoglobin (HB) during pregnancy
          and gives you simple advice on what to eat and when to see a midwife.
        </p>
      </div>

      <div style={{ padding: '0 20px 32px' }}>
        <div className="card">
          <div className="card-title">Tell us about you</div>
          <div className="card-subtitle">This stays only on your phone. You can update it any time from the Profile tab.</div>

          <div className="field">
            <label>Your first name</label>
            <input
              type="text"
              placeholder="e.g. Akosua"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="field-row">
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Age</label>
              <input
                type="number"
                inputMode="numeric"
                placeholder="e.g. 28"
                min="13"
                max="55"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Expected delivery</label>
              <input
                type="date"
                value={edd}
                onChange={(e) => setEdd(e.target.value)}
              />
            </div>
          </div>

          <div className="field-row" style={{ marginTop: 16 }}>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Weight (kg)</label>
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                placeholder="e.g. 62"
                min="30"
                max="200"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Height (cm)</label>
              <input
                type="number"
                inputMode="decimal"
                step="0.5"
                placeholder="e.g. 162"
                min="120"
                max="210"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
            </div>
          </div>

          <p style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 12, marginBottom: 16 }}>
            Age, weight and height are optional but help us give better advice. All fields except your name can be skipped.
          </p>

          <button
            className="btn btn-primary"
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            Get started
          </button>
        </div>
      </div>
    </>
  )
}
