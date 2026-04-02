# Shadow Shift

A neon laser puzzle game built as a React + Vite PWA.

## Architecture

- **Framework**: React 18 + Vite 5
- **Styling**: Inline styles + CSS custom properties (no external CSS framework)
- **State**: React Context API (`GameContext`) + localStorage persistence
- **Fonts**: Orbitron (display) + Inter (UI) via Google Fonts

## Key Files

- `src/engine/laserEngine.js` — Laser beam raycasting engine (direction math, mirror reflections)
- `src/data/levels.js` — All 30 level definitions across 4 packs
- `src/data/dailyChallenges.js` — 14 daily challenge puzzles
- `src/context/GameContext.jsx` — Global game state (progress, coins, hints, settings)
- `src/screens/` — HomeScreen, LevelSelectScreen, LevelScreen, CompletionScreen, DailyChallengeScreen
- `src/components/GameGrid.jsx` — Core game grid renderer (SVG beam overlay + DOM cells)
- `src/components/HintModal.jsx` — Hint system UI
- `src/components/SettingsModal.jsx` — Settings panel

## Game Mechanics (Phase 1 MVP)

- **Laser source**: Fixed, emits beam in one direction (right/down/left/up)
- **Mirrors**: Movable objects, `/` and `\` types. Tap to select, tap empty cell to move, tap selected again to rotate
- **Blockers**: Fixed (immovable) and movable variants that absorb the beam
- **Crystal**: Fixed target — level completes 0.75s after beam makes contact
- **Star rating**: 3★ = perfectMoves, 2★ = optimalMoves, 1★ = any completion
- **Move limits**: Exceed limit → can only earn 1★

## Reflection Rules

- `/` mirror: right→up, down→left, left→down, up→right
- `\` mirror: right→down, down→right, left→up, up→left

## Level Packs

1. **Tutorial** (levels 1–10): No move limits, 5×5–6×6 grids
2. **Refraction** (levels 11–20): Move limits introduced, 6×6–7×7 grids
3. **Prism** (levels 21–25): Multiple blockers, 7×7 grids
4. **Singularity** (levels 26–30): Expert difficulty, strict limits

## Dev Server

```bash
npm run dev  # runs on port 5000
```
