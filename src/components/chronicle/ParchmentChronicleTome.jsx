import React from 'react';

export function ParchmentChronicleTome({ logs, onResetSave }) {
  return (
    <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
      <div className="border-b-2 border-[#bfa379] pb-2">
        <h2 className="text-sm sm:text-base font-black text-[#442813] flex items-center gap-2">
          <span>📖 Kingdom Chronicles & Battle Archives</span>
        </h2>
        <p className="text-[11px] text-[#6b4a2e]">
          Scribe records detailing all perimeter breaches, defended sieges, and royal decisions.
        </p>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {logs.map(log => (
          <div
            key={log.id}
            className={`p-2.5 rounded-xl border flex items-start gap-2.5 ${
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
        ))}
      </div>

      <div className="pt-4 border-t-2 border-[#bfa379]/60 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-black text-[#442813]">Citadel Rebirth</h4>
          <p className="text-[10px] text-[#6b4a2e]">Reset all archives to choose a different faction allegiance.</p>
        </div>
        <button
          onClick={onResetSave}
          className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-900 text-rose-300 text-xs font-bold shadow transition"
        >
          Reset Kingdom ⚠️
        </button>
      </div>
    </div>
  );
}
