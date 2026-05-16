import MonsterCard from './MonsterCard'

const XP_BY_CR = {
  '0':10,'1/8':25,'1/4':50,'1/2':100,'1':200,'2':450,'3':700,'4':1100,
  '5':1800,'6':2300,'7':2900,'8':3900,'9':5000,'10':5900,'11':7200,
  '12':8400,'13':10000,'14':11500,'15':13000,'16':15000,'17':18000,
  '18':20000,'19':22000,'20':25000,
}

export default function EncounterResult({ monsters }) {
  if (!monsters?.length) return null

  const totalXP = monsters.reduce((acc, m) =>
    acc + (XP_BY_CR[String(m.cr)] ?? 0) * (m.quantity ?? 1), 0)

  return (
    <div>
      {/* Summary */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '0.85rem', fontFamily: 'var(--font-family-cinzel)', color: 'var(--color-stone-500)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          <i className="ra ra-daggers ra-fw" style={{ color: 'var(--color-crimson-500)', marginRight: '0.4rem' }} />
          {monsters.length} criatura{monsters.length !== 1 ? 's' : ''} encontrada{monsters.length !== 1 ? 's' : ''}
        </h2>
        <span style={{ fontFamily: 'var(--font-family-cinzel)', fontSize: '0.72rem', color: 'var(--color-gold-600)' }}>
          <i className="ra ra-trophy ra-fw" /> ~{totalXP.toLocaleString()} XP
        </span>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
        {monsters.map((m, i) => <MonsterCard key={m.slug ?? i} monster={m} />)}
      </div>
    </div>
  )
}