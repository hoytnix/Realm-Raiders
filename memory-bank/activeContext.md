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
- **Constructible Plots, Dynamic Territory Expansion & Demographic Famine Mortality**:
  - **Constructible Plots & Catalog (`src/constants/buildings.js`)**: Added `EMPTY_PLOT`, `CONSTRUCTIBLE_BLUEPRINTS`, and new constructible blueprints (`farm`, `barracks`), each specifying `laborRequired`, costs, max tier, and capacities.
  - **Dynamic Territory Expansion (`src/constants/isometric.js`)**: Defined `TERRITORY_TIERS` (Tier 1: 4x4 Core, Tier 2: 5x5 Baileys, Tier 3: 6x6 Imperial Marches) with gold/wood/stone annexation costs and Keep level prerequisites. Added `isPlotAnnexed` and boundary fog lines with lock icons.
  - **Troop Demographics & Famine Mortality Engine (`src/constants/initialState.js`, `src/hooks/useGameState.js`, `src/hooks/usePlayerStats.js`)**:
    - Introduced `troops: { total: 20, maxCapacity: 30, sustenanceUpkeepPerDay: 1 }` and `grid: createDefaultGrid()`.
    - Replaced arbitrary 50% famine harvest penalty with organic labor saturation: `Labor Efficiency = min(1.0, Living Troops / Required Labor)` with an 8% safety floor to prevent NaN/0 lockouts.
    - Implemented starvation casualties when sustenance hits zero during day transitions (10% troop mortality per cycle), chronologically logged in battle logs.
    - Added `trainTroops(count)` at the Barracks and `expandTerritory()` at the Royal Keep.
  - **Interactive Citadel & Inspector (`CitadelSvgGrid.jsx`, `BuildingInspector.jsx`)**:
    - Foundation tiles render with dashed parchment diamonds and `+` markers.
    - Selecting empty foundation opens "Architectural Commission" carousel to erect structures.
    - Barracks inspector includes levy recruitment controls.
    - Royal Keep inspector includes territory annexation decree card.
    - Famine warning HUD reports dynamic troop casualties and active labor saturation percentage.

## Active Focus & Next Steps
- Push or link repository to Netlify for continuous static deployment.
- Continue verifying balance tuning across the 4 asymmetric factions and 7-day seasonal shifts.
- Explore procedural ambient audio additions (rain, wind, blizzard synthesizer nodes) within `SoundController`.
