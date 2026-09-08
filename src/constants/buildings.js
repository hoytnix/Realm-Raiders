// ==========================================
// CITADEL BUILDINGS DEFINITIONS & BLUEPRINTS
// ==========================================
export const BUILDINGS = {
  keep: {
    id: 'keep',
    name: 'Royal Keep',
    inkSymbol: '🏰',
    tag: 'Citadel Heart',
    description: 'Heart of the realm. Fortifies overall defense power and unlocks higher structural tiers and territory annexation decrees.',
    gx: 1, gy: 1,
    baseCost: { gold: 120, wood: 100, stone: 100 },
    costMult: 1.6,
    baseHp: 650,
    laborRequired: 4,
    maxTier: 20,
    type: 'core'
  },
  granary: {
    id: 'granary',
    name: 'Windmill & Granary',
    inkSymbol: '🌾',
    tag: 'Ration Silo',
    description: 'Cultivates grain crops and stores bread flour. Sustains realm population and standing garrison.',
    gx: 0, gy: 1,
    baseCost: { gold: 40, wood: 25, stone: 10 },
    costMult: 1.45,
    cycleDuration: 20,
    baseYield: { food: 55 },
    baseCapacity: 1200,
    baseHp: 280,
    laborRequired: 3,
    maxTier: 20,
    type: 'eco'
  },
  farm: {
    id: 'farm',
    name: 'Grain Acreage',
    inkSymbol: '🌿',
    tag: 'Agriculture',
    description: 'Expansive rye and barley acreage yielding regular harvests to sustain the citadel workforce.',
    gx: 2, gy: 3,
    baseCost: { gold: 35, wood: 15, stone: 0 },
    costMult: 1.4,
    cycleDuration: 20,
    baseYield: { food: 55 },
    baseCapacity: 800,
    baseHp: 220,
    laborRequired: 3,
    maxTier: 20,
    type: 'eco'
  },
  barracks: {
    id: 'barracks',
    name: 'War Garrison & Barracks',
    inkSymbol: '⚔️',
    tag: 'Military Quarters',
    description: 'Houses royal levies and trains valiant footmen to bolster defense and labor force.',
    gx: 3, gy: 2,
    baseCost: { gold: 75, wood: 60, stone: 50 },
    costMult: 1.5,
    defense: 25,
    troopCapacity: 20,
    baseHp: 450,
    laborRequired: 2,
    maxTier: 20,
    type: 'military'
  },
  well: {
    id: 'well',
    name: 'Spring Aqueduct',
    inkSymbol: '💧',
    tag: 'Aquifer',
    description: 'Pumps fresh spring aquifer water essential to ward off severe dehydration and mutinous unrest.',
    gx: 2, gy: 1,
    baseCost: { gold: 40, wood: 20, stone: 0 },
    costMult: 1.42,
    cycleDuration: 25,
    baseYield: { water: 25 },
    baseCapacity: 1200,
    baseHp: 260,
    laborRequired: 2,
    maxTier: 20,
    type: 'eco'
  },
  lumber: {
    id: 'lumber',
    name: 'Timber Mill',
    inkSymbol: '🪵',
    tag: 'Forester',
    description: 'Harvests sturdy timber used for siege engines, scaffolding, and perimeter palisades.',
    gx: 0, gy: 2,
    baseCost: { gold: 30, wood: 0, stone: 10 },
    costMult: 1.4,
    cycleDuration: 20,
    baseYield: { wood: 45 },
    baseCapacity: 1500,
    baseHp: 250,
    laborRequired: 4,
    maxTier: 20,
    type: 'resource'
  },
  quarry: {
    id: 'quarry',
    name: 'Granite Quarry',
    inkSymbol: '🪨',
    tag: 'Masonry',
    description: 'Chisels granite blocks to reinforce battlements and withstand enemy catapult bombardments.',
    gx: 2, gy: 2,
    baseCost: { gold: 50, wood: 30, stone: 0 },
    costMult: 1.45,
    cycleDuration: 35,
    baseYield: { stone: 30 },
    baseCapacity: 1500,
    baseHp: 320,
    laborRequired: 5,
    maxTier: 20,
    type: 'resource'
  },
  greenhouse: {
    id: 'greenhouse',
    name: 'Mystic Herbalist',
    inkSymbol: '🌱',
    tag: 'Alchemist',
    description: 'Nurtures moonlit flora used for alchemical healing salves, magical wards, and raid enhancements.',
    gx: 1, gy: 3,
    baseCost: { gold: 40, wood: 25, stone: 15 },
    costMult: 1.5,
    cycleDuration: 25,
    baseYield: { flora: 35 },
    baseCapacity: 800,
    baseHp: 220,
    laborRequired: 3,
    maxTier: 20,
    type: 'magic'
  },
  vault: {
    id: 'vault',
    name: 'Ironclad Vault',
    inkSymbol: '🪙',
    tag: 'Treasury',
    description: 'Mints golden crowns and keeps bullion safe beneath stone slabs during asynchronous pillage incursions.',
    gx: 3, gy: 1,
    baseCost: { gold: 100, wood: 80, stone: 110 },
    costMult: 1.55,
    cycleDuration: 20,
    baseYield: { gold: 65 },
    baseCapacity: 2000,
    baseHp: 420,
    laborRequired: 2,
    maxTier: 20,
    type: 'finance'
  },
  watchtower: {
    id: 'watchtower',
    name: 'Ballista Watchtower',
    inkSymbol: '🏹',
    tag: 'Perimeter Bastion',
    description: 'Manned bastion that automatically unleashes ballista bolts at invading warbands.',
    gx: 2, gy: 0,
    baseCost: { gold: 90, wood: 75, stone: 85 },
    costMult: 1.5,
    defense: 38,
    baseHp: 460,
    laborRequired: 2,
    maxTier: 20,
    type: 'military'
  }
};

