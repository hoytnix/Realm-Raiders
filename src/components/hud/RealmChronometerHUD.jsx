import React from 'react';
import { SEASONS, SEASON_ORDER, WEATHER_CONDITIONS } from '../../constants/index.js';

export function RealmChronometerHUD({ timeState, onToggleSpeed }) {
  const season = SEASONS[SEASON_ORDER[timeState.seasonIndex]] || SEASONS.spring;
  const weather = WEATHER_CONDITIONS[timeState.weather] || WEATHER_CONDITIONS.clear;
  const isNight = timeState.hour < 6 || timeState.hour >= 20;

  const formattedTime = `${timeState.hour.toString().padStart(2, '0')}:${timeState.minute.toString().padStart(2, '0')}`;

  return (
    <div className="flex items-center gap-2 bg-stone-900/90 border border-amber-600/50 rounded-2xl px-2.5 sm:px-3 py-1.5 shadow-xl backdrop-blur text-amber-200">
      {/* Sun / Moon Orb Dial */}
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-amber-700 via-stone-800 to-amber-950 border border-amber-500/60 flex items-center justify-center text-xs sm:text-sm shadow-inner">
        {isNight ? '🌙' : '☀️'}
      </div>

      <div className="text-left">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-black font-mono tracking-wider">{formattedTime}</span>
          <span className="text-[10px] font-mono text-stone-400">Day {timeState.day}</span>
        </div>
        <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-mono">
          <span className={season.color}>{season.icon} {season.name}</span>
          <span className="text-stone-500">•</span>
          <span title={weather.name}>{weather.icon} {weather.name}</span>
        </div>
      </div>

      {/* Speed Accelerator Controls */}
      <button
        onClick={onToggleSpeed}
        className="ml-1 px-1.5 py-0.5 rounded bg-amber-900/40 hover:bg-amber-900/70 border border-amber-600/40 text-[10px] font-mono font-bold text-amber-300 transition active:scale-95"
        title="Cycle Simulation Speed (1x / 2x / 5x)"
      >
        {timeState.timeSpeed}x
      </button>
    </div>
  );
}
