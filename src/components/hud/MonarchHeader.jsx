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
  onToggleMute,
  onOpenSettings,
  onRaidGrain,
  onForage,
  canForage,
  forageCooldownSec
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
                    🌿 {currentFaction.element || 'Flora'}
                  </span>
                </div>
                <div className="text-[10px] text-amber-500/80 font-mono">
                  Rating: <span className="text-amber-300 font-bold">{stats.rating}</span>
                </div>
              </div>
            </button>

            {/* Interactive Elemental Status Flyout */}
            {isAffinityOpen && (
              <div className="absolute top-full mt-2 left-0 w-80 bg-stone-950/95 border-2 border-emerald-600/70 rounded-2xl p-3 shadow-2xl z-50 text-stone-200 text-xs font-serif backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-emerald-800/50 pb-1.5 mb-2">
                  <div className="flex items-center gap-1.5 text-emerald-300 font-black text-xs">
                    <span>🌿</span>
                    <span>Sylvaeth Flora Affinity</span>
                  </div>
                  <button
                    onClick={() => setIsAffinityOpen(false)}
                    className="w-5 h-5 rounded-full bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center text-[10px]"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-2 text-[11px]">
                  {/* Verdant Surge Passives */}
                  <div className="bg-emerald-950/40 border border-emerald-800/40 rounded-xl p-2 space-y-1">
                    <div className="font-bold text-emerald-300">Verdant Surge Passive:</div>
                    <div className="flex items-center justify-between text-[10.5px]">
                      <span>• Farm/Mill Base Speed:</span>
                      <span className="font-mono text-emerald-400 font-bold">+15% Active</span>
                    </div>
                    <div className="flex items-center justify-between text-[10.5px]">
                      <span>• Weather Synergy (Rain/Mist):</span>
                      <span className={`font-mono font-bold ${isWeatherSynergy ? 'text-emerald-300 animate-pulse' : 'text-stone-500'}`}>
                        {isWeatherSynergy ? '+20% Speed Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10.5px]">
                      <span>• Seasonal Crop Cap (Autumn):</span>
                      <span className={`font-mono font-bold ${isSeasonSynergy ? 'text-emerald-300' : 'text-stone-500'}`}>
                        {isSeasonSynergy ? '+25% Cap Boosted' : 'Normal Cap'}
                      </span>
                    </div>
                    {stats?.soilFertilityBonus > 0 && (
                      <div className="flex items-center justify-between text-[10.5px]">
                        <span>• Composting Soil Fertility:</span>
                        <span className="font-mono text-amber-300 font-bold">+{Math.round(stats.soilFertilityBonus * 100)}% Yield</span>
                      </div>
                    )}
                  </div>

                  {/* Active Flora Actions */}
                  <div className="space-y-1.5 pt-1">
                    <button
                      onClick={() => {
                        onTriggerVerdantBloom();
                        setIsAffinityOpen(false);
                      }}
                      className="w-full py-1.5 px-2 rounded-xl bg-gradient-to-r from-emerald-800 to-teal-900 border border-emerald-500/50 hover:brightness-110 active:scale-95 text-emerald-100 font-bold text-[11px] flex items-center justify-between shadow transition"
                    >
                      <span>🌸 Verdant Bloom (Ripen All)</span>
                      <span className="font-mono text-emerald-300">75 🌿</span>
                    </button>

                    <button
                      onClick={() => onToggleBrambleShield()}
                      className={`w-full py-1.5 px-2 rounded-xl border text-[11px] font-bold flex items-center justify-between transition active:scale-95 ${
                        brambleShieldActive
                          ? 'bg-emerald-900/60 border-emerald-400 text-emerald-200'
                          : 'bg-stone-900/80 border-stone-700 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      <span>🛡️ Living Bramble Shield</span>
                      <span className="font-mono text-[10px]">
                        {brambleShieldActive ? 'Active (-40% raid loss)' : 'Toggle (2 🌿/hr)'}
                      </span>
                    </button>
                  </div>

                  {/* Combat Matchup Matrix */}
                  <div className="bg-stone-900/60 border border-stone-800 rounded-xl p-2 text-[10px] space-y-0.5 text-stone-400">
                    <div className="font-bold text-stone-300">Elemental Matchup Matrix:</div>
                    <div className="flex items-center justify-between">
                      <span>• Flora vs Stone (Dwarves):</span>
                      <span className="text-emerald-400 font-bold">+25% Atk Bonus</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>• Flora vs Water (Humans):</span>
                      <span className="text-emerald-400 font-bold">+15% Def Bonus</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>• Flora vs Flame (Orcs):</span>
                      <span className="text-rose-400 font-bold">-20% Def Vulnerability</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: Persistent Desktop Resource HUD (All 5 primary resources) */}
        <div className="hidden md:flex items-center justify-center flex-1 mx-1 lg:mx-3 min-w-0">
          <ResourceBar
            resources={resources}
            stats={stats}
            variant="desktop"
          />
        </div>

        {/* Right Flank: Realm Chronometer, Alerts & Audio Control */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <RealmChronometerHUD
            timeState={timeState}
          />

          {/* Famine Crisis Warning */}
          <FamineWarning
            isStarving={isStarving}
            onRaidGrain={onRaidGrain}
            starvationDeaths={starvationDeaths}
            laborEfficiency={stats?.laborEfficiency}
            onForage={onForage}
            canForage={canForage}
            forageCooldownSec={forageCooldownSec}
            resources={resources}
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