export const EMPTY_PLOT = {
  id: 'empty_plot',
  name: 'Cleared Foundation',
  inkSymbol: '⛏️',
  tag: 'Surveyed Plot',
  description: 'Cleared ground with surveyed cornerstones ready for new architectural construction decrees.',
  type: 'plot'
};

export const CONSTRUCTIBLE_BLUEPRINTS = [
  'farm',
  'granary',
  'lumber',
  'quarry',
  'barracks',
  'watchtower',
  'well',
  'greenhouse',
  'vault'
];

export const TROOP_RECRUIT_COST = {
  gold: 25,
  food: 0
};

// Canonical building schema aliases
export const ROYAL_KEEP = BUILDINGS.keep;
export const FARM = BUILDINGS.farm;
export const LUMBER_MILL = BUILDINGS.lumber;
export const QUARRY = BUILDINGS.quarry;
export const BARRACKS = BUILDINGS.barracks;
export const DEEP_VAULT = BUILDINGS.vault;
export const SPRING = BUILDINGS.well;

// ==========================================
// BASE COSTS & YIELDS FOR 20-TIER SCALING
// ==========================================
export const BASE_BUILDING_COSTS = {
  keep: { gold: 120, wood: 100, stone: 100, flora: 0 },
  ROYAL_KEEP: { gold: 120, wood: 100, stone: 100, flora: 0 },
  farm: { gold: 35, wood: 15, stone: 0, flora: 0 },
  FARM: { gold: 35, wood: 15, stone: 0, flora: 0 },
  granary: { gold: 40, wood: 25, stone: 10, flora: 0 },
  lumber: { gold: 30, wood: 0, stone: 10, flora: 0 },
  LUMBER_MILL: { gold: 30, wood: 0, stone: 10, flora: 0 },
  quarry: { gold: 50, wood: 30, stone: 0, flora: 0 },
  QUARRY: { gold: 50, wood: 30, stone: 0, flora: 0 },
  barracks: { gold: 75, wood: 60, stone: 50, flora: 0 },
  BARRACKS: { gold: 75, wood: 60, stone: 50, flora: 0 },
  vault: { gold: 100, wood: 80, stone: 110, flora: 0 },
  DEEP_VAULT: { gold: 100, wood: 80, stone: 110, flora: 0 },
  well: { gold: 40, wood: 20, stone: 0, flora: 0 },
  SPRING: { gold: 40, wood: 20, stone: 0, flora: 0 },
  greenhouse: { gold: 40, wood: 25, stone: 15, flora: 0 },
  watchtower: { gold: 90, wood: 75, stone: 85, flora: 0 }
};

