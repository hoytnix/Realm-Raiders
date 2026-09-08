import React from 'react';
import { RealmChronometerHUD } from './RealmChronometerHUD.jsx';
import { ResourceBar } from './ResourceBar.jsx';
import { FamineWarning } from './FamineWarning.jsx';

export function MonarchHeader({
  currentFaction,
  stats,
  timeState,
  resources,
  isMuted,
  isStarving,
  onToggleSpeed,
  onToggleMute
}) {
  return (
    <header className="relative z-20 w-full px-4 sm:px-8 pt-3 flex flex-wrap items-center justify-between gap-2">
      {/* Monarch Title, Realm Rating & Astrological Chronometer */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <div className="bg-stone-900/90 border border-amber-600/40 rounded-2xl px-3 py-1.5 shadow-lg backdrop-blur flex items-center gap-2">
          <span className="text-xl">{currentFaction.sigil}</span>
          <div>
            <h1 className="text-xs sm:text-sm font-black tracking-wider text-amber-200">
              {currentFaction.name}
            </h1>
            <span className="text-[10px] text-amber-500/80 font-mono block">
              Rating {stats.overallRating} ⭐ • Def {Math.round(stats.defensePower)}
            </span>
          </div>
        </div>

        {/* Astrological Chronometer & Weather Dial */}
        <RealmChronometerHUD
          timeState={timeState}
          onToggleSpeed={onToggleSpeed}
        />

        <button
          onClick={onToggleMute}
          className="w-8 h-8 rounded-xl bg-stone-900/80 border border-amber-700/40 text-amber-400 hover:text-amber-200 flex items-center justify-center text-xs shadow transition active:scale-95"
          title="Toggle Synthesizer Sound"
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      </div>

      {/* Famine Warning Inscription */}
      <FamineWarning isStarving={isStarving} />

      {/* Compact Gilded Resource HUD */}
      <ResourceBar resources={resources} stats={stats} />
    </header>
  );
}
