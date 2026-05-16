# ⚔️ El Tablero

Generador de encuentros D&D 5e con temáticas, condiciones ambientales y monstruos generados por IA (OpenRouter - openrouter.ai).

## Setup rápido

```bash
# 1. Instala dependencias
pnpm install

# 2. Configura tu API key de OpenRouter
cp .env.example .env
# Edita .env y pega tu VITE_OPENROUTER_API_KEY

# 3. Corre en modo desarrollo
pnpm dev
```

## Stack

- React 18 + Vite 5
- Tailwind CSS 3
- OpenRouter (openrouter.ai) — configura VITE_OPENROUTER_API_KEY en .env

## Estructura

```
src/
├── components/
│   ├── ThemeSelector.jsx     # Selección de temática
│   ├── ConditionGrid.jsx     # Condiciones ambientales
│   ├── EncounterParams.jsx   # Sliders de parámetros
│   ├── EncounterResult.jsx   # Resultado del encuentro
│   └── MonsterCard.jsx       # Ficha de cada monstruo
├── hooks/
│   └── useEncounterGenerator.js  # Lógica de llamada a Gemini
├── data/
│   └── gameData.js           # Temáticas y condiciones estáticas
├── App.jsx
└── main.jsx
```

## Deploy en Vercel

```bash
pnpm build
# Sube a Vercel y agrega VITE_OPENROUTER_API_KEY en Environment Variables
```
