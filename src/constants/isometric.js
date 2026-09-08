// ==========================================
// 2.5D ISOMETRIC CARTOGRAPHY CONSTANTS & MATH
// ==========================================
export const ISO_W = 68;
export const ISO_H = 34;

export const MAX_TERRITORY_TIER = 3;
export const MAX_GRID_SIZE = 6; // Max 6x6 coordinate canvas (0..5)

export const TERRITORY_TIERS = {
  1: {
    tier: 1,
    name: 'Inner Citadel Core',
    size: 4, // 4x4 diamond: coordinates gx: 0..3, gy: 0..3
    unlockedPlots: 16,
    cost: { gold: 0, wood: 0, stone: 0 },
    keepLevelReq: 1,
    description: 'The fortified inner sanctuary surrounding the Royal Keep.'
  },
  2: {
    tier: 2,
    name: 'Outer Baileys & Acreage',
    size: 5, // 5x5 diamond: coordinates gx: 0..4, gy: 0..4
    unlockedPlots: 25,
    cost: { gold: 160, wood: 140, stone: 110 },
    keepLevelReq: 2,
    description: 'Cleared borderlands and pastures ready for industrial mills, acreage, and silos.'
  },
  3: {
    tier: 3,
    name: 'Grand Imperial Marches',
    size: 6, // 6x6 diamond: coordinates gx: 0..5, gy: 0..5
    unlockedPlots: 36,
    cost: { gold: 320, wood: 280, stone: 240 },
    keepLevelReq: 3,
    description: 'Vast sovereign estates capable of housing war barracks, herbalist groves, and grand ramparts.'
  }
};

export function gridToParchmentIso(gx, gy, originX = 270, originY = 48) {
  return {
    x: (gx - gy) * (ISO_W / 2) + originX,
    y: (gx + gy) * (ISO_H / 2) + originY
  };
}

export function isPlotAnnexed(gx, gy, tier = 1) {
  const tierConfig = TERRITORY_TIERS[tier] || TERRITORY_TIERS[1];
  return gx < tierConfig.size && gy < tierConfig.size;
}
