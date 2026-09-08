import React, { useState } from 'react';
import { TECHNOLOGIES, TECH_CATEGORIES, sounds } from '../../constants/index.js';
import { haptics, triggerHaptic } from '../../utils/index.js';

export function MobileTechCodexModal({
  isOpen,
  onClose,
  technologies = [],
  unlockedTech = [],
  currentResearch = null,
  researchProgress = 0,
  onResearchTech,
  onResearchTechnology,
  researchTech,
  resources = {},
  buildings = {},
  grid = [],
  currentFaction = null
}) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [stampingTechId, setStampingTechId] = useState(null);

  if (!isOpen) return null;

  const activeTechs = unlockedTech.length > 0 ? unlockedTech : technologies;
  const executeResearch = onResearchTech || researchTech || onResearchTechnology;

  // Resolve current Keep level from grid or buildings
  const keepPlot = grid && Array.isArray(grid)
    ? grid.find(p => p.buildingId === 'keep')
    : null;
  const currentKeepTier = keepPlot?.level || buildings?.keep || 1;

  // Human faction receives 50% discount on decree costs
  const discount = currentFaction?.id === 'humans' ? 0.5 : 1.0;

  const handleCategoryChange = (catId) => {
    haptics.light();
    sounds.playCoin();
    setActiveCategory(catId);
  };

  const handleClose = () => {
    haptics.light();
    sounds.playCoin();
    onClose();
  };

  const handleSealDecree = (techId, e) => {
    triggerHaptic('heavy');
    haptics.heavy();
    sounds.playWaxSealThud();
    setStampingTechId(techId);
    setTimeout(() => {
      setStampingTechId(null);
    }, 750);
    if (onResearchTech) {
      onResearchTech(techId);
    } else if (executeResearch) {
      executeResearch(techId, e);
    }
  };

  const allTechList = Object.values(TECHNOLOGIES);
  const filteredTechList = activeCategory === 'all'
    ? allTechList
    : allTechList.filter(t => t.category === activeCategory);

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex flex-col justify-end sm:items-center sm:justify-center animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-h-[90vh] sm:max-w-lg sm:max-h-[85vh] bg-gradient-to-b from-[#f6ebd6] via-[#ebdcc1] to-[#dfcba6] border-t-2 sm:border-2 border-[#8c6843] rounded-t-3xl sm:rounded-3xl shadow-[0_-12px_45px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden text-[#442813] font-serif"
      >
        {/* Mobile Tactile Drag Bar */}
        <div className="w-12 h-1 bg-[#8c6843]/50 rounded-full mx-auto mt-2.5 sm:hidden" />

        {/* Ornate Parchment Header */}
        <div className="px-4 pt-3 pb-3 border-b-2 border-[#8c6843]/60 flex items-center justify-between bg-[#dfcba6]/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#8c6843]/20 border border-[#8c6843] flex items-center justify-center text-lg shadow-inner">
              📜
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-wide text-[#3f2314] uppercase">
                ROYAL CODEX & DECREES
              </h2>
              <p className="text-[10px] font-mono text-[#6b4a2e]">
                Crown Technologies & Sovereign Decrees
              </p>
            </div>
          </div>

          {/* Ink-Stamp Close Button (44x44px Touch Target) */}
          <button
            onClick={handleClose}
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-2xl bg-[#dfcba6] border-2 border-[#8c6843] flex items-center justify-center text-base font-bold text-[#442813] hover:bg-[#cbb38b] active:scale-95 transition shadow"
            title="Close Royal Codex"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Category Tabs / Horizontal Filter Chips */}
        <div className="flex items-center gap-1.5 px-3 py-2 overflow-x-auto scrollbar-none bg-[#e5d4b3]/70 border-b border-[#bfa379]/60">
          {Object.values(TECH_CATEGORIES).map(cat => {
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 border shadow-sm ${
                  isSelected
                    ? 'bg-[#3f2314] text-amber-100 border-[#2b180a] shadow-inner scale-105'
                    : 'bg-[#ebdcc1] text-[#6b4a2e] border-[#bfa379] hover:bg-[#dfcba6]'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                {cat.id === 'economy' && (
                  <span className="text-[9px] opacity-80 hidden sm:inline">(Auto-Harvest)</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Scrollable Tech Cards Container */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 pb-[calc(1.5rem+env(safe-area-inset-bottom,1.5rem))]">
          {filteredTechList.map(tech => {
            const isResearched = activeTechs.includes(tech.id);
            const isResearchingThis = currentResearch?.techId === tech.id;
            const isResearchingOther = currentResearch && currentResearch.techId !== tech.id;
            const isStamping = stampingTechId === tech.id;

            const reqKeep = tech.requirements?.keepTier || 1;
            const meetsKeep = currentKeepTier >= reqKeep;

            const costGold = Math.round((tech.requirements?.cost?.gold || 0) * discount);
            const costFood = Math.round((tech.requirements?.cost?.food || 0) * discount);
            const costWood = Math.round((tech.requirements?.cost?.wood || 0) * discount);
            const costStone = Math.round((tech.requirements?.cost?.stone || 0) * discount);
            const costFlora = Math.round((tech.requirements?.cost?.flora || 0) * discount);

            const hasGold = (resources.gold || 0) >= costGold;
            const hasFood = (resources.food || 0) >= costFood;
            const hasWood = (resources.wood || 0) >= costWood;
            const hasStone = (resources.stone || 0) >= costStone;
            const hasFlora = (resources.flora || 0) >= costFlora;
            const canAfford = hasGold && hasFood && hasWood && hasStone && hasFlora;

            // Deficits string for clear red wax seal badge if unaffordable
            const deficits = [];
            if (!hasGold && costGold > 0) deficits.push(`🪙 -${costGold - (resources.gold || 0)}`);
            if (!hasFood && costFood > 0) deficits.push(`🌾 -${costFood - (resources.food || 0)}`);
            if (!hasWood && costWood > 0) deficits.push(`🪵 -${costWood - (resources.wood || 0)}`);
            if (!hasStone && costStone > 0) deficits.push(`🪨 -${costStone - (resources.stone || 0)}`);
            if (!hasFlora && costFlora > 0) deficits.push(`🌿 -${costFlora - (resources.flora || 0)}`);
            const deficitStr = deficits.join(', ');

            const remainingSec = isResearchingThis ? Math.ceil(currentResearch.remaining || 0) : 0;
            const progressPct = isResearchingThis
              ? Math.min(100, Math.max(8, Math.round((1 - (remainingSec / (currentResearch.duration || 1))) * 100)))
              : 0;

            return (
              <div
                key={tech.id}
                className="bg-gradient-to-br from-[#ebdcc1] via-[#e8d7b8] to-[#dfcba6] border-2 border-[#8c6843] rounded-2xl p-3.5 shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_4px_12px_rgba(0,0,0,0.12)] space-y-2.5 relative overflow-hidden"
              >
                {/* Ephemeral Wax Stamp Impression Overlay */}
                {isStamping && (
                  <div className="absolute inset-0 z-20 bg-red-950/20 backdrop-blur-[1px] rounded-2xl flex items-center justify-center pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2 rounded-2xl bg-gradient-to-tr from-red-900 via-rose-700 to-red-600 border-2 border-amber-300 text-amber-100 font-black shadow-2xl flex items-center gap-2 transform scale-105 animate-bounce">
                      <span className="text-2xl">🩸</span>
                      <span className="text-xs uppercase tracking-wider font-mono">SEALING DECREE...</span>
                    </div>
                  </div>
                )}

                {/* Card Title & Icon Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl p-1.5 bg-[#dfcba6] border border-[#8c6843]/60 rounded-xl shadow-inner">
                      {tech.inkSymbol || '📜'}
                    </span>
                    <div>
                      <h3 className="text-xs sm:text-sm font-black text-[#3f2314] leading-tight">
                        {tech.name}
                      </h3>
                      <span className="text-[10px] font-mono text-[#6b4a2e]">
                        {tech.subtitle}
                      </span>
                    </div>
                  </div>

                  {/* Unlock Duration Badge */}
                  <span className="px-2 py-0.5 rounded-lg bg-[#dfcba6] border border-[#8c6843]/50 text-[10px] font-mono font-bold text-[#5c3e23] whitespace-nowrap shadow-sm">
                    ⏳ {tech.duration || 15}s
                  </span>
                </div>

                {/* Lore Description */}
                <p className="text-[11px] text-[#55371c] leading-relaxed italic">
                  "{tech.description}"
                </p>

                {/* Active Benefit Ribbon */}
                <div className="bg-amber-900/10 border border-amber-800/30 rounded-xl p-2 flex items-start gap-1.5">
                  <span className="text-xs flex-shrink-0 mt-0.5">⭐</span>
                  <p className="text-[10.5px] font-mono font-bold text-[#442813] leading-snug">
                    <span className="uppercase text-[9.5px] text-[#8c6843] block">Active Realm Benefit:</span>
                    {tech.id === 'tech_troop_logistics'
                      ? 'Idle garrison troops automatically harvest completed citadel yields.'
                      : (tech.benefit || 'Empowers realm productivity and sovereign might.')}
                  </p>
                </div>

                {/* Requirements & Costs */}
                <div className="bg-[#f0e3cc]/80 border border-[#bfa379]/70 rounded-xl p-2 flex flex-wrap items-center justify-between gap-1.5 text-[10.5px] font-mono">
                  {/* Keep Tier Prerequisite */}
                  <span className={`font-bold ${meetsKeep ? 'text-emerald-800' : 'text-rose-800'}`}>
                    Requires Keep T{reqKeep} {meetsKeep ? '✓' : `(Now T${currentKeepTier})`}
                  </span>

                  {/* Resource Costs */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {costGold > 0 && (
                      <span className={`font-bold ${hasGold ? 'text-amber-900' : 'text-rose-700'}`}>
                        🪙 {costGold}
                      </span>
                    )}
                    {costFood > 0 && (
                      <span className={`font-bold ${hasFood ? 'text-amber-900' : 'text-rose-700'}`}>
                        🌾 {costFood}
                      </span>
                    )}
                    {costWood > 0 && (
                      <span className={`font-bold ${hasWood ? 'text-amber-900' : 'text-rose-700'}`}>
                        🪵 {costWood}
                      </span>
                    )}
                    {costStone > 0 && (
                      <span className={`font-bold ${hasStone ? 'text-amber-900' : 'text-rose-700'}`}>
                        🪨 {costStone}
                      </span>
                    )}
                    {costFlora > 0 && (
                      <span className={`font-bold ${hasFlora ? 'text-emerald-900' : 'text-rose-700'}`}>
                        🌿 {costFlora}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status States */}
                <div>
                  {isResearched ? (
                    // Status 1: Researched / Enacted (Green Wax Seal Stamp)
                    <div className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-900/20 via-green-800/25 to-emerald-900/20 border-2 border-emerald-600 flex items-center justify-center gap-2 text-xs font-mono font-black text-emerald-900 shadow-inner">
                      <span className="text-base">🛡️</span>
                      <span>ENACTED & ACTIVE</span>
                      <span className="text-emerald-700 text-sm font-black">✓</span>
                    </div>
                  ) : isResearchingThis || isStamping ? (
                    // Status 2: Researching... (Active progress bar with remaining seconds)
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[11px] font-mono font-bold text-amber-950">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping" />
                          Inscribing Decree...
                        </span>
                        <span>{remainingSec > 0 ? `${remainingSec}s remaining` : 'Ratifying...'}</span>
                      </div>
                      <div className="w-full bg-stone-900/20 rounded-full h-3.5 overflow-hidden border border-[#8c6843]/60 p-0.5 shadow-inner">
                        <div
                          className="bg-gradient-to-r from-amber-700 via-amber-500 to-yellow-400 h-full rounded-full transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    // Status 3: Decree Action Button or Deficit Warning
                    <div>
                      {isResearchingOther ? (
                        <button
                          disabled
                          className="w-full min-h-[44px] py-2.5 rounded-xl text-xs font-black bg-stone-300/80 text-stone-600 border border-stone-400/60 cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <span>⏳ Scholars Busy Inscribing Another Decree...</span>
                        </button>
                      ) : !meetsKeep ? (
                        <button
                          disabled
                          className="w-full min-h-[44px] py-2.5 rounded-xl text-xs font-black bg-stone-300/80 text-stone-600 border border-stone-400/60 cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <span>🏰 Requires Keep Level {reqKeep}</span>
                        </button>
                      ) : !canAfford ? (
                        // Clear Red Wax Seal indicating deficit
                        <button
                          disabled
                          className="w-full min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-mono font-bold bg-gradient-to-r from-red-950/20 via-rose-950/30 to-red-950/20 border-2 border-red-700/80 text-red-900 flex items-center justify-center gap-2 cursor-not-allowed shadow-inner"
                          title="Insufficient royal resources to enact decree"
                        >
                          <span className="text-base">🩸</span>
                          <span className="font-sans font-black uppercase text-[11px] tracking-tight">
                            Insufficient Resources: {deficitStr}
                          </span>
                        </button>
                      ) : (
                        // Affordable: Seal Decree with Royal Wax CTA
                        <button
                          onClick={(e) => handleSealDecree(tech.id, e)}
                          className="w-full min-h-[44px] py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 shadow bg-gradient-to-r from-red-800 via-rose-800 to-red-700 text-amber-100 hover:brightness-110 active:scale-95 border-2 border-red-600 shadow-md cursor-pointer"
                        >
                          <span className="text-base">🩸</span>
                          <span>Seal Decree with Royal Wax</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
