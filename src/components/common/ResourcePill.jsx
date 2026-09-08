import React from 'react';

export function ResourcePill({ icon, amount, cap, upkeep, color = 'text-amber-300' }) {
  const val = Math.floor(amount || 0);

  return (
    <div className="px-2 py-0.5 rounded-lg bg-stone-900/90 border border-amber-800/40 flex items-center gap-1 text-xs font-mono">
      <span>{icon}</span>
      <span className={`font-bold ${color}`}>{val.toLocaleString()}</span>
      <span className="text-[9px] text-stone-500">/{cap}</span>
      {upkeep !== undefined && upkeep !== null && (
        <span className="text-[9px] text-rose-400 font-bold ml-0.5">
          -{upkeep.toFixed(1)}/s
        </span>
      )}
    </div>
  );
}
