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
    maxTier: 5,
    type: 'core'
  },
  granary: {
    id: 'granary',
    name: 'Windmill & Granary',
    inkSymbol: '🌾',
    tag: 'Ration Silo',
    description: 'Cultivates grain crops and stores bread flour. Sustains realm population and standing garrison.',
    gx: 0, gy: 1,
    baseCost: { gold: 50, wood: 60, stone: 20 },
    costMult: 1.45,
    cycleDuration: 12,
    baseYield: { food: 55 },
    baseCapacity: 1200,
    baseHp: 280,
    laborRequired: 3,
    maxTier: 5,
    type: 'eco'
  },
  farm: {
    id: 'farm',
    name: 'Grain Acreage',
    inkSymbol: '🌿',
    tag: 'Agriculture',
    description: 'Expansive rye and barley acreage yielding regular harvests to sustain the citadel workforce.',
    gx: 2, gy: 3,
    baseCost: { gold: 40, wood: 45, stone: 20 },
    costMult: 1.4,
    cycleDuration: 10,
    baseYield: { food: 45 },
    baseCapacity: 800,
    baseHp: 220,
    laborRequired: 3,
    maxTier: 5,
    type: 'eco'
  },
  barracks: {
    id: 'barracks',
    name: 'War Garrison & Barracks',
    inkSymbol: '⚔️',
    tag: 'Military Quarters',
    description: 'Houses royal levies and trains valiant footmen to bolster defense and labor force.',
    gx: 3, gy: 2,
    baseCost: { gold: 90, wood: 100, stone: 70 },
    costMult: 1.5,
    defense: 25,
    troopCapacity: 20,
    baseHp: 450,
    laborRequired: 2,
    maxTier: 5,
    type: 'military'
  },
  well: {
    id: 'well',
    name: 'Spring Aqueduct',
    inkSymbol: '💧',
    tag: 'Aquifer',
    description: 'Pumps fresh spring aquifer water essential to ward off severe dehydration and mutinous unrest.',
    gx: 2, gy: 1,
    baseCost: { gold: 45, wood: 40, stone: 40 },
    costMult: 1.42,
    cycleDuration: 10,
    baseYield: { water: 50 },
    baseCapacity: 1200,
    baseHp: 260,
    laborRequired: 2,
    maxTier: 5,
    type: 'eco'
  },
  lumber: {
    id: 'lumber',
    name: 'Timber Mill',
    inkSymbol: '🪵',
    tag: 'Forester',
    description: 'Harvests sturdy timber used for siege engines, scaffolding, and perimeter palisades.',
    gx: 0, gy: 2,
    baseCost: { gold: 40, wood: 20, stone: 50 },
    costMult: 1.4,
    cycleDuration: 15,
    baseYield: { wood: 60 },
    baseCapacity: 1500,
    baseHp: 250,
    laborRequired: 4,
    maxTier: 5,
    type: 'resource'
  },
  quarry: {
    id: 'quarry',
    name: 'Granite Quarry',
    inkSymbol: '🪨',
    tag: 'Masonry',
    description: 'Chisels granite blocks to reinforce battlements and withstand enemy catapult bombardments.',
    gx: 2, gy: 2,
    baseCost: { gold: 60, wood: 50, stone: 30 },
    costMult: 1.45,
    cycleDuration: 18,
    baseYield: { stone: 60 },
    baseCapacity: 1500,
    baseHp: 320,
    laborRequired: 5,
    maxTier: 5,
    type: 'resource'
  },
  greenhouse: {
    id: 'greenhouse',
    name: 'Mystic Herbalist',
    inkSymbol: '🌱',
    tag: 'Alchemist',
    description: 'Nurtures moonlit flora used for alchemical healing salves, magical wards, and raid enhancements.',
    gx: 1, gy: 3,
    baseCost: { gold: 75, wood: 60, stone: 40 },
    costMult: 1.5,
    cycleDuration: 14,
    baseYield: { flora: 35 },
    baseCapacity: 800,
    baseHp: 220,
    laborRequired: 3,
    maxTier: 5,
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
    maxTier: 5,
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
    maxTier: 5,
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
  gold: 15,
  food: 10
};

export function calculateResourceCaps(buildings = {}, grid = null) {
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
        foodGranaryCap += (BUILDINGS.granary?.baseCapacity || 1200) * lvl;
        hasGranary = true;
      } else if (plot.buildingId === 'farm') {
        foodFarmCap += (BUILDINGS.farm?.baseCapacity || 800) * lvl;
      } else if (plot.buildingId === 'well') {
        waterCap += (BUILDINGS.well?.baseCapacity || 1200) * lvl;
        hasWell = true;
      } else if (plot.buildingId === 'lumber') {
        woodCap += (BUILDINGS.lumber?.baseCapacity || 1500) * lvl;
        hasLumber = true;
      } else if (plot.buildingId === 'quarry') {
        stoneCap += (BUILDINGS.quarry?.baseCapacity || 1500) * lvl;
        hasQuarry = true;
      } else if (plot.buildingId === 'greenhouse') {
        floraCap += (BUILDINGS.greenhouse?.baseCapacity || 800) * lvl;
        hasGreenhouse = true;
      } else if (plot.buildingId === 'vault') {
        goldCap += (BUILDINGS.vault?.baseCapacity || 2000) * lvl;
        hasVault = true;
      }
    });

    return {
      food: Math.max(1000, foodGranaryCap + foodFarmCap),
      water: Math.max(1000, hasWell ? waterCap : (BUILDINGS.well?.baseCapacity || 1200) * (buildings.well || 1)),
      wood: Math.max(1000, hasLumber ? woodCap : (BUILDINGS.lumber?.baseCapacity || 1500) * (buildings.lumber || 1)),
      stone: Math.max(1000, hasQuarry ? stoneCap : (BUILDINGS.quarry?.baseCapacity || 1500) * (buildings.quarry || 1)),
      flora: Math.max(500, hasGreenhouse ? floraCap : (BUILDINGS.greenhouse?.baseCapacity || 800) * (buildings.greenhouse || 1)),
      gold: Math.max(1500, hasVault ? goldCap : (BUILDINGS.vault?.baseCapacity || 2000) * (buildings.vault || 1))
    };
  }

  const foodGranaryCap = (BUILDINGS.granary?.baseCapacity || 1200) * (buildings.granary || 1);
  const foodFarmCap = (BUILDINGS.farm?.baseCapacity || 800) * (buildings.farm || 0);

  return {
    food: foodGranaryCap + foodFarmCap,
    water: (BUILDINGS.well?.baseCapacity || 1200) * (buildings.well || 1),
    wood: (BUILDINGS.lumber?.baseCapacity || 1500) * (buildings.lumber || 1),
    stone: (BUILDINGS.quarry?.baseCapacity || 1500) * (buildings.quarry || 1),
    flora: (BUILDINGS.greenhouse?.baseCapacity || 800) * (buildings.greenhouse || 1),
    gold: (BUILDINGS.vault?.baseCapacity || 2000) * (buildings.vault || 1)
  };
}

