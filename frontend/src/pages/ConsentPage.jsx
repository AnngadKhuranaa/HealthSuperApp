import '../App.css'

const NOT_LIST = [
  'A clinical diagnosis tool',
  'A validated medical screening instrument',
  'A replacement for professional evaluation',
  'A source of validated clinical interpretation bands',
  'A tool that can independently verify your symptoms',
]

const IS_LIST = [
  'A structured self-report questionnaire',
  'A private, in-session only experience — nothing is stored',
  'An honest report with documented scoring logic',
  'A safe starting point before speaking to a professional',
]

export default function ConsentPage({ onConsent, onBack }) {
  return (
    <div className="page fade-up">
      <div className="container" style={{ paddingTop: 'var(--s10)', paddingBottom: 'var(--s16)' }}>

        <button id="consent-back-btn" className="btn btn-ghost" onClick={onBack} style={{ marginBottom: 'var(--s6)' }}>
          ← Back
        </button>

        {/* Title block */}
        <div style={{ borderBottom: '2px solid var(--ink)', paddingBottom: 'var(--s8)', marginBottom: 'var(--s8)' }}>
          <span className="eyebrow">Before You Begin</span>
          <h1 className="display-heading" style={{ fontSize: 'clamp(2.25rem, 6vw, 4rem)', marginBottom: 'var(--s4)' }}>
            Mental Health<br />Screening
          </h1>
          <div style={{ display: 'flex', gap: 'var(--s2)', flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="status-badge warning">⚠ Prototype — not a clinical instrument</span>
            <span className="status-badge planned">9 questions · ~3 minutes</span>
          </div>
        </div>

        {/* Two-column grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s6)', marginBottom: 'var(--s8)' }}>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: 'var(--s6)' }}>
            <span className="eyebrow" style={{ color: 'var(--accent-green)' }}>This IS</span>
            <ul className="consent-list">
              {IS_LIST.map((item, i) => (
                <li key={i}>
                  <span style={{ color: 'var(--accent-green)', fontWeight: 700, flexShrink: 0 }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: 'var(--s6)' }}>
            <span className="eyebrow" style={{ color: 'var(--danger)' }}>This is NOT</span>
            <ul className="consent-list">
              {NOT_LIST.map((item, i) => (
                <li key={i}>
                  <span style={{ color: 'var(--danger)', fontWeight: 700, flexShrink: 0 }}>✗</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Crisis block */}
        <div className="alert alert-danger" style={{ marginBottom: 'var(--s6)' }}>
          <strong>If you are in crisis right now</strong>
          If you are having thoughts of harming yourself or are in immediate danger, please stop and contact emergency services (112 / 911) or a crisis line immediately. Do not rely on this tool for urgent support.
          <br /><br />
          <strong>India:</strong>&nbsp; iCall — 9152987821 &nbsp;|&nbsp; Vandrevala Foundation — 1860-2662-345 (24/7)
          <br />
          <strong>UK:</strong>&nbsp; Samaritans — 116 123 &nbsp;|&nbsp; <strong>US:</strong>&nbsp; Crisis Text Line — text HOME to 741741
        </div>

        {/* Privacy block */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: 'var(--s6)', marginBottom: 'var(--s8)' }}>
          <span className="eyebrow">Privacy</span>
          <ul className="consent-list">
            {[
              'No name, email, or personal identifier is collected',
              'Session data is in-memory only — never written to disk or database',
              'Questionnaire answers are not logged or retained after your session',
              'Sessions are not linked to each other — there is no user account',
            ].map((item, i) => (
              <li key={i}>
                <span style={{ color: 'var(--accent-blue)', flexShrink: 0 }}>🔒</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Consent action */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--s6)' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--ink-muted)', lineHeight: 1.7, marginBottom: 'var(--s5)', maxWidth: 560 }}>
            By clicking "I understand — begin screening", you confirm you have read the above, understand this is a prototype tool, and agree the results are not a medical diagnosis.
          </p>
          <button id="consent-proceed-btn" className="btn btn-primary btn-lg btn-full" onClick={onConsent}>
            I understand — begin screening →
          </button>
        </div>

      </div>
    </div>
  )
}
