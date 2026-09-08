import React from 'react';
import { SEASONS, SEASON_ORDER, WEATHER_CONDITIONS } from '../../constants/index.js';
import { haptics } from '../../utils/index.js';

function formatOrdinal(n) {
  const num = parseInt(n, 10) || 1;
  const s = ['th', 'st', 'nd', 'rd'];
  const v = num % 100;
  return num + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function RealmChronometerHUD({ timeState, onToggleSpeed }) {
  const season = SEASONS[SEASON_ORDER[timeState.seasonIndex]] || SEASONS.autumn;
  const weather = WEATHER_CONDITIONS[timeState.weather] || WEATHER_CONDITIONS.autumn_breeze || WEATHER_CONDITIONS.clear;
  const isNight = timeState.hour < 6 || timeState.hour >= 20;

  const formattedTime = `${timeState.hour.toString().padStart(2, '0')}:${timeState.minute.toString().padStart(2, '0')}`;
  const dayOrdinal = formatOrdinal(timeState.day || 1);
  const monthDisplay = timeState.monthName ? timeState.monthName.split(' ')[0] : 'Harvestide';
  const yearDisplay = timeState.year || 26;
  const eraDisplay = timeState.era || 'ADX';

  const handleSpeedClick = () => {
    haptics.light();
    onToggleSpeed();
  };

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 bg-stone-900/90 border border-amber-600/50 rounded-2xl px-2 sm:px-3 py-1 sm:py-1.5 shadow-xl backdrop-blur text-amber-200">
      {/* Sun / Moon Orb Dial */}
      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-amber-700 via-stone-800 to-amber-950 border border-amber-500/60 flex items-center justify-center text-xs sm:text-sm shadow-inner flex-shrink-0">
        {isNight ? '🌙' : '☀️'}
      </div>

      <div className="text-left">
        {/* Mobile Condensed View */}
        <div className="sm:hidden flex items-center gap-1 font-mono text-xs">
          <span className="font-black font-mono text-[11px] whitespace-nowrap">
            {dayOrdinal} {monthDisplay} • {formattedTime}
          </span>
          <span className="text-[10px]" title={weather.name}>{weather.icon}</span>
        </div>

        {/* Desktop Detailed View */}
        <div className="hidden sm:block">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black font-mono tracking-wide">
              {dayOrdinal} of {monthDisplay}, {yearDisplay} {eraDisplay} • {formattedTime}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-mono">
            <span className={season.color}>{season.icon} {season.name}</span>
            <span className="text-stone-500">•</span>
            <span title={weather.name}>{weather.icon} {weather.name}</span>
          </div>
        </div>
      </div>

      {/* Speed Accelerator Controls */}
      <button
        onClick={handleSpeedClick}
        className="ml-0.5 sm:ml-1 px-1.5 py-0.5 rounded bg-amber-900/40 hover:bg-amber-900/70 border border-amber-600/40 text-[10px] font-mono font-bold text-amber-300 transition active:scale-95"
        title="Cycle Simulation Speed (1x / 2x / 5x)"
      >
        {timeState.timeSpeed}x
      </button>
    </div>
  );
}
