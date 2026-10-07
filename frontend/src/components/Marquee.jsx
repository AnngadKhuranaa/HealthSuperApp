import '../App.css'

const MARQUEE_ITEMS = [
  'Mental Wellbeing', 'Early Screening', 'Mindful Health', 'Know Your Mind',
  'Take It Slow', 'Clear Signals', 'Informed Choices', 'You Matter',
  'Mental Wellbeing', 'Early Screening', 'Mindful Health', 'Know Your Mind',
  'Take It Slow', 'Clear Signals', 'Informed Choices', 'You Matter',
]

export default function Marquee() {
  return (
    <div className="marquee-strip" aria-hidden="true">
      <div className="marquee-inner">
        {MARQUEE_ITEMS.map((item, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
            <span className="marquee-item">{item}</span>
            <span className="marquee-dot">·</span>
          </span>
        ))}
      </div>
    </div>
  )
}
