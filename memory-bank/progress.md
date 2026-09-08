# Progress: Realm Raiders

## Completed Features
- [x] Diegetic Web Audio Synthesizer (`SoundController` with coin, wax seal, dagger, impact, launch, upgrade soundscapes).
- [x] Asymmetric Faction Archetypes (Humans, Orcs, Elves, Dwarves) with customized perks and multipliers.
- [x] 8 Core Buildings (Keep, Granary, Well, Lumber, Quarry, Greenhouse, Vault, Watchtower) with upgrades and cycle yields.
- [x] 2.5D Isometric SVG Settlement Map with interactive building inspector and hot wax seal stamping.
- [x] Astrological Chronometer & Weather Engine (Day/night cycle, 4 seasons rotating every 7 days, 4 weather types, speed accelerator).
- [x] War Council & Blood Feud Board with dynamic rival generation (`generateRivals`) and Revenge Ledger tracking.
- [x] 15-second Rewarded Ad Gate Modal with countdown timer and dev-skip.
- [x] 2.5D Catapult Siege Minigame with 3 stone munitions, structure targeting, and loot doubling option.
- [x] Kingdom Chronicles Tome archiving siege breaches and defenses.
- [x] LocalStorage persistence (`realmraid_parchment_v1`) with deterministic offline catchup calculation.
- [x] Architectural Mandate (`GEMINI.md`) and 6-file Memory Bank initialized.
- [x] Epic `README.md` authored with exhaustive diegetic documentation, architecture diagrams, and system specs.
- [x] **Monolithic Component Modularization**:
  - [x] Extracted game loops, tick clock, weather rotation, upkeep, and persistence into `useGameState`.
  - [x] Extracted derived ratings, caps, and vault protections into `usePlayerStats`.
  - [x] Extracted parallax tilt, cursor tracking, and wax splats into `useDeskTilt`.
  - [x] Extracted siege catapult strikes, countdown timer, and loot doubling into `useRaidBattle`.
  - [x] Decomposed UI into `src/components/{common, hud, desk, citadel, combat, chronicle, menu, onboarding}`.
  - [x] Centralized constants and config schemas in `src/constants/`.
  - [x] Reduced root `App.jsx` from 2538 lines down to a clean ~160-line orchestrator.
- [x] **Netlify SPA Build Scaffolding & Tooling**:
  - [x] Added `package.json` with React 18, Vite 5, Tailwind CSS, PostCSS, Autoprefixer, and build/dev scripts.
  - [x] Added `index.html` entry point with diegetic medieval typography and root container.
  - [x] Added `index.jsx` and `index.css` (with parchment scrollbar stylings and Tailwind directives).
  - [x] Added `vite.config.js`, `tailwind.config.js`, `postcss.config.js`.
  - [x] Added `netlify.toml` and `public/_redirects` for Netlify static SPA hosting and route redirects.
  - [x] Migrated project to `pnpm` exclusively, configured build approvals, and updated `GEMINI.md`.
- [x] **Mobile-First Tactical Viewport Enhancements (375px+ Portrait)**:
  - [x] Edge-to-Edge Parchment layout collapsing ambient armrests & desk padding below 768px.
  - [x] Swipeable & expandable 48px peek bottom sheet for `BuildingInspector`.
  - [x] Native 2-finger pinch-to-zoom (0.8x-2.5x) and 1-finger pan with floating "Recenter Citadel" compass button in `CitadelSvgGrid`.
  - [x] 2-row mobile HUD with condensed chronometer (`D{day} • {HH}:{MM}`) and horizontally scrollable resource ticker.
  - [x] Ergonomic thumb-zone bottom navigation bar (`MobileBottomNav`) with context-sensitive FAB.
  - [x] Gestural "Sweep-to-Harvest" drag-and-collect and floating "Claim All" seal button.
  - [x] Gyroscope parallax support via `DeviceOrientationEvent` in `useDeskTilt`.
  - [x] Web Vibration API tactile feedback (`haptics.light`, `haptics.harvest`, `haptics.heavy`).
  - [x] Compact crisis pill & interactive dropdown modal for famine alerts.
  - [x] Full-screen slide-up parchment folios with safe-area insets and 48px+ touch targets.

## Planned / In Progress
- [ ] Additional sound synthesizers (ambient wind, rain, blizzard noise nodes).
- [ ] Expanded battle animations (projectile arcs and particle debris on the SVG canvas).
