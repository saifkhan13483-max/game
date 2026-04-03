# Shadow Shift

A neon laser puzzle game built as a React + Vite PWA.

## Architecture

- **Framework**: React 18 + Vite 5
- **Styling**: Inline styles + CSS custom properties (no external CSS framework)
- **State**: React Context API (`GameContext`) + localStorage persistence (key: `shadow_shift_save_v2`)
- **Audio**: Web Audio API synth engine (`src/audio/audioEngine.js`) — no assets required
- **Fonts**: Orbitron (display) + Inter (UI) via Google Fonts

## Key Files

- `src/engine/laserEngine.js` — Laser beam raycasting (direction math, mirror reflections, star rating)
- `src/data/levels.js` — All 30 level definitions across 4 packs
- `src/data/dailyChallenges.js` — 14 daily challenge puzzles
- `src/data/achievements.js` — 30 achievement definitions with unlock conditions
- `src/audio/audioEngine.js` — Web Audio API synthesized SFX + ambient music
- `src/context/GameContext.jsx` — Global game state (progress, achievements, interstitials, audio sync)
- `src/screens/` — HomeScreen, LevelSelectScreen, LevelScreen, CompletionScreen, DailyChallengeScreen, AchievementsScreen
- `src/components/GameGrid.jsx` — Core game grid (SVG beam overlay + DOM cells)
- `src/components/HintModal.jsx` — Hint system UI (use hints or watch ad)
- `src/components/InterstitialAd.jsx` — Simulated interstitial ad (5s countdown, premium users skip)
- `src/components/AchievementToast.jsx` — Toast notification for achievement unlocks
- `src/components/SettingsModal.jsx` — Settings (music/SFX sliders, haptics, notifications, reduced motion)

## MVP Features Implemented

### Core Gameplay
- Laser raycasting with `/` and `\` mirror reflection rules
- 0.75-second crystal contact delay before completion triggers
- Star rating: 3★ = perfectMoves, 2★ = optimalMoves, 1★ = any completion
- Move limits on levels 11–30 with "moves left" counter (warning color near limit)
- Move limit exceeded banner + max 1★ enforcement

### Progression
- 30 levels across 4 packs (Tutorial, Refraction, Prism, Singularity)
- 14 rotating daily challenge puzzles with streak tracking
- Stars/coins persisted to localStorage

### Audio (Web Audio API — synthesized, no files needed)
- Mirror rotate: brief frequency-drop square wave
- Mirror place: noise click burst
- Crystal hit: bell chord (880/1100/1320/1760 Hz)
- Level complete fanfare: ascending triangle arpeggio (scales with stars)
- Star reveal: frequency-glide sine
- Achievement unlock: ascending piano chord
- Ambient laser hum: sawtooth + lowpass filter (active while crystal is hit)
- Ambient music: randomized sine tone cluster on home/level-select screens
- Settings sliders control musicVolume and sfxVolume in real-time

### Monetization
- Hint system: 3 free hints, earn more via rewarded ad (simulated) or premium
- Interstitial ads: shown every 3–5 completed levels for free users (simulated, 5s countdown)
- Premium IAP ($3.99): removes ads, grants +10 hints, unlocks premium badge

### Achievements (30 total)
- Progression milestones (complete 1/5/10/15/25/30 levels)
- Star mastery (any 3★, 5/10/20/30 three-star levels)
- Streak milestones (3/7/14/30 days)
- Coins earned (50/200/500)
- Daily challenge completion (1/5/14 challenges)
- Pack completion (all 4 packs)
- Premium unlock, hint usage, and session speed achievements
- Toast notification on unlock, queued if multiple fire at once

### Daily Streaks & Rewards
- Streak milestone rewards at 3/7/14/30 days (+50/100/200/500 coins)
- Claimable via "Claim" button on Daily Challenge screen
- Claimed state persisted; can only claim each milestone once

### Sharing
- One-tap share on completion screen (Web Share API with clipboard fallback)

### Accessibility
- Reduced Motion toggle in Settings (disables confetti + transition animations)
- All touch targets ≥ 40px
- Dismissible tutorial bar for first 7 levels

### PWA
- `public/manifest.json` for installability
- `public/icon-192.png` and `public/icon-512.png` generated (neon diamond on dark bg)
- Apple mobile web app meta tags
- Portrait-locked mobile viewport

## Reflection Rules

- `/` mirror: right→up, down→left, left→down, up→right
- `\` mirror: right→down, down→right, left→up, up→left

## Level Packs

1. **Tutorial** (levels 1–10): No move limits, 5×5–6×6 grids, animated tutorial tips
2. **Refraction** (levels 11–20): Move limits introduced, 6×6–7×7 grids
3. **Prism** (levels 21–25): Multiple blockers, 7×7 grids
4. **Singularity** (levels 26–30): Expert difficulty, strict limits

## Dev Server

```bash
npm run dev  # runs on port 5000
```
