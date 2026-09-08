import React, { useState, useEffect } from 'react';
import { sounds } from '../../constants/index.js';
import { haptics } from '../../utils/index.js';

export function DeskSurface({
  tilt,
  isStarving,
  gameState,
  stats,
  currentFaction,
  deskView,
  setDeskView,
  onToggleStampCursor,
  isStampCursorEquipped = false,
  children
}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const hasUnavengedFeuds = gameState.revengeLedger.some(r => !r.revenged);

  const rationPercent = Math.min(
    100,
    Math.max(
      5,
      ((gameState.resources.food + gameState.resources.water) /
        (stats.caps.food + stats.caps.water)) * 100
    )
  );

  const handleStampPropClick = () => {
    sounds.playWaxSealThud();
    sounds.playWaxSizzle();
    haptics.heavy();
    onToggleStampCursor?.();
  };

  return (
    <main className="relative z-10 flex-1 w-full max-w-7xl 2xl:max-w-[1720px] mx-auto flex items-center justify-center p-0 md:p-3 md:perspective-[1200px] h-full overflow-hidden">
      {/* The Heavy Iron-Banded Oak Desk Surface (Expanded for Widescreen Dual-Pane) */}
      <div
        className="relative w-full h-full md:h-[84vh] md:max-h-[840px] bg-[#1c120c] md:bg-[#221710] border-0 md:border-4 md:border-[#3e271c] rounded-none md:rounded-3xl shadow-none md:shadow-[0_25px_60px_rgba(0,0,0,0.9),inset_0_2px_15px_rgba(255,255,255,0.08)] flex items-center justify-center p-0 md:p-4 transition-transform duration-200 ease-out overflow-hidden"
        style={{
          transform: isMobile ? 'none' : `rotateX(${10 + tilt.y * 3}deg) rotateY(${tilt.x * 5}deg)`,
          backgroundImage: isMobile ? 'none' : 'radial-gradient(#2d1e15 15%, transparent 16%), radial-gradient(#18100b 15%, transparent 16%)',
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px'
        }}
      >
        {/* Desktop Iron Corner Bands */}
        <div className="hidden md:block absolute top-2 left-2 w-10 h-10 border-t-4 border-l-4 border-amber-800/80 rounded-tl-xl pointer-events-none" />
        <div className="hidden md:block absolute top-2 right-2 w-10 h-10 border-t-4 border-r-4 border-amber-800/80 rounded-tr-xl pointer-events-none" />
        <div className="hidden md:block absolute bottom-2 left-2 w-10 h-10 border-b-4 border-l-4 border-amber-800/80 rounded-bl-xl pointer-events-none" />
        <div className="hidden md:block absolute bottom-2 right-2 w-10 h-10 border-b-4 border-r-4 border-amber-800/80 rounded-br-xl pointer-events-none" />

        {/* Desktop Radial Candle Glows */}
        <div className="hidden md:block absolute top-8 left-8 w-48 h-48 rounded-full bg-radial from-amber-400/25 via-amber-700/10 to-transparent blur-xl pointer-events-none animate-pulse" />
        <div className="hidden md:block absolute bottom-10 right-8 w-52 h-52 rounded-full bg-radial from-amber-400/20 via-yellow-700/10 to-transparent blur-xl pointer-events-none animate-pulse" />

        {/* Tabletop Prop 1: Pewter Goblet / Sustenance Horn */}
        <div
          className="absolute top-4 left-3 z-20 hidden 2xl:flex flex-col items-center bg-stone-900/90 border border-amber-800/60 p-2 rounded-2xl shadow-xl backdrop-blur"
          title="Citadel Sustenance Horn"
        >
          <div className="relative w-7 h-16 bg-stone-800 border-2 border-stone-600 rounded-b-2xl overflow-hidden flex flex-col justify-end shadow-inner">
            <div
              className={`w-full transition-all duration-700 ${isStarving ? 'bg-rose-900 h-1' : 'bg-gradient-to-t from-amber-600 to-yellow-400'}`}
              style={{ height: `${rationPercent}%` }}
            />
          </div>
          <span className="text-[9px] font-mono text-amber-300/80 mt-1 font-bold">Rations</span>
        </div>

        {/* Tabletop Prop 2: Iron Strongbox */}
        <div
          className="absolute top-4 right-3 z-20 hidden 2xl:flex flex-col items-center bg-stone-900/90 border border-amber-800/60 p-2 rounded-2xl shadow-xl backdrop-blur"
          title="Imperial Treasury Vault Protection"
        >
          <div className="w-12 h-10 bg-gradient-to-b from-stone-800 to-stone-950 border-2 border-amber-700/60 rounded-xl flex flex-col items-center justify-center relative shadow-lg">
            <span className="text-sm">🪙</span>
            <span className="text-[8.5px] font-mono text-amber-400 font-bold">
              {Math.round((currentFaction?.vaultProtectionBase || 0.25) * 100)}% Safe
            </span>
          </div>
          <span className="text-[9px] font-mono text-amber-300/80 mt-1 font-bold">Vault</span>
        </div>

        {/* Tabletop Prop 3: Royal Wax Seal Stamp on Coaster */}
        <button
          onClick={handleStampPropClick}
          className="absolute bottom-4 left-3 z-20 hidden 2xl:flex flex-col items-center bg-stone-900/90 border border-amber-700/60 p-2 rounded-2xl shadow-xl backdrop-blur cursor-pointer group hover:scale-105 active:scale-95 transition"
          title="Click to Equip/Unequip Monarch Wax Seal Stamp Cursor"
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-inner transition ${
            isStampCursorEquipped
              ? 'bg-gradient-to-br from-red-600 to-rose-950 border-2 border-red-400 animate-pulse'
              : 'bg-gradient-to-br from-amber-600 to-yellow-950 border border-amber-500/60'
          }`}>
            <span>🩸</span>
          </div>
          <span className="text-[8.5px] font-mono text-amber-300/90 mt-1 font-bold">
            {isStampCursorEquipped ? 'Stamp [ON]' : 'Seal Stamp'}
          </span>
        </button>

        {/* -------------------------------------------------------
            THE CENTRAL LIVING PARCHMENT SCROLL (100% Widescreen Table)
            ------------------------------------------------------- */}
        <div className="relative w-full h-full bg-[#f4ecd8] border-0 md:border-[6px] md:border-[#cbb38b] rounded-none md:rounded-2xl shadow-none md:shadow-[0_15px_40px_rgba(0,0,0,0.8),inset_0_0_30px_rgba(139,94,60,0.4)] text-stone-900 flex flex-col overflow-hidden pb-14 md:pb-0">
          {/* Brass Corner Weights (Desktop only) */}
          <div className="hidden md:block absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-gradient-to-br from-yellow-300 to-amber-700 border border-amber-900 shadow-md z-30" />
          <div className="hidden md:block absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-gradient-to-br from-yellow-300 to-amber-700 border border-amber-900 shadow-md z-30" />
          <div className="hidden md:block absolute bottom-1.5 left-1.5 w-5 h-5 rounded-full bg-gradient-to-br from-yellow-300 to-amber-700 border border-amber-900 shadow-md z-30" />
          <div className="hidden md:block absolute bottom-1.5 right-1.5 w-5 h-5 rounded-full bg-gradient-to-br from-yellow-300 to-amber-700 border border-amber-900 shadow-md z-30" />

          {/* Parchment Body Canvas */}
          <div className="relative flex-1 w-full overflow-hidden flex flex-col">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
