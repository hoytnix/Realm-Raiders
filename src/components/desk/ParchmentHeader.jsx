import React from 'react';
import { sounds } from '../../constants/index.js';

export function ParchmentHeader({ deskView, setDeskView, hasUnavengedFeuds }) {
  const getHeaderTitle = () => {
    switch (deskView) {
      case 'citadel':
        return 'The Living Cartography: Royal Citadel';
      case 'war':
        return 'War Council: Scouted Encampments';
      case 'chronicle':
        return 'Chronicle of Battle & Kingdom Ledger';
      case 'menu':
        return 'Grand Realm Directory: Royal Menu';
      default:
        return 'Royal Citadel';
    }
  };

  return (
    <div className="px-4 py-2 border-b-2 border-[#bfa379]/60 flex items-center justify-between bg-[#ece1c5]/60 z-20">
      <div className="flex items-center gap-2">
        <span className="text-base sm:text-lg">📜</span>
        <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#5c3e23]">
          {getHeaderTitle()}
        </span>
      </div>

      {/* Single Menu Hamburger Icon Button */}
      <button
        onClick={() => {
          sounds.playCoin();
          setDeskView(deskView === 'menu' ? 'citadel' : 'menu');
        }}
        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 relative shadow-md active:scale-95 ${
          deskView === 'menu'
            ? 'bg-[#5c3e23] text-amber-100 ring-2 ring-amber-600/60'
            : 'bg-[#ddcca8] text-[#442813] hover:bg-[#d0bc93] border border-[#8c6843]'
        }`}
        title="Toggle Realm Menu"
      >
        <div className="flex flex-col justify-center items-center w-3.5 h-3 gap-0.5">
          <span className={`w-3.5 h-0.5 rounded-full transition-all ${deskView === 'menu' ? 'bg-amber-200 rotate-45 translate-y-1' : 'bg-[#442813]'}`} />
          <span className={`w-3.5 h-0.5 rounded-full transition-all ${deskView === 'menu' ? 'opacity-0' : 'bg-[#442813]'}`} />
          <span className={`w-3.5 h-0.5 rounded-full transition-all ${deskView === 'menu' ? 'bg-amber-200 -rotate-45 -translate-y-1' : 'bg-[#442813]'}`} />
        </div>
        <span className="tracking-wide">Menu</span>
        {hasUnavengedFeuds && (
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping absolute -top-1 -right-1 border border-[#ebdcc1]" />
        )}
      </button>
    </div>
  );
}
