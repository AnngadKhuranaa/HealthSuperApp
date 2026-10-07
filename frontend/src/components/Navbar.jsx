import '../App.css'

export default function Navbar({ currentView, onHome }) {
  return (
    <header className="navbar" role="banner">
      <div className="navbar-inner">
        <button
          onClick={onHome}
          className="navbar-brand"
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)' }}
          id="navbar-logo"
          aria-label="HealthOS — go to home"
        >
          HealthOS
        </button>
        <span className="navbar-tagline">Health Screening Platform</span>
      </div>
    </header>
  )
}
