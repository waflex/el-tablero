import { useState } from 'react'
import { fetchMonsterBySlug, searchMonsters, calcCRRange, normalizeMonster } from '../services/open5e'

function extractJSON(text) {
  const match = text.match(/\[[\s\S]*\]/)
  if (match) {
    try { return JSON.parse(match[0]) } catch {}
  }
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

async function callGemini(prompt, apiKey) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 800 },
      }),
    }
  )
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = err.error?.message ?? `Error HTTP ${res.status}`
    throw new Error(res.status === 429 ? `Gemini: límite de requests (429). ${msg}` : msg)
  }
  const data = await res.json()
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!content?.trim()) throw new Error('Gemini no devolvió contenido.')
  return content
}

async function callOpenRouter(prompt, apiKey, attempt = 1) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'El Tablero',
    },
    body: JSON.stringify({
      model: 'openrouter/free',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 800,
    }),
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error.message ?? JSON.stringify(data.error))
  const content = data.choices?.[0]?.message?.content
  if (!content?.trim()) {
    if (attempt >= 3) throw new Error('OpenRouter no respondió después de 3 intentos. Espera unos segundos.')
    await new Promise(r => setTimeout(r, 1500 * attempt))
    return callOpenRouter(prompt, apiKey, attempt + 1)
  }
  return content
}

function buildPrompt(params) {
  const { theme, conditions, players, level, difficulty, monsterCount, extraContext } = params
  const crRange = calcCRRange(level, difficulty, players, monsterCount)

  return `Eres un experto en D&D 5e. Selecciona exactamente ${monsterCount} monstruos para este encuentro.

TEMA: ${theme}
CONDICIONES: ${conditions.length ? conditions.join(', ') : 'ninguna'}
GRUPO: ${players} jugadores, nivel ${level}
RANGO DE CR: ${crRange.min} a ${crRange.max}
${extraContext ? `CONTEXTO ADICIONAL: ${extraContext}` : ''}

Responde EXCLUSIVAMENTE con un array JSON. Sin explicaciones, sin markdown, sin texto adicional. Ejemplo válido:
[{"slug":"goblin","cantidad":3,"tip":"Se ocultan en la maleza y atacan con ventaja por sorpresa."},{"slug":"ogre","cantidad":1,"tip":"Carga contra el personaje más cercano para derribarlo."}]

Reglas obligatorias:
- Exactamente ${monsterCount} entradas en el array.
- Usa SOLO slugs REALES de Open5e (minúsculas, guiones): goblin, hobgoblin, bugbear, orc, kobold, gnoll, skeleton, zombie, ghoul, ghast, wight, wraith, specter, ghost, shadow, ogre, troll, ettin, hill-giant, stone-giant, frost-giant, fire-giant, adult-black-dragon, adult-blue-dragon, adult-red-dragon, adult-white-dragon, wyvern, chimera, manticore, basilisk, medusa, hydra, hell-hound, nightmare, erinyes, pit-fiend, balor, vrock, dretch, gargoyle, mimic, doppelganger, werewolf, wererat, vampire, vampire-spawn, lich, beholder, mind-flayer, umber-hulk, otyugh, roper, shambling-mound, treant, harpy, griffon, hippogriff, unicorn, bulette, purple-worm, giant-spider, giant-scorpion, giant-crocodile, tyrannosaurus-rex, mammoth.
- CR de cada monstruo entre ${crRange.min} y ${crRange.max}.
- cantidad: entero entre 1 y 6.
- tip: una frase práctica en español para el DM.
- La selección debe ser coherente con el tema y las condiciones.`
}

async function askAIForMonsters(params) {
  const geminiKey     = import.meta.env.VITE_GEMINI_API_KEY
  const openRouterKey = import.meta.env.VITE_OPENROUTER_API_KEY

  if (!geminiKey && !openRouterKey) {
    throw new Error('Configura VITE_GEMINI_API_KEY o VITE_OPENROUTER_API_KEY en el archivo .env')
  }

  const prompt = buildPrompt(params)

  // Try each provider in order, fallback on any error (429, 404, empty, etc.)
  const providers = [
    geminiKey     && { name: 'Gemini',      call: () => callGemini(prompt, geminiKey) },
    openRouterKey && { name: 'OpenRouter',  call: () => callOpenRouter(prompt, openRouterKey) },
  ].filter(Boolean)

  let lastError
  for (const provider of providers) {
    try {
      console.info(`[AI] Trying ${provider.name}...`)
      const content = await provider.call()
      return extractJSON(content)
    } catch (e) {
      console.warn(`[AI] ${provider.name} failed: ${e.message}`)
      lastError = e
    }
  }

  throw new Error(`Todos los proveedores fallaron. Último error: ${lastError?.message}`)
}

async function resolveMonsters(suggestions) {
  const results = []
  for (const s of suggestions) {
    // v2 API uses "cantidad" or "quantity"
    const qty = s.cantidad ?? s.quantity ?? 1
    try {
      const raw = await fetchMonsterBySlug(s.slug)
      results.push({ ...normalizeMonster(raw, s.tip), quantity: qty })
    } catch {
      const searchTerm = s.slug.replace(/-/g, ' ')
      try {
        const fallback = await searchMonsters({ search: searchTerm, limit: 3 })
        const match = fallback.results?.find(
          r => r.key === s.slug || r.slug === s.slug || r.name.toLowerCase() === searchTerm.toLowerCase()
        ) ?? fallback.results?.[0]
        if (match) {
          results.push({ ...normalizeMonster(match, s.tip), quantity: qty })
        } else {
          console.warn(`[open5e] Monster not found: ${s.slug}`)
        }
      } catch (e) {
        console.warn(`[open5e] Search failed for ${s.slug}:`, e.message)
      }
    }
  }
  return results
}

export function useEncounterGenerator() {
  const [monsters, setMonsters] = useState([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [phase, setPhase]       = useState('')

  async function generate(params) {
    setLoading(true)
    setError(null)
    setMonsters([])

    try {
      setPhase('ai')
      const suggestions = await askAIForMonsters(params)

      setPhase('open5e')
      const resolved = await resolveMonsters(suggestions)

      if (!resolved.length) throw new Error('No se pudieron resolver los monstruos. Intenta de nuevo.')
      setMonsters(resolved)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
      setPhase('')
    }
  }

  return { monsters, loading, error, phase, generate }
}