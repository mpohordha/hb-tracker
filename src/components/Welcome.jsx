import { useState } from 'react'

export default function Welcome({ onSubmit }) {
  const [name, setName] = useState('')
  const [edd, setEdd] = useState('')

  const canSubmit = name.trim().length > 0

  const handleSubmit = () => {
    if (!canSubmit) return
    onSubmit({
      name: name.trim(),
      edd: edd || null,
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
          <div className="card-subtitle">This stays only on your phone.</div>

          <div className="field">
            <label>Your first name</label>
            <input
              type="text"
              placeholder="e.g. Akosua"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Expected delivery date <span style={{ color: 'var(--ink-mute)', fontWeight: 500 }}>(optional)</span></label>
            <input
              type="date"
              value={edd}
              onChange={(e) => setEdd(e.target.value)}
            />
          </div>

          <button
            className="btn btn-primary"
            disabled={!canSubmit}
            onClick={handleSubmit}
            style={{ marginTop: 8 }}
          >
            Get started
          </button>
        </div>
      </div>
    </>
  )
}
