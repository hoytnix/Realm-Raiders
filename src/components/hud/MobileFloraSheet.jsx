import React from 'react';
import { sounds } from '../../constants/index.js';
import { haptics, triggerHaptic } from '../../utils/index.js';

export function MobileFloraSheet({
  isOpen,
  onClose,
  stats = {},
  resources = {},
  timeState = null,
  brambleShieldActive = false,
  onToggleBrambleShield,
  onTriggerVerdantBloom,
  onTransmuteFlora,
  onNavigate
}) {
  if (!isOpen) return null;

  const isWeatherSynergy = ['amber_rain', 'gentle_amber_rain', 'downpour', 'overcast', 'mist'].includes(timeState?.weather || '');
  const isSeasonSynergy = ['autumn', 'spring'].includes(timeState?.season || '') || (timeState?.month >= 3 && timeState?.month <= 5) || (timeState?.month >= 9 && timeState?.month <= 11);
  const currentFlora = resources?.flora || 0;
  const maxFlora = stats?.caps?.flora || 1000;
  const floraRatio = currentFlora / (maxFlora || 1);
  const canVerdantBloom = currentFlora >= 75;

  const handleClose = () => {
    haptics.light();
    triggerHaptic('selection');
    sounds.playCoin();
    onClose?.();
  };

  const handleBloom = () => {
    if (!canVerdantBloom || !onTriggerVerdantBloom) return;
    haptics.heavy();
    triggerHaptic('heavy');
    sounds.playUpgrade();
    onTriggerVerdantBloom();
  };

  const handleBrambleToggle = () => {
    if (!onToggleBrambleShield) return;
    haptics.light();
    triggerHaptic('selection');
    sounds.playCoin();
    onToggleBrambleShield();
  };

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 h-[100dvh] w-full z-40 bg-[#120d08]/95 flex flex-col animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full h-full bg-gradient-to-b from-[#f5ebd6] via-[#ebdcc1] to-[#dfcba6] flex flex-col overflow-hidden text-[#442813] font-serif"
      >
        {/* Ornate Parchment Header (Pinned) */}
        <div className="px-4 py-3 border-b-2 border-[#8c6843]/60 flex items-center justify-between bg-[#dfcba6]/90 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl p-1.5 bg-[#ebdcc1] border border-[#8c6843] rounded-xl shadow-inner">
              🌿
            </span>
            <div>
              <h3 className="text-sm font-black text-[#3f2314] uppercase tracking-wide">
                Flora Elemental Management
              </h3>
              <span className="text-[10px] font-mono text-[#6b4a2e]">
                Sylvaeth Verdant Affinity & Living Brambles
              </span>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-2xl bg-[#dfcba6] border-2 border-[#8c6843] flex items-center justify-center text-base font-bold text-[#442813] hover:bg-[#cbb38b] active:scale-95 transition shadow cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Full Viewport Scrolling Content Area */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 space-y-3 pb-[calc(env(safe-area-inset-bottom)+5rem)]">
          {/* Flora Reserves & Verdant Bloom Action */}
          <div className="bg-[#dfcba6]/80 p-3 rounded-2xl border border-[#8c6843]/60 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-[#3f2314]">Flora Reserves</span>
            <span className="font-mono font-bold text-emerald-800">
              🌿 {Math.floor(currentFlora)} / {maxFlora} ({Math.round(floraRatio * 100)}%)
            </span>
          </div>

          <div className="w-full bg-stone-900/20 rounded-full h-2.5 overflow-hidden border border-[#8c6843]/40 p-0.5">
            <div
              className="bg-gradient-to-r from-emerald-700 to-green-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.round(floraRatio * 100))}%` }}
            />
          </div>

          {/* Verdant Bloom Button */}
          {onTriggerVerdantBloom && (
            <button
              onClick={handleBloom}
              disabled={!canVerdantBloom}
              className={`w-full py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 shadow ${
                canVerdantBloom
                  ? 'bg-gradient-to-r from-teal-900 via-emerald-800 to-green-700 border border-emerald-400 text-emerald-100 active:scale-95 animate-pulse cursor-pointer'
                  : 'bg-stone-300 text-stone-500 border border-stone-400/60 cursor-not-allowed'
              }`}
            >
              <span>🌱</span>
              <span>
                {canVerdantBloom
                  ? 'Verdant Bloom (Ripen All Crops - 75 🌿)'
                  : 'Requires 75 🌿 for Verdant Bloom'}
              </span>
            </button>
          )}
        </div>

        {/* Tactical Matrix Cards */}
        <div className="space-y-2 text-xs font-mono">
          {/* Verdant Surge */}
          <div className="bg-[#dfcba6]/70 p-2.5 rounded-xl border border-[#bfa379]/60 flex items-start gap-2">
            <span>🌱</span>
            <div className="flex-1">
              <div className="flex justify-between">
                <strong className="text-[#3f2314]">Verdant Surge</strong>
                <span className="text-emerald-800 font-bold">+15% Speed</span>
              </div>
              <p className="text-[10px] text-[#6b4a2e]">Passive growth acceleration to Farms & Lumber Mills</p>
            </div>
          </div>

          {/* Weather Synergy */}
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

          {/* Seasonal Crop Caps */}
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

          {/* Composting Decay */}
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
                <span className={`text-[9px] px-1 rounded ${brambleShieldActive ? 'bg-emerald-800 text-emerald-100' : 'bg-stone-300 text-stone-700'}`}>
                  {brambleShieldActive ? 'Active' : 'Off'}
                </span>
              </div>
              <span className="text-[10px] text-[#6b4a2e]">
                -40% raid losses • Drain: {stats?.hasBrambleWall ? '1' : '2'} 🌿/hr
              </span>
            </div>
            {onToggleBrambleShield && (
              <button
                onClick={handleBrambleToggle}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shadow active:scale-95 ${
                  brambleShieldActive
                    ? 'bg-emerald-800 text-emerald-100 hover:bg-emerald-700'
                    : 'bg-stone-800 text-amber-100 hover:bg-stone-700'
                }`}
              >
                {brambleShieldActive ? 'Disable' : 'Enable'}
              </button>
            )}
          </div>
        </div>

        {/* Elemental Combat Matchup Matrix */}
        <div className="border-t border-[#8c6843]/40 pt-2 text-[10px] font-mono text-[#5c3e23] flex justify-between items-center">
          <span>🪨 vs Stone: <strong className="text-emerald-800">+25% Atk</strong></span>
          <span>💧 vs Water: <strong className="text-emerald-800">+15% Def</strong></span>
          <span>🔥 vs Flame: <strong className="text-rose-800">-20% Def</strong></span>
        </div>
      </div>
    </div>
  </div>
);
}
