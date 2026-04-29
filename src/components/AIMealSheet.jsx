import { useState, useEffect } from 'react'
import { suggestMeal, hasUserAcknowledged, setAcknowledged, getProxyUrl, setProxyUrl } from '../aiMeal'
import { classify } from '../hbLogic'

export default function AIMealSheet({ profile, latestReading, onClose }) {
  const [stage, setStage] = useState('loading') // loading | disclaimer | configure | result | error
  const [busy, setBusy] = useState(false)
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [proxyInput, setProxyInput] = useState('')

  useEffect(() => {
    (async () => {
      const acked = await hasUserAcknowledged()
      const url = await getProxyUrl()
      setProxyInput(url || '')

      if (!acked) {
        setStage('disclaimer')
      } else if (!url) {
        setStage('configure')
      } else {
        setStage('disclaimer-shown')
        runSuggest()
      }
    })()
    // eslint-disable-next-line
  }, [])

  const runSuggest = async () => {
    setBusy(true)
    setError('')
    setText('')
    const status = latestReading ? classify(latestReading.hb) : null
    const week = latestReading?.week
    const result = await suggestMeal({ status, week, name: profile?.name })
    if (result.ok) {
      setText(result.text)
      setStage('result')
    } else if (result.error === 'no-proxy') {
      setStage('configure')
    } else {
      setError(result.message)
      setStage('error')
    }
    setBusy(false)
  }

  const handleAck = async () => {
    await setAcknowledged()
    const url = await getProxyUrl()
    if (!url) {
      setStage('configure')
    } else {
      runSuggest()
    }
  }

  const handleSaveProxy = async () => {
    await setProxyUrl(proxyInput)
    if (proxyInput.trim()) {
      runSuggest()
    } else {
      onClose()
    }
  }

  const handleBackdrop = (e) => {
    if (e.target.classList.contains('sheet-overlay')) onClose()
  }

  return (
    <div className="sheet-overlay" onClick={handleBackdrop}>
      <div className="sheet">
        <div className="sheet-handle" />

        {stage === 'loading' && (
          <div style={{ padding: '20px 0', textAlign: 'center' }}>
            <p style={{ color: 'var(--ink-mute)' }}>Loading…</p>
          </div>
        )}

        {stage === 'disclaimer' && (
          <>
            <div className="sheet-title">Before you continue</div>
            <div className="sheet-subtitle">Please read this carefully.</div>

            <div className="advice alert" style={{ marginBottom: 16 }}>
              <div className="label">Important</div>
              <p>
                The "Suggest a meal" feature uses an AI to generate ideas. <strong>It has not been reviewed by a midwife or doctor</strong> and may sometimes give incorrect or unsuitable advice.
              </p>
              <p>
                If you have <strong>food allergies</strong>, dietary restrictions, or any specific medical condition, do not follow these AI-generated ideas without first checking with your antenatal clinic.
              </p>
              <p>
                The trusted advice on the home screen and the Learn tab has been reviewed and is safer to follow than these AI suggestions.
              </p>
            </div>

            <button className="btn btn-primary" onClick={handleAck}>
              I understand, continue
            </button>
            <button className="btn btn-text" onClick={onClose} style={{ marginTop: 8, width: '100%' }}>
              Cancel
            </button>
          </>
        )}

        {stage === 'configure' && (
          <>
            <div className="sheet-title">AI meal suggestions</div>
            <div className="sheet-subtitle">
              This feature needs to be set up by the person who installed the app for you. They need to enter the AI service address below.
            </div>

            <div className="field">
              <label>AI service address</label>
              <input
                type="text"
                placeholder="https://your-proxy.vercel.app/api/messages"
                value={proxyInput}
                onChange={(e) => setProxyInput(e.target.value)}
              />
            </div>

            <p style={{ fontSize: 12, color: 'var(--ink-mute)', lineHeight: 1.5, marginBottom: 16 }}>
              Don't know what this is? Tap Cancel — the rest of the app works without this feature.
            </p>

            <button className="btn btn-primary" onClick={handleSaveProxy}>
              Save and try
            </button>
            <button className="btn btn-text" onClick={onClose} style={{ marginTop: 8, width: '100%' }}>
              Cancel
            </button>
          </>
        )}

        {stage === 'result' && (
          <>
            <div className="sheet-title">Meal idea</div>
            <div className="sheet-subtitle">A suggestion based on your latest reading.</div>

            <div className="advice warn" style={{ marginBottom: 16 }}>
              <div className="label">AI-generated — not reviewed by a midwife</div>
              <p style={{ fontSize: 13 }}>
                Always check with your antenatal clinic before changing your diet, especially if you have allergies.
              </p>
            </div>

            <div style={{
              background: 'var(--cream)',
              padding: 18,
              borderRadius: 12,
              border: '1px solid var(--line)',
              fontSize: 14,
              lineHeight: 1.65,
              color: 'var(--ink)',
              whiteSpace: 'pre-wrap',
              marginBottom: 16,
            }}>
              {text}
            </div>

            <button className="btn btn-ghost" onClick={runSuggest} disabled={busy} style={{ marginBottom: 8 }}>
              {busy ? 'Thinking…' : '🔄 Try another idea'}
            </button>
            <button className="btn btn-text" onClick={onClose} style={{ width: '100%' }}>
              Close
            </button>
          </>
        )}

        {stage === 'error' && (
          <>
            <div className="sheet-title">Something went wrong</div>
            <div className="advice alert" style={{ marginBottom: 16 }}>
              <div className="label">Error</div>
              <p>{error}</p>
            </div>

            <button className="btn btn-ghost" onClick={runSuggest} disabled={busy} style={{ marginBottom: 8 }}>
              Try again
            </button>
            <button className="btn btn-text" onClick={onClose} style={{ width: '100%' }}>
              Close
            </button>
          </>
        )}

        {stage === 'disclaimer-shown' && (
          <div style={{ padding: '20px 0', textAlign: 'center' }}>
            <p style={{ color: 'var(--ink-mute)' }}>{busy ? 'Thinking of a meal idea…' : 'Loading…'}</p>
          </div>
        )}
      </div>
    </div>
  )
}
