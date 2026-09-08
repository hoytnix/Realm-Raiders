import React from 'react';
import { RealmChronometerHUD } from './RealmChronometerHUD.jsx';
import { ResourceBar } from './ResourceBar.jsx';
import { FamineWarning } from './FamineWarning.jsx';
import { ResourcePill } from '../common/ResourcePill.jsx';

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
  onOpenSettings,
  onRaidGrain
}) {
  return (
    <header className="hidden md:block relative z-20 w-full px-2 sm:px-6 pt-2 sm:pt-3">
      {/* =========================================================================
          DESKTOP CONSOLIDATED CROWN HUD (Gilded, centered crown bar for 16:9/21:9)
          ========================================================================= */}
      <div className="flex items-center justify-between gap-3 w-full max-w-7xl mx-auto bg-gradient-to-r from-stone-950/95 via-[#251810]/95 to-stone-950/95 border-2 border-amber-700/70 rounded-3xl px-4 py-1.5 shadow-[0_12px_35px_rgba(0,0,0,0.85)] backdrop-blur">
        {/* Left Flank: Sovereign Crest & Sustenance Stores (Gold, Food, Water) */}
        <div className="flex items-center gap-2">
          {/* Monarch Crest */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-2xl bg-stone-900/90 border border-amber-600/50 shadow-inner">
            <span className="text-xl">{currentFaction.sigil}</span>
            <div>
              <h1 className="text-xs font-black tracking-wider text-amber-200 whitespace-nowrap">
                {currentFaction.name}
              </h1>
              <span className="text-[10px] text-amber-400/90 font-mono block">
                ⭐ {stats.overallRating} • Def {Math.round(stats.defensePower)} • Labor {Math.round((stats.laborEfficiency || 1) * 100)}%
              </span>
            </div>
          </div>

          {/* Sustenance Stores */}
          <div className="flex items-center gap-1.5">
            <ResourcePill
              icon="🪙"
              amount={resources.gold}
              cap={stats.caps.gold || 1000}
              color="text-yellow-300"
            />
            <ResourcePill
              icon="🌾"
              amount={resources.food}
              cap={stats.caps.food || 1000}
              upkeep={stats.upkeep.food}
              color="text-amber-300"
            />
            <ResourcePill
              icon="💧"
              amount={resources.water}
              cap={stats.caps.water || 1000}
              upkeep={stats.upkeep.water}
              color="text-sky-300"
            />
          </div>
        </div>

        {/* Center: Astrological Chronometer & Weather Forecast Flyout */}
        <div className="flex-shrink-0">
          <RealmChronometerHUD
            timeState={timeState}
            onToggleSpeed={onToggleSpeed}
          />
        </div>

        {/* Right Flank: Raw Material Stores (Wood, Stone, Flora), Crisis Alert & Audio Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <ResourcePill
              icon="🪵"
              amount={resources.wood}
              cap={stats.caps.wood || 1000}
              color="text-orange-300"
            />
            <ResourcePill
              icon="🪨"
              amount={resources.stone}
              cap={stats.caps.stone || 1000}
              color="text-stone-300"
            />
            <ResourcePill
              icon="🌿"
              amount={resources.flora}
              cap={stats.caps.flora || 1000}
              color="text-emerald-300"
            />
          </div>

          {/* Famine Crisis Warning */}
          <FamineWarning
            isStarving={isStarving}
            onRaidGrain={onRaidGrain}
            starvationDeaths={starvationDeaths}
            laborEfficiency={stats?.laborEfficiency}
          />

          {/* Sound Mute Toggle */}
          <button
            onClick={onToggleMute}
            className="w-8 h-8 rounded-xl bg-stone-900/90 border border-amber-600/50 text-amber-300 hover:text-amber-100 flex items-center justify-center text-xs shadow-md transition active:scale-95 flex-shrink-0"
            title="Toggle Synthesizer Sound"
          >
            {isMuted ? '🔇' : '🔊'}
          </button>

          {/* Settings Trigger */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="w-8 h-8 rounded-xl bg-stone-900/90 border border-amber-600/50 text-amber-300 hover:text-amber-100 flex items-center justify-center text-xs shadow-md transition active:scale-95 flex-shrink-0"
              title="Open Realm Settings & Audio"
            >
              ⚙️
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
