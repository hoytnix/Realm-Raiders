// ==========================================
// METEOROLOGY & WEATHER CONDITIONS
// ==========================================
export const WEATHER_CONDITIONS = {
  clear: {
    id: 'clear',
    name: 'Temperate Skies',
    icon: '🌤️',
    tint: 'rgba(245, 158, 11, 0.08)',
    multipliers: { food: 1.0, water: 1.0, wood: 1.0, stone: 1.0, flora: 1.0, gold: 1.0, raidAtk: 1.0 }
  },
  downpour: {
    id: 'downpour',
    name: 'Monsoon Deluge',
    icon: '🌧️',
    tint: 'rgba(14, 116, 144, 0.20)',
    multipliers: { food: 1.1, water: 1.7, wood: 0.8, stone: 0.8, flora: 1.4, gold: 0.9, raidAtk: 0.85 }
  },
  heatwave: {
    id: 'heatwave',
    name: 'Scorching Drought',
    icon: '🔥',
    tint: 'rgba(194, 65, 12, 0.22)',
    multipliers: { food: 0.75, water: 0.5, wood: 1.15, stone: 1.2, flora: 0.7, gold: 1.0, raidAtk: 1.1 }
  },
  blizzard: {
    id: 'blizzard',
    name: 'Biting Gale',
    icon: '🌨️',
    tint: 'rgba(224, 242, 254, 0.25)',
    multipliers: { food: 0.6, water: 0.7, wood: 0.75, stone: 1.2, flora: 0.5, gold: 0.85, raidAtk: 0.75 }
  }
};

export const WEATHER_POOL = ['clear', 'downpour', 'heatwave', 'blizzard'];
