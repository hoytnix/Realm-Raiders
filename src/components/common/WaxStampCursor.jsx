import React from 'react';

export function WaxStampCursor({ isVisible, cursorPos, stampingDecree }) {
  if (!isVisible) return null;

  return (
    <div
      className="fixed pointer-events-none z-50 transition-transform duration-75"
      style={{
        left: cursorPos.x - 22,
        top: cursorPos.y - 28,
        transform: stampingDecree ? 'scale(0.85) translateY(10px)' : 'scale(1)'
      }}
    >
      <div className="w-12 h-14 bg-gradient-to-b from-amber-200 via-amber-600 to-amber-900 border-2 border-amber-950 rounded-t-full rounded-b-lg shadow-[0_8px_20px_rgba(0,0,0,0.8)] flex flex-col items-center justify-between p-1">
        <div className="w-4 h-4 rounded-full bg-amber-300 border border-amber-800 shadow-inner" />
        <div className="w-9 h-3 rounded bg-red-800 border border-amber-400/80 flex items-center justify-center">
          <span className="text-[8px] text-amber-200 font-black">SEAL</span>
        </div>
      </div>
    </div>
  );
}
