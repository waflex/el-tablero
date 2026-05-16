import { CONDITIONS } from '../data/gameData'

export default function ConditionGrid({ selected, onChange }) {
  const toggle = (id) =>
    onChange(selected.includes(id) ? selected.filter(c => c !== id) : [...selected, id])

  return (
    <div>
      <p className="section-label">Condiciones ambientales</p>
      <div className="flex flex-wrap gap-1.5">
        {CONDITIONS.map((c) => (
          <button
            key={c.id}
            onClick={() => toggle(c.id)}
            className={`chip ${selected.includes(c.id) ? 'active' : ''}`}
          >
            <i className={`ra ${c.icon} ra-fw`} style={{ fontSize: '0.75rem' }} />
            {c.label}
          </button>
        ))}
      </div>
      {selected.length > 0 && (
        <p style={{ fontSize: '0.72rem', color: 'var(--color-stone-400)', marginTop: '0.4rem' }}>
          {selected.length} condición{selected.length !== 1 ? 'es' : ''} activa{selected.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}