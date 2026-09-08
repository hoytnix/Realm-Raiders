import React from 'react';
import { BUILDINGS, getBuildingUpgradeCost, calculateBuildingYield, toRomanTier } from '../../constants/index.js';

export function BuildingHoverTooltip({
  buildingId,
  level = 1,
  resources = {},
  technologies = [],
  troops = { total: 20 },
  laborEfficiency = 1.0,
  faction = null,
  mousePos = { x: 0, y: 0 }
}) {
  const bDef = BUILDINGS[buildingId];
  if (!bDef) return null;

  const discount = faction?.id === 'humans' ? 0.5 : 1.0;
  const nextLvl = level + 1;
  const { gold: costGold, wood: costWood, stone: costStone } = getBuildingUpgradeCost(bDef, level, discount);

  const canAfford =
    (resources.gold || 0) >= costGold &&
    (resources.wood || 0) >= costWood &&
    (resources.stone || 0) >= costStone;

  const hasTroopLogistics = (technologies || []).includes('tech_troop_logistics');
  const isAutomated = hasTroopLogistics && (troops?.total || 0) >= 1 && bDef.cycleDuration && bDef.baseYield;

  // Calculate rate
  let yieldInfo = null;
  if (bDef.baseYield) {
    const [resKey] = Object.entries(bDef.baseYield)[0];
    const cycleYield = Math.round(calculateBuildingYield(buildingId, level) * laborEfficiency);
    const perMinute = Math.round((60 / (bDef.cycleDuration || 10)) * cycleYield);
    yieldInfo = { resKey, cycleYield, perMinute, cycleDur: bDef.cycleDuration };
  }

  // Anchor offset to avoid cursor clipping
  const left = Math.min(window.innerWidth - 240, mousePos.x + 16);
  const top = Math.min(window.innerHeight - 200, mousePos.y + 16);

  return (
    <div
      className="fixed z-50 pointer-events-none transition-opacity duration-150 animate-in fade-in zoom-in-95"
      style={{ left: `${left}px`, top: `${top}px` }}
    >
      <div className="w-56 bg-[#f4ecd8] border-2 border-[#8c6843] rounded-xl shadow-2xl p-2.5 text-stone-900 font-serif">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#bfa379]/60 pb-1 mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-base">{bDef.inkSymbol}</span>
            <div>
              <h4 className="text-xs font-black text-[#442813] leading-tight">{bDef.name}</h4>
              <span className="text-[9px] font-mono text-[#6b4a2e] block">{bDef.tag}</span>
            </div>
          </div>
          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#6b4724] text-amber-200 font-bold">
            Tier {toRomanTier(level)}
          </span>
        </div>

        {/* Yield / Function details */}
        {yieldInfo && (
          <div className="bg-[#dfcba6]/60 p-1.5 rounded-lg border border-[#bfa379]/40 mb-1.5 text-[10px] font-mono">
            <div className="flex justify-between items-center text-[#442813]">
              <span>Yield:</span>
              <span className="font-bold">+{yieldInfo.cycleYield} {yieldInfo.resKey} / {yieldInfo.cycleDur}s</span>
            </div>
            <div className="flex justify-between items-center text-[#6b4a2e] text-[9px]">
              <span>Hourly Rate:</span>
              <span>~{yieldInfo.perMinute * 60}/hr</span>
            </div>
          </div>
        )}

        {/* Automation Status */}
        {bDef.cycleDuration && (
          <div className="mb-1.5 flex items-center gap-1 text-[9px] font-mono">
            {isAutomated ? (
              <span className="text-emerald-800 font-bold flex items-center gap-1 bg-emerald-900/10 px-1.5 py-0.5 rounded border border-emerald-700/30">
                🛡️ Garrison Auto-Reaping
              </span>
            ) : (
              <span className="text-amber-900 flex items-center gap-1 bg-amber-900/10 px-1.5 py-0.5 rounded">
                👆 Manual Click Required
              </span>
            )}
          </div>
        )}

        {/* Upgrade Requirements */}
        <div className="border-t border-[#bfa379]/60 pt-1">
          <div className="flex items-center justify-between text-[9px] font-mono text-[#6b4a2e] mb-0.5">
            <span>Next Tier ({nextLvl}) Costs:</span>
            {canAfford ? (
              <span className="text-green-800 font-bold">Affordable ✨</span>
            ) : (
              <span className="text-red-800 font-bold">Short Stores</span>
            )}
          </div>
          <div className="flex items-center gap-1 text-[9px] font-mono">
            <span className={`px-1 py-0.2 rounded border ${(resources.gold || 0) >= costGold ? 'bg-yellow-900/10 border-yellow-800 text-yellow-900 font-bold' : 'bg-red-900/10 border-red-800 text-red-900 font-bold'}`}>
              🪙{costGold}
            </span>
            <span className={`px-1 py-0.2 rounded border ${(resources.wood || 0) >= costWood ? 'bg-orange-900/10 border-orange-800 text-orange-900 font-bold' : 'bg-red-900/10 border-red-800 text-red-900 font-bold'}`}>
              🪵{costWood}
            </span>
            <span className={`px-1 py-0.2 rounded border ${(resources.stone || 0) >= costStone ? 'bg-stone-900/10 border-stone-800 text-stone-900 font-bold' : 'bg-red-900/10 border-red-800 text-red-900 font-bold'}`}>
              🪨{costStone}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
