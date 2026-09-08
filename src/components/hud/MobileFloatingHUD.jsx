import React from 'react';
import { WEATHER_CONDITIONS, TECHNOLOGIES, sounds } from '../../constants/index.js';
import { formatCompactNumber, haptics } from '../../utils/index.js';
import { FamineWarning } from './FamineWarning.jsx';

function formatOrdinal(n) {
  const num = parseInt(n, 10) || 1;
  const s = ['th', 'st', 'nd', 'rd'];
  const v = num % 100;
  return num + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function MobileFloatingHUD({
  timeState,
  resources,
  stats,
  isStarving,
  starvationDeaths = 0,
  hasUnavengedFeuds = false,
  deskView = 'citadel',
  currentResearch = null,
  hasTroopLogistics = false,
  troops = null,
  currentFaction = null,
  brambleShieldActive = false,
  onToggleBrambleShield,
  onTriggerVerdantBloom,
  onOpenTech,
  onToggleSpeed,
  onToggleMenu,
  onRaidGrain,
  onForage,
  canForage,
  forageCooldownSec
}) {
  const [isAffinityOpen, setIsAffinityOpen] = React.useState(false);

  const weather = WEATHER_CONDITIONS[timeState?.weather] || WEATHER_CONDITIONS.autumn_breeze || WEATHER_CONDITIONS.clear;
  const isNight = timeState ? (timeState.hour < 6 || timeState.hour >= 20) : false;
  const isWeatherSynergy = ['amber_rain', 'gentle_amber_rain', 'downpour', 'overcast', 'mist'].includes(timeState?.weather || '');
  const isSeasonSynergy = ['autumn', 'spring'].includes(timeState?.season || '') || (timeState?.month >= 3 && timeState?.month <= 5) || (timeState?.month >= 9 && timeState?.month <= 11);
  const formattedTime = timeState
    ? `${timeState.hour.toString().padStart(2, '0')}:${timeState.minute.toString().padStart(2, '0')}`
    : '08:00';
  const dayOrdinal = formatOrdinal(timeState?.day || 1);
  const rawMonthName = timeState?.monthName || 'Harvestide (September)';
  const shortMonth = rawMonthName.split(' ')[0].substring(0, 4); // "Harv"
  const yearDisplay = timeState?.year || 26;
  const eraDisplay = timeState?.era || 'ADX';
  const isAutoCollecting = hasTroopLogistics && (troops?.total || 0) >= 1;

  const handleSpeedTap = (e) => {
    e.stopPropagation();
    haptics.light();
    onToggleSpeed?.();
  };

  return (
    <>
      {/* =========================================================================
          FLOATING TOP-LEFT CHRONOMETER & RESOURCE CLUSTER (< md only, Citadel page only)
          ========================================================================= */}
      {deskView === 'citadel' && (
        <div className="fixed top-2.5 left-2.5 z-30 pointer-events-none md:hidden flex flex-col gap-1 max-w-[calc(100vw-20px)] animate-in fade-in duration-200">
          {/* Upper Row: Condensed Chronometer Badge */}
          <div className="pointer-events-auto flex items-center gap-1.5 bg-stone-950/85 backdrop-blur-md border border-amber-600/50 rounded-2xl px-2.5 py-1 text-amber-200 shadow-[0_4px_14px_rgba(0,0,0,0.7)] self-start">
            <span className="text-xs">{isNight ? '🌙' : '☀️'}</span>
            <span className="text-[11px] font-mono font-bold whitespace-nowrap tracking-tight">
              {dayOrdinal} {shortMonth}, {yearDisplay} {eraDisplay} • {formattedTime} {weather.icon}
            </span>
            <button
              onClick={handleSpeedTap}
              className="ml-0.5 px-1.5 py-0.5 rounded bg-amber-900/60 hover:bg-amber-800/80 active:scale-95 border border-amber-600/50 text-[10px] font-mono font-bold text-amber-300 transition"
              title="Cycle Simulation Speed (1x / 2x / 5x)"
            >
              {timeState?.timeSpeed || 1}x
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                haptics.light();
                sounds.playCoin();
                setIsAffinityOpen(true);
              }}
              className="px-1.5 py-0.5 rounded bg-emerald-950/80 hover:bg-emerald-900 active:scale-95 border border-emerald-600/60 text-[10px] font-mono font-bold text-emerald-300 transition"
              title="Inspect Flora Affinity & Passives"
            >
              🌱 Flora
            </button>
          </div>

          {/* Middle Row: Direct Quick-Trigger Codex / Research / Harvest Pill & Surge Growth CTA */}
          <div className="pointer-events-auto flex items-center gap-1.5 flex-wrap">
            {(currentResearch || isAutoCollecting) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  haptics.light();
                  sounds.playCoin();
                  onOpenTech?.();
                }}
                className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#ebdcc1] via-[#e5d4b3] to-[#dfcba6] border border-[#8c6843] text-[#3f2314] text-[10.5px] font-mono font-bold shadow-[0_3px_10px_rgba(0,0,0,0.6)] self-start active:scale-95 transition"
                title="Open Royal Codex & Decrees"
              >
                <span className="text-xs">📜</span>
                {currentResearch ? (
                  <>
                    <span className="text-amber-950 font-black truncate max-w-[170px]">
                      {TECHNOLOGIES[currentResearch.techId]?.name || 'Decree'}: {Math.ceil(currentResearch.remaining || 0)}s
                    </span>
                    <span className="relative flex h-2 w-2 ml-0.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600" />
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-emerald-950 font-black">Troop Harvest: Active</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 ml-0.5" />
                  </>
                )}
              </button>
            )}

            {onTriggerVerdantBloom && (resources?.flora || 0) >= 75 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  haptics.heavy();
                  sounds.playUpgrade();
                  onTriggerVerdantBloom();
                }}
                className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-teal-900 via-emerald-800 to-green-700 border border-emerald-400 text-emerald-100 text-[10.5px] font-mono font-black shadow-[0_3px_10px_rgba(0,0,0,0.6)] self-start active:scale-95 transition animate-pulse"
                title="Verdant Bloom: Spend 75 Flora to instantly ripen all crops"
              >
                <span className="text-xs">🌱</span>
                <span>Surge Growth (75 🌿)</span>
              </button>
            )}
          </div>

          {/* Lower Row: Tight Cluster of Resource Pills + Famine Warning */}
          <div className="pointer-events-auto flex items-center gap-1 overflow-x-auto max-w-full pb-0.5 scrollbar-none">
            {/* Gold */}
            <div
              className="px-2 py-0.5 rounded-lg bg-stone-950/85 backdrop-blur-md border border-amber-700/50 flex items-center gap-1 text-[10.5px] font-mono shadow-md flex-shrink-0"
              title={`Gold: ${Math.floor(resources?.gold || 0)} / ${stats?.caps?.gold || 1000}`}
            >
              <span>🪙</span>
              <span className="font-bold text-yellow-300">{formatCompactNumber(resources?.gold || 0)}</span>
            </div>

            {/* Food */}
            <div
              className="px-2 py-0.5 rounded-lg bg-stone-950/85 backdrop-blur-md border border-amber-700/50 flex items-center gap-1 text-[10.5px] font-mono shadow-md flex-shrink-0"
              title={`Food: ${Math.floor(resources?.food || 0)} / ${stats?.caps?.food || 1000}`}
            >
              <span>🌾</span>
              <span className="font-bold text-amber-300">{formatCompactNumber(resources?.food || 0)}</span>
            </div>

            {/* Water */}
            <div
              className="px-2 py-0.5 rounded-lg bg-stone-950/85 backdrop-blur-md border border-amber-700/50 flex items-center gap-1 text-[10.5px] font-mono shadow-md flex-shrink-0"
              title={`Water: ${Math.floor(resources?.water || 0)} / ${stats?.caps?.water || 1000}`}
            >
              <span>💧</span>
              <span className="font-bold text-sky-300">{formatCompactNumber(resources?.water || 0)}</span>
            </div>

            {/* Wood */}
            <div
              className="px-2 py-0.5 rounded-lg bg-stone-950/85 backdrop-blur-md border border-amber-700/50 flex items-center gap-1 text-[10.5px] font-mono shadow-md flex-shrink-0"
              title={`Wood: ${Math.floor(resources?.wood || 0)} / ${stats?.caps?.wood || 1000}`}
            >
              <span>🪵</span>
              <span className="font-bold text-orange-300">{formatCompactNumber(resources?.wood || 0)}</span>
            </div>

            {/* Stone */}
            <div
              className="px-2 py-0.5 rounded-lg bg-stone-950/85 backdrop-blur-md border border-amber-700/50 flex items-center gap-1 text-[10.5px] font-mono shadow-md flex-shrink-0"
              title={`Stone: ${Math.floor(resources?.stone || 0)} / ${stats?.caps?.stone || 1000}`}
            >
              <span>🪨</span>
              <span className="font-bold text-stone-300">{formatCompactNumber(resources?.stone || 0)}</span>
            </div>

            {/* Flora */}
            <div
              className="px-2 py-0.5 rounded-lg bg-stone-950/85 backdrop-blur-md border border-emerald-700/50 flex items-center gap-1 text-[10.5px] font-mono shadow-md flex-shrink-0"
              title={`Flora: ${Math.floor(resources?.flora || 0)} / ${stats?.caps?.flora || 1000}`}
            >
              <span>🌿</span>
              <span className="font-bold text-emerald-300">{formatCompactNumber(resources?.flora || 0)}</span>
            </div>

            {/* Compact Famine Alert Pill if Starving */}
            {isStarving && (
              <div className="flex-shrink-0">
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
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Elemental Status Bottom Sheet Modal */}
      {isAffinityOpen && (
        <div
          onClick={() => setIsAffinityOpen(false)}
          className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-sm flex flex-col justify-end md:hidden animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-b from-[#f5ebd6] via-[#ebdcc1] to-[#dfcba6] border-t-2 border-[#8c6843] rounded-t-3xl p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.8)] text-[#442813] font-serif space-y-3 pb-[calc(1.5rem+env(safe-area-inset-bottom,1.5rem))]"
          >
            <div className="w-12 h-1 bg-[#8c6843]/40 rounded-full mx-auto" />
            <div className="flex items-center justify-between border-b border-[#8c6843]/40 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🌱</span>
                <div>
                  <h3 className="text-sm font-black text-[#3f2314] uppercase">Flora Elemental Affinity</h3>
                  <span className="text-[10px] font-mono text-[#6b4a2e]">Verdant Surge & Living Bramble</span>
                </div>
              </div>
              <button
                onClick={() => setIsAffinityOpen(false)}
                className="w-8 h-8 rounded-full bg-[#dfcba6] border border-[#8c6843] flex items-center justify-center text-xs font-bold text-[#442813]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="bg-[#dfcba6]/70 p-2.5 rounded-xl border border-[#bfa379]/60 flex items-start gap-2">
                <span>🌱</span>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <strong className="text-[#3f2314]">Verdant Surge</strong>
                    <span className="text-emerald-800 font-bold">+15% Speed</span>
                  </div>
                  <p className="text-[10px] text-[#6b4a2e]">Base speed to Farms & Lumber Mills</p>
                </div>
              </div>

              <div className={`p-2.5 rounded-xl border flex items-start gap-2 ${
                isWeatherSynergy ? 'bg-emerald-950/15 border-emerald-600' : 'bg-[#dfcba6]/50 border-[#bfa379]/40 text-[#6b4a2e]'
              }`}>
                <span>🌧️</span>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <strong>Weather Synergy</strong>
                    <span className={isWeatherSynergy ? 'text-emerald-800 font-bold' : 'text-stone-500 font-bold'}>
                      {isWeatherSynergy ? '+20% Active ✨' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-[10px]">Boosted during gentle rain, overcast, mist</p>
                </div>
              </div>

              <div className={`p-2.5 rounded-xl border flex items-start gap-2 ${
                isSeasonSynergy ? 'bg-amber-950/15 border-amber-600' : 'bg-[#dfcba6]/50 border-[#bfa379]/40 text-[#6b4a2e]'
              }`}>
                <span>🍂</span>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <strong>Seasonal Crop Caps</strong>
                    <span className={isSeasonSynergy ? 'text-amber-800 font-bold' : 'text-stone-500 font-bold'}>
                      {isSeasonSynergy ? '+25% Cap Active ✨' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-[10px]">Crop storage bonus in Harvestide & Spring</p>
                </div>
              </div>

              <div className="bg-[#dfcba6]/70 p-2.5 rounded-xl border border-[#bfa379]/60 flex items-start gap-2">
                <span>🍄</span>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <strong className="text-[#3f2314]">Composting Decay</strong>
                    <span className="text-emerald-800 font-bold">
                      +{Math.round((stats?.soilFertilityBonus || 0) * 100)}% Yield
                    </span>
                  </div>
                  <p className="text-[10px] text-[#6b4a2e]">5% excess Flora &gt;90% cap converts daily to permanent farm yield</p>
                </div>
              </div>

              {/* Living Bramble Shield Toggle */}
              <div className="bg-[#ebdcc1] p-2.5 rounded-xl border border-[#8c6843] flex items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-[#3f2314] flex items-center gap-1">
                    <span>🛡️ Living Bramble Shield</span>
                    <span className={`text-[9px] px-1 rounded ${brambleShieldActive ? 'bg-emerald-800 text-emerald-100' : 'bg-stone-300'}`}>
                      {brambleShieldActive ? 'Active' : 'Off'}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#6b4a2e]">
                    -40% raid losses • Drain: {stats?.hasBrambleWall ? '1' : '2'} 🌿/hr
                  </span>
                </div>
                {onToggleBrambleShield && (
                  <button
                    onClick={() => {
                      haptics.light();
                      sounds.playCoin();
                      onToggleBrambleShield();
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shadow ${
                      brambleShieldActive
                        ? 'bg-emerald-800 text-emerald-100'
                        : 'bg-stone-800 text-amber-100'
                    }`}
                  >
                    {brambleShieldActive ? 'Disable' : 'Enable'}
                  </button>
                )}
              </div>
            </div>

            {/* Combat Matchup Matrix */}
            <div className="border-t border-[#8c6843]/40 pt-2 text-[10px] font-mono text-[#5c3e23] flex justify-between items-center">
              <span>🪨 vs Stone: <strong className="text-emerald-800">+25% Atk</strong></span>
              <span>💧 vs Water: <strong className="text-emerald-800">+15% Def</strong></span>
              <span>🔥 vs Flame: <strong className="text-rose-800">-20% Def</strong></span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
