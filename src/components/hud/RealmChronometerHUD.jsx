import React, { useState } from 'react';
import { SEASONS, SEASON_ORDER, WEATHER_CONDITIONS } from '../../constants/index.js';
import { haptics } from '../../utils/index.js';
import { WeatherForecastTooltip } from './WeatherForecastTooltip.jsx';

function formatOrdinal(n) {
  const num = parseInt(n, 10) || 1;
  const s = ['th', 'st', 'nd', 'rd'];
  const v = num % 100;
  return num + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function RealmChronometerHUD({ timeState }) {
  const [showForecast, setShowForecast] = useState(false);
  const season = SEASONS[SEASON_ORDER[timeState.seasonIndex]] || SEASONS.autumn;
  const weather = WEATHER_CONDITIONS[timeState.weather] || WEATHER_CONDITIONS.autumn_breeze || WEATHER_CONDITIONS.clear;
  const isNight = timeState.hour < 6 || timeState.hour >= 20;
  const isDawn = timeState.hour >= 6 && timeState.hour < 8;
  const timeOrbGlyph = isNight ? '🌙' : isDawn ? '🌅' : '☀️';

  const formattedTime = `${timeState.hour.toString().padStart(2, '0')}:${timeState.minute.toString().padStart(2, '0')}`;
  const dayOrdinal = formatOrdinal(timeState.day || 1);
  const monthDisplay = timeState.monthName ? timeState.monthName.split(' ')[0] : 'Harvestide';
  const yearDisplay = timeState.year || 26;
  const eraDisplay = timeState.era || 'ADX';

  return (
    <div className="relative flex items-center gap-1.5 sm:gap-2 bg-stone-900/90 border border-amber-600/50 rounded-2xl px-2 sm:px-3 py-1 sm:py-1.5 shadow-xl backdrop-blur text-amber-200">
      {/* Sun / Moon / Dawn Orb Dial */}
      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-amber-700 via-stone-800 to-amber-950 border border-amber-500/60 flex items-center justify-center text-xs sm:text-sm shadow-inner flex-shrink-0">
        {timeOrbGlyph}
      </div>

      <div className="text-left">
        {/* Mobile Condensed View */}
        <div className="sm:hidden flex items-center gap-1 font-mono text-xs">
          <span className="font-black font-mono text-[11px] whitespace-nowrap">
            {dayOrdinal} {monthDisplay} • {formattedTime}
          </span>
          <span
            className="text-[10px] cursor-pointer"
            title={weather.name}
            onClick={() => setShowForecast(v => !v)}
          >
            {weather.icon}
          </span>
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
            <div
              className="relative inline-flex items-center cursor-pointer group"
              onMouseEnter={() => setShowForecast(true)}
              onMouseLeave={() => setShowForecast(false)}
            >
              <span className="underline decoration-dotted decoration-amber-500/60 hover:text-amber-300 transition" title="View Meteorological Forecast">
                {weather.icon} {weather.name}
              </span>
              {showForecast && <WeatherForecastTooltip timeState={timeState} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
