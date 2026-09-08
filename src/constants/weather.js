// ==========================================
// METEOROLOGY & SEASONAL WEATHER ENGINE
// ==========================================

export const WEATHER_CONDITIONS = {
  // Early Autumn / Autumn Weathers
  autumn_breeze: {
    id: 'autumn_breeze',
    name: 'Crisp Autumn Breeze',
    icon: '🍂',
    tint: 'rgba(217, 119, 6, 0.08)',
    multipliers: { food: 1.15, water: 1.0, wood: 1.1, stone: 1.0, flora: 0.95, gold: 1.1, raidAtk: 1.05 }
  },
  overcast: {
    id: 'overcast',
    name: 'Overcast Cloudcover',
    icon: '☁️',
    tint: 'rgba(120, 113, 108, 0.14)',
    multipliers: { food: 1.0, water: 1.05, wood: 1.0, stone: 1.0, flora: 1.05, gold: 0.95, raidAtk: 0.95 }
  },
  amber_rain: {
    id: 'amber_rain',
    name: 'Gentle Amber Rain',
    icon: '🌦️',
    tint: 'rgba(14, 116, 144, 0.16)',
    multipliers: { food: 1.1, water: 1.35, wood: 0.9, stone: 0.9, flora: 1.25, gold: 0.95, raidAtk: 0.9 }
  },
  mist: {
    id: 'mist',
    name: 'Morning Mist',
    icon: '🌫️',
    tint: 'rgba(148, 163, 184, 0.18)',
    multipliers: { food: 1.0, water: 1.15, wood: 1.0, stone: 1.0, flora: 1.2, gold: 1.0, raidAtk: 0.9 }
  },

  // Summer Weathers
  radiant_sun: {
    id: 'radiant_sun',
    name: 'Radiant Sun',
    icon: '☀️',
    tint: 'rgba(245, 158, 11, 0.10)',
    multipliers: { food: 1.1, water: 0.85, wood: 1.15, stone: 1.05, flora: 1.0, gold: 1.1, raidAtk: 1.05 }
  },
  heatwave: {
    id: 'heatwave',
    name: 'Sweltering Heat',
    icon: '🔥',
    tint: 'rgba(194, 65, 12, 0.22)',
    multipliers: { food: 0.75, water: 0.5, wood: 1.15, stone: 1.2, flora: 0.7, gold: 1.0, raidAtk: 1.1 }
  },
  thunderstorm: {
    id: 'thunderstorm',
    name: 'Summer Thunderstorm',
    icon: '⛈️',
    tint: 'rgba(30, 41, 59, 0.26)',
    multipliers: { food: 1.05, water: 1.6, wood: 0.75, stone: 0.8, flora: 1.3, gold: 0.85, raidAtk: 0.8 }
  },

  // Winter Weathers
  frost: {
    id: 'frost',
    name: 'Bitter Frost',
    icon: '❄️',
    tint: 'rgba(186, 230, 253, 0.20)',
    multipliers: { food: 0.7, water: 0.75, wood: 0.85, stone: 1.25, flora: 0.6, gold: 0.9, raidAtk: 0.85 }
  },
  flurries: {
    id: 'flurries',
    name: 'Gentle Flurries',
    icon: '🌨️',
    tint: 'rgba(224, 242, 254, 0.22)',
    multipliers: { food: 0.65, water: 0.75, wood: 0.8, stone: 1.2, flora: 0.55, gold: 0.9, raidAtk: 0.8 }
  },
  heavy_snow: {
    id: 'heavy_snow',
    name: 'Heavy Snow',
    icon: '☃️',
    tint: 'rgba(241, 245, 249, 0.26)',
    multipliers: { food: 0.6, water: 0.7, wood: 0.75, stone: 1.3, flora: 0.5, gold: 0.85, raidAtk: 0.75 }
  },
  blizzard: {
    id: 'blizzard',
    name: 'Whiteout Gale',
    icon: '🌬️',
    tint: 'rgba(224, 242, 254, 0.30)',
    multipliers: { food: 0.55, water: 0.65, wood: 0.7, stone: 1.35, flora: 0.45, gold: 0.8, raidAtk: 0.7 }
  },

  // Backward Compatibility / General Weathers
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
  }
};

