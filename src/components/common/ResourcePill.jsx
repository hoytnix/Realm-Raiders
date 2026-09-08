import React, { useState } from 'react';
import { formatCompactNumber } from '../../utils/index.js';

export function ResourcePill({
  icon,
  amount,
  cap = 1000,
  upkeep,
  color = 'text-amber-300',
  label,
  tooltip,
  compact = false
}) {
  const [isHovered, setIsHovered] = useState(false);
  const val = Math.floor(amount || 0);
  const percentFull = Math.min(100, Math.round((val / (cap || 1)) * 100));

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative px-2 py-1 sm:py-0.5 rounded-lg bg-stone-900/90 border border-amber-800/40 hover:border-amber-500/70 flex items-center gap-1 text-xs font-mono whitespace-nowrap flex-shrink-0 shadow-sm transition"
    >
      <span className="select-none">{icon}</span>
      <span className={`font-bold ${color}`}>
        {compact ? (
          formatCompactNumber(val)
        ) : (
          <>
            <span className="sm:hidden">{formatCompactNumber(val)}</span>
            <span className="hidden sm:inline">{val.toLocaleString()}</span>
          </>
        )}
      </span>
      <span className="text-[9px] text-stone-500">
        /<span className="sm:hidden">{formatCompactNumber(cap)}</span>
        <span className="hidden sm:inline">{cap?.toLocaleString?.() || cap}</span>
      </span>
      {upkeep !== undefined && upkeep !== null && upkeep > 0 && (
        <span className="text-[9px] text-rose-400 font-bold ml-0.5" title={`Upkeep: -${upkeep.toFixed(1)}/s`}>
          -{upkeep.toFixed(1)}/s
        </span>
      )}

      {/* Production Trend Tooltip on Hover */}
      {isHovered && (
        <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 z-50 pointer-events-none min-w-[140px] max-w-[210px] p-2 rounded-xl bg-stone-950/95 border border-amber-600/70 shadow-2xl backdrop-blur-md text-[10px] font-mono text-amber-200 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between font-bold border-b border-amber-800/40 pb-1 mb-1">
            <span className="flex items-center gap-1 text-amber-100">
              <span>{icon}</span>
              <span>{label || 'Resource'}</span>
            </span>
            <span className="text-stone-400 font-normal">{percentFull}%</span>
          </div>
          <div className="flex justify-between text-stone-300">
            <span>Stored:</span>
            <span className="font-bold text-amber-300">{val.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-stone-300">
            <span>Capacity:</span>
            <span className="text-stone-400">{(cap || 1000).toLocaleString()}</span>
          </div>
          {upkeep !== undefined && upkeep !== null && upkeep > 0 && (
            <div className="flex justify-between text-rose-400 pt-0.5 border-t border-stone-800 mt-1">
              <span>Consumption:</span>
              <span className="font-bold">-{upkeep.toFixed(1)}/s</span>
            </div>
          )}
          {tooltip && (
            <div className="text-[9px] text-amber-400/80 pt-1 mt-1 border-t border-stone-800 leading-tight">
              {tooltip}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
