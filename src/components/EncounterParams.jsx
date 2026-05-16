import { DIFFICULTIES } from '../data/gameData'

function SliderRow({ label, min, max, value, onChange, display }) {
  return (
    <div className="slider-track">
      <label>{label}</label>
      <input type="range" min={min} max={max} value={value} step="1"
        onChange={e => onChange(Number(e.target.value))} />
      <span className="val">{display ?? value}</span>
    </div>
  )
}

export default function EncounterParams({ params, onChange }) {
  const { players, level, difficulty, monsterCount, extraContext } = params
  const diff = DIFFICULTIES.find(d => d.value === difficulty)

  return (
    <div>
      <p className="section-label">Parámetros</p>
      <SliderRow label="Jugadores" min={1} max={8} value={players}
        onChange={v => onChange({ ...params, players: v })} />
      <SliderRow label="Nivel medio" min={1} max={20} value={level}
        onChange={v => onChange({ ...params, level: v })} />
      <SliderRow label="Dificultad" min={1} max={4} value={difficulty}
        onChange={v => onChange({ ...params, difficulty: v })}
        display={<span style={{ color: diff?.hex ?? 'inherit' }}>{diff?.label}</span>} />
      <SliderRow label="Monstruos" min={1} max={12} value={monsterCount}
        onChange={v => onChange({ ...params, monsterCount: v })} />

      <p className="section-label" style={{ marginTop: '1rem' }}>Contexto adicional</p>
      <textarea
        value={extraContext}
        onChange={e => onChange({ ...params, extraContext: e.target.value })}
        rows={3}
        placeholder="Ej: los héroes acaban de escapar de una trampa, buscan un artefacto..."
        style={{
          width: '100%',
          border: '1px solid var(--color-cream-200)',
          borderRadius: '6px',
          padding: '0.5rem 0.75rem',
          fontSize: '0.82rem',
          fontFamily: 'var(--font-family-crimson)',
          color: 'var(--color-stone-700)',
          background: 'white',
          resize: 'none',
          outline: 'none',
        }}
      />
    </div>
  )
}