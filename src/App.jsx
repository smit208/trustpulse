import { useState, useEffect, useRef, useCallback } from 'react'
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis
} from 'recharts'
import './App.css'

// ─── Constants ──────────────────────────────────────────────────────────────
const USER = {
  name: 'Arjun Mehta',
  accountId: 'BOB-9042-7761-XX',
  avatar: 'AM',
  branch: 'Mumbai – Nariman Point',
}

const RISK_EVENTS_POOL = [
  { msg: 'New device detected', delta: +20, type: 'danger' },
  { msg: 'Unusual typing pattern identified', delta: +15, type: 'warning' },
  { msg: 'Transaction amount spike (₹1.2L)', delta: +25, type: 'danger' },
  { msg: 'Location mismatch detected (Pune ↔ Mumbai)', delta: +30, type: 'danger' },
  { msg: 'Multiple failed PIN attempts', delta: +18, type: 'danger' },
  { msg: 'Rapid session switching detected', delta: +12, type: 'warning' },
  { msg: 'Beneficiary added outside business hours', delta: +22, type: 'danger' },
  { msg: 'Session verified by biometrics', delta: -20, type: 'safe' },
  { msg: 'OTP step-up authentication passed', delta: -25, type: 'safe' },
  { msg: 'Risk score normalised – behaviour consistent', delta: -15, type: 'safe' },
  { msg: 'Trusted device fingerprint matched', delta: -10, type: 'safe' },
  { msg: 'Login from usual location confirmed', delta: -8, type: 'safe' },
]

const SIGNAL_POOL = {
  typing: [
    { label: 'Normal', status: 'safe', icon: '⌨️' },
    { label: 'Unusual rhythm detected', status: 'warning', icon: '⌨️' },
    { label: 'Bot-like cadence', status: 'danger', icon: '⌨️' },
  ],
  device: [
    { label: 'Trusted device', status: 'safe', icon: '💻' },
    { label: 'New device', status: 'warning', icon: '💻' },
    { label: 'Unknown fingerprint', status: 'danger', icon: '💻' },
  ],
  location: [
    { label: 'Usual location', status: 'safe', icon: '📍' },
    { label: 'New city detected', status: 'warning', icon: '📍' },
    { label: 'Country mismatch', status: 'danger', icon: '📍' },
  ],
  transaction: [
    { label: 'Normal pattern', status: 'safe', icon: '💳' },
    { label: 'Elevated amount', status: 'warning', icon: '💳' },
    { label: 'Suspicious spike', status: 'danger', icon: '💳' },
  ],
  session: [
    { label: 'Normal duration', status: 'safe', icon: '⏱️' },
    { label: 'Extended session', status: 'warning', icon: '⏱️' },
    { label: 'Idle timeout risk', status: 'danger', icon: '⏱️' },
  ],
}

function clamp(v, min, max) { return Math.min(Math.max(v, min), max) }
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

// ─── Sub-components ──────────────────────────────────────────────────────────

function RiskGauge({ score }) {
  const color =
    score <= 30 ? '#22c55e' :
    score <= 60 ? '#f59e0b' :
    '#ef4444'

  const label =
    score <= 30 ? 'LOW RISK' :
    score <= 60 ? 'MODERATE' :
    'HIGH RISK'

  const data = [{ value: score, fill: color }]

  return (
    <div className="gauge-container">
      <div className="gauge-glow" style={{ '--glow': color }} />
      <ResponsiveContainer width="100%" height={220}>
        <RadialBarChart
          cx="50%" cy="70%"
          innerRadius="65%" outerRadius="90%"
          startAngle={180} endAngle={0}
          data={data}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar
            background={{ fill: '#1e293b' }}
            dataKey="value"
            cornerRadius={10}
            animationDuration={600}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="gauge-center">
        <span className="gauge-score" style={{ color }}>{score}</span>
        <span className="gauge-label" style={{ color }}>{label}</span>
        <span className="gauge-sub">Identity Trust Score</span>
      </div>
    </div>
  )
}

