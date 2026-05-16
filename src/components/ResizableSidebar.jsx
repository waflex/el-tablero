import { useRef, useEffect, useState } from 'react'

const MIN_WIDTH = 350
const MAX_WIDTH = 480
const DEFAULT_WIDTH = 300

export default function ResizableSidebar({ children }) {
  const [width, setWidth] = useState(DEFAULT_WIDTH)
  const dragging = useRef(false)
  const startX = useRef(0)
  const startW = useRef(0)

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current) return
      const dx = (e.clientX || e.touches?.[0]?.clientX) - startX.current
      const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startW.current + dx))
      setWidth(next)
    }
    const onUp = () => { dragging.current = false; document.body.style.cursor = '' }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchmove', onMove)
    window.addEventListener('touchend', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onUp)
    }
  }, [])

  const onDragStart = (e) => {
    dragging.current = true
    startX.current = e.clientX || e.touches?.[0]?.clientX
    startW.current = width
    document.body.style.cursor = 'col-resize'
    e.preventDefault()
  }

  return (
    <aside
      style={{
        width,
        minWidth: MIN_WIDTH,
        maxWidth: MAX_WIDTH,
        flexShrink: 0,
        position: 'relative',
        display: 'flex',
      }}
    >
      {/* Scrollable content */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.5rem 1.25rem',
          background: 'var(--color-cream-50)',
          borderRight: '1px solid var(--color-cream-200)',
          height: '100vh',
          position: 'sticky',
          top: 0,
        }}
      >
        {children}
      </div>

      {/* Drag handle */}
      <div
        onMouseDown={onDragStart}
        onTouchStart={onDragStart}
        title="Arrastra para redimensionar"
        style={{
          width: 6,
          cursor: 'col-resize',
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(155,27,27,0.15)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        {/* Grip dots */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, pointerEvents: 'none' }}>
          {[0,1,2,3,4].map(i => (
            <div key={i} style={{
              width: 3, height: 3, borderRadius: '50%',
              background: 'var(--color-stone-300)',
            }} />
          ))}
        </div>
      </div>
    </aside>
  )
}