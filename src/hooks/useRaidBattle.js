import { useState, useEffect, useCallback } from 'react';
import {
  FACTIONS,
  SEASONS,
  SEASON_ORDER,
  WEATHER_CONDITIONS,
  getElementalMatchup,
  sounds
} from '../constants/index.js';

export function useRaidBattle() {
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [adCountdown, setAdCountdown] = useState(15);
  const [pendingRaidTarget, setPendingRaidTarget] = useState(null);

  const [activeRaid, setActiveRaid] = useState(null);
  const [screenShake, setScreenShake] = useState(false);

  // Rewarded Video Ad 15-second Countdown
  useEffect(() => {
    let timer;
    if (adModalOpen && adCountdown > 0) {
      timer = setTimeout(() => setAdCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [adModalOpen, adCountdown]);

  const startRaidAdFlow = useCallback((targetRival, options = {}) => {
    sounds.playCoin();
    setPendingRaidTarget({
      ...targetRival,
      isInfused: !!options?.isInfused
    });
    setAdCountdown(15);
    setAdModalOpen(true);
  }, []);

  const confirmAdAndLaunchPillage = useCallback(() => {
    if (!pendingRaidTarget) return;
    setAdModalOpen(false);
    sounds.playLaunch();
    setActiveRaid({
      rival: pendingRaidTarget,
      isInfused: !!pendingRaidTarget.isInfused,
      strikesLeft: 3,
      targetedBuildings: {},
      lootGained: { gold: 0, food: 0, wood: 0, stone: 0, flora: 0 },
      isFinished: false,
      doubled: false
    });
    setPendingRaidTarget(null);
  }, [pendingRaidTarget]);

  const handleCatapultStrike = useCallback((targetKey, factionId, timeState, onVictory) => {
    if (!activeRaid || activeRaid.strikesLeft <= 0 || activeRaid.isFinished) return;

    sounds.playImpact();
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 450);

    const { rival, targetedBuildings, lootGained, strikesLeft, isInfused } = activeRaid;
    const currentFactionData = FACTIONS[factionId] || FACTIONS.humans;
    const playerElement = currentFactionData.element || 'Flora';
    const rivalElement = rival.element || FACTIONS[rival.faction]?.element || 'Stone';
    const matchup = getElementalMatchup(playerElement, rivalElement);

    const seasonKey = SEASON_ORDER[timeState?.seasonIndex || 0];
    const season = SEASONS[seasonKey] || SEASONS.spring;
    const weather = WEATHER_CONDITIONS[timeState?.weather || 'clear'] || WEATHER_CONDITIONS.clear;
    const weatherRaidMult = weather.multipliers?.raidAtk || 1.0;
    const seasonRaidMult = season.id === 'autumn' ? 1.15 : 1.0;

    const elementalAtkMult = matchup.atkMult || 1.0;
    const infusionPlunderMult = (isInfused && (rivalElement === 'Stone' || rival.faction === 'dwarves')) ? 1.15 : 1.0;

    const bonusLootRatio = (currentFactionData.id === 'humans' ? 1.1 : 1.0) * seasonRaidMult * weatherRaidMult * elementalAtkMult * infusionPlunderMult;

    let lootStolen = 0;
    const newLoot = { ...lootGained };

    if (targetKey === 'granary') {
      lootStolen = Math.round((rival.lootPool.food * 0.35) * bonusLootRatio);
      newLoot.food += lootStolen;
    } else if (targetKey === 'vault') {
      lootStolen = Math.round((rival.lootPool.gold * 0.35) * bonusLootRatio);
      newLoot.gold += lootStolen;
    } else if (targetKey === 'lumber') {
      lootStolen = Math.round((rival.lootPool.wood * 0.35) * bonusLootRatio);
      newLoot.wood += lootStolen;
    } else if (targetKey === 'keep') {
      lootStolen = Math.round((rival.lootPool.stone * 0.25) * bonusLootRatio);
      newLoot.stone += lootStolen;
      newLoot.gold += Math.round((rival.lootPool.gold * 0.15) * bonusLootRatio);
    } else if (targetKey === 'watchtower') {
      newLoot.flora += Math.round((rival.lootPool.flora * 0.4) * bonusLootRatio);
    }

    const updatedStrikes = strikesLeft - 1;
    const nextRaidState = {
      ...activeRaid,
      strikesLeft: updatedStrikes,
      targetedBuildings: {
        ...targetedBuildings,
        [targetKey]: (targetedBuildings[targetKey] || 0) + 1
      },
      lootGained: newLoot,
      isFinished: updatedStrikes === 0
    };

    setActiveRaid(nextRaidState);

    if (updatedStrikes === 0 && onVictory) {
      onVictory(rival, newLoot);
    }
  }, [activeRaid]);

  const handleDoubleRaidBounty = useCallback((onDoubleSuccess) => {
    if (!activeRaid || activeRaid.doubled) return;
    sounds.playUpgrade();
    const doubledLoot = { ...activeRaid.lootGained };

    if (onDoubleSuccess) {
      onDoubleSuccess(doubledLoot);
    }

    setActiveRaid(prev => ({
      ...prev,
      doubled: true,
      lootGained: {
        gold: prev.lootGained.gold * 2,
        food: prev.lootGained.food * 2,
        wood: prev.lootGained.wood * 2,
        stone: prev.lootGained.stone * 2,
        flora: prev.lootGained.flora * 2
      }
    }));
  }, [activeRaid]);

  const closeRaid = useCallback(() => {
    setActiveRaid(null);
  }, []);

  return {
    adModalOpen,
    adCountdown,
    pendingRaidTarget,
    activeRaid,
    screenShake,
    startRaidAdFlow,
    confirmAdAndLaunchPillage,
    handleCatapultStrike,
    handleDoubleRaidBounty,
    closeRaid
  };
}
