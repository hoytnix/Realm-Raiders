import React from 'react';
import { haptics } from '../../utils/index.js';

export function RewardedAdGateModal({ countdown, targetRival, onComplete, onDevSkip }) {
  const handleComplete = () => {
    haptics.heavy();
    onComplete();
  };

  const handleSkip = () => {
    haptics.heavy();
    onDevSkip();
  };

  return (
    <div className="fixed inset-0 bg-stone-950/95 backdrop-blur-md z-[60] flex items-center justify-center p-0 sm:p-4">
      {/* Full-screen sliding parchment folio on mobile, rounded card on desktop */}
      <div className="bg-[#241812] border-0 sm:border-4 border-amber-700/80 rounded-none sm:rounded-3xl max-w-md w-full h-full sm:h-auto p-5 sm:p-6 shadow-2xl text-center flex flex-col justify-between text-amber-100 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] overflow-y-auto">
        {/* Top Header Bar with Oversized Close/Skip */}
        <div className="flex items-center justify-between border-b border-amber-800/60 pb-3">
          <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
            Scout Contract
          </span>
          <button
            onClick={handleSkip}
            className="min-h-[44px] min-w-[44px] px-3 py-1.5 rounded-xl bg-stone-900 border border-amber-600/60 text-amber-300 hover:text-amber-100 text-xs font-mono font-bold active:scale-95 transition"
          >
            ⚡ Skip ({countdown}s)
          </button>
        </div>

        <div className="my-auto space-y-4 py-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-3xl shadow-inner">
            📺
          </div>

          <div>
            <h3 className="text-lg sm:text-xl font-black mt-1 text-amber-100">
              Funding March to {targetRival?.name}
            </h3>
            <p className="text-xs text-amber-300/70 mt-1 max-w-xs mx-auto leading-relaxed">
              Catapult expeditions require scout funding. Complete transmission to launch 3 siege strikes.
            </p>
          </div>

          {/* Circular Countdown Wheel */}
          <div className="py-2">
            <div className="w-20 h-20 rounded-full border-4 border-amber-500/20 border-t-amber-400 flex items-center justify-center mx-auto animate-spin">
              <span className="text-2xl font-black font-mono text-amber-400 -rotate-45">
                {countdown}
              </span>
            </div>
            <span className="text-xs text-amber-300/60 mt-3 block font-mono">
              {countdown > 0 ? `Scout dispatching in ${countdown}s...` : 'Vanguard Ready to Strike!'}
            </span>
          </div>
        </div>

        {/* Bottom Actions with 48px+ touch targets */}
        <div className="pt-3">
          {countdown === 0 ? (
            <button
              onClick={handleComplete}
              className="w-full min-h-[52px] py-3.5 rounded-2xl font-black text-sm bg-gradient-to-r from-red-700 to-amber-600 hover:brightness-110 active:scale-95 text-white shadow-2xl animate-bounce"
            >
              Launch Catapults! 🚀
            </button>
          ) : (
            <div className="space-y-2">
              <button
                disabled
                className="w-full min-h-[48px] py-3 rounded-2xl font-bold text-xs bg-stone-800 text-stone-500 border border-stone-700 cursor-not-allowed"
              >
                Transmission in Progress ({countdown}s)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
