import React, { useState } from 'react';
import {
  BUILDINGS,
  EMPTY_PLOT,
  CONSTRUCTIBLE_BLUEPRINTS,
  TERRITORY_TIERS,
  MAX_TERRITORY_TIER,
  TROOP_RECRUIT_COST,
  TECHNOLOGIES,
  sounds
} from '../../constants/index.js';
import { haptics } from '../../utils/index.js';

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

  const discount = stats.currentFaction?.id === 'humans' ? 0.5 : 1.0;
  const costGold = isEmptyPlot ? 0 : Math.round((selectedDef.baseCost?.gold || 0) * Math.pow(selectedDef.costMult || 1.5, currentLvl - 1) * discount);
  const costWood = isEmptyPlot ? 0 : Math.round((selectedDef.baseCost?.wood || 0) * Math.pow(selectedDef.costMult || 1.5, currentLvl - 1) * discount);
  const costStone = isEmptyPlot ? 0 : Math.round((selectedDef.baseCost?.stone || 0) * Math.pow(selectedDef.costMult || 1.5, currentLvl - 1) * discount);

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
        const g = Math.round((bD.baseCost?.gold || 0) * Math.pow(bD.costMult || 1.5, lvl - 1) * discount);
        const w = Math.round((bD.baseCost?.wood || 0) * Math.pow(bD.costMult || 1.5, lvl - 1) * discount);
        const s = Math.round((bD.baseCost?.stone || 0) * Math.pow(bD.costMult || 1.5, lvl - 1) * discount);
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
        <div className="grid grid-cols-3 gap-1 bg-[#cbb38b]/60 p-1 rounded-xl border border-[#8c6843]/50 text-xs font-bold">
          <button
            onClick={() => {
              sounds.playCoin();
              haptics.light();
              setActiveLedgerTab('structure');
            }}
            className={`py-1.5 px-2 rounded-lg transition text-center flex items-center justify-center gap-1 text-[11px] ${
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
              setActiveLedgerTab('decrees');
            }}
            className={`py-1.5 px-2 rounded-lg transition text-center flex items-center justify-center gap-1 text-[11px] ${
              activeLedgerTab === 'decrees'
                ? 'bg-[#f4ecd8] text-[#442813] shadow font-black border border-[#8c6843]'
                : 'text-[#6b4a2e] hover:bg-[#dfcba6]'
            }`}
          >
            <span>📜</span>
            <span>Decrees [T]</span>
          </button>

          <button
            onClick={() => {
              sounds.playCoin();
              haptics.light();
              setActiveLedgerTab('records');
            }}
            className={`py-1.5 px-2 rounded-lg transition text-center flex items-center justify-center gap-1 text-[11px] ${
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
                        Tier {item.lvl}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Bulk Upgrade Requirements */}
                <div className="bg-[#dfcba6] p-2.5 rounded-xl border border-[#bfa379] space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#6b4a2e] uppercase">
                    <span>Combined Upgrade Cost:</span>
                    <span className={canAffordBulk ? 'text-green-800' : 'text-red-800'}>
                      {canAffordBulk ? 'Store Affords All ✨' : 'Stores Short'}
                    </span>
                  </div>

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
                    onClick={() => onBulkUpgrade && onBulkUpgrade(multiSelectedIds)}
                    disabled={!canAffordBulk}
                    className={`w-full py-2.5 rounded-xl font-black text-xs transition flex items-center justify-center gap-2 shadow ${
                      canAffordBulk
                        ? 'bg-gradient-to-r from-red-800 to-rose-900 text-amber-100 hover:brightness-110 active:scale-95 shadow border border-red-700'
                        : 'bg-stone-400 text-stone-600 cursor-not-allowed'
                    }`}
                  >
                    <span>🩸</span>
                    <span>Seal Bulk Upgrade Decree ({multiSelectedIds.length})</span>
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
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#6b4724] text-amber-200 font-bold">
                        T{currentLvl}
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

                {/* Upgrade Requirement & Royal Wax Seal Button */}
                <div className="bg-[#dfcba6] p-2.5 rounded-xl border border-[#bfa379] space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#6b4a2e] uppercase">
                    <span>Upgrade to Tier {currentLvl + 1}:</span>
                    <span className={canAffordSingle ? 'text-green-800' : 'text-red-800'}>
                      {canAffordSingle ? 'Affordable ✨' : 'Short Stores'}
                    </span>
                  </div>

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
                    onClick={(e) => onUpgradeBuilding && onUpgradeBuilding(selectedBuildingId, e)}
                    disabled={!canAffordSingle || stampingDecree}
                    className={`w-full py-2.5 rounded-xl font-black text-xs transition flex items-center justify-center gap-2 shadow-lg ${
                      canAffordSingle
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
          </>
        )}

        {/* =========================================================================
            TAB 2: ROYAL TECHNOLOGY & DECREES
            ========================================================================= */}
        {activeLedgerTab === 'decrees' && (
          <div className="space-y-3 animate-in fade-in">
            <div className="bg-[#ebdcc1] p-3 rounded-2xl border border-[#8c6843]">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-base">🛡️</span>
                <div>
                  <h3 className="text-xs font-black text-[#442813]">Vassal Foraging Lines</h3>
                  <span className="text-[9px] font-mono text-[#6b4a2e]">Troop Quartermaster Decree</span>
                </div>
              </div>
              <p className="text-[10px] text-[#6b4a2e] mb-2">
                Orders idle standing garrison footmen to continuously harvest ripe yields from Farms, Granaries, Mills, Quarries, and Mints without monarch clicking.
              </p>

              {hasTroopLogistics ? (
                <div className="bg-emerald-900/10 border border-emerald-700/40 rounded-xl p-2 flex items-center justify-between text-xs font-mono font-bold text-emerald-900">
                  <span>Decree Ratified & Active</span>
                  <span className="text-base">🛡️</span>
                </div>
              ) : (
                <div className="space-y-2 pt-1 border-t border-[#bfa379]/60">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className={(buildings.keep || 1) >= 2 ? 'text-green-800 font-bold' : 'text-red-800 font-bold'}>
                      Requires Keep T2
                    </span>
                    <div className="flex gap-1.5">
                      <span className={(resources.gold || 0) >= 150 ? 'text-amber-900 font-bold' : 'text-red-900 font-bold'}>🪙 150</span>
                      <span className={(resources.food || 0) >= 100 ? 'text-amber-900 font-bold' : 'text-red-900 font-bold'}>🌾 100</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onResearchTechnology && onResearchTechnology('tech_troop_logistics')}
                    disabled={!canAffordLogistics}
                    className={`w-full py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shadow ${
                      canAffordLogistics
                        ? 'bg-gradient-to-r from-red-800 to-rose-900 text-amber-100 hover:brightness-110 active:scale-95 shadow border border-red-700'
                        : 'bg-stone-400 text-stone-600 cursor-not-allowed'
                    }`}
                  >
                    <span>🩸</span>
                    <span>Seal Logistics Decree</span>
                  </button>
                </div>
              )}
            </div>
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
