import React from 'react';
import { sounds } from '../../constants/index.js';
import { haptics, triggerHaptic } from '../../utils/index.js';

export function ParchmentFloraDesk({
  stats = {},
  resources = {},
  timeState = null,
  brambleShieldActive = false,
  onToggleBrambleShield,
  onTriggerVerdantBloom,
  onTransmuteFlora,
  currentFaction = null
}) {
  const currentFlora = resources?.flora || 0;
  const maxFlora = stats?.caps?.flora || 1000;
  const floraRatio = currentFlora / (maxFlora || 1);
  const canVerdantBloom = currentFlora >= 75;

  const weather = timeState?.weather || 'clear';
  const isWeatherSynergy = ['amber_rain', 'gentle_amber_rain', 'downpour', 'overcast', 'mist'].includes(weather);
  const isSeasonSynergy = ['autumn', 'spring'].includes(timeState?.season || '') || (timeState?.month >= 3 && timeState?.month <= 5) || (timeState?.month >= 9 && timeState?.month <= 11);
  const isDrought = weather === 'heatwave';

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
    <div className="flex-1 h-full w-full overflow-hidden flex flex-col">
      {/* PANORAMIC 2-PAGE DESKTOP FLORA SPREAD */}
      <div className="grid md:grid-cols-2 gap-5 h-full p-6 overflow-hidden">
        {/* =============================================================
            LEFT PAGE: Botanical Reserves, Composting & Living Brambles
            ============================================================= */}
        <div className="flex flex-col h-full bg-[#f2e7ce] border-2 border-[#8c6843] rounded-2xl p-4 shadow-inner overflow-y-auto space-y-3.5">
          {/* Page Header */}
          <div className="flex items-center justify-between border-b-2 border-[#bfa379]/70 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl p-1 bg-[#dfcba6] border border-[#8c6843] rounded-xl shadow-inner">
                🌿
              </span>
              <div>
                <h2 className="text-sm font-black text-[#442813] uppercase tracking-wide">
                  Botanical Reserves & Briar Wards
                </h2>
                <span className="text-[10px] text-[#6b4a2e]">
                  Sylvaeth Botanical Essence, Composting Humus & Living Defenses
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-lg bg-emerald-900/15 border border-emerald-800/40 text-xs font-mono font-bold text-emerald-900">
              🌿 {Math.floor(currentFlora)} / {maxFlora}
            </span>
          </div>

          {/* Section 1: Botanical Reserves Gauge */}
          <div className="bg-[#dfcba6]/80 p-3 rounded-2xl border border-[#8c6843]/60 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-[#3f2314]">Botanical Essence Capacity</span>
              <span className="font-bold text-emerald-800">
                {Math.round(floraRatio * 100)}% Saturation
              </span>
            </div>
            <div className="w-full bg-stone-900/20 rounded-full h-3 overflow-hidden border border-[#8c6843]/50 p-0.5 shadow-inner">
              <div
                className="bg-gradient-to-r from-emerald-800 via-emerald-600 to-green-500 h-full rounded-full transition-all duration-500 shadow"
                style={{ width: `${Math.min(100, Math.round(floraRatio * 100))}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#6b4a2e]">
              <span>Storage floor: 0 🌿</span>
              <span>{currentFlora > maxFlora * 0.9 ? '⚠️ Overflow composting active' : 'Stockpiled safely'}</span>
              <span>Cap: {maxFlora} 🌿</span>
            </div>
          </div>

          {/* Section 2: Soil Composting Rates */}
          <div className="bg-[#dfcba6]/80 p-3 rounded-2xl border border-[#8c6843]/60 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-lg">🍄</span>
                <h3 className="text-xs font-black text-[#442813]">Soil Composting Humus Engine</h3>
              </div>
              <span className="text-[10.5px] font-mono font-bold text-emerald-900 px-2 py-0.5 rounded bg-emerald-900/15 border border-emerald-800/30">
                +{Math.round((stats?.soilFertilityBonus || 0) * 100)}% Permanent Yield
              </span>
            </div>
            <p className="text-[11px] text-[#6b4a2e] leading-relaxed">
              When stored Flora exceeds 90% of capacity, 5% of excess essence deterministically decomposes into fertile humus each day transition, permanently boosting agricultural crop yields.
            </p>
            <div className="p-2 rounded-xl bg-[#ebdcc1] border border-[#bfa379] flex items-center justify-between text-[11px] font-mono">
              <span className="text-[#442813]">Daily Composting Threshold:</span>
              <span className="font-bold text-amber-900">&gt; {Math.round(maxFlora * 0.9)} Flora</span>
            </div>
          </div>

          {/* Section 3: Living Bramble Barrier Upkeep Controls */}
          <div className="bg-[#dfcba6]/80 p-3 rounded-2xl border border-[#8c6843]/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-lg">🛡️</span>
                <div>
                  <h3 className="text-xs font-black text-[#442813]">Living Bramble Defense Shield</h3>
                  <span className="text-[10px] text-[#6b4a2e]">
                    Upkeep: {stats?.hasBrambleWall ? '1' : '2'} 🌿 / hour • -40% raid losses • +35 Citadel defense
                  </span>
                </div>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                brambleShieldActive
                  ? 'bg-emerald-800 text-emerald-100 border-emerald-600 animate-pulse'
                  : 'bg-stone-300 text-stone-700 border-stone-400'
              }`}>
                {brambleShieldActive ? 'Active 🛡️' : 'Lowered'}
              </span>
            </div>

            <p className="text-[11px] text-[#6b4a2e] leading-relaxed">
              Entangles perimeter ramparts with venomous living thorns. Auto-withers if Flora reserves are exhausted.
            </p>

            <button
              onClick={handleBrambleToggle}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 shadow ${
                brambleShieldActive
                  ? 'bg-emerald-800 hover:bg-emerald-700 text-emerald-100 active:scale-95 border border-emerald-600'
                  : 'bg-gradient-to-r from-stone-800 to-stone-900 hover:bg-stone-700 text-amber-100 active:scale-95 border border-stone-700'
              }`}
            >
              <span>🛡️</span>
              <span>{brambleShieldActive ? 'Lower Living Bramble Shield' : 'Raise Living Bramble Shield (2 🌿/hr)'}</span>
            </button>
          </div>

          {/* Section 4: Elemental Combat Matchup Matrix */}
          <div className="p-2.5 rounded-xl bg-[#ebdcc1] border border-[#8c6843]/60 space-y-1 text-[10.5px] font-mono">
            <div className="font-bold text-[#442813] uppercase tracking-wider text-[9.5px]">
              Elemental Combat Advantage Matrix:
            </div>
            <div className="flex justify-between items-center text-emerald-900">
              <span>• Flora vs Stone (Ironpeak Dwarves):</span>
              <span className="font-bold">+25% Siege Atk Bonus</span>
            </div>
            <div className="flex justify-between items-center text-emerald-900">
              <span>• Flora vs Water (Kingdom of Valor):</span>
              <span className="font-bold">+15% Garrison Def Bonus</span>
            </div>
            <div className="flex justify-between items-center text-rose-900">
              <span>• Flora vs Flame (Bloodfury Horde):</span>
              <span className="font-bold">-20% Def Vulnerability</span>
            </div>
          </div>
        </div>

        {/* =============================================================
            RIGHT PAGE: Verdant Bloom, Vault Crucible & Weather Synergies
            ============================================================= */}
        <div className="flex flex-col h-full bg-[#f2e7ce] border-2 border-[#8c6843] rounded-2xl p-4 shadow-inner overflow-y-auto space-y-3.5">
          {/* Page Header */}
          <div className="flex items-center justify-between border-b-2 border-[#bfa379]/70 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl p-1 bg-[#dfcba6] border border-[#8c6843] rounded-xl shadow-inner">
                🌸
              </span>
              <div>
                <h2 className="text-sm font-black text-[#442813] uppercase tracking-wide">
                  Verdant Bloom & Alchemical Crucible
                </h2>
                <span className="text-[10px] text-[#6b4a2e]">
                  Instant Ripening Decrees & Deep Vault Transmutation
                </span>
              </div>
            </div>
          </div>

          {/* Section 1: Verdant Bloom Action Card */}
          <div className="bg-[#dfcba6]/80 p-3 rounded-2xl border border-[#8c6843]/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-lg">🌸</span>
                <div>
                  <h3 className="text-xs font-black text-[#442813]">Verdant Bloom Catalyst</h3>
                  <span className="text-[10px] text-[#6b4a2e]">Instant botanical crop & timber surge</span>
                </div>
              </div>
              <span className="text-[10.5px] font-mono font-bold text-emerald-900 px-2 py-0.5 rounded bg-emerald-900/15 border border-emerald-800/30">
                Cost: 75 🌿
              </span>
            </div>
            <p className="text-[11px] text-[#6b4a2e] leading-relaxed">
              Expend 75 Flora essence to instantly ripen and reap all growing agricultural acreage, granaries, and timber mills across the realm directly into stockpiles.
            </p>
            <button
              onClick={handleBloom}
              disabled={!canVerdantBloom}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 shadow ${
                canVerdantBloom
                  ? 'bg-gradient-to-r from-teal-900 via-emerald-800 to-green-700 text-emerald-100 hover:brightness-110 active:scale-95 border border-emerald-400 cursor-pointer shadow-emerald-950/40'
                  : 'bg-stone-300 text-stone-500 border border-stone-400 cursor-not-allowed'
              }`}
            >
              <span>🌸</span>
              <span>{canVerdantBloom ? 'Catalyze Verdant Bloom (Ripen All Crops)' : 'Insufficient Flora (Requires 75 🌿)'}</span>
            </button>
          </div>

          {/* Section 2: Deep Vault Alchemical Transmutations */}
          <div className="bg-[#dfcba6]/80 p-3 rounded-2xl border border-[#8c6843]/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-lg">⚗️</span>
                <div>
                  <h3 className="text-xs font-black text-[#442813]">Alchemical Press & Crucible</h3>
                  <span className="text-[10px] text-[#6b4a2e]">Transmute excess Flora into granite & gold</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {/* Recipe 1: Transmute Granite */}
              <div className="bg-[#ebdcc1] p-2.5 rounded-xl border border-[#bfa379] flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#442813]">Transmute Granite</span>
                    <span className="text-[10.5px] font-mono font-bold text-stone-800 bg-stone-900/10 px-1.5 py-0.2 rounded">
                      🪨 +50 Stone
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-mono mt-1 text-[#6b4a2e]">
                    <span className={(resources.flora || 0) >= 100 ? 'text-emerald-900 font-bold' : 'text-red-900 font-bold'}>
                      100 🌿
                    </span>
                    <span>+</span>
                    <span className={(resources.food || 0) >= 50 ? 'text-amber-900 font-bold' : 'text-red-900 font-bold'}>
                      50 🌾
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onTransmuteFlora && onTransmuteFlora('stone')}
                  disabled={(resources.flora || 0) < 100 || (resources.food || 0) < 50}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shadow ${
                    (resources.flora || 0) >= 100 && (resources.food || 0) >= 50
                      ? 'bg-stone-800 hover:bg-stone-900 text-amber-100 active:scale-95 border border-stone-700 cursor-pointer'
                      : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                  }`}
                >
                  Transmute
                </button>
              </div>

              {/* Recipe 2: Herbal Tinctures */}
              <div className="bg-[#ebdcc1] p-2.5 rounded-xl border border-[#bfa379] flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#442813]">Herbal Tinctures</span>
                    <span className="text-[10.5px] font-mono font-bold text-yellow-800 bg-yellow-900/10 px-1.5 py-0.2 rounded">
                      🪙 +40 Gold
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-mono mt-1 text-[#6b4a2e]">
                    <span className={(resources.flora || 0) >= 100 ? 'text-emerald-900 font-bold' : 'text-red-900 font-bold'}>
                      100 🌿
                    </span>
                    <span>+</span>
                    <span className={(resources.food || 0) >= 25 ? 'text-amber-900 font-bold' : 'text-red-900 font-bold'}>
                      25 🌾
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onTransmuteFlora && onTransmuteFlora('gold')}
                  disabled={(resources.flora || 0) < 100 || (resources.food || 0) < 25}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shadow ${
                    (resources.flora || 0) >= 100 && (resources.food || 0) >= 25
                      ? 'bg-amber-800 hover:bg-amber-900 text-amber-100 active:scale-95 border border-amber-600 cursor-pointer'
                      : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                  }`}
                >
                  Distill
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Active Weather Synergy Multipliers */}
          <div className="bg-[#dfcba6]/80 p-3 rounded-2xl border border-[#8c6843]/60 space-y-2 text-[11px] font-mono">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#442813] uppercase text-[10px]">Meteorological Synergy:</span>
              <span className={`px-2 py-0.5 rounded font-bold ${
                isWeatherSynergy ? 'bg-emerald-800 text-emerald-100 animate-pulse' : 'bg-stone-300 text-stone-700'
              }`}>
                {isWeatherSynergy ? 'Active (+20% Growth) ✨' : 'Inactive'}
              </span>
            </div>
            <div className="flex justify-between items-center text-[#6b4a2e]">
              <span>• Precipitation Synergy (Rain/Mist):</span>
              <span className="font-bold text-emerald-900">+20% Farm & Lumber Speed</span>
            </div>
            <div className="flex justify-between items-center text-[#6b4a2e]">
              <span>• Seasonal Crop Storage (Autumn/Spring):</span>
              <span className={`font-bold ${isSeasonSynergy ? 'text-emerald-900' : 'text-stone-500'}`}>
                {isSeasonSynergy ? '+25% Cap Active' : 'Baseline'}
              </span>
            </div>
            {isDrought && (
              <div className="flex justify-between items-center text-rose-800">
                <span>• Drought Upkeep Vulnerability:</span>
                <span className="font-bold">+10% Upkeep (Heatwave)</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
