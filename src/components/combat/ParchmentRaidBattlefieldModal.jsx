import React from 'react';
import { ISO_W, ISO_H, gridToParchmentIso, FACTIONS, getElementalMatchup } from '../../constants/index.js';
import { haptics } from '../../utils/index.js';

export function ParchmentRaidBattlefieldModal({ raid, onStrike, onDoubleLoot, onClose }) {
  const { rival, strikesLeft, targetedBuildings, lootGained, isFinished, doubled, isInfused } = raid;

  const rivalFaction = FACTIONS[rival.faction] || FACTIONS.humans;
  const rivalElement = rival.element || rivalFaction.element || 'Stone';
  const matchup = getElementalMatchup('Flora', rivalElement);

  const targets = [
    { key: 'keep', name: 'Town Keep', gx: 2, gy: 2, icon: '🏰' },
    { key: 'granary', name: 'Granary', gx: 1, gy: 1, icon: '🌾' },
    { key: 'vault', name: 'Vault', gx: 3, gy: 3, icon: '🪙' },
    { key: 'lumber', name: 'Lumber', gx: 0, gy: 2, icon: '🪵' },
    { key: 'watchtower', name: 'Tower', gx: 2, gy: 0, icon: '🏹' }
  ];

  const handleStrikeTarget = (targetKey) => {
    if (strikesLeft > 0) {
      haptics.heavy();
      onStrike(targetKey);
    }
  };

  const handleReturn = () => {
    haptics.light();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-stone-950/95 backdrop-blur-md z-50 flex items-center justify-center p-0 sm:p-3">
      <div className="bg-[#ebdcc1] border-0 sm:border-4 border-[#8c6843] rounded-none sm:rounded-3xl max-w-2xl w-full h-full sm:h-auto p-4 sm:p-5 shadow-2xl flex flex-col justify-between space-y-3 text-stone-900 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] overflow-y-auto">
        {/* Sticky Header with Ammo & Return */}
        <div className="flex items-center justify-between border-b-2 border-[#bfa379] pb-2">
          <div>
            <h3 className="text-sm sm:text-base font-black text-[#442813]">
              Catapult Siege: {rival.name}
            </h3>
            <span className="text-[10px] text-[#6b4a2e]">
              Tap target fortifications to fire heavy stone munitions.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-2.5 py-1 rounded-xl bg-red-950 text-red-200 font-mono text-xs font-bold flex items-center gap-1">
              <span>Munitions:</span>
              <span>{'💣 '.repeat(strikesLeft)}</span>
              {strikesLeft === 0 && <span className="text-red-400">0</span>}
            </div>
            {isFinished && (
              <button
                onClick={handleReturn}
                className="sm:hidden min-h-[44px] min-w-[44px] px-3 py-1 bg-stone-900 text-stone-200 rounded-xl font-bold text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Elemental Affinity Matchup & Infusion Banner */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 px-3 py-1.5 rounded-xl border bg-[#dfcba6]/70 border-[#bfa379] text-[11px] font-mono">
          <div className={`px-2 py-0.5 rounded-lg border font-bold flex items-center gap-1 ${matchup.sealColor}`}>
            <span>{matchup.badge}</span>
          </div>
          {isInfused && (
            <span className="px-2 py-0.5 rounded-lg bg-emerald-900 text-emerald-100 font-bold border border-emerald-600 text-[10px]">
              🌿 Briar Infused (+15% Plunder)
            </span>
          )}
        </div>

        {/* 2.5D Raid SVG Map */}
        <div className="w-full flex-1 sm:h-72 min-h-[240px] bg-[#dfcba6] rounded-2xl border-2 border-[#8c6843] flex items-center justify-center relative overflow-hidden shadow-inner">
          <svg viewBox="0 0 540 320" className="w-full h-full max-w-lg select-none">
            {/* Grid */}
            {[0, 1, 2, 3, 4].map(gx =>
              [0, 1, 2, 3, 4].map(gy => {
                const { x, y } = gridToParchmentIso(gx, gy, 270, 50);
                return (
                  <polygon
                    key={`raid-grid-${gx}-${gy}`}
                    points={`
                      ${x},${y - ISO_H / 2}
                      ${x + ISO_W / 2},${y}
                      ${x},${y + ISO_H / 2}
                      ${x - ISO_W / 2},${y}
                    `}
                    fill="#d5be97"
                    stroke="#8c6843"
                    strokeWidth="1"
                  />
                );
              })
            )}

            {/* Targets */}
            {targets.map(t => {
              const { x, y } = gridToParchmentIso(t.gx, t.gy, 270, 50);
              const hits = targetedBuildings[t.key] || 0;
              const isDestroyed = hits > 0;
              const height = isDestroyed ? 10 : 32;

              return (
                <g
                  key={t.key}
                  onClick={() => handleStrikeTarget(t.key)}
                  className={`cursor-pointer ${strikesLeft > 0 ? 'hover:opacity-80 active:scale-95' : ''}`}
                >
                  <polygon
                    points={`
                      ${x - ISO_W / 2.5},${y - height}
                      ${x},${y + ISO_H / 3 - height}
                      ${x},${y + ISO_H / 3}
                      ${x - ISO_W / 2.5},${y}
                    `}
                    fill={isDestroyed ? '#7f1d1d' : '#854d0e'}
                    stroke="#3f2314"
                    strokeWidth="1.2"
                  />
                  <polygon
                    points={`
                      ${x},${y + ISO_H / 3 - height}
                      ${x + ISO_W / 2.5},${y - height}
                      ${x + ISO_W / 2.5},${y}
                      ${x},${y + ISO_H / 3}
                    `}
                    fill={isDestroyed ? '#991b1b' : '#a16207'}
                    stroke="#3f2314"
                    strokeWidth="1.2"
                  />
                  <polygon
                    points={`
                      ${x},${y - ISO_H / 3 - height}
                      ${x + ISO_W / 2.5},${y - height}
                      ${x + ISO_W / 2.5},${y}
                      ${x},${y + ISO_H / 3}
                    `}
                    fill={isDestroyed ? '#450a0a' : '#ca8a04'}
                    stroke="#3f2314"
                    strokeWidth="1.2"
                  />
                  <text
                    x={x}
                    y={y - height - 4}
                    textAnchor="middle"
                    className="text-base select-none pointer-events-none"
                  >
                    {isDestroyed ? '💥' : t.icon}
                  </text>
                  <text
                    x={x}
                    y={y + 14}
                    textAnchor="middle"
                    fill="#442813"
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {t.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Live Loot Tallies */}
        <div className="bg-[#ebdcc1] border-2 border-[#8c6843] p-2.5 rounded-xl flex items-center justify-between text-xs font-mono font-bold shadow-sm">
          <span>Plundered Spoils:</span>
          <div className="flex flex-wrap gap-2">
            <span className="text-yellow-800">🪙 {lootGained.gold}</span>
            <span className="text-amber-800">🌾 {lootGained.food}</span>
            <span className="text-orange-800">🪵 {lootGained.wood}</span>
            <span className="text-stone-700">🪨 {lootGained.stone}</span>
            <span className="text-emerald-800">🌿 {lootGained.flora}</span>
          </div>
        </div>

        {isFinished && (
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
            {!doubled && (
              <button
                onClick={() => {
                  haptics.harvest();
                  onDoubleLoot();
                }}
                className="w-full sm:flex-1 min-h-[48px] py-3 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 hover:brightness-110 active:scale-95 text-stone-950 font-black text-xs shadow-lg"
              >
                Double Loot (Watch Ad) ✨
              </button>
            )}
            <button
              onClick={handleReturn}
              className="w-full sm:flex-1 min-h-[48px] py-3 rounded-xl bg-stone-800 hover:bg-stone-900 active:scale-95 text-stone-200 font-black text-xs shadow-lg"
            >
              Return to Throne
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
