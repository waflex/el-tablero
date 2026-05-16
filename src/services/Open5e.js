const BASE_URL = 'https://api.open5e.com/v2'

// v2 uses /creatures/ endpoint and keys like "srd_yeti"
export async function fetchMonsterBySlug(slug) {
  // Slugs to try in order
  const candidates = [
    `srd_${slug}`,
    slug,
    `srd_${slug.replace(/-/g, '_')}`,
    slug.replace(/-/g, '_'),
  ]

  for (const candidate of candidates) {
    try {
      const res = await fetch(`${BASE_URL}/creatures/${candidate}/?format=json`)
      if (res.ok) return res.json()
    } catch {}
  }

  throw new Error(`Monster not found: ${slug}`)
}

export async function searchMonsters({ search = '', crMin, crMax, limit = 5 } = {}) {
  const params = new URLSearchParams({ format: 'json', limit })
  if (search) params.set('name__icontains', search)
  if (crMin !== undefined) params.set('challenge_rating_decimal__gte', crMin)
  if (crMax !== undefined) params.set('challenge_rating_decimal__lte', crMax)

  const res = await fetch(`${BASE_URL}/creatures/?${params}`)
  if (!res.ok) throw new Error('Failed to fetch creatures from Open5e v2')
  return res.json()
}

// Official D&D 5e XP thresholds per character per level
const XP_THRESHOLDS = {
  1:  [25,   50,   75,   100],
  2:  [50,   100,  150,  200],
  3:  [75,   150,  225,  400],
  4:  [125,  250,  375,  500],
  5:  [250,  500,  750,  1100],
  6:  [300,  600,  900,  1400],
  7:  [350,  750,  1100, 1700],
  8:  [450,  900,  1400, 2100],
  9:  [550,  1100, 1600, 2400],
  10: [600,  1200, 1900, 2800],
  11: [800,  1600, 2400, 3600],
  12: [1000, 2000, 3000, 4500],
  13: [1100, 2200, 3400, 5100],
  14: [1250, 2500, 3800, 5700],
  15: [1400, 2800, 4300, 6400],
  16: [1600, 3200, 4800, 7200],
  17: [2000, 3900, 5900, 8800],
  18: [2100, 4200, 6300, 9500],
  19: [2400, 4900, 7300, 10900],
  20: [2800, 5700, 8500, 12700],
}

const CR_TO_XP = {
  '0': 10, '1/8': 25, '1/4': 50, '1/2': 100,
  1: 200, 2: 450, 3: 700, 4: 1100, 5: 1800,
  6: 2300, 7: 2900, 8: 3900, 9: 5000, 10: 5900,
  11: 7200, 12: 8400, 13: 10000, 14: 11500, 15: 13000,
  16: 15000, 17: 18000, 18: 20000, 19: 22000, 20: 25000,
}

const CR_ORDER = ['0','1/8','1/4','1/2',1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]

// XP multipliers by number of monsters (DMG p.82)
function xpMultiplier(monsterCount) {
  if (monsterCount <= 1) return 1
  if (monsterCount === 2) return 1.5
  if (monsterCount <= 6) return 2
  if (monsterCount <= 10) return 2.5
  if (monsterCount <= 14) return 3
  return 4
}

export function calcCRRange(level, difficulty, players = 4, monsterCount = 3) {
  const lvl = Math.min(20, Math.max(1, level))
  const thresholds = XP_THRESHOLDS[lvl]
  const diffIdx = difficulty - 1

  // Total XP budget for the encounter
  const budget = thresholds[diffIdx] * players

  // Divide budget by multiplier so chosen monsters don't blow up when combined
  const multiplier = xpMultiplier(monsterCount)
  const adjustedBudget = Math.floor(budget / multiplier)
  const minBudget = Math.floor((thresholds[0] * players * 0.25) / multiplier)

  let minCR = '0', maxCR = '1/4'
  for (const cr of CR_ORDER) {
    const xp = CR_TO_XP[cr]
    if (xp <= minBudget) minCR = cr
    if (xp <= adjustedBudget) maxCR = cr
  }
  return { min: minCR, max: maxCR, budget, adjustedBudget, multiplier }
}

// Translation maps
const TYPE_ES = {
  'Aberration': 'Aberración', 'Beast': 'Bestia', 'Celestial': 'Celestial',
  'Construct': 'Constructo', 'Dragon': 'Dragón', 'Elemental': 'Elemental',
  'Fey': 'Feérico', 'Fiend': 'Demonio', 'Giant': 'Gigante',
  'Humanoid': 'Humanoide', 'Monstrosity': 'Monstruosidad', 'Ooze': 'Cieno',
  'Plant': 'Planta', 'Undead': 'No-muerto',
}

