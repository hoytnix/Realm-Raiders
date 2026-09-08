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
  isCodexOpen = false,
  onOpenCodex,
  isResearching = false,
  canResearchAny = false,
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

  const handleOpenCodex = () => {
    haptics.light();
    sounds.playCoin();
    onOpenCodex?.();
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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1c120c]/95 border-t-2 border-amber-700/80 backdrop-blur-md px-1 pt-1 pb-[calc(0.4rem+env(safe-area-inset-bottom,0px))] flex items-center justify-between shadow-[0_-8px_30px_rgba(0,0,0,0.9)] select-none">
      {/* Tab 1: Citadel Map */}
      <button
        onClick={() => handleNav('citadel')}
        className={`flex-1 py-1 flex flex-col items-center justify-center min-h-[44px] min-w-0 rounded-xl transition ${
          deskView === 'citadel' && !isCodexOpen
            ? 'text-amber-300 font-bold bg-amber-950/40 border border-amber-700/40'
            : 'text-amber-200/60 hover:text-amber-200'
        }`}
      >
        <span className="text-base">🏰</span>
        <span className="text-[9.5px] tracking-tight uppercase font-mono truncate">Citadel</span>
      </button>

      {/* Tab 2: War Council */}
      <button
        onClick={() => handleNav('war')}
        className={`flex-1 py-1 flex flex-col items-center justify-center min-h-[44px] min-w-0 rounded-xl transition relative ${
          deskView === 'war' && !isCodexOpen
            ? 'text-amber-300 font-bold bg-amber-950/40 border border-amber-700/40'
            : 'text-amber-200/60 hover:text-amber-200'
        }`}
      >
        <span className="text-base">⚔️</span>
        <span className="text-[9.5px] tracking-tight uppercase font-mono truncate">War</span>
        {hasUnavengedFeuds && (
          <span className="absolute top-1 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
        )}
      </button>

      {/* Center Prominent Contextual FAB: Royal Seal / Claim / Upgrade */}
      <div className="relative -top-2.5 px-0.5 flex flex-col items-center flex-shrink-0">
        <button
          onClick={handleFabClick}
          className={`w-12 h-12 rounded-full border-2 shadow-2xl flex flex-col items-center justify-center transition active:scale-90 ${
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
          <span className="text-lg">
            {readyHarvestsCount > 0 ? '🌾' : canUpgradeSelected ? '🩸' : '👑'}
          </span>
          <span className="text-[7.5px] font-black uppercase tracking-tighter">
            {readyHarvestsCount > 0
              ? `${readyHarvestsCount} Ready`
              : canUpgradeSelected
              ? 'Upgrade'
              : 'Seal'}
          </span>
        </button>
      </div>

      {/* Tab 3: Tech Codex & Decrees */}
      <button
        onClick={handleOpenCodex}
        className={`flex-1 py-1 flex flex-col items-center justify-center min-h-[44px] min-w-0 rounded-xl transition relative ${
          isCodexOpen
            ? 'text-amber-300 font-bold bg-amber-950/40 border border-amber-700/40 shadow-inner'
            : 'text-amber-200/60 hover:text-amber-200'
        }`}
      >
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          <path d="M8 7h8" strokeWidth="1.5" />
          <path d="M8 11h6" strokeWidth="1.5" />
        </svg>
        <span className="text-[9.5px] tracking-tight uppercase font-mono truncate">Codex</span>

        {/* Badge Indicator: Amber pulsing dot if researching, green dot if can research any unresearched decree */}
        {isResearching ? (
          <span className="absolute top-1 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
          </span>
        ) : canResearchAny ? (
          <span className="absolute top-1 right-1.5 flex h-2 w-2">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-sm" />
          </span>
        ) : null}
      </button>

      {/* Tab 4: Chronicle Tome */}
      <button
        onClick={() => handleNav('chronicle')}
        className={`flex-1 py-1 flex flex-col items-center justify-center min-h-[44px] min-w-0 rounded-xl transition ${
          deskView === 'chronicle' && !isCodexOpen
            ? 'text-amber-300 font-bold bg-amber-950/40 border border-amber-700/40'
            : 'text-amber-200/60 hover:text-amber-200'
        }`}
      >
        <span className="text-base">📜</span>
        <span className="text-[9.5px] tracking-tight uppercase font-mono truncate">Tome</span>
      </button>

      {/* Tab 5: Vault & Menu */}
      <button
        onClick={() => handleNav('menu')}
        className={`flex-1 py-1 flex flex-col items-center justify-center min-h-[44px] min-w-0 rounded-xl transition ${
          deskView === 'menu' && !isCodexOpen
            ? 'text-amber-300 font-bold bg-amber-950/40 border border-amber-700/40'
            : 'text-amber-200/60 hover:text-amber-200'
        }`}
      >
        <span className="text-base">🪙</span>
        <span className="text-[9.5px] tracking-tight uppercase font-mono truncate">Vault</span>
      </button>
    </nav>
  );
}
