import React from 'react';
import { WEATHER_CONDITIONS } from '../../constants/index.js';

function formatOrdinal(n) {
  const num = parseInt(n, 10) || 1;
  const s = ['th', 'st', 'nd', 'rd'];
  const v = num % 100;
  return num + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function MobileFloatingHUD({
  timeState,
  deskView = 'citadel'
}) {
  const weather = WEATHER_CONDITIONS[timeState?.weather] || WEATHER_CONDITIONS.autumn_breeze || WEATHER_CONDITIONS.clear;
  const isNight = timeState ? (timeState.hour < 6 || timeState.hour >= 20) : false;
  const isDawn = timeState ? (timeState.hour >= 6 && timeState.hour < 8) : false;
  const timeOrbGlyph = isNight ? '🌙' : isDawn ? '🌅' : '☀️';
  const formattedTime = timeState
    ? `${timeState.hour.toString().padStart(2, '0')}:${timeState.minute.toString().padStart(2, '0')}`
    : '06:00';
  const dayOrdinal = formatOrdinal(timeState?.day || 1);
  const rawMonthName = timeState?.monthName || 'Harvestide (September)';
  const shortMonth = rawMonthName.split(' ')[0].substring(0, 4); // "Harv"
  const yearDisplay = timeState?.year || 26;
  const eraDisplay = timeState?.era || 'ADX';

  return (
    <>
      {/* =========================================================================
          FLOATING TOP-LEFT CHRONOMETER (< md only, Citadel page only)
          ========================================================================= */}
      {deskView === 'citadel' && (
        <div className="fixed top-2.5 left-2.5 z-30 pointer-events-none md:hidden flex flex-col gap-1 max-w-[calc(100vw-20px)] animate-in fade-in duration-200">
          {/* Condensed Chronometer Badge */}
          <div className="pointer-events-auto flex items-center gap-1.5 bg-stone-950/85 backdrop-blur-md border border-amber-600/50 rounded-2xl px-2.5 py-1 text-amber-200 shadow-[0_4px_14px_rgba(0,0,0,0.7)] self-start">
            <span className="text-xs">{timeOrbGlyph}</span>
            <span className="text-[11px] font-mono font-bold whitespace-nowrap tracking-tight">
              {dayOrdinal} {shortMonth}, {yearDisplay} {eraDisplay} • {formattedTime} {weather.icon}
            </span>
          </div>
        </div>
      )}
    </>
  );
}
