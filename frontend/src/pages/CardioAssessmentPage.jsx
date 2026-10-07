import { useState, useRef } from 'react'
import { cardioApi, DEMO_WEARABLE } from '../services/cardioApi'
import '../App.css'

// ─── Step definitions ─────────────────────────────────────────────────────────
const STEPS = [
  { id: 'welcome', label: 'Welcome', icon: '❤️' },
  { id: 'profile', label: 'Health Profile', icon: '👤' },
  { id: 'vitals', label: 'Vitals', icon: '📊' },
  { id: 'history', label: 'Heart Health', icon: '📋' },
  { id: 'symptoms', label: 'Symptoms', icon: '🩺' },
  { id: 'wearable', label: 'Wearable Data', icon: '⌚' },
  { id: 'analysis', label: 'Analysis', icon: '🔬' },
]

// ─── Default form state ───────────────────────────────────────────────────────
const INITIAL_FORM = {
  age: '',
  sex: '',
  height_cm: '',
  weight_kg: '',
  resting_hr: '',
  sys_bp: '',
  dias_bp: '',
  smoking_status: 'never',
  diabetes: false,
  known_hypertension: false,
  high_cholesterol: false,
  family_history_cvd: false,
  activity_level: 'moderate',
  symptom_chest_discomfort: false,
  symptom_shortness_of_breath: false,
  symptom_dizziness: false,
  symptom_palpitations: false,
  symptom_unusual_fatigue: false,
  symptom_fainting: false,
  wearable_avg_hr: null,
  wearable_min_hr: null,
  wearable_max_hr: null,
  wearable_avg_steps: null,
  wearable_avg_sleep_hours: null,
  wearable_source: null,
}

// ─── Eyebrow + display heading (matches existing site style) ──────────────────
function StepHeader({ eyebrow, title, subtitle }) {
  return (
    <div style={{ borderBottom: '2px solid var(--ink)', paddingBottom: 'var(--s8)', marginBottom: 'var(--s8)' }}>
      <span className="eyebrow">{eyebrow}</span>
      <h1 className="display-heading" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', marginBottom: subtitle ? 'var(--s3)' : 0 }}>
        {title}
      </h1>
      {subtitle && <p style={{ color: 'var(--ink-muted)', fontSize: '0.9375rem', lineHeight: 1.65, maxWidth: 560 }}>{subtitle}</p>}
    </div>
  )
}

