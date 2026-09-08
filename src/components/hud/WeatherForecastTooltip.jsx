import React from 'react';
import { WEATHER_CONDITIONS, SEASONS, SEASON_ORDER } from '../../constants/index.js';

export function WeatherForecastTooltip({ timeState }) {
  const currentWeather = WEATHER_CONDITIONS[timeState.weather] || WEATHER_CONDITIONS.autumn_breeze || WEATHER_CONDITIONS.clear;
  const seasonKey = SEASON_ORDER[timeState.seasonIndex] || 'autumn';
  const season = SEASONS[seasonKey] || SEASONS.autumn;

  const mults = currentWeather.multipliers || {};

  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 pointer-events-none w-72 bg-[#f4ecd8] border-2 border-[#8c6843] rounded-2xl shadow-2xl p-3 text-stone-900 font-serif animate-in fade-in zoom-in-95">
      {/* Current Meteorology Header */}
      <div className="flex items-center justify-between border-b border-[#bfa379]/60 pb-1.5 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{currentWeather.icon}</span>
          <div>
            <h4 className="text-xs font-black text-[#442813]">{currentWeather.name}</h4>
            <span className="text-[9px] font-mono text-[#6b4a2e]">
              Stable 6h Phase Block • {season.name}
            </span>
          </div>
        </div>
      </div>

      {/* Active Multipliers Matrix */}
      <div className="mb-2">
        <span className="text-[9px] font-mono text-[#6b4a2e] uppercase font-bold block mb-1">
          Meteorological Yield Modifiers:
        </span>
        <div className="grid grid-cols-3 gap-1 text-[9px] font-mono">
          <div className="bg-[#dfcba6]/70 px-1.5 py-0.5 rounded border border-[#bfa379]/40 flex justify-between">
            <span>🌾 Food:</span>
            <span className={mults.food >= 1.0 ? 'text-green-800 font-bold' : 'text-red-800 font-bold'}>
              {Math.round(mults.food * 100)}%
            </span>
          </div>
          <div className="bg-[#dfcba6]/70 px-1.5 py-0.5 rounded border border-[#bfa379]/40 flex justify-between">
            <span>💧 Water:</span>
            <span className={mults.water >= 1.0 ? 'text-green-800 font-bold' : 'text-red-800 font-bold'}>
              {Math.round(mults.water * 100)}%
            </span>
          </div>
          <div className="bg-[#dfcba6]/70 px-1.5 py-0.5 rounded border border-[#bfa379]/40 flex justify-between">
            <span>🪵 Wood:</span>
            <span className={mults.wood >= 1.0 ? 'text-green-800 font-bold' : 'text-red-800 font-bold'}>
              {Math.round(mults.wood * 100)}%
            </span>
          </div>
          <div className="bg-[#dfcba6]/70 px-1.5 py-0.5 rounded border border-[#bfa379]/40 flex justify-between">
            <span>🪨 Stone:</span>
            <span className={mults.stone >= 1.0 ? 'text-green-800 font-bold' : 'text-red-800 font-bold'}>
              {Math.round(mults.stone * 100)}%
            </span>
          </div>
          <div className="bg-[#dfcba6]/70 px-1.5 py-0.5 rounded border border-[#bfa379]/40 flex justify-between">
            <span>🌿 Flora:</span>
            <span className={mults.flora >= 1.0 ? 'text-green-800 font-bold' : 'text-red-800 font-bold'}>
              {Math.round(mults.flora * 100)}%
            </span>
          </div>
          <div className="bg-[#dfcba6]/70 px-1.5 py-0.5 rounded border border-[#bfa379]/40 flex justify-between">
            <span>⚔️ Raid Atk:</span>
            <span className={mults.raidAtk >= 1.0 ? 'text-green-800 font-bold' : 'text-red-800 font-bold'}>
              {Math.round(mults.raidAtk * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Seasonal Phase Forecast */}
      <div className="border-t border-[#bfa379]/60 pt-1.5 text-[9px] font-mono">
        <span className="text-[#6b4a2e] uppercase font-bold block mb-1">
          Early Autumn Phase Forecast (Month 9):
        </span>
        <div className="space-y-0.5 text-[#442813]">
          <div className="flex justify-between">
            <span>🌅 Dawn (06:00)</span>
            <span>Morning Mist / Fog (15%)</span>
          </div>
          <div className="flex justify-between font-bold text-amber-900">
            <span>☀️ Midday (12:00)</span>
            <span>Crisp Autumn Breeze (40%)</span>
          </div>
          <div className="flex justify-between">
            <span>🌇 Dusk (18:00)</span>
            <span>Gentle Amber Rain (20%)</span>
          </div>
          <div className="flex justify-between">
            <span>🌙 Midnight (00:00)</span>
            <span>Overcast Cloudcover (25%)</span>
          </div>
        </div>
        <div className="mt-1 text-[8.5px] text-emerald-800 font-bold">
          ✓ Frost, snow, and blizzards locked at 0% in Autumn.
        </div>
      </div>
    </div>
  );
}
