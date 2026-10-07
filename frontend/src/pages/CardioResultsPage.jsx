import '../App.css'

// ─── Signal level config ──────────────────────────────────────────────────────
const SIGNAL_CONFIG = {
  lower_signal: {
    label: 'Lower Signal',
    color: 'var(--accent-green)',
    bg: 'var(--accent-green-bg)',
    border: 'rgba(61,107,94,0.3)',
    desc: 'The experimental model returned a lower screening signal based on the data you entered.',
    icon: '●',
  },
  moderate_signal: {
    label: 'Moderate Signal',
    color: 'var(--accent-warm)',
    bg: '#FFF7ED',
    border: 'rgba(160,120,80,0.3)',
    desc: 'The experimental model returned a moderate screening signal. This is not a diagnosis.',
    icon: '◐',
  },
  elevated_signal: {
    label: 'Elevated Signal',
    color: '#B45309',
    bg: 'var(--warning-bg)',
    border: 'rgba(180,83,9,0.3)',
    desc: 'The experimental model returned an elevated screening signal. This is NOT a diagnosis — discuss with a clinician.',
    icon: '▲',
  },
}

// ─── Reusable section wrapper ─────────────────────────────────────────────────
function Section({ eyebrow, children, id, accent = false, doubleFrame = false }) {
  return (
    <div
      id={id}
      style={{
        background: 'var(--surface)',
        border: `${doubleFrame ? '2px' : '1px'} solid ${doubleFrame ? 'var(--ink)' : 'var(--border)'}`,
        padding: 'var(--s6)',
        marginBottom: 'var(--s4)',
      }}
    >
      {eyebrow && (
        <span className="eyebrow" style={{ color: accent ? 'var(--accent-green)' : undefined, marginBottom: 'var(--s4)' }}>
          {eyebrow}
        </span>
      )}
      {children}
    </div>
  )
}

