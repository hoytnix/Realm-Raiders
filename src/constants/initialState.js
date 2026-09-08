export const CURRENT_SAVE_VERSION = 1;
export const MIN_COMPATIBLE_SAVE_VERSION = 1;
// ==========================================
// STORAGE KEY & INITIAL GAME STATE SCHEMA
// ==========================================
export const STORAGE_KEY = 'realmraid_parchment_v1';
export function createDefaultGrid() {
  const INITIAL_PLOT_BUILDINGS = {
    'plot-1-1': 'keep'
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
export const VILLAGER_NAMES = ['Aldous the Miller', 'Osric the Bold', 'Roland Stonehand', 'Cedric of the Vale', 'Beatrice Weaver', 'Isolde Rivers', 'Godwin Oakheart', 'Elowen Greenleaf', 'Dunstan the Smith', 'Rowena Fletcher', 'Gareth the Stout', 'Maeve Far-Strider', 'Kendrick Pike', 'Anselm Wright', 'Hilda of Ironpeak', 'Wulfric Ironvein'];
export const DEFAULT_VILLAGERS = [{
  id: 'vil_1',
  name: 'Aldous the Miller',
  role: 'Farming',
  assignedBuildingId: null,
  morale: 100
}, {
  id: 'vil_2',
  name: 'Osric the Bold',
  role: 'Soldier',
  assignedBuildingId: null,
  morale: 100
}, {
  id: 'vil_3',
  name: 'Cedric of the Vale',
  role: 'Forestry',
  assignedBuildingId: null,
  morale: 100
}, {
  id: 'vil_4',
  name: 'Isolde Rivers',
  role: 'Waterbearing',
  assignedBuildingId: null,
  morale: 100
}];
export const DEFAULT_STATE = {
  faction: null,
  territoryTier: 1,
  troops: {
    total: 0,
    maxCapacity: 30,
    sustenanceUpkeepPerDay: 1
  },
  villagers: DEFAULT_VILLAGERS,
  resources: {
    gold: 60,
    food: 75,
    water: 150,
    wood: 40,
    stone: 20,
    flora: 15
  },
  waterCap: 300,
  buildings: {
    keep: 1,
    granary: 0,
    well: 0,
    lumber: 0,
    quarry: 0,
    greenhouse: 0,
    vault: 0,
    watchtower: 0,
    farm: 0,
    barracks: 0
  },
  grid: createDefaultGrid(),
  harvestTimers: {
    'plot-1-1': 0
  },
  timeState: {
    day: 1,
    month: 9,
    monthName: 'Harvestide (September)',
    year: 26,
    era: 'ADX',
    hour: 6,
    minute: 0,
    seasonIndex: 2,
    weather: 'autumn_breeze',
    timeSpeed: 1
  },
  chronometer: {
    day: 1,
    month: 9,
    monthName: 'Harvestide (September)',
    year: 26,
    era: 'ADX',
    hour: 6,
    minute: 0
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
  revengeLedger: [{
    id: 'rev-1',
    rivalName: 'Warlord Grashnak',
    rivalFaction: 'orcs',
    stolen: {
      gold: 85,
      food: 110,
      stone: 45
    },
    timestamp: Date.now() - 3600000 * 2.8,
    revenged: false
  }, {
    id: 'rev-2',
    rivalName: 'Archmage Zephyr',
    rivalFaction: 'elves',
    stolen: {
      flora: 70,
      water: 95
    },
    timestamp: Date.now() - 3600000 * 6.5,
    revenged: true
  }],
  battleLogs: [{
    id: 'log-1',
    title: 'Perimeter Breached at Sundown',
    text: 'Warlord Grashnak catapulted outer silos, plundering 85 Gold & 110 Food.',
    type: 'loss',
    timestamp: Date.now() - 3600000 * 2.8
  }, {
    id: 'log-2',
    title: 'Ballista Bastion Repelled Scouts',
    text: 'Manned towers pinned down an elven raiding vanguard. Recovered 45 defensive scrap.',
    type: 'win',
    timestamp: Date.now() - 3600000 * 5.2
  }],
  lastTickTimestamp: Date.now(),
  incomingRaid: null,
  raidCooldown: 300,
  truceOfFoundations: true,
  impendingRaid: null
};
export const INITIAL_STATE = {
  saveVersion: CURRENT_SAVE_VERSION
};