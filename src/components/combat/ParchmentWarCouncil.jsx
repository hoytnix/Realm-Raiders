import React, { useState } from 'react';
import { FACTIONS, sounds } from '../../constants/index.js';
import { generateRivals, haptics } from '../../utils/index.js';

export function ParchmentWarCouncil({ stats, state, onLaunchRaid, onDeclareBloodFeud, onResearchTechnology }) {
  const [rivals, setRivals] = useState(() => generateRivals(stats.overallRating));

  const hasTroopLogistics = (state.technologies || []).includes('tech_troop_logistics');
  const keepTier = state.buildings?.keep || 1;
  const canAffordLogistics =
    !hasTroopLogistics &&
    keepTier >= 2 &&
    (state.resources?.gold || 0) >= 150 &&
    (state.resources?.food || 0) >= 100;

  const handleRefresh = () => {
    sounds.playCoin();
    haptics.light();
    setRivals(generateRivals(stats.overallRating));
  };

  const handleRaidClick = (rival) => {
    haptics.heavy();
    onLaunchRaid(rival);
  };

  const handleFeudClick = (record) => {
    haptics.heavy();
    onDeclareBloodFeud(record);
  };

  return (
    <div className="flex-1 p-3 sm:p-5 overflow-y-auto space-y-4 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:pb-5">
      {/* War Council Header */}
      <div className="flex items-center justify-between border-b-2 border-[#bfa379]/60 pb-2">
        <div>
          <h2 className="text-sm sm:text-base font-black text-[#442813] flex items-center gap-1.5">
            <span>⚔️ Scouted Rival Strongholds (±7% Rating)</span>
          </h2>
          <p className="text-[11px] text-[#6b4a2e]">
            Intercepted cartography pins targets holding exposed unbanked stores vulnerable to catapult strikes.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="min-h-[44px] px-3 py-1.5 rounded-xl bg-[#ddcca8] hover:bg-[#d0bc93] active:scale-95 text-[#442813] text-xs font-bold border border-[#8c6843] flex items-center gap-1.5 transition flex-shrink-0"
        >
          <span>🔄</span>
          <span className="hidden sm:inline">Scout Targets</span>
        </button>
      </div>

      {/* Target Settlement Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {rivals.map(rival => {
          const rivalFaction = FACTIONS[rival.faction] || FACTIONS.humans;
          return (
            <div
              key={rival.id}
              className="bg-[#ebdcc1] border-2 border-[#8c6843] rounded-2xl p-3 shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <h3 className="text-xs font-black text-[#442813]">{rival.name}</h3>
                  <span className="text-[10px] font-mono font-bold text-amber-800">
                    ⭐ {rival.rating}
                  </span>
                </div>
                <span className="text-[9px] uppercase tracking-wider text-[#6b4a2e] block mt-0.5">
                  {rivalFaction.badge} • Def {rival.defensePower}
                </span>

                <div className="mt-2 pt-2 border-t border-[#bfa379]/60">
                  <span className="text-[9px] font-mono text-[#6b4a2e] uppercase font-bold block mb-1">
                    Exposed Stockpiles:
                  </span>
                  <div className="flex flex-wrap gap-1 text-[10px] font-mono">
                    <span className="px-1.5 py-0.5 rounded bg-amber-900/10 text-amber-900 font-bold">
                      🪙 {rival.lootPool.gold}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-900/10 text-amber-900 font-bold">
                      🌾 {rival.lootPool.food}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-900/10 text-amber-900 font-bold">
                      🪵 {rival.lootPool.wood}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleRaidClick(rival)}
                className="mt-3 w-full min-h-[48px] py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-800 to-rose-900 hover:brightness-110 active:scale-95 text-amber-100 font-black text-xs shadow transition flex items-center justify-center gap-1.5"
              >
                <span>📺</span>
                <span>March Vanguard (Watch Ad)</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Royal Logistics Decree: Troop Quartermaster */}
      <div className="bg-[#ebdcc1] border-2 border-[#8c6843] rounded-2xl p-3 sm:p-4 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#cbb38b] border border-[#8c6843] flex items-center justify-center text-xl shadow-inner flex-shrink-0">
            🛡️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-black text-[#442813]">
                Royal Logistics: Vassal Foraging Lines
              </h3>
              {hasTroopLogistics ? (
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-800 text-emerald-100 border border-emerald-600">
                  Decree Sealed 🛡️
                </span>
              ) : (
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${keepTier >= 2 ? 'bg-green-900/10 text-green-900' : 'bg-red-900/10 text-red-900'}`}>
                  Req Keep T2
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#6b4a2e]">
              Orders idle garrison levies to automatically collect ripe harvests from all realm silos into stockpiles.
            </p>
          </div>
        </div>

        {hasTroopLogistics ? (
          <div className="text-[10px] font-mono font-bold text-emerald-900 bg-emerald-900/10 border border-emerald-700/40 rounded-xl px-3 py-1.5 whitespace-nowrap">
            ✓ Auto-Collection Active
          </div>
        ) : (
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div className="text-[10px] font-mono flex items-center gap-1.5">
              <span className={`px-1.5 py-0.5 rounded border ${(state.resources?.gold || 0) >= 150 ? 'bg-yellow-900/10 border-yellow-800 text-yellow-900 font-bold' : 'bg-red-900/10 border-red-800 text-red-900 font-bold'}`}>
                🪙 150
              </span>
              <span className={`px-1.5 py-0.5 rounded border ${(state.resources?.food || 0) >= 100 ? 'bg-orange-900/10 border-orange-800 text-orange-900 font-bold' : 'bg-red-900/10 border-red-800 text-red-900 font-bold'}`}>
                🌾 100
              </span>
            </div>
            <button
              onClick={() => onResearchTechnology && onResearchTechnology('tech_troop_logistics')}
              disabled={!canAffordLogistics}
              className={`min-h-[40px] px-3 py-1.5 rounded-xl font-black text-xs transition flex items-center gap-1.5 shadow ${
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

      {/* Pinned Retaliation / Blood Feud Ledger */}
      <div className="border-t-2 border-[#bfa379]/80 pt-3">
        <h3 className="text-xs font-black text-[#442813] mb-2 flex items-center gap-1.5">
          <span>🩸 Intercepted Retaliation Missives</span>
        </h3>
        <div className="space-y-2">
          {state.revengeLedger.map(record => (
            <div
              key={record.id}
              className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
                record.revenged
                  ? 'bg-[#e4d4b3]/60 border-stone-400 opacity-60'
                  : 'bg-[#ebdcc1] border-red-800/80 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{record.revenged ? '⚖️' : '🔥'}</span>
                <div>
                  <h4 className="text-xs font-bold text-[#442813]">{record.rivalName}</h4>
                  <div className="text-[10px] font-mono text-red-800">
                    Pillage: {Object.entries(record.stolen).map(([k, v]) => `-${v} ${k}`).join(', ')}
                  </div>
                </div>
              </div>

              {record.revenged ? (
                <span className="text-[10px] font-mono text-[#6b4a2e] font-bold">Avenged ✓</span>
              ) : (
                <button
                  onClick={() => handleFeudClick(record)}
                  className="min-h-[44px] px-3 py-1.5 rounded-xl bg-red-800 hover:bg-red-700 active:scale-95 text-rose-100 text-xs font-bold shadow transition"
                >
                  Declare Blood Feud 🗡️
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
