import React from 'react';
import { formatCompactNumber } from '../../utils/index.js';

export function ResourcePill({ icon, amount, cap, upkeep, color = 'text-amber-300' }) {
  const val = Math.floor(amount || 0);

  return (
    <div className="px-2 py-1 sm:py-0.5 rounded-lg bg-stone-900/90 border border-amber-800/40 flex items-center gap-1 text-xs font-mono whitespace-nowrap flex-shrink-0 shadow-sm">
      <span>{icon}</span>
      <span className={`font-bold ${color}`}>
        <span className="sm:hidden">{formatCompactNumber(val)}</span>
        <span className="hidden sm:inline">{val.toLocaleString()}</span>
      </span>
      <span className="text-[9px] text-stone-500">
        /<span className="sm:hidden">{formatCompactNumber(cap)}</span>
        <span className="hidden sm:inline">{cap}</span>
      </span>
      {upkeep !== undefined && upkeep !== null && (
        <span className="text-[9px] text-rose-400 font-bold ml-0.5">
          -{upkeep.toFixed(1)}/s
        </span>
      )}
    </div>
  );
}