// ─── Progress indicator ───────────────────────────────────────────────────────
function StepProgress({ currentIdx, total }) {
  const pct = ((currentIdx) / (total - 1)) * 100
  return (
    <div style={{ marginBottom: 'var(--s6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--s2)' }}>
        <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>
          Step {currentIdx + 1} of {total}
        </span>
        <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>
          {STEPS[currentIdx]?.label}
        </span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

// ─── Metric card for vitals (special treatment) ───────────────────────────────
function MetricCard({ id, label, hint, children, error }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: `1.5px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
      padding: 'var(--s6)',
      transition: 'border-color var(--t-fast)',
    }}>
      <span className="eyebrow" style={{ color: error ? 'var(--danger)' : undefined, marginBottom: 'var(--s2)' }}>
        {label}
      </span>
      {children}
      {hint && !error && (
        <p style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', marginTop: 'var(--s2)', lineHeight: 1.55 }}>{hint}</p>
      )}
      {error && (
        <p style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: 'var(--s2)', fontWeight: 600 }}>{error}</p>
      )}
    </div>
  )
}

// ─── Numeric vitals input ──────────────────────────────────────────────────────
function VitalInput({ id, value, onChange, unit, min, max, width = 100 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--s2)', marginTop: 'var(--s3)' }}>
      <input
        id={id}
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
        min={min}
        max={max}
        style={{
          width,
          fontFamily: 'var(--font-display)',
          fontSize: '2.5rem',
          lineHeight: 1,
          border: 'none',
          borderBottom: '2px solid var(--ink)',
          background: 'transparent',
          color: 'var(--ink)',
          padding: '4px 0',
          textAlign: 'center',
          outline: 'none',
          MozAppearance: 'textfield',
        }}
        aria-label={unit}
      />
      <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--ink-muted)', letterSpacing: '0.06em' }}>{unit}</span>
    </div>
  )
}

// ─── Toggle button (yes/no binary) ───────────────────────────────────────────
function Toggle({ id, value, onChange, labelYes = 'Yes', labelNo = 'No' }) {
  return (
    <div style={{ display: 'flex', gap: 'var(--s2)', marginTop: 'var(--s2)' }}>
      {[false, true].map(opt => (
        <button
          key={String(opt)}
          id={`${id}-${opt}`}
          type="button"
          onClick={() => onChange(opt)}
          style={{
            padding: '8px 20px',
            fontFamily: 'var(--font-body)',
            fontSize: '0.8125rem',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            border: '1.5px solid',
            borderColor: value === opt ? 'var(--ink)' : 'var(--border)',
            background: value === opt ? 'var(--ink)' : 'transparent',
            color: value === opt ? 'var(--bg)' : 'var(--ink-muted)',
            transition: 'all var(--t-fast)',
          }}
        >
          {opt ? labelYes : labelNo}
        </button>
      ))}
    </div>
  )
}

// ─── Segmented selector ───────────────────────────────────────────────────────
function SegmentedSelect({ id, value, onChange, options }) {
  return (
    <div style={{ display: 'flex', gap: 'var(--s1)', flexWrap: 'wrap', marginTop: 'var(--s2)' }}>
      {options.map(opt => (
        <button
          key={opt.value}
          id={`${id}-${opt.value}`}
          type="button"
          onClick={() => onChange(opt.value)}
          style={{
            padding: '8px 16px',
            fontFamily: 'var(--font-body)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer',
            border: '1.5px solid',
            borderColor: value === opt.value ? 'var(--ink)' : 'var(--border)',
            background: value === opt.value ? 'var(--ink)' : 'transparent',
            color: value === opt.value ? 'var(--bg)' : 'var(--ink-muted)',
            transition: 'all var(--t-fast)',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// ─── Checkbox row ─────────────────────────────────────────────────────────────
function CheckRow({ id, checked, onChange, label, sub }) {
  return (
    <label
      htmlFor={id}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--s3)',
        padding: 'var(--s4)',
        background: checked ? 'rgba(10,10,10,0.04)' : 'var(--surface)',
        border: `1.5px solid ${checked ? 'var(--ink)' : 'var(--border)'}`,
        cursor: 'pointer',
        transition: 'all var(--t-fast)',
        userSelect: 'none',
      }}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        style={{ marginTop: 2, accentColor: 'var(--ink)', width: 16, height: 16, flexShrink: 0 }}
      />
      <div>
        <div style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--ink)', lineHeight: 1.4 }}>{label}</div>
        {sub && <div style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', marginTop: 2, lineHeight: 1.5 }}>{sub}</div>}
      </div>
    </label>
  )
}

// ─── Urgent symptoms warning card ─────────────────────────────────────────────
function UrgentWarning() {
  return (
    <div className="alert alert-danger" role="alert" style={{ marginBottom: 'var(--s5)' }}>
      <strong>⚠ Before you continue</strong>
      If you are currently experiencing severe chest pain, difficulty breathing, or feel faint — <strong>stop now</strong> and seek emergency care. Do not continue this screening.
      <br /><br />
      <strong>Emergency:</strong>&nbsp; India: 112 &nbsp;|&nbsp; US: 911 &nbsp;|&nbsp; UK: 999 &nbsp;|&nbsp; Australia: 000
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// STEP COMPONENTS
// ═════════════════════════════════════════════════════════════════════════════

// Step 0: Welcome / Landing
function StepWelcome({ onNext }) {
  return (
    <div className="fade-up">
      <StepHeader
        eyebrow="Cardiovascular Health"
        title={<>Let's understand<br />your heart health.</>}
        subtitle="Review your cardiovascular indicators, lifestyle factors, and available wearable data in one guided assessment."
      />

      {/* What we'll assess */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 1,
        background: 'var(--border)',
        marginBottom: 'var(--s8)',
      }}>
        {[
          { icon: '💓', label: 'Heart Rate' },
          { icon: '🩺', label: 'Blood Pressure' },
          { icon: '🏃', label: 'Lifestyle' },
          { icon: '📋', label: 'Health History' },
          { icon: '⌚', label: 'Wearable Data' },
        ].map(({ icon, label }) => (
          <div key={label} style={{
            background: 'var(--surface)',
            padding: 'var(--s6) var(--s4)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--s2)',
            textAlign: 'center',
          }}>
            <span style={{ fontSize: '1.5rem' }}>{icon}</span>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* What this is / is not */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s4)', marginBottom: 'var(--s6)' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: 'var(--s5)' }}>
          <span className="eyebrow" style={{ color: 'var(--accent-green)' }}>This IS</span>
          <ul className="consent-list">
            {[
              'A guided cardiovascular health assessment',
              'An experimental ML-powered screening signal',
              'A structured report with next steps',
              'Private — nothing is stored after your session',
            ].map((t, i) => (
              <li key={i}>
                <span style={{ color: 'var(--accent-green)', fontWeight: 700, flexShrink: 0 }}>✓</span>
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: 'var(--s5)' }}>
          <span className="eyebrow" style={{ color: 'var(--danger)' }}>This is NOT</span>
          <ul className="consent-list">
            {[
              'A clinical diagnostic tool',
              'A replacement for a doctors evaluation',
              'An emergency triage service',
              'A validated medical instrument',
            ].map((t, i) => (
              <li key={i}>
                <span style={{ color: 'var(--danger)', fontWeight: 700, flexShrink: 0 }}>✗</span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <UrgentWarning />

      {/* CTA */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--s6)', display: 'flex', alignItems: 'center', gap: 'var(--s4)', flexWrap: 'wrap' }}>
        <button id="cardio-start-btn" className="btn btn-primary btn-lg" onClick={onNext}>
          Start Screening →
        </button>
        <span className="status-badge planned">⏱ Estimated time: 3–5 minutes</span>
      </div>
    </div>
  )
}

// Step 1: Health Profile
function StepProfile({ form, setForm, errors, onNext, onBack }) {
  return (
    <div className="fade-up">
      <StepHeader
        eyebrow="Step 1 of 5 — Health Profile"
        title="Basic Profile"
        subtitle="We use this to contextualise your vitals and run the screening model."
      />

      <div style={{ display: 'grid', gap: 'var(--s4)' }}>

        {/* Age */}
        <MetricCard id="age" label="Age" hint="Your age in years." error={errors.age}>
          <VitalInput id="age" value={form.age} onChange={v => setForm(f => ({ ...f, age: v }))} unit="years" min={18} max={100} width={90} />
        </MetricCard>

        {/* Sex */}
        <MetricCard id="sex" label="Biological Sex" hint="Used by the screening model. Select 'Prefer not to say' to omit." error={errors.sex}>
          <SegmentedSelect
            id="sex"
            value={form.sex}
            onChange={v => setForm(f => ({ ...f, sex: v }))}
            options={[
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
              { value: 'prefer_not_to_say', label: 'Prefer not to say' },
            ]}
          />
        </MetricCard>

        {/* Height + Weight */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s4)' }}>
          <MetricCard id="height" label="Height" hint="In centimetres (e.g. 170)." error={errors.height_cm}>
            <VitalInput id="height_cm" value={form.height_cm} onChange={v => setForm(f => ({ ...f, height_cm: v }))} unit="cm" min={100} max={250} width={90} />
          </MetricCard>
          <MetricCard id="weight" label="Weight" hint="In kilograms (e.g. 70)." error={errors.weight_kg}>
            <VitalInput id="weight_kg" value={form.weight_kg} onChange={v => setForm(f => ({ ...f, weight_kg: v }))} unit="kg" min={30} max={300} width={90} />
          </MetricCard>
        </div>

      </div>

      <NavButtons onBack={onBack} onNext={onNext} />
    </div>
  )
}

// Step 2: Vitals
function StepVitals({ form, setForm, errors, onNext, onBack }) {
  return (
    <div className="fade-up">
      <StepHeader
        eyebrow="Step 2 of 5 — Vitals"
        title="Heart Rate &amp; Blood Pressure"
        subtitle="Enter your most recent readings. Take a moment to sit calmly before measuring."
      />

      <div style={{ display: 'grid', gap: 'var(--s4)' }}>

        {/* Heart rate */}
        <MetricCard
          id="resting_hr"
          label="Resting Heart Rate"
          hint="Measured while resting, ideally after sitting calmly for 5 minutes. Normal range: 60–100 BPM."
          error={errors.resting_hr}
        >
          <VitalInput id="resting_hr" value={form.resting_hr} onChange={v => setForm(f => ({ ...f, resting_hr: v }))} unit="BPM" min={30} max={220} width={100} />
        </MetricCard>

        {/* Blood pressure */}
        <MetricCard
          id="bp"
          label="Blood Pressure"
          hint="Systolic (upper number) over diastolic (lower number). Example: 120 / 80 mmHg."
          error={errors.bp}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--s3)', marginTop: 'var(--s3)', flexWrap: 'wrap' }}>
            <VitalInput id="sys_bp" value={form.sys_bp} onChange={v => setForm(f => ({ ...f, sys_bp: v }))} unit="systolic" min={70} max={250} width={100} />
            <span style={{ fontSize: '2rem', color: 'var(--ink-dim)', fontFamily: 'var(--font-display)' }}>/</span>
            <VitalInput id="dias_bp" value={form.dias_bp} onChange={v => setForm(f => ({ ...f, dias_bp: v }))} unit="diastolic" min={40} max={150} width={100} />
            <span style={{ fontSize: '0.875rem', color: 'var(--ink-muted)', fontWeight: 700 }}>mmHg</span>
          </div>
        </MetricCard>

        {/* BP reference */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: 'var(--s5)' }}>
          <span className="eyebrow" style={{ marginBottom: 'var(--s3)' }}>Blood Pressure Reference</span>
          <div style={{ display: 'grid', gap: 'var(--s1)' }}>
            {[
              { range: '< 120 / < 80', label: 'Normal', color: 'var(--accent-green)' },
              { range: '120–129 / < 80', label: 'Elevated', color: 'var(--accent-warm)' },
              { range: '130–139 / 80–89', label: 'High — Stage 1', color: '#B45309' },
              { range: '≥ 140 / ≥ 90', label: 'High — Stage 2', color: 'var(--danger)' },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '4px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--ink-muted)', fontFamily: 'monospace' }}>{row.range}</span>
                <span style={{ fontWeight: 700, color: row.color }}>{row.label}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--ink-dim)', marginTop: 'var(--s3)', lineHeight: 1.5 }}>
            Reference ranges are for context only. This tool cannot diagnose hypertension.
          </p>
        </div>

      </div>

      <NavButtons onBack={onBack} onNext={onNext} />
    </div>
  )
}

// Step 3: History & Lifestyle
function StepHistory({ form, setForm, errors, onNext, onBack }) {
  return (
    <div className="fade-up">
      <StepHeader
        eyebrow="Step 3 of 5 — Heart Health"
        title="Lifestyle &amp; History"
        subtitle="These factors inform the screening model. All answers are self-reported and remain in your session only."
      />

      <div style={{ display: 'grid', gap: 'var(--s4)' }}>

        {/* Smoking */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: 'var(--s5)' }}>
          <span className="eyebrow">Smoking / Nicotine use</span>
          <p style={{ fontSize: '0.875rem', color: 'var(--ink-muted)', marginBottom: 'var(--s3)' }}>Do you currently smoke or use nicotine products?</p>
          <SegmentedSelect
            id="smoking"
            value={form.smoking_status}
            onChange={v => setForm(f => ({ ...f, smoking_status: v }))}
            options={[
              { value: 'never', label: 'Never' },
              { value: 'former', label: 'Former smoker' },
              { value: 'current', label: 'Current smoker' },
            ]}
          />
        </div>

        {/* Activity */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: 'var(--s5)' }}>
          <span className="eyebrow">Physical Activity Level</span>
          <p style={{ fontSize: '0.875rem', color: 'var(--ink-muted)', marginBottom: 'var(--s3)' }}>How often do you engage in moderate or vigorous physical activity?</p>
          <SegmentedSelect
            id="activity"
            value={form.activity_level}
            onChange={v => setForm(f => ({ ...f, activity_level: v }))}
            options={[
              { value: 'sedentary', label: 'Sedentary' },
              { value: 'low', label: 'Low' },
              { value: 'moderate', label: 'Moderate' },
              { value: 'active', label: 'Active' },
            ]}
          />
          <p style={{ fontSize: '0.7rem', color: 'var(--ink-dim)', marginTop: 'var(--s3)' }}>
            Moderate = brisk walking, cycling. Active = ≥ 150 min/week of moderate activity.
          </p>
        </div>

        {/* Medical history */}
        <div>
          <span className="eyebrow">Medical History</span>
          <p style={{ fontSize: '0.875rem', color: 'var(--ink-muted)', marginBottom: 'var(--s3)' }}>
            Have you ever been told by a healthcare professional that you have any of the following?
          </p>
          <div style={{ display: 'grid', gap: 'var(--s2)' }}>
            <CheckRow id="diabetes" checked={form.diabetes} onChange={v => setForm(f => ({ ...f, diabetes: v }))}
              label="Diabetes" sub="Type 1 or Type 2, or told you have high blood sugar" />
            <CheckRow id="known_hypertension" checked={form.known_hypertension} onChange={v => setForm(f => ({ ...f, known_hypertension: v }))}
              label="High blood pressure (hypertension)" sub="Told by a doctor or currently on medication for it" />
            <CheckRow id="high_cholesterol" checked={form.high_cholesterol} onChange={v => setForm(f => ({ ...f, high_cholesterol: v }))}
              label="High cholesterol" sub="Elevated LDL or total cholesterol" />
            <CheckRow id="family_history_cvd" checked={form.family_history_cvd} onChange={v => setForm(f => ({ ...f, family_history_cvd: v }))}
              label="Family history of cardiovascular disease" sub="Parent or sibling had a heart attack or stroke before age 65" />
          </div>
        </div>

      </div>

      <NavButtons onBack={onBack} onNext={onNext} />
    </div>
  )
}

// Step 4: Symptoms
function StepSymptoms({ form, setForm, onNext, onBack }) {
  const urgent = form.symptom_chest_discomfort || form.symptom_fainting || form.symptom_shortness_of_breath

  return (
    <div className="fade-up">
      <StepHeader
        eyebrow="Step 4 of 5 — Symptoms"
        title="Cardiovascular Symptoms"
        subtitle="Tick any symptoms you have noticed recently. Be honest — this is for your awareness, not judgment."
      />

      {urgent && <UrgentWarning />}

      <div style={{ display: 'grid', gap: 'var(--s2)', marginBottom: 'var(--s6)' }}>
        <CheckRow id="sym_chest" checked={form.symptom_chest_discomfort} onChange={v => setForm(f => ({ ...f, symptom_chest_discomfort: v }))}
          label="⚠ Chest discomfort, pressure, or pain" sub="Including tightness, heaviness, or burning in the chest" />
        <CheckRow id="sym_breath" checked={form.symptom_shortness_of_breath} onChange={v => setForm(f => ({ ...f, symptom_shortness_of_breath: v }))}
          label="⚠ Shortness of breath" sub="At rest or with mild activity" />
        <CheckRow id="sym_faint" checked={form.symptom_fainting} onChange={v => setForm(f => ({ ...f, symptom_fainting: v }))}
          label="⚠ Fainting or near-fainting (syncope)" sub="Sudden loss of consciousness or feeling like you might black out" />
        <CheckRow id="sym_dizzy" checked={form.symptom_dizziness} onChange={v => setForm(f => ({ ...f, symptom_dizziness: v }))}
          label="Dizziness or lightheadedness" sub="Feeling unsteady or the world spinning" />
        <CheckRow id="sym_palp" checked={form.symptom_palpitations} onChange={v => setForm(f => ({ ...f, symptom_palpitations: v }))}
          label="Palpitations" sub="Heart racing, fluttering, or pounding sensation" />
        <CheckRow id="sym_fatigue" checked={form.symptom_unusual_fatigue} onChange={v => setForm(f => ({ ...f, symptom_unusual_fatigue: v }))}
          label="Unusual fatigue" sub="Feeling excessively tired without clear cause" />
      </div>

      <div className="alert alert-info" style={{ marginBottom: 'var(--s4)' }}>
        Symptoms marked ⚠ can require prompt medical attention. If any are sudden, severe, or worsening — please seek urgent care before continuing.
      </div>

      <NavButtons onBack={onBack} onNext={onNext} nextLabel="Continue →" />
    </div>
  )
}

// Step 5: Wearable Data
function StepWearable({ form, setForm, onNext, onBack }) {
  const [uploadState, setUploadState] = useState('idle') // idle | loading | done | error
  const [uploadMsg, setUploadMsg] = useState('')
  const fileRef = useRef()

  const applyDemo = () => {
    setForm(f => ({
      ...f,
      ...Object.fromEntries(
        Object.entries(DEMO_WEARABLE).map(([k, v]) => [`wearable_${k}`, v])
      ),
    }))
  }

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadState('loading')
    setUploadMsg('')
    try {
      const result = await cardioApi.uploadWearable(file)
      setForm(f => ({
        ...f,
        wearable_avg_hr: result.avg_hr,
        wearable_min_hr: result.min_hr,
        wearable_max_hr: result.max_hr,
        wearable_avg_steps: result.avg_steps,
        wearable_avg_sleep_hours: result.avg_sleep_hours,
        wearable_source: 'csv',
      }))
      setUploadState('done')
      setUploadMsg(`Parsed ${result.rows_parsed} rows${result.warnings.length ? ` — ${result.warnings.join('; ')}` : ''}`)
    } catch (err) {
      setUploadState('error')
      setUploadMsg(err.message)
    }
  }

  const haswearable = form.wearable_source !== null

  return (
    <div className="fade-up">
      <StepHeader
        eyebrow="Step 5 of 5 — Wearable Data (Optional)"
        title="Wearable Data"
        subtitle="Optionally add heart rate and activity data from a wearable device. This step is entirely optional — skip it to proceed."
      />

      {/* Wearable source options */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--s3)', marginBottom: 'var(--s6)' }}>

        {/* Demo data */}
        <button
          id="wearable-demo-btn"
          type="button"
          className={`btn ${form.wearable_source === 'demo' ? 'btn-primary' : 'btn-outline'}`}
          style={{ justifyContent: 'center', padding: 'var(--s5)' }}
          onClick={() => { applyDemo(); setForm(f => ({ ...f, wearable_source: 'demo' })) }}
        >
          <span style={{ fontSize: '1.25rem' }}>🎭</span>
          Use Demo Data
        </button>

        {/* CSV Upload */}
        <button
          id="wearable-csv-btn"
          type="button"
          className={`btn ${form.wearable_source === 'csv' ? 'btn-primary' : 'btn-outline'}`}
          style={{ justifyContent: 'center', padding: 'var(--s5)' }}
          onClick={() => fileRef.current?.click()}
        >
          <span style={{ fontSize: '1.25rem' }}>📂</span>
          Upload CSV
        </button>
        <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFile} />

        {/* Manual */}
        <button
          id="wearable-manual-btn"
          type="button"
          className={`btn ${form.wearable_source === 'manual' ? 'btn-primary' : 'btn-outline'}`}
          style={{ justifyContent: 'center', padding: 'var(--s5)' }}
          onClick={() => setForm(f => ({ ...f, wearable_source: 'manual', wearable_avg_hr: '', wearable_min_hr: '', wearable_max_hr: '', wearable_avg_steps: '', wearable_avg_sleep_hours: '' }))}
        >
          <span style={{ fontSize: '1.25rem' }}>✏️</span>
          Enter Manually
        </button>
      </div>

      {/* Upload feedback */}
      {uploadState === 'loading' && <div style={{ marginBottom: 'var(--s4)', display: 'flex', gap: 12, alignItems: 'center' }}><div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /><span style={{ fontSize: '0.875rem', color: 'var(--ink-muted)' }}>Parsing CSV…</span></div>}
      {uploadState === 'done' && <div className="alert alert-success" style={{ marginBottom: 'var(--s4)' }}><strong>CSV parsed</strong>{uploadMsg}</div>}
      {uploadState === 'error' && <div className="alert alert-danger" style={{ marginBottom: 'var(--s4)' }}><strong>Upload failed</strong>{uploadMsg}</div>}

      {/* Demo label */}
      {form.wearable_source === 'demo' && (
        <div className="alert alert-warning" style={{ marginBottom: 'var(--s4)' }}>
          <strong>⚠ Sample / Demo Data</strong>
          The values below are simulated demo data and do NOT represent real measurements. They are provided to demonstrate the screening flow.
        </div>
      )}

      {/* Wearable summary display */}
      {haswearable && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: 'var(--s6)', marginBottom: 'var(--s4)' }}>
          <span className="eyebrow">Wearable Data Summary</span>
          <p style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', marginBottom: 'var(--s4)' }}>
            {form.wearable_source === 'derived' ? 'Derived from wearable data' : form.wearable_source === 'demo' ? '🎭 Sample demo data — not real measurements' : form.wearable_source === 'csv' ? 'Aggregated from uploaded CSV' : 'Manually entered'}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 'var(--s4)' }}>
            {[
              { key: 'wearable_avg_hr', label: 'Avg Heart Rate', unit: 'BPM', id: 'wav_avg_hr' },
              { key: 'wearable_min_hr', label: 'Min Heart Rate', unit: 'BPM', id: 'wav_min_hr' },
              { key: 'wearable_max_hr', label: 'Max Heart Rate', unit: 'BPM', id: 'wav_max_hr' },
              { key: 'wearable_avg_steps', label: 'Avg Daily Steps', unit: 'steps', id: 'wav_steps' },
              { key: 'wearable_avg_sleep_hours', label: 'Avg Sleep', unit: 'h/night', id: 'wav_sleep' },
            ].map(({ key, label, unit, id }) => (
              <div key={key} style={{ background: 'var(--bg-alt)', padding: 'var(--s4)' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 4 }}>{label}</div>
                {form.wearable_source === 'manual' ? (
                  <input
                    id={id}
                    type="number"
                    value={form[key] ?? ''}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value === '' ? null : parseFloat(e.target.value) }))}
                    style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', border: 'none', borderBottom: '2px solid var(--ink)', background: 'transparent', color: 'var(--ink)', outline: 'none', width: '100%' }}
                  />
                ) : (
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', color: 'var(--ink)', lineHeight: 1 }}>
                    {form[key] != null ? Number(form[key]).toFixed(key.includes('hr') ? 0 : 1) : '—'}
                  </div>
                )}
                <div style={{ fontSize: '0.7rem', color: 'var(--ink-muted)', marginTop: 2 }}>{unit}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 'var(--s4)', paddingTop: 'var(--s4)', borderTop: '1px solid var(--border)' }}>
            <button
              type="button"
              className="btn btn-ghost"
              style={{ fontSize: '0.75rem', padding: '6px 14px' }}
              onClick={() => setForm(f => ({ ...f, wearable_avg_hr: null, wearable_min_hr: null, wearable_max_hr: null, wearable_avg_steps: null, wearable_avg_sleep_hours: null, wearable_source: null }))}
            >
              Clear wearable data
            </button>
          </div>
        </div>
      )}

      {/* CSV format hint */}
      {form.wearable_source !== 'demo' && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: 'var(--s5)', marginBottom: 'var(--s4)' }}>
          <span className="eyebrow">CSV Format</span>
          <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', marginBottom: 'var(--s3)' }}>Expected columns (any subset is valid):</p>
          <pre style={{ fontFamily: 'monospace', fontSize: '0.75rem', background: 'var(--bg-alt)', padding: 'var(--s3)', overflowX: 'auto', color: 'var(--ink)' }}>
            {`timestamp,heart_rate,steps,sleep_hours\n2024-01-01 08:00,68,0,7.2\n2024-01-02 08:00,72,8543,6.9`}
          </pre>
        </div>
      )}

      <NavButtons
        onBack={onBack}
        onNext={onNext}
        nextLabel="Run Analysis →"
        nextId="cardio-run-analysis-btn"
      />
    </div>
  )
}

// ─── Shared nav buttons ────────────────────────────────────────────────────────
function NavButtons({ onBack, onNext, nextLabel = 'Next →', backLabel = '← Back', nextId = 'cardio-next-btn' }) {
  return (
    <div style={{ display: 'flex', gap: 'var(--s3)', marginTop: 'var(--s8)', borderTop: '1px solid var(--border)', paddingTop: 'var(--s6)' }}>
      {onBack && (
        <button className="btn btn-ghost" onClick={onBack}>{backLabel}</button>
      )}
      <button id={nextId} className="btn btn-primary btn-lg" style={{ marginLeft: 'auto' }} onClick={onNext}>
        {nextLabel}
      </button>
    </div>
  )
}

// ─── Analysis / submitting state ───────────────────────────────────────────────
function StepAnalysis() {
  return (
    <div className="fade-up" style={{ textAlign: 'center', padding: 'var(--s16) 0' }}>
      <div className="spinner" style={{ width: 56, height: 56, borderWidth: 4 }} />
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginTop: 'var(--s8)', color: 'var(--ink)' }}>
        Analysing your data…
      </h2>
      <p style={{ color: 'var(--ink-muted)', marginTop: 'var(--s3)', fontSize: '0.9375rem' }}>
        Running the cardiovascular screening model. This takes a moment.
      </p>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN PAGE CONTROLLER
// ═════════════════════════════════════════════════════════════════════════════

export default function CardioAssessmentPage({ onComplete, onBack }) {
  const [stepIdx, setStepIdx] = useState(0)
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const totalSteps = STEPS.length

  // ── Scroll to top on step change ─────────────────────────────────────────
  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  // ── Validation per step ───────────────────────────────────────────────────
  const validate = (idx) => {
    const errs = {}
    if (idx === 1) {
      if (!form.age || isNaN(form.age) || +form.age < 18 || +form.age > 100) errs.age = 'Enter age between 18 and 100.'
      if (!form.sex) errs.sex = 'Please select a biological sex.'
      if (!form.height_cm || isNaN(form.height_cm) || +form.height_cm < 100 || +form.height_cm > 250) errs.height_cm = 'Enter height between 100 and 250 cm.'
      if (!form.weight_kg || isNaN(form.weight_kg) || +form.weight_kg < 30 || +form.weight_kg > 300) errs.weight_kg = 'Enter weight between 30 and 300 kg.'
    }
    if (idx === 2) {
      if (!form.resting_hr || isNaN(form.resting_hr) || +form.resting_hr < 30 || +form.resting_hr > 220) errs.resting_hr = 'Enter resting heart rate between 30 and 220 BPM.'
      if (!form.sys_bp || isNaN(form.sys_bp) || +form.sys_bp < 70 || +form.sys_bp > 250) errs.bp = 'Enter a valid systolic BP (70–250 mmHg).'
      if (!form.dias_bp || isNaN(form.dias_bp) || +form.dias_bp < 40 || +form.dias_bp > 150) errs.bp = 'Enter a valid diastolic BP (40–150 mmHg).'
      if (!errs.bp && +form.dias_bp >= +form.sys_bp) errs.bp = 'Diastolic must be lower than systolic.'
    }
    return errs
  }

  const goNext = () => {
    const errs = validate(stepIdx)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    if (stepIdx < totalSteps - 2) {
      setStepIdx(i => i + 1)
      scrollTop()
    } else {
      handleSubmit()
    }
  }

  const goBack = () => {
    if (stepIdx === 0) { onBack(); return }
    setStepIdx(i => i - 1)
    setErrors({})
    scrollTop()
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setSubmitError(null)
    setStepIdx(totalSteps - 1) // show analysis step

    const payload = {
      age: parseInt(form.age),
      sex: form.sex,
      height_cm: parseFloat(form.height_cm),
      weight_kg: parseFloat(form.weight_kg),
      resting_hr: parseInt(form.resting_hr),
      sys_bp: parseInt(form.sys_bp),
      dias_bp: parseInt(form.dias_bp),
      smoking_status: form.smoking_status,
      diabetes: form.diabetes,
      known_hypertension: form.known_hypertension,
      high_cholesterol: form.high_cholesterol,
      family_history_cvd: form.family_history_cvd,
      activity_level: form.activity_level,
      symptom_chest_discomfort: form.symptom_chest_discomfort,
      symptom_shortness_of_breath: form.symptom_shortness_of_breath,
      symptom_dizziness: form.symptom_dizziness,
      symptom_palpitations: form.symptom_palpitations,
      symptom_unusual_fatigue: form.symptom_unusual_fatigue,
      symptom_fainting: form.symptom_fainting,
      wearable_avg_hr: form.wearable_avg_hr != null ? parseFloat(form.wearable_avg_hr) : null,
      wearable_min_hr: form.wearable_min_hr != null ? parseFloat(form.wearable_min_hr) : null,
      wearable_max_hr: form.wearable_max_hr != null ? parseFloat(form.wearable_max_hr) : null,
      wearable_avg_steps: form.wearable_avg_steps != null ? parseFloat(form.wearable_avg_steps) : null,
      wearable_avg_sleep_hours: form.wearable_avg_sleep_hours != null ? parseFloat(form.wearable_avg_sleep_hours) : null,
      wearable_source: form.wearable_source,
      consented: true,
    }

    try {
      const report = await cardioApi.screen(payload)
      onComplete(report)
    } catch (err) {
      setSubmitError(err.message)
      setSubmitting(false)
      setStepIdx(5) // back to wearable step on error
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  const renderStep = () => {
    if (submitting && stepIdx === totalSteps - 1) return <StepAnalysis />

    switch (stepIdx) {
      case 0: return <StepWelcome onNext={goNext} />
      case 1: return <StepProfile form={form} setForm={setForm} errors={errors} onNext={goNext} onBack={goBack} />
      case 2: return <StepVitals form={form} setForm={setForm} errors={errors} onNext={goNext} onBack={goBack} />
      case 3: return <StepHistory form={form} setForm={setForm} errors={errors} onNext={goNext} onBack={goBack} />
      case 4: return <StepSymptoms form={form} setForm={setForm} onNext={goNext} onBack={goBack} />
      case 5: return <StepWearable form={form} setForm={setForm} onNext={goNext} onBack={goBack} />
      case 6: return <StepAnalysis />
      default: return null
    }
  }

  return (
    <div className="page fade-up">
      <div className="container" style={{ paddingTop: 'var(--s8)', paddingBottom: 'var(--s16)' }}>

        {/* Back link (only on step 0) */}
        {stepIdx === 0 && (
          <button id="cardio-back-home-btn" className="btn btn-ghost" onClick={onBack} style={{ marginBottom: 'var(--s6)' }}>
            ← Back to Home
          </button>
        )}

        {/* Progress (steps 1–5, not on welcome or analysis) */}
        {stepIdx > 0 && stepIdx < totalSteps - 1 && (
          <StepProgress currentIdx={stepIdx - 1} total={totalSteps - 2} />
        )}

        {/* Step content */}
        {renderStep()}

        {/* Submission error */}
        {submitError && (
          <div className="alert alert-danger mt-4">
            <strong>Submission failed</strong>{submitError} — check that the backend is running.
          </div>
        )}

      </div>
    </div>
  )
}
