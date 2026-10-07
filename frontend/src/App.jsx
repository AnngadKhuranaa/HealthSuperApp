import { useState } from 'react'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import ConsentPage from './pages/ConsentPage'
import QuestionnairePage from './pages/QuestionnairePage'
import ResultsPage from './pages/ResultsPage'
import './App.css'

const VIEWS = { HOME: 'home', CONSENT: 'consent', QUESTIONNAIRE: 'questionnaire', RESULTS: 'results' }

export default function App() {
  const [view, setView] = useState(VIEWS.HOME)
  const [report, setReport] = useState(null)

  const goHome      = () => { setReport(null); setView(VIEWS.HOME) }
  const goConsent   = () => setView(VIEWS.CONSENT)
  const goQuiz      = () => setView(VIEWS.QUESTIONNAIRE)
  const goResults   = (r) => { setReport(r); setView(VIEWS.RESULTS) }
  const goRestart   = () => { setReport(null); setView(VIEWS.CONSENT) }

  return (
    <>
      <Navbar onHome={goHome} />
      <main id="main-content">
        {view === VIEWS.HOME         && <HomePage         onStart={goConsent} />}
        {view === VIEWS.CONSENT      && <ConsentPage      onConsent={goQuiz}    onBack={goHome} />}
        {view === VIEWS.QUESTIONNAIRE && <QuestionnairePage onComplete={goResults} onBack={goConsent} />}
        {view === VIEWS.RESULTS      && <ResultsPage      report={report} onRestart={goRestart} onHome={goHome} />}
      </main>
    </>
  )
}
