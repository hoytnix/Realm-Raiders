// ==========================================
// ASTRONOMICAL SEASONS
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