export const BASE_BUILDING_YIELDS = {
  farm: 55,
  FARM: 55,
  granary: 55,
  well: 25,
  SPRING: 25,
  lumber: 45,
  LUMBER_MILL: 45,
  quarry: 30,
  QUARRY: 30,
  greenhouse: 35,
  vault: 65,
  DEEP_VAULT: 65,
  keep: 25,
  ROYAL_KEEP: 25,
  barracks: 20,
  BARRACKS: 20,
  watchtower: 15
};

export const calculateBuildingCost = (type, targetTier) => {
  const base = BASE_BUILDING_COSTS[type] || BASE_BUILDING_COSTS.farm || { gold: 35, wood: 15, stone: 0, flora: 0 };
  const factor = 1.58;
  const poly = 12 * Math.pow(targetTier, 2.8);
  return {
    gold: Math.floor((base.gold || 0) * Math.pow(factor, targetTier - 1) + poly),
    wood: Math.floor((base.wood || 0) * Math.pow(factor, targetTier - 1) + poly * 0.8),
    stone: Math.floor((base.stone || 0) * Math.pow(factor, targetTier - 1) + poly * 0.6),
    flora: Math.floor((base.flora || 0) * Math.pow(factor, targetTier - 1)),
  };
};

export const calculateBuildingYield = (type, tier) => {
  const base = BASE_BUILDING_YIELDS[type] || 35;
  const factor = 1.36;
  return Math.floor(base * Math.pow(factor, tier - 1));
};

export const calculateBuildDuration = (tier) => {
  // Returns construction time in seconds
  return Math.round(15 * Math.pow(1.44, tier - 1));
};

// ==========================================
// ROMAN NUMERALS & EPOCH CIVILIZATION BADGES
// ==========================================
export const ROMAN_NUMERALS = [
  '', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
  'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX'
];

export function toRomanTier(num) {
  if (num >= 1 && num <= 20) return ROMAN_NUMERALS[num];
  return `${num}`;
}

export function getTierEpoch(tier) {
  if (tier <= 5) {
    return {
      name: 'Bronze Epoch',
      epoch: 'Bronze',
      badgeClass: 'bg-amber-900/20 text-amber-900 border-amber-800/60 shadow-amber-900/10',
      dotClass: 'bg-amber-700'
    };
  }
  if (tier <= 10) {
    return {
      name: 'Iron Epoch',
      epoch: 'Iron',
      badgeClass: 'bg-slate-800/20 text-slate-800 border-slate-700/60 shadow-slate-900/10',
      dotClass: 'bg-slate-600'
    };
  }
  if (tier <= 15) {
    return {
      name: 'Gilded Stone Epoch',
      epoch: 'Gilded Stone',
      badgeClass: 'bg-yellow-700/25 text-yellow-900 border-yellow-600/70 shadow-yellow-700/20',
      dotClass: 'bg-yellow-600'
    };
  }
  return {
    name: 'Imperial Obsidian Epoch',
    epoch: 'Imperial Obsidian',
    badgeClass: 'bg-purple-950/25 text-purple-950 border-purple-900/70 shadow-purple-950/20',
    dotClass: 'bg-purple-800'
  };
}

