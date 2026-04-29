import { useState } from 'react'
import { getWhatsAppLink, getSmsLink, PILOT } from '../pilot'
import { addFeedback } from '../storage'

const TOPICS = [
  { v: 'confused', label: 'Something confused me' },
  { v: 'broken', label: 'Something is broken' },
  { v: 'idea', label: 'I have an idea or suggestion' },
  { v: 'praise', label: 'Something I liked' },
  { v: 'other', label: 'Other' },
]

export default function FeedbackSheet({ profile, onClose, onSaved }) {
  const [topic, setTopic] = useState('confused')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState('')

  const valid = message.trim().length >= 5

  const handleBackdrop = (e) => {
    if (e.target.classList.contains('sheet-overlay')) onClose()
  }

  const buildMessage = () => {
    const topicLabel = TOPICS.find(t => t.v === topic)?.label || topic
    return `HB Tracker pilot feedback from ${profile?.name || 'a user'}:\n\nTopic: ${topicLabel}\n\n${message.trim()}`
  }

  const handleSaveOnly = async () => {
    if (!valid) return
    setBusy(true)
    const entry = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      topic,
      message: message.trim(),
    }
    await addFeedback(entry)
    if (onSaved) onSaved(entry)
    setDone('Feedback saved on your phone.')
    setBusy(false)
    setTimeout(() => onClose(), 1100)
  }

  const handleWhatsApp = async () => {
    if (!valid) return
    setBusy(true)
    const entry = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      topic,
      message: message.trim(),
      sentVia: 'whatsapp',
    }
    await addFeedback(entry)
    if (onSaved) onSaved(entry)
    window.location.href = getWhatsAppLink(buildMessage())
    setBusy(false)
    setTimeout(() => onClose(), 600)
  }

  const handleSMS = async () => {
    if (!valid) return
    setBusy(true)
    const entry = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      topic,
      message: message.trim(),
      sentVia: 'sms',
    }
    await addFeedback(entry)
    if (onSaved) onSaved(entry)
    window.location.href = getSmsLink(buildMessage())
    setBusy(false)
    setTimeout(() => onClose(), 600)
  }

  return (
    <div className="sheet-overlay" onClick={handleBackdrop}>
      <div className="sheet">
        <div className="sheet-handle" />
        <div className="sheet-title">Send feedback</div>
        <div className="sheet-subtitle">
          Help us make this app better. Your feedback goes to {PILOT.nurseName}.
        </div>

        <div className="field">
          <label>What is this about?</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {TOPICS.map(t => (
              <button
                key={t.v}
                onClick={() => setTopic(t.v)}
                style={{
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: topic === t.v ? 'var(--terracotta-tint)' : 'var(--cream)',
                  border: `1.5px solid ${topic === t.v ? 'var(--terracotta)' : 'var(--line)'}`,
                  textAlign: 'left',
                  fontSize: 14,
                  fontWeight: topic === t.v ? 600 : 500,
                  color: 'var(--ink)',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label>Tell us more</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            rows={4}
            style={{
              width: '100%',
              padding: 14,
              border: '1.5px solid var(--line)',
              borderRadius: 12,
              background: 'var(--cream)',
              color: 'var(--ink)',
              fontSize: 16,
              resize: 'vertical',
              minHeight: 100,
              fontFamily: 'inherit',
            }}
          />
          <div style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 4 }}>
            {message.trim().length} / minimum 5 characters
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleWhatsApp}
          disabled={!valid || busy}
          style={{ marginBottom: 8 }}
        >
          📱 Send via WhatsApp
        </button>

        <button
          className="btn btn-ghost"
          onClick={handleSMS}
          disabled={!valid || busy}
          style={{ marginBottom: 8 }}
        >
          ✉ Send via SMS
        </button>

        <button
          className="btn btn-ghost"
          onClick={handleSaveOnly}
          disabled={!valid || busy}
          style={{ marginBottom: 8 }}
        >
          💾 Just save in app (send later)
        </button>

        <button className="btn btn-text" onClick={onClose} style={{ width: '100%' }}>
          Cancel
        </button>

        {done && (
          <div style={{ marginTop: 12, fontSize: 13, color: 'var(--forest)', textAlign: 'center' }}>
            {done}
          </div>
        )}

        <p style={{ fontSize: 11, color: 'var(--ink-mute)', lineHeight: 1.5, marginTop: 16 }}>
          Your feedback is saved on your phone and only sent if you choose WhatsApp or SMS.
        </p>
      </div>
    </div>
  )
}
