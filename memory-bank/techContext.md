# Tech Context: Realm Raiders

## Technology Stack
- **Framework**: React 18+ (Hooks: `useState`, `useEffect`, `useRef`, `useMemo`, `useCallback`)
- **Styling**: Tailwind CSS (amber/stone/red palette, parchment styling, custom drop shadows, backdrops)
- **Audio Synthesis**: Native Web Audio API (`AudioContext`, `OscillatorNode`, `GainNode`) - 100% procedurally generated, 0 external audio dependencies
- **Graphics**: Scalable Vector Graphics (SVG) with mathematical isometric transformations
- **Persistence**: Browser `localStorage` under key `realmraid_parchment_v1`
- **Data Model**:
  - `resources`: `{ food, water, wood, stone, flora, gold }`
  - `buildings`: `{ keep, granary, well, lumber, quarry, greenhouse, vault, watchtower }`
  - `factions`: `humans`, `orcs`, `elves`, `dwarves`
  - `seasons`: `spring`, `summer`, `autumn`, `winter`
  - `weather`: `clear`, `downpour`, `heatwave`, `blizzard`
