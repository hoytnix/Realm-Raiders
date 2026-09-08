import React from 'react';

export function FamineWarning({ isStarving }) {
  if (!isStarving) return null;

  return (
    <div className="bg-red-950/90 border-2 border-red-600 text-red-200 px-3 py-1 rounded-xl text-xs font-bold shadow-[0_0_20px_rgba(220,38,38,0.4)] flex items-center gap-2 animate-pulse">
      <span>⚠️</span>
      <span>FAMINE IN THE REALM: Sustenance exhausted! Harvest yields & defenses halved.</span>
    </div>
  );
}
