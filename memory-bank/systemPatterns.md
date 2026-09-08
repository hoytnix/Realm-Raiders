# System Patterns: Realm Raiders

## Architectural Hierarchy & Component Structure
The application currently centers on `App.jsx` with specialized sub-components rendered conditionally based on `deskView`:

- **Root State & Simulation Loop**:
  - Main state holder: `gameState` (`faction`, `resources`, `buildings`, `harvestTimers`, `timeState`, `population`, `garrison`, `revengeLedger`, `battleLogs`, `lastTickTimestamp`).
  - Derived statistics: `stats` (`upkeep`, `caps`, `vaultProtected`, `attackPower`, `defensePower`, `overallRating`).
  - 1000ms `setInterval` engine: advances time (speed-scaled), rolls weather changes, checks 7-day seasonal transitions, computes passive resource generation and upkeep depletion.

- **2.5D Isometric Math**:
  - `ISO_W = 68`, `ISO_H = 34`
  - Function: `gridToParchmentIso(gx, gy, originX, originY)`
  - Converts integer grid cells `(0..4, 0..4)` into SVG coordinate space `(x, y)` for both settlement cartography and raid battlefields.

- **Views & Modals**:
  1. `ThroneRoomOnboarding`: Initial faction selection (Humans, Orcs, Elves, Dwarves).
  2. `ParchmentCitadelMap`: Primary settlement builder view, isometric SVG grid, building inspector, wax seal decree upgrades.
  3. `RealmChronometerHUD`: Header widget tracking astrological time, sun/moon state, weather, and simulation speed.
  4. `ParchmentWarCouncil`: Matchmaking list, target generation (`generateRivals`), and blood feud revenge trigger.
  5. `ParchmentChronicleTome`: Historical archive of siege reports and reset button.
  6. `ParchmentMenuView`: Main navigational hub and settings directory.
  7. `RewardedAdGateModal`: 15-second scout contract countdown modal before raids (includes dev-skip).
  8. `ParchmentRaidBattlefieldModal`: 3-strike catapult assault minigame with loot doubling option.

- **Web Audio Procedural Synthesis (`SoundController`)**:
  - Single shared singleton `sounds` managing a browser `AudioContext`.
  - Pure procedural sound recipes using `createOscillator()` and `createGain()` with exponential ramps:
    - `playCoin`: Sine frequency sweep.
    - `playWaxSealThud`: Low triangle thud + sawtooth sizzle noise.
    - `playDaggerThrust`: Sawtooth downwards pitch ramp.
    - `playImpact`: Sub-bass triangle envelope.
    - `playLaunch`: Sine ascending sweep.
    - `playUpgrade`: Arpeggiated chime progression.
