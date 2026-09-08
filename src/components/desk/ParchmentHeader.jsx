import React from 'react';
import { sounds } from '../../constants/index.js';

export function ParchmentHeader({ deskView }) {
  // Cartography title bar is eliminated so the Citadel map expands upwards
  if (deskView === 'citadel') return null;

  const getHeaderTitle = () => {
    switch (deskView) {
      case 'war':
        return 'War Council: Scouted Encampments';
      case 'chronicle':
        return 'Chronicle of Battle & Kingdom Ledger';
      case 'menu':
        return 'Grand Realm Directory: Royal Menu';
      default:
        return '';
    }
  };

  return (
    <div className="hidden md:flex px-4 py-2 border-b-2 border-[#bfa379]/60 items-center justify-between bg-[#ece1c5]/60 z-20">
      <div className="flex items-center gap-2">
        <span className="text-base sm:text-lg">📜</span>
        <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#5c3e23]">
          {getHeaderTitle()}
        </span>
      </div>
    </div>
  );
}