function SignalBadge({ status }) {
  const cls =
    status === 'safe' ? 'badge-safe' :
    status === 'warning' ? 'badge-warn' :
    'badge-danger'
  const dot =
    status === 'safe' ? '#22c55e' :
    status === 'warning' ? '#f59e0b' :
    '#ef4444'

  return (
    <span className={`signal-badge ${cls}`}>
      <span className="badge-dot" style={{ background: dot }} />
      {status === 'safe' ? 'Safe' : status === 'warning' ? 'Warning' : 'Alert'}
    </span>
  )
}

function BehavioralSignals({ signals }) {
  const labels = {
    typing: 'Typing Behaviour',
    device: 'Device Fingerprint',
    location: 'Login Location',
    transaction: 'Transaction Pattern',
    session: 'Session Duration',
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-icon">🧬</span>
        <h2 className="panel-title">Behavioral Signals</h2>
        <span className="live-pill">LIVE</span>
      </div>
      <div className="signals-list">
        {Object.entries(signals).map(([key, sig]) => (
          <div key={key} className="signal-row">
            <span className="signal-icon">{sig.icon}</span>
            <div className="signal-info">
              <span className="signal-name">{labels[key]}</span>
              <span className="signal-value">{sig.label}</span>
            </div>
            <SignalBadge status={sig.status} />
          </div>
        ))}
      </div>
    </div>
  )
}

function EventLog({ events }) {
  const bottomRef = useRef(null)
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [events])

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-icon">📋</span>
        <h2 className="panel-title">Risk Event Log</h2>
        <span className="live-pill">LIVE</span>
      </div>
      <div className="event-log">
        {events.map((ev, i) => (
          <div key={i} className={`event-row event-${ev.type}`}>
            <span className="event-icon">
              {ev.type === 'safe' ? '✅' : ev.type === 'warning' ? '⚠️' : '🚨'}
            </span>
            <div className="event-body">
              <span className="event-msg">{ev.msg}</span>
              <span className={`event-delta ${ev.delta > 0 ? 'delta-up' : 'delta-down'}`}>
                {ev.delta > 0 ? `Risk +${ev.delta}` : `Risk ${ev.delta}`}
              </span>
            </div>
            <span className="event-time">{ev.time}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}

function TrustProfileCard({ score, sessionStart }) {
  const trustLevel =
    score <= 30 ? { label: 'Trusted', cls: 'trust-safe', icon: '🛡️' } :
    score <= 60 ? { label: 'Under Review', cls: 'trust-warn', icon: '🔍' } :
    { label: 'Flagged', cls: 'trust-danger', icon: '🚩' }

  const elapsed = Math.floor((Date.now() - sessionStart) / 1000)
  const mins = String(Math.floor(elapsed / 60)).padStart(2, '0')
  const secs = String(elapsed % 60).padStart(2, '0')

  return (
    <div className="panel profile-card">
      <div className="profile-avatar">{USER.avatar}</div>
      <div className="profile-info">
        <h3 className="profile-name">{USER.name}</h3>
        <span className="profile-account">{USER.accountId}</span>
        <span className="profile-branch">🏦 {USER.branch}</span>
      </div>
      <div className="profile-meta">
        <div className={`trust-badge ${trustLevel.cls}`}>
          {trustLevel.icon} {trustLevel.label}
        </div>
        <div className="profile-stats">
          <div className="stat-item">
            <span className="stat-label">Session Time</span>
            <span className="stat-val">{mins}:{secs}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Last Verified</span>
            <span className="stat-val">Just now</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Auth Method</span>
            <span className="stat-val">MFA + Biometric</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function RiskChart({ history }) {
  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-icon">📈</span>
        <h2 className="panel-title">Risk Score Timeline</h2>
        <span className="live-pill">LIVE</span>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={history} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="t" tick={{ fill: '#64748b', fontSize: 10 }} />
          <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
          <Tooltip
            contentStyle={{ background: '#0f172a', border: '1px solid #f97316', borderRadius: 8, color: '#f8fafc' }}
            labelStyle={{ color: '#94a3b8' }}
          />
          <Area type="monotone" dataKey="score" stroke="#f97316" strokeWidth={2}
            fill="url(#riskGrad)" dot={false} animationDuration={400} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function OTPModal({ onSuccess, onDismiss }) {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [status, setStatus] = useState('idle') // idle | success | error
  const refs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()]

  const handleChange = (idx, val) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]
    next[idx] = val
    setOtp(next)
    if (val && idx < 5) refs[idx + 1].current.focus()
  }

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      refs[idx - 1].current.focus()
    }
  }

  const verify = () => {
    const code = otp.join('')
    if (code === '123456') {
      setStatus('success')
      setTimeout(onSuccess, 1400)
    } else {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 1500)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-icon-ring">
          <span className="modal-icon-big">🔐</span>
        </div>
        <h2 className="modal-title">Step-Up Verification Required</h2>
        <p className="modal-sub">
          High risk activity detected on your session.<br />
          Enter the OTP sent to <strong>+91 ••••••7821</strong>
        </p>
        <div className="otp-row">
          {otp.map((d, i) => (
            <input
              key={i}
              ref={refs[i]}
              className={`otp-box ${status === 'error' ? 'otp-err' : ''} ${status === 'success' ? 'otp-ok' : ''}`}
              maxLength={1}
              value={d}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              inputMode="numeric"
            />
          ))}
        </div>
        <p className="otp-hint">
          {status === 'error' && <span style={{ color: '#ef4444' }}>❌ Incorrect OTP. Try again.</span>}
          {status === 'success' && <span style={{ color: '#22c55e' }}>✅ Verified! Normalising risk…</span>}
          {status === 'idle' && <span style={{ color: '#64748b' }}>Demo OTP: <strong>1 2 3 4 5 6</strong></span>}
        </p>
        <div className="modal-actions">
          <button className="btn-verify" onClick={verify}>Verify Identity</button>
          <button className="btn-dismiss" onClick={onDismiss}>Dismiss</button>
        </div>
        <div className="modal-badges">
          <span className="modal-badge">🏦 Bank of Baroda</span>
          <span className="modal-badge">🔒 Zero Trust</span>
          <span className="modal-badge">🇮🇳 PSB Hackathon 2026</span>
        </div>
      </div>
    </div>
  )
}

