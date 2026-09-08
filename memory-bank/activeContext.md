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
- **Mobile-First Tactical Viewport Overhaul (375px+ Enhancements)**:
  - **Edge-to-Edge Parchment**: Collapsed desktop armrests and wooden table padding on `<md` screens to provide full 100% viewport parchment real estate.
  - **Collapsible Bottom Sheet (`BuildingInspector`)**: Converted static bottom drawer into a swipeable 48px peek bottom sheet on mobile that expands on tap/swipe up.
  - **Pinch-to-Zoom & Pan (`CitadelSvgGrid`)**: Added native two-finger pinch zoom (0.8x-2.5x) and single-finger pan with floating "Recenter Citadel" compass button.
  - **2-Row Responsive HUD (`MonarchHeader`, `ResourceBar`)**: Compact monarch badge, condensed chronometer (`D{day} • {HH}:{MM}`), and horizontally scrollable resource ticker with compact number notation.
  - **Thumb-Zone Bottom Navigation (`MobileBottomNav`)**: Docked bottom bar with Citadel, War, Chronicle, and Vault tabs, plus raised contextual center FAB (Claim All / Upgrade / Seal).
  - **Gestural "Sweep-to-Harvest" & "Claim All"**: Continuous drag across ready plots collects yields; added batch `handleHarvestAll` and floating Claim All seal button.
  - **Gyroscope Parallax (`useDeskTilt`)**: Integrated `DeviceOrientationEvent` with smoothed interpolation for mobile tilt.
  - **Web Vibration API (`haptics`)**: Added tactile feedback for selections (10ms), harvests (20-40ms double-pulse), and decrees/strikes (50ms).
  - **Compact Crisis Pill (`FamineWarning`)**: Replaced overflowing banner on mobile with a pulsing crisis pill and interactive dropdown modal with "Raid for Grain" CTA.
  - **Full-Screen Parchment Folios**: Modals render as full-screen slide-up sheets with safe-area insets (`env(safe-area-inset-bottom)`) and 48px+ touch targets.
- Build integrity validated via `pnpm run build` producing clean static output in `dist/` in ~2.0s.

## Active Focus & Next Steps
- Push or link repository to Netlify for continuous static deployment.
- Continue verifying balance tuning across the 4 asymmetric factions and 7-day seasonal shifts.
- Explore procedural ambient audio additions (rain, wind, blizzard synthesizer nodes) within `SoundController`.
