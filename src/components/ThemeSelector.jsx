import { THEMES } from '../data/gameData'

export default function ThemeSelector({ selected, onChange }) {
  return (
    <div>
      <p className="section-label">Temática</p>
      <div className="flex flex-wrap gap-1.5">
        {THEMES.map((t) => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`chip ${selected === t.id ? 'active' : ''}`}
            title={t.description}
          >
            <i className={`ra ${t.icon} ra-fw`} style={{ fontSize: '0.75rem' }} />
            {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}