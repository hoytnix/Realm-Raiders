import React, { useState, useRef } from 'react';
import { haptics } from '../../utils/index.js';

export function BuildingInspector({
  selectedDef,
  currentLvl,
  costGold,
  costWood,
  costStone,
  canAfford,
  resources,
  stampingDecree,
  onUpgradeBuilding,
  selectedBuildingId,
  onHoverUpgrade
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const touchStartY = useRef(0);

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
    onUpgradeBuilding(selectedBuildingId, e);
  };

  return (
    <>
      {/* =========================================================================
          MOBILE EXPANDABLE / SWIPEABLE BOTTOM SHEET (< md)
          ========================================================================= */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`md:hidden fixed bottom-14 left-0 right-0 z-30 bg-[#e4d4b3] border-t-2 border-[#bfa379] shadow-[0_-10px_25px_rgba(0,0,0,0.4)] transition-all duration-300 ease-out flex flex-col ${
          isExpanded ? 'max-h-[85vh] p-3' : 'max-h-12 py-1 px-3'
        }`}
      >
        {/* Drag Handle Bar & Peek Header */}
        <div
          onClick={toggleExpand}
          className="w-full flex items-center justify-between cursor-pointer py-1"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#cbb38b] border border-[#8c6843] flex items-center justify-center text-lg shadow-inner flex-shrink-0">
              {selectedDef.inkSymbol}
            </div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-black text-[#442813]">{selectedDef.name}</h3>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#6b4724] text-amber-200 font-bold">
                T{currentLvl}
              </span>
              {canAfford ? (
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
            <span>{isExpanded ? '▼ Close' : '▲ Upgrade'}</span>
          </div>
        </div>

        {/* Expanded Sheet Body */}
        {isExpanded && (
          <div className="mt-2 pt-2 border-t border-[#bfa379]/60 space-y-3 animate-in fade-in duration-200">
            {/* Lore and Harvest Cycle Info */}
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] text-[#6b4a2e] leading-snug flex-1">
                {selectedDef.description}
              </p>
              {selectedDef.cycleDuration && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-900/20 text-amber-900 font-bold flex-shrink-0">
                  ⏱️ {selectedDef.cycleDuration}s Yield
                </span>
              )}
            </div>

            {/* Cost Requirements */}
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

            {/* Seal Royal Decree CTA Button */}
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
          </div>
        )}
      </div>

      {/* =========================================================================
          DESKTOP DOCKED DRAWER (>= md)
          ========================================================================= */}
      <div className="hidden md:flex bg-[#e4d4b3] border-t-2 border-[#bfa379] p-3 items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#cbb38b] border border-[#8c6843] flex items-center justify-center text-2xl shadow-inner flex-shrink-0">
            {selectedDef.inkSymbol}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-[#442813]">{selectedDef.name}</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#6b4724] text-amber-200 font-bold">
                Tier {currentLvl}
              </span>
              {selectedDef.cycleDuration && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-900/20 text-amber-900 font-bold">
                  ⏱️ {selectedDef.cycleDuration}s Harvest
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#6b4a2e] max-w-sm line-clamp-1">{selectedDef.description}</p>
          </div>
        </div>

        {/* Cost Requirements & Monarch Wax Seal Stamper */}
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
    </>
  );
}
