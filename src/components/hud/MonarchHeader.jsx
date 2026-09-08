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
  starvationDeaths = 0,
  onToggleSpeed,
  onToggleMute,
  onRaidGrain
}) {
  return (
    <header className="relative z-20 w-full px-2 sm:px-6 pt-2 sm:pt-3 flex flex-col md:flex-row md:flex-wrap items-center justify-between gap-2">
      {/* Row 1: Monarch Badge, Astrological Chronometer, Crisis Pill & Sound Controls */}
      <div className="w-full md:w-auto flex items-center justify-between gap-1.5 sm:gap-3">
        {/* Monarch Title & Rating */}
        <div className="bg-stone-900/90 border border-amber-600/40 rounded-2xl px-2.5 sm:px-3 py-1 sm:py-1.5 shadow-lg backdrop-blur flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <span className="text-base sm:text-xl">{currentFaction.sigil}</span>
          <div>
            <h1 className="text-[11px] sm:text-sm font-black tracking-wider text-amber-200 line-clamp-1">
              {currentFaction.name}
            </h1>
            <span className="text-[9px] sm:text-[10px] text-amber-500/80 font-mono block">
              ⭐ {stats.overallRating} <span className="hidden sm:inline">• Def {Math.round(stats.defensePower)} • Labor {Math.round((stats.laborEfficiency || 1) * 100)}%</span>
            </span>
          </div>
        </div>

        {/* Astrological Chronometer */}
        <div className="flex items-center gap-1.5">
          <RealmChronometerHUD
            timeState={timeState}
            onToggleSpeed={onToggleSpeed}
          />

          {/* Mobile Famine Crisis Pill */}
          <FamineWarning
            isStarving={isStarving}
            onRaidGrain={onRaidGrain}
            starvationDeaths={starvationDeaths}
            laborEfficiency={stats?.laborEfficiency}
          />

          {/* Sound Mute Toggle */}
          <button
            onClick={onToggleMute}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-stone-900/80 border border-amber-700/40 text-amber-400 hover:text-amber-200 flex items-center justify-center text-xs shadow transition active:scale-95 flex-shrink-0"
            title="Toggle Synthesizer Sound"
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>
      </div>

      {/* Row 2 on mobile / Right column on desktop: Resource Ticker */}
      <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-2 overflow-hidden">
        <ResourceBar resources={resources} stats={stats} />
      </div>
    </header>
  );
}
