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
  REALM_MONTHS,
  getNextWeather,
  calculateResourceCaps,
  TECHNOLOGIES,
  TERRITORY_TIERS,
  MAX_TERRITORY_TIER,
  TROOP_RECRUIT_COST,
  createDefaultGrid,
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
          parsed.harvestTimers = { granary: 0, well: 0, lumber: 0, quarry: 0, greenhouse: 0, vault: 0, farm: 0 };
        }
        if (parsed.harvestTimers.farm === undefined) parsed.harvestTimers.farm = 0;

        if (!parsed.timeState) {
          parsed.timeState = {
            day: 1,
            month: 9,
            monthName: 'Harvestide (September)',
            year: 26,
            era: 'ADX',
            hour: 8,
            minute: 0,
            seasonIndex: 2,
            weather: 'autumn_breeze',
            timeSpeed: 1
          };
        } else {
          if (parsed.timeState.month === undefined) parsed.timeState.month = 9;
          if (!parsed.timeState.monthName) parsed.timeState.monthName = 'Harvestide (September)';
          if (parsed.timeState.year === undefined) parsed.timeState.year = 26;
          if (!parsed.timeState.era) parsed.timeState.era = 'ADX';
          if (parsed.timeState.seasonIndex === undefined) parsed.timeState.seasonIndex = 2;
          if (!parsed.timeState.weather || parsed.timeState.weather === 'clear') {
            parsed.timeState.weather = 'autumn_breeze';
          }
        }
        if (!parsed.technologies || !Array.isArray(parsed.technologies)) {
          parsed.technologies = [];
        }
        if (!parsed.territoryTier) {
          parsed.territoryTier = 1;
        }
        if (!parsed.troops) {
          parsed.troops = { total: 20, maxCapacity: 30, sustenanceUpkeepPerDay: 1 };
        }
        if (!parsed.grid || !Array.isArray(parsed.grid)) {
          parsed.grid = createDefaultGrid();
        }
        if (!parsed.buildings) {
          parsed.buildings = { ...DEFAULT_STATE.buildings };
        }
        if (parsed.buildings.farm === undefined) parsed.buildings.farm = 0;
        if (parsed.buildings.barracks === undefined) parsed.buildings.barracks = 0;

        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_STATE;
  });

  const [isMuted, setIsMuted] = useState(false);
  const [isStarving, setIsStarving] = useState(false);
  const [starvationDeaths, setStarvationDeaths] = useState(0);
  const [inkPulseTick, setInkPulseTick] = useState(0);
  const [autoCollectNotice, setAutoCollectNotice] = useState(null);

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
        let newMonth = prev.timeState?.month ?? 9;
        let newYear = prev.timeState?.year ?? 26;
        const era = prev.timeState?.era || 'ADX';
        let currentWeather = prev.timeState?.weather || 'autumn_breeze';
        const prevHour = newHour;
        let dayPassed = false;

        if (newMinute >= 60) {
          const hoursElapsed = Math.floor(newMinute / 60);
          newMinute = newMinute % 60;
          newHour += hoursElapsed;
        }

        if (newHour >= 24) {
          const daysElapsed = Math.floor(newHour / 24);
          newDay += daysElapsed;
          newHour = newHour % 24;
          dayPassed = true;

          // 30 days per realm month
          while (newDay > 30) {
            newDay -= 30;
            newMonth += 1;
            if (newMonth > 12) {
              newMonth = 1;
              newYear += 1;
            }
          }
        }

        // Macro Weather Duration: Transition only on day-phase shifts (Dawn: 6:00, Midday: 12:00, Dusk: 18:00, Midnight: 0:00)
        const oldPhase = Math.floor(prevHour / 6);
        const newPhase = Math.floor(newHour / 6);
        const phaseShifted = (oldPhase !== newPhase) || dayPassed;

        if (phaseShifted) {
          currentWeather = getNextWeather(currentWeather, newMonth);
        }

        const monthData = REALM_MONTHS[newMonth] || REALM_MONTHS[9];
        const newMonthName = monthData.name;
        const newSeasonIdx = monthData.seasonIndex;
        const seasonKey = SEASON_ORDER[newSeasonIdx];
        const season = SEASONS[seasonKey] || SEASONS.autumn;

        const starvingNow = (prev.resources?.food ?? 0) <= 0.05 || (prev.resources?.water ?? 0) <= 0.05;
        if (starvingNow !== isStarving) {
          setIsStarving(starvingNow);
          if (starvingNow) sounds.playFamineAlarm();
        }

        // Calculate troop demographic upkeep
        const livingTroops = prev.troops?.total ?? 20;
        const troopUpkeep = livingTroops * 0.18 * (prev.troops?.sustenanceUpkeepPerDay || 1);

        const upkeepFood = (prev.population * 0.35 + livingTroops * 0.45 + troopUpkeep) *
          factionData.upkeepMultiplier *
          (season.multipliers.upkeep || 1.0);

        const upkeepWater = (prev.population * 0.30 + livingTroops * 0.40 + troopUpkeep * 0.8) *
          factionData.upkeepMultiplier *
          (season.multipliers.upkeep || 1.0);

        const nextRes = { ...prev.resources };
        nextRes.food = Math.max(0, nextRes.food - upkeepFood);
        nextRes.water = Math.max(0, nextRes.water - upkeepWater);

        // Starvation Mortality: When resources are 0, troops die off during day transitions
        let nextTroops = prev.troops ? { ...prev.troops } : { total: 20, maxCapacity: 30, sustenanceUpkeepPerDay: 1 };
        let nextGarrison = prev.garrison;
        let newBattleLogs = prev.battleLogs || [];

        if (starvingNow && dayPassed && nextTroops.total > 0) {
          const mortalityRate = 0.10; // 10% die per cycle
          const deaths = Math.max(1, Math.round(nextTroops.total * mortalityRate));
          setStarvationDeaths(deaths);
          nextTroops.total = Math.max(0, nextTroops.total - deaths);
          nextGarrison = Math.max(0, (nextGarrison || 0) - deaths);

          const starvationLog = {
            id: `log-famine-${Date.now()}`,
            title: 'Famine & Scurvy in the Barracks',
            text: `With sustenance stores exhausted, ${deaths} soldiers succumbed to starvation. Realm labor capacity dropped!`,
            type: 'loss',
            timestamp: Date.now()
          };
          newBattleLogs = [starvationLog, ...newBattleLogs];
        } else if (!starvingNow && starvationDeaths > 0) {
          setStarvationDeaths(0);
        }

        // Advance harvest cycle timers scaled by speed & handle Troop Auto-Collection
        const hasTroopLogistics = (prev.technologies || []).includes('tech_troop_logistics');
        const canAutoCollect = hasTroopLogistics && nextTroops.total >= 1;
        const laborEfficiency = getLaborEfficiency(prev);
        const storageCaps = calculateResourceCaps(prev.buildings);

        const updatedTimers = { ...prev.harvestTimers };
        const autoYields = {};
        let autoHarvestCount = 0;

        Object.keys(updatedTimers).forEach(bId => {
          const bDef = BUILDINGS[bId];
          if (bDef && bDef.cycleDuration && bDef.baseYield) {
            const currentVal = updatedTimers[bId] || 0;
            const nextVal = currentVal + (1 * speed);

            if (canAutoCollect && nextVal >= bDef.cycleDuration) {
              // Troop Quartermaster / Garrison automatically collects completed harvest!
              autoHarvestCount++;
              const lvl = prev.buildings[bId] || 1;
              const [resKey, baseVal] = Object.entries(bDef.baseYield)[0];
              const fMult = factionData.productionMultipliers?.[resKey] || 1.0;
              const sMult = season.multipliers?.[resKey] || 1.0;
              const wCond = WEATHER_CONDITIONS[currentWeather] || WEATHER_CONDITIONS.autumn_breeze || WEATHER_CONDITIONS.clear;
              const wMult = wCond.multipliers?.[resKey] || 1.0;

              const totalYield = Math.round(
                baseVal * (1 + (lvl - 1) * 0.5) * fMult * sMult * wMult * laborEfficiency
              );

              autoYields[resKey] = (autoYields[resKey] || 0) + totalYield;
              updatedTimers[bId] = 0; // Harvest cycle harvested and restarted
            } else {
              updatedTimers[bId] = Math.min(bDef.cycleDuration, nextVal);
            }
          }
        });

        // Award auto-collected yields to stockpiles
        if (autoHarvestCount > 0) {
          Object.entries(autoYields).forEach(([resKey, amt]) => {
            const cap = storageCaps[resKey] || 1000;
            nextRes[resKey] = Math.min(cap, (nextRes[resKey] || 0) + amt);
          });
          setAutoCollectNotice({ count: autoHarvestCount, timestamp: Date.now() });
          sounds.playCoin();
        }

        return {
          ...prev,
          resources: nextRes,
          harvestTimers: updatedTimers,
          troops: nextTroops,
          garrison: nextGarrison,
          battleLogs: newBattleLogs,
          timeState: {
            day: newDay,
            month: newMonth,
            monthName: newMonthName,
            year: newYear,
            era: era,
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
  }, [gameState.faction, isStarving, starvationDeaths]);

  const handleToggleSpeed = () => {
    sounds.playCoin();
    setGameState(prev => {
      const curSpeed = prev.timeState?.timeSpeed || 1;
      const nextSpeed = curSpeed === 1 ? 2 : curSpeed === 2 ? 5 : 1;
      return {
        ...prev,
        timeState: {
          ...(prev.timeState || {
            day: 1,
            month: 9,
            monthName: 'Harvestide (September)',
            year: 26,
            era: 'ADX',
            hour: 8,
            minute: 0,
            seasonIndex: 2,
            weather: 'autumn_breeze'
          }),
          timeSpeed: nextSpeed
        }
      };
    });
  };

  // Helper to compute labor efficiency for harvests
  const getLaborEfficiency = (state) => {
    const bLevels = state.buildings || {};
    const totalLaborDemand = Object.entries(bLevels).reduce((sum, [bId, lvl]) => {
      if (!lvl || lvl <= 0) return sum;
      const bDef = BUILDINGS[bId];
      return bDef ? sum + (bDef.laborRequired || 2) : sum;
    }, 0);

    const livingTroops = state.troops?.total ?? 20;
    const rawEfficiency = livingTroops / Math.max(1, totalLaborDemand);
    return isNaN(rawEfficiency) ? 0.08 : Math.max(0.08, Math.min(1.0, rawEfficiency));
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
    const laborEfficiency = getLaborEfficiency(gameState);

    const [resKey, baseVal] = Object.entries(bDef.baseYield)[0];
    const fMult = currentFaction.productionMultipliers[resKey] || 1.0;
    const sMult = season.multipliers[resKey] || 1.0;
    const wMult = weather.multipliers[resKey] || 1.0;

    const totalYield = Math.round(
      baseVal * (1 + (lvl - 1) * 0.5) * fMult * sMult * wMult * laborEfficiency
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
    const laborEfficiency = getLaborEfficiency(gameState);

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
          baseVal * (1 + (lvl - 1) * 0.5) * fMult * sMult * wMult * laborEfficiency
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

    setGameState(prev => {
      let nextTroops = prev.troops ? { ...prev.troops } : { total: 20, maxCapacity: 30, sustenanceUpkeepPerDay: 1 };
      if (bId === 'barracks') {
        nextTroops.maxCapacity += (bDef.troopCapacity || 20);
      }

      return {
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
        troops: nextTroops,
        population: prev.population + (bId === 'granary' || bId === 'keep' || bId === 'farm' ? 3 : 1),
        garrison: prev.garrison + (bId === 'watchtower' || bId === 'keep' || bId === 'barracks' ? 2 : 0)
      };
    });
  };

  // Construction of new structures on empty plots
  const constructBuilding = (plotId, buildingType) => {
    const bDef = BUILDINGS[buildingType];
    if (!bDef) return false;

    const costGold = bDef.baseCost.gold;
    const costWood = bDef.baseCost.wood;
    const costStone = bDef.baseCost.stone;

    if (
      gameState.resources.gold < costGold ||
      gameState.resources.wood < costWood ||
      gameState.resources.stone < costStone
    ) {
      sounds.playFamineAlarm();
      return false;
    }

    sounds.playWaxSealThud();
    haptics.heavy();
    setTimeout(() => {
      sounds.playUpgrade();
    }, 300);

    setGameState(prev => {
      const newGrid = (prev.grid || []).map(plot => {
        if (plot.id === plotId) {
          return { ...plot, buildingId: buildingType };
        }
        return plot;
      });

      const newBuildings = {
        ...prev.buildings,
        [buildingType]: (prev.buildings[buildingType] || 0) + 1
      };

      const newHarvestTimers = {
        ...prev.harvestTimers,
        [buildingType]: prev.harvestTimers[buildingType] || 0
      };

      let newTroops = prev.troops ? { ...prev.troops } : { total: 20, maxCapacity: 30, sustenanceUpkeepPerDay: 1 };
      if (buildingType === 'barracks') {
        newTroops.maxCapacity += (bDef.troopCapacity || 20);
      }

      const constructLog = {
        id: `log-construct-${Date.now()}`,
        title: `Erected ${bDef.name}`,
        text: `Royal architects finished construction of ${bDef.name} on foundation plot ${plotId}. Strengthened realm infrastructure.`,
        type: 'win',
        timestamp: Date.now()
      };

      return {
        ...prev,
        resources: {
          ...prev.resources,
          gold: prev.resources.gold - costGold,
          wood: prev.resources.wood - costWood,
          stone: prev.resources.stone - costStone
        },
        grid: newGrid,
        buildings: newBuildings,
        harvestTimers: newHarvestTimers,
        troops: newTroops,
        battleLogs: [constructLog, ...(prev.battleLogs || [])]
      };
    });

    return true;
  };

  // Territory expansion (annex outer rings)
  const expandTerritory = () => {
    const currentTier = gameState.territoryTier || 1;
    if (currentTier >= MAX_TERRITORY_TIER) return false;

    const nextTier = currentTier + 1;
    const tierDef = TERRITORY_TIERS[nextTier];
    if (!tierDef) return false;

    const keepLvl = gameState.buildings?.keep || 1;
    if (keepLvl < tierDef.keepLevelReq) {
      sounds.playFamineAlarm();
      return false;
    }

    const { gold, wood, stone } = tierDef.cost;
    if (
      gameState.resources.gold < gold ||
      gameState.resources.wood < wood ||
      gameState.resources.stone < stone
    ) {
      sounds.playFamineAlarm();
      return false;
    }

    sounds.playWaxSealThud();
    haptics.heavy();
    setTimeout(() => {
      sounds.playUpgrade();
    }, 300);

    setGameState(prev => {
      const annexLog = {
        id: `log-annex-${Date.now()}`,
        title: `Annexed ${tierDef.name}`,
        text: `The Crown issued survey charters and annexed new sovereign territory. ${tierDef.unlockedPlots} foundation plots now available for construction.`,
        type: 'win',
        timestamp: Date.now()
      };

      return {
        ...prev,
        territoryTier: nextTier,
        resources: {
          ...prev.resources,
          gold: prev.resources.gold - gold,
          wood: prev.resources.wood - wood,
          stone: prev.resources.stone - stone
        },
        battleLogs: [annexLog, ...(prev.battleLogs || [])]
      };
    });

    return true;
  };

  // Recruit troops at Barracks
  const trainTroops = (count = 1) => {
    const barracksLvl = gameState.buildings?.barracks || 0;
    if (barracksLvl < 1) {
      sounds.playFamineAlarm();
      return false;
    }

    const currentTroops = gameState.troops?.total || 0;
    const maxCapacity = gameState.troops?.maxCapacity || 30;
    const actualCount = Math.min(count, maxCapacity - currentTroops);

    if (actualCount <= 0) {
      sounds.playFamineAlarm();
      return false;
    }

    const costGold = actualCount * TROOP_RECRUIT_COST.gold;
    const costFood = actualCount * TROOP_RECRUIT_COST.food;

    if (gameState.resources.gold < costGold || gameState.resources.food < costFood) {
      sounds.playFamineAlarm();
      return false;
    }

    sounds.playCoin();
    haptics.heavy();

    setGameState(prev => {
      const prevTroops = prev.troops || { total: 20, maxCapacity: 30, sustenanceUpkeepPerDay: 1 };
      const recruitLog = {
        id: `log-recruit-${Date.now()}`,
        title: `Mustered ${actualCount} Levies`,
        text: `Recruited ${actualCount} valiant footmen at the Barracks. Citadel labor saturation and combat defense boosted.`,
        type: 'win',
        timestamp: Date.now()
      };

      return {
        ...prev,
        resources: {
          ...prev.resources,
          gold: prev.resources.gold - costGold,
          food: prev.resources.food - costFood
        },
        troops: {
          ...prevTroops,
          total: prevTroops.total + actualCount
        },
        garrison: (prev.garrison || 0) + actualCount,
        battleLogs: [recruitLog, ...(prev.battleLogs || [])]
      };
    });

    return true;
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

  const handleResearchTechnology = (techId, onTriggerDecreeStamp) => {
    const tech = TECHNOLOGIES[techId];
    if (!tech) return false;

    const keepLvl = gameState.buildings?.keep || 1;
    if (tech.requirements?.keepTier && keepLvl < tech.requirements.keepTier) {
      sounds.playFamineAlarm();
      return false;
    }

    const costGold = tech.requirements?.cost?.gold || 0;
    const costFood = tech.requirements?.cost?.food || 0;

    if (
      (gameState.resources?.gold || 0) < costGold ||
      (gameState.resources?.food || 0) < costFood
    ) {
      sounds.playFamineAlarm();
      return false;
    }

    sounds.playWaxSealThud();
    haptics.heavy();
    if (onTriggerDecreeStamp) onTriggerDecreeStamp();

    setTimeout(() => {
      sounds.playUpgrade();
    }, 350);

    setGameState(prev => {
      const currentTechs = prev.technologies || [];
      if (currentTechs.includes(techId)) return prev;

      const researchLog = {
        id: `log-tech-${Date.now()}`,
        title: `Decree Sealed: ${tech.name}`,
        text: `Ratified the royal decree for ${tech.name} (${tech.subtitle}). Standing garrison levies will now automatically reap completed harvests from realm silos into stockpiles.`,
        type: 'win',
        timestamp: Date.now()
      };

      return {
        ...prev,
        resources: {
          ...prev.resources,
          gold: Math.max(0, (prev.resources?.gold || 0) - costGold),
          food: Math.max(0, (prev.resources?.food || 0) - costFood)
        },
        technologies: [...currentTechs, techId],
        battleLogs: [researchLog, ...(prev.battleLogs || [])]
      };
    });

    return true;
  };

  const handleBulkUpgradeBuildings = (buildingIds = [], currentFaction, onTriggerDecreeStamp) => {
    if (!buildingIds || buildingIds.length === 0 || !currentFaction) return false;

    const discount = currentFaction.id === 'humans' ? 0.5 : 1.0;
    let totalGold = 0;
    let totalWood = 0;
    let totalStone = 0;

    buildingIds.forEach(bId => {
      const bDef = BUILDINGS[bId];
      if (bDef) {
        const currentLvl = gameState.buildings[bId] || 1;
        totalGold += Math.round(bDef.baseCost.gold * Math.pow(bDef.costMult, currentLvl - 1) * discount);
        totalWood += Math.round(bDef.baseCost.wood * Math.pow(bDef.costMult, currentLvl - 1) * discount);
        totalStone += Math.round(bDef.baseCost.stone * Math.pow(bDef.costMult, currentLvl - 1) * discount);
      }
    });

    if (
      (gameState.resources.gold || 0) < totalGold ||
      (gameState.resources.wood || 0) < totalWood ||
      (gameState.resources.stone || 0) < totalStone
    ) {
      sounds.playFamineAlarm();
      return false;
    }

    sounds.playWaxSealThud();
    haptics.heavy();
    if (onTriggerDecreeStamp) onTriggerDecreeStamp();

    setTimeout(() => {
      sounds.playUpgrade();
    }, 350);

    setGameState(prev => {
      const nextBuildings = { ...prev.buildings };
      let popGain = 0;
      let garGain = 0;

      buildingIds.forEach(bId => {
        nextBuildings[bId] = (nextBuildings[bId] || 1) + 1;
        popGain += (bId === 'granary' || bId === 'keep' || bId === 'farm' ? 3 : 1);
        garGain += (bId === 'watchtower' || bId === 'keep' || bId === 'barracks' ? 2 : 0);
      });

      const bulkLog = {
        id: `log-bulk-${Date.now()}`,
        title: `Bulk Decree Sealed (${buildingIds.length} Structures)`,
        text: `Monarch ratified bulk construction edict across ${buildingIds.length} citadel structures.`,
        type: 'win',
        timestamp: Date.now()
      };

      return {
        ...prev,
        resources: {
          ...prev.resources,
          gold: Math.max(0, prev.resources.gold - totalGold),
          wood: Math.max(0, prev.resources.wood - totalWood),
          stone: Math.max(0, prev.resources.stone - totalStone)
        },
        buildings: nextBuildings,
        population: prev.population + popGain,
        garrison: (prev.garrison || 0) + garGain,
        battleLogs: [bulkLog, ...(prev.battleLogs || [])]
      };
    });

    return true;
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
    starvationDeaths,
    inkPulseTick,
    autoCollectNotice,
    handleToggleSpeed,
    handleHarvestBuilding,
    handleHarvestAll,
    handleIssueRoyalDecree,
    handleBulkUpgradeBuildings,
    handleResearchTechnology,
    constructBuilding,
    expandTerritory,
    trainTroops,
    recordRaidVictory,
    handleDoubleRaidSpoils,
    handleResetKingdom,
    selectFaction
  };
}
