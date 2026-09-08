# System Patterns: Realm Raiders

## Architectural Hierarchy & Modular Structure
The application employs a modular React architecture adhering to the Single Responsibility Principle (SRP) and DRY conventions, orchestrated by `App.jsx`:

### 1. Root Orchestrator (`App.jsx`)
- Pure orchestrator coordinating custom React hooks (`useGameState`, `usePlayerStats`, `useDeskTilt`, `useRaidBattle`).
- Renders top-level layout layers: Background Arch, Monarch Header HUD, Heavy Oak Desk Surface, Central Living Parchment Viewport, Throne Armrests Footer, and Active Modals.
- Retains clean re-exports of constants and audio controllers for backward compatibility.

### 2. State & Logic Custom Hooks (`src/hooks/`)
- `useGameState.js`: Root state persistence (`STORAGE_KEY = 'realmraid_parchment_v1'`), offline catchup computation, 1000ms simulation loop (clock, weather roll, 7-day seasonal rotation, upkeep attrition, harvest timers), speed toggles, building harvest collection, wax decree upgrades, and kingdom rebirth.
- `usePlayerStats.js`: Pure memoized derivation of player faction multipliers, production limits (`caps`), deep vault protection ratios, attack power, defense power, and overall rating.
- `useDeskTilt.js`: Pointer parallax calculations across desk layers, wax stamp cursor tracking, and ephemeral wax splat animations.
- `useRaidBattle.js`: Catapult siege state, 15-second rewarded ad flow countdown, 3-strike munition management, structure plunder calculations, and double loot doubling.

### 3. Component Architecture (`src/components/`)
- **`common/`**: Reusable diegetic UI primitives:
  - `WaxStampCursor.jsx`: Cursor-following monarch seal stamp.
  - `WaxSplats.jsx`: Ping-animated crimson wax seal splashes.
  - `ResourcePill.jsx`: Gilded resource badges with dynamic upkeep rates.
  - `StatBadge.jsx`: Multi-variant status tags.
  - `Modal.jsx`: Parchment-themed modal dialog container.
- **`hud/`**: Diegetic status headers:
  - `RealmChronometerHUD.jsx`: Astronomical chronometer with day/night orb, weather indicators, and 1x/2x/5x speed controls.
  - `ResourceBar.jsx`: Horizontal banner tracking all 6 resources against storage caps.
  - `FamineWarning.jsx`: Urgent crimson pulse alert on sustenance exhaustion.
  - `MonarchHeader.jsx`: Unified status bar uniting chronometer, mute toggle, and resources.
- **`desk/`**: Throne room physical environment:
  - `ThroneRoomBackground.jsx`: Masonry arches, stained glass rose window, sconces, and parallax god-rays.
  - `DeskSurface.jsx`: Heavy oak table surface with iron corner braces, sustenance horn, and treasury strongbox.
  - `ParchmentHeader.jsx`: Scroll header and hamburger menu toggle button.
  - `ThroneArmrests.jsx`: Armrests with monarch signet ring and war dagger shortcut.
- **`citadel/`**: 2.5D Isometric Cartography:
  - `CitadelSvgGrid.jsx`: Isometric ground mesh, animated aqueduct pulses, 2.5D building facets, harvest progress rings, and click-to-collect flags.
  - `BuildingInspector.jsx`: Lower parchment drawer with structure details, resource costs, and royal decree upgrade stamping.
  - `ParchmentCitadelMap.jsx`: Citadel view container with dynamic weather tint overlays and atmospheric particles.
- **`combat/`**: Asynchronous PvP & Catapult Siege:
  - `ParchmentWarCouncil.jsx`: Rival encampments within ±7% rating and Intercepted Retaliation Blood Feud board.
  - `RewardedAdGateModal.jsx`: 15-second scout sponsorship transmission countdown with dev-skip.
  - `ParchmentRaidBattlefieldModal.jsx`: 2.5D interactive catapult siege canvas with 3 munition strikes, structural targeting, and loot doubling.
- **`chronicle/`**: Historical Ledger:
  - `ParchmentChronicleTome.jsx`: Scribe archives chronicling victories, perimeter breaches, and citadel rebirth.
- **`menu/`**: Grand Realm Directory:
  - `ParchmentMenuView.jsx`: Royal directory with quick travel cards, faction doctrines, and deep vault audit.
- **`onboarding/`**: Initial Allegiance Selection:
  - `ThroneRoomOnboarding.jsx`: Lore cards presenting the 4 asymmetric factions and ascension trigger.

### 4. Configuration & Constants (`src/constants/`)
- `audio.js`: Procedural Web Audio `SoundController` and `sounds` singleton.
- `seasons.js`: 4 rotating seasons (`SEASONS`, `SEASON_ORDER`).
- `weather.js`: Dynamic weather states and precipitation tints (`WEATHER_CONDITIONS`, `WEATHER_POOL`).
- `factions.js`: Asymmetric lore and multipliers (`FACTIONS` - Humans, Orcs, Elves, Dwarves).
- `buildings.js`: 8 core structures (`BUILDINGS`).
- `initialState.js`: `DEFAULT_STATE` schema and `STORAGE_KEY`.
- `isometric.js`: 2.5D projection formula (`ISO_W = 68`, `ISO_H = 34`, `gridToParchmentIso`).

### 5. Utilities (`src/utils/`)
- `rivals.js`: Matchmaking target generator (`generateRivals`).
