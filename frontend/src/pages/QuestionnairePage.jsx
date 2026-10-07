import { useState, useEffect } from 'react'
import { api } from '../services/api'
import '../App.css'

export default function QuestionnairePage({ onComplete, onBack }) {
  const [info, setInfo] = useState(null)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [validationErrors, setValidationErrors] = useState([])

  useEffect(() => {
    api.getMentalHealthInfo()
      .then(data => { setInfo(data); setLoading(false) })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [])

  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: parseInt(value) }))
    setValidationErrors(prev => prev.filter(id => id !== questionId))
  }

  const handleSubmit = async () => {
    if (!info) return
    const missing = info.questions.filter(q => q.required && !(q.id in answers))
    if (missing.length > 0) {
      setValidationErrors(missing.map(q => q.id))
      document.getElementById(`q-${missing[0].id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const report = await api.submitQuestionnaire(answers, true)
      onComplete(report)
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  const answeredCount = info ? info.questions.filter(q => q.id in answers).length : 0
  const total = info?.questions.length || 0
  const progress = total ? (answeredCount / total) * 100 : 0

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" />
          <p style={{ marginTop: 'var(--s4)', color: 'var(--ink-muted)', fontSize: '0.875rem' }}>Loading questionnaire…</p>
        </div>
      </div>
    )
  }

  if (error && !info) {
    return (
      <div className="page">
        <div className="container" style={{ paddingTop: 'var(--s10)' }}>
          <div className="alert alert-danger">
            <strong>Failed to load</strong>{error} — make sure the backend is running on port 8000.
          </div>
          <button className="btn btn-ghost mt-4" onClick={onBack}>← Go back</button>
        </div>
      </div>
    )
  }

  const opts = info?.response_options || {}
  const sortedOpts = Object.entries(opts).sort(([a], [b]) => Number(a) - Number(b))

  return (
    <div className="page fade-up">
      <div className="container" style={{ paddingTop: 'var(--s8)', paddingBottom: 'var(--s16)' }}>

        {/* Header */}
        <button id="questionnaire-back-btn" className="btn btn-ghost" onClick={onBack} disabled={submitting}
          style={{ marginBottom: 'var(--s6)' }}>
          ← Back
        </button>

        {/* Title + progress sticky strip */}
        <div style={{ borderBottom: '2px solid var(--ink)', marginBottom: 'var(--s8)', paddingBottom: 'var(--s6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 'var(--s3)' }}>
            <div>
              <span className="eyebrow">Mental Health Screening</span>
              <h1 className="display-heading" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)' }}>
                Self-Report Questionnaire
              </h1>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', lineHeight: 1 }}>
                {answeredCount}<span style={{ fontSize: '1rem', color: 'var(--ink-muted)', fontFamily: 'var(--font-body)' }}>/{total}</span>
              </span>
              <p style={{ fontSize: '0.7rem', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Answered</p>
            </div>
          </div>

          <div style={{ marginTop: 'var(--s4)' }}>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <p style={{ marginTop: 'var(--s3)', fontSize: '0.8125rem', color: 'var(--ink-muted)', lineHeight: 1.6 }}>
            {info?.instructions}
          </p>
        </div>

        {/* Validation banner */}
        {validationErrors.length > 0 && (
          <div className="alert alert-warning mb-4">
            <strong>Please answer all questions</strong>
            {validationErrors.length} question{validationErrors.length > 1 ? 's' : ''} still need{validationErrors.length === 1 ? 's' : ''} a response.
          </div>
        )}

        {/* Questions */}
        {info?.questions.map((q, idx) => {
          const isAnswered = q.id in answers
          const hasError = validationErrors.includes(q.id)

          return (
            <div
              key={q.id}
              id={`q-${q.id}`}
              className={`question-block ${isAnswered ? 'answered' : ''} ${hasError ? 'error' : ''}`}
            >
              <p className="question-counter">
                Question {idx + 1} of {total}
                {q.safety_flag && (
                  <span style={{ marginLeft: 10, color: 'var(--warning-text)', letterSpacing: '0.06em' }}>
                    ⚠ Important
                  </span>
                )}
              </p>
              <p className="question-text">{q.text}</p>

              <div className="radio-grid" role="radiogroup" aria-label={`Response for question ${idx + 1}`}>
                {sortedOpts.map(([val, label]) => (
                  <div key={val} className="radio-opt">
                    <input
                      type="radio"
                      id={`${q.id}-${val}`}
                      name={q.id}
                      value={val}
                      checked={answers[q.id] === Number(val)}
                      onChange={() => handleAnswer(q.id, val)}
                      disabled={submitting}
                    />
                    <label className="radio-lbl" htmlFor={`${q.id}-${val}`}>{label}</label>
                  </div>
                ))}
              </div>

              {hasError && (
                <p style={{ marginTop: 'var(--s2)', fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 600 }}>
                  Please select a response.
                </p>
              )}
            </div>
          )
        })}

        {/* Error */}
        {error && (
          <div className="alert alert-danger mb-4">
            <strong>Submission failed</strong>{error}
          </div>
        )}

        {/* Submit */}
        <div style={{ borderTop: '2px solid var(--ink)', paddingTop: 'var(--s6)' }}>
          <button
            id="submit-questionnaire-btn"
            className="btn btn-primary btn-lg btn-full"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Processing…' : 'Submit and view results →'}
          </button>
          <p style={{ marginTop: 'var(--s3)', fontSize: '0.75rem', color: 'var(--ink-muted)', textAlign: 'center', lineHeight: 1.6 }}>
            All {total} questions should be answered for a complete screening. Partial submissions are accepted but flagged as incomplete.
          </p>
        </div>

      </div>
    </div>
  )
}
