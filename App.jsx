import React, { useState, useCallback } from 'react';
import {
  SEASONS,
  WEATHER_CONDITIONS,
  SEASON_ORDER,
  FACTIONS,
  BUILDINGS,
  EMPTY_PLOT,
  DEFAULT_STATE,
  TECHNOLOGIES,
  TECH_CATEGORIES,
  SoundController,
  sounds,
  ISO_W,
  ISO_H,
  gridToParchmentIso,
  getBuildingUpgradeCost
} from './src/constants/index.js';

import {
  useGameState,
  usePlayerStats,
  useDeskTilt,
  useRaidBattle,
  useHotkeys
} from './src/hooks/index.js';

import {
  WaxStampCursor,
  WaxSplats
} from './src/components/common/index.js';

import {
  MobileTechCodexModal
} from './src/components/technology/index.js';

import {
  MonarchHeader,
  MobileBottomNav,
  MobileFloatingHUD,
  MobileFloraSheet,
  ResourceBar
} from './src/components/hud/index.js';

import {
  ThroneRoomBackground,
  DeskSurface,
  ThroneArmrests,
  SovereignCommandDock,
  ParchmentFloraDesk
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
  ParchmentMenuView,
  ParchmentSettingsModal
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
  EMPTY_PLOT,
  DEFAULT_STATE,
  TECHNOLOGIES,
  TECH_CATEGORIES,
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

  // Desktop UX & Diegetic Paraphernalia state
  const [candlelitMode, setCandlelitMode] = useState(false);
  const [isStampCursorEquipped, setIsStampCursorEquipped] = useState(false);
  const [multiSelectedIds, setMultiSelectedIds] = useState([]);
  const [activeLedgerTab, setActiveLedgerTab] = useState('structure');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTechCodexOpen, setIsTechCodexOpen] = useState(false);
  const [isFloraSheetOpen, setIsFloraSheetOpen] = useState(false);
  const [isInspectorExpanded, setIsInspectorExpanded] = useState(false);

  // Modular Custom Hooks
  const {
    gameState,
    settings,
    handleUpdateSettings,
    isMuted,
    setIsMuted,
    isStarving,
    starvationDeaths,
    inkPulseTick,
    handleHarvestBuilding,
    handleHarvestAll,
    handleIssueRoyalDecree,
    handleBulkUpgradeBuildings,
    handleResearchTechnology,
    researchTech,
    unlockedTech,
    currentResearch,
    researchProgress,
    constructBuilding,
    expandTerritory,
    trainTroops,
    recordRaidVictory,
    handleDoubleRaidSpoils,
    handleResetKingdom,
    selectFaction,
    brambleShieldActive,
    soilFertilityBonus,
    triggerVerdantBloom,
    toggleBrambleShield,
    transmuteFlora,
    forageEmergencyRations,
    canForage,
    forageCooldownSec,
    setGameState
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

  // Full Ergonomic Desktop Hotkeys Binding
  useHotkeys({
    onClaimAll: () => handleHarvestAll(stats.caps, currentFaction),
    setDeskView: (view) => {
      if (view === 'war') sounds.playDaggerThrust();
      else sounds.playCoin();
      setDeskView(view);
    },
    onToggleTech: () => {
      sounds.playCoin();
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        setIsTechCodexOpen(prev => !prev);
      } else {
        setDeskView('citadel');
        setActiveLedgerTab('decrees');
      }
    },
    onOpenFlora: () => {
      sounds.playCoin();
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        setIsFloraSheetOpen(prev => !prev);
      } else {
        setDeskView('flora');
      }
    },
    onEscape: () => {
      if (isFloraSheetOpen) {
        setIsFloraSheetOpen(false);
      } else if (isTechCodexOpen) {
        setIsTechCodexOpen(false);
      } else if (multiSelectedIds.length > 0) {
        setMultiSelectedIds([]);
      } else if (activeRaid) {
        closeRaid();
      }
    }
  });

  // Building Upgrade with Diegetic Wax Stamp Trigger
  const onUpgradeBuilding = useCallback((bId, e) => {
    handleIssueRoyalDecree(bId, currentFaction, () => {
      if (e && e.clientX) {
        triggerWaxSplat(e.clientX, e.clientY);
      }
    });
  }, [handleIssueRoyalDecree, currentFaction, triggerWaxSplat]);

  // Multi-Building Marquee Bulk Upgrade Decree
  const onBulkUpgrade = useCallback((ids) => {
    handleBulkUpgradeBuildings(ids, currentFaction, () => {
      triggerWaxSplat(
        typeof window !== 'undefined' ? window.innerWidth * 0.72 : 400,
        typeof window !== 'undefined' ? window.innerHeight * 0.5 : 300
      );
    });
  }, [handleBulkUpgradeBuildings, currentFaction, triggerWaxSplat]);

  // Technology Research Decree with Diegetic Wax Stamp Trigger
  const onResearchTechnology = useCallback((techId, e) => {
    handleResearchTechnology(techId, () => {
      triggerWaxSplat(
        e?.clientX || (typeof window !== 'undefined' ? window.innerWidth / 2 : 200),
        e?.clientY || (typeof window !== 'undefined' ? window.innerHeight / 2 : 200)
      );
    });
  }, [handleResearchTechnology, triggerWaxSplat]);

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

  // Launch Catapult Raid with Flora Infusion Deduction
  const handleLaunchRaid = useCallback((targetRival, options = {}) => {
    if (options?.floraCost > 0) {
      setGameState(prev => ({
        ...prev,
        resources: {
          ...prev.resources,
          flora: Math.max(0, (prev.resources?.flora || 0) - options.floraCost)
        }
      }));
    }
    startRaidAdFlow(targetRival, options);
  }, [setGameState, startRaidAdFlow]);

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

  const readyHarvestsCount = (gameState.grid && Array.isArray(gameState.grid) && gameState.grid.some(p => p.buildingId))
    ? gameState.grid.filter(p => {
        if (!p.buildingId) return false;
        const bDef = BUILDINGS[p.buildingId];
        if (!bDef || !bDef.cycleDuration) return false;
        const prog = gameState.harvestTimers[p.id] ?? gameState.harvestTimers[p.buildingId] ?? 0;
        return prog >= bDef.cycleDuration;
      }).length
    : Object.keys(BUILDINGS).filter(bId => {
        const bDef = BUILDINGS[bId];
        return bDef && bDef.cycleDuration && (gameState.harvestTimers[bId] || 0) >= bDef.cycleDuration;
      }).length;

  const selectedPlot = (gameState.grid || []).find(p => p.id === selectedBuildingId || p.buildingId === selectedBuildingId);
  const isEmptyPlot = selectedPlot ? !selectedPlot.buildingId : (selectedBuildingId?.startsWith('plot-') || false);
  const selectedDef = selectedPlot?.buildingId ? (BUILDINGS[selectedPlot.buildingId] || BUILDINGS.keep) : (isEmptyPlot ? EMPTY_PLOT : (BUILDINGS[selectedBuildingId] || BUILDINGS.keep));
  const currentLvl = selectedPlot ? (selectedPlot.buildingId ? (selectedPlot.level || 1) : 0) : (isEmptyPlot ? 0 : (gameState.buildings[selectedBuildingId] || 1));
  const discount = currentFaction?.id === 'humans' ? 0.5 : 1.0;
  const { gold: costGold, wood: costWood, stone: costStone } = isEmptyPlot
    ? { gold: 0, wood: 0, stone: 0 }
    : getBuildingUpgradeCost(selectedDef, currentLvl, discount);
  const canUpgradeSelected =
    !isEmptyPlot &&
    gameState.resources.gold >= costGold &&
    gameState.resources.wood >= costWood &&
    gameState.resources.stone >= costStone;

  const hasUnavengedFeuds = gameState.revengeLedger.some(r => !r.revenged);
  const hasTroopLogistics = (gameState.technologies || []).includes('tech_troop_logistics');
  const isResearching = !!(currentResearch || gameState.currentResearch);

  const currentKeepLvl = (gameState.grid && Array.isArray(gameState.grid)
    ? gameState.grid.find(p => p.buildingId === 'keep')?.level
    : null) || gameState.buildings?.keep || 1;

  const canResearchAny = Object.values(TECHNOLOGIES).some(tech => {
    if ((gameState.technologies || []).includes(tech.id)) return false;
    const reqKeep = tech.requirements?.keepTier || 1;
    if (currentKeepLvl < reqKeep) return false;
    const cGold = Math.round((tech.requirements?.cost?.gold || 0) * discount);
    const cFood = Math.round((tech.requirements?.cost?.food || 0) * discount);
    const cWood = Math.round((tech.requirements?.cost?.wood || 0) * discount);
    const cStone = Math.round((tech.requirements?.cost?.stone || 0) * discount);
    return (
      (gameState.resources?.gold || 0) >= cGold &&
      (gameState.resources?.food || 0) >= cFood &&
      (gameState.resources?.wood || 0) >= cWood &&
      (gameState.resources?.stone || 0) >= cStone
    );
  });

  return (
    <div
      onMouseMove={handlePointerMove}
      className={`relative w-full h-[100dvh] overflow-hidden bg-stone-950 font-serif select-none flex flex-col justify-between ${
        screenShake ? 'animate-bounce' : ''
      }`}
    >
      {/* DIEGETIC WAX STAMP CURSOR */}
      <WaxStampCursor
        isVisible={isHoveringUpgradeable || isStampCursorEquipped}
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
        candlelitMode={candlelitMode}
        onToggleCandlelight={() => setCandlelitMode(v => !v)}
      />

      {/* LAYER 2A: DESKTOP DIEGETIC STATUS HUD (Floating Gilded Crown Bar with Persistent ResourceBar) */}
      <MonarchHeader
        currentFaction={currentFaction}
        stats={stats}
        timeState={timeState}
        resources={gameState.resources}
        isMuted={isMuted}
        isStarving={isStarving}
        starvationDeaths={starvationDeaths}
        brambleShieldActive={brambleShieldActive}
        onToggleBrambleShield={toggleBrambleShield}
        onTriggerVerdantBloom={triggerVerdantBloom}
        onToggleMute={() => setIsMuted(!isMuted)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onRaidGrain={() => setDeskView('war')}
        onForage={forageEmergencyRations}
        canForage={canForage}
        forageCooldownSec={forageCooldownSec}
      />

      {/* LAYER 2B: MOBILE FLOATING HUD (< md Minimal Chronometer) */}
      <MobileFloatingHUD
        timeState={timeState}
        deskView={deskView}
      />

      {/* LAYER 2C: MOBILE RESOURCE HUD DOCKED DIRECTLY ABOVE THE ROYAL LEDGER (Exclusively on Citadel tab) */}
      {deskView === 'citadel' && (
        <div
          className={`md:hidden fixed left-0 right-0 z-30 px-2 pointer-events-none flex justify-center transition-all duration-300 ease-out ${
            isInspectorExpanded ? 'bottom-[calc(75vh+3.5rem+4px)]' : 'bottom-[calc(3.5rem+3rem+4px)]'
          }`}
        >
          <div className="pointer-events-auto max-w-full">
            <ResourceBar
              resources={gameState.resources}
              stats={stats}
              variant="mobile"
            />
          </div>
        </div>
      )}

      {/* LAYER 3: THE OAK WAR TABLE & THE LIVING PARCHMENT */}
      <DeskSurface
        tilt={tilt}
        isStarving={isStarving}
        gameState={gameState}
        stats={stats}
        currentFaction={currentFaction}
        deskView={deskView}
        setDeskView={setDeskView}
        onToggleStampCursor={() => setIsStampCursorEquipped(v => !v)}
        isStampCursorEquipped={isStampCursorEquipped}
      >
        {deskView === 'citadel' && (
          <ParchmentCitadelMap
            buildings={gameState.buildings}
            harvestTimers={gameState.harvestTimers}
            grid={gameState.grid}
            territoryTier={gameState.territoryTier || 1}
            troops={gameState.troops}
            technologies={gameState.technologies || []}
            onHarvest={onHarvest}
            onHarvestAll={handleHarvestAll}
            selectedBuildingId={selectedBuildingId}
            onSelectBuilding={setSelectedBuildingId}
            onUpgradeBuilding={onUpgradeBuilding}
            onConstructBuilding={constructBuilding}
            onExpandTerritory={expandTerritory}
            onTrainTroops={trainTroops}
            onResearchTechnology={onResearchTechnology}
            onTransmuteFlora={transmuteFlora}
            onTriggerVerdantBloom={triggerVerdantBloom}
            brambleShieldActive={brambleShieldActive}
            onToggleBrambleShield={toggleBrambleShield}
            resources={gameState.resources}
            faction={currentFaction}
            stats={stats}
            timeState={timeState}
            inkPulseTick={inkPulseTick}
            stampingDecree={stampingDecree}
            onHoverUpgrade={setIsHoveringUpgradeable}
            multiSelectedIds={multiSelectedIds}
            onMultiSelectBuildings={setMultiSelectedIds}
            onClearMultiSelect={() => setMultiSelectedIds([])}
            onBulkUpgrade={onBulkUpgrade}
            activeLedgerTab={activeLedgerTab}
            setActiveLedgerTab={setActiveLedgerTab}
            battleLogs={gameState.battleLogs}
            isInspectorExpanded={isInspectorExpanded}
            setIsInspectorExpanded={setIsInspectorExpanded}
          />
        )}

        {deskView === 'war' && (
          <ParchmentWarCouncil
            stats={stats}
            state={gameState}
            onLaunchRaid={handleLaunchRaid}
            onDeclareBloodFeud={onDeclareBloodFeud}
            onResearchTechnology={onResearchTechnology}
            onTrainTroops={trainTroops}
          />
        )}

        {deskView === 'flora' && (
          <ParchmentFloraDesk
            stats={stats}
            resources={gameState.resources}
            timeState={timeState}
            brambleShieldActive={brambleShieldActive}
            onToggleBrambleShield={toggleBrambleShield}
            onTriggerVerdantBloom={triggerVerdantBloom}
            onTransmuteFlora={transmuteFlora}
            currentFaction={currentFaction}
          />
        )}

        {deskView === 'chronicle' && (
          <div className="h-full min-h-0 flex-1 flex flex-col w-full">
            <ParchmentChronicleTome
              logs={gameState.battleLogs}
              state={gameState}
              onResetSave={onResetSave}
            />
          </div>
        )}

        {deskView === 'menu' && (
          <ParchmentMenuView
            currentFaction={currentFaction}
            stats={stats}
            state={gameState}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            isSettingsOpen={isSettingsOpen}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onCloseSettings={() => setIsSettingsOpen(false)}
            onNavigate={onNavigateMenu}
            onResetSave={onResetSave}
          />
        )}
      </DeskSurface>

      {/* LAYER 4: LOWER FOREGROUND (The Royal Throne & Monarch Hands - Desktop only) */}
      <ThroneArmrests
        tilt={tilt}
        currentFaction={currentFaction}
      />

      {/* LAYER 5: SOVEREIGN COMMAND DOCK (Desktop Centered Floating Navigation) */}
      <SovereignCommandDock
        deskView={deskView}
        setDeskView={setDeskView}
        hasUnavengedFeuds={hasUnavengedFeuds}
        readyHarvestsCount={readyHarvestsCount}
        onOpenFlora={() => setDeskView('flora')}
        isFloraOpen={deskView === 'flora'}
      />

      {/* LAYER 6: ERGONOMIC THUMB-ZONE BOTTOM NAVIGATION (Mobile only) */}
      <MobileBottomNav
        deskView={deskView}
        setDeskView={setDeskView}
        hasUnavengedFeuds={hasUnavengedFeuds}
        readyHarvestsCount={readyHarvestsCount}
        canUpgradeSelected={canUpgradeSelected}
        selectedBuildingName={selectedDef.name}
        isCodexOpen={isTechCodexOpen}
        onOpenCodex={() => setIsTechCodexOpen(true)}
        isFloraOpen={isFloraSheetOpen || deskView === 'flora'}
        onOpenFlora={() => setIsFloraSheetOpen(true)}
        isResearching={isResearching}
        canResearchAny={canResearchAny}
        resources={gameState.resources}
        stats={stats}
        onHarvestAll={() => handleHarvestAll(stats.caps, currentFaction)}
        onUpgradeSelected={(e) => onUpgradeBuilding(selectedBuildingId, e)}
        onTriggerStamp={(e) => triggerWaxSplat(e?.clientX || window.innerWidth / 2, e?.clientY || window.innerHeight / 2)}
      />

      {/* REALM SETTINGS & AUDIO MODAL */}
      <ParchmentSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onResetSave={onResetSave}
      />

      {/* MOBILE TECH CODEX & ROYAL DECREES MODAL */}
      <MobileTechCodexModal
        isOpen={isTechCodexOpen}
        onClose={() => setIsTechCodexOpen(false)}
        technologies={gameState.technologies || []}
        unlockedTech={unlockedTech || gameState.technologies || []}
        currentResearch={currentResearch || gameState.currentResearch || null}
        researchProgress={researchProgress || 0}
        onResearchTech={researchTech}
        onResearchTechnology={onResearchTechnology}
        researchTech={researchTech}
        resources={gameState.resources}
        buildings={gameState.buildings}
        grid={gameState.grid}
        currentFaction={currentFaction}
      />

      {/* MOBILE FLORA ELEMENTAL MANAGEMENT SHEET (Strictly Mobile < md) */}
      <div className="md:hidden">
        <MobileFloraSheet
          isOpen={isFloraSheetOpen || deskView === 'flora'}
          onClose={() => {
            setIsFloraSheetOpen(false);
            if (deskView === 'flora') setDeskView('citadel');
          }}
          stats={stats}
          resources={gameState.resources}
          timeState={timeState}
          brambleShieldActive={brambleShieldActive}
          onToggleBrambleShield={toggleBrambleShield}
          onTriggerVerdantBloom={triggerVerdantBloom}
          onTransmuteFlora={transmuteFlora}
          onNavigate={(view) => {
            setIsFloraSheetOpen(false);
            setDeskView(view);
          }}
        />
      </div>

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
