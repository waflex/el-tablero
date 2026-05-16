import { useState } from 'react'
import MonsterModal from './MonsterModal'

function ImageWithFallback({ src, alt, className }) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) {
    return (
      <div className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <i className="ra ra-monster-skull" style={{ color: 'var(--color-stone-200)', fontSize: '3.5rem' }} />
      </div>
    )
  }
  return <img src={src} alt={alt} className={className} style={{ objectFit: 'contain', objectPosition: 'center', background: 'var(--color-cream-100)', padding: '0.5rem' }} onError={() => setFailed(true)} />
}

export default function MonsterCard({ monster }) {
  const [showModal, setShowModal] = useState(false)
  const { nombre, tipo, tamaño, cr, hp, ca, velocidad, quantity, img_url } = monster

  return (
    <>
      <div className="monster-card">
        {/* Image */}
        <ImageWithFallback src={img_url} alt={nombre} className="monster-card-img" />

        <div className="monster-card-body">
          {/* Name + CR */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
            <h3 className="monster-card-name">
              {nombre}
              {quantity > 1 && (
                <span style={{ color: 'var(--color-stone-400)', fontSize: '0.8rem', marginLeft: '0.4rem' }}>
                  ×{quantity}
                </span>
              )}
            </h3>
            <span className="badge-cr">CR {cr}</span>
          </div>

          <p className="monster-card-meta">{tamaño} · {tipo}</p>

          {/* Key stats */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
            <div className="stat-pill">
              <span className="stat-pill-label"><i className="ra ra-heart-beats ra-fw" /> HP</span>
              <span className="stat-pill-val">{hp}</span>
            </div>
            <div className="stat-pill">
              <span className="stat-pill-label"><i className="ra ra-shield ra-fw" /> CA</span>
              <span className="stat-pill-val">{ca}</span>
            </div>
            <div className="stat-pill" style={{ minWidth: '80px' }}>
              <span className="stat-pill-label"><i className="ra ra-boot-prints ra-fw" /> Velocidad</span>
              <span className="stat-pill-val" style={{ fontSize: '0.72rem' }}>{velocidad}</span>
            </div>
          </div>

          {/* Details button */}
          <button className="btn-details" onClick={() => setShowModal(true)} style={{ marginTop: '0.75rem' }}>
            <i className="ra ra-scroll-unfurled ra-fw" />
            Ver detalles
          </button>
        </div>
      </div>

      {showModal && <MonsterModal monster={monster} onClose={() => setShowModal(false)} />}
    </>
  )
}