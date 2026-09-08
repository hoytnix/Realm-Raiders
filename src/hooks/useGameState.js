import { useState, useEffect, useCallback } from 'react';
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
  getBuildingUpgradeCost,
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
        if (parsed.currentResearch && parsed.lastTickTimestamp) {
          const elapsedSecs = Math.max(0, Math.floor((now - parsed.lastTickTimestamp) / 1000));
          const remaining = Math.max(0, (parsed.currentResearch.remaining ?? parsed.currentResearch.duration) - elapsedSecs);
          if (remaining <= 0) {
            const techDef = TECHNOLOGIES[parsed.currentResearch.techId];
            if (!parsed.technologies) parsed.technologies = [];
            if (techDef && !parsed.technologies.includes(parsed.currentResearch.techId)) {
              parsed.technologies.push(parsed.currentResearch.techId);
              parsed.battleLogs = [
                {
                  id: `log-tech-offline-${now}`,
                  title: `Decree Enacted: ${techDef.name}`,
                  text: `Royal scholars finalized ${techDef.name} while the throne stood vacant.`,
                  type: 'win',
                  timestamp: now
                },
                ...(parsed.battleLogs || [])
              ];
            }
            parsed.currentResearch = null;
          } else {
            parsed.currentResearch.remaining = remaining;
            parsed.currentResearch.progress = Math.min(1, Math.max(0, 1 - (remaining / (parsed.currentResearch.duration || 1))));
          }
        }
        if (!parsed.currentResearch) {
          parsed.currentResearch = null;
        }
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
        } else {
          parsed.grid = parsed.grid.map(plot => {
            if (plot.buildingId && (plot.level === undefined || plot.level === null)) {
              return {
                ...plot,
                level: (parsed.buildings && parsed.buildings[plot.buildingId]) || 1
              };
            }
            if (!plot.buildingId && (plot.level === undefined || plot.level === null)) {
              return {
                ...plot,
                level: 0
              };
            }
            return plot;
          });
        }
        if (!parsed.buildings) {
          parsed.buildings = { ...DEFAULT_STATE.buildings };
        }
        if (parsed.buildings.farm === undefined) parsed.buildings.farm = 0;
        if (parsed.buildings.barracks === undefined) parsed.buildings.barracks = 0;
        if (parsed.brambleShieldActive === undefined) {
          parsed.brambleShieldActive = false;
        }
        if (parsed.soilFertilityBonus === undefined) {
          parsed.soilFertilityBonus = 0;
        }
        if (!parsed.settings) {
          parsed.settings = { ...DEFAULT_STATE.settings };
        } else {
          parsed.settings = { ...DEFAULT_STATE.settings, ...parsed.settings };
        }

        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_STATE;
  });

  const [isStarving, setIsStarving] = useState(false);
  const [starvationDeaths, setStarvationDeaths] = useState(0);
  const [inkPulseTick, setInkPulseTick] = useState(0);
  const [autoCollectNotice, setAutoCollectNotice] = useState(null);
  const [lastForageTimestamp, setLastForageTimestamp] = useState(0);

  const settings = gameState.settings || DEFAULT_STATE.settings;
  const isMuted = !settings.masterAudio;

  const handleUpdateSettings = useCallback((newSettings) => {
    setGameState(prev => ({
      ...prev,
      settings: {
        ...(prev.settings || DEFAULT_STATE.settings),
        ...newSettings
      }
    }));
  }, []);

  const setIsMuted = useCallback((val) => {
    const mutedVal = typeof val === 'function' ? val(!gameState.settings?.masterAudio) : val;
    handleUpdateSettings({ masterAudio: !mutedVal });
  }, [gameState.settings?.masterAudio, handleUpdateSettings]);

  // Sync settings with procedural audio synthesizer and haptics
  useEffect(() => {
    if (!settings) return;
    sounds.setMasterMute(!settings.masterAudio);
    sounds.setAmbientMute(!settings.ambientAudio);
    sounds.setSfxMute(!settings.sfxAudio);
    sounds.setAmbientVolume(settings.ambientVolume ?? 0.5);
    sounds.setSfxVolume(settings.sfxVolume ?? 0.8);
    haptics.setEnabled(settings.hapticsEnabled ?? true);
  }, [settings]);

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

        // 1. Advance Clock & Weather Dynamics (Locked to constant 1x baseline tick rate)
        let newMinute = (prev.timeState?.minute || 0) + 10;
        let newHour = prev.timeState?.hour ?? 8;
        let newDay = prev.timeState?.day ?? 1;
        let newMonth = prev.timeState?.month ?? 9;
        let newYear = prev.timeState?.year ?? 26;
        const era = prev.timeState?.era || 'ADX';
        let currentWeather = prev.timeState?.weather || 'autumn_breeze';
        const prevHour = newHour;
        let dayPassed = false;

        let hoursElapsed = 0;
        if (newMinute >= 60) {
          hoursElapsed = Math.floor(newMinute / 60);
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

        // Starter Grace Buffer: Prevent famine from triggering during Days 1-5 of Harvestide, 26 ADX
        const isGracePeriod = (newYear === 26 && newMonth === 9 && newDay <= 5);
        const starvingNow = !isGracePeriod && ((prev.resources?.food ?? 0) <= 0.05 || (prev.resources?.water ?? 0) <= 0.05);
        if (starvingNow !== isStarving) {
          setIsStarving(starvingNow);
          if (starvingNow) sounds.playFamineAlarm();
        }

        // Calculate troop demographic upkeep with Flora Drought Vulnerability (baseline consumption reduced by 50%)
        const livingTroops = prev.troops?.total ?? 20;
        const hasCanopyGranary = (prev.technologies || []).includes('tech_flora_living_granary');
        const isDrought = currentWeather === 'heatwave';
        const droughtMult = (factionData.element === 'Flora' && isDrought && !hasCanopyGranary) ? 1.10 : 1.0;
        const troopUpkeep = livingTroops * 0.09 * (prev.troops?.sustenanceUpkeepPerDay || 1) * droughtMult;

        const upkeepFood = (prev.population * 0.175 + livingTroops * 0.225 + troopUpkeep) *
          factionData.upkeepMultiplier *
          (season.multipliers.upkeep || 1.0);

        const upkeepWater = (prev.population * 0.15 + livingTroops * 0.20 + troopUpkeep * 0.8) *
          factionData.upkeepMultiplier *
          (season.multipliers.upkeep || 1.0);

        const nextRes = { ...prev.resources };

        // Slow hunger ticks to every 25 seconds (25 ticks) to eliminate early-game starvation spirals
        const nextHungerTick = (prev.hungerTick || 0) + 1;
        let hungerReset = false;
        if (nextHungerTick >= 25) {
          hungerReset = true;
          nextRes.food = Math.max(0, nextRes.food - upkeepFood);
          nextRes.water = Math.max(0, nextRes.water - upkeepWater);
        }

        let newBattleLogs = prev.battleLogs || [];

        // Living Bramble Shield Upkeep (deduct 2 Flora/hr, or 1 Flora/hr with Bramble Bastion)
        let nextBrambleShieldActive = prev.brambleShieldActive;
        if (hoursElapsed > 0 && prev.brambleShieldActive) {
          const hasBrambleWall = (prev.technologies || []).includes('tech_flora_bramble_wall');
          const shieldRate = hasBrambleWall ? 1 : 2;
          const shieldDrain = hoursElapsed * shieldRate;
          if (nextRes.flora <= shieldDrain) {
            nextRes.flora = 0;
            nextBrambleShieldActive = false;
            const witherLog = {
              id: `log-wither-${Date.now()}`,
              title: 'Living Brambles Withered',
              text: 'The Living Brambles have withered from lack of Flora.',
              type: 'loss',
              timestamp: Date.now()
            };
            newBattleLogs = [witherLog, ...newBattleLogs];
            sounds.playFamineAlarm();
          } else {
            nextRes.flora -= shieldDrain;
          }
        }

        // Composting Decay (Anti-Cap Overflow): when Flora > 90% cap, convert 5% excess per day into +1% permanent farm fertility
        let nextSoilFertilityBonus = prev.soilFertilityBonus || 0;
        const storageCaps = calculateResourceCaps(prev.buildings, prev.grid);
        if (factionData.element === 'Flora' && (seasonKey === 'autumn' || seasonKey === 'spring')) {
          storageCaps.food = Math.round(storageCaps.food * 1.25);
        }

        if (dayPassed) {
          const floraCap = storageCaps.flora || 500;
          if (nextRes.flora > floraCap * 0.9) {
            const excess = nextRes.flora - (floraCap * 0.9);
            const compostAmt = Math.max(1, Math.round(excess * 0.05));
            nextRes.flora = Math.max(0, nextRes.flora - compostAmt);
            nextSoilFertilityBonus += 0.01;
            const compostLog = {
              id: `log-compost-${Date.now()}`,
              title: 'Composting Humus Renewal',
              text: `Stored Flora exceeded 90% capacity; ${compostAmt} excess decomposed into fertile humus, permanently granting +1% yield to Farms.`,
              type: 'win',
              timestamp: Date.now()
            };
            newBattleLogs = [compostLog, ...newBattleLogs];
          }
        }

        // Starvation Mortality: When resources are 0, troops die off during day transitions
        let nextTroops = prev.troops ? { ...prev.troops } : { total: 20, maxCapacity: 30, sustenanceUpkeepPerDay: 1 };
        let nextGarrison = prev.garrison;

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

        const updatedTimers = { ...prev.harvestTimers };
        const autoYields = {};
        let autoHarvestCount = 0;

        const plotsToHarvest = prev.grid && Array.isArray(prev.grid) && prev.grid.some(p => p.buildingId)
          ? prev.grid.filter(p => p.buildingId)
          : Object.keys(BUILDINGS).map(bId => ({ id: bId, buildingId: bId, level: prev.buildings[bId] || 1 }));

        const hasOvergrowth = (prev.technologies || []).includes('tech_flora_overgrowth');

        plotsToHarvest.forEach(plot => {
          const bDef = BUILDINGS[plot.buildingId];
          if (bDef && bDef.cycleDuration && bDef.baseYield) {
            const isAgriTimber = plot.buildingId === 'farm' || plot.buildingId === 'granary' || plot.buildingId === 'lumber';
            let plotSpeedMult = 1.0;
            if (factionData.element === 'Flora' && isAgriTimber) {
              // Base Passive: +15% base production speed to Sustenance & Timber
              plotSpeedMult *= 1.15;
              // Weather Synergy: Gentle Amber Rain, Overcast Cloudcover, or Morning Mist grant +20%
              if (['amber_rain', 'overcast', 'mist'].includes(currentWeather)) {
                plotSpeedMult *= 1.20;
              }
            }

            // Rapid Sprout cuts cycle duration by 20% on Farms and Lumber Mills
            const effectiveCycleDuration = (hasOvergrowth && (plot.buildingId === 'farm' || plot.buildingId === 'lumber'))
              ? Math.max(1, Math.round(bDef.cycleDuration * 0.8))
              : bDef.cycleDuration;

            const timerKey = plot.id;
            const currentVal = updatedTimers[timerKey] ?? updatedTimers[plot.buildingId] ?? 0;
            const nextVal = currentVal + (1 * speed * plotSpeedMult);

            if (canAutoCollect && nextVal >= effectiveCycleDuration) {
              // Troop Quartermaster / Garrison automatically collects completed harvest!
              autoHarvestCount++;
              const lvl = plot.level || 1;
              const [resKey, baseVal] = Object.entries(bDef.baseYield)[0];
              const fMult = factionData.productionMultipliers?.[resKey] || 1.0;
              const sMult = season.multipliers?.[resKey] || 1.0;
              const wCond = WEATHER_CONDITIONS[currentWeather] || WEATHER_CONDITIONS.autumn_breeze || WEATHER_CONDITIONS.clear;
              const wMult = wCond.multipliers?.[resKey] || 1.0;
              const farmFertilityMult = plot.buildingId === 'farm' ? (1 + nextSoilFertilityBonus) : 1.0;
              const isAgriOrTimber = plot.buildingId === 'farm' || plot.buildingId === 'granary' || plot.buildingId === 'lumber';
              const effectiveLabor = isAgriOrTimber ? 1.0 : laborEfficiency;

              const totalYield = Math.round(
                baseVal * (1 + (lvl - 1) * 0.5) * fMult * sMult * wMult * effectiveLabor * farmFertilityMult
              );

              autoYields[resKey] = (autoYields[resKey] || 0) + totalYield;
              updatedTimers[timerKey] = 0; // Harvest cycle harvested and restarted
              if (updatedTimers[plot.buildingId] !== undefined) {
                updatedTimers[plot.buildingId] = 0;
              }
            } else {
              updatedTimers[timerKey] = Math.min(effectiveCycleDuration, nextVal);
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

        // Advance ongoing research decree
        let nextCurrentResearch = prev.currentResearch ? { ...prev.currentResearch } : null;
        let nextTechnologies = prev.technologies ? [...prev.technologies] : [];
        if (nextCurrentResearch) {
          const remaining = Math.max(0, (nextCurrentResearch.remaining ?? nextCurrentResearch.duration) - (1 * speed));
          if (remaining <= 0) {
            const techDef = TECHNOLOGIES[nextCurrentResearch.techId];
            if (techDef && !nextTechnologies.includes(nextCurrentResearch.techId)) {
              nextTechnologies.push(nextCurrentResearch.techId);
              const completionLog = {
                id: `log-tech-${Date.now()}`,
                title: `Decree Enacted: ${techDef.name}`,
                text: `The royal codex scholars have codified ${techDef.name} (${techDef.subtitle}). Its benefits are now active across the realm!`,
                type: 'win',
                timestamp: Date.now()
              };
              newBattleLogs = [completionLog, ...newBattleLogs];
              sounds.playUpgrade();
            }
            nextCurrentResearch = null;
          } else {
            nextCurrentResearch.remaining = remaining;
            nextCurrentResearch.progress = Math.min(1, Math.max(0, 1 - (remaining / (nextCurrentResearch.duration || 1))));
          }
        }

        return {
          ...prev,
          resources: nextRes,
          harvestTimers: updatedTimers,
          technologies: nextTechnologies,
          currentResearch: nextCurrentResearch,
          troops: nextTroops,
          garrison: nextGarrison,
          battleLogs: newBattleLogs,
          brambleShieldActive: nextBrambleShieldActive,
          soilFertilityBonus: nextSoilFertilityBonus,
          hungerTick: hungerReset ? 0 : nextHungerTick,
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
            timeSpeed: 1
          },
          lastTickTimestamp: Date.now()
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.faction, isStarving, starvationDeaths]);

  // Locked 1x baseline tick rate: time speed toggle is disabled
  const handleToggleSpeed = () => {};

  // Helper to compute labor efficiency for harvests
  const getLaborEfficiency = (state) => {
    const totalLaborDemand = state.grid && Array.isArray(state.grid) && state.grid.some(p => p.buildingId)
      ? state.grid.reduce((sum, plot) => {
          if (!plot.buildingId) return sum;
          const bDef = BUILDINGS[plot.buildingId];
          return bDef ? sum + (bDef.laborRequired || 2) : sum;
        }, 0)
      : Object.entries(state.buildings || {}).reduce((sum, [bId, lvl]) => {
          if (!lvl || lvl <= 0) return sum;
          const bDef = BUILDINGS[bId];
          return bDef ? sum + (bDef.laborRequired || 2) : sum;
        }, 0);

    const livingTroops = state.troops?.total ?? 20;
    const rawEfficiency = livingTroops / Math.max(1, totalLaborDemand);
    return isNaN(rawEfficiency) ? 0.08 : Math.max(0.08, Math.min(1.0, rawEfficiency));
  };

  const handleHarvestBuilding = (targetId, caps, currentFaction) => {
    const targetPlot = (gameState.grid || []).find(p => p.id === targetId || p.buildingId === targetId);
    const bId = targetPlot ? targetPlot.buildingId : targetId;
    const bDef = BUILDINGS[bId];
    if (!bDef || !bDef.baseYield || !currentFaction) return;

    const timerKey = targetPlot ? targetPlot.id : bId;
    const hasOvergrowth = (gameState.technologies || []).includes('tech_flora_overgrowth');
    const effectiveDuration = (hasOvergrowth && (bId === 'farm' || bId === 'lumber'))
      ? Math.max(1, Math.round(bDef.cycleDuration * 0.8))
      : bDef.cycleDuration;

    const currentProgress = gameState.harvestTimers[timerKey] ?? gameState.harvestTimers[bId] ?? 0;
    if (currentProgress < effectiveDuration) return; // not ready

    const season = SEASONS[SEASON_ORDER[gameState.timeState?.seasonIndex || 0]] || SEASONS.spring;
    const weather = WEATHER_CONDITIONS[gameState.timeState?.weather || 'clear'] || WEATHER_CONDITIONS.clear;

    sounds.playCoin();
    haptics.harvest();
    const lvl = targetPlot ? (targetPlot.level || 1) : (gameState.buildings[bId] || 1);
    const laborEfficiency = getLaborEfficiency(gameState);

    const [resKey, baseVal] = Object.entries(bDef.baseYield)[0];
    const fMult = currentFaction.productionMultipliers[resKey] || 1.0;
    const sMult = season.multipliers[resKey] || 1.0;
    const wMult = weather.multipliers[resKey] || 1.0;
    const farmFertilityMult = bId === 'farm' ? (1 + (gameState.soilFertilityBonus || 0)) : 1.0;
    const isAgriOrTimber = bId === 'farm' || bId === 'granary' || bId === 'lumber';
    const effectiveLabor = isAgriOrTimber ? 1.0 : laborEfficiency;

    const totalYield = Math.round(
      baseVal * (1 + (lvl - 1) * 0.5) * fMult * sMult * wMult * effectiveLabor * farmFertilityMult
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
          [timerKey]: 0,
          ...(targetPlot?.buildingId ? { [targetPlot.buildingId]: 0 } : {})
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

    const plotsToHarvest = gameState.grid && Array.isArray(gameState.grid) && gameState.grid.some(p => p.buildingId)
      ? gameState.grid.filter(p => p.buildingId)
      : Object.keys(BUILDINGS).map(bId => ({ id: bId, buildingId: bId, level: gameState.buildings[bId] || 1 }));

    const hasOvergrowth = (gameState.technologies || []).includes('tech_flora_overgrowth');

    plotsToHarvest.forEach(plot => {
      const bDef = BUILDINGS[plot.buildingId];
      if (!bDef || !bDef.baseYield || !bDef.cycleDuration) return;

      const effectiveDuration = (hasOvergrowth && (plot.buildingId === 'farm' || plot.buildingId === 'lumber'))
        ? Math.max(1, Math.round(bDef.cycleDuration * 0.8))
        : bDef.cycleDuration;

      const timerKey = plot.id;
      const currentProgress = gameState.harvestTimers[timerKey] ?? gameState.harvestTimers[plot.buildingId] ?? 0;
      if (currentProgress >= effectiveDuration) {
        harvestedCount++;
        const lvl = plot.level || 1;
        const [resKey, baseVal] = Object.entries(bDef.baseYield)[0];
        const fMult = currentFaction.productionMultipliers[resKey] || 1.0;
        const sMult = season.multipliers[resKey] || 1.0;
        const wMult = weather.multipliers[resKey] || 1.0;
        const farmFertilityMult = plot.buildingId === 'farm' ? (1 + (gameState.soilFertilityBonus || 0)) : 1.0;
        const isAgriOrTimber = plot.buildingId === 'farm' || plot.buildingId === 'granary' || plot.buildingId === 'lumber';
        const effectiveLabor = isAgriOrTimber ? 1.0 : laborEfficiency;

        const totalYield = Math.round(
          baseVal * (1 + (lvl - 1) * 0.5) * fMult * sMult * wMult * effectiveLabor * farmFertilityMult
        );

        accumulatedYields[resKey] = (accumulatedYields[resKey] || 0) + totalYield;
        resetTimers[timerKey] = 0;
        if (plot.buildingId) {
          resetTimers[plot.buildingId] = 0;
        }
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

  const handleIssueRoyalDecree = (targetId, currentFaction, onTriggerDecreeStamp) => {
    const targetPlot = (gameState.grid || []).find(p => p.id === targetId || p.buildingId === targetId);
    const bId = targetPlot ? targetPlot.buildingId : targetId;
    const bDef = BUILDINGS[bId];
    if (!bDef || !currentFaction) return;

    const currentLvl = targetPlot ? (targetPlot.level || 1) : (gameState.buildings[bId] || 1);
    const discount = currentFaction.id === 'humans' ? 0.5 : 1.0;
    const { gold: costGold, wood: costWood, stone: costStone } = getBuildingUpgradeCost(bDef, currentLvl, discount);

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

      const nextLvl = currentLvl + 1;
      let nextGrid = prev.grid;
      let nextBuildings = { ...prev.buildings };

      if (targetPlot && prev.grid) {
        nextGrid = prev.grid.map(p => p.id === targetPlot.id ? { ...p, level: nextLvl } : p);
        const maxOfThisType = Math.max(...nextGrid.filter(p => p.buildingId === bId).map(p => p.level || 1));
        nextBuildings[bId] = maxOfThisType;
      } else {
        nextBuildings[bId] = nextLvl;
      }

      return {
        ...prev,
        resources: {
          ...prev.resources,
          gold: prev.resources.gold - costGold,
          wood: prev.resources.wood - costWood,
          stone: prev.resources.stone - costStone
        },
        grid: nextGrid,
        buildings: nextBuildings,
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
          return { ...plot, buildingId: buildingType, level: 1 };
        }
        return plot;
      });

      const newBuildings = {
        ...prev.buildings,
        [buildingType]: Math.max(1, prev.buildings[buildingType] || 1)
      };

      const isInstantHarvest = ['farm', 'granary', 'lumber', 'quarry'].includes(buildingType);
      const initialProgress = isInstantHarvest ? (bDef.cycleDuration || 20) : 0;

      const newHarvestTimers = {
        ...prev.harvestTimers,
        [plotId]: initialProgress,
        [buildingType]: initialProgress
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
    // Halt recruitment while famine is active
    const isGracePeriod = (gameState.timeState?.year === 26 && gameState.timeState?.month === 9 && (gameState.timeState?.day || 1) <= 5);
    const isFamineActive = !isGracePeriod && (gameState.resources?.food || 0) <= 0.05;
    if (isFamineActive) {
      sounds.playFamineAlarm();
      return false;
    }

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

    // Check if already researched or currently researching
    if ((gameState.technologies || []).includes(techId) || gameState.currentResearch) {
      return false;
    }

    const keepPlot = gameState.grid && Array.isArray(gameState.grid)
      ? gameState.grid.find(p => p.buildingId === 'keep')
      : null;
    const keepLvl = keepPlot?.level || gameState.buildings?.keep || 1;
    if (tech.requirements?.keepTier && keepLvl < tech.requirements.keepTier) {
      sounds.playFamineAlarm();
      return false;
    }

    const discount = gameState.faction === 'humans' ? 0.5 : 1.0;
    const costGold = Math.round((tech.requirements?.cost?.gold || 0) * discount);
    const costFood = Math.round((tech.requirements?.cost?.food || 0) * discount);
    const costWood = Math.round((tech.requirements?.cost?.wood || 0) * discount);
    const costStone = Math.round((tech.requirements?.cost?.stone || 0) * discount);
    const costFlora = Math.round((tech.requirements?.cost?.flora || 0) * discount);

    if (
      (gameState.resources?.gold || 0) < costGold ||
      (gameState.resources?.food || 0) < costFood ||
      (gameState.resources?.wood || 0) < costWood ||
      (gameState.resources?.stone || 0) < costStone ||
      (gameState.resources?.flora || 0) < costFlora
    ) {
      sounds.playFamineAlarm();
      return false;
    }

    sounds.playWaxSealThud();
    haptics.heavy();
    if (onTriggerDecreeStamp) onTriggerDecreeStamp();

    setGameState(prev => {
      const currentTechs = prev.technologies || [];
      if (currentTechs.includes(techId) || prev.currentResearch) return prev;

      const duration = tech.duration || 15;
      const researchLog = {
        id: `log-tech-${Date.now()}`,
        title: `Decree Commissioned: ${tech.name}`,
        text: `Scholars unrolled parchment scrolls to codify ${tech.name} (${tech.subtitle}). Duration: ${duration}s.`,
        type: 'win',
        timestamp: Date.now()
      };

      return {
        ...prev,
        resources: {
          ...prev.resources,
          gold: Math.max(0, (prev.resources?.gold || 0) - costGold),
          food: Math.max(0, (prev.resources?.food || 0) - costFood),
          wood: Math.max(0, (prev.resources?.wood || 0) - costWood),
          stone: Math.max(0, (prev.resources?.stone || 0) - costStone),
          flora: Math.max(0, (prev.resources?.flora || 0) - costFlora)
        },
        currentResearch: {
          techId,
          startTime: Date.now(),
          duration,
          remaining: duration,
          progress: 0
        },
        battleLogs: [researchLog, ...(prev.battleLogs || [])]
      };
    });

    return true;
  };

  // Active Flora Expenditure ("Verdant Bloom"): Instantly complete production on all agricultural and timber plots
  const triggerVerdantBloom = (cost = 75) => {
    if ((gameState.resources?.flora || 0) < cost) {
      sounds.playFamineAlarm();
      return false;
    }

    sounds.playUpgrade();
    haptics.heavy();

    setGameState(prev => {
      const season = SEASONS[SEASON_ORDER[prev.timeState?.seasonIndex || 0]] || SEASONS.autumn;
      const weather = WEATHER_CONDITIONS[prev.timeState?.weather || 'autumn_breeze'] || WEATHER_CONDITIONS.clear;
      const factionData = FACTIONS[prev.faction] || FACTIONS.elves;
      const laborEfficiency = getLaborEfficiency(prev);
      const storageCaps = calculateResourceCaps(prev.buildings, prev.grid);
      if (factionData.element === 'Flora' && (season.id === 'autumn' || season.id === 'spring')) {
        storageCaps.food = Math.round(storageCaps.food * 1.25);
      }

      const updatedRes = { ...prev.resources };
      updatedRes.flora = Math.max(0, updatedRes.flora - cost);

      const resetTimers = { ...prev.harvestTimers };
      let harvestedCount = 0;

      const plots = prev.grid && Array.isArray(prev.grid) && prev.grid.some(p => p.buildingId)
        ? prev.grid.filter(p => p.buildingId)
        : Object.keys(BUILDINGS).map(bId => ({ id: bId, buildingId: bId, level: prev.buildings[bId] || 1 }));

      plots.forEach(plot => {
        const isAgriTimber = plot.buildingId === 'farm' || plot.buildingId === 'granary' || plot.buildingId === 'lumber';
        if (!isAgriTimber) return;

        const bDef = BUILDINGS[plot.buildingId];
        if (!bDef || !bDef.baseYield) return;

        harvestedCount++;
        const lvl = plot.level || 1;
        const [resKey, baseVal] = Object.entries(bDef.baseYield)[0];
        const fMult = factionData.productionMultipliers?.[resKey] || 1.0;
        const sMult = season.multipliers?.[resKey] || 1.0;
        const wMult = weather.multipliers?.[resKey] || 1.0;
        const farmFertilityMult = plot.buildingId === 'farm' ? (1 + (prev.soilFertilityBonus || 0)) : 1.0;

        const totalYield = Math.round(
          baseVal * (1 + (lvl - 1) * 0.5) * fMult * sMult * wMult * 1.0 * farmFertilityMult
        );

        const cap = storageCaps[resKey] || 1000;
        updatedRes[resKey] = Math.min(cap, (updatedRes[resKey] || 0) + totalYield);

        resetTimers[plot.id] = 0;
        if (plot.buildingId) resetTimers[plot.buildingId] = 0;
      });

      const bloomLog = {
        id: `log-bloom-${Date.now()}`,
        title: 'Verdant Bloom Catalyzed',
        text: `Channeled ${cost} Flora to catalyze rapid botanical acceleration, instantly harvesting and replenishing ${harvestedCount} agricultural and timber plots.`,
        type: 'win',
        timestamp: Date.now()
      };

      return {
        ...prev,
        resources: updatedRes,
        harvestTimers: resetTimers,
        battleLogs: [bloomLog, ...(prev.battleLogs || [])]
      };
    });

    return true;
  };

  // Toggle Living Bramble Shield Defense Barrier
  const toggleBrambleShield = () => {
    sounds.playWaxSealThud();
    haptics.heavy();

    setGameState(prev => {
      const nextActive = !prev.brambleShieldActive;
      if (nextActive && (prev.resources?.flora || 0) < 2) {
        sounds.playFamineAlarm();
        return prev;
      }

      const shieldLog = {
        id: `log-shield-${Date.now()}`,
        title: nextActive ? 'Living Bramble Shield Raised' : 'Living Bramble Shield Lowered',
        text: nextActive
          ? 'Perimeter fortified with living briars. Plunder and casualty losses during raids reduced by 40% (Upkeep: 2 Flora/hr, or 1 Flora/hr with Bramble Bastion).'
          : 'Dismantled living briar barriers.',
        type: nextActive ? 'win' : 'loss',
        timestamp: Date.now()
      };

      return {
        ...prev,
        brambleShieldActive: nextActive,
        battleLogs: [shieldLog, ...(prev.battleLogs || [])]
      };
    });
  };

  // Deep Vault Transmutation (Alchemical Press & Herbal Crucible)
  const transmuteFlora = (recipeType) => {
    // Transmute Granite: 100 Flora + 50 Sustenance -> 50 Stone
    // Herbal Tinctures: 100 Flora + 25 Sustenance -> 40 Gold
    const isGranite = recipeType === 'stone' || recipeType === 'granite';
    const reqFlora = 100;
    const reqFood = isGranite ? 50 : 25;
    const gainRes = isGranite ? 'stone' : 'gold';
    const gainAmt = isGranite ? 50 : 40;

    if (
      (gameState.resources?.flora || 0) < reqFlora ||
      (gameState.resources?.food || 0) < reqFood
    ) {
      sounds.playFamineAlarm();
      return false;
    }

    sounds.playCoin();
    haptics.harvest();

    setGameState(prev => {
      const storageCaps = calculateResourceCaps(prev.buildings, prev.grid);
      const targetCap = storageCaps[gainRes] || 1000;

      const transLog = {
        id: `log-transmute-${Date.now()}`,
        title: isGranite ? 'Alchemical Press: Transmute Granite' : 'Herbal Crucible: Herbal Tinctures',
        text: `The Deep Vault crucible transmuted ${reqFlora} Flora & ${reqFood} Sustenance into +${gainAmt} ${isGranite ? 'Stone' : 'Gold'}.`,
        type: 'win',
        timestamp: Date.now()
      };

      return {
        ...prev,
        resources: {
          ...prev.resources,
          flora: Math.max(0, (prev.resources?.flora || 0) - reqFlora),
          food: Math.max(0, (prev.resources?.food || 0) - reqFood),
          [gainRes]: Math.min(targetCap, (prev.resources?.[gainRes] || 0) + gainAmt)
        },
        battleLogs: [transLog, ...(prev.battleLogs || [])]
      };
    });

    return true;
  };

  // Emergency "Forage Wilds" Decree: Exchange 25 Flora or 20 Gold for +60 Sustenance (60s cooldown, available when Sustenance < 30)
  const forageEmergencyRations = () => {
    const now = Date.now();
    if (now - lastForageTimestamp < 60000) {
      sounds.playFamineAlarm();
      return false;
    }

    if ((gameState.resources?.food || 0) >= 30) {
      return false;
    }

    const hasFlora = (gameState.resources?.flora || 0) >= 25;
    const hasGold = (gameState.resources?.gold || 0) >= 20;

    if (!hasFlora && !hasGold) {
      sounds.playFamineAlarm();
      return false;
    }

    const payWithFlora = hasFlora;
    const deductedCostText = payWithFlora ? '25 Flora' : '20 Gold';

    sounds.playHarvest();
    haptics.harvest();

    setGameState(prev => {
      const storageCaps = calculateResourceCaps(prev.buildings, prev.grid);
      const foodCap = storageCaps.food || 1000;

      const forageLog = {
        id: `log-forage-${now}`,
        title: 'Emergency Rations Foraged',
        text: `Scouts foraged the outer wilds, securing +60 Sustenance in exchange for ${deductedCostText}. Famine held at bay.`,
        type: 'win',
        timestamp: now
      };

      const updatedRes = { ...prev.resources };
      if (payWithFlora) {
        updatedRes.flora = Math.max(0, (updatedRes.flora || 0) - 25);
      } else {
        updatedRes.gold = Math.max(0, (updatedRes.gold || 0) - 20);
      }
      updatedRes.food = Math.min(foodCap, (updatedRes.food || 0) + 60);

      return {
        ...prev,
        resources: updatedRes,
        battleLogs: [forageLog, ...(prev.battleLogs || [])]
      };
    });

    setLastForageTimestamp(now);
    return true;
  };

  const handleBulkUpgradeBuildings = (buildingIds = [], currentFaction, onTriggerDecreeStamp) => {
    if (!buildingIds || buildingIds.length === 0 || !currentFaction) return false;

    const discount = currentFaction.id === 'humans' ? 0.5 : 1.0;
    let totalGold = 0;
    let totalWood = 0;
    let totalStone = 0;

    const upgradeList = [];

    buildingIds.forEach(id => {
      const plot = (gameState.grid || []).find(p => p.id === id || p.buildingId === id);
      const bId = plot ? plot.buildingId : id;
      const bDef = BUILDINGS[bId];
      if (bDef) {
        const currentLvl = plot ? (plot.level || 1) : (gameState.buildings[bId] || 1);
        const { gold: g, wood: w, stone: s } = getBuildingUpgradeCost(bDef, currentLvl, discount);
        totalGold += g;
        totalWood += w;
        totalStone += s;
        upgradeList.push({ id, plotId: plot ? plot.id : null, bId, bDef, currentLvl });
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
      let nextGrid = prev.grid;
      const nextBuildings = { ...prev.buildings };
      let popGain = 0;
      let garGain = 0;

      if (prev.grid && Array.isArray(prev.grid)) {
        nextGrid = prev.grid.map(plot => {
          const item = upgradeList.find(u => u.plotId === plot.id || (u.id === plot.id));
          if (item) {
            return { ...plot, level: (plot.level || 1) + 1 };
          }
          return plot;
        });

        // Recalculate max building tiers
        Object.keys(BUILDINGS).forEach(bKey => {
          const plotsOfType = nextGrid.filter(p => p.buildingId === bKey);
          if (plotsOfType.length > 0) {
            nextBuildings[bKey] = Math.max(...plotsOfType.map(p => p.level || 1));
          }
        });
      }

      upgradeList.forEach(item => {
        if (!nextGrid) {
          nextBuildings[item.bId] = (nextBuildings[item.bId] || 1) + 1;
        }
        popGain += (item.bId === 'granary' || item.bId === 'keep' || item.bId === 'farm' ? 3 : 1);
        garGain += (item.bId === 'watchtower' || item.bId === 'keep' || item.bId === 'barracks' ? 2 : 0);
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
        grid: nextGrid,
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

  const forageCooldownSec = Math.max(0, Math.ceil((60000 - (Date.now() - lastForageTimestamp)) / 1000));
  const canForage =
    (gameState.resources?.food || 0) < 30 &&
    forageCooldownSec === 0 &&
    ((gameState.resources?.flora || 0) >= 25 || (gameState.resources?.gold || 0) >= 20);

  return {
    gameState,
    setGameState,
    settings,
    handleUpdateSettings,
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
    researchTech: handleResearchTechnology,
    unlockedTech: gameState.technologies || [],
    currentResearch: gameState.currentResearch || null,
    researchProgress: gameState.currentResearch
      ? Math.min(1, Math.max(0, 1 - ((gameState.currentResearch.remaining || 0) / (gameState.currentResearch.duration || 1))))
      : 0,
    brambleShieldActive: gameState.brambleShieldActive || false,
    soilFertilityBonus: gameState.soilFertilityBonus || 0,
    triggerVerdantBloom,
    toggleBrambleShield,
    transmuteFlora,
    forageEmergencyRations,
    canForage,
    forageCooldownSec,
    constructBuilding,
    expandTerritory,
    trainTroops,
    recordRaidVictory,
    handleDoubleRaidSpoils,
    handleResetKingdom,
    selectFaction
  };
}
