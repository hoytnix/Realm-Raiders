import React, { useState, useCallback } from 'react';
import {
  SEASONS,
  WEATHER_CONDITIONS,
  SEASON_ORDER,
  FACTIONS,
  BUILDINGS,
  DEFAULT_STATE,
  SoundController,
  sounds,
  ISO_W,
  ISO_H,
  gridToParchmentIso
} from './src/constants/index.js';

import {
  useGameState,
  usePlayerStats,
  useDeskTilt,
  useRaidBattle
} from './src/hooks/index.js';

import {
  WaxStampCursor,
  WaxSplats
} from './src/components/common/index.js';

import {
  MonarchHeader
} from './src/components/hud/index.js';

import {
  ThroneRoomBackground,
  DeskSurface,
  ThroneArmrests
} from './src/components/desk/index.js';

import {
  ParchmentCitadelMap
} from './src/components/citadel/index.js';

import {
  ParchmentWarCouncil,
  ParchmentRaidBattlefieldModal,
  RewardedAdGateModal
} from './src/components/combat/index.js';

import {
  ParchmentChronicleTome
} from './src/components/chronicle/index.js';

import {
  ParchmentMenuView
} from './src/components/menu/index.js';

import {
  ThroneRoomOnboarding
} from './src/components/onboarding/index.js';

// Backward compatibility re-exports
export {
  SEASONS,
  WEATHER_CONDITIONS,
  SEASON_ORDER,
  FACTIONS,
  BUILDINGS,
  DEFAULT_STATE,
  SoundController,
  sounds,
  ISO_W,
  ISO_H,
  gridToParchmentIso
};

