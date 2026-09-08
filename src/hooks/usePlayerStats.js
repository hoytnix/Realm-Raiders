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

    const { buildings, population, garrison } = gameState;
    const bLevels = buildings;

    const seasonKey = SEASON_ORDER[gameState.timeState?.seasonIndex || 0];
    const season = SEASONS[seasonKey] || SEASONS.spring;
    const weatherKey = gameState.timeState?.weather || 'clear';
    const weather = WEATHER_CONDITIONS[weatherKey] || WEATHER_CONDITIONS.clear;

    const baseUpkeepFood = (population * 0.35 + garrison * 0.65) * currentFaction.upkeepMultiplier * (season.multipliers.upkeep || 1.0);
    const baseUpkeepWater = (population * 0.30 + garrison * 0.55) * currentFaction.upkeepMultiplier * (season.multipliers.upkeep || 1.0);

    const starving = gameState.resources.food <= 0.1 || gameState.resources.water <= 0.1;

    const caps = {
      food: BUILDINGS.granary.baseCapacity * (bLevels.granary || 1),
      water: BUILDINGS.well.baseCapacity * (bLevels.well || 1),
      wood: BUILDINGS.lumber.baseCapacity * (bLevels.lumber || 1),
      stone: BUILDINGS.quarry.baseCapacity * (bLevels.quarry || 1),
      flora: BUILDINGS.greenhouse.baseCapacity * (bLevels.greenhouse || 1),
      gold: BUILDINGS.vault.baseCapacity * (bLevels.vault || 1)
    };

    const vaultProtectionRatio = currentFaction.vaultProtectionBase + ((bLevels.vault || 1) * 0.03);
    const vaultProtected = {
      food: Math.round(caps.food * vaultProtectionRatio),
      water: Math.round(caps.water * vaultProtectionRatio),
      wood: Math.round(caps.wood * vaultProtectionRatio),
      stone: Math.round(caps.stone * vaultProtectionRatio),
      flora: Math.round(caps.flora * vaultProtectionRatio),
      gold: Math.round(caps.gold * vaultProtectionRatio)
    };

    const baseAtk = (garrison * 12 + ((bLevels.keep || 1) * 15)) * (1 + currentFaction.raidAttackBonus) * (weather.multipliers.raidAtk || 1.0);
    const baseDef = (((bLevels.watchtower || 1) * 42) + ((bLevels.keep || 1) * 26)) * (starving ? 0.5 : 1.0) * (currentFaction.id === 'elves' ? 0.75 : 1.0);
    const overallRating = Math.round(baseAtk + baseDef + Object.values(bLevels).reduce((a, b) => a + b * 8, 0));

    return {
      upkeep: { food: baseUpkeepFood, water: baseUpkeepWater },
      caps,
      vaultProtected,
      attackPower: baseAtk,
      defensePower: baseDef,
      overallRating
    };
  }, [gameState, currentFaction]);

  return { currentFaction, stats };
}