const SIZE_ES = {
  'Tiny': 'Diminuto', 'Small': 'Pequeño', 'Medium': 'Mediano',
  'Large': 'Grande', 'Huge': 'Enorme', 'Gargantuan': 'Gargantuesco',
}

const ALIGN_ES = {
  'lawful good': 'Legal Bueno', 'neutral good': 'Neutral Bueno',
  'chaotic good': 'Caótico Bueno', 'lawful neutral': 'Legal Neutral',
  'true neutral': 'Neutral', 'neutral': 'Neutral',
  'chaotic neutral': 'Caótico Neutral', 'lawful evil': 'Legal Malvado',
  'neutral evil': 'Neutral Malvado', 'chaotic evil': 'Caótico Malvado',
  'unaligned': 'Sin alineación', 'any alignment': 'Cualquier alineación',
  'any non-good alignment': 'Cualquier alineación no-buena',
  'any chaotic alignment': 'Cualquier alineación caótica',
  'any evil alignment': 'Cualquier alineación malvada',
}

function formatSpeed(speed) {
  if (!speed) return '—'
  if (typeof speed === 'string') return speed
  // v2 speed is an object like { walk: 30, fly: 60, unit: "feet" }
  const unit = speed.unit === 'feet' ? 'ft.' : (speed.unit ?? '')
  return Object.entries(speed)
    .filter(([k, v]) => k !== 'unit' && v && v > 0)
    .map(([k, v]) => k === 'walk' ? `${v} ${unit}` : `${k} ${v} ${unit}`)
    .join(', ') || '—'
}

// v2 creature structure is quite different from v1
export function normalizeMonster(raw, tip = '') {
  // v2 nests type and size as objects
  const typeRaw = raw.type?.name ?? raw.type ?? ''
  const sizeRaw = raw.size?.name ?? raw.size ?? ''
  const alignRaw = (raw.alignment ?? '').toLowerCase()
  const cr = raw.challenge_rating_text ?? raw.challenge_rating ?? raw.challenge_rating_decimal ?? '?'

  // v2 stats are direct fields
  const str = raw.strength ?? raw.ability_scores?.strength ?? null
  const dex = raw.dexterity ?? raw.ability_scores?.dexterity ?? null
  const con = raw.constitution ?? raw.ability_scores?.constitution ?? null
  const int = raw.intelligence ?? raw.ability_scores?.intelligence ?? null
  const wis = raw.wisdom ?? raw.ability_scores?.wisdom ?? null
  const cha = raw.charisma ?? raw.ability_scores?.charisma ?? null

  // v2 actions: desc can be {as_string, data} object instead of string
  const flattenDesc = (item) => ({
    ...item,
    desc: typeof item.desc === 'object' ? (item.desc?.as_string ?? JSON.stringify(item.desc)) : (item.desc ?? ''),
  })
  const acciones = (raw.actions ?? []).map(flattenDesc)
  const accionesEspeciales = (raw.special_abilities ?? raw.traits ?? []).map(flattenDesc)

  // v2 illustration, fallback to 5etools mirror
  const FIVETOOLS_BASE = 'https://raw.githubusercontent.com/5etools-mirror-2/5etools-img/main/bestiary'
  const open5eImg = raw.illustration?.file_url
    ? `https://api.open5e.com${raw.illustration.file_url}`
    : raw.img_main ?? null

  // 5etools uses Title Case names as filenames, sourced mostly from MM, MPMM, VGM, etc.
  const sources = ['MM', 'MPMM', 'VGM', 'MTF', 'FTD', 'BMT']
  const imgName = encodeURIComponent(raw.name)
  const fiveToolsImg = `${FIVETOOLS_BASE}/${sources[0]}/${imgName}.webp`

  const img_url = open5eImg ?? fiveToolsImg

  return {
    slug:        raw.key ?? raw.slug,
    nombre:      raw.name,
    tipo:        TYPE_ES[typeRaw] ?? typeRaw,
    tamaño:      SIZE_ES[sizeRaw] ?? sizeRaw,
    cr,
    alineacion:  ALIGN_ES[alignRaw] ?? raw.alignment ?? '—',
    hp:          raw.hit_points,
    ca:          raw.armor_class,
    velocidad:   formatSpeed(raw.speed),
    str, dex, con, int, wis, cha,
    acciones,
    accionesEspeciales,
    sentidos:    raw.senses ?? '',
    idiomas:     raw.languages ?? '—',
    img_url,
    tip,
  }
}