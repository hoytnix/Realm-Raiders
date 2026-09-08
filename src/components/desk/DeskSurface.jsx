import React from 'react';
import { ParchmentHeader } from './ParchmentHeader.jsx';

export function DeskSurface({
  tilt,
  isStarving,
  gameState,
  stats,
  currentFaction,
  deskView,
  setDeskView,
  children
}) {
  const hasUnavengedFeuds = gameState.revengeLedger.some(r => !r.revenged);

  const rationPercent = Math.min(
    100,
    Math.max(
      5,
      ((gameState.resources.food + gameState.resources.water) /
        (stats.caps.food + stats.caps.water)) * 100
    )
  );

  return (
    <main className="relative z-10 flex-1 w-full max-w-6xl mx-auto flex items-center justify-center p-2 sm:p-4 perspective-[1200px]">
      {/* The Heavy Iron-Banded Oak Desk Surface with Parallax Tilt */}
      <div
        className="relative w-full h-[82vh] max-h-[680px] bg-[#221710] border-4 border-[#3e271c] rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.9),inset_0_2px_15px_rgba(255,255,255,0.08)] flex items-center justify-center p-3 sm:p-6 transition-transform duration-200 ease-out overflow-hidden"
        style={{
          transform: `rotateX(${12 + tilt.y * 4}deg) rotateY(${tilt.x * 6}deg)`,
          backgroundImage: 'radial-gradient(#2d1e15 15%, transparent 16%), radial-gradient(#18100b 15%, transparent 16%)',
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px'
        }}
      >
        {/* Iron Corner Bands */}
        <div className="absolute top-2 left-2 w-10 h-10 border-t-4 border-l-4 border-amber-800/80 rounded-tl-xl pointer-events-none" />
        <div className="absolute top-2 right-2 w-10 h-10 border-t-4 border-r-4 border-amber-800/80 rounded-tr-xl pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-10 h-10 border-b-4 border-l-4 border-amber-800/80 rounded-bl-xl pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-10 h-10 border-b-4 border-r-4 border-amber-800/80 rounded-br-xl pointer-events-none" />

        {/* Radial Candle Glows */}
        <div className="absolute top-8 left-8 w-44 h-44 rounded-full bg-radial from-amber-400/25 via-amber-700/10 to-transparent blur-xl pointer-events-none animate-pulse" />
        <div className="absolute bottom-10 right-8 w-48 h-48 rounded-full bg-radial from-amber-400/20 via-yellow-700/10 to-transparent blur-xl pointer-events-none animate-pulse" />

        {/* Tabletop Prop 1: Pewter Goblet / Sustenance Horn */}
        <div
          className="absolute top-4 left-4 z-20 hidden lg:flex flex-col items-center bg-stone-900/90 border border-amber-800/60 p-2.5 rounded-2xl shadow-xl backdrop-blur"
          title="Citadel Sustenance Horn"
        >
          <div className="relative w-8 h-20 bg-stone-800 border-2 border-stone-600 rounded-b-2xl overflow-hidden flex flex-col justify-end shadow-inner">
            <div
              className={`w-full transition-all duration-700 ${isStarving ? 'bg-rose-900 h-1' : 'bg-gradient-to-t from-amber-600 to-yellow-400'}`}
              style={{ height: `${rationPercent}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-amber-300/80 mt-1 font-bold">Rations</span>
        </div>

        {/* Tabletop Prop 2: Iron Strongbox */}
        <div
          className="absolute top-4 right-4 z-20 hidden lg:flex flex-col items-center bg-stone-900/90 border border-amber-800/60 p-2.5 rounded-2xl shadow-xl backdrop-blur"
          title="Imperial Treasury Vault Protection"
        >
          <div className="w-14 h-12 bg-gradient-to-b from-stone-800 to-stone-950 border-2 border-amber-700/60 rounded-xl flex flex-col items-center justify-center relative shadow-lg">
            <span className="text-base">🪙</span>
            <span className="text-[9px] font-mono text-amber-400 font-bold">
              {Math.round((currentFaction?.vaultProtectionBase || 0.25) * 100)}% Safe
            </span>
          </div>
          <span className="text-[10px] font-mono text-amber-300/80 mt-1 font-bold">Deep Vault</span>
        </div>

        {/* -------------------------------------------------------
            THE CENTRAL LIVING PARCHMENT SCROLL
            ------------------------------------------------------- */}
        <div className="relative w-full h-full max-w-4xl bg-[#f4ecd8] border-[6px] border-[#cbb38b] rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.8),inset_0_0_30px_rgba(139,94,60,0.4)] text-stone-900 flex flex-col overflow-hidden">
          {/* Brass Corner Weights */}
          <div className="absolute top-1.5 left-1.5 w-6 h-6 rounded-full bg-gradient-to-br from-yellow-300 to-amber-700 border border-amber-900 shadow-md z-30" />
          <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-gradient-to-br from-yellow-300 to-amber-700 border border-amber-900 shadow-md z-30" />
          <div className="absolute bottom-1.5 left-1.5 w-6 h-6 rounded-full bg-gradient-to-br from-yellow-300 to-amber-700 border border-amber-900 shadow-md z-30" />
          <div className="absolute bottom-1.5 right-1.5 w-6 h-6 rounded-full bg-gradient-to-br from-yellow-300 to-amber-700 border border-amber-900 shadow-md z-30" />

          {/* Parchment Header & Single Hamburger Menu Switcher */}
          <ParchmentHeader
            deskView={deskView}
            setDeskView={setDeskView}
            hasUnavengedFeuds={hasUnavengedFeuds}
          />

          {/* Parchment Body Canvas */}
          <div className="relative flex-1 w-full overflow-hidden flex flex-col">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
