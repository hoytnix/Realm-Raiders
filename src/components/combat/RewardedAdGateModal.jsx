import React from 'react';

export function RewardedAdGateModal({ countdown, targetRival, onComplete, onDevSkip }) {
  return (
    <div className="fixed inset-0 bg-stone-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#241812] border-4 border-amber-700/80 rounded-3xl max-w-md w-full p-6 shadow-2xl text-center space-y-4 text-amber-100">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-2xl">
          📺
        </div>

        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
            Scout Sponsorship Contract
          </span>
          <h3 className="text-base sm:text-lg font-black mt-1">
            Funding Vanguard March to {targetRival?.name}
          </h3>
          <p className="text-xs text-amber-300/70 mt-1">
            Catapult expeditions require scout funding. Complete transmission to launch 3 siege strikes.
          </p>
        </div>

        {/* Circular Countdown Wheel */}
        <div className="py-2">
          <div className="w-16 h-16 rounded-full border-4 border-amber-500/20 border-t-amber-400 flex items-center justify-center mx-auto animate-spin">
            <span className="text-xl font-black font-mono text-amber-400 -rotate-45">
              {countdown}
            </span>
          </div>
          <span className="text-xs text-amber-300/60 mt-2 block">
            {countdown > 0 ? `Scout dispatching in ${countdown}s...` : 'Vanguard Ready to Strike!'}
          </span>
        </div>

        {countdown === 0 ? (
          <button
            onClick={onComplete}
            className="w-full py-3 rounded-xl font-black text-sm bg-gradient-to-r from-red-700 to-amber-600 hover:brightness-110 text-white shadow-xl animate-bounce"
          >
            Launch Catapults! 🚀
          </button>
        ) : (
          <div className="space-y-2">
            <button
              disabled
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-stone-800 text-stone-500 border border-stone-700 cursor-not-allowed"
            >
              Sponsored Transmission in Progress ({countdown}s)
            </button>
            <button
              onClick={onDevSkip}
              className="text-[11px] font-mono text-amber-400/70 hover:text-amber-300 underline transition block mx-auto"
            >
              [⚡ Dev Skip Ad for Testing]
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
