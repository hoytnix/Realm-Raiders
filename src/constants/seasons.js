// ==========================================
// ASTRONOMICAL SEASONS & REALM CALENDAR
// ==========================================
export const SEASONS = {
  spring: {
    id: 'spring',
    name: 'Verdant Thaw',
    icon: '🌸',
    color: 'text-emerald-400',
    description: '+30% Flora & Aquifer Yields, +15% Upkeep demand',
    multipliers: { food: 1.1, water: 1.3, wood: 1.0, stone: 0.9, flora: 1.3, gold: 1.0, upkeep: 1.15 }
  },
  summer: {
    id: 'summer',
    name: 'Sunfire Solstice',
    icon: '☀️',
    color: 'text-amber-400',
    description: '+25% Grain & Timber, +40% Water Evaporation/Upkeep',
    multipliers: { food: 1.25, water: 0.7, wood: 1.25, stone: 1.0, flora: 1.1, gold: 1.1, upkeep: 1.4 }
  },
  autumn: {
    id: 'autumn',
    name: 'Golden Harvest',
    icon: '🍂',
    color: 'text-orange-400',
    description: '+35% Food & Bullion minting, +15% Catapult Raid Spoils',
    multipliers: { food: 1.35, water: 1.0, wood: 1.1, stone: 1.1, flora: 0.9, gold: 1.35, upkeep: 1.0 }
  },
  winter: {
    id: 'winter',
    name: 'Frostveil Eclipse',
    icon: '❄️',
    color: 'text-sky-300',
    description: '-30% Agriculture, +35% Granite Masonry & Deep Vault fortification',
    multipliers: { food: 0.7, water: 0.8, wood: 0.85, stone: 1.35, flora: 0.6, gold: 0.9, upkeep: 1.25 }
  }
};

export const SEASON_ORDER = ['spring', 'summer', 'autumn', 'winter'];

export const DAYS_PER_MONTH = 30;

export const REALM_MONTHS = {
  1: { id: 1, name: 'Frostfall (January)', shortName: 'Frostfall', season: 'winter', seasonIndex: 3 },
  2: { id: 2, name: 'Deeprime (February)', shortName: 'Deeprime', season: 'winter', seasonIndex: 3 },
  3: { id: 3, name: 'Verdant Thaw (March)', shortName: 'Verdant Thaw', season: 'spring', seasonIndex: 0 },
  4: { id: 4, name: 'Bloomtide (April)', shortName: 'Bloomtide', season: 'spring', seasonIndex: 0 },
  5: { id: 5, name: 'Blossomveil (May)', shortName: 'Blossomveil', season: 'spring', seasonIndex: 0 },
  6: { id: 6, name: 'Solstice Sun (June)', shortName: 'Solstice Sun', season: 'summer', seasonIndex: 1 },
  7: { id: 7, name: 'Sunfire (July)', shortName: 'Sunfire', season: 'summer', seasonIndex: 1 },
  8: { id: 8, name: 'Amberheat (August)', shortName: 'Amberheat', season: 'summer', seasonIndex: 1 },
  9: { id: 9, name: 'Harvestide (September)', shortName: 'Harvestide', season: 'autumn', seasonIndex: 2 },
  10: { id: 10, name: 'Leafveil (October)', shortName: 'Leafveil', season: 'autumn', seasonIndex: 2 },
  11: { id: 11, name: 'Frostveil (November)', shortName: 'Frostveil', season: 'autumn', seasonIndex: 2 },
  12: { id: 12, name: 'Winterdark (December)', shortName: 'Winterdark', season: 'winter', seasonIndex: 3 }
};
