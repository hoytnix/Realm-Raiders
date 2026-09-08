import React from 'react';
import { sounds } from '../../constants/index.js';
import { haptics } from '../../utils/index.js';

export function SovereignCommandDock({
  deskView,
  setDeskView,
  hasUnavengedFeuds = false,
  readyHarvestsCount = 0,
  onOpenTech
}) {
  const tabs = [
    {
      id: 'citadel',
      label: 'Citadel',
      icon: '🏰',
      hotkey: '1',
      badge: readyHarvestsCount > 0 ? `${readyHarvestsCount}` : null,
      badgeColor: 'bg-emerald-700 text-emerald-100 animate-bounce'
    },
    {
      id: 'war',
      label: 'War Council',
      icon: '⚔️',
      hotkey: '2',
      badge: hasUnavengedFeuds ? '🩸' : null,
      badgeColor: 'bg-red-800 text-rose-100 animate-pulse'
    },
    {
      id: 'tech',
      label: 'Tech Codex',
      icon: '📜',
      hotkey: '3',
      action: onOpenTech
    },
    {
      id: 'menu',
      label: 'Deep Vault',
      icon: '🪙',
      hotkey: '4'
    },
    {
      id: 'chronicle',
      label: 'Chronicle',
      icon: '📖',
      hotkey: '5'
    }
  ];

  const handleTabClick = (tab) => {
    if (tab.id === 'war') sounds.playDaggerThrust();
    else sounds.playCoin();
    haptics.light();

    if (tab.action) {
      tab.action();
    } else {
      setDeskView(tab.id);
    }
  };

  return (
    <nav className="hidden md:flex absolute bottom-3 left-1/2 -translate-x-1/2 z-40 items-center gap-1.5 bg-gradient-to-t from-[#1e130c] via-[#2a1b12] to-[#3a2519] border-2 border-[#8c6843] rounded-2xl px-3 py-1.5 shadow-[0_10px_35px_rgba(0,0,0,0.85),inset_0_1px_8px_rgba(255,255,255,0.12)] backdrop-blur select-none">
      {tabs.map(tab => {
        const isActive = deskView === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab)}
            className={`relative px-3.5 py-1.5 rounded-xl transition flex items-center gap-2 group ${
              isActive
                ? 'bg-gradient-to-b from-[#e4d4b3] to-[#cbb38b] text-[#3f2314] shadow-md font-black border border-[#8c6843] ring-2 ring-amber-600/60 scale-105'
                : 'text-amber-200/80 hover:text-amber-100 hover:bg-[#3f2719]/60 border border-transparent'
            }`}
          >
            <span className="text-base group-hover:scale-110 transition-transform">{tab.icon}</span>
            <span className="text-xs font-serif tracking-wide">{tab.label}</span>

            {/* Hotkey Hint */}
            <span
              className={`text-[9px] font-mono px-1 rounded ${
                isActive
                  ? 'bg-[#8c6843]/20 text-[#3f2314] font-bold'
                  : 'bg-black/40 text-amber-500/70'
              }`}
            >
              [{tab.hotkey}]
            </span>

            {/* Notification Badge */}
            {tab.badge && (
              <span
                className={`absolute -top-1.5 -right-1.5 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full shadow border border-amber-400/40 ${tab.badgeColor}`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
