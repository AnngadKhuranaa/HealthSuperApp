import { useEffect, useState } from 'react'
import { api } from '../services/api'
import Marquee from '../components/Marquee'
import '../App.css'

const MODULE_CONFIG = {
  'mental-health': {
    emoji: '🧠',
    bg: 'linear-gradient(135deg, #D4E8E0, #B8D4CC)',
    tags: ['Self-Report', 'Mood', 'Wellbeing'],
    num: '01',
  },
  'neurological': {
    emoji: '⚡',
    bg: 'linear-gradient(135deg, #D8E4F0, #C0D0E8)',
    tags: ['Speech', 'Movement', 'Balance'],
    num: '02',
  },
  'cardiovascular': {
    emoji: '❤️',
    bg: 'linear-gradient(135deg, #F0D8D8, #E8C0C0)',
    tags: ['Heart Rate', 'Blood Pressure', 'Wearables'],
    num: '03',
  },
}

const PILLARS = [
  { icon: '🌿', title: 'Honest Screening', desc: 'Structured self-report tools based on documented symptom domains — no fake AI, no invented scores.' },
  { icon: '🔒', title: 'Private by Design', desc: 'No names, no emails, no persistent storage. Your responses stay in your session only.' },
  { icon: '📋', title: 'Structured Reports', desc: 'Every screening produces a clear report with scores, checklists, limitations, and next steps.' },
  { icon: '⚠️', title: 'Safety First', desc: 'Concerning responses are always flagged with visible, verified crisis resources — not dismissed.' },
  { icon: '🎯', title: 'No False Promises', desc: 'We never diagnose. We screen. Every result is honest about what it can and cannot tell you.' },
  { icon: '🔬', title: 'Expanding Modules', desc: 'Mental health is just the start. Neurological and cardiovascular screening are coming soon.' },
]

