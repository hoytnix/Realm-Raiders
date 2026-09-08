# Active Context: Realm Raiders

## Current State
- Successfully refactored the monolithic 2538-line `App.jsx` into a clean, DRY, modular React architecture:
  - **Core Orchestrator**: `App.jsx` now serves purely as root coordinator (~160 lines).
  - **Custom Hooks**: Extracted `useGameState`, `usePlayerStats`, `useDeskTilt`, and `useRaidBattle` into `src/hooks/`.
  - **UI & Layout Primitives**: Extracted reusable components into `src/components/common/`, `src/components/hud/`, `src/components/desk/`, `src/components/citadel/`, `src/components/combat/`, `src/components/chronicle/`, `src/components/menu/`, and `src/components/onboarding/`.
  - **Centralized Constants**: Moved audio synthesis (`SoundController`), factions, buildings, seasons, weather, isometric projection math, and initial state schemas into `src/constants/` with index barrels.
  - **Procedural Utilities**: Created `src/utils/rivals.js` for War Council matchmaking generation.
- **Netlify & Modern SPA Scaffolding Configured**:
  - `package.json`: Configured with React 18, Vite 5, Tailwind CSS, PostCSS, Autoprefixer, and build/dev scripts.
  - `index.html`: Modern SPA entry point with viewport scaling, Cinzel & MedievalSharp typography, and `#root`.
  - `index.jsx` & `index.css`: React 18 DOM mount point and Tailwind base/component/utility layers with diegetic parchment scrollbars.
  - `vite.config.js`, `tailwind.config.js`, `postcss.config.js`: Bundling and design token compilation pipeline.
  - `netlify.toml` & `public/_redirects`: Netlify auto-deployment configuration with SPA redirect rules and security headers.
  - Enforced `pnpm` exclusively across all project configurations and `GEMINI.md`.
- Build integrity validated via `pnpm run build` producing clean static output in `dist/`.

## Active Focus & Next Steps
- Push or link repository to Netlify for continuous static deployment.
- Continue verifying balance tuning across the 4 asymmetric factions and 7-day seasonal shifts.
- Explore procedural ambient audio additions (rain, wind, blizzard synthesizer nodes) within `SoundController`.
