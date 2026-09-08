import React from 'react';
import { sounds } from '../../constants/index.js';
import { haptics, triggerHaptic } from '../../utils/index.js';

export function MobileBottomNav({
  deskView,
  setDeskView,
  hasUnavengedFeuds = false,
  readyHarvestsCount = 0,
  canUpgradeSelected = false,
  selectedBuildingName = '',
  isCodexOpen = false,
  onOpenCodex,
  onCloseCodex,
  isFloraOpen = false,
  onOpenFlora,
  onCloseFlora,
  isResearching = false,
  canResearchAny = false,
  resources = {},
  stats = {},
  onHarvestAll,
  onUpgradeSelected,
  onTriggerStamp
}) {
  const handleNav = (view) => {
    triggerHaptic('selection');
    haptics.light();
    onCloseCodex?.();
    onCloseFlora?.();
    if (view === 'war' || view === 'combat') {
      sounds.playDaggerThrust();
      setDeskView('war');
    } else if (view === 'vault' || view === 'menu') {
      sounds.playCoin();
      setDeskView('menu');
    } else {
      sounds.playCoin();
      setDeskView(view);
    }
  };

  const handleOpenFlora = () => {
    triggerHaptic('selection');
    haptics.light();
    sounds.playCoin();
    onCloseCodex?.();
    if (onOpenFlora) {
      onOpenFlora();
    } else {
      setDeskView('flora');
    }
  };

  const handleOpenCodex = () => {
    triggerHaptic('selection');
    haptics.light();
    sounds.playCoin();
    onCloseFlora?.();
    onOpenCodex?.();
  };

  // Flora capacity check for green pulse dot: >= 75% capacity or >= 75 units for Verdant Bloom readiness
  const currentFlora = resources?.flora || 0;
  const maxFlora = stats?.caps?.flora || 1000;
  const isFloraNearCapacity = (currentFlora / maxFlora >= 0.75) || currentFlora >= 75;

  const isCodexActive = isCodexOpen;
  const isFloraActive = !isCodexOpen && (isFloraOpen || deskView === 'flora');
  const isCitadelActive = !isCodexOpen && !isFloraActive && deskView === 'citadel';
  const isWarActive = !isCodexOpen && !isFloraActive && (deskView === 'war' || deskView === 'combat');
  const isChronicleActive = !isCodexOpen && !isFloraActive && deskView === 'chronicle';
  const isVaultActive = !isCodexOpen && !isFloraActive && (deskView === 'menu' || deskView === 'vault');

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1c120c]/95 border-t-2 border-amber-700/80 backdrop-blur-md px-1 pt-1 pb-[calc(0.4rem+env(safe-area-inset-bottom,0px))] flex items-center justify-between shadow-[0_-8px_30px_rgba(0,0,0,0.9)] select-none">
      {/* Tab 1: Citadel Map */}
      <button
        onClick={() => handleNav('citadel')}
        className={`flex-1 py-1 flex flex-col items-center justify-center min-h-[44px] min-w-0 rounded-xl transition ${
          isCitadelActive
            ? 'text-amber-300 font-bold bg-amber-950/40 border border-amber-700/40 shadow-inner'
            : 'text-amber-200/60 hover:text-amber-200'
        }`}
        title="Citadel Map"
        aria-label="Citadel"
      >
        <span className="text-base">🏰</span>
        <span className="text-[9px] tracking-tight uppercase font-mono truncate">Citadel</span>
      </button>

      {/* Tab 2: War Council */}
      <button
        onClick={() => handleNav('war')}
        className={`flex-1 py-1 flex flex-col items-center justify-center min-h-[44px] min-w-0 rounded-xl transition relative ${
          isWarActive
            ? 'text-amber-300 font-bold bg-amber-950/40 border border-amber-700/40 shadow-inner'
            : 'text-amber-200/60 hover:text-amber-200'
        }`}
        title="War Council & Raids"
        aria-label="War"
      >
        <span className="text-base">⚔️</span>
        <span className="text-[9px] tracking-tight uppercase font-mono truncate">War</span>
        {hasUnavengedFeuds && (
          <span className="absolute top-1 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
        )}
      </button>

      {/* Tab 3: Dedicated Flora Elemental Tab (Immediately right of War) */}
      <button
        onClick={handleOpenFlora}
        className={`flex-1 py-1 flex flex-col items-center justify-center min-h-[44px] min-w-0 rounded-xl transition relative ${
          isFloraActive
            ? 'text-emerald-300 font-bold bg-emerald-950/50 border border-emerald-600/50 shadow-inner'
            : 'text-amber-200/60 hover:text-emerald-200'
        }`}
        title="Flora Affinity & Verdant Bloom"
        aria-label="Flora"
      >
        {/* Botanical Leaf / Blooming Vine SVG Glyph */}
        <svg
          className="w-5 h-5 transition-transform group-hover:scale-110"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22C12 22 20 18 20 10C20 6 17 2 12 2C7 2 4 6 4 10C4 18 12 22 12 22Z" />
          <path d="M12 2v20" strokeWidth="1.4" />
          <path d="M12 7l5-2" strokeWidth="1.4" />
          <path d="M12 11l-5-2" strokeWidth="1.4" />
          <path d="M12 15l5-2" strokeWidth="1.4" />
        </svg>
        <span className="text-[9px] tracking-tight uppercase font-mono truncate">Flora</span>

        {/* Illuminated green pulse dot when Flora capacity >= 75% (signaling Verdant Bloom readiness) */}
        {isFloraNearCapacity && (
          <span className="absolute top-1 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-sm" />
          </span>
        )}
      </button>

      {/* Tab 4: Tech Codex & Decrees */}
      <button
        onClick={handleOpenCodex}
        className={`flex-1 py-1 flex flex-col items-center justify-center min-h-[44px] min-w-0 rounded-xl transition relative ${
          isCodexActive
            ? 'text-amber-300 font-bold bg-amber-950/40 border border-amber-700/40 shadow-inner'
            : 'text-amber-200/60 hover:text-amber-200'
        }`}
        title="Royal Codex & Decrees"
        aria-label="Codex"
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
        <span className="text-[9px] tracking-tight uppercase font-mono truncate">Codex</span>

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

      {/* Tab 5: Chronicle Tome */}
      <button
        onClick={() => handleNav('chronicle')}
        className={`flex-1 py-1 flex flex-col items-center justify-center min-h-[44px] min-w-0 rounded-xl transition ${
          isChronicleActive
            ? 'text-amber-300 font-bold bg-amber-950/40 border border-amber-700/40 shadow-inner'
            : 'text-amber-200/60 hover:text-amber-200'
        }`}
        title="Kingdom Chronicles"
        aria-label="Chronicle"
      >
        <span className="text-base">📜</span>
        <span className="text-[9px] tracking-tight uppercase font-mono truncate">Chronicle</span>
      </button>

      {/* Tab 6: Deep Vault & Grand Directory */}
      <button
        onClick={() => handleNav('menu')}
        className={`flex-1 py-1 flex flex-col items-center justify-center min-h-[44px] min-w-0 rounded-xl transition ${
          isVaultActive
            ? 'text-amber-300 font-bold bg-amber-950/40 border border-amber-700/40 shadow-inner'
            : 'text-amber-200/60 hover:text-amber-200'
        }`}
        title="Deep Vault & Directory"
        aria-label="Vault"
      >
        <span className="text-base">🪙</span>
        <span className="text-[9px] tracking-tight uppercase font-mono truncate">Vault</span>
      </button>
    </nav>
  );
}
