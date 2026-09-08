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

## Planned / In Progress
- [ ] Additional sound synthesizers (ambient wind, rain, blizzard noise nodes).
- [ ] Expanded battle animations (projectile arcs and particle debris on the SVG canvas).
