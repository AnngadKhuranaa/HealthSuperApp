import { useState } from 'react'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import ConsentPage from './pages/ConsentPage'
import QuestionnairePage from './pages/QuestionnairePage'
import ResultsPage from './pages/ResultsPage'
import CardioAssessmentPage from './pages/CardioAssessmentPage'
import CardioResultsPage from './pages/CardioResultsPage'
import './App.css'

// Mental health flow views
const MH_VIEWS = {
  HOME:          'home',
  CONSENT:       'consent',
  QUESTIONNAIRE: 'questionnaire',
  RESULTS:       'results',
}

// Cardiovascular flow views
const CARDIO_VIEWS = {
  ASSESSMENT: 'cardio-assessment',
  RESULTS:    'cardio-results',
}

export default function App() {
  const [view, setView]         = useState(MH_VIEWS.HOME)
  const [report, setReport]     = useState(null)
  const [cardioReport, setCardioReport] = useState(null)

  // ── Mental health navigation ──────────────────────────────────────────────
  const goHome      = () => { setReport(null); setCardioReport(null); setView(MH_VIEWS.HOME) }
  const goConsent   = () => setView(MH_VIEWS.CONSENT)
  const goQuiz      = () => setView(MH_VIEWS.QUESTIONNAIRE)
  const goResults   = (r) => { setReport(r); setView(MH_VIEWS.RESULTS) }
  const goRestart   = () => { setReport(null); setView(MH_VIEWS.CONSENT) }

  // ── Cardiovascular navigation ─────────────────────────────────────────────
  const goCardio        = () => setView(CARDIO_VIEWS.ASSESSMENT)
  const goCardioResults = (r) => { setCardioReport(r); setView(CARDIO_VIEWS.RESULTS) }
  const goCardioRestart = () => { setCardioReport(null); setView(CARDIO_VIEWS.ASSESSMENT) }

  return (
    <>
      <Navbar onHome={goHome} />
      <main id="main-content">
        {view === MH_VIEWS.HOME         && <HomePage onStart={goConsent} onStartCardio={goCardio} />}
        {view === MH_VIEWS.CONSENT      && <ConsentPage onConsent={goQuiz}    onBack={goHome} />}
        {view === MH_VIEWS.QUESTIONNAIRE && <QuestionnairePage onComplete={goResults} onBack={goConsent} />}
        {view === MH_VIEWS.RESULTS      && <ResultsPage report={report} onRestart={goRestart} onHome={goHome} />}

        {view === CARDIO_VIEWS.ASSESSMENT && (
          <CardioAssessmentPage onComplete={goCardioResults} onBack={goHome} />
        )}
        {view === CARDIO_VIEWS.RESULTS && (
          <CardioResultsPage report={cardioReport} onRestart={goCardioRestart} onHome={goHome} />
        )}
      </main>
    </>
  )
}
