import { classify, STATUS_META, getAdvice, getTrendMessage } from '../hbLogic'
import {
  LineChart, Line, XAxis, YAxis, ReferenceLine, ResponsiveContainer, Tooltip,
} from 'recharts'

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function formatDateLong(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function Home({ profile, readings, onAddClick, onDelete }) {
  const sorted = [...readings].sort((a, b) => new Date(b.date) - new Date(a.date))
  const latest = sorted[0]
  const status = latest ? classify(latest.hb) : null
  const meta = status ? STATUS_META[status] : null
  const advice = status ? getAdvice(status) : null
  const trend = getTrendMessage(readings)

  const chartData = [...readings]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(r => ({
      date: formatDate(r.date),
      hb: r.hb,
    }))

  return (
    <>
      <header className="app-header">
        <div className="brand">
          <div className="logo">HB</div>
          <div>
            <h1>HB Tracker</h1>
            <div className="subtitle">My pregnancy health</div>
          </div>
        </div>
      </header>

      <main className="app-main">
        {/* Hero */}
        <div className="hero">
          <div className="greeting">Hello,</div>
          <div className="name">{profile.name}</div>

          {latest ? (
            <>
              <div className="latest-label">Latest HB reading</div>
              <div className="latest-value">
                {latest.hb.toFixed(1)}<span className="small">g/dL</span>
              </div>
              <div className="latest-meta">
                {formatDateLong(latest.date)}
                {latest.week ? ` · Week ${latest.week}` : ''}
              </div>
            </>
          ) : (
            <>
              <div className="latest-label">No readings yet</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 22, marginTop: 4, opacity: 0.95 }}>
                Tap the + button to add your first one.
              </div>
            </>
          )}
        </div>

        {/* Status + advice */}
        {latest && meta && advice && (
          <div className="card" style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div className="card-title" style={{ marginBottom: 0 }}>What this means</div>
              <span className={`status-pill status-${meta.color}`}>
                <span className="status-dot" />
                {meta.label}
              </span>
            </div>

            {trend && (
              <div style={{ fontSize: 13, color: 'var(--ink-mute)', marginBottom: 12 }}>
                {trend}
              </div>
            )}

            <div className={`advice ${advice.tone === 'good' ? '' : advice.tone === 'warn' ? 'warn' : 'alert'}`}>
              <div className="label">{advice.title}</div>
              {advice.lines.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>
        )}

        {/* Chart */}
        {readings.length >= 2 && (
          <div className="card">
            <div className="card-title">Your trend</div>
            <div className="card-subtitle">All your readings over time. The dashed line is the healthy minimum (11.0).</div>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#8C7A6B' }}
                    tickLine={false}
                    axisLine={{ stroke: '#E5DCC8' }}
                  />
                  <YAxis
                    domain={[5, 15]}
                    tick={{ fontSize: 11, fill: '#8C7A6B' }}
                    tickLine={false}
                    axisLine={false}
                    width={36}
                  />
                  <ReferenceLine y={11} stroke="#2F4A38" strokeDasharray="4 4" strokeWidth={1.5} />
                  <Tooltip
                    contentStyle={{
                      background: '#FAF6EE',
                      border: '1px solid #E5DCC8',
                      borderRadius: 12,
                      fontSize: 13,
                    }}
                    labelStyle={{ color: '#5C4A3E', fontWeight: 600 }}
                    formatter={(value) => [`${value} g/dL`, 'HB']}
                  />
                  <Line
                    type="monotone"
                    dataKey="hb"
                    stroke="#7A3B2E"
                    strokeWidth={2.5}
                    dot={{ fill: '#7A3B2E', strokeWidth: 0, r: 5 }}
                    activeDot={{ r: 7, fill: '#7A3B2E' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* History list */}
        <div className="section-head">
          <h3>History</h3>
          {readings.length > 0 && <span className="count">{readings.length} reading{readings.length === 1 ? '' : 's'}</span>}
        </div>

        {readings.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              No readings yet. Tap the <strong>+</strong> button below to add your first HB reading.
            </div>
          </div>
        ) : (
          <ul className="reading-list">
            {sorted.map(r => {
              const s = classify(r.hb)
              const m = STATUS_META[s]
              return (
                <li key={r.id} className="reading-row" onClick={() => onDelete(r.id)}>
                  <div className="left">
                    <div>
                      <span className="value">{r.hb.toFixed(1)}</span>
                      <span className="unit">g/dL</span>
                    </div>
                    <div className="date">
                      {formatDateLong(r.date)}
                      {r.week ? ` · Week ${r.week}` : ''}
                    </div>
                  </div>
                  <span className={`status-pill status-${m.color}`}>
                    {m.label}
                  </span>
                </li>
              )
            })}
          </ul>
        )}

        {readings.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--ink-mute)' }}>
            Tap a reading to delete it.
          </div>
        )}
      </main>

      <button className="fab" onClick={onAddClick} aria-label="Add reading">
        +
      </button>
    </>
  )
}
