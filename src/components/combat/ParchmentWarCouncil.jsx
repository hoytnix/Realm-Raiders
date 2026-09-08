import React, { useState } from 'react';
import { FACTIONS, sounds } from '../../constants/index.js';
import { generateRivals } from '../../utils/rivals.js';

export function ParchmentWarCouncil({ stats, state, onLaunchRaid, onDeclareBloodFeud }) {
  const [rivals, setRivals] = useState(() => generateRivals(stats.overallRating));

  const handleRefresh = () => {
    sounds.playCoin();
    setRivals(generateRivals(stats.overallRating));
  };

  return (
    <div className="flex-1 p-3 sm:p-5 overflow-y-auto space-y-4">
      <div className="flex items-center justify-between border-b-2 border-[#bfa379]/60 pb-2">
        <div>
          <h2 className="text-sm sm:text-base font-black text-[#442813] flex items-center gap-1.5">
            <span>⚔️ Scouted Rival Strongholds (±7% Rating)</span>
          </h2>
          <p className="text-[11px] text-[#6b4a2e]">
            Intercepted cartography pins targets holding exposed unbanked stores vulnerable to catapult bombardments.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="px-2.5 py-1 rounded-lg bg-[#ddcca8] hover:bg-[#d0bc93] text-[#442813] text-xs font-bold border border-[#8c6843] flex items-center gap-1 transition"
        >
          <span>🔄</span>
          <span>Scout Targets</span>
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
                onClick={() => onLaunchRaid(rival)}
                className="mt-3 w-full py-2 px-3 rounded-xl bg-gradient-to-r from-red-800 to-rose-900 hover:brightness-110 active:scale-95 text-amber-100 font-black text-xs shadow transition flex items-center justify-center gap-1.5"
              >
                <span>📺</span>
                <span>March Vanguard (Watch Ad)</span>
              </button>
            </div>
          );
        })}
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
              className={`p-2.5 rounded-xl border flex items-center justify-between ${
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
                  onClick={() => onDeclareBloodFeud(record)}
                  className="px-2.5 py-1 rounded-lg bg-red-800 hover:bg-red-700 text-rose-100 text-xs font-bold shadow transition"
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
