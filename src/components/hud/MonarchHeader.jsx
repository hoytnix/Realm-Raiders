import React, { useState } from 'react';
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
  brambleShieldActive = false,
  onToggleBrambleShield,
  onTriggerVerdantBloom,
  onToggleSpeed,
  onToggleMute,
  onOpenSettings,
  onRaidGrain
}) {
  const [isAffinityOpen, setIsAffinityOpen] = useState(false);

  const weather = timeState?.weather || 'clear';
  const isWeatherSynergy = ['amber_rain', 'gentle_amber_rain', 'downpour', 'overcast', 'mist'].includes(weather);
  const isSeasonSynergy = ['autumn', 'spring'].includes(timeState?.season || '') || (timeState?.month >= 3 && timeState?.month <= 5) || (timeState?.month >= 9 && timeState?.month <= 11);

  return (
    <header className="hidden md:block relative z-20 w-full px-2 sm:px-6 pt-2 sm:pt-3">
      {/* =========================================================================
          DESKTOP CONSOLIDATED CROWN HUD (Gilded, centered crown bar for 16:9/21:9)
          ========================================================================= */}
      <div className="flex items-center justify-between gap-3 w-full max-w-7xl mx-auto bg-gradient-to-r from-stone-950/95 via-[#251810]/95 to-stone-950/95 border-2 border-amber-700/70 rounded-3xl px-4 py-1.5 shadow-[0_12px_35px_rgba(0,0,0,0.85)] backdrop-blur">
        {/* Left Flank: Sovereign Crest & Sustenance Stores (Gold, Food, Water) */}
        <div className="flex items-center gap-2">
          {/* Monarch Crest with Interactive Elemental Affinity Flyout */}
          <div className="relative">
            <button
              onClick={() => setIsAffinityOpen(v => !v)}
              className="flex items-center gap-2 px-3 py-1 rounded-2xl bg-stone-900/90 border border-amber-600/50 hover:border-amber-400 hover:bg-stone-800/90 transition shadow-inner text-left cursor-pointer active:scale-95"
              title="Click to inspect Elemental Affinity & Faction Passives"
            >
              <span className="text-xl">{currentFaction.sigil}</span>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-xs font-black tracking-wider text-amber-200 whitespace-nowrap">
                    {currentFaction.name}
                  </h1>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-950/60 text-emerald-300 text-[9px] font-mono font-bold border border-emerald-700/50">
                    🌱 {currentFaction.element || stats.element || 'Flora'}
                  </span>
                </div>
                <span className="text-[10px] text-amber-400/90 font-mono block">
                  ⭐ {stats.overallRating} • Def {Math.round(stats.defensePower)} • Labor {Math.round((stats.laborEfficiency || 1) * 100)}%
                </span>
              </div>
            </button>

            {/* Interactive Elemental Status Flyout Popover */}
            {isAffinityOpen && (
              <div
                className="absolute top-full left-0 mt-2 w-80 bg-gradient-to-b from-[#f5ebd6] via-[#ebdcc1] to-[#dfcba6] border-2 border-[#8c6843] rounded-2xl p-3.5 shadow-2xl z-50 text-[#442813] font-serif space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-[#8c6843]/40 pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg">🌿</span>
                    <div>
                      <h4 className="text-xs font-black text-[#3f2314] uppercase tracking-wide">
                        Flora Elemental Affinity
                      </h4>
                      <span className="text-[9.5px] font-mono text-[#6b4a2e]">Sylvaeth Verdant Surge</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsAffinityOpen(false)}
                    className="text-xs font-bold text-[#8c6843] hover:text-[#442813] px-1.5 py-0.5 rounded bg-[#dfcba6]"
                  >
                    ✕
                  </button>
                </div>

                {/* Passive Synergies */}
                <div className="space-y-1.5 text-[10.5px] font-mono">
                  <div className="bg-[#dfcba6]/70 p-2 rounded-xl border border-[#bfa379]/60 flex items-start gap-2">
                    <span className="text-sm">🌱</span>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#3f2314]">Verdant Surge</span>
                        <span className="text-emerald-800 font-bold">+15% Speed</span>
                      </div>
                      <p className="text-[9.5px] text-[#6b4a2e]">Base boost to agricultural and timber plots</p>
                    </div>
                  </div>

                  <div className={`p-2 rounded-xl border flex items-start gap-2 ${
                    isWeatherSynergy
                      ? 'bg-emerald-950/15 border-emerald-600 text-emerald-950'
                      : 'bg-[#dfcba6]/50 border-[#bfa379]/40 text-[#6b4a2e]'
                  }`}>
                    <span className="text-sm">🌧️</span>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold">Weather Synergy</span>
                        <span className={`font-bold ${isWeatherSynergy ? 'text-emerald-800' : 'text-stone-500'}`}>
                          {isWeatherSynergy ? '+20% Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-[9.5px]">Boosted during gentle rain, overcast, and mist</p>
                    </div>
                  </div>

                  <div className={`p-2 rounded-xl border flex items-start gap-2 ${
                    isSeasonSynergy
                      ? 'bg-amber-950/15 border-amber-600 text-amber-950'
                      : 'bg-[#dfcba6]/50 border-[#bfa379]/40 text-[#6b4a2e]'
                  }`}>
                    <span className="text-sm">🍂</span>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold">Seasonal Crop Caps</span>
                        <span className={`font-bold ${isSeasonSynergy ? 'text-amber-800' : 'text-stone-500'}`}>
                          {isSeasonSynergy ? '+25% Cap Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-[9.5px]">Crop storage capacity bonus during Harvestide & Spring</p>
                    </div>
                  </div>

                  {/* Soil Fertility Composting */}
                  <div className="bg-[#dfcba6]/70 p-2 rounded-xl border border-[#bfa379]/60 flex items-start gap-2">
                    <span className="text-sm">🍄</span>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#3f2314]">Composting Decay</span>
                        <span className="text-emerald-800 font-bold">
                          +{Math.round((stats.soilFertilityBonus || 0) * 100)}% Yield
                        </span>
                      </div>
                      <p className="text-[9.5px] text-[#6b4a2e]">5% of excess Flora &gt;90% cap converts daily to permanent farm yield</p>
                    </div>
                  </div>
                </div>

                {/* Living Bramble Shield Controls */}
                <div className="bg-[#ebdcc1] p-2 rounded-xl border border-[#8c6843] flex items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-[#3f2314]">Living Bramble Shield</span>
                      <span className={`text-[9px] font-mono px-1 rounded ${brambleShieldActive ? 'bg-emerald-800 text-emerald-100 font-bold' : 'bg-stone-300 text-stone-600'}`}>
                        {brambleShieldActive ? 'Active' : 'Off'}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-[#6b4a2e]">
                      -40% raid losses • Drain: {stats?.hasBrambleWall ? '1' : '2'} 🌿/hr
                    </span>
                  </div>
                  {onToggleBrambleShield && (
                    <button
                      onClick={() => onToggleBrambleShield()}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition shadow ${
                        brambleShieldActive
                          ? 'bg-emerald-800 hover:bg-emerald-900 text-emerald-100 border border-emerald-600'
                          : 'bg-stone-800 hover:bg-stone-900 text-amber-100 border border-stone-700'
                      }`}
                    >
                      {brambleShieldActive ? 'Disable' : 'Enable'}
                    </button>
                  )}
                </div>

                {/* Combat Matchup Matrix */}
                <div className="border-t border-[#8c6843]/40 pt-2 text-[9.5px] font-mono text-[#5c3e23] flex justify-between items-center">
                  <span>🪨 vs Stone: <strong className="text-emerald-800">+25% Atk</strong></span>
                  <span>💧 vs Water: <strong className="text-emerald-800">+15% Def</strong></span>
                  <span>🔥 vs Flame: <strong className="text-rose-800">-20% Def</strong></span>
                </div>
              </div>
            )}
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
