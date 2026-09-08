import {
  FACTIONS,
  BUILDINGS,
  SEASONS,
  SEASON_ORDER,
  WEATHER_CONDITIONS,
  calculateResourceCaps
} from '../constants/index.js';

export function usePlayerStats(gameState) {
  const currentFaction = useMemo(() => {
    if (!gameState.faction) return null;
    return FACTIONS[gameState.faction] || FACTIONS.humans;
  }, [gameState.faction]);

  const stats = useMemo(() => {
    if (!currentFaction) {
      return {
        upkeep: { food: 0, water: 0 },
        caps: { food: 1000, water: 1000, wood: 1000, stone: 1000, flora: 500, gold: 1500 },
        vaultProtected: { food: 200, water: 200, wood: 200, stone: 200, flora: 100, gold: 300 },
        attackPower: 50,
        defensePower: 50,
        overallRating: 50
      };
    }

    const { buildings, population, garrison, troops, grid } = gameState;
    const bLevels = buildings || {};

    const seasonKey = SEASON_ORDER[gameState.timeState?.seasonIndex || 0];
    const season = SEASONS[seasonKey] || SEASONS.spring;
    const weatherKey = gameState.timeState?.weather || 'clear';
    const weather = WEATHER_CONDITIONS[weatherKey] || WEATHER_CONDITIONS.clear;

    const troopCount = troops?.total ?? (garrison || 20);
    const baseUpkeepFood = (population * 0.35 + troopCount * 0.65) * currentFaction.upkeepMultiplier * (season.multipliers.upkeep || 1.0);
    const baseUpkeepWater = (population * 0.30 + troopCount * 0.55) * currentFaction.upkeepMultiplier * (season.multipliers.upkeep || 1.0);

    const starving = (gameState.resources?.food ?? 0) <= 0.1 || (gameState.resources?.water ?? 0) <= 0.1;

    // Calculate labor demand across all constructed structures on the grid
    const totalLaborDemand = grid && Array.isArray(grid) && grid.some(p => p.buildingId)
      ? grid.reduce((sum, plot) => {
          if (!plot.buildingId) return sum;
          const bDef = BUILDINGS[plot.buildingId];
          return bDef ? sum + (bDef.laborRequired || 2) : sum;
        }, 0)
      : Object.entries(bLevels).reduce((sum, [bId, lvl]) => {
          if (!lvl || lvl <= 0) return sum;
          const bDef = BUILDINGS[bId];
          return bDef ? sum + (bDef.laborRequired || 2) : sum;
        }, 0);

    // Labor Efficiency: min(1.0, livingTroops / requiredLabor), with base floor of 8% to avoid 0/NaN
    const rawEfficiency = troopCount / Math.max(1, totalLaborDemand);
    const laborEfficiency = isNaN(rawEfficiency) ? 0.08 : Math.max(0.08, Math.min(1.0, rawEfficiency));

    // Dynamic storage caps computed across all grid structures
    const caps = calculateResourceCaps(bLevels, grid);

    // Troop capacity scaling with Barracks across all plots
    const totalBarracksLvl = grid && Array.isArray(grid)
      ? grid.filter(p => p.buildingId === 'barracks').reduce((sum, p) => sum + (p.level || 1), 0)
      : (bLevels.barracks || 0);
    const maxTroopCapacity = 30 + (totalBarracksLvl * (BUILDINGS.barracks?.troopCapacity || 20));

    const highestVaultLvl = grid && Array.isArray(grid)
      ? Math.max(1, ...grid.filter(p => p.buildingId === 'vault').map(p => p.level || 1))
      : (bLevels.vault || 1);
    const vaultProtectionRatio = currentFaction.vaultProtectionBase + (highestVaultLvl * 0.03);
    const vaultProtected = {
      food: Math.round(caps.food * vaultProtectionRatio),
      water: Math.round(caps.water * vaultProtectionRatio),
      wood: Math.round(caps.wood * vaultProtectionRatio),
      stone: Math.round(caps.stone * vaultProtectionRatio),
      flora: Math.round(caps.flora * vaultProtectionRatio),
      gold: Math.round(caps.gold * vaultProtectionRatio)
    };

    const keepLvl = grid && Array.isArray(grid)
      ? (grid.find(p => p.buildingId === 'keep')?.level || bLevels.keep || 1)
      : (bLevels.keep || 1);
    const totalWatchtowerLvl = grid && Array.isArray(grid)
      ? grid.filter(p => p.buildingId === 'watchtower').reduce((sum, p) => sum + (p.level || 1), 0)
      : (bLevels.watchtower || 0);

    const baseAtk = (troopCount * 12 + (keepLvl * 15)) * (1 + currentFaction.raidAttackBonus) * (weather.multipliers.raidAtk || 1.0);
    const baseDef = ((totalWatchtowerLvl * 42) + (keepLvl * 26) + (totalBarracksLvl * 25)) * (starving ? 0.5 : 1.0) * (currentFaction.id === 'elves' ? 0.75 : 1.0);
    const totalGridLevels = grid && Array.isArray(grid)
      ? grid.filter(p => p.buildingId).reduce((sum, p) => sum + (p.level || 1), 0)
      : Object.values(bLevels).reduce((a, b) => a + (b || 0), 0);
    const overallRating = Math.round(baseAtk + baseDef + totalGridLevels * 8);

    return {
      upkeep: { food: baseUpkeepFood, water: baseUpkeepWater },
      caps,
      vaultProtected,
      attackPower: baseAtk,
      defensePower: baseDef,
      overallRating,
      totalLaborDemand,
      laborEfficiency,
      maxTroopCapacity
    };
  }, [gameState, currentFaction]);

  return { currentFaction, stats };
}
