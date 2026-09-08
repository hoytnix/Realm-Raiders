import React from 'react';
import { sounds } from '../../constants/index.js';
import { haptics } from '../../utils/index.js';

export function ThroneRoomBackground({
  tilt,
  isStarving,
  currentFaction,
  candlelitMode = false,
  onToggleCandlelight
}) {
  const handleSconceClick = () => {
    sounds.playCoin();
    haptics.light();
    onToggleCandlelight?.();
  };

  return (
    <div
      className="absolute inset-0 pointer-events-none z-0 transition-transform duration-300 ease-out"
      style={{
        transform: `translate(${tilt.x * -16}px, ${tilt.y * -10}px)`
      }}
    >
      {/* Candlelit Night Mode Deep Ambient Tint */}
      {candlelitMode && (
        <div className="absolute inset-0 bg-gradient-to-b from-amber-950/70 via-stone-950/80 to-stone-950/90 pointer-events-none z-10 transition-opacity duration-700" />
      )}

      {/* Stone Arch Silhouette */}
      <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-stone-900 via-stone-950/80 to-transparent flex justify-center">
        <div className="w-[85%] h-28 border-b-4 border-stone-800/90 rounded-b-[140px] shadow-[inset_0_-20px_40px_rgba(0,0,0,0.8)] flex items-center justify-center relative">
          {/* Stained Glass Rose Window */}
          <div className="w-20 h-20 rounded-full border-2 border-stone-700/80 bg-gradient-to-tr from-amber-500/20 via-rose-500/20 to-blue-500/20 flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.25)]">
            <span className="text-xl opacity-70">⚜️</span>
          </div>
        </div>
      </div>

      {/* Dynamic God-Ray Cast Across Table */}
      <div
        className={`absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[900px] pointer-events-none transition-colors duration-1000 ${
          isStarving
            ? 'bg-gradient-to-b from-red-600/25 via-rose-950/15 to-transparent'
            : candlelitMode
            ? 'bg-gradient-to-b from-amber-500/35 via-orange-950/20 to-transparent'
            : 'bg-gradient-to-b from-amber-400/20 via-yellow-600/10 to-transparent'
        }`}
        style={{ clipPath: 'polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%)' }}
      />

      {/* Flickering Interactive Wall Sconces */}
      <button
        onClick={handleSconceClick}
        className="absolute top-16 left-4 sm:left-12 flex flex-col items-center pointer-events-auto cursor-pointer group p-1 transition hover:scale-110 active:scale-95"
        title="Click Wall Sconce to Toggle Candlelit Night Mode"
      >
        <div className={`w-4 h-4 rounded-full bg-amber-400 animate-ping opacity-75 blur-xs ${candlelitMode ? 'scale-125' : ''}`} />
        <div className="w-3.5 h-6 rounded-t-full bg-gradient-to-t from-amber-600 via-orange-500 to-yellow-200 shadow-[0_0_30px_#f59e0b] group-hover:brightness-125" />
        <div className="w-1.5 h-6 bg-stone-700 rounded-b shadow" />
        <span className="text-[8px] font-mono text-amber-400/70 opacity-0 group-hover:opacity-100 transition whitespace-nowrap -bottom-3 absolute">
          {candlelitMode ? '🕯️ Candlelit' : '☀️ Day'}
        </span>
      </button>

      <button
        onClick={handleSconceClick}
        className="absolute top-16 right-4 sm:right-12 flex flex-col items-center pointer-events-auto cursor-pointer group p-1 transition hover:scale-110 active:scale-95"
        title="Click Wall Sconce to Toggle Candlelit Night Mode"
      >
        <div className={`w-4 h-4 rounded-full bg-amber-400 animate-ping opacity-75 blur-xs ${candlelitMode ? 'scale-125' : ''}`} />
        <div className="w-3.5 h-6 rounded-t-full bg-gradient-to-t from-amber-600 via-orange-500 to-yellow-200 shadow-[0_0_30px_#f59e0b] group-hover:brightness-125" />
        <div className="w-1.5 h-6 bg-stone-700 rounded-b shadow" />
        <span className="text-[8px] font-mono text-amber-400/70 opacity-0 group-hover:opacity-100 transition whitespace-nowrap -bottom-3 absolute">
          {candlelitMode ? '🕯️ Candlelit' : '☀️ Day'}
        </span>
      </button>

      {/* Heraldic Faction Banner */}
      {currentFaction && (
        <div className="absolute top-4 left-24 hidden md:flex flex-col items-center opacity-85">
          <div className={`w-14 h-28 bg-gradient-to-b ${currentFaction.bannerGradient} border-x border-b border-amber-500/40 rounded-b-lg shadow-xl flex flex-col items-center justify-between p-1.5`}>
            <span className="text-sm">{currentFaction.sigil}</span>
            <span className="text-[9px] uppercase tracking-widest text-amber-300 font-mono font-bold writing-vertical rotate-180">
              {currentFaction.id}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
