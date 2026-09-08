// ==========================================
// STORAGE KEY & INITIAL GAME STATE SCHEMA
// ==========================================
export const STORAGE_KEY = 'realmraid_parchment_v1';

export function createDefaultGrid() {
  const INITIAL_PLOT_BUILDINGS = {
    'plot-1-1': 'keep',
    'plot-0-1': 'granary',
    'plot-2-1': 'well',
    'plot-0-2': 'lumber',
    'plot-1-2': 'farm',
    'plot-2-2': 'quarry',
    'plot-1-3': 'greenhouse',
    'plot-3-1': 'vault',
    'plot-2-0': 'watchtower'
  };

  const grid = [];
  for (let gx = 0; gx < 6; gx++) {
    for (let gy = 0; gy < 6; gy++) {
      const id = `plot-${gx}-${gy}`;
      const buildingId = INITIAL_PLOT_BUILDINGS[id] || null;
      grid.push({
        id,
        gx,
        gy,
        buildingId,
        level: buildingId ? 1 : 0
      });
    }
  }
  return grid;
}

export const DEFAULT_STATE = {
  faction: null,
  territoryTier: 1,
  troops: {
    total: 20,
    maxCapacity: 30,
    sustenanceUpkeepPerDay: 1
  },
  resources: {
    gold: 400,
    food: 450,
    water: 350,
    wood: 250,
    stone: 150,
    flora: 120
  },
  buildings: {
    keep: 1,
    granary: 1,
    well: 1,
    lumber: 1,
    quarry: 1,
    greenhouse: 1,
    vault: 1,
    watchtower: 1,
    farm: 1,
    barracks: 0
  },
  grid: createDefaultGrid(),
  harvestTimers: {
    granary: 20,
    farm: 20,
    well: 0,
    lumber: 20,
    quarry: 0,
    greenhouse: 0,
    vault: 0,
    'plot-1-2': 20,
    'plot-0-2': 20,
    'plot-0-1': 20
  },
  timeState: {
    day: 1,
    month: 9,
    monthName: 'Harvestide (September)',
    year: 26,
    era: 'ADX',
    hour: 8,
    minute: 0,
    seasonIndex: 2,
    weather: 'autumn_breeze',
    timeSpeed: 1
  },
  settings: {
    masterAudio: true,
    ambientAudio: true,
    sfxAudio: true,
    hapticsEnabled: true,
    ambientVolume: 0.5,
    sfxVolume: 0.8
  },
  technologies: [],
  currentResearch: null,
  brambleShieldActive: false,
  soilFertilityBonus: 0,
  population: 14,
  garrison: 8,
  totalRaidsWon: 0,
  totalRaidsDefended: 0,
  revengeLedger: [
    {
      id: 'rev-1',
      rivalName: 'Warlord Grashnak',
      rivalFaction: 'orcs',
      stolen: { gold: 85, food: 110, stone: 45 },
      timestamp: Date.now() - 3600000 * 2.8,
      revenged: false
    },
    {
      id: 'rev-2',
      rivalName: 'Archmage Zephyr',
      rivalFaction: 'elves',
      stolen: { flora: 70, water: 95 },
      timestamp: Date.now() - 3600000 * 6.5,
      revenged: true
    }
  ],
  battleLogs: [
    {
      id: 'log-1',
      title: 'Perimeter Breached at Sundown',
      text: 'Warlord Grashnak catapulted outer silos, plundering 85 Gold & 110 Food.',
      type: 'loss',
      timestamp: Date.now() - 3600000 * 2.8
    },
    {
      id: 'log-2',
      title: 'Ballista Bastion Repelled Scouts',
      text: 'Manned towers pinned down an elven raiding vanguard. Recovered 45 defensive scrap.',
      type: 'win',
      timestamp: Date.now() - 3600000 * 5.2
    }
  ],
  lastTickTimestamp: Date.now()
};
