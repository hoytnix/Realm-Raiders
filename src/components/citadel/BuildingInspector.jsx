import React from 'react';

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
  return (
    <div className="bg-[#e4d4b3] border-t-2 border-[#bfa379] p-3 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-[#cbb38b] border border-[#8c6843] flex items-center justify-center text-2xl shadow-inner">
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
  );
}
