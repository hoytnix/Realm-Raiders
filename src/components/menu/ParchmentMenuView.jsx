import React from 'react';
import { haptics } from '../../utils/index.js';

export function ParchmentMenuView({
  currentFaction,
  stats,
  state,
  isMuted,
  onToggleMute,
  onNavigate,
  onResetSave
}) {
  const pendingBloodFeuds = state.revengeLedger.filter(r => !r.revenged).length;

  const handleNavClick = (dest) => {
    haptics.light();
    onNavigate(dest);
  };

  const handleReset = () => {
    haptics.heavy();
    if (window.confirm('Are you certain you wish to abdicate the throne and reset all archives?')) {
      onResetSave();
    }
  };

  const menuSections = [
    {
      id: 'citadel',
      title: 'Royal Citadel Cartography',
      tagline: 'Settlement Architecture & Upgrades',
      description: 'Review isometric layout, upgrade economic granaries and aqueducts, and stamp royal decrees.',
      icon: '🏰',
      badge: `Tier Sum ${Object.values(state.buildings).reduce((a, b) => a + b, 0)}`,
      actionLabel: 'Open Citadel Map →',
      accentColor: 'border-amber-700/60 bg-[#eedebf]'
    },
    {
      id: 'war',
      title: 'War Council & Retaliation Board',
      tagline: 'Asynchronous Catapult Raids & Feuds',
      description: 'Scout rival encampments matched to your rating, dispatch siege vanguards, and avenge pillaged silos.',
      icon: '⚔️',
      badge: pendingBloodFeuds > 0 ? `🩸 ${pendingBloodFeuds} Blood Feuds Active` : '3 Scouts Ready',
      badgeHighlight: pendingBloodFeuds > 0,
      actionLabel: 'Enter War Council →',
      accentColor: 'border-red-800/60 bg-[#edd6cc]'
    },
    {
      id: 'chronicle',
      title: 'Kingdom Chronicles & Tome',
      tagline: 'Battle Logs & Historical Records',
      description: 'Inspect past raid defenses, defensive scrap salvage records, and scribe chronicles.',
      icon: '📖',
      badge: `${state.battleLogs.length} Battle Inscriptions`,
      actionLabel: 'Open Scribe Tome →',
      accentColor: 'border-stone-600/60 bg-[#e6ddc9]'
    }
  ];

  return (
    <div className="flex-1 p-3 sm:p-5 overflow-y-auto space-y-4 text-stone-900 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:pb-5">
      {/* Menu Header */}
      <div className="border-b-2 border-[#bfa379]/80 pb-2.5 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm sm:text-base font-black text-[#442813] flex items-center gap-2">
            <span>📜 Grand Realm Directory</span>
          </h2>
          <p className="text-[11px] text-[#6b4a2e]">
            Choose a royal ledger, dispatch council emissaries, or inspect treasury vaults.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleNavClick('citadel')}
            className="min-h-[44px] px-3 py-1.5 rounded-xl bg-[#ddcca8] hover:bg-[#d0bc93] active:scale-95 text-[#442813] text-xs font-bold border border-[#8c6843] flex items-center gap-1.5 transition"
          >
            <span>🏰</span>
            <span>Return to Map</span>
          </button>
        </div>
      </div>

      {/* Primary Destination Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {menuSections.map(sec => (
          <div
            key={sec.id}
            onClick={() => handleNavClick(sec.id)}
            className={`p-3.5 rounded-2xl border-2 ${sec.accentColor} shadow-md flex flex-col justify-between cursor-pointer hover:scale-[1.02] active:scale-95 transition-transform group`}
          >
            <div>
              <div className="flex items-start justify-between">
                <span className="text-2xl group-hover:scale-110 transition-transform">{sec.icon}</span>
                <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  sec.badgeHighlight ? 'bg-red-800 text-rose-100 animate-pulse' : 'bg-[#6b4724]/20 text-[#5c3e23]'
                }`}>
                  {sec.badge}
                </span>
              </div>

              <h3 className="text-xs sm:text-sm font-black text-[#442813] mt-2 group-hover:text-amber-900 transition-colors">
                {sec.title}
              </h3>
              <span className="text-[10px] font-bold text-[#8c6843] block mt-0.5">
                {sec.tagline}
              </span>
              <p className="text-[11px] text-[#6b4a2e] mt-1.5 line-clamp-2">
                {sec.description}
              </p>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); handleNavClick(sec.id); }}
              className="mt-3 w-full min-h-[44px] py-2 px-2.5 rounded-xl bg-[#6b4724] group-hover:bg-[#523315] text-amber-100 text-xs font-bold transition flex items-center justify-center gap-1 shadow-sm"
            >
              {sec.actionLabel}
            </button>
          </div>
        ))}
      </div>

      {/* Realm Status & Faction Doctrines Overview Card */}
      <div className="bg-[#ebdcc1] border-2 border-[#8c6843] rounded-2xl p-3.5 shadow-md">
        <div className="flex items-center justify-between border-b border-[#bfa379]/60 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">{currentFaction.sigil}</span>
            <div>
              <h4 className="text-xs font-black text-[#442813]">{currentFaction.name}</h4>
              <span className="text-[10px] text-[#6b4a2e] font-mono">{currentFaction.title}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono font-bold text-amber-900 block">
              Rating {stats.overallRating} ⭐
            </span>
            <span className="text-[10px] text-stone-600 font-mono">
              Atk {Math.round(stats.attackPower)} • Def {Math.round(stats.defensePower)}
            </span>
          </div>
        </div>

        {/* Faction Perks */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 pt-1 text-[11px] text-[#5c3e23]">
          {currentFaction.perks.map((p, i) => (
            <div key={i} className="flex items-start gap-1.5 bg-[#dfcba6]/50 p-1.5 rounded-lg border border-[#bfa379]/40">
              <span className="text-amber-800 font-bold">✦</span>
              <span>{p}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stockpile & Vault Security Ledger */}
      <div className="bg-[#ebdcc1] border-2 border-[#8c6843] rounded-2xl p-3.5 shadow-md">
        <h4 className="text-xs font-black text-[#442813] mb-2 flex items-center gap-1.5">
          <span>🪙 Deep Vault Security & Silo Stockpiles</span>
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-[10px] font-mono">
          {[
            { key: 'food', label: 'Food', icon: '🌾' },
            { key: 'water', label: 'Water', icon: '💧' },
            { key: 'wood', label: 'Wood', icon: '🪵' },
            { key: 'stone', label: 'Stone', icon: '🪨' },
            { key: 'flora', label: 'Flora', icon: '🌿' },
            { key: 'gold', label: 'Gold', icon: '🪙' }
          ].map(item => {
            const current = Math.floor(state.resources[item.key] || 0);
            const cap = stats.caps[item.key] || 1000;
            const protectedAmt = stats.vaultProtected[item.key] || 0;
            const isExposed = current > protectedAmt;

            return (
              <div key={item.key} className="bg-[#dfcba6]/70 border border-[#bfa379]/60 p-2 rounded-xl">
                <div className="flex items-center justify-between font-bold text-[#442813]">
                  <span>{item.icon} {item.label}</span>
                  <span>{current}</span>
                </div>
                <div className="text-[9px] text-stone-600 mt-1">
                  Cap: {cap}
                </div>
                <div className={`text-[9px] mt-0.5 font-bold ${isExposed ? 'text-amber-900' : 'text-emerald-800'}`}>
                  {isExposed ? `Unbanked: ${current - protectedAmt}` : '100% Secured'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Diegetic Controls & Realm Rebirth */}
      <div className="border-t-2 border-[#bfa379]/60 pt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => { haptics.light(); onToggleMute(); }}
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#ddcca8] hover:bg-[#d0bc93] active:scale-95 text-[#442813] text-xs font-bold border border-[#8c6843] flex items-center gap-1.5 shadow-sm transition"
          >
            <span>{isMuted ? '🔇' : '🔊'}</span>
            <span>{isMuted ? 'Synthesizer Muted' : 'Audio Active'}</span>
          </button>
        </div>

        <button
          onClick={handleReset}
          className="min-h-[44px] px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-900 active:scale-95 text-rose-300 text-xs font-bold shadow transition flex items-center gap-1.5"
        >
          <span>⚠️</span>
          <span>Reset Citadel & Allegiance</span>
        </button>
      </div>
    </div>
  );
}
