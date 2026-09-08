import { useMemo } from 'react';
import {
  FACTIONS,
  BUILDINGS,
  SEASONS,
  SEASON_ORDER,
  WEATHER_CONDITIONS
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

    const { buildings, population, garrison, troops } = gameState;
    const bLevels = buildings || {};

    const seasonKey = SEASON_ORDER[gameState.timeState?.seasonIndex || 0];
    const season = SEASONS[seasonKey] || SEASONS.spring;
    const weatherKey = gameState.timeState?.weather || 'clear';
    const weather = WEATHER_CONDITIONS[weatherKey] || WEATHER_CONDITIONS.clear;

    const troopCount = troops?.total ?? (garrison || 20);
    const baseUpkeepFood = (population * 0.35 + troopCount * 0.65) * currentFaction.upkeepMultiplier * (season.multipliers.upkeep || 1.0);
    const baseUpkeepWater = (population * 0.30 + troopCount * 0.55) * currentFaction.upkeepMultiplier * (season.multipliers.upkeep || 1.0);

    const starving = (gameState.resources?.food ?? 0) <= 0.1 || (gameState.resources?.water ?? 0) <= 0.1;

    // Calculate labor demand across all constructed structures
    const totalLaborDemand = Object.entries(bLevels).reduce((sum, [bId, lvl]) => {
      if (!lvl || lvl <= 0) return sum;
      const bDef = BUILDINGS[bId];
      return bDef ? sum + (bDef.laborRequired || 2) : sum;
    }, 0);

    // Labor Efficiency: min(1.0, livingTroops / requiredLabor), with base floor of 8% to avoid 0/NaN
    const rawEfficiency = troopCount / Math.max(1, totalLaborDemand);
    const laborEfficiency = isNaN(rawEfficiency) ? 0.08 : Math.max(0.08, Math.min(1.0, rawEfficiency));

    // Dynamic storage caps including Farm
    const foodGranaryCap = (BUILDINGS.granary?.baseCapacity || 1200) * (bLevels.granary || 1);
    const foodFarmCap = (BUILDINGS.farm?.baseCapacity || 800) * (bLevels.farm || 0);

    const caps = {
      food: foodGranaryCap + foodFarmCap,
      water: (BUILDINGS.well?.baseCapacity || 1200) * (bLevels.well || 1),
      wood: (BUILDINGS.lumber?.baseCapacity || 1500) * (bLevels.lumber || 1),
      stone: (BUILDINGS.quarry?.baseCapacity || 1500) * (bLevels.quarry || 1),
      flora: (BUILDINGS.greenhouse?.baseCapacity || 800) * (bLevels.greenhouse || 1),
      gold: (BUILDINGS.vault?.baseCapacity || 2000) * (bLevels.vault || 1)
    };

    // Troop capacity scaling with Barracks
    const maxTroopCapacity = 30 + ((bLevels.barracks || 0) * (BUILDINGS.barracks?.troopCapacity || 20));

    const vaultProtectionRatio = currentFaction.vaultProtectionBase + ((bLevels.vault || 1) * 0.03);
    const vaultProtected = {
      food: Math.round(caps.food * vaultProtectionRatio),
      water: Math.round(caps.water * vaultProtectionRatio),
      wood: Math.round(caps.wood * vaultProtectionRatio),
      stone: Math.round(caps.stone * vaultProtectionRatio),
      flora: Math.round(caps.flora * vaultProtectionRatio),
      gold: Math.round(caps.gold * vaultProtectionRatio)
    };

    const baseAtk = (troopCount * 12 + ((bLevels.keep || 1) * 15)) * (1 + currentFaction.raidAttackBonus) * (weather.multipliers.raidAtk || 1.0);
    const baseDef = (((bLevels.watchtower || 0) * 42) + ((bLevels.keep || 1) * 26) + ((bLevels.barracks || 0) * 25)) * (starving ? 0.5 : 1.0) * (currentFaction.id === 'elves' ? 0.75 : 1.0);
    const overallRating = Math.round(baseAtk + baseDef + Object.values(bLevels).reduce((a, b) => a + (b || 0) * 8, 0));

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
