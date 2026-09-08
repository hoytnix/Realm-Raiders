import React from 'react';
import { sounds } from '../../constants/index.js';
import { haptics } from '../../utils/index.js';

export function MobileBottomNav({
  deskView,
  setDeskView,
  hasUnavengedFeuds,
  readyHarvestsCount = 0,
  canUpgradeSelected = false,
  selectedBuildingName = '',
  onHarvestAll,
  onUpgradeSelected,
  onTriggerStamp
}) {
  const handleNav = (view) => {
    haptics.light();
    if (view === 'war') sounds.playDaggerThrust();
    else sounds.playCoin();
    setDeskView(view);
  };

  const handleFabClick = (e) => {
    haptics.heavy();
    if (readyHarvestsCount > 0 && onHarvestAll) {
      onHarvestAll();
    } else if (canUpgradeSelected && onUpgradeSelected) {
      onUpgradeSelected(e);
    } else if (onTriggerStamp) {
      sounds.playWaxSealThud();
      onTriggerStamp(e);
    }
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1c120c]/95 border-t-2 border-amber-700/80 backdrop-blur-md px-2 pt-1 pb-[calc(0.4rem+env(safe-area-inset-bottom,0px))] flex items-center justify-around shadow-[0_-8px_30px_rgba(0,0,0,0.9)] select-none">
      {/* Tab 1: Citadel Map */}
      <button
        onClick={() => handleNav('citadel')}
        className={`flex-1 py-1 flex flex-col items-center justify-center min-h-[48px] rounded-xl transition ${
          deskView === 'citadel'
            ? 'text-amber-300 font-bold bg-amber-950/40 border border-amber-700/40'
            : 'text-amber-200/60 hover:text-amber-200'
        }`}
      >
        <span className="text-lg">🏰</span>
        <span className="text-[10px] tracking-wider uppercase font-mono">Citadel</span>
      </button>

      {/* Tab 2: War Council */}
      <button
        onClick={() => handleNav('war')}
        className={`flex-1 py-1 flex flex-col items-center justify-center min-h-[48px] rounded-xl transition relative ${
          deskView === 'war'
            ? 'text-amber-300 font-bold bg-amber-950/40 border border-amber-700/40'
            : 'text-amber-200/60 hover:text-amber-200'
        }`}
      >
        <span className="text-lg">⚔️</span>
        <span className="text-[10px] tracking-wider uppercase font-mono">War</span>
        {hasUnavengedFeuds && (
          <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
        )}
      </button>

      {/* Center Prominent Contextual FAB: Royal Seal / Claim / Upgrade */}
      <div className="relative -top-3 px-1.5 flex flex-col items-center">
        <button
          onClick={handleFabClick}
          className={`w-14 h-14 rounded-full border-2 shadow-2xl flex flex-col items-center justify-center transition active:scale-90 ${
            readyHarvestsCount > 0
              ? 'bg-gradient-to-tr from-emerald-800 via-green-600 to-emerald-500 border-emerald-300 text-emerald-100 shadow-green-950/80 animate-bounce'
              : canUpgradeSelected
              ? 'bg-gradient-to-tr from-red-900 via-rose-700 to-red-600 border-amber-400 text-amber-200 shadow-red-950/80 animate-pulse'
              : 'bg-gradient-to-tr from-amber-900 via-amber-700 to-yellow-600 border-amber-300 text-amber-100 shadow-black/80'
          }`}
          title={
            readyHarvestsCount > 0
              ? `Claim ${readyHarvestsCount} Harvests!`
              : canUpgradeSelected
              ? `Upgrade ${selectedBuildingName}`
              : 'Royal Sovereign Seal'
          }
        >
          <span className="text-xl">
            {readyHarvestsCount > 0 ? '🌾' : canUpgradeSelected ? '🩸' : '👑'}
          </span>
          <span className="text-[8px] font-black uppercase tracking-tighter">
            {readyHarvestsCount > 0
              ? `${readyHarvestsCount} Ready`
              : canUpgradeSelected
              ? 'Upgrade'
              : 'Seal'}
          </span>
        </button>
      </div>

      {/* Tab 3: Chronicle Tome */}
      <button
        onClick={() => handleNav('chronicle')}
        className={`flex-1 py-1 flex flex-col items-center justify-center min-h-[48px] rounded-xl transition ${
          deskView === 'chronicle'
            ? 'text-amber-300 font-bold bg-amber-950/40 border border-amber-700/40'
            : 'text-amber-200/60 hover:text-amber-200'
        }`}
      >
        <span className="text-lg">📜</span>
        <span className="text-[10px] tracking-wider uppercase font-mono">Tome</span>
      </button>

      {/* Tab 4: Vault & Menu */}
      <button
        onClick={() => handleNav('menu')}
        className={`flex-1 py-1 flex flex-col items-center justify-center min-h-[48px] rounded-xl transition ${
          deskView === 'menu'
            ? 'text-amber-300 font-bold bg-amber-950/40 border border-amber-700/40'
            : 'text-amber-200/60 hover:text-amber-200'
        }`}
      >
        <span className="text-lg">🪙</span>
        <span className="text-[10px] tracking-wider uppercase font-mono">Vault</span>
      </button>
    </nav>
  );
}
