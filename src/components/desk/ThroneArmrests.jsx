import React from 'react';
import { sounds } from '../../constants/index.js';

export function ThroneArmrests({ tilt, currentFaction, setDeskView }) {
  return (
    <footer
      className="hidden md:flex relative z-30 pointer-events-none w-full items-end justify-between px-2 sm:px-8 pb-1 transition-transform duration-200 ease-out"
      style={{
        transform: `translate(${tilt.x * 12}px, ${tilt.y * 8}px)`
      }}
    >
      {/* Left Throne Armrest */}
      <div className="w-24 sm:w-40 h-16 sm:h-24 bg-gradient-to-t from-red-950 via-rose-900 to-amber-900/60 border-t-4 border-r-4 border-amber-600/70 rounded-tr-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.8)] flex items-center justify-center relative">
        <div className="flex gap-2 opacity-60">
          <div className="w-2 h-2 rounded-full bg-amber-400 shadow" />
          <div className="w-2 h-2 rounded-full bg-amber-400 shadow" />
          <div className="w-2 h-2 rounded-full bg-amber-400 shadow" />
        </div>
        {/* Monarch Signet Ring */}
        <div className="absolute -top-3 right-3 w-8 h-8 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 border-2 border-amber-700 shadow-md flex items-center justify-center text-xs pointer-events-auto cursor-pointer hover:scale-110 transition">
          <span>{currentFaction.sigil}</span>
        </div>
      </div>

      {/* Throne center hint */}
      <div className="pointer-events-auto bg-stone-950/80 border border-amber-800/40 px-4 py-1 rounded-t-xl text-[11px] font-mono text-amber-300/80 backdrop-blur">
        Royal Throne POV • Click completed harvests to collect • Tap to seal upgrades
      </div>

      {/* Right Throne Armrest */}
      <div className="w-24 sm:w-40 h-16 sm:h-24 bg-gradient-to-t from-red-950 via-rose-900 to-amber-900/60 border-t-4 border-l-4 border-amber-600/70 rounded-tl-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.8)] flex items-center justify-center relative">
        <div className="flex gap-2 opacity-60">
          <div className="w-2 h-2 rounded-full bg-amber-400 shadow" />
          <div className="w-2 h-2 rounded-full bg-amber-400 shadow" />
          <div className="w-2 h-2 rounded-full bg-amber-400 shadow" />
        </div>
        <button
          onClick={() => {
            sounds.playDaggerThrust();
            setDeskView(v => (v === 'war' ? 'citadel' : 'war'));
          }}
          className="absolute -top-4 left-3 px-2 py-1 rounded-lg bg-stone-900 border border-red-700/80 text-rose-300 text-xs font-mono font-bold shadow-xl pointer-events-auto hover:bg-stone-800 active:scale-95 transition"
          title="Draw War Dagger"
        >
          🗡️ War Dagger
        </button>
      </div>
    </footer>
  );
}
