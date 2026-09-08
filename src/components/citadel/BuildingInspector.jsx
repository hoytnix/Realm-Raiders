import React, { useState, useRef } from 'react';
import {
  BUILDINGS,
  EMPTY_PLOT,
  CONSTRUCTIBLE_BLUEPRINTS,
  TERRITORY_TIERS,
  MAX_TERRITORY_TIER,
  TROOP_RECRUIT_COST,
  toRomanTier,
  getTierEpoch,
  formatBuildDuration,
  calculateBuildingYield,
  calculateBuildDuration,
  sounds
} from '../../constants/index.js';
import { haptics, triggerHaptic } from '../../utils/index.js';

export function BuildingInspector({
  selectedDef = BUILDINGS.keep,
  selectedPlot = null,
  currentLvl = 1,
  costGold = 0,
  costWood = 0,
  costStone = 0,
  canAfford = false,
  resources = {},
  stampingDecree = false,
  onUpgradeBuilding,
  selectedBuildingId = 'keep',
  onHoverUpgrade,
  territoryTier = 1,
  troops = { total: 20, maxCapacity: 30, sustenanceUpkeepPerDay: 1 },
  stats = {},
  technologies = [],
  onConstructBuilding,
  onExpandTerritory,
  onTrainTroops,
  onResearchTechnology,
  onTransmuteFlora,
  villagers = [],
  onAssignWorker,
  onUnassignWorker,
  onOpenRoster,
  isExpanded: propIsExpanded,
  setIsExpanded: propSetIsExpanded
}) {
  const [localExpanded, setLocalExpanded] = useState(false);
  const isExpanded = propIsExpanded !== undefined ? propIsExpanded : localExpanded;
  const setIsExpanded = propSetIsExpanded || setLocalExpanded;
  const [selectedBlueprintKey, setSelectedBlueprintKey] = useState('farm');
  const [recruitCount, setRecruitCount] = useState(5);
  const touchStartY = useRef(0);

  const isEmptyPlot = selectedDef?.type === 'plot' || selectedDef?.id === 'empty_plot';
  const isKeep = selectedDef?.id === 'keep' || selectedBuildingId === 'keep';
  const isBarracks = selectedDef?.id === 'barracks' || selectedBuildingId === 'barracks';
  const isVault = selectedDef?.id === 'vault' || selectedBuildingId === 'vault';
  const isHarvestBuilding = selectedDef?.cycleDuration && selectedDef?.baseYield;
  const hasTroopLogistics = technologies.includes('tech_troop_logistics');
  const isAutomated = hasTroopLogistics && (troops?.total || 0) >= 1 && isHarvestBuilding;

  const inspectPlotId = selectedPlot?.id || selectedBuildingId;
  const isWorkerBuilding = ['farm', 'granary', 'lumber', 'quarry', 'well'].includes(selectedDef?.id);
  const assignedWorkers = (villagers || []).filter(v => v.assignedBuildingId === inspectPlotId);
  const maxWorkers = Math.min(5, (currentLvl || 1) + 1);
  const isUnstaffed = isWorkerBuilding && assignedWorkers.length === 0;

  const isUpgrading = !!selectedPlot?.isUpgrading;
  const upgradeTimeRemaining = selectedPlot?.upgradeTimeRemaining || 0;
  const totalUpgradeTime = selectedPlot?.totalUpgradeTime || calculateBuildDuration((currentLvl || 1) + 1);
  const targetTier = selectedPlot?.targetTier || ((currentLvl || 1) + 1);
  const epochInfo = getTierEpoch(currentLvl || 1);
  const isMaxTier = (currentLvl || 1) >= (selectedDef?.maxTier || 20);

  // Deep Vault Storage Gating
  const caps = stats?.caps || { gold: 1500, wood: 1000, stone: 1000, flora: 500 };
  const isVaultGated = (caps.gold < costGold || caps.wood < costWood || caps.stone < costStone);

  // Yield jump multipliers
  const currYield = isHarvestBuilding ? calculateBuildingYield(selectedDef.id, currentLvl || 1) : 0;
  const nextYield = isHarvestBuilding ? calculateBuildingYield(selectedDef.id, (currentLvl || 1) + 1) : 0;
  const yieldPct = currYield > 0 ? Math.round(((nextYield - currYield) / currYield) * 100) : 36;

  const currDef = Math.round((selectedDef?.baseHp || 650) * (1 + ((currentLvl || 1) - 1) * 0.4));
  const nextDef = Math.round((selectedDef?.baseHp || 650) * (1 + (currentLvl || 1) * 0.4));
  const currTroopCap = 30 + ((currentLvl || 1) * (selectedDef?.troopCapacity || 20));
  const nextTroopCap = 30 + (((currentLvl || 1) + 1) * (selectedDef?.troopCapacity || 20));
  const currTowerDef = Math.round((selectedDef?.defense || 38) * (currentLvl || 1));
  const nextTowerDef = Math.round((selectedDef?.defense || 38) * ((currentLvl || 1) + 1));

  const canAffordLogistics =
    !hasTroopLogistics &&
    currentLvl >= 1 &&
    (resources.gold || 0) >= 40 &&
    (resources.food || 0) >= 30;

  const toggleExpand = () => {
    haptics.light();
    setIsExpanded(prev => !prev);
  };

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchEndY - touchStartY.current;
    if (deltaY < -30) {
      haptics.light();
      setIsExpanded(true); // Swiped up
    } else if (deltaY > 30) {
      haptics.light();
      setIsExpanded(false); // Swiped down
    }
  };

  const handleUpgradeClick = (e) => {
    haptics.heavy();
    if (onUpgradeBuilding) {
      onUpgradeBuilding(selectedBuildingId, e);
    }
  };

  // Territory expansion data
  const nextTierIndex = territoryTier < MAX_TERRITORY_TIER ? territoryTier + 1 : null;
  const nextTierDef = nextTierIndex ? TERRITORY_TIERS[nextTierIndex] : null;
  const canAnnexTerritory =
    nextTierDef &&
    currentLvl >= nextTierDef.keepLevelReq &&
    resources.gold >= nextTierDef.cost.gold &&
    resources.wood >= nextTierDef.cost.wood &&
    resources.stone >= nextTierDef.cost.stone;

  // Selected Blueprint data
  const currentBlueprint = BUILDINGS[selectedBlueprintKey] || BUILDINGS.farm;
  const canAffordConstruct =
    resources.gold >= (currentBlueprint.baseCost?.gold || 0) &&
    resources.wood >= (currentBlueprint.baseCost?.wood || 0) &&
    resources.stone >= (currentBlueprint.baseCost?.stone || 0);

  // Troop recruitment data
  const maxTroopCap = stats.maxTroopCapacity || troops.maxCapacity || 30;
  const recruitCostGold = recruitCount * TROOP_RECRUIT_COST.gold;
  const recruitCostFood = recruitCount * TROOP_RECRUIT_COST.food;
  const canRecruit =
    resources.gold >= recruitCostGold &&
    resources.food >= recruitCostFood &&
    troops.total + recruitCount <= maxTroopCap;

  return (
    <>
      {/* =========================================================================
          THE ROYAL LEDGER (CITADEL INSPECTOR): MOBILE BOTTOM SHEET (< md)
          ========================================================================= */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`md:hidden fixed bottom-14 left-0 right-0 z-30 bg-[#e4d4b3] border-t-2 border-[#bfa379] shadow-[0_-10px_25px_rgba(0,0,0,0.4)] transition-all duration-300 ease-out flex flex-col ${
          isExpanded ? 'h-[75vh] p-3 overflow-hidden' : 'h-12 py-1 px-3 overflow-hidden'
        }`}
      >
        {/* Drag Handle Bar & Peek Header */}
        <div
          onClick={toggleExpand}
          className="w-full flex items-center justify-between cursor-pointer py-1 flex-shrink-0"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#cbb38b] border border-[#8c6843] flex items-center justify-center text-lg shadow-inner flex-shrink-0">
              {isEmptyPlot ? EMPTY_PLOT.inkSymbol : selectedDef?.inkSymbol}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-[#8c6843]">
                  The Royal Ledger
                </span>
                {!isEmptyPlot && (
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#6b4724] text-amber-200 font-bold">
                    T{currentLvl}
                  </span>
                )}
                {isAutomated && (
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-900/20 text-emerald-900 font-bold border border-emerald-700/40 flex items-center gap-0.5">
                    🛡️ Auto
                  </span>
                )}
              </div>
              <h3 className="text-xs font-black text-[#442813] leading-tight">
                {isEmptyPlot ? 'Cleared Foundation' : selectedDef?.name}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#6b4a2e] font-bold">
            {!isEmptyPlot && !isExpanded && (
              canAfford ? (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-green-900/20 text-green-900 font-bold border border-green-700/40 animate-pulse">
                  Ready ✨
                </span>
              ) : (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-900/10 text-amber-900 font-bold">
                  🪙{costGold}
                </span>
              )
            )}
            <span>{isExpanded ? '▼ Close' : isEmptyPlot ? '▲ Commission' : '▲ Royal Ledger'}</span>
          </div>
        </div>

        {/* Expanded Sheet Body */}
        {isExpanded && (
          <div className="flex-1 overflow-y-auto overscroll-contain mt-2 pt-2 border-t border-[#bfa379]/60 space-y-3 animate-in fade-in duration-200 pb-4">
            {/* MODE 1: EMPTY FOUNDATION CAROUSEL */}
            {isEmptyPlot ? (
              <div className="space-y-2">
                <p className="text-[11px] text-[#6b4a2e] leading-snug">
                  Select a blueprint to erect upon this foundation plot:
                </p>

                {/* Blueprints Horizontal Mini-Thumbnails */}
                <div className="flex items-center gap-2 overflow-x-auto py-1">
                  {CONSTRUCTIBLE_BLUEPRINTS.map(bpKey => {
                    const bp = BUILDINGS[bpKey];
                    if (!bp) return null;
                    const isSelectedBp = selectedBlueprintKey === bpKey;
                    return (
                      <button
                        key={bpKey}
                        onClick={() => {
                          sounds.playCoin();
                          haptics.light();
                          setSelectedBlueprintKey(bpKey);
                        }}
                        className={`p-2 rounded-xl border flex flex-col items-center min-w-[76px] transition flex-shrink-0 ${
                          isSelectedBp
                            ? 'bg-[#cbb38b] border-[#8c6843] shadow-md ring-2 ring-amber-600'
                            : 'bg-[#dfcba6] border-[#bfa379] hover:bg-[#d5be97]'
                        }`}
                      >
                        <span className="text-xl">{bp.inkSymbol}</span>
                        <span className="text-[10px] font-bold text-[#442813] line-clamp-1 mt-0.5">
                          {bp.name.split(' ')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => onConstructBuilding && onConstructBuilding(selectedBuildingId, selectedBlueprintKey)}
                  disabled={!canAffordConstruct}
                  className={`w-full py-3 rounded-xl font-black text-xs transition flex items-center justify-center gap-2 shadow-lg ${
                    canAffordConstruct
                      ? 'bg-gradient-to-r from-amber-800 to-yellow-800 text-amber-100 active:scale-95 shadow-amber-950/40 border border-amber-600'
                      : 'bg-stone-400 text-stone-700 cursor-not-allowed border border-stone-500'
                  }`}
                >
                  <span>🏗️</span>
                  <span>Erect Structure (Commission {currentBlueprint.name})</span>
                </button>
              </div>
            ) : (
              /* MODE 2: CONSTRUCTED STRUCTURE INSPECTION & UPGRADE */
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] text-[#6b4a2e] leading-snug flex-1">
                    {selectedDef?.description}
                  </p>
                </div>

                {/* ONGOING MASONRY PROGRESS TRACKING */}
                {isUpgrading && (
                  <div className="bg-[#dfcba6] p-3 rounded-2xl border-2 border-amber-800 shadow-md space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-[#442813] flex items-center gap-1.5">
                        <span className="animate-spin">🧱</span>
                        <span>Inscribing Foundations: Tier {toRomanTier(targetTier)}</span>
                      </span>
                      <span className="font-bold text-amber-950 bg-amber-900/15 px-2 py-0.5 rounded border border-amber-800/40">
                        {formatBuildDuration(upgradeTimeRemaining)}
                      </span>
                    </div>
                    <div className="w-full bg-stone-900/20 rounded-full h-3 overflow-hidden border border-[#8c6843]/60 p-0.5">
                      <div
                        className="bg-gradient-to-r from-amber-700 via-yellow-600 to-amber-500 h-full rounded-full transition-all duration-300 relative overflow-hidden"
                        style={{ width: `${Math.min(100, Math.max(5, Math.round((1 - (upgradeTimeRemaining / (totalUpgradeTime || 1))) * 100)))}%` }}
                      >
                        <div className="absolute inset-0 bg-white/25 animate-pulse" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#6b4a2e]">
                      <span>Workforce: {Math.round((1 - (upgradeTimeRemaining / (totalUpgradeTime || 1))) * 100)}% Complete</span>
                      <span className="text-amber-900 font-bold">⚠️ 50% baseline efficiency during masonry</span>
                    </div>
                  </div>
                )}

                {/* GUILD LABOR & WORKER ASSIGNMENT CARD */}
                {isWorkerBuilding && (
                  <div className={`p-3 rounded-2xl border-2 shadow-md space-y-2 ${
                    isUnstaffed
                      ? 'bg-amber-950/20 border-amber-600/80 text-amber-950'
                      : 'bg-[#dfcba6] border-[#8c6843]'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs uppercase font-mono font-bold text-[#8c6843]">
                          Guild Workforce:
                        </span>
                        <span className="text-xs font-mono font-black text-[#442813]">
                          {assignedWorkers.length} / {maxWorkers} Assigned
                        </span>
                      </div>
                      <span className={`text-[9.5px] font-mono font-bold px-2 py-0.5 rounded border ${
                        isUnstaffed
                          ? 'bg-amber-800/25 text-amber-950 border-amber-800/60 animate-pulse'
                          : 'bg-emerald-800/20 text-emerald-950 border-emerald-800/40'
                      }`}>
                        {isUnstaffed ? '⚠️ IDLE (UNSTAFFED)' : `⚡ Output: ${(0.6 + 0.4 * assignedWorkers.length).toFixed(1)}x`}
                      </span>
                    </div>

                    {isUnstaffed ? (
                      <p className="text-[10px] font-mono text-amber-900 leading-tight">
                        Production cycle timer is halted. Assign at least 1 citizen to begin generating yields.
                      </p>
                    ) : (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {assignedWorkers.map(w => (
                          <span
                            key={w.id}
                            className="px-2 py-0.5 rounded-lg bg-[#ebdcc1] border border-[#8c6843]/60 text-[10px] font-mono font-bold text-[#3f2314] flex items-center gap-1 shadow-sm"
                          >
                            <span>👤</span>
                            <span>{w.name}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => onAssignWorker && onAssignWorker(inspectPlotId)}
                        disabled={assignedWorkers.length >= maxWorkers}
                        className={`flex-1 py-1.5 px-2 rounded-xl font-mono text-xs font-bold transition flex items-center justify-center gap-1 shadow ${
                          assignedWorkers.length < maxWorkers
                            ? 'bg-gradient-to-r from-amber-800 to-yellow-800 text-amber-100 hover:brightness-105 active:scale-95 border border-amber-600'
                            : 'bg-stone-400/50 text-stone-600 cursor-not-allowed border border-stone-400'
                        }`}
                      >
                        <span>+</span>
                        <span>Assign Villager</span>
                      </button>

                      <button
                        onClick={() => onUnassignWorker && onUnassignWorker(inspectPlotId)}
                        disabled={assignedWorkers.length === 0}
                        className={`py-1.5 px-3 rounded-xl font-mono text-xs font-bold transition flex items-center justify-center gap-1 shadow ${
                          assignedWorkers.length > 0
                            ? 'bg-[#ebdcc1] hover:bg-[#dfcba6] text-[#6b4a2e] border border-[#8c6843] active:scale-95'
                            : 'bg-stone-300/50 text-stone-500 cursor-not-allowed border border-stone-300'
                        }`}
                        title="Unassign 1 Worker"
                      >
                        <span>−</span>
                        <span>Unassign</span>
                      </button>

                      {onOpenRoster && (
                        <button
                          onClick={onOpenRoster}
                          className="py-1.5 px-2.5 rounded-xl bg-[#ebdcc1] hover:bg-[#dfcba6] text-[#3f2314] border border-[#8c6843] text-xs font-mono font-bold transition shadow active:scale-95"
                          title="Open Royal Citizen Roster"
                        >
                          📜 Roster
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* PROMINENT EMBOSSED "SEAL ROYAL UPGRADE" CARD */}
                <div className="bg-[#dfcba6] p-3 rounded-2xl border-2 border-[#8c6843] shadow-md space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs uppercase font-mono font-bold text-[#8c6843]">
                        Decree Target:
                      </span>
                      <span className="text-xs font-mono font-black text-[#442813]">
                        Tier {toRomanTier(currentLvl)} → Tier {toRomanTier(currentLvl + 1)}
                      </span>
                    </div>
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${epochInfo.badgeClass}`}>
                      {epochInfo.name}
                    </span>
                  </div>

                  {/* Detailed Production Multipliers Jump */}
                  <div className="bg-[#ebdcc1] p-2 rounded-xl border border-[#bfa379] space-y-1 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-[#6b4a2e] font-bold uppercase text-[10px]">Production Scaling:</span>
                      <span className="text-emerald-800 font-black">+{yieldPct}% Expansion</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#442813] font-bold">
                        {isHarvestBuilding ? 'Harvest Yield:' : isKeep ? 'Fortress Defense:' : isBarracks ? 'Muster Capacity:' : 'Citadel Defense:'}
                      </span>
                      <span className="font-bold text-amber-950">
                        {isHarvestBuilding
                          ? `${currYield}/cycle → ${nextYield}/cycle`
                          : isKeep
                            ? `${currDef} HP → ${nextDef} HP`
                            : isBarracks
                              ? `${currTroopCap} Troops → ${nextTroopCap} Troops`
                              : `${currTowerDef} Def → ${nextTowerDef} Def`}
                      </span>
                    </div>
                  </div>

                  {/* Deep Vault Storage Gating Warning */}
                  {isVaultGated && (
                    <div className="bg-red-950/20 p-2 rounded-xl border-2 border-red-800/60 text-red-950 text-xs font-mono flex items-start gap-2 animate-pulse">
                      <span className="text-base">🔒</span>
                      <div>
                        <strong className="block font-bold">The Royal Vault cannot contain the materials required for this decree.</strong>
                        <span className="text-[10px] text-red-900">Upgrade the Deep Vault and storage silos to expand realm treasury capacity.</span>
                      </div>
                    </div>
                  )}

                  {/* Resource Costs with Color-Coded Deficit Indicators */}
                  <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                    <div className={`p-2 rounded-xl border text-center ${
                      resources.gold >= costGold
                        ? 'bg-yellow-900/10 border-yellow-800/40 text-yellow-900 font-bold'
                        : 'bg-red-900/15 border-red-800/60 text-red-900 font-bold'
                    }`}>
                      <div className="text-xs">🪙 {costGold}</div>
                      <div className="text-[9px] font-sans opacity-80 mt-0.5">
                        {resources.gold >= costGold ? 'Gold' : `(-${costGold - (resources.gold || 0)})`}
                      </div>
                    </div>
                    <div className={`p-2 rounded-xl border text-center ${
                      resources.wood >= costWood
                        ? 'bg-orange-900/10 border-orange-800/40 text-orange-900 font-bold'
                        : 'bg-red-900/15 border-red-800/60 text-red-900 font-bold'
                    }`}>
                      <div className="text-xs">🪵 {costWood}</div>
                      <div className="text-[9px] font-sans opacity-80 mt-0.5">
                        {resources.wood >= costWood ? 'Timber' : `(-${costWood - (resources.wood || 0)})`}
                      </div>
                    </div>
                    <div className={`p-2 rounded-xl border text-center ${
                      resources.stone >= costStone
                        ? 'bg-stone-900/10 border-stone-800/40 text-stone-900 font-bold'
                        : 'bg-red-900/15 border-red-800/60 text-red-900 font-bold'
                    }`}>
                      <div className="text-xs">🪨 {costStone}</div>
                      <div className="text-[9px] font-sans opacity-80 mt-0.5">
                        {resources.stone >= costStone ? 'Stone' : `(-${costStone - (resources.stone || 0)})`}
                      </div>
                    </div>
                  </div>

                  {/* Embossed Action Button: SEAL ROYAL UPGRADE */}
                  <button
                    onClick={(e) => {
                      triggerHaptic('heavy');
                      handleUpgradeClick(e);
                    }}
                    disabled={!canAfford || stampingDecree || isUpgrading || isVaultGated || isMaxTier}
                    className={`w-full py-3 px-4 rounded-xl font-black text-xs transition flex items-center justify-center gap-2 border-2 shadow-xl ${
                      isUpgrading
                        ? 'bg-amber-950/20 text-amber-900 border-amber-800/50 cursor-not-allowed'
                        : isMaxTier
                          ? 'bg-stone-300 text-stone-600 border-stone-400 cursor-not-allowed'
                          : isVaultGated
                            ? 'bg-red-950/20 text-red-900 border-red-800/60 cursor-not-allowed'
                            : canAfford
                              ? 'bg-gradient-to-r from-red-800 via-rose-800 to-red-700 text-amber-100 hover:brightness-110 active:scale-95 border-red-600 shadow-red-950/40 cursor-pointer'
                              : 'bg-stone-300 text-stone-600 border-stone-400 cursor-not-allowed'
                    }`}
                  >
                    <span className={`text-base ${stampingDecree ? 'animate-spin' : ''}`}>
                      {isUpgrading ? '🧱' : isVaultGated ? '🔒' : '🩸'}
                    </span>
                    <span className="tracking-wide uppercase">
                      {isUpgrading
                        ? `Masonry Underway (${formatBuildDuration(upgradeTimeRemaining)})`
                        : isMaxTier
                          ? `Monumental Tier XX Reached`
                          : isVaultGated
                            ? `Vault Capacity Deficient`
                            : canAfford
                              ? `SEAL ROYAL UPGRADE (Tier ${toRomanTier(currentLvl + 1)})`
                              : `Insufficient Resources for Tier ${toRomanTier(currentLvl + 1)}`}
                    </span>
                  </button>
                </div>

                {/* BARRACKS / GARRISON RECRUITMENT ACTION */}
                {isBarracks && (
                  <div className="bg-[#dfcba6] p-2.5 rounded-2xl border-2 border-amber-800/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">⚔️</span>
                        <div>
                          <h4 className="text-xs font-black text-[#442813]">Levy Recruits / Enlist Laborers</h4>
                          <span className="text-[10px] text-[#6b4a2e]">
                            Workforce: {troops.total} / {maxTroopCap} • Restores labor & garrison
                          </span>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-amber-900/15 text-amber-900 border border-amber-800/30">
                        25 🪙 / recruit
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-1.5">
                        {[1, 5].map(cnt => (
                          <button
                            key={cnt}
                            onClick={() => {
                              sounds.playCoin();
                              haptics.light();
                              setRecruitCount(cnt);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition ${
                              recruitCount === cnt
                                ? 'bg-amber-900 text-amber-100 border-amber-950'
                                : 'bg-[#ebdcc1] text-[#442813] border-[#8c6843]'
                            }`}
                          >
                            +{cnt}
                          </button>
                        ))}
                        <button
                          onClick={() => {
                            sounds.playCoin();
                            haptics.light();
                            const maxAffordable = Math.floor((resources.gold || 0) / 25);
                            const space = Math.max(1, maxTroopCap - troops.total);
                            setRecruitCount(Math.min(space, Math.max(1, maxAffordable)));
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-[#ebdcc1] text-[#442813] border border-[#8c6843] hover:bg-[#dfcba6]"
                        >
                          Max
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          triggerHaptic('heavy');
                          if (onTrainTroops) onTrainTroops(recruitCount);
                        }}
                        disabled={!canRecruit}
                        className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition flex items-center gap-1.5 shadow ${
                          canRecruit
                            ? 'bg-gradient-to-r from-red-800 to-rose-900 text-amber-100 hover:brightness-110 active:scale-95 border border-red-700'
                            : 'bg-stone-400 text-stone-600 cursor-not-allowed'
                        }`}
                      >
                        <span>⚔️</span>
                        <span>Enlist ({recruitCostGold}🪙)</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* HARVEST AUTOMATION STATUS */}
                {isHarvestBuilding && isAutomated && (
                  <div className="bg-emerald-900/10 border border-emerald-700/40 rounded-xl p-2 flex items-center gap-2">
                    <span className="text-base">🛡️</span>
                    <div className="text-[10px] text-emerald-950 leading-snug">
                      <span className="font-bold">Automated by Garrison:</span> Standing levies automatically reap completed harvests into stockpiles.
                    </div>
                  </div>
                )}

                {/* KEEP ROYAL LOGISTICS DECREE (TROOP AUTO-COLLECTION) */}
                {isKeep && (
                  <div className="bg-[#dfcba6] p-2.5 rounded-xl border border-amber-800/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">📜</span>
                        <div>
                          <span className="text-xs font-black text-[#442813] block">Vassal Foraging Lines</span>
                          <span className="text-[9px] text-[#6b4a2e]">Troop Quartermaster & Automated Logistics</span>
                        </div>
                      </div>
                      {hasTroopLogistics ? (
                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-800 text-emerald-100 border border-emerald-600">
                          Sealed 🛡️
                        </span>
                      ) : (
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${currentLvl >= 2 ? 'bg-green-900/10 text-green-900' : 'bg-red-900/10 text-red-900'}`}>
                          Req Keep T2
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[#6b4a2e]">
                      When sealed, idle garrisoned troops automatically reap completed harvests from Farms, Mills, Quarries, and Mints without manual tapping.
                    </p>
                    {!hasTroopLogistics && (
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono">
                          <span className={`px-1.5 py-0.5 rounded border ${(resources.gold || 0) >= 40 ? 'bg-yellow-900/10 border-yellow-800 text-yellow-900' : 'bg-red-900/10 border-red-800 text-red-900 font-bold'}`}>
                            🪙 40
                          </span>
                          <span className={`px-1.5 py-0.5 rounded border ${(resources.food || 0) >= 30 ? 'bg-orange-900/10 border-orange-800 text-orange-900' : 'bg-red-900/10 border-red-800 text-red-900 font-bold'}`}>
                            🌾 30
                          </span>
                        </div>
                        <button
                          onClick={() => onResearchTechnology && onResearchTechnology('tech_troop_logistics')}
                          disabled={!canAffordLogistics}
                          className={`px-3 py-1 rounded-lg text-xs font-black transition ${
                            canAffordLogistics
                              ? 'bg-gradient-to-r from-red-800 to-rose-900 text-amber-100 hover:brightness-110 active:scale-95 shadow border border-red-700'
                              : 'bg-stone-400 text-stone-600 cursor-not-allowed'
                          }`}
                        >
                          Seal Logistics Decree
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* KEEP TERRITORY ANNEXATION CARD */}
                {isKeep && nextTierDef && (
                  <div className="bg-[#dfcba6] p-2.5 rounded-xl border border-amber-800/40 space-y-2">
                    <p className="text-[10px] text-[#6b4a2e]">
                      Unlock outer coordinate rings and survey {nextTierDef.unlockedPlots} total foundation plots. Requires Keep Tier {nextTierDef.keepLevelReq}.
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[10px] font-mono">
                        <span>🪙 {nextTierDef.cost.gold}</span>
                        <span>🪵 {nextTierDef.cost.wood}</span>
                        <span>🪨 {nextTierDef.cost.stone}</span>
                      </div>
                      <button
                        onClick={() => onExpandTerritory && onExpandTerritory()}
                        disabled={!canAnnexTerritory}
                        className={`px-3 py-1 rounded-lg text-xs font-black transition ${
                          canAnnexTerritory
                            ? 'bg-gradient-to-r from-amber-800 to-yellow-800 text-amber-100 active:scale-95 border border-amber-600'
                            : 'bg-stone-400 text-stone-600 cursor-not-allowed'
                        }`}
                      >
                        Annex
                      </button>
                    </div>
                  </div>
                )}

                {/* DEEP VAULT ALCHEMICAL PRESS & HERBAL CRUCIBLE */}
                {isVault && (
                  <div className="bg-[#dfcba6] p-2.5 rounded-xl border border-amber-800/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">⚗️</span>
                        <div>
                          <h4 className="text-xs font-black text-[#442813]">Alchemical Press & Crucible</h4>
                          <span className="text-[9px] text-[#6b4a2e]">Transmute Flora into stone & gold</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-950/15 text-emerald-900 border border-emerald-800/30">
                        🌿 {Math.floor(resources.flora || 0)} Avail
                      </span>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      {/* Recipe 1: Transmute Granite */}
                      <div className="bg-[#ebdcc1] p-2 rounded-xl border border-[#bfa379] flex items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-[#442813]">Transmute Granite</span>
                            <span className="text-[10px] font-mono font-bold text-stone-800">🪨 +50</span>
                          </div>
                          <div className="flex items-center gap-1 text-[9.5px] font-mono mt-0.5">
                            <span className={(resources.flora || 0) >= 100 ? 'text-emerald-900 font-bold' : 'text-red-900 font-bold'}>
                              🌿 100
                            </span>
                            <span>+</span>
                            <span className={(resources.food || 0) >= 50 ? 'text-amber-900 font-bold' : 'text-red-900 font-bold'}>
                              🌾 50
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => onTransmuteFlora && onTransmuteFlora('stone')}
                          disabled={(resources.flora || 0) < 100 || (resources.food || 0) < 50}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition shadow-sm ${
                            (resources.flora || 0) >= 100 && (resources.food || 0) >= 50
                              ? 'bg-stone-800 hover:bg-stone-900 text-amber-100 active:scale-95 border border-stone-700'
                              : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                          }`}
                        >
                          Transmute
                        </button>
                      </div>

                      {/* Recipe 2: Herbal Tinctures */}
                      <div className="bg-[#ebdcc1] p-2 rounded-xl border border-[#bfa379] flex items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-[#442813]">Herbal Tinctures</span>
                            <span className="text-[10px] font-mono font-bold text-yellow-800">🪙 +40</span>
                          </div>
                          <div className="flex items-center gap-1 text-[9.5px] font-mono mt-0.5">
                            <span className={(resources.flora || 0) >= 100 ? 'text-emerald-900 font-bold' : 'text-red-900 font-bold'}>
                              🌿 100
                            </span>
                            <span>+</span>
                            <span className={(resources.food || 0) >= 25 ? 'text-amber-900 font-bold' : 'text-red-900 font-bold'}>
                              🌾 25
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => onTransmuteFlora && onTransmuteFlora('gold')}
                          disabled={(resources.flora || 0) < 100 || (resources.food || 0) < 25}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition shadow-sm ${
                            (resources.flora || 0) >= 100 && (resources.food || 0) >= 25
                              ? 'bg-amber-800 hover:bg-amber-900 text-amber-100 active:scale-95 border border-amber-600'
                              : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                          }`}
                        >
                          Distill
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* =========================================================================
          DESKTOP DOCKED DRAWER (>= md)
          ========================================================================= */}
      <div className="hidden md:flex bg-[#e4d4b3] border-t-2 border-[#bfa379] p-3 items-center justify-between gap-3">
        {isEmptyPlot ? (
          /* EMPTY FOUNDATION BLUEPRINT DRAWER */
          <div className="w-full flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#cbb38b] border border-[#8c6843] flex items-center justify-center text-2xl shadow-inner flex-shrink-0">
                ⛏️
              </div>
              <div>
                <h3 className="text-sm font-black text-[#442813]">Architectural Commission</h3>
                <p className="text-[11px] text-[#6b4a2e]">Select a blueprint to erect upon this foundation:</p>
              </div>
            </div>

            {/* Blueprints Horizontal Thumbnails */}
            <div className="flex items-center gap-2">
              {CONSTRUCTIBLE_BLUEPRINTS.map(bpKey => {
                const bp = BUILDINGS[bpKey];
                if (!bp) return null;
                const isSelectedBp = selectedBlueprintKey === bpKey;
                return (
                  <button
                    key={bpKey}
                    onClick={() => {
                      sounds.playCoin();
                      haptics.light();
                      setSelectedBlueprintKey(bpKey);
                    }}
                    className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition ${
                      isSelectedBp
                        ? 'bg-[#cbb38b] border-[#8c6843] shadow-md ring-2 ring-amber-600'
                        : 'bg-[#dfcba6] border-[#bfa379] hover:bg-[#d5be97]'
                    }`}
                  >
                    <span className="text-lg">{bp.inkSymbol}</span>
                    <span className="text-[11px] font-bold text-[#442813]">
                      {bp.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Commission Button & Costs */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs font-mono">
                <span className={`px-2 py-0.5 rounded border ${resources.gold >= (currentBlueprint.baseCost?.gold || 0) ? 'bg-yellow-900/10 border-yellow-800 text-yellow-900 font-bold' : 'bg-red-900/10 border-red-800 text-red-900 font-bold'}`}>
                  🪙 {currentBlueprint.baseCost?.gold || 0}
                </span>
                <span className={`px-2 py-0.5 rounded border ${resources.wood >= (currentBlueprint.baseCost?.wood || 0) ? 'bg-orange-900/10 border-orange-800 text-orange-900 font-bold' : 'bg-red-900/10 border-red-800 text-red-900 font-bold'}`}>
                  🪵 {currentBlueprint.baseCost?.wood || 0}
                </span>
                <span className={`px-2 py-0.5 rounded border ${resources.stone >= (currentBlueprint.baseCost?.stone || 0) ? 'bg-stone-900/10 border-stone-800 text-stone-900 font-bold' : 'bg-red-900/10 border-red-800 text-red-900 font-bold'}`}>
                  🪨 {currentBlueprint.baseCost?.stone || 0}
                </span>
              </div>

              <button
                onClick={() => onConstructBuilding && onConstructBuilding(selectedBuildingId, selectedBlueprintKey)}
                disabled={!canAffordConstruct}
                className={`px-4 py-2 rounded-xl font-black text-xs transition flex items-center gap-2 shadow-lg ${
                  canAffordConstruct
                    ? 'bg-gradient-to-r from-amber-800 to-yellow-800 text-amber-100 hover:brightness-110 active:scale-95 shadow-amber-950/40 border border-amber-600'
                    : 'bg-stone-400 text-stone-700 cursor-not-allowed border border-stone-500'
                }`}
              >
                <span>🏗️</span>
                <span>Erect {currentBlueprint.name}</span>
              </button>
            </div>
          </div>
        ) : (
          /* CONSTRUCTED BUILDING CONTROLS & SPECIAL ACTIONS */
          <div className="w-full flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#cbb38b] border border-[#8c6843] flex items-center justify-center text-2xl shadow-inner flex-shrink-0">
                {selectedDef?.inkSymbol}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-[#442813]">{selectedDef?.name}</h3>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${epochInfo.badgeClass}`}>
                    Tier {toRomanTier(currentLvl)}
                  </span>
                  {isUpgrading && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-900/20 text-amber-900 font-bold border border-amber-700/40 flex items-center gap-1 animate-pulse">
                      🧱 Inscribing Tier {toRomanTier(targetTier)} ({formatBuildDuration(upgradeTimeRemaining)})
                    </span>
                  )}
                  {isAutomated && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900/20 text-emerald-900 font-bold border border-emerald-700/40 flex items-center gap-1">
                      🛡️ Automated by Garrison
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#6b4a2e] max-w-sm line-clamp-1">{selectedDef?.description}</p>
              </div>
            </div>

            {/* KEEP SPECIAL ACTION: ROYAL LOGISTICS DECREE */}
            {isKeep && (
              <div className="bg-[#dfcba6] px-2.5 py-1.5 rounded-xl border border-[#bfa379] flex items-center gap-2 text-xs">
                <div>
                  <div className="font-bold text-[#442813] text-[11px] flex items-center gap-1">
                    <span>📜 Logistics Decree</span>
                    {hasTroopLogistics && <span className="text-emerald-800 font-bold text-[10px]">✓ Active</span>}
                  </div>
                  <div className="text-[9px] font-mono text-[#6b4a2e]">
                    {hasTroopLogistics ? 'Garrison foraging active' : '🪙40 🌾30 • Req Keep T1'}
                  </div>
                </div>
                {hasTroopLogistics ? (
                  <span className="px-2 py-1 rounded-lg text-[10px] font-mono font-bold bg-emerald-800 text-emerald-100 border border-emerald-600">
                    Sealed 🛡️
                  </span>
                ) : (
                  <button
                    onClick={() => onResearchTechnology && onResearchTechnology('tech_troop_logistics')}
                    disabled={!canAffordLogistics}
                    className={`px-2.5 py-1 rounded-lg text-xs font-black transition ${
                      canAffordLogistics
                        ? 'bg-gradient-to-r from-red-800 to-rose-900 text-amber-100 hover:brightness-110 active:scale-95 shadow border border-red-700'
                        : 'bg-stone-400 text-stone-600 cursor-not-allowed'
                    }`}
                  >
                    Seal Decree
                  </button>
                )}
              </div>
            )}

            {/* KEEP SPECIAL ACTION: ANNEX TERRITORY */}
            {isKeep && nextTierDef && (
              <div className="bg-[#dfcba6] px-2.5 py-1.5 rounded-xl border border-[#bfa379] flex items-center gap-2 text-xs">
                <div>
                  <div className="font-bold text-[#442813] text-[11px]">Annex {nextTierDef.name}</div>
                  <div className="text-[9px] font-mono text-[#6b4a2e]">
                    🪙{nextTierDef.cost.gold} 🪵{nextTierDef.cost.wood} 🪨{nextTierDef.cost.stone} • Req T{nextTierDef.keepLevelReq}
                  </div>
                </div>
                <button
                  onClick={() => onExpandTerritory && onExpandTerritory()}
                  disabled={!canAnnexTerritory}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition ${
                    canAnnexTerritory
                      ? 'bg-amber-800 text-amber-100 hover:brightness-110 active:scale-95 shadow'
                      : 'bg-stone-400 text-stone-600 cursor-not-allowed'
                  }`}
                >
                  Annex
                </button>
              </div>
            )}

            {/* BARRACKS SPECIAL ACTION: RECRUIT LEVIES */}
            {isBarracks && (
              <div className="bg-[#dfcba6] px-2.5 py-1.5 rounded-xl border border-[#bfa379] flex items-center gap-2 text-xs">
                <div>
                  <div className="font-bold text-[#442813] text-[11px]">
                    Levy Recruits ({troops.total}/{maxTroopCap})
                  </div>
                  <div className="text-[9px] font-mono text-[#6b4a2e]">
                    🪙 {recruitCount * 25} (25🪙/ea)
                  </div>
                </div>
                <div className="flex gap-1">
                  {[1, 5].map(cnt => (
                    <button
                      key={cnt}
                      onClick={() => setRecruitCount(cnt)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                        recruitCount === cnt ? 'bg-amber-900 text-amber-100' : 'bg-[#cbb38b]'
                      }`}
                    >
                      +{cnt}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      const maxAffordable = Math.floor((resources.gold || 0) / 25);
                      const space = Math.max(1, maxTroopCap - troops.total);
                      setRecruitCount(Math.min(space, Math.max(1, maxAffordable)));
                    }}
                    className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#cbb38b] hover:bg-[#bfa379]"
                  >
                    Max
                  </button>
                </div>
                <button
                  onClick={() => {
                    triggerHaptic('heavy');
                    if (onTrainTroops) onTrainTroops(recruitCount);
                  }}
                  disabled={!canRecruit}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition ${
                    canRecruit
                      ? 'bg-red-800 text-amber-100 hover:brightness-110 active:scale-95 shadow'
                      : 'bg-stone-400 text-stone-600 cursor-not-allowed'
                  }`}
                >
                  Enlist
                </button>
              </div>
            )}

            {/* VAULT SPECIAL ACTION: ALCHEMICAL TRANSMUTATION */}
            {isVault && (
              <div className="bg-[#dfcba6] px-2.5 py-1.5 rounded-xl border border-[#bfa379] flex items-center gap-2 text-xs">
                <div>
                  <div className="font-bold text-[#442813] text-[11px] flex items-center gap-1">
                    <span>⚗️ Alchemical Press</span>
                    <span className="text-[9px] font-mono text-emerald-900 bg-emerald-950/15 px-1 rounded">🌿 {Math.floor(resources.flora || 0)}</span>
                  </div>
                  <div className="text-[9px] font-mono text-[#6b4a2e]">
                    Transmute Flora into stone or gold
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => onTransmuteFlora && onTransmuteFlora('stone')}
                    disabled={(resources.flora || 0) < 100 || (resources.food || 0) < 50}
                    className={`px-2 py-1 rounded text-[10px] font-bold transition ${
                      (resources.flora || 0) >= 100 && (resources.food || 0) >= 50
                        ? 'bg-stone-800 text-amber-100 hover:bg-stone-900 border border-stone-700 active:scale-95'
                        : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                    }`}
                    title="100 Flora + 50 Sustenance -> 50 Stone"
                  >
                    🪨 Granite (+50)
                  </button>
                  <button
                    onClick={() => onTransmuteFlora && onTransmuteFlora('gold')}
                    disabled={(resources.flora || 0) < 100 || (resources.food || 0) < 25}
                    className={`px-2 py-1 rounded text-[10px] font-bold transition ${
                      (resources.flora || 0) >= 100 && (resources.food || 0) >= 25
                        ? 'bg-amber-800 text-amber-100 hover:bg-amber-900 border border-amber-600 active:scale-95'
                        : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                    }`}
                    title="100 Flora + 25 Sustenance -> 40 Gold"
                  >
                    🪙 Tincture (+40)
                  </button>
                </div>
              </div>
            )}

            {/* Standard Upgrade Requirements & Monarch Wax Seal Stamper */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs font-mono">
                <span className={`px-2 py-0.5 rounded border ${resources.gold >= costGold ? 'bg-yellow-900/10 border-yellow-800 text-yellow-900' : 'bg-red-900/10 border-red-800 text-red-900 font-bold'}`}>
                  🪙 {costGold}
                </span>
                <span className={`px-2 py-0.5 rounded border ${resources.wood >= costWood ? 'bg-orange-900/10 border-orange-800 text-orange-900' : 'bg-red-900/10 border-red-800 text-red-900 font-bold'}`}>
                  🪵 {costWood}
                </span>
                <span className={`px-2 py-0.5 rounded border ${resources.stone >= costStone ? 'bg-stone-900/10 border-stone-800 text-stone-900' : 'bg-red-900/10 border-red-800 text-red-900 font-bold'}`}>
                  🪨 {costStone}
                </span>
              </div>

              <button
                onClick={(e) => onUpgradeBuilding && onUpgradeBuilding(selectedBuildingId, e)}
                onMouseEnter={() => { if (canAfford) onHoverUpgrade && onHoverUpgrade(true); }}
                onMouseLeave={() => onHoverUpgrade && onHoverUpgrade(false)}
                disabled={!canAfford || stampingDecree}
                className={`px-4 py-2 rounded-xl font-black text-xs transition flex items-center gap-2 shadow-lg ${
                  canAfford
                    ? 'bg-gradient-to-r from-red-800 to-rose-900 text-amber-100 hover:brightness-110 active:scale-95 shadow-red-950/40 border border-red-700'
                    : 'bg-stone-400 text-stone-700 cursor-not-allowed border border-stone-500'
                }`}
              >
                <span className={stampingDecree ? 'animate-spin' : ''}>🩸</span>
                <span>Seal Royal Decree (T{currentLvl + 1})</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
