import { useState, useEffect } from 'react';
import {
  STORAGE_KEY,
  DEFAULT_STATE,
  FACTIONS,
  BUILDINGS,
  SEASONS,
  SEASON_ORDER,
  WEATHER_CONDITIONS,
  WEATHER_POOL,
  sounds
} from '../constants/index.js';
import { haptics } from '../utils/index.js';

export function useGameState() {
  const [gameState, setGameState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const now = Date.now();
        // Deterministic offline calculation
        parsed.lastTickTimestamp = now;
        if (!parsed.harvestTimers) {
          parsed.harvestTimers = { granary: 0, well: 0, lumber: 0, quarry: 0, greenhouse: 0, vault: 0 };
        }
        if (!parsed.timeState) {
          parsed.timeState = {
            day: 1,
            hour: 8,
            minute: 0,
            seasonIndex: 0,
            weather: 'clear',
            timeSpeed: 1
          };
        }
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_STATE;
  });

  const [isMuted, setIsMuted] = useState(false);
  const [isStarving, setIsStarving] = useState(false);
  const [inkPulseTick, setInkPulseTick] = useState(0);

  // Sync mute state with procedural audio synthesizer
  useEffect(() => {
    sounds.muted = isMuted;
  }, [isMuted]);

  // Persist gameState changes to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    } catch (e) {
      console.warn(e);
    }
  }, [gameState]);

  // 1000ms Main Simulation Loop
  useEffect(() => {
    if (!gameState.faction) return;

    const timer = setInterval(() => {
      setInkPulseTick(t => (t + 1) % 100);

      setGameState(prev => {
        if (!prev.faction) return prev;
        const factionData = FACTIONS[prev.faction] || FACTIONS.humans;

        // 1. Advance Clock & Weather Dynamics
        const speed = prev.timeState?.timeSpeed || 1;
        let newMinute = (prev.timeState?.minute || 0) + (10 * speed);
        let newHour = prev.timeState?.hour ?? 8;
        let newDay = prev.timeState?.day ?? 1;
        let newSeasonIdx = prev.timeState?.seasonIndex ?? 0;
        let currentWeather = prev.timeState?.weather || 'clear';

        if (newMinute >= 60) {
          const hoursElapsed = Math.floor(newMinute / 60);
          newMinute = newMinute % 60;
          newHour += hoursElapsed;

          // Shift weather every few hours probabilistically
          if (Math.random() < 0.28) {
            currentWeather = WEATHER_POOL[Math.floor(Math.random() * WEATHER_POOL.length)];
          }
        }

        if (newHour >= 24) {
          newDay += Math.floor(newHour / 24);
          newHour = newHour % 24;

          // Rotate seasons every 7 in-game days
          newSeasonIdx = Math.floor((newDay - 1) / 7) % 4;
        }

        const seasonKey = SEASON_ORDER[newSeasonIdx];
        const season = SEASONS[seasonKey] || SEASONS.spring;

        const starvingNow = prev.resources.food <= 0.05 || prev.resources.water <= 0.05;
        if (starvingNow !== isStarving) {
          setIsStarving(starvingNow);
          if (starvingNow) sounds.playFamineAlarm();
        }

        const upkeepFood = (prev.population * 0.35 + prev.garrison * 0.65) *
          factionData.upkeepMultiplier *
          (season.multipliers.upkeep || 1.0);

        const upkeepWater = (prev.population * 0.30 + prev.garrison * 0.55) *
          factionData.upkeepMultiplier *
          (season.multipliers.upkeep || 1.0);

        const nextRes = { ...prev.resources };
        nextRes.food = Math.max(0, nextRes.food - upkeepFood);
        nextRes.water = Math.max(0, nextRes.water - upkeepWater);

        // Advance harvest cycle timers scaled by speed
        const updatedTimers = { ...prev.harvestTimers };
        Object.keys(updatedTimers).forEach(bId => {
          const bDef = BUILDINGS[bId];
          if (bDef && bDef.cycleDuration) {
            const currentVal = updatedTimers[bId] || 0;
            if (currentVal < bDef.cycleDuration) {
              updatedTimers[bId] = Math.min(bDef.cycleDuration, currentVal + (1 * speed));
            }
          }
        });

        return {
          ...prev,
          resources: nextRes,
          harvestTimers: updatedTimers,
          timeState: {
            day: newDay,
            hour: newHour,
            minute: newMinute,
            seasonIndex: newSeasonIdx,
            weather: currentWeather,
            timeSpeed: speed
          },
          lastTickTimestamp: Date.now()
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.faction, isStarving]);

  const handleToggleSpeed = () => {
    sounds.playCoin();
    setGameState(prev => {
      const curSpeed = prev.timeState?.timeSpeed || 1;
      const nextSpeed = curSpeed === 1 ? 2 : curSpeed === 2 ? 5 : 1;
      return {
        ...prev,
        timeState: {
          ...(prev.timeState || { day: 1, hour: 8, minute: 0, seasonIndex: 0, weather: 'clear' }),
          timeSpeed: nextSpeed
        }
      };
    });
  };

  const handleHarvestBuilding = (bId, caps, currentFaction) => {
    const bDef = BUILDINGS[bId];
    if (!bDef || !bDef.baseYield || !currentFaction) return;

    const currentProgress = gameState.harvestTimers[bId] || 0;
    if (currentProgress < bDef.cycleDuration) return; // not ready

    const season = SEASONS[SEASON_ORDER[gameState.timeState?.seasonIndex || 0]] || SEASONS.spring;
    const weather = WEATHER_CONDITIONS[gameState.timeState?.weather || 'clear'] || WEATHER_CONDITIONS.clear;

    sounds.playCoin();
    haptics.harvest();
    const lvl = gameState.buildings[bId] || 1;
    const starvingPenalty = isStarving ? 0.5 : 1.0;

    const [resKey, baseVal] = Object.entries(bDef.baseYield)[0];
    const fMult = currentFaction.productionMultipliers[resKey] || 1.0;
    const sMult = season.multipliers[resKey] || 1.0;
    const wMult = weather.multipliers[resKey] || 1.0;

    const totalYield = Math.round(
      baseVal * (1 + (lvl - 1) * 0.5) * fMult * sMult * wMult * starvingPenalty
    );

    setGameState(prev => {
      const cap = caps[resKey] || 1000;
      const currentAmt = prev.resources[resKey] || 0;
      return {
        ...prev,
        resources: {
          ...prev.resources,
          [resKey]: Math.min(cap, currentAmt + totalYield)
        },
        harvestTimers: {
          ...prev.harvestTimers,
          [bId]: 0
        }
      };
    });
  };

  const handleHarvestAll = (caps, currentFaction) => {
    if (!currentFaction) return 0;

    const season = SEASONS[SEASON_ORDER[gameState.timeState?.seasonIndex || 0]] || SEASONS.spring;
    const weather = WEATHER_CONDITIONS[gameState.timeState?.weather || 'clear'] || WEATHER_CONDITIONS.clear;
    const starvingPenalty = isStarving ? 0.5 : 1.0;

    let harvestedCount = 0;
    const accumulatedYields = {};
    const resetTimers = { ...gameState.harvestTimers };

    Object.keys(BUILDINGS).forEach(bId => {
      const bDef = BUILDINGS[bId];
      if (!bDef || !bDef.baseYield || !bDef.cycleDuration) return;

      const currentProgress = gameState.harvestTimers[bId] || 0;
      if (currentProgress >= bDef.cycleDuration) {
        harvestedCount++;
        const lvl = gameState.buildings[bId] || 1;
        const [resKey, baseVal] = Object.entries(bDef.baseYield)[0];
        const fMult = currentFaction.productionMultipliers[resKey] || 1.0;
        const sMult = season.multipliers[resKey] || 1.0;
        const wMult = weather.multipliers[resKey] || 1.0;

        const totalYield = Math.round(
          baseVal * (1 + (lvl - 1) * 0.5) * fMult * sMult * wMult * starvingPenalty
        );

        accumulatedYields[resKey] = (accumulatedYields[resKey] || 0) + totalYield;
        resetTimers[bId] = 0;
      }
    });

    if (harvestedCount === 0) return 0;

    sounds.playCoin();
    haptics.harvest();

    setGameState(prev => {
      const updatedRes = { ...prev.resources };
      Object.entries(accumulatedYields).forEach(([resKey, amt]) => {
        const cap = caps[resKey] || 1000;
        updatedRes[resKey] = Math.min(cap, (prev.resources[resKey] || 0) + amt);
      });
      return {
        ...prev,
        resources: updatedRes,
        harvestTimers: resetTimers
      };
    });

    return harvestedCount;
  };

  const handleIssueRoyalDecree = (bId, currentFaction, onTriggerDecreeStamp) => {
    const bDef = BUILDINGS[bId];
    if (!bDef || !currentFaction) return;

    const currentLvl = gameState.buildings[bId] || 1;
    const discount = currentFaction.id === 'humans' ? 0.5 : 1.0;
    const costGold = Math.round(bDef.baseCost.gold * Math.pow(bDef.costMult, currentLvl - 1) * discount);
    const costWood = Math.round(bDef.baseCost.wood * Math.pow(bDef.costMult, currentLvl - 1) * discount);
    const costStone = Math.round(bDef.baseCost.stone * Math.pow(bDef.costMult, currentLvl - 1) * discount);

    if (
      gameState.resources.gold < costGold ||
      gameState.resources.wood < costWood ||
      gameState.resources.stone < costStone
    ) {
      sounds.playFamineAlarm();
      return;
    }

    // Trigger visual stamping feedback and sound
    sounds.playWaxSealThud();
    haptics.heavy();
    if (onTriggerDecreeStamp) onTriggerDecreeStamp();

    setTimeout(() => {
      sounds.playUpgrade();
    }, 350);

    setGameState(prev => ({
      ...prev,
      resources: {
        ...prev.resources,
        gold: prev.resources.gold - costGold,
        wood: prev.resources.wood - costWood,
        stone: prev.resources.stone - costStone
      },
      buildings: {
        ...prev.buildings,
        [bId]: currentLvl + 1
      },
      population: prev.population + (bId === 'granary' || bId === 'keep' ? 3 : 1),
      garrison: prev.garrison + (bId === 'watchtower' || bId === 'keep' ? 2 : 0)
    }));
  };

  const recordRaidVictory = (rival, newLoot, caps) => {
    haptics.harvest();
    setGameState(prev => ({
      ...prev,
      totalRaidsWon: prev.totalRaidsWon + 1,
      resources: {
        ...prev.resources,
        gold: Math.min(caps.gold, prev.resources.gold + newLoot.gold),
        food: Math.min(caps.food, prev.resources.food + newLoot.food),
        wood: Math.min(caps.wood, prev.resources.wood + newLoot.wood),
        stone: Math.min(caps.stone, prev.resources.stone + newLoot.stone),
        flora: Math.min(caps.flora, prev.resources.flora + newLoot.flora)
      },
      battleLogs: [
        {
          id: `log-victory-${Date.now()}`,
          title: `Sacked ${rival.name}`,
          text: `Catapult vanguard extracted ${newLoot.gold} Gold and ${newLoot.food} Food stores.`,
          type: 'win',
          timestamp: Date.now()
        },
        ...prev.battleLogs
      ]
    }));
  };

  const handleDoubleRaidSpoils = (doubledLoot, caps) => {
    haptics.harvest();
    setGameState(prev => ({
      ...prev,
      resources: {
        ...prev.resources,
        gold: Math.min(caps.gold, prev.resources.gold + doubledLoot.gold),
        food: Math.min(caps.food, prev.resources.food + doubledLoot.food),
        wood: Math.min(caps.wood, prev.resources.wood + doubledLoot.wood),
        stone: Math.min(caps.stone, prev.resources.stone + doubledLoot.stone),
        flora: Math.min(caps.flora, prev.resources.flora + doubledLoot.flora)
      }
    }));
  };

  const handleResetKingdom = () => {
    localStorage.removeItem(STORAGE_KEY);
    setGameState(DEFAULT_STATE);
  };

  const selectFaction = (factionId) => {
    sounds.playWaxSealThud();
    haptics.heavy();
    setGameState(prev => ({ ...prev, faction: factionId }));
  };

  return {
    gameState,
    setGameState,
    isMuted,
    setIsMuted,
    isStarving,
    inkPulseTick,
    handleToggleSpeed,
    handleHarvestBuilding,
    handleHarvestAll,
    handleIssueRoyalDecree,
    recordRaidVictory,
    handleDoubleRaidSpoils,
    handleResetKingdom,
    selectFaction
  };
}
