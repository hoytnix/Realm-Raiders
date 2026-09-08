import React from 'react';
import { WEATHER_CONDITIONS } from '../../constants/index.js';
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
  onToggleSpeed,
  onToggleMenu,
  onRaidGrain
}) {
  const weather = WEATHER_CONDITIONS[timeState?.weather] || WEATHER_CONDITIONS.autumn_breeze || WEATHER_CONDITIONS.clear;
  const isNight = timeState ? (timeState.hour < 6 || timeState.hour >= 20) : false;
  const formattedTime = timeState
    ? `${timeState.hour.toString().padStart(2, '0')}:${timeState.minute.toString().padStart(2, '0')}`
    : '08:00';
  const dayOrdinal = formatOrdinal(timeState?.day || 1);
  const rawMonthName = timeState?.monthName || 'Harvestide (September)';
  const shortMonth = rawMonthName.split(' ')[0].substring(0, 4); // "Harv"
  const yearDisplay = timeState?.year || 26;
  const eraDisplay = timeState?.era || 'ADX';
  const isMenuOpen = deskView === 'menu';

  const handleSpeedTap = (e) => {
    e.stopPropagation();
    haptics.light();
    onToggleSpeed?.();
  };

  const handleMenuTap = (e) => {
    e.stopPropagation();
    haptics.light();
    onToggleMenu?.();
  };

  return (
    <>
      {/* =========================================================================
          FLOATING TOP-LEFT CHRONOMETER & RESOURCE CLUSTER (< md only, Citadel page only)
          ========================================================================= */}
      {deskView === 'citadel' && (
        <div className="fixed top-2.5 left-2.5 z-30 pointer-events-none md:hidden flex flex-col gap-1 max-w-[calc(100vw-68px)] animate-in fade-in duration-200">
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

            {/* Compact Famine Alert Pill if Starving */}
            {isStarving && (
              <div className="flex-shrink-0">
                <FamineWarning
                  isStarving={isStarving}
                  onRaidGrain={onRaidGrain}
                  starvationDeaths={starvationDeaths}
                  laborEfficiency={stats?.laborEfficiency}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          FLOATING TOP-RIGHT HAMBURGER BUTTON (Icon-only diegetic seal trigger)
          ========================================================================= */}
      <button
        onClick={handleMenuTap}
        className={`fixed top-2.5 right-2.5 z-40 md:hidden w-11 h-11 rounded-2xl flex items-center justify-center border-2 shadow-[0_4px_14px_rgba(0,0,0,0.7)] transition-all active:scale-95 cursor-pointer ${
          isMenuOpen
            ? 'bg-gradient-to-br from-[#5c3e23] via-[#442813] to-[#2b180a] border-amber-500 ring-2 ring-amber-500/40 text-amber-200'
            : 'bg-gradient-to-br from-[#ecdcb9] via-[#dfcba6] to-[#bfa379] border-[#6b4724] text-[#442813] hover:brightness-105'
        }`}
        title="Toggle Grand Realm Directory"
        aria-label="Toggle Realm Menu"
      >
        <div className="flex flex-col justify-center items-center w-5 h-4 gap-1">
          <span
            className={`w-5 h-0.5 rounded-full transition-all duration-200 ${
              isMenuOpen ? 'bg-amber-200 rotate-45 translate-y-1.5' : 'bg-[#442813]'
            }`}
          />
          <span
            className={`w-5 h-0.5 rounded-full transition-all duration-200 ${
              isMenuOpen ? 'opacity-0' : 'bg-[#442813]'
            }`}
          />
          <span
            className={`w-5 h-0.5 rounded-full transition-all duration-200 ${
              isMenuOpen ? 'bg-amber-200 -rotate-45 -translate-y-1.5' : 'bg-[#442813]'
            }`}
          />
        </div>

        {hasUnavengedFeuds && (
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping absolute -top-0.5 -right-0.5 border border-[#ebdcc1]" />
        )}
      </button>
    </>
  );
}
