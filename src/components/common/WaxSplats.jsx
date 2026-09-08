import React from 'react';

export function WaxSplats({ splats }) {
  if (!splats || splats.length === 0) return null;

  return (
    <>
      {splats.map(splat => (
        <div
          key={splat.id}
          className="fixed pointer-events-none z-40 animate-ping opacity-80"
          style={{ left: splat.x - 24, top: splat.y - 24 }}
        >
          <div className="w-12 h-12 rounded-full bg-red-700/90 border-2 border-red-500 shadow-[0_0_25px_rgba(220,38,38,0.9)] flex items-center justify-center">
            <span className="text-xs text-amber-200">⚜️</span>
          </div>
        </div>
      ))}
    </>
  );
}
