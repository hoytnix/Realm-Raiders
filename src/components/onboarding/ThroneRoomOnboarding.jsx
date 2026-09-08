import React, { useState } from 'react';
import { FACTIONS, sounds } from '../../constants/index.js';

export function ThroneRoomOnboarding({ onSelectFaction }) {
  const [selectedId, setSelectedId] = useState('humans');

  return (
    <div className="fixed inset-0 bg-stone-950 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="max-w-3xl w-full my-auto py-6 flex flex-col items-center text-amber-100">
        <div className="text-center max-w-xl mb-6">
          <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
            The Living Parchment (Throne Room POV)
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1 text-amber-200">
            Swear Allegiance to Your Faction
          </h1>
          <p className="text-xs sm:text-sm text-amber-400/70 mt-1">
            Your high seat commands an asymmetric fantasy realm. Your chosen bloodline permanently shapes macro-production, upkeep consumption, and raid pillage styles.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
          {Object.values(FACTIONS).map(faction => {
            const isSelected = selectedId === faction.id;
            return (
              <div
                key={faction.id}
                onClick={() => {
                  sounds.playCoin();
                  setSelectedId(faction.id);
                }}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#2a1d15] border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)] scale-[1.01]'
                    : 'bg-[#18110c] border-stone-800 hover:border-stone-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{faction.sigil}</span>
                    <span className="text-[9px] uppercase px-2 py-0.5 rounded-full bg-amber-900/60 text-amber-200 font-mono font-bold">
                      {faction.title}
                    </span>
                  </div>

                  <h3 className="text-sm font-black text-amber-100 mt-2">{faction.name}</h3>
                  <p className="text-xs text-amber-300/70 mt-1">{faction.description}</p>

                  <div className="mt-3 space-y-1 pt-2 border-t border-amber-900/40">
                    {faction.perks.map((p, i) => (
                      <div key={i} className="text-[11px] text-amber-200/90 flex items-center gap-1.5">
                        <span className="text-amber-400">✦</span>
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-amber-900/40 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-amber-400/80">Upkeep: {faction.upkeepMultiplier}x</span>
                  <span className={`font-bold ${isSelected ? 'text-amber-300' : 'text-stone-500'}`}>
                    {isSelected ? '● Chosen' : 'Select'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => onSelectFaction(selectedId)}
          className="mt-6 w-full max-w-md py-3.5 px-6 rounded-2xl font-black text-sm bg-gradient-to-r from-red-800 via-amber-700 to-yellow-600 hover:brightness-110 active:scale-95 text-amber-100 transition shadow-2xl flex items-center justify-center gap-2 border border-amber-500/50"
        >
          <span>👑</span>
          <span>Ascend the Throne & Seal Realm Allegiance</span>
        </button>
      </div>
    </div>
  );
}
