import React from 'react';
import { haptics } from '../../utils/index.js';

export function ParchmentChronicleTome({ logs, onResetSave }) {
  const handleReset = () => {
    haptics.heavy();
    if (window.confirm('Are you certain you wish to abdicate the throne and reset all archives?')) {
      onResetSave();
    }
  };

  return (
    <div className="h-full min-h-0 flex-1 flex flex-col w-full p-3 sm:p-6 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:pb-6">
      {/* Scrollable Reading Area filling 100% of the parchment workspace */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-2">
        {logs.length === 0 ? (
          <div className="text-center py-16 text-xs font-mono text-[#6b4a2e]">
            No military incursions or sieges logged yet. March on rival realms from the War Council!
          </div>
        ) : (
          logs.map(log => (
            <div
              key={log.id}
              className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                log.type === 'win'
                  ? 'bg-emerald-900/10 border-emerald-800/40 text-emerald-950'
                  : 'bg-rose-900/10 border-rose-800/40 text-rose-950'
              }`}
            >
              <span className="text-base">{log.type === 'win' ? '🏆' : '🔥'}</span>
              <div className="flex-1">
                <h4 className="text-xs font-black">{log.title}</h4>
                <p className="text-[11px] mt-0.5">{log.text}</p>
                <span className="text-[9px] font-mono opacity-60 block mt-1">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Citadel Rebirth Footer */}
      <div className="pt-3 mt-3 border-t-2 border-[#bfa379]/60 flex items-center justify-between gap-3 shrink-0">
        <div>
          <h4 className="text-xs font-black text-[#442813]">Citadel Rebirth</h4>
          <p className="text-[10px] text-[#6b4a2e]">Reset all archives to choose a different faction allegiance.</p>
        </div>
        <button
          onClick={handleReset}
          className="min-h-[44px] px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-900 active:scale-95 text-rose-300 text-xs font-bold shadow-lg transition flex-shrink-0"
        >
          Reset Kingdom ⚠️
        </button>
      </div>
    </div>
  );
}