// ─── Metric tile ───────────────────────────────────────────────────────────────
function MetricTile({ label, value, unit, category, categoryColor }) {
  return (
    <div style={{ background: 'var(--bg-alt)', padding: 'var(--s4)' }}>
      <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--ink)', lineHeight: 1 }}>
        {value}<span style={{ fontSize: '0.875rem', fontFamily: 'var(--font-body)', color: 'var(--ink-muted)', marginLeft: 4 }}>{unit}</span>
      </div>
      {category && (
        <div style={{ fontSize: '0.7rem', fontWeight: 700, marginTop: 4, color: categoryColor || 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {category}
        </div>
      )}
    </div>
  )
}

// ─── Factor dot row ────────────────────────────────────────────────────────────
function FactorRow({ factor, status, dataType }) {
  const reported = status === 'reported'
  return (
    <div className="checklist-item">
      <div
        className={`checklist-dot ${reported ? 'reported' : 'not_reported'}`}
        aria-hidden="true"
      />
      <div style={{ flex: 1 }}>
        <div className="checklist-label">{factor}</div>
        <div className="checklist-sub" style={{ display: 'flex', gap: 'var(--s2)', alignItems: 'center', flexWrap: 'wrap' }}>
          <span>{reported ? 'Reported' : 'Not reported'}</span>
          <span style={{ fontSize: '0.65rem', color: 'var(--ink-dim)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', border: '1px solid var(--border)', padding: '1px 6px' }}>
            {dataType === 'user_reported' ? 'Self-reported' : dataType === 'measured' ? 'Measured' : 'Derived'}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Feature importance bar ───────────────────────────────────────────────────
function FeatureBar({ label, importance, rank }) {
  const pct = Math.min(100, Math.round(importance * 100 / 0.3 * 100))
  return (
    <div style={{ marginBottom: 'var(--s3)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: '0.8125rem', color: 'var(--ink)', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: '0.7rem', color: 'var(--ink-muted)', fontFamily: 'monospace' }}>
          {(importance * 100).toFixed(1)}%
        </span>
      </div>
      <div style={{ height: 6, background: 'var(--border)', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: rank === 0 ? 'var(--ink)' : rank === 1 ? 'var(--ink-muted)' : 'var(--ink-dim)',
          transition: 'width 0.6s ease',
        }} />
      </div>
    </div>
  )
}

// ─── BP colour helper ─────────────────────────────────────────────────────────
function bpColor(category) {
  if (category === 'Normal') return 'var(--accent-green)'
  if (category === 'Elevated') return 'var(--accent-warm)'
  if (category?.includes('Stage 1')) return '#B45309'
  return 'var(--danger)'
}

function hrColor(category) {
  if (category?.includes('Normal')) return 'var(--accent-green)'
  return 'var(--accent-warm)'
}

// ─── Main results page ────────────────────────────────────────────────────────
export default function CardioResultsPage({ report, onRestart, onHome }) {
  if (!report) return null

  const {
    completed_at,
    safety_concern,
    safety_message,
    vitals,
    wearable_summary,
    reported_factors,
    reported_symptoms,
    model_output,
    model_available,
    suggested_next_steps,
    disclaimer,
  } = report

  const completedAt = new Date(completed_at).toLocaleString('en-IN', {
    dateStyle: 'medium', timeStyle: 'short',
  })

  const signal = model_output ? SIGNAL_CONFIG[model_output.label] : null

  return (
    <div className="page fade-up">
      <div className="container" style={{ paddingTop: 'var(--s8)', paddingBottom: 'var(--s16)' }}>

        {/* ── Safety alert — always first ── */}
        {safety_concern && (
          <div className="alert alert-danger" id="cardio-safety-alert" role="alert" aria-live="assertive"
            style={{ marginBottom: 'var(--s6)', borderLeft: '4px solid var(--danger)' }}>
            <strong>⚠ Some symptoms you reported require attention</strong>
            <div style={{ marginTop: 'var(--s3)', whiteSpace: 'pre-line', lineHeight: 1.75 }}>
              {safety_message}
            </div>
          </div>
        )}

        {/* ── Title block ── */}
        <div style={{ borderBottom: '2px solid var(--ink)', marginBottom: 'var(--s8)', paddingBottom: 'var(--s6)' }}>
          <span className="eyebrow">Screening Complete</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 'var(--s4)' }}>
            <h1 className="display-heading" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
              Cardiovascular<br />Insights
            </h1>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--s2)' }}>
              <span className="status-badge available">● Screening complete</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--ink-muted)' }}>{completedAt}</span>
            </div>
          </div>
        </div>

        {/* ── A. Model Output Signal ── */}
        {model_output && signal ? (
          <div
            id="cardio-signal-display"
            style={{
              background: signal.bg,
              border: `2px solid ${signal.color}`,
              padding: 'var(--s8)',
              textAlign: 'center',
              marginBottom: 'var(--s6)',
            }}
          >
            <span className="eyebrow" style={{ color: signal.color }}>Experimental Screening Signal</span>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 6vw, 4rem)',
              color: signal.color,
              lineHeight: 1,
              transform: 'scaleX(1.05)',
              transformOrigin: 'center',
              marginTop: 'var(--s3)',
              marginBottom: 'var(--s3)',
            }}>
              {signal.label}
            </div>
            <p style={{ fontSize: '0.9375rem', color: 'var(--ink-muted)', maxWidth: 500, margin: '0 auto var(--s4)' }}>
              {signal.desc}
            </p>
            <div style={{
              display: 'inline-block',
              background: 'rgba(255,255,255,0.6)',
              border: `1px solid ${signal.border}`,
              padding: 'var(--s3) var(--s5)',
              fontSize: '0.8rem',
              color: 'var(--ink-muted)',
            }}>
              Model-estimated probability (within training framework):{' '}
              <strong style={{ color: signal.color }}>{(model_output.model_probability * 100).toFixed(1)}%</strong>
              <br />
              <span style={{ fontSize: '0.7rem' }}>{model_output.probability_note}</span>
            </div>
          </div>
        ) : (
          !model_available && (
            <div className="alert alert-warning" style={{ marginBottom: 'var(--s6)' }}>
              <strong>ML model not available</strong>
              The cardiovascular screening model has not been trained yet. Run{' '}
              <code>python -m app.ml.train</code> from the backend directory to enable ML analysis.
            </div>
          )
        )}

        {/* ── B. Vitals ── */}
        <Section eyebrow="B — Vitals (Measured / Entered)" id="cardio-vitals">
          <p style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', marginBottom: 'var(--s5)', lineHeight: 1.55 }}>
            Values as entered by you. <span style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.65rem', border: '1px solid var(--border)', padding: '1px 6px' }}>Measured</span>
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 'var(--s3)' }}>
            <MetricTile
              label="Resting Heart Rate"
              value={vitals.resting_hr}
              unit="BPM"
              category={vitals.resting_hr_category}
              categoryColor={hrColor(vitals.resting_hr_category)}
            />
            <MetricTile
              label="Blood Pressure"
              value={`${vitals.sys_bp}/${vitals.dias_bp}`}
              unit="mmHg"
              category={vitals.bp_category}
              categoryColor={bpColor(vitals.bp_category)}
            />
            <MetricTile
              label="BMI"
              value={vitals.bmi}
              unit="kg/m²"
              category={vitals.bmi_category}
            />
          </div>
        </Section>

        {/* ── C. Reported Risk Factors ── */}
        <Section eyebrow="C — Reported Risk Factors" id="cardio-factors">
          <p style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', marginBottom: 'var(--s4)', lineHeight: 1.55 }}>
            Based on your self-reported answers. Self-reported data is not independently verified.
          </p>
          {reported_factors.map(f => (
            <FactorRow key={f.factor} {...f} />
          ))}

          {/* Legend */}
          <div style={{ marginTop: 'var(--s5)', paddingTop: 'var(--s4)', borderTop: '1px solid var(--border)', display: 'flex', gap: 'var(--s6)', flexWrap: 'wrap' }}>
            {[{ dot: 'reported', label: 'Reported' }, { dot: 'not_reported', label: 'Not reported' }].map(({ dot, label }) => (
              <div key={dot} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div className={`checklist-dot ${dot}`} />
                <span style={{ fontSize: '0.7rem', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>{label}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* ── D. Reported Symptoms ── */}
        {reported_symptoms.length > 0 && (
          <Section eyebrow="D — Reported Symptoms" id="cardio-symptoms">
            <p style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', marginBottom: 'var(--s4)', lineHeight: 1.55 }}>
              Symptoms you indicated during the assessment. These are self-reported — they are not clinical findings.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s2)' }}>
              {reported_symptoms.map(s => (
                <span key={s} style={{
                  display: 'inline-block',
                  border: '1.5px solid var(--accent-warm)',
                  color: 'var(--accent-warm)',
                  padding: '4px 12px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                }}>
                  {s}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* ── E. Wearable Summary ── */}
        {wearable_summary && (
          <Section eyebrow="E — Wearable Data Summary" id="cardio-wearable">
            <p style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', marginBottom: 'var(--s4)', lineHeight: 1.55 }}>
              {wearable_summary.source === 'demo'
                ? '🎭 Sample demo data — NOT real measurements. Shown for demonstration only.'
                : wearable_summary.source === 'csv'
                ? 'Aggregated from your uploaded CSV file. Derived data — not directly measured by this app.'
                : 'Manually entered wearable data.'}
              {' '}<span style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.65rem', border: '1px solid var(--border)', padding: '1px 6px' }}>Derived</span>
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 'var(--s3)' }}>
              {wearable_summary.avg_hr && <MetricTile label="Avg Heart Rate" value={wearable_summary.avg_hr.toFixed(0)} unit="BPM" />}
              {wearable_summary.min_hr && <MetricTile label="Min Heart Rate" value={wearable_summary.min_hr.toFixed(0)} unit="BPM" />}
              {wearable_summary.max_hr && <MetricTile label="Max Heart Rate" value={wearable_summary.max_hr.toFixed(0)} unit="BPM" />}
              {wearable_summary.avg_steps && <MetricTile label="Avg Daily Steps" value={Math.round(wearable_summary.avg_steps).toLocaleString()} unit="steps" />}
              {wearable_summary.avg_sleep_hours && <MetricTile label="Avg Sleep" value={wearable_summary.avg_sleep_hours.toFixed(1)} unit="h / night" />}
            </div>
          </Section>
        )}

        {/* ── F. Model Insight ── */}
        {model_output && model_output.feature_contributions.length > 0 && (
          <Section eyebrow="F — Model Insight" id="cardio-model-insight" doubleFrame>
            <p style={{ fontSize: '0.8125rem', color: 'var(--ink-muted)', marginBottom: 'var(--s5)', lineHeight: 1.7 }}>
              {model_output.model_description}
            </p>
            <span className="eyebrow" style={{ marginBottom: 'var(--s4)' }}>Features with the strongest influence on this model's prediction</span>
            <p style={{ fontSize: '0.75rem', color: 'var(--ink-dim)', marginBottom: 'var(--s4)', lineHeight: 1.55 }}>
              Feature importance indicates how much each variable influenced the model output — it does NOT mean these factors caused any disease.
            </p>
            {model_output.feature_contributions.map((c, i) => (
              <FeatureBar key={c.feature} label={c.label || c.feature} importance={c.importance} rank={i} />
            ))}
            <div className="alert alert-info" style={{ marginTop: 'var(--s5)' }}>
              {model_output.disclaimer}
            </div>
          </Section>
        )}

        {/* ── G. Next Steps ── */}
        <Section eyebrow="G — Suggested Next Steps" id="cardio-next-steps" doubleFrame>
          <ul className="steps-list">
            {suggested_next_steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ul>
        </Section>

        {/* ── Disclaimer ── */}
        <div className="alert alert-warning" id="cardio-disclaimer" style={{ marginBottom: 'var(--s8)' }}>
          <strong>Important Disclaimer</strong>
          <span style={{ fontSize: '0.8125rem', lineHeight: 1.7 }}>{disclaimer}</span>
        </div>

        {/* ── Actions ── */}
        <div style={{ display: 'flex', gap: 'var(--s3)', flexWrap: 'wrap', borderTop: '1px solid var(--border)', paddingTop: 'var(--s6)' }}>
          <button id="cardio-home-btn" className="btn btn-ghost" onClick={onHome}>
            ← Home
          </button>
          <button id="cardio-restart-btn" className="btn btn-primary" onClick={onRestart}>
            Retake Assessment
          </button>
        </div>

      </div>
    </div>
  )
}
