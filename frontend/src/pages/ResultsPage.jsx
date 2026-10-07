import '../App.css'

const STATUS_CONFIG = {
  reported:     { dot: 'reported',     label: 'Reported',     icon: '●' },
  not_reported: { dot: 'not_reported', label: 'Not reported', icon: '○' },
  not_answered: { dot: 'not_answered', label: 'Not answered', icon: '—' },
}

export default function ResultsPage({ report, onRestart, onHome }) {
  if (!report) return null

  const {
    screening_name,
    completed_at,
    completion_status,
    total_score,
    max_possible_score,
    score_interpretation_label,
    score_interpretation_description,
    scoring_method,
    symptom_checklist,
    missing_questions,
    safety_concern,
    safety_message,
    suggested_next_steps,
    disclaimer,
  } = report

  const completedAt = new Date(completed_at).toLocaleString('en-IN', {
    dateStyle: 'medium', timeStyle: 'short'
  })

  const reportedCount = symptom_checklist.filter(s => s.status === 'reported').length

  return (
    <div className="page fade-up">
      <div className="container" style={{ paddingTop: 'var(--s8)', paddingBottom: 'var(--s16)' }}>

        {/* Safety alert — always first, always prominent */}
        {safety_concern && (
          <div className="alert alert-danger" id="safety-alert" role="alert" aria-live="assertive"
            style={{ marginBottom: 'var(--s6)', borderLeft: '4px solid var(--danger)' }}>
            <strong>⚠ Your response requires immediate attention</strong>
            <div style={{ marginTop: 'var(--s3)', whiteSpace: 'pre-line', lineHeight: 1.75 }}>
              {safety_message}
            </div>
          </div>
        )}

        {/* Title block */}
        <div style={{ borderBottom: '2px solid var(--ink)', marginBottom: 'var(--s8)', paddingBottom: 'var(--s6)' }}>
          <span className="eyebrow">Screening Complete</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 'var(--s4)' }}>
            <h1 className="display-heading" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
              Your Results
            </h1>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--s2)' }}>
              <span className={`status-badge ${completion_status === 'complete' ? 'available' : 'warning'}`}>
                {completion_status === 'complete' ? '● Complete' : '⚠ Partial screening'}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--ink-muted)' }}>{completedAt}</span>
            </div>
          </div>
        </div>

        {/* ── Score ── */}
        {total_score !== null && (
          <div className="score-block" id="score-display" style={{ marginBottom: 'var(--s6)' }}>
            <span className="eyebrow" style={{ textAlign: 'center', display: 'block' }}>Total Score</span>
            <div className="score-number">{total_score}</div>
            <div className="score-max">out of {max_possible_score}</div>
            {score_interpretation_label && (
              <div className="score-label">{score_interpretation_label}</div>
            )}
          </div>
        )}

        {/* Interpretation */}
        {score_interpretation_description && (
          <div className="alert alert-info" style={{ marginBottom: 'var(--s4)' }}>
            {score_interpretation_description}
          </div>
        )}

        {/* Partial warning */}
        {completion_status === 'partial' && (
          <div className="alert alert-warning" style={{ marginBottom: 'var(--s4)' }}>
            <strong>Incomplete screening</strong>
            {missing_questions.length} question{missing_questions.length !== 1 ? 's' : ''} were not answered ({missing_questions.join(', ')}). Results may not be representative.
          </div>
        )}

        {/* ── Symptom checklist ── */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: 'var(--s6)', marginBottom: 'var(--s4)' }}
          id="symptom-checklist">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--s4)', flexWrap: 'wrap', gap: 'var(--s2)' }}>
            <span className="eyebrow" style={{ marginBottom: 0 }}>Symptom Checklist</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--ink)' }}>
              {reportedCount} <span style={{ fontSize: '0.875rem', color: 'var(--ink-muted)', fontFamily: 'var(--font-body)' }}>reported</span>
            </span>
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', marginBottom: 'var(--s4)', lineHeight: 1.6 }}>
            Based on your self-reported responses. Self-reported symptoms are not independently verified clinical findings.
          </p>

          {symptom_checklist.map(item => {
            const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.not_answered
            return (
              <div key={item.question_id} className="checklist-item">
                <div className={`checklist-dot ${cfg.dot}`} aria-hidden="true" />
                <div style={{ flex: 1 }}>
                  <div className="checklist-label">
                    {item.symptom_label}
                    {item.safety_flag && <span style={{ marginLeft: 6, fontSize: '0.7rem', color: 'var(--warning-text)' }}>⚠</span>}
                  </div>
                  <div className="checklist-sub">
                    {cfg.label}
                    {item.response_label && item.response_label !== 'Not answered' ? ` — ${item.response_label}` : ''}
                  </div>
                </div>
              </div>
            )
          })}

          {/* Legend */}
          <div style={{ marginTop: 'var(--s5)', paddingTop: 'var(--s4)', borderTop: '1px solid var(--border)', display: 'flex', gap: 'var(--s6)', flexWrap: 'wrap' }}>
            {[
              { dot: 'reported', label: 'Reported' },
              { dot: 'not_reported', label: 'Not reported' },
              { dot: 'not_answered', label: 'Not answered' },
            ].map(({ dot, label }) => (
              <div key={dot} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div className={`checklist-dot ${dot}`} />
                <span style={{ fontSize: '0.7rem', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Scoring method ── */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: 'var(--s6)', marginBottom: 'var(--s4)' }}>
          <span className="eyebrow">How Scores Are Calculated</span>
          <p style={{ fontSize: '0.875rem', color: 'var(--ink-muted)', lineHeight: 1.7 }}>{scoring_method}</p>
        </div>

        {/* ── Next steps ── */}
        <div style={{ background: 'var(--surface)', border: '2px solid var(--ink)', padding: 'var(--s6)', marginBottom: 'var(--s6)' }}
          id="next-steps">
          <span className="eyebrow">Suggested Next Steps</span>
          <ul className="steps-list">
            {suggested_next_steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ul>
        </div>

        {/* ── Disclaimer ── */}
        <div className="alert alert-warning" id="disclaimer" style={{ marginBottom: 'var(--s8)' }}>
          <strong>Important Disclaimer</strong>
          <span style={{ fontSize: '0.8125rem', lineHeight: 1.7 }}>{disclaimer}</span>
        </div>

        {/* ── Actions ── */}
        <div style={{ display: 'flex', gap: 'var(--s3)', flexWrap: 'wrap', borderTop: '1px solid var(--border)', paddingTop: 'var(--s6)' }}>
          <button id="results-home-btn" className="btn btn-ghost" onClick={onHome}>
            ← Home
          </button>
          <button id="results-restart-btn" className="btn btn-primary" onClick={onRestart}>
            Retake Screening
          </button>
        </div>

      </div>
    </div>
  )
}