// ─── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const [score, setScore] = useState(22)
  const [history, setHistory] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({ t: `T-${20 - i}`, score: rand(15, 35) }))
  )
  const [signals, setSignals] = useState({
    typing: SIGNAL_POOL.typing[0],
    device: SIGNAL_POOL.device[0],
    location: SIGNAL_POOL.location[0],
    transaction: SIGNAL_POOL.transaction[0],
    session: SIGNAL_POOL.session[0],
  })
  const [events, setEvents] = useState([
    { msg: 'Session initiated — identity verified', delta: 0, type: 'safe', time: '21:30:00' },
    { msg: 'Biometric authentication passed', delta: -10, type: 'safe', time: '21:30:01' },
  ])
  const [showModal, setShowModal] = useState(false)
  const [modalShownAt, setModalShownAt] = useState(0)
  const [sessionStart] = useState(Date.now())
  const [tick, setTick] = useState(0)
  const tickRef = useRef(0)

  const addEvent = useCallback((ev) => {
    const now = new Date()
    const time = now.toTimeString().slice(0, 8)
    setEvents(prev => [...prev.slice(-49), { ...ev, time }])
  }, [])

  // ── Main simulation tick ──
  useEffect(() => {
    const interval = setInterval(() => {
      tickRef.current += 1
      setTick(t => t + 1)

      setScore(prev => {
        // Random drift
        const drift = rand(-6, 8)
        // Occasional spikes
        const spike = Math.random() < 0.08 ? rand(15, 30) : 0
        const drop = Math.random() < 0.06 ? rand(-20, -10) : 0
        return clamp(prev + drift + spike + drop, 5, 95)
      })

      // Update random signal
      if (Math.random() < 0.3) {
        const keys = Object.keys(SIGNAL_POOL)
        const key = keys[rand(0, keys.length - 1)]
        const pool = SIGNAL_POOL[key]
        const picked = pool[rand(0, pool.length - 1)]
        setSignals(prev => ({ ...prev, [key]: picked }))
      }

      // Random event
      if (Math.random() < 0.25) {
        const ev = RISK_EVENTS_POOL[rand(0, RISK_EVENTS_POOL.length - 1)]
        addEvent(ev)
      }

      // History
      setHistory(prev => {
        const newScore = clamp(prev[prev.length - 1]?.score + rand(-6, 8) + (Math.random() < 0.08 ? rand(15, 30) : 0), 5, 95)
        const slice = prev.slice(-29)
        return [...slice, { t: `T-0`, score: newScore }]
      })

    }, 2500)
    return () => clearInterval(interval)
  }, [addEvent])

  // ── Step-up trigger ──
  useEffect(() => {
    if (score > 70 && !showModal && Date.now() - modalShownAt > 15000) {
      setShowModal(true)
      setModalShownAt(Date.now())
      addEvent({ msg: 'Step-up auth triggered — risk threshold exceeded', delta: 0, type: 'danger' })
    }
  }, [score, showModal, modalShownAt, addEvent])

  const handleOTPSuccess = () => {
    setShowModal(false)
    setScore(s => clamp(s - 40, 10, 100))
    addEvent({ msg: 'Step-up OTP verified — risk normalised', delta: -40, type: 'safe' })
  }

  // ── Color ──
  const riskColor =
    score <= 30 ? '#22c55e' :
    score <= 60 ? '#f59e0b' :
    '#ef4444'

  return (
    <div className="app-root">
      {/* Header */}
      <header className="top-bar">
        <div className="top-bar-left">
          <div className="bob-logo">
            <div className="bob-logo-icon">🏦</div>
            <div>
              <div className="bob-name">Bank of Baroda</div>
              <div className="bob-sub">PSB Hackathon Series 2026</div>
            </div>
          </div>
        </div>
        <div className="top-bar-center">
          <h1 className="app-title">
            <span className="trust-text">Trust</span>
            <span className="pulse-text">Pulse</span>
          </h1>
          <p className="app-tagline">Identity Trust & Risk Scoring — Zero Trust Architecture</p>
        </div>
        <div className="top-bar-right">
          <div className="header-score-pill" style={{ borderColor: riskColor, color: riskColor }}>
            <span className="header-score-dot" style={{ background: riskColor }} />
            Risk: <strong>{score}</strong>
          </div>
          <div className="iitgn-badge">⚡ IITGN × DFS</div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="main-grid">

        {/* Col 1 – Gauge + Chart */}
        <div className="col col-1">
          <div className="panel gauge-panel">
            <div className="panel-header">
              <span className="panel-icon">🎯</span>
              <h2 className="panel-title">Live Risk Score</h2>
              <span className="live-pill">LIVE</span>
            </div>
            <RiskGauge score={score} />
            <div className="risk-bands">
              <div className="band band-safe">0–30 Safe</div>
              <div className="band band-warn">31–60 Warning</div>
              <div className="band band-danger">61–100 Danger</div>
            </div>
          </div>
          <RiskChart history={history} />
        </div>

        {/* Col 2 – Profile + Signals */}
        <div className="col col-2">
          <TrustProfileCard score={score} sessionStart={sessionStart} />
          <BehavioralSignals signals={signals} />
        </div>

        {/* Col 3 – Event Log */}
        <div className="col col-3">
          <EventLog events={events} />
        </div>

      </main>

      {/* Footer */}
      <footer className="app-footer">
        <span>🇮🇳 PSB Hackathon Series 2026 — Cybersecurity & Fraud Domain</span>
        <span>•</span>
        <span>Hosted by Bank of Baroda</span>
        <span>•</span>
        <span>Academic Partner: IIT Gandhinagar</span>
        <span>•</span>
        <span>Theme: Identity Trust, Protection & Safety</span>
      </footer>

      {/* OTP Modal */}
      {showModal && (
        <OTPModal
          onSuccess={handleOTPSuccess}
          onDismiss={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
