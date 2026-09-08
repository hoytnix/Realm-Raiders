import React, { useState } from 'react';
import {
  BUILDINGS,
  EMPTY_PLOT,
  CONSTRUCTIBLE_BLUEPRINTS,
  TERRITORY_TIERS,
  MAX_TERRITORY_TIER,
  TROOP_RECRUIT_COST,
  TECHNOLOGIES,
  getBuildingUpgradeCost,
  toRomanTier,
  getTierEpoch,
  formatBuildDuration,
  calculateBuildingYield,
  calculateBuildDuration,
  sounds
} from '../../constants/index.js';
import { haptics, triggerHaptic } from '../../utils/index.js';
import { ROLE_DEFINITIONS } from './VillagerRosterModal.jsx';

export function SovereignLedger({
  selectedBuildingId = 'keep',
  multiSelectedIds = [],
  onClearMultiSelect,
  grid = null,
  buildings = {},
  resources = {},
  troops = { total: 20, maxCapacity: 30 },
  stats = {},
  technologies = [],
  territoryTier = 1,
  stampingDecree = false,
  onUpgradeBuilding,
  onBulkUpgrade,
  onConstructBuilding,
  onExpandTerritory,
  onTrainTroops,
  onResearchTechnology,
  onTransmuteFlora,
  villagers = [],
  onAssignWorker,
  onUnassignWorker,
  onAssignVillager,
  onUnassignVillager,
  activeLedgerTab = 'structure',
  setActiveLedgerTab,
  battleLogs = []
}) {
  const [selectedBlueprintKey, setSelectedBlueprintKey] = useState('farm');
  const [recruitCount, setRecruitCount] = useState(5);

  const isMultiSelect = multiSelectedIds && multiSelectedIds.length > 1;
  const selectedPlot = (grid || []).find(p => p.id === selectedBuildingId || p.buildingId === selectedBuildingId);
  const isEmptyPlot = selectedPlot ? !selectedPlot.buildingId : (selectedBuildingId?.startsWith('plot-') || false);
  const selectedDef = selectedPlot?.buildingId ? (BUILDINGS[selectedPlot.buildingId] || BUILDINGS.keep) : (isEmptyPlot ? EMPTY_PLOT : (BUILDINGS[selectedBuildingId] || BUILDINGS.keep));
  const currentLvl = selectedPlot ? (selectedPlot.buildingId ? (selectedPlot.level || 1) : 0) : (isEmptyPlot ? 0 : (buildings[selectedBuildingId] || 1));

  const hasTroopLogistics = (technologies || []).includes('tech_troop_logistics');
  const isHarvestBuilding = selectedDef?.cycleDuration && selectedDef?.baseYield;
  const isAutomated = hasTroopLogistics && (troops?.total || 0) >= 1 && isHarvestBuilding;
  const isVault = selectedDef?.id === 'vault' || selectedBuildingId === 'vault';
  const isKeep = selectedDef?.id === 'keep' || selectedBuildingId === 'keep';
  const isBarracks = selectedDef?.id === 'barracks' || selectedBuildingId === 'barracks';

  const inspectPlotId = selectedPlot?.id || selectedBuildingId;
  const assignedWorkers = (villagers || []).filter(v => v.assignedBuildingId === inspectPlotId);
  const maxWorkers = Math.min(5, (currentLvl || 1) + 1);
  const isUnstaffed = isHarvestBuilding && assignedWorkers.length === 0;

  const isUpgrading = !!selectedPlot?.isUpgrading;
  const upgradeTimeRemaining = selectedPlot?.upgradeTimeRemaining || 0;
  const totalUpgradeTime = selectedPlot?.totalUpgradeTime || calculateBuildDuration((currentLvl || 1) + 1);
  const targetTier = selectedPlot?.targetTier || ((currentLvl || 1) + 1);
  const epochInfo = getTierEpoch(currentLvl || 1);
  const isMaxTier = (currentLvl || 1) >= (selectedDef?.maxTier || 20);

  const discount = stats.currentFaction?.id === 'humans' ? 0.5 : 1.0;
  const { gold: costGold, wood: costWood, stone: costStone } = isEmptyPlot
    ? { gold: 0, wood: 0, stone: 0 }
    : getBuildingUpgradeCost(selectedDef, currentLvl, discount);

  // Deep Vault Storage Gating
  const caps = stats?.caps || { gold: 1500, wood: 1000, stone: 1000, flora: 500 };
  const isVaultGatedSingle = (caps.gold < costGold || caps.wood < costWood || caps.stone < costStone);

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

  const canAffordSingle =
    !isEmptyPlot &&
    (resources.gold || 0) >= costGold &&
    (resources.wood || 0) >= costWood &&
    (resources.stone || 0) >= costStone;

  // Blueprint commission data
  const currentBlueprint = BUILDINGS[selectedBlueprintKey] || BUILDINGS.farm;
  const canAffordConstruct =
    (resources.gold || 0) >= (currentBlueprint.baseCost?.gold || 0) &&
    (resources.wood || 0) >= (currentBlueprint.baseCost?.wood || 0) &&
    (resources.stone || 0) >= (currentBlueprint.baseCost?.stone || 0);

  // Troop recruitment
  const maxTroopCap = stats.maxTroopCapacity || troops.maxCapacity || 30;
  const recruitCostGold = recruitCount * TROOP_RECRUIT_COST.gold;
  const recruitCostFood = recruitCount * TROOP_RECRUIT_COST.food;
  const canRecruit =
    (resources.gold || 0) >= recruitCostGold &&
    (resources.food || 0) >= recruitCostFood &&
    troops.total + recruitCount <= maxTroopCap;

  // Territory expansion
  const nextTierIndex = territoryTier < MAX_TERRITORY_TIER ? territoryTier + 1 : null;
  const nextTierDef = nextTierIndex ? TERRITORY_TIERS[nextTierIndex] : null;
  const keepPlot = (grid || []).find(p => p.buildingId === 'keep');
  const keepLvl = keepPlot?.level || buildings.keep || 1;
  const canAnnexTerritory =
    nextTierDef &&
    keepLvl >= nextTierDef.keepLevelReq &&
    (resources.gold || 0) >= nextTierDef.cost.gold &&
    (resources.wood || 0) >= nextTierDef.cost.wood &&
    (resources.stone || 0) >= nextTierDef.cost.stone;

  // Logistics decree
  const canAffordLogistics =
    !hasTroopLogistics &&
    keepLvl >= 2 &&
    (resources.gold || 0) >= 150 &&
    (resources.food || 0) >= 100;

  // Multi-select bulk calculations
  let multiTotalGold = 0;
  let multiTotalWood = 0;
  let multiTotalStone = 0;
  const multiBuildingsList = [];

  if (isMultiSelect) {
    multiSelectedIds.forEach(id => {
      const plot = (grid || []).find(p => p.id === id || p.buildingId === id);
      const bType = plot ? plot.buildingId : id;
      const bD = BUILDINGS[bType];
      if (bD) {
        const lvl = plot ? (plot.level || 1) : (buildings[id] || 1);
        const { gold: g, wood: w, stone: s } = getBuildingUpgradeCost(bD, lvl, discount);
        multiTotalGold += g;
        multiTotalWood += w;
        multiTotalStone += s;
        multiBuildingsList.push({ id, def: bD, lvl });
      }
    });
  }

  const canAffordBulk =
    (resources.gold || 0) >= multiTotalGold &&
    (resources.wood || 0) >= multiTotalWood &&
    (resources.stone || 0) >= multiTotalStone;

  const isVaultGatedBulk = (caps.gold < multiTotalGold || caps.wood < multiTotalWood || caps.stone < multiTotalStone);

  return (
    <aside className="w-full h-full bg-[#f4ecd8] border-l-4 border-[#8c6843] shadow-[-10px_0_30px_rgba(0,0,0,0.35)] flex flex-col overflow-hidden text-stone-900 font-serif">
      {/* Ornate Ledger Folio Header */}
      <div className="bg-gradient-to-b from-[#dfcba6] to-[#d4be95] border-b-2 border-[#8c6843] p-3 shadow-sm flex flex-col gap-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📜</span>
            <div>
              <h2 className="text-xs font-black tracking-wider uppercase text-[#442813]">
                Sovereign Ledger
              </h2>
              <span className="text-[9px] font-mono text-[#6b4a2e]">
                Citadel Seat & High Command
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 font-mono text-[9px] text-[#6b4a2e]">
            <span className="px-1.5 py-0.5 rounded bg-stone-900/10 border border-stone-800/20 font-bold">
              Desk [30%]
            </span>
          </div>
        </div>

        {/* Folio Tabs */}
        <div className="grid grid-cols-4 gap-1 bg-[#cbb38b]/60 p-1 rounded-xl border border-[#8c6843]/50 text-xs font-bold">
          <button
            onClick={() => {
              sounds.playCoin();
              haptics.light();
              setActiveLedgerTab('structure');
            }}
            className={`py-1.5 px-1.5 rounded-lg transition text-center flex items-center justify-center gap-1 text-[10.5px] ${
              activeLedgerTab === 'structure'
                ? 'bg-[#f4ecd8] text-[#442813] shadow font-black border border-[#8c6843]'
                : 'text-[#6b4a2e] hover:bg-[#dfcba6]'
            }`}
          >
            <span>🏛️</span>
            <span>{isMultiSelect ? `Order (${multiSelectedIds.length})` : 'Structure'}</span>
          </button>

          <button
            onClick={() => {
              sounds.playCoin();
              haptics.light();
              setActiveLedgerTab('roster');
            }}
            className={`py-1.5 px-1.5 rounded-lg transition text-center flex items-center justify-center gap-1 text-[10.5px] ${
              activeLedgerTab === 'roster'
                ? 'bg-[#f4ecd8] text-[#442813] shadow font-black border border-[#8c6843]'
                : 'text-[#6b4a2e] hover:bg-[#dfcba6]'
            }`}
          >
            <span>👥</span>
            <span>Roster</span>
          </button>

          <button
            onClick={() => {
              sounds.playCoin();
              haptics.light();
              setActiveLedgerTab('decrees');
            }}
            className={`py-1.5 px-1.5 rounded-lg transition text-center flex items-center justify-center gap-1 text-[10.5px] ${
              activeLedgerTab === 'decrees'
                ? 'bg-[#f4ecd8] text-[#442813] shadow font-black border border-[#8c6843]'
                : 'text-[#6b4a2e] hover:bg-[#dfcba6]'
            }`}
          >
            <span>📜</span>
            <span>Decrees</span>
          </button>

          <button
            onClick={() => {
              sounds.playCoin();
              haptics.light();
              setActiveLedgerTab('records');
            }}
            className={`py-1.5 px-1.5 rounded-lg transition text-center flex items-center justify-center gap-1 text-[10.5px] ${
              activeLedgerTab === 'records'
                ? 'bg-[#f4ecd8] text-[#442813] shadow font-black border border-[#8c6843]'
                : 'text-[#6b4a2e] hover:bg-[#dfcba6]'
            }`}
          >
            <span>📖</span>
            <span>Audit</span>
          </button>
        </div>
      </div>

      {/* Ledger Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* =========================================================================
            TAB 1: STRUCTURE (OR MULTI-SELECT MARQUEE ORDER)
            ========================================================================= */}
        {activeLedgerTab === 'structure' && (
          <>
            {isMultiSelect ? (
              /* MULTI-BUILDING MARQUEE BULK ORDER */
              <div className="space-y-3 animate-in fade-in">
                <div className="bg-gradient-to-r from-amber-900/10 to-stone-900/10 p-3 rounded-2xl border-2 border-[#8c6843] flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-black text-[#442813] uppercase tracking-wider flex items-center gap-1.5">
                      <span>🗂️ Marquee War Order</span>
                    </h3>
                    <span className="text-[10px] font-mono text-[#6b4a2e]">
                      {multiSelectedIds.length} Citadel Structures Highlighted
                    </span>
                  </div>
                  <button
                    onClick={onClearMultiSelect}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-900/10 text-stone-700 hover:bg-stone-900/20 font-bold"
                  >
                    Clear [Esc]
                  </button>
                </div>

                {/* Selected Structures Mini-List */}
                <div className="bg-[#ebdcc1] p-2.5 rounded-xl border border-[#bfa379] max-h-40 overflow-y-auto space-y-1.5 text-xs">
                  {multiBuildingsList.map(item => (
                    <div key={item.id} className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1 font-bold text-[#442813]">
                        <span>{item.def.inkSymbol}</span>
                        <span>{item.def.name}</span>
                      </span>
                      <span className="font-mono text-[10px] text-[#6b4724] font-bold">
                        Tier {toRomanTier(item.lvl)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Bulk Upgrade Requirements */}
                <div className="bg-[#dfcba6] p-2.5 rounded-xl border border-[#bfa379] space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#6b4a2e] uppercase">
                    <span>Combined Upgrade Cost:</span>
                    <span className={isVaultGatedBulk ? 'text-red-900 font-bold' : canAffordBulk ? 'text-green-800' : 'text-red-800'}>
                      {isVaultGatedBulk ? 'Vault Deficient' : canAffordBulk ? 'Store Affords All ✨' : 'Stores Short'}
                    </span>
                  </div>

                  {isVaultGatedBulk && (
                    <div className="bg-red-950/20 p-2 rounded-xl border border-red-800/60 text-red-950 text-[10px] font-mono flex items-start gap-1.5 animate-pulse">
                      <span>🔒</span>
                      <div>
                        <strong className="block font-bold">The Royal Vault cannot contain the materials required for this decree.</strong>
                        <span className="text-red-900">Upgrade the Deep Vault and storage silos to expand capacity.</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-1 text-xs font-mono">
                    <span className={`px-2 py-1 rounded border flex-1 text-center ${(resources.gold || 0) >= multiTotalGold ? 'bg-yellow-900/10 border-yellow-800 text-yellow-900 font-bold' : 'bg-red-900/10 border-red-800 text-red-900 font-bold'}`}>
                      🪙 {multiTotalGold}
                    </span>
                    <span className={`px-2 py-1 rounded border flex-1 text-center ${(resources.wood || 0) >= multiTotalWood ? 'bg-orange-900/10 border-orange-800 text-orange-900 font-bold' : 'bg-red-900/10 border-red-800 text-red-900 font-bold'}`}>
                      🪵 {multiTotalWood}
                    </span>
                    <span className={`px-2 py-1 rounded border flex-1 text-center ${(resources.stone || 0) >= multiTotalStone ? 'bg-stone-900/10 border-stone-800 text-stone-900 font-bold' : 'bg-red-900/10 border-red-800 text-red-900 font-bold'}`}>
                      🪨 {multiTotalStone}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      triggerHaptic('heavy');
                      if (onBulkUpgrade) onBulkUpgrade(multiSelectedIds);
                    }}
                    disabled={!canAffordBulk || isVaultGatedBulk}
                    className={`w-full py-2.5 rounded-xl font-black text-xs transition flex items-center justify-center gap-2 shadow ${
                      isVaultGatedBulk
                        ? 'bg-red-950/20 text-red-900 border border-red-800/60 cursor-not-allowed'
                        : canAffordBulk
                          ? 'bg-gradient-to-r from-red-800 to-rose-900 text-amber-100 hover:brightness-110 active:scale-95 shadow border border-red-700 cursor-pointer'
                          : 'bg-stone-400 text-stone-600 cursor-not-allowed'
                    }`}
                  >
                    <span>{isVaultGatedBulk ? '🔒' : '🩸'}</span>
                    <span>
                      {isVaultGatedBulk
                        ? 'Vault Capacity Deficient'
                        : `Seal Bulk Upgrade Decree (${multiSelectedIds.length})`}
                    </span>
                  </button>
                </div>
              </div>
            ) : isEmptyPlot ? (
              /* CLEARED FOUNDATION BLUEPRINT COMMISSION */
              <div className="space-y-3 animate-in fade-in">
                <div className="bg-[#ebdcc1] p-3 rounded-2xl border border-[#8c6843] flex items-center gap-3 shadow-inner">
                  <div className="w-12 h-12 rounded-xl bg-[#cbb38b] border border-[#8c6843] flex items-center justify-center text-2xl shadow-inner flex-shrink-0">
                    ⛏️
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-[#442813] uppercase">Cleared Foundation</h3>
                    <p className="text-[10px] text-[#6b4a2e]">Select blueprint to erect on this surveyed plot.</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[9px] font-mono text-[#6b4a2e] uppercase font-bold block">
                    Available Blueprints:
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {CONSTRUCTIBLE_BLUEPRINTS.map(bpKey => {
                      const bp = BUILDINGS[bpKey];
                      if (!bp) return null;
                      const isSelected = selectedBlueprintKey === bpKey;
                      return (
                        <button
                          key={bpKey}
                          onClick={() => {
                            sounds.playCoin();
                            haptics.light();
                            setSelectedBlueprintKey(bpKey);
                          }}
                          className={`p-1.5 rounded-xl border flex flex-col items-center justify-center text-center transition ${
                            isSelected
                              ? 'bg-[#cbb38b] border-[#8c6843] ring-2 ring-amber-700 font-bold shadow'
                              : 'bg-[#dfcba6] border-[#bfa379] hover:bg-[#d5be97]'
                          }`}
                        >
                          <span className="text-base">{bp.inkSymbol}</span>
                          <span className="text-[9px] text-[#442813] font-bold line-clamp-1">{bp.name.split(' ')[0]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Blueprint Cost & Commission */}
                <div className="bg-[#dfcba6] p-2.5 rounded-xl border border-[#bfa379] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#442813]">{currentBlueprint.name}</span>
                    <span className="text-[9px] font-mono text-[#6b4a2e]">{currentBlueprint.tag}</span>
                  </div>
                  <p className="text-[10px] text-[#6b4a2e]">{currentBlueprint.description}</p>

                  <div className="flex items-center justify-between gap-1 text-xs font-mono">
                    <span className={`px-2 py-0.5 rounded border ${(resources.gold || 0) >= (currentBlueprint.baseCost?.gold || 0) ? 'bg-yellow-900/10 border-yellow-800 text-yellow-900' : 'bg-red-900/10 border-red-800 text-red-900 font-bold'}`}>
                      🪙 {currentBlueprint.baseCost?.gold || 0}
                    </span>
                    <span className={`px-2 py-0.5 rounded border ${(resources.wood || 0) >= (currentBlueprint.baseCost?.wood || 0) ? 'bg-orange-900/10 border-orange-800 text-orange-900' : 'bg-red-900/10 border-red-800 text-red-900 font-bold'}`}>
                      🪵 {currentBlueprint.baseCost?.wood || 0}
                    </span>
                    <span className={`px-2 py-0.5 rounded border ${(resources.stone || 0) >= (currentBlueprint.baseCost?.stone || 0) ? 'bg-stone-900/10 border-stone-800 text-stone-900' : 'bg-red-900/10 border-red-800 text-red-900 font-bold'}`}>
                      🪨 {currentBlueprint.baseCost?.stone || 0}
                    </span>
                  </div>

                  <button
                    onClick={() => onConstructBuilding && onConstructBuilding(selectedBuildingId, selectedBlueprintKey)}
                    disabled={!canAffordConstruct}
                    className={`w-full py-2.5 rounded-xl font-black text-xs transition flex items-center justify-center gap-1.5 shadow ${
                      canAffordConstruct
                        ? 'bg-gradient-to-r from-amber-800 to-yellow-800 text-amber-100 hover:brightness-110 active:scale-95 shadow border border-amber-600'
                        : 'bg-stone-400 text-stone-600 cursor-not-allowed'
                    }`}
                  >
                    <span>🏗️</span>
                    <span>Erect {currentBlueprint.name}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* SINGLE BUILDING INSPECTOR */
              <div className="space-y-3 animate-in fade-in">
                {/* Building Header Card */}
                <div className="bg-[#ebdcc1] p-3 rounded-2xl border border-[#8c6843] flex items-center gap-3 shadow-inner">
                  <div className="w-12 h-12 rounded-xl bg-[#cbb38b] border border-[#8c6843] flex items-center justify-center text-2xl shadow-inner flex-shrink-0">
                    {selectedDef?.inkSymbol}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs font-black text-[#442813]">{selectedDef?.name}</h3>
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border font-bold ${epochInfo.badgeClass}`}>
                        Tier {toRomanTier(currentLvl)}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-[#6b4a2e] block">{selectedDef?.tag}</span>
                  </div>
                </div>

                <p className="text-[11px] text-[#6b4a2e] leading-relaxed bg-[#dfcba6]/40 p-2 rounded-xl border border-[#bfa379]/40">
                  {selectedDef?.description}
                </p>

                {/* Automation Status */}
                {isHarvestBuilding && (
                  <div className={`p-2 rounded-xl border flex items-center gap-2 text-xs ${isAutomated ? 'bg-emerald-900/10 border-emerald-700/40 text-emerald-950' : 'bg-amber-900/10 border-amber-700/30 text-amber-950'}`}>
                    <span className="text-base">{isAutomated ? '🛡️' : '👆'}</span>
                    <div className="text-[10px]">
                      {isAutomated ? (
                        <span><strong className="font-bold">Automated by Garrison:</strong> Standing footmen automatically collect completed yields.</span>
                      ) : (
                        <span><strong className="font-bold">Manual Tapping:</strong> Click building directly or use Spacebar to Claim All.</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Guild Workforce Assignment Card */}
                {isHarvestBuilding && (
                  <div className={`p-2.5 rounded-xl border space-y-2 transition shadow-sm ${
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
                    </div>
                  </div>
                )}

                {/* Keep Annexation Decree */}
                {(selectedDef?.id === 'keep' || selectedBuildingId === 'keep') && nextTierDef && (
                  <div className="bg-[#dfcba6] p-2.5 rounded-xl border border-amber-800/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#442813]">Annex {nextTierDef.name}</span>
                      <span className="text-[9px] font-mono text-[#6b4a2e]">Req Keep T{nextTierDef.keepLevelReq}</span>
                    </div>
                    <p className="text-[10px] text-[#6b4a2e]">
                      Surveys {nextTierDef.unlockedPlots} total foundation plots for realm construction.
                    </p>
                    <div className="flex items-center justify-between pt-1">
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
                            ? 'bg-amber-800 text-amber-100 hover:brightness-110 active:scale-95 shadow border border-amber-600'
                            : 'bg-stone-400 text-stone-600 cursor-not-allowed'
                        }`}
                      >
                        Annex
                      </button>
                    </div>
                  </div>
                )}

                {/* Barracks Recruitment */}
                {(selectedDef?.id === 'barracks' || selectedBuildingId === 'barracks') && (
                  <div className="bg-[#dfcba6] p-2.5 rounded-xl border border-[#bfa379] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#442813]">Mustering Levy ({troops.total}/{maxTroopCap})</span>
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
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] font-mono text-[#6b4a2e]">
                        🪙 {recruitCostGold} • 🌾 {recruitCostFood}
                      </span>
                      <button
                        onClick={() => onTrainTroops && onTrainTroops(recruitCount)}
                        disabled={!canRecruit}
                        className={`px-3 py-1 rounded-lg text-xs font-black transition ${
                          canRecruit
                            ? 'bg-red-800 text-amber-100 hover:brightness-110 active:scale-95 shadow border border-red-700'
                            : 'bg-stone-400 text-stone-600 cursor-not-allowed'
                        }`}
                      >
                        Recruit
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

                {/* Ongoing Masonry Progress Bar */}
                {isUpgrading && (
                  <div className="bg-[#dfcba6] p-2.5 rounded-xl border-2 border-amber-800 space-y-1.5 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-[#442813] flex items-center gap-1">
                        <span className="animate-spin">🧱</span>
                        <span>Inscribing Foundations: Tier {toRomanTier(targetTier)}</span>
                      </span>
                      <span className="font-bold text-amber-950 bg-amber-900/15 px-1.5 py-0.5 rounded border border-amber-800/40 text-[10px]">
                        {formatBuildDuration(upgradeTimeRemaining)}
                      </span>
                    </div>
                    <div className="w-full bg-stone-900/20 rounded-full h-2.5 overflow-hidden border border-[#8c6843]/60 p-0.5">
                      <div
                        className="bg-gradient-to-r from-amber-700 via-yellow-600 to-amber-500 h-full rounded-full transition-all duration-300 relative overflow-hidden"
                        style={{ width: `${Math.min(100, Math.max(5, Math.round((1 - (upgradeTimeRemaining / (totalUpgradeTime || 1))) * 100)))}%` }}
                      >
                        <div className="absolute inset-0 bg-white/25 animate-pulse" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[9px] font-mono text-[#6b4a2e]">
                      <span>Workforce: {Math.round((1 - (upgradeTimeRemaining / (totalUpgradeTime || 1))) * 100)}%</span>
                      <span className="text-amber-900 font-bold">⚠️ 50% baseline efficiency during masonry</span>
                    </div>
                  </div>
                )}

                {/* Upgrade Requirement & Royal Wax Seal Button */}
                <div className="bg-[#dfcba6] p-2.5 rounded-xl border border-[#bfa379] space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#6b4a2e] uppercase">
                    <span>Upgrade Target: Tier {toRomanTier(currentLvl)} → Tier {toRomanTier(currentLvl + 1)}</span>
                    <span className={`px-1.5 py-0.5 rounded border text-[9px] ${epochInfo.badgeClass}`}>
                      {epochInfo.name}
                    </span>
                  </div>

                  {/* Production Multipliers Jump */}
                  <div className="bg-[#ebdcc1] p-2 rounded-xl border border-[#bfa379] space-y-0.5 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-[#6b4a2e] font-bold uppercase text-[9px]">Production Scaling:</span>
                      <span className="text-emerald-800 font-black text-[10px]">+{yieldPct}% Expansion</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
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
                  {isVaultGatedSingle && (
                    <div className="bg-red-950/20 p-2 rounded-xl border border-red-800/60 text-red-950 text-[10px] font-mono flex items-start gap-1.5 animate-pulse">
                      <span>🔒</span>
                      <div>
                        <strong className="block font-bold">The Royal Vault cannot contain the materials required for this decree.</strong>
                        <span className="text-red-900">Upgrade the Deep Vault and storage silos to expand treasury capacity.</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-1 text-xs font-mono">
                    <span className={`px-2 py-0.5 rounded border flex-1 text-center ${(resources.gold || 0) >= costGold ? 'bg-yellow-900/10 border-yellow-800 text-yellow-900 font-bold' : 'bg-red-900/10 border-red-800 text-red-900 font-bold'}`}>
                      🪙 {costGold}
                    </span>
                    <span className={`px-2 py-0.5 rounded border flex-1 text-center ${(resources.wood || 0) >= costWood ? 'bg-orange-900/10 border-orange-800 text-orange-900 font-bold' : 'bg-red-900/10 border-red-800 text-red-900 font-bold'}`}>
                      🪵 {costWood}
                    </span>
                    <span className={`px-2 py-0.5 rounded border flex-1 text-center ${(resources.stone || 0) >= costStone ? 'bg-stone-900/10 border-stone-800 text-stone-900 font-bold' : 'bg-red-900/10 border-red-800 text-red-900 font-bold'}`}>
                      🪨 {costStone}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      triggerHaptic('heavy');
                      if (onUpgradeBuilding) onUpgradeBuilding(selectedBuildingId, e);
                    }}
                    disabled={!canAffordSingle || stampingDecree || isUpgrading || isVaultGatedSingle || isMaxTier}
                    className={`w-full py-2.5 rounded-xl font-black text-xs transition flex items-center justify-center gap-2 shadow-lg ${
                      isUpgrading
                        ? 'bg-amber-950/20 text-amber-900 border-amber-800/50 cursor-not-allowed'
                        : isMaxTier
                          ? 'bg-stone-300 text-stone-600 border-stone-400 cursor-not-allowed'
                          : isVaultGatedSingle
                            ? 'bg-red-950/20 text-red-900 border-red-800/60 cursor-not-allowed'
                            : canAffordSingle
                              ? 'bg-gradient-to-r from-red-800 to-rose-900 text-amber-100 hover:brightness-110 active:scale-95 shadow-red-950/40 border border-red-700 cursor-pointer'
                              : 'bg-stone-400 text-stone-700 cursor-not-allowed border border-stone-500'
                    }`}
                  >
                    <span className={stampingDecree ? 'animate-spin' : ''}>
                      {isUpgrading ? '🧱' : isVaultGatedSingle ? '🔒' : '🩸'}
                    </span>
                    <span>
                      {isUpgrading
                        ? `Masonry Underway (${formatBuildDuration(upgradeTimeRemaining)})`
                        : isMaxTier
                          ? `Monumental Tier XX Reached`
                          : isVaultGatedSingle
                            ? `Vault Capacity Deficient`
                            : canAffordSingle
                              ? `Seal Royal Decree (Tier ${toRomanTier(currentLvl + 1)})`
                              : `Insufficient Stores for Tier ${toRomanTier(currentLvl + 1)}`}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* =========================================================================
            TAB: VILLAGER ROSTER & WORKFORCE MANAGEMENT
            ========================================================================= */}
        {activeLedgerTab === 'roster' && (
          <div className="space-y-3 animate-in fade-in">
            {/* Roster Overview Banner */}
            <div className="bg-[#ebdcc1] p-3 rounded-2xl border border-[#8c6843] space-y-2 shadow-inner">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-[#442813] uppercase tracking-wider flex items-center gap-1.5">
                    <span>👥</span>
                    <span>Crown Population Roster</span>
                  </h3>
                  <span className="text-[10px] font-mono text-[#6b4a2e]">
                    {villagers.length} Registered Subjects & Guild Artisans
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#442813] text-amber-200 text-[10px] font-mono font-bold">
                  {villagers.filter(v => v.role !== 'Unassigned').length} Assigned
                </span>
              </div>

              {/* Citizen Role Summary Chips */}
              <div className="flex flex-wrap gap-1 pt-1">
                {Object.entries(ROLE_DEFINITIONS).map(([rKey, rDef]) => {
                  const cnt = (villagers || []).filter(v => v.role === rKey).length;
                  if (cnt === 0 && rKey !== 'Unassigned') return null;
                  return (
                    <span
                      key={rKey}
                      className="px-2 py-0.5 rounded-lg bg-[#dfcba6] border border-[#bfa379] text-[9.5px] font-mono font-bold text-[#442813] flex items-center gap-1 shadow-xs"
                    >
                      <span>{rDef.icon}</span>
                      <span>{rDef.label}:</span>
                      <span className="text-[#8c6843]">{cnt}</span>
                    </span>
                  );
                })}
              </div>

              {/* Starvation / Dehydration Warning */}
              {(stats.isStarving || stats.isDehydrated) && (
                <div className="bg-red-950/20 p-2 rounded-xl border border-red-800/60 text-red-950 text-[10px] font-mono flex items-center gap-1.5 animate-pulse">
                  <span>⚠️</span>
                  <span>
                    {stats.isStarving && stats.isDehydrated
                      ? 'Severe Starvation & Dehydration: Productivity heavily degraded!'
                      : stats.isStarving
                        ? 'Starvation in the realm: Sustenance depleted!'
                        : 'Drought in the realm: Water wells dry, productivity debuffed!'}
                  </span>
                </div>
              )}
            </div>

            {/* Villager Card List */}
            <div className="space-y-2">
              {villagers.length === 0 ? (
                <div className="bg-[#ebdcc1] p-4 rounded-2xl border border-[#8c6843] text-center text-xs font-mono text-[#6b4a2e]">
                  No subjects registered. Expand Keep or recruit troops in Barracks.
                </div>
              ) : (
                villagers.map(v => {
                  const roleDef = ROLE_DEFINITIONS[v.role] || ROLE_DEFINITIONS.Unassigned;
                  const assignedPlot = (grid || []).find(p => p.id === v.assignedBuildingId);
                  const locationText = v.role === 'Soldier'
                    ? 'Garrison Ramparts'
                    : v.role === 'Spy'
                      ? (v.assignedBuildingId ? `Infiltrating Sector ${v.assignedBuildingId}` : 'Foreign Espionage')
                      : assignedPlot
                        ? `${BUILDINGS[assignedPlot.buildingId]?.name || 'Citadel Plot'} (${assignedPlot.id})`
                        : (v.role === 'Unassigned' ? 'Citadel Commons (Idle)' : 'Unassigned Plot');

                  return (
                    <div
                      key={v.id}
                      className="bg-[#ebdcc1] p-2.5 rounded-xl border border-[#bfa379] shadow-sm space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base p-1 rounded-lg bg-[#dfcba6] border border-[#bfa379]">
                            {roleDef.icon}
                          </span>
                          <div>
                            <span className="font-bold text-xs text-[#442813]">{v.name}</span>
                            <span className="block text-[9.5px] font-mono text-[#6b4a2e]">
                              📍 {locationText}
                            </span>
                          </div>
                        </div>

                        {/* Role Select Dropdown */}
                        <select
                          value={v.role || 'Unassigned'}
                          onChange={(e) => {
                            const newRole = e.target.value;
                            triggerHaptic('selection');
                            sounds.playCoin();
                            if (newRole === 'Unassigned') {
                              onUnassignVillager?.(v.id);
                            } else {
                              onAssignVillager?.(v.id, newRole);
                            }
                          }}
                          className="bg-[#dfcba6] text-[#442813] text-[10.5px] font-mono font-bold px-2 py-1 rounded-lg border border-[#8c6843] shadow-inner focus:outline-none cursor-pointer"
                        >
                          {Object.keys(ROLE_DEFINITIONS).map(rKey => (
                            <option key={rKey} value={rKey}>
                              {ROLE_DEFINITIONS[rKey].icon} {rKey}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Morale and status bar */}
                      <div className="flex items-center justify-between text-[9px] font-mono pt-1 border-t border-[#bfa379]/40 text-[#6b4a2e]">
                        <span>Morale: <strong className="text-emerald-800">{v.morale || 100}%</strong></span>
                        <span>Status: <strong className={v.role === 'Unassigned' ? 'text-amber-800' : 'text-emerald-800'}>{v.role === 'Unassigned' ? 'Idle Reserve' : 'Active Duty'}</strong></span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: ROYAL TECHNOLOGY & DECREES
            ========================================================================= */}
        {activeLedgerTab === 'decrees' && (
          <div className="space-y-3 animate-in fade-in">
            {Object.values(TECHNOLOGIES).map(tech => {
              const isResearched = (technologies || []).includes(tech.id);
              const reqKeep = tech.requirements?.keepTier || 1;
              const keepPlotLvl = (grid && Array.isArray(grid) ? grid.find(p => p.buildingId === 'keep')?.level : null) || buildings.keep || 1;
              const meetsKeep = keepPlotLvl >= reqKeep;
              const discount = stats.currentFaction?.id === 'humans' ? 0.5 : 1.0;
              const costGold = Math.round((tech.requirements?.cost?.gold || 0) * discount);
              const costFood = Math.round((tech.requirements?.cost?.food || 0) * discount);
              const costWood = Math.round((tech.requirements?.cost?.wood || 0) * discount);
              const costStone = Math.round((tech.requirements?.cost?.stone || 0) * discount);
              const costFlora = Math.round((tech.requirements?.cost?.flora || 0) * discount);

              const canAfford =
                (resources.gold || 0) >= costGold &&
                (resources.food || 0) >= costFood &&
                (resources.wood || 0) >= costWood &&
                (resources.stone || 0) >= costStone &&
                (resources.flora || 0) >= costFlora &&
                meetsKeep;

              return (
                <div key={tech.id} className="bg-[#ebdcc1] p-3 rounded-2xl border border-[#8c6843] space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{tech.inkSymbol || '📜'}</span>
                      <div>
                        <h3 className="text-xs font-black text-[#442813]">{tech.name}</h3>
                        <span className="text-[9px] font-mono text-[#6b4a2e]">{tech.subtitle}</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono text-[#5c3e23] bg-[#dfcba6] px-1.5 py-0.5 rounded border border-[#8c6843]/40">
                      ⏳ {tech.duration || 15}s
                    </span>
                  </div>
                  <p className="text-[10px] text-[#6b4a2e]">
                    {tech.description}
                  </p>
                  <div className="bg-[#f0e3cc] p-1.5 rounded-lg text-[9.5px] font-mono font-bold text-[#442813]">
                    ⭐ {tech.benefit || 'Sovereign decree benefit'}
                  </div>

                  {isResearched ? (
                    <div className="bg-emerald-900/10 border border-emerald-700/40 rounded-xl p-2 flex items-center justify-between text-xs font-mono font-bold text-emerald-900">
                      <span>Decree Ratified & Active</span>
                      <span className="text-base">🛡️</span>
                    </div>
                  ) : (
                    <div className="space-y-1.5 pt-1 border-t border-[#bfa379]/60">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className={meetsKeep ? 'text-green-800 font-bold' : 'text-red-800 font-bold'}>
                          Requires Keep T{reqKeep}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {costGold > 0 && <span className={(resources.gold || 0) >= costGold ? 'text-amber-900 font-bold' : 'text-red-900 font-bold'}>🪙 {costGold}</span>}
                          {costFood > 0 && <span className={(resources.food || 0) >= costFood ? 'text-amber-900 font-bold' : 'text-red-900 font-bold'}>🌾 {costFood}</span>}
                          {costWood > 0 && <span className={(resources.wood || 0) >= costWood ? 'text-amber-900 font-bold' : 'text-red-900 font-bold'}>🪵 {costWood}</span>}
                          {costStone > 0 && <span className={(resources.stone || 0) >= costStone ? 'text-amber-900 font-bold' : 'text-red-900 font-bold'}>🪨 {costStone}</span>}
                          {costFlora > 0 && <span className={(resources.flora || 0) >= costFlora ? 'text-emerald-900 font-bold' : 'text-red-900 font-bold'}>🌿 {costFlora}</span>}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (canAfford && onResearchTechnology) {
                            triggerHaptic('heavy');
                            haptics.heavy();
                            sounds.playWaxSealThud();
                            onResearchTechnology(tech.id);
                          }
                        }}
                        disabled={!canAfford}
                        className={`w-full py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shadow ${
                          canAfford
                            ? 'bg-gradient-to-r from-red-800 to-rose-900 text-amber-100 hover:brightness-110 active:scale-95 shadow border border-red-700 cursor-pointer'
                            : 'bg-stone-400 text-stone-600 cursor-not-allowed'
                        }`}
                      >
                        <span>🩸</span>
                        <span>Seal Decree</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* =========================================================================
            TAB 3: CHRONICLE & REALM AUDIT
            ========================================================================= */}
        {activeLedgerTab === 'records' && (
          <div className="space-y-3 animate-in fade-in">
            {/* Demographics & Labor Saturation */}
            <div className="bg-[#ebdcc1] p-3 rounded-2xl border border-[#8c6843] space-y-1.5 text-xs font-mono">
              <span className="text-[10px] font-black uppercase text-[#442813] block">
                Citadel Labor Saturation
              </span>
              <div className="flex justify-between items-center text-[#6b4a2e]">
                <span>Living Troops:</span>
                <span className="font-bold text-[#442813]">{troops.total} / {maxTroopCap}</span>
              </div>
              <div className="flex justify-between items-center text-[#6b4a2e]">
                <span>Labor Demand:</span>
                <span className="font-bold text-[#442813]">{stats.totalLaborDemand || 20} footmen</span>
              </div>
              <div className="flex justify-between items-center text-[#6b4a2e]">
                <span>Labor Efficiency:</span>
                <span className="font-bold text-emerald-800">{Math.round((stats.laborEfficiency || 1) * 100)}%</span>
              </div>
            </div>

            {/* Scribe Event Stream */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-mono uppercase font-bold text-[#6b4a2e]">
                Recent Historical Missives:
              </span>
              <div className="space-y-1 max-h-44 overflow-y-auto">
                {battleLogs.slice(0, 4).map(log => (
                  <div
                    key={log.id}
                    className={`p-2 rounded-xl border text-[10px] ${
                      log.type === 'win'
                        ? 'bg-green-900/10 border-green-800/30 text-green-950'
                        : 'bg-red-900/10 border-red-800/30 text-red-950'
                    }`}
                  >
                    <div className="font-bold">{log.title}</div>
                    <div className="text-[9px] text-[#6b4a2e]">{log.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