export function formatBuildDuration(seconds) {
  if (seconds <= 0) return '0s';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m remaining`;
  if (m > 0) return `${m}m ${s}s remaining`;
  return `${s}s remaining`;
}

export function calculateResourceCaps(buildings = {}, grid = null) {
  const getTierCap = (baseCap, lvl) => {
    // Scales exponentially with building tier so higher tiers can contain upgrade costs
    return Math.floor(baseCap * Math.pow(1.36, (lvl || 1) - 1));
  };

  if (grid && Array.isArray(grid)) {
    let foodGranaryCap = 0;
    let foodFarmCap = 0;
    let waterCap = 0;
    let woodCap = 0;
    let stoneCap = 0;
    let floraCap = 0;
    let goldCap = 0;

    let hasGranary = false;
    let hasWell = false;
    let hasLumber = false;
    let hasQuarry = false;
    let hasGreenhouse = false;
    let hasVault = false;

    grid.forEach(plot => {
      if (!plot.buildingId) return;
      const lvl = plot.level || 1;
      if (plot.buildingId === 'granary') {
        foodGranaryCap += getTierCap(BUILDINGS.granary?.baseCapacity || 1200, lvl);
        hasGranary = true;
      } else if (plot.buildingId === 'farm') {
        foodFarmCap += getTierCap(BUILDINGS.farm?.baseCapacity || 800, lvl);
      } else if (plot.buildingId === 'well') {
        waterCap += getTierCap(BUILDINGS.well?.baseCapacity || 1200, lvl);
        hasWell = true;
      } else if (plot.buildingId === 'lumber') {
        woodCap += getTierCap(BUILDINGS.lumber?.baseCapacity || 1500, lvl);
        hasLumber = true;
      } else if (plot.buildingId === 'quarry') {
        stoneCap += getTierCap(BUILDINGS.quarry?.baseCapacity || 1500, lvl);
        hasQuarry = true;
      } else if (plot.buildingId === 'greenhouse') {
        floraCap += getTierCap(BUILDINGS.greenhouse?.baseCapacity || 800, lvl);
        hasGreenhouse = true;
      } else if (plot.buildingId === 'vault') {
        goldCap += getTierCap(BUILDINGS.vault?.baseCapacity || 2000, lvl);
        hasVault = true;
      }
    });

    const vaultWaterBonus = hasVault ? Math.floor(goldCap * 0.2) : 0;
    const finalWaterCap = hasWell
      ? Math.max(300, waterCap + vaultWaterBonus)
      : Math.max(300, 300 + vaultWaterBonus);

    return {
      food: Math.max(1000, foodGranaryCap + foodFarmCap),
      water: finalWaterCap,
      wood: Math.max(1000, hasLumber ? woodCap : getTierCap(BUILDINGS.lumber?.baseCapacity || 1500, buildings.lumber || 1)),
      stone: Math.max(1000, hasQuarry ? stoneCap : getTierCap(BUILDINGS.quarry?.baseCapacity || 1500, buildings.quarry || 1)),
      flora: Math.max(500, hasGreenhouse ? floraCap : getTierCap(BUILDINGS.greenhouse?.baseCapacity || 800, buildings.greenhouse || 1)),
      gold: Math.max(1500, hasVault ? goldCap : getTierCap(BUILDINGS.vault?.baseCapacity || 2000, buildings.vault || 1))
    };
  }

  const foodGranaryCap = getTierCap(BUILDINGS.granary?.baseCapacity || 1200, buildings.granary || 1);
  const foodFarmCap = getTierCap(BUILDINGS.farm?.baseCapacity || 800, buildings.farm || 0);
  const vaultCap = getTierCap(BUILDINGS.vault?.baseCapacity || 2000, buildings.vault || 0);

  return {
    food: foodGranaryCap + foodFarmCap,
    water: Math.max(300, (buildings.well ? getTierCap(BUILDINGS.well?.baseCapacity || 1200, buildings.well) : 300) + Math.floor(vaultCap * 0.2)),
    wood: getTierCap(BUILDINGS.lumber?.baseCapacity || 1500, buildings.lumber || 1),
    stone: getTierCap(BUILDINGS.quarry?.baseCapacity || 1500, buildings.quarry || 1),
    flora: getTierCap(BUILDINGS.greenhouse?.baseCapacity || 800, buildings.greenhouse || 1),
    gold: vaultCap || 2000
  };
}

export function getBuildingUpgradeCost(bDef, currentLvl = 1, discount = 1.0) {
  if (!bDef) return { gold: 0, wood: 0, stone: 0, flora: 0 };
  const typeKey = typeof bDef === 'string' ? bDef : (bDef.id || bDef.type || 'farm');
  const targetTier = currentLvl + 1;
  const rawCost = calculateBuildingCost(typeKey, targetTier);
  return {
    gold: Math.round(rawCost.gold * discount),
    wood: Math.round(rawCost.wood * discount),
    stone: Math.round(rawCost.stone * discount),
    flora: Math.round((rawCost.flora || 0) * discount)
  };
}