export default function HomePage({ onStart }) {
  const [modules, setModules] = useState([])
  const [backendStatus, setBackendStatus] = useState('checking')

  useEffect(() => {
    api.getHealth()
      .then(() => setBackendStatus('ok'))
      .catch(() => setBackendStatus('error'))
    api.getModules()
      .then(d => setModules(d.modules))
      .catch(() => {})
  }, [])

  return (
    <div className="page fade-up">

      {/* ── HERO ───────────────────────────────────────────── */}
      <section style={{ padding: '72px 0 64px', borderBottom: '1px solid var(--border)' }}>
        <div className="container-wide" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s12)', alignItems: 'center' }}>

          {/* Left: text */}
          <div>
            <span className="eyebrow">A Modular Health Screening Platform</span>
            <h1 className="display-heading" style={{ fontSize: 'clamp(3rem, 7vw, 5.5rem)', marginBottom: 'var(--s6)' }}>
              Know<br />Your Mind.
            </h1>
            <p style={{ fontSize: '1.0625rem', color: 'var(--ink-muted)', lineHeight: 1.75, maxWidth: 440, marginBottom: 'var(--s6)' }}>
              Structured self-report screenings to help you understand your mental wellbeing — clearly, honestly, and without clinical jargon.
            </p>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--s2)', marginBottom: 'var(--s8)' }}>
              {[
                'Free, private, no account required',
                'Structured reports with scores and next steps',
                'No fake AI — honest, documented screening logic',
              ].map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--s2)', fontSize: '0.875rem', color: 'var(--ink-muted)' }}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: 'var(--accent-green)', flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4"/>
                  </svg>
                  {item}
                </li>
              ))}
            </ul>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s3)', alignItems: 'center' }}>
              {backendStatus === 'ok' ? (
                <button id="hero-start-btn" className="btn btn-primary btn-lg" onClick={onStart}>
                  Begin Screening →
                </button>
              ) : backendStatus === 'error' ? (
                <span className="status-badge warning">⚠ Backend offline — start the server</span>
              ) : (
                <span className="status-badge planned">Connecting…</span>
              )}
              {backendStatus === 'ok' && (
                <span className="status-badge available" style={{ marginLeft: 4 }}>● System ready</span>
              )}
            </div>
          </div>

          {/* Right: visual block */}
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute', top: 12, left: 12, right: -12, bottom: -12,
              background: 'rgba(10,10,10,0.07)',
              zIndex: 0,
            }} />
            <div style={{
              position: 'relative', zIndex: 1,
              background: 'var(--surface)',
              border: '2px solid var(--ink)',
              padding: 'var(--s8)',
              display: 'flex', flexDirection: 'column', gap: 'var(--s5)',
            }}>
              <span className="eyebrow" style={{ marginBottom: 0 }}>Your screening report includes</span>
              {[
                ['📊', 'Calculated screening score'],
                ['✅', 'Symptom-by-symptom checklist'],
                ['💬', 'Plain-language interpretation'],
                ['🔍', 'Honest limitations'],
                ['📍', 'Suggested next steps'],
              ].map(([icon, text]) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)' }}>
                  <span style={{ fontSize: '1.125rem' }}>{icon}</span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--ink)', fontWeight: 500 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── MARQUEE ───────────────────────────────────────── */}
      <Marquee />

      {/* ── MODULES ───────────────────────────────────────── */}
      <section style={{ padding: 'var(--s16) 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container-wide">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--s10)', flexWrap: 'wrap', gap: 'var(--s4)' }}>
            <div>
              <span className="eyebrow">Explore</span>
              <h2 className="display-heading" style={{ fontSize: 'clamp(2rem, 5vw, 3.75rem)' }}>
                Screening Modules
              </h2>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--ink-muted)', maxWidth: 280, textAlign: 'right', lineHeight: 1.6 }}>
              Begin with Mental Health. Neurological and Cardiovascular screenings are coming soon.
            </p>
          </div>

          <div className="module-grid">
            {modules.length === 0 && backendStatus === 'error' && (
              <div className="alert alert-warning">
                <strong>Backend not running</strong>
                Start the FastAPI server on port 8000 to load modules.
              </div>
            )}
            {modules.length === 0 && backendStatus !== 'error' && (
              <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}>
                <div className="spinner" />
              </div>
            )}

            {modules.map((mod, idx) => {
              const cfg = MODULE_CONFIG[mod.id] || { emoji: '🔬', bg: '#eee', tags: [], num: '0' + (idx + 1) }
              const isReversed = idx % 2 === 1

              return (
                <div
                  key={mod.id}
                  id={`module-card-${mod.id}`}
                  className={`module-card ${mod.status} ${isReversed ? 'reversed' : ''}`}
                  onClick={mod.status === 'available' ? onStart : undefined}
                  role={mod.status === 'available' ? 'button' : undefined}
                  tabIndex={mod.status === 'available' ? 0 : undefined}
                  onKeyDown={e => e.key === 'Enter' && mod.status === 'available' && onStart()}
                  aria-label={mod.status === 'available' ? `Start ${mod.name}` : `${mod.name} — coming soon`}
                >
                  {/* Visual panel */}
                  <div className="module-card-visual" style={{ background: cfg.bg }}>
                    <div className="module-card-visual-inner">{cfg.emoji}</div>
                    <span className="module-card-num">{cfg.num}</span>
                  </div>

                  {/* Body panel */}
                  <div className="module-card-body">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s2)', flexWrap: 'wrap' }}>
                      <span className={`status-badge ${mod.status}`}>
                        {mod.status === 'available' ? '● Available' : '○ Coming Soon'}
                      </span>
                    </div>
                    <h3 className="module-card-name">{mod.name}</h3>
                    <p className="module-card-desc">{mod.description}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {cfg.tags.map(tag => (
                        <span key={tag} className="module-tag">{tag}</span>
                      ))}
                    </div>
                    {mod.status === 'available' && (
                      <div className="module-card-arrow">
                        Start screening <span>→</span>
                      </div>
                    )}
                    {mod.status === 'planned' && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--ink-dim)', fontStyle: 'italic' }}>In development</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── PHILOSOPHY ────────────────────────────────────── */}
      <section style={{ padding: 'var(--s16) 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container-wide">
          <div style={{ marginBottom: 'var(--s10)' }}>
            <span className="eyebrow">What We Believe</span>
            <h2 className="display-heading" style={{ fontSize: 'clamp(2rem, 5vw, 3.75rem)' }}>
              Our Principles
            </h2>
          </div>
          <div className="pillar-grid">
            {PILLARS.map((p, i) => (
              <div key={i} className="pillar-card">
                <div className="pillar-icon">{p.icon}</div>
                <div className="pillar-title">{p.title}</div>
                <p style={{ fontSize: '0.875rem', color: 'var(--ink-muted)', lineHeight: 1.65 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DARK BANNER ───────────────────────────────────── */}
      <section className="section-dark" style={{ padding: 'var(--s16) var(--s6)', textAlign: 'center' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--s6)' }}>
          <span className="eyebrow" style={{ color: 'rgba(242,235,225,0.5)' }}>Why it matters</span>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.5rem, 7vw, 5rem)',
            lineHeight: 1.0,
            color: 'var(--ink-on-dark)',
            transform: 'scaleX(1.06)',
            transformOrigin: 'center',
          }}>
            Awareness<br />Changes Everything.
          </h2>
          <p style={{ fontSize: '0.9375rem', color: 'rgba(242,235,225,0.6)', lineHeight: 1.75, maxWidth: 480 }}>
            Most people who struggle with their mental health never seek help — not because they don't want it, but because they don't know where to start. HealthOS gives you a clear, private starting point.
          </p>
          <button className="btn btn-outline btn-lg" onClick={onStart}
            style={{ borderColor: 'var(--ink-on-dark)', color: 'var(--ink-on-dark)' }}
            id="banner-start-btn">
            Start Your Screening →
          </button>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer style={{
        padding: 'var(--s8) var(--s6)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 'var(--s4)',
        borderTop: '1px solid var(--border)',
        maxWidth: 1100, margin: '0 auto', width: '100%',
      }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--ink)' }}>HealthOS</span>
        <p style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', textAlign: 'center' }}>
          Prototype screening tool. Not a medical diagnosis. Always consult a qualified professional.
        </p>
        <span style={{ fontSize: '0.75rem', color: 'var(--ink-dim)' }}>© 2026 HealthOS</span>
      </footer>

    </div>
  )
}
