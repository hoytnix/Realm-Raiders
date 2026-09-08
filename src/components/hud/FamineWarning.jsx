import React, { useState } from 'react';
import { sounds } from '../../constants/index.js';
import { haptics } from '../../utils/index.js';

export function FamineWarning({ isStarving, onRaidGrain, starvationDeaths = 0, laborEfficiency = 0.5 }) {
  const [modalOpen, setModalOpen] = useState(false);

  if (!isStarving) return null;

  const deathsLabel = starvationDeaths > 0 ? `(-${starvationDeaths}/cycle)` : '(-10%/cycle)';
  const laborPct = Math.round((laborEfficiency ?? 0.5) * 100);

  return (
    <>
      {/* Desktop Full Alert Banner */}
      <div className="hidden md:flex bg-red-950/90 border-2 border-red-600 text-red-200 px-3 py-1 rounded-xl text-xs font-bold shadow-[0_0_20px_rgba(220,38,38,0.4)] items-center gap-2 animate-pulse">
        <span>⚠️</span>
        <span>FAMINE ACTIVE: Troops Starving {deathsLabel} • Realm Labor at {laborPct}%</span>
      </div>

      {/* Mobile Compact Crisis Pill */}
      <button
        onClick={() => {
          sounds.playDaggerThrust();
          haptics.light();
          setModalOpen(true);
        }}
        className="md:hidden flex items-center gap-1 px-2 py-1 rounded-lg bg-red-950/90 border border-red-500 text-red-200 text-[11px] font-mono font-bold animate-pulse shadow-md"
        title="Active Realm Crisis"
      >
        <span>🩸</span>
        <span>Famine ({laborPct}%)</span>
      </button>

      {/* Mobile Animated Crisis Dropdown Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#ebdcc1] border-4 border-red-900 rounded-2xl max-w-sm w-full p-4 shadow-2xl space-y-3 text-stone-900 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-red-900/30 pb-2">
              <div className="flex items-center gap-2 text-red-900 font-black text-sm">
                <span className="text-xl">⚠️</span>
                <h3>Realm Crisis: Famine!</h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-7 h-7 rounded-full bg-red-900/10 text-red-900 font-bold flex items-center justify-center hover:bg-red-900/20"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-800 leading-relaxed">
              Citadel sustenance stores have run dry! Troops are succumbing to malnutrition, reducing workforce saturation and crippling harvest yields.
            </p>

            <div className="bg-red-950/10 border border-red-800/30 rounded-xl p-2 text-[11px] text-red-950 font-mono space-y-1">
              <div>• Troop Casualties: {deathsLabel}</div>
              <div>• Active Labor Saturation: {laborPct}%</div>
              <div>• Harvest yields scale proportionally with living laborers</div>
            </div>

            <div className="flex gap-2 pt-1">
              {onRaidGrain && (
                <button
                  onClick={() => {
                    setModalOpen(false);
                    onRaidGrain();
                  }}
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-red-800 to-rose-900 text-amber-100 font-black text-xs shadow hover:brightness-110 active:scale-95 transition"
                >
                  ⚔️ Raid for Grain
                </button>
              )}
              <button
                onClick={() => setModalOpen(false)}
                className="px-3 py-2 rounded-xl bg-[#cbb38b] hover:bg-[#bfa379] text-[#442813] font-bold text-xs shadow transition"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
