import { useState } from 'react'
import { classify, STATUS_META } from '../hbLogic'

export default function AddReadingSheet({ onClose, onSubmit }) {
  const today = new Date().toISOString().split('T')[0]
  const [hb, setHb] = useState('')
  const [date, setDate] = useState(today)
  const [week, setWeek] = useState('')

  const hbNum = parseFloat(hb)
  const valid = !isNaN(hbNum) && hbNum > 2 && hbNum < 20
  const status = valid ? classify(hbNum) : null
  const meta = status ? STATUS_META[status] : null

  const handleBackdrop = (e) => {
    if (e.target.classList.contains('sheet-overlay')) onClose()
  }

  return (
    <div className="sheet-overlay" onClick={handleBackdrop}>
      <div className="sheet">
        <div className="sheet-handle" />
        <div className="sheet-title">Add a reading</div>
        <div className="sheet-subtitle">Enter the HB value from your antenatal visit.</div>

        <div className="field">
          <label>HB value (g/dL)</label>
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            placeholder="e.g. 11.2"
            value={hb}
            onChange={(e) => setHb(e.target.value)}
            autoFocus
          />
          {valid && meta && (
            <div style={{ marginTop: 8 }}>
              <span className={`status-pill status-${meta.color}`}>
                <span className="status-dot" />
                {meta.label}
              </span>
            </div>
          )}
        </div>

        <div className="field-row">
          <div className="field">
            <label>Date</label>
            <input
              type="date"
              value={date}
              max={today}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Week of pregnancy</label>
            <input
              type="number"
              inputMode="numeric"
              placeholder="Optional"
              min="1"
              max="42"
              value={week}
              onChange={(e) => setWeek(e.target.value)}
            />
          </div>
        </div>

        <button
          className="btn btn-primary"
          disabled={!valid}
          onClick={() => onSubmit({ hb, date, week })}
          style={{ marginTop: 8 }}
        >
          Save reading
        </button>

        <button
          className="btn btn-text"
          onClick={onClose}
          style={{ marginTop: 8, width: '100%' }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
