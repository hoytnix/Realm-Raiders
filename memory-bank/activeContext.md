# Active Context: Realm Raiders

## Current State
- Successfully refactored the monolithic 2538-line `App.jsx` into a clean, DRY, modular React architecture:
  - **Core Orchestrator**: `App.jsx` now serves purely as root coordinator (~160 lines).
  - **Custom Hooks**: Extracted `useGameState`, `usePlayerStats`, `useDeskTilt`, and `useRaidBattle` into `src/hooks/`.
  - **UI & Layout Primitives**: Extracted reusable components into `src/components/common/`, `src/components/hud/`, `src/components/desk/`, `src/components/citadel/`, `src/components/combat/`, `src/components/chronicle/`, `src/components/menu/`, and `src/components/onboarding/`.
  - **Centralized Constants**: Moved audio synthesis (`SoundController`), factions, buildings, seasons, weather, isometric projection math, and initial state schemas into `src/constants/` with index barrels.
  - **Procedural Utilities**: Created `src/utils/rivals.js` for War Council matchmaking generation.
- Preserved 100% of existing functionality, mechanics, styling, and visual behavior.
- Build integrity validated via syntax checks and esbuild compilation.

## Active Focus & Next Steps
- Continue verifying balance tuning across the 4 asymmetric factions and 7-day seasonal shifts.
- Explore procedural ambient audio additions (rain, wind, blizzard synthesizer nodes) within `SoundController`.