// ==========================================
// MAIN ORCHESTRATOR COMPONENT
// ==========================================
export default function App() {
  // Navigation desk mode: 'citadel' | 'war' | 'chronicle' | 'menu'
  const [deskView, setDeskView] = useState('citadel');
  const [selectedBuildingId, setSelectedBuildingId] = useState('keep');

  // Modular Custom Hooks
  const {
    gameState,
    isMuted,
    setIsMuted,
    isStarving,
    inkPulseTick,
    handleToggleSpeed,
    handleHarvestBuilding,
    handleIssueRoyalDecree,
    recordRaidVictory,
    handleDoubleRaidSpoils,
    handleResetKingdom,
    selectFaction
  } = useGameState();

  const { currentFaction, stats } = usePlayerStats(gameState);

  const {
    tilt,
    cursorPos,
    isHoveringUpgradeable,
    setIsHoveringUpgradeable,
    stampingDecree,
    waxSplats,
    handlePointerMove,
    triggerWaxSplat
  } = useDeskTilt();

  const {
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
  } = useRaidBattle();

  // Building Upgrade with Diegetic Wax Stamp Trigger
  const onUpgradeBuilding = useCallback((bId, e) => {
    handleIssueRoyalDecree(bId, currentFaction, () => {
      if (e && e.clientX) {
        triggerWaxSplat(e.clientX, e.clientY);
      }
    });
  }, [handleIssueRoyalDecree, currentFaction, triggerWaxSplat]);

  // Building Yield Harvest
  const onHarvest = useCallback((bId) => {
    handleHarvestBuilding(bId, stats.caps, currentFaction);
  }, [handleHarvestBuilding, stats.caps, currentFaction]);

  // Catapult Strike Action
  const onStrike = useCallback((targetKey) => {
    handleCatapultStrike(
      targetKey,
      gameState.faction,
      gameState.timeState,
      (rival, lootGained) => recordRaidVictory(rival, lootGained, stats.caps)
    );
  }, [handleCatapultStrike, gameState.faction, gameState.timeState, recordRaidVictory, stats.caps]);

  // Double Raid Bounty
  const onDoubleLoot = useCallback(() => {
    handleDoubleRaidBounty((doubledLoot) => {
      handleDoubleRaidSpoils(doubledLoot, stats.caps);
    });
  }, [handleDoubleRaidBounty, handleDoubleRaidSpoils, stats.caps]);

  // Blood Feud Declaration
  const onDeclareBloodFeud = useCallback((feudRecord) => {
    const feudRival = {
      id: `feud-${feudRecord.id}`,
      name: feudRecord.rivalName,
      faction: feudRecord.rivalFaction,
      rating: stats.overallRating,
      defensePower: stats.defensePower,
      lootPool: {
        gold: (feudRecord.stolen.gold || 50) * 2,
        food: (feudRecord.stolen.food || 50) * 2,
        wood: (feudRecord.stolen.wood || 40) * 2,
        stone: (feudRecord.stolen.stone || 40) * 2,
        flora: (feudRecord.stolen.flora || 20) * 2
      }
    };
    startRaidAdFlow(feudRival);
  }, [stats.overallRating, stats.defensePower, startRaidAdFlow]);

  // Kingdom Reset Rebirth
  const onResetSave = useCallback(() => {
    handleResetKingdom();
    setDeskView('citadel');
  }, [handleResetKingdom]);

  // Menu Navigation
  const onNavigateMenu = useCallback((view) => {
    if (view === 'war') sounds.playDaggerThrust();
    else sounds.playCoin();
    setDeskView(view);
  }, []);

  // Onboarding Allegiance Selection
  if (!gameState.faction) {
    return <ThroneRoomOnboarding onSelectFaction={selectFaction} />;
  }

  const timeState = gameState.timeState || {
    day: 1,
    hour: 8,
    minute: 0,
    seasonIndex: 0,
    weather: 'clear',
    timeSpeed: 1
  };

  return (
    <div
      onMouseMove={handlePointerMove}
      className={`relative w-full h-screen overflow-hidden bg-stone-950 font-serif select-none flex flex-col justify-between ${
        screenShake ? 'animate-bounce' : ''
      }`}
    >
      {/* DIEGETIC WAX STAMP CURSOR */}
      <WaxStampCursor
        isVisible={isHoveringUpgradeable}
        cursorPos={cursorPos}
        stampingDecree={stampingDecree}
      />

      {/* Ephemeral Stamped Crimson Wax Splats */}
      <WaxSplats splats={waxSplats} />

      {/* LAYER 1: UPPER BACKGROUND (Parallax Masonry Arch & God-Rays) */}
      <ThroneRoomBackground
        tilt={tilt}
        isStarving={isStarving}
        currentFaction={currentFaction}
      />

      {/* LAYER 2: DIEGETIC STATUS HUD (Floating Gilded Banner) */}
      <MonarchHeader
        currentFaction={currentFaction}
        stats={stats}
        timeState={timeState}
        resources={gameState.resources}
        isMuted={isMuted}
        isStarving={isStarving}
        onToggleSpeed={handleToggleSpeed}
        onToggleMute={() => setIsMuted(!isMuted)}
      />

      {/* LAYER 3: THE OAK WAR TABLE & THE LIVING PARCHMENT */}
      <DeskSurface
        tilt={tilt}
        isStarving={isStarving}
        gameState={gameState}
        stats={stats}
        currentFaction={currentFaction}
        deskView={deskView}
        setDeskView={setDeskView}
      >
        {deskView === 'citadel' && (
          <ParchmentCitadelMap
            buildings={gameState.buildings}
            harvestTimers={gameState.harvestTimers}
            onHarvest={onHarvest}
            selectedBuildingId={selectedBuildingId}
            onSelectBuilding={setSelectedBuildingId}
            onUpgradeBuilding={onUpgradeBuilding}
            resources={gameState.resources}
            faction={currentFaction}
            stats={stats}
            timeState={timeState}
            inkPulseTick={inkPulseTick}
            stampingDecree={stampingDecree}
            onHoverUpgrade={setIsHoveringUpgradeable}
          />
        )}

        {deskView === 'war' && (
          <ParchmentWarCouncil
            stats={stats}
            state={gameState}
            onLaunchRaid={startRaidAdFlow}
            onDeclareBloodFeud={onDeclareBloodFeud}
          />
        )}

        {deskView === 'chronicle' && (
          <ParchmentChronicleTome
            logs={gameState.battleLogs}
            state={gameState}
            onResetSave={onResetSave}
          />
        )}

        {deskView === 'menu' && (
          <ParchmentMenuView
            currentFaction={currentFaction}
            stats={stats}
            state={gameState}
            isMuted={isMuted}
            onToggleMute={() => setIsMuted(!isMuted)}
            onNavigate={onNavigateMenu}
            onResetSave={onResetSave}
          />
        )}
      </DeskSurface>

      {/* LAYER 4: LOWER FOREGROUND (The Royal Throne & Monarch Hands) */}
      <ThroneArmrests
        tilt={tilt}
        currentFaction={currentFaction}
        setDeskView={setDeskView}
      />

      {/* REWARDED VIDEO AD GATE SIMULATOR */}
      {adModalOpen && (
        <RewardedAdGateModal
          countdown={adCountdown}
          targetRival={pendingRaidTarget}
          onComplete={confirmAdAndLaunchPillage}
          onDevSkip={confirmAdAndLaunchPillage}
        />
      )}

      {/* ACTIVE 2.5D CATAPULT RAID */}
      {activeRaid && (
        <ParchmentRaidBattlefieldModal
          raid={activeRaid}
          onStrike={onStrike}
          onDoubleLoot={onDoubleLoot}
          onClose={closeRaid}
        />
      )}
    </div>
  );
}
