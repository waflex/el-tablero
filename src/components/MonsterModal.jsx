const toStr = (val) => {
  if (!val) return ''
  if (typeof val === 'string') return val
  if (typeof val === 'object' && val !== null) {
    if (val.as_string) return val.as_string
    if (Array.isArray(val)) return val.map(toStr).join(' ')
    return Object.values(val).map(toStr).join(' ')
  }
  return String(val)
}

const safeAction = (a) => ({ name: toStr(a?.name), desc: toStr(a?.desc) })

const STATS     = ['str','dex','con','int','wis','cha']
const STAT_LABELS = ['FUE','DES','CON','INT','SAB','CAR']

function mod(v) {
  const m = Math.floor(((v ?? 10) - 10) / 2)
  return m >= 0 ? `+${m}` : `${m}`
}

export default function MonsterModal({ monster, onClose }) {
  const {
    nombre, tipo, tamaño, cr, alineacion,
    hp, ca, velocidad, sentidos, idiomas, tip, img_url,
  } = monster

  const acciones          = (monster.acciones ?? []).map(safeAction)
  const accionesEspeciales = (monster.accionesEspeciales ?? []).map(safeAction)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="stat-block" onClick={e => e.stopPropagation()}>
        <button className="sb-close" onClick={onClose} title="Cerrar">
          <i className="ra ra-cross" />
        </button>

        <div className="stat-block-inner">

          {/* Name + image row */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h2 className="sb-name">{nombre}</h2>
                <span className="sb-cr">CR {cr}</span>
              </div>
              <p className="sb-subtitle">{toStr(tamaño)} {toStr(tipo)}, {toStr(alineacion)}</p>
            </div>
            {img_url && (
              <img
                src={img_url}
                alt={nombre}
                style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 4, border: '1px solid var(--color-cream-200)', flexShrink: 0 }}
                onError={e => { e.currentTarget.style.display = 'none' }}
              />
            )}
          </div>

          <hr className="sb-divider" />

          {/* Vitals */}
          <div className="sb-vitals">
            <div><strong>Clase de Armadura</strong> {ca}</div>
            <div><strong>Puntos de Golpe</strong> {hp}</div>
            <div><strong>Velocidad</strong> {toStr(velocidad)}</div>
          </div>

          <hr className="sb-divider" />

          {/* Ability scores */}
          <div className="sb-abilities">
            {STATS.map((s, i) => (
              <div key={s}>
                <div className="sb-ability-label">{STAT_LABELS[i]}</div>
                <div className="sb-ability-val">{monster[s] ?? '—'}</div>
                <div className="sb-ability-mod">({mod(monster[s])})</div>
              </div>
            ))}
          </div>

          <hr className="sb-divider" />

          {/* Senses & languages */}
          <div className="sb-vitals">
            {sentidos && <div><strong>Sentidos</strong> {toStr(sentidos)}</div>}
            {idiomas  && <div><strong>Idiomas</strong> {toStr(idiomas)}</div>}
            <div><strong>Desafío</strong> {cr}</div>
          </div>

          {/* Special abilities / Traits */}
          {accionesEspeciales.length > 0 && (
            <>
              <hr className="sb-divider" />
              {accionesEspeciales.map((a, i) => (
                <p key={i} className="sb-action">
                  <span className="sb-action-name">{a.name}. </span>
                  {a.desc}
                </p>
              ))}
            </>
          )}

          {/* Actions */}
          {acciones.length > 0 && (
            <>
              <div className="sb-section-heading">Acciones</div>
              {acciones.map((a, i) => (
                <p key={i} className="sb-action">
                  <span className="sb-action-name">{a.name}. </span>
                  {a.desc}
                </p>
              ))}
            </>
          )}

          {/* DM Tip */}
          {tip && (
            <div className="sb-tip">
              <strong><i className="ra ra-quill-ink ra-fw" /> Consejo del DM</strong>
              {tip}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}