// Weather intensity rating for transition dampening (0: clear/hot -> 5: violent storms/blizzards)
export const WEATHER_INTENSITY = {
  radiant_sun: 0,
  heatwave: 0,
  clear: 1,
  autumn_breeze: 1,
  overcast: 2,
  mist: 2,
  amber_rain: 3,
  downpour: 4,
  thunderstorm: 4,
  frost: 2,
  flurries: 3,
  heavy_snow: 4,
  blizzard: 5
};

// Month-Aware Weather Probability Distributions (1: Jan -> 12: Dec)
export const MONTH_WEATHER_PROBABILITIES = {
  // Winter Months: Bitter Frost, Flurries, Heavy Snow, Whiteout Gale
  1: { frost: 0.30, flurries: 0.30, heavy_snow: 0.25, blizzard: 0.15 },
  2: { frost: 0.30, flurries: 0.30, heavy_snow: 0.25, blizzard: 0.15 },
  12: { frost: 0.30, flurries: 0.30, heavy_snow: 0.25, blizzard: 0.15 },

  // Spring Months: Temperate, Showers, Mist, Overcast
  3: { clear: 0.35, amber_rain: 0.25, mist: 0.20, overcast: 0.20 },
  4: { clear: 0.40, amber_rain: 0.25, mist: 0.20, overcast: 0.15 },
  5: { clear: 0.45, radiant_sun: 0.20, amber_rain: 0.20, overcast: 0.15 },

  // Summer Months: Radiant Sun, Sweltering Heat, Summer Thunderstorm (0% freeze/snow)
  6: { radiant_sun: 0.50, heatwave: 0.30, thunderstorm: 0.20 },
  7: { radiant_sun: 0.45, heatwave: 0.35, thunderstorm: 0.20 },
  8: { radiant_sun: 0.45, heatwave: 0.35, thunderstorm: 0.20 },

  // September (Early Autumn, Month 9):
  // Crisp Autumn Breeze (40%), Overcast Cloudcover (25%), Gentle Amber Rain (20%), Morning Mist (15%). Snow/Blizzard 0%.
  9: { autumn_breeze: 0.40, overcast: 0.25, amber_rain: 0.20, mist: 0.15 },

  // Mid-to-Late Autumn
  10: { autumn_breeze: 0.35, overcast: 0.30, amber_rain: 0.20, mist: 0.15 },
  11: { autumn_breeze: 0.25, overcast: 0.30, amber_rain: 0.25, frost: 0.20 }
};

// Fallback pool for general queries
export const WEATHER_POOL = ['autumn_breeze', 'overcast', 'amber_rain', 'mist'];

/**
 * Calculates the next weather condition respecting:
 * 1. Month-weighted probabilities
 * 2. Transition dampening (smooth progression, no abrupt jumps like Torrential Rain -> Clear Sun)
 */
export function getNextWeather(currentWeatherId = 'autumn_breeze', month = 9) {
  const monthWeights = MONTH_WEATHER_PROBABILITIES[month] || MONTH_WEATHER_PROBABILITIES[9];
  const candidates = Object.keys(monthWeights);

  if (candidates.length === 0) return 'autumn_breeze';
  if (candidates.length === 1) return candidates[0];

  const currentIntensity = WEATHER_INTENSITY[currentWeatherId] ?? 1;

  // Calculate dampened weights based on difference in weather intensity
  const weightedCandidates = candidates.map(weatherKey => {
    const baseWeight = monthWeights[weatherKey] || 0;
    const targetIntensity = WEATHER_INTENSITY[weatherKey] ?? 1;
    const diff = Math.abs(currentIntensity - targetIntensity);

    // Transition dampening factor: closer intensity levels are favored
    // diff = 0 -> factor 1.0; diff = 1 -> factor 0.67; diff = 2 -> factor 0.4; diff >= 3 -> factor 0.2
    const dampening = 1 / (1 + diff * 0.5);

    // Bonus for continuity if currently in a valid month weather
    const continuityBonus = weatherKey === currentWeatherId ? 1.25 : 1.0;

    return {
      key: weatherKey,
      weight: baseWeight * dampening * continuityBonus
    };
  });

  const totalWeight = weightedCandidates.reduce((sum, c) => sum + c.weight, 0);
  if (totalWeight <= 0) return candidates[0];

  const roll = Math.random() * totalWeight;
  let accumulated = 0;
  for (const cand of weightedCandidates) {
    accumulated += cand.weight;
    if (roll <= accumulated) {
      return cand.key;
    }
  }

  return candidates[0];
}
