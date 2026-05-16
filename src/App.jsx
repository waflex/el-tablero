import { useState } from 'react'
import ThemeSelector from './components/ThemeSelector'
import ConditionGrid from './components/ConditionGrid'
import EncounterParams from './components/EncounterParams'
import EncounterResult from './components/EncounterResult'
import { useEncounterGenerator } from './hooks/useEncounterGenerator'
import ResizableSidebar from './components/ResizableSidebar'
import { THEMES, CONDITIONS } from './data/gameData'

const DEFAULT_PARAMS = {
  players: 4, level: 5, difficulty: 2, monsterCount: 3, extraContext: '',
}

const PHASE_LABELS = {
  ai:     'Consultando al Dungeon Master...',
  open5e: 'Cargando bestiario...',
}

export default function App() {
  const [selectedTheme, setSelectedTheme]           = useState('dungeon')
  const [selectedConditions, setSelectedConditions] = useState([])
  const [params, setParams]                         = useState(DEFAULT_PARAMS)
  const { monsters, loading, error, phase, generate } = useEncounterGenerator()

  const handleGenerate = () => {
    const theme = THEMES.find(t => t.id === selectedTheme)
    const conditionLabels = selectedConditions.map(
      id => CONDITIONS.find(c => c.id === id)?.label ?? id
    )
    generate({
      theme: theme?.description ?? selectedTheme,
      conditions: conditionLabels,
      players: params.players,
      level: params.level,
      difficulty: params.difficulty,
      monsterCount: params.monsterCount,
      extraContext: params.extraContext,
    })
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      {/* Sidebar */}
      <ResizableSidebar>
        {/* Logo */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1rem', color: 'var(--color-crimson-600)', lineHeight: 1.2 }}>
            <i className="ra ra-sword ra-fw" style={{ color: 'var(--color-gold-500)', marginRight: '0.4rem' }} />
            El Tablero
          </h1>
          <p style={{ fontSize: '0.72rem', color: 'var(--color-stone-400)', fontStyle: 'italic', marginTop: '0.2rem' }}>
            Generador de encuentros D&D 5e
          </p>
        </div>

        <ThemeSelector selected={selectedTheme} onChange={setSelectedTheme} />
        <ConditionGrid selected={selectedConditions} onChange={setSelectedConditions} />
        <EncounterParams params={params} onChange={setParams} />

        <button className="btn-generate" onClick={handleGenerate} disabled={loading}>
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ display: 'flex', gap: '3px' }}>
                <span className="loading-dot" />
                <span className="loading-dot" />
                <span className="loading-dot" />
              </span>
              {PHASE_LABELS[phase] ?? 'Procesando...'}
            </span>
          ) : (
            <>
              <i className="ra ra-lightning-sword ra-fw" />
              Forjar encuentro
            </>
          )}
        </button>

        {error && <div className="error-box"><i className="ra ra-skull ra-fw" /> {error}</div>}
      </ResizableSidebar>

      {/* Main content */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--color-cream-200)', paddingBottom: '1rem' }}>
          <h1 style={{ fontSize: '1.5rem', color: 'var(--color-crimson-600)' }}>
            Generador de Combates D&D
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-stone-400)', fontStyle: 'italic', marginTop: '0.25rem' }}>
            Configura el encuentro en el panel izquierdo y forja tu batalla
          </p>
        </div>

        {/* Empty state */}
        {!monsters.length && !loading && (
          <div style={{ textAlign: 'center', paddingTop: '5rem', color: 'var(--color-stone-300)' }}>
            <i className="ra ra-dragon ra-5x" style={{ display: 'block', marginBottom: '1rem' }} />
            <p style={{ fontFamily: 'var(--font-family-cinzel)', fontSize: '0.85rem', letterSpacing: '0.08em' }}>
              El bestiario aguarda tus órdenes
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', paddingTop: '5rem', color: 'var(--color-stone-400)' }}>
            <i className="ra ra-burning-book ra-5x" style={{ display: 'block', marginBottom: '1rem', color: 'var(--color-crimson-500)', animation: 'pulse 1.5s ease-in-out infinite' }} />
            <p style={{ fontFamily: 'var(--font-family-cinzel)', fontSize: '0.8rem', letterSpacing: '0.1em' }}>
              {PHASE_LABELS[phase] ?? 'Consultando el bestiario...'}
            </p>
          </div>
        )}

        {/* Results */}
        {!loading && <EncounterResult monsters={monsters} />}
      </main>
    </div>
  )
}