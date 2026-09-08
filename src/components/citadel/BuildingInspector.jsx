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
  onConstructBuilding,
  onExpandTerritory,
  onTrainTroops
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedBlueprintKey, setSelectedBlueprintKey] = useState('farm');
  const [recruitCount, setRecruitCount] = useState(5);
  const touchStartY = useRef(0);

  const isEmptyPlot = selectedBuildingId?.startsWith('plot-') || selectedDef?.type === 'plot';
  const isKeep = selectedBuildingId === 'keep';
  const isBarracks = selectedBuildingId === 'barracks';

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
    if (onUpgradeBuilding) onUpgradeBuilding(selectedBuildingId, e);
  };

  // Territory expansion data
  const nextTierIndex = territoryTier < MAX_TERRITORY_TIER ? territoryTier + 1 : null;
  const nextTierDef = nextTierIndex ? TERRITORY_TIERS[nextTierIndex] : null;
  const currentTierDef = TERRITORY_TIERS[territoryTier] || TERRITORY_TIERS[1];
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
              {isEmptyPlot ? EMPTY_PLOT.inkSymbol : selectedDef?.inkSymbol || '🏰'}
            </div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-black text-[#442813]">
                {isEmptyPlot ? 'Cleared Foundation' : selectedDef?.name || 'Citadel Structure'}
              </h3>
              {!isEmptyPlot && (
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#6b4724] text-amber-200 font-bold">
                  T{currentLvl}
                </span>
              )}
              {isEmptyPlot ? (
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-900/20 text-amber-900 font-bold">
                  Commission ✨
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
            {/* 1. EMPTY FOUNDATION BLUEPRINT DRAWER */}
            {isEmptyPlot ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-[#6b4a2e] font-bold">
                    Select a blueprint to erect upon this foundation:
                  </p>
                  <span className="text-[10px] font-mono text-amber-900 font-bold">
                    🔨 {currentBlueprint.laborRequired || 2} Laborers
                  </span>
                </div>

                {/* Blueprint Horizontal Carousel */}
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
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
                        <span className="text-[8px] font-mono text-[#6b4a2e]">
                          {bp.tag}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Blueprint Details Card */}
                <div className="bg-[#dfcba6] p-2.5 rounded-xl border border-[#bfa379] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg">{currentBlueprint.inkSymbol}</span>
                      <h4 className="text-xs font-black text-[#442813]">{currentBlueprint.name}</h4>
                    </div>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#6b4724] text-amber-100 font-bold">
                      {currentBlueprint.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6b4a2e] leading-snug">
                    {currentBlueprint.description}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-mono font-bold text-[#6b4a2e]">Build Costs:</span>
                    <div className="flex items-center gap-1 text-xs font-mono">
                      <span className={`px-2 py-0.5 rounded border ${resources.gold >= currentBlueprint.baseCost.gold ? 'bg-yellow-900/10 border-yellow-800 text-yellow-900' : 'bg-red-900/10 border-red-800 text-red-900 font-bold'}`}>
                        🪙 {currentBlueprint.baseCost.gold}
                      </span>
                      <span className={`px-2 py-0.5 rounded border ${resources.wood >= currentBlueprint.baseCost.wood ? 'bg-orange-900/10 border-orange-800 text-orange-900' : 'bg-red-900/10 border-red-800 text-red-900 font-bold'}`}>
                        🪵 {currentBlueprint.baseCost.wood}
                      </span>
                      <span className={`px-2 py-0.5 rounded border ${resources.stone >= currentBlueprint.baseCost.stone ? 'bg-stone-900/10 border-stone-800 text-stone-900' : 'bg-red-900/10 border-red-800 text-red-900 font-bold'}`}>
                        🪨 {currentBlueprint.baseCost.stone}
                      </span>
                    </div>
                  </div>
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
              /* 2. CONSTRUCTED STRUCTURE INSPECTION */
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] text-[#6b4a2e] leading-snug flex-1">
                    {selectedDef?.description}
                  </p>
                  <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                    {selectedDef?.cycleDuration && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-900/20 text-amber-900 font-bold">
                        ⏱️ {selectedDef.cycleDuration}s Yield
                      </span>
                    )}
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-900/10 text-amber-900">
                      🔨 {selectedDef?.laborRequired || 2} Labor Required
                    </span>
                  </div>
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
                    <span className={`px-2 py-0.5 rounded border ${resources.wood >= costWood ? 'bg-orange-900/10 border-orange-800 text-orange-900 font-bold' : 'bg-red-900/10 border-red-800 text-red-900 font-bold'}`}>
                      🪵 {costWood}
                    </span>
                    <span className={`px-2 py-0.5 rounded border ${resources.stone >= costStone ? 'bg-stone-900/10 border-stone-800 text-stone-900 font-bold' : 'bg-red-900/10 border-red-800 text-red-900 font-bold'}`}>
                      🪨 {costStone}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleUpgradeClick}
                  disabled={!canAfford || stampingDecree}
                  className={`w-full py-3 rounded-xl font-black text-xs transition flex items-center justify-center gap-2 shadow-lg ${
                    canAfford
                      ? 'bg-gradient-to-r from-red-800 to-rose-900 text-amber-100 active:scale-95 shadow-red-950/40 border border-red-700'
                      : 'bg-stone-400 text-stone-700 cursor-not-allowed border border-stone-500'
                  }`}
                >
                  <span className={stampingDecree ? 'animate-spin' : ''}>🩸</span>
                  <span>Seal Royal Decree (Upgrade to Tier {currentLvl + 1})</span>
                </button>

                {/* KEEP TERRITORY ANNEXATION CARD */}
                {isKeep && nextTierDef && (
                  <div className="bg-[#dfcba6] p-2.5 rounded-xl border border-amber-800/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span>🗺️</span>
                        <h4 className="text-xs font-black text-[#442813]">Annex Surrounding Lands</h4>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-amber-900">
                        {nextTierDef.name} ({nextTierDef.size}x{nextTierDef.size})
                      </span>
                    </div>
                    <p className="text-[10px] text-[#6b4a2e]">
                      Unlock outer coordinate rings and survey {nextTierDef.unlockedPlots} total foundation plots. Requires Keep Tier {nextTierDef.keepLevelReq}.
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[10px] font-mono">
                        <span className={resources.gold >= nextTierDef.cost.gold ? 'text-amber-950 font-bold' : 'text-red-800 font-bold'}>🪙{nextTierDef.cost.gold}</span>
                        <span className={resources.wood >= nextTierDef.cost.wood ? 'text-amber-950 font-bold' : 'text-red-800 font-bold'}>🪵{nextTierDef.cost.wood}</span>
                        <span className={resources.stone >= nextTierDef.cost.stone ? 'text-amber-950 font-bold' : 'text-red-800 font-bold'}>🪨{nextTierDef.cost.stone}</span>
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
                        Annex Marches
                      </button>
                    </div>
                  </div>
                )}

                {/* BARRACKS TROOP RECRUITMENT CONTROLS */}
                {isBarracks && (
                  <div className="bg-[#dfcba6] p-2.5 rounded-xl border border-amber-800/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span>⚔️</span>
                        <h4 className="text-xs font-black text-[#442813]">Recruit Standing Levies</h4>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-amber-900">
                        {troops.total} / {maxTroopCap} Troops
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        {[1, 5, 10].map(cnt => (
                          <button
                            key={cnt}
                            onClick={() => setRecruitCount(cnt)}
                            className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                              recruitCount === cnt
                                ? 'bg-amber-900 text-amber-100'
                                : 'bg-[#cbb38b] text-stone-800'
                            }`}
                          >
                            +{cnt}
                          </button>
                        ))}
                      </div>
                      <div className="text-[10px] font-mono text-[#442813]">
                        <span>🪙 {recruitCostGold}</span> • <span>🌾 {recruitCostFood}</span>
                      </div>
                      <button
                        onClick={() => onTrainTroops && onTrainTroops(recruitCount)}
                        disabled={!canRecruit}
                        className={`px-3 py-1 rounded-lg text-xs font-black transition ${
                          canRecruit
                            ? 'bg-gradient-to-r from-red-800 to-rose-900 text-amber-100 active:scale-95 border border-red-700'
                            : 'bg-stone-400 text-stone-600 cursor-not-allowed'
                        }`}
                      >
                        Recruit
                      </button>
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
      <div className="hidden md:flex bg-[#e4d4b3] border-t-2 border-[#bfa379] p-3 items-center justify-between gap-3 select-none">
        {isEmptyPlot ? (
          /* EMPTY FOUNDATION BLUEPRINT DRAWER */
          <div className="w-full flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#cbb38b] border border-[#8c6843] flex items-center justify-center text-2xl shadow-inner flex-shrink-0">
                ⛏️
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-[#442813]">Architectural Commission</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-900/20 text-amber-900 font-bold">
                    Surveyed Plot
                  </span>
                </div>
                <p className="text-[11px] text-[#6b4a2e]">Select a blueprint to erect upon this cleared foundation:</p>
              </div>
            </div>

            {/* Blueprints Horizontal Carousel */}
            <div className="flex items-center gap-2 overflow-x-auto max-w-xl py-1">
              {CONSTRUCTIBLE_BLUEPRINTS.map(bpKey => {
                const bp = BUILDINGS[bpKey];
                if (!bp) return null;
                const canBuild =
                  resources.gold >= bp.baseCost.gold &&
                  resources.wood >= bp.baseCost.wood &&
                  resources.stone >= bp.baseCost.stone;

                return (
                  <button
                    key={bpKey}
                    onClick={() => onConstructBuilding && onConstructBuilding(selectedBuildingId, bpKey)}
                    disabled={!canBuild}
                    className={`p-2 rounded-xl border text-left flex flex-col justify-between min-w-[135px] transition ${
                      canBuild
                        ? 'bg-[#dfcba6] hover:bg-[#d5be97] border-[#bfa379] shadow-sm active:scale-95'
                        : 'bg-stone-300/60 border-stone-400/60 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-base">{bp.inkSymbol}</span>
                      <span className="text-[11px] font-black text-[#442813] line-clamp-1">{bp.name}</span>
                    </div>
                    <div className="text-[9px] font-mono text-[#6b4a2e] space-y-0.5">
                      <div>🔨 {bp.laborRequired} Labor</div>
                      <div className="flex gap-1 font-bold">
                        <span className={resources.gold >= bp.baseCost.gold ? 'text-amber-950' : 'text-red-800'}>🪙{bp.baseCost.gold}</span>
                        <span className={resources.wood >= bp.baseCost.wood ? 'text-amber-950' : 'text-red-800'}>🪵{bp.baseCost.wood}</span>
                        <span className={resources.stone >= bp.baseCost.stone ? 'text-amber-950' : 'text-red-800'}>🪨{bp.baseCost.stone}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* CONSTRUCTED BUILDING CONTROLS & SPECIAL ACTIONS */
          <div className="w-full flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#cbb38b] border border-[#8c6843] flex items-center justify-center text-2xl shadow-inner flex-shrink-0">
                {selectedDef?.inkSymbol || '🏰'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-[#442813]">{selectedDef?.name}</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#6b4724] text-amber-200 font-bold">
                    Tier {currentLvl}
                  </span>
                  {selectedDef?.cycleDuration && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-900/20 text-amber-900 font-bold">
                      ⏱️ {selectedDef.cycleDuration}s Harvest
                    </span>
                  )}
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-900/10 text-amber-900">
                    🔨 {selectedDef?.laborRequired || 2} Laborers
                  </span>
                </div>
                <p className="text-[11px] text-[#6b4a2e] max-w-sm line-clamp-1">{selectedDef?.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
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
                  onClick={(e) => onUpgradeBuilding(selectedBuildingId, e)}
                  onMouseEnter={() => { if (canAfford) onHoverUpgrade(true); }}
                  onMouseLeave={() => onHoverUpgrade(false)}
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
          </div>
        )}
      </div>
    </>
  );
}
