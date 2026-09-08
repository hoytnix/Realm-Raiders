import React, { useState, useRef } from 'react';
import {
  BUILDINGS,
  EMPTY_PLOT,
  CONSTRUCTIBLE_BLUEPRINTS,
  TERRITORY_TIERS,
  MAX_TERRITORY_TIER,
  TROOP_RECRUIT_COST,
  sounds
} from '../../constants/index.js';
import { haptics } from '../../utils/index.js';

export function BuildingInspector({
  selectedDef = BUILDINGS.keep,
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
  onTransmuteFlora
}) {
  const [isExpanded, setIsExpanded] = useState(false);
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
          MOBILE EXPANDABLE / SWIPEABLE BOTTOM SHEET (< md)
          ========================================================================= */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`md:hidden fixed bottom-14 left-0 right-0 z-30 bg-[#e4d4b3] border-t-2 border-[#bfa379] shadow-[0_-10px_25px_rgba(0,0,0,0.4)] transition-all duration-300 ease-out flex flex-col ${
          isExpanded ? 'max-h-[85vh] p-3 overflow-y-auto' : 'max-h-12 py-1 px-3'
        }`}
      >
        {/* Drag Handle Bar & Peek Header */}
        <div
          onClick={toggleExpand}
          className="w-full flex items-center justify-between cursor-pointer py-1"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#cbb38b] border border-[#8c6843] flex items-center justify-center text-lg shadow-inner flex-shrink-0">
              {isEmptyPlot ? EMPTY_PLOT.inkSymbol : selectedDef?.inkSymbol}
            </div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-black text-[#442813]">
                {isEmptyPlot ? 'Cleared Foundation' : selectedDef?.name}
              </h3>
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
              {isEmptyPlot ? (
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-900/20 text-amber-900 font-bold">
                  Plot Ready ⛏️
                </span>
              ) : canAfford ? (
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-green-900/20 text-green-900 font-bold border border-green-700/40 animate-pulse">
                  Ready ✨
                </span>
              ) : (
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-900/10 text-amber-900 font-bold">
                  🪙{costGold}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 text-[10px] font-mono text-[#6b4a2e] font-bold">
            <span>{isExpanded ? '▼ Close' : isEmptyPlot ? '▲ Commission' : '▲ Details'}</span>
          </div>
        </div>

        {/* Expanded Sheet Body */}
        {isExpanded && (
          <div className="mt-2 pt-2 border-t border-[#bfa379]/60 space-y-3 animate-in fade-in duration-200">
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
              /* MODE 2: CONSTRUCTED STRUCTURE INSPECTION */
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] text-[#6b4a2e] leading-snug flex-1">
                    {selectedDef?.description}
                  </p>
                </div>

                {/* Upgrade Cost Requirements */}
                <div className="flex items-center justify-between bg-[#dfcba6] p-2 rounded-xl border border-[#bfa379]">
                  <span className="text-[10px] font-mono font-bold text-[#6b4a2e] uppercase">
                    Upgrade Costs:
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-mono">
                    <span className={`px-2 py-0.5 rounded border ${resources.gold >= costGold ? 'bg-yellow-900/10 border-yellow-800 text-yellow-900 font-bold' : 'bg-red-900/10 border-red-800 text-red-900 font-bold'}`}>
                      🪙 {costGold}
                    </span>
                    <span className={`px-2 py-0.5 rounded border ${resources.wood >= costWood ? 'bg-orange-900/10 border-orange-800 text-orange-900' : 'bg-red-900/10 border-red-800 text-red-900 font-bold'}`}>
                      🪵 {costWood}
                    </span>
                    <span className={`px-2 py-0.5 rounded border ${resources.stone >= costStone ? 'bg-stone-900/10 border-stone-800 text-stone-900' : 'bg-red-900/10 border-red-800 text-red-900 font-bold'}`}>
                      🪨 {costStone}
                    </span>
                  </div>
                </div>

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
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#6b4724] text-amber-200 font-bold">
                    Tier {currentLvl}
                  </span>
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
                    Mustering ({troops.total}/{maxTroopCap})
                  </div>
                  <div className="text-[9px] font-mono text-[#6b4a2e]">
                    🪙{recruitCostGold} • 🌾{recruitCostFood}
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
                </div>
                <button
                  onClick={() => onTrainTroops && onTrainTroops(recruitCount)}
                  disabled={!canRecruit}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition ${
                    canRecruit
                      ? 'bg-red-800 text-amber-100 hover:brightness-110 active:scale-95 shadow'
                      : 'bg-stone-400 text-stone-600 cursor-not-allowed'
                  }`}
                >
                  Recruit
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
