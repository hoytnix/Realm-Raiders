import React from 'react';
import { ISO_W, ISO_H, gridToParchmentIso } from '../../constants/index.js';

export function ParchmentRaidBattlefieldModal({ raid, onStrike, onDoubleLoot, onClose }) {
  const { rival, strikesLeft, targetedBuildings, lootGained, isFinished, doubled } = raid;

  const targets = [
    { key: 'keep', name: 'Town Keep', gx: 2, gy: 2, icon: '🏰' },
    { key: 'granary', name: 'Granary', gx: 1, gy: 1, icon: '🌾' },
    { key: 'vault', name: 'Vault', gx: 3, gy: 3, icon: '🪙' },
    { key: 'lumber', name: 'Lumber', gx: 0, gy: 2, icon: '🪵' },
    { key: 'watchtower', name: 'Tower', gx: 2, gy: 0, icon: '🏹' }
  ];

  return (
    <div className="fixed inset-0 bg-stone-950/90 backdrop-blur-md z-50 flex items-center justify-center p-3">
      <div className="bg-[#ebdcc1] border-4 border-[#8c6843] rounded-3xl max-w-2xl w-full p-4 sm:p-5 shadow-2xl flex flex-col space-y-3 text-stone-900">
        <div className="flex items-center justify-between border-b-2 border-[#bfa379] pb-2">
          <div>
            <h3 className="text-base font-black text-[#442813]">
              Catapult Siege: {rival.name}
            </h3>
            <span className="text-[10px] text-[#6b4a2e]">
              Tap target structures to expend your 3 heavy stone munitions.
            </span>
          </div>

          <div className="px-3 py-1 rounded-xl bg-red-950 text-red-200 font-mono text-xs font-bold flex items-center gap-1.5">
            <span>Ammo:</span>
            <span>{'💣 '.repeat(strikesLeft)}</span>
            {strikesLeft === 0 && <span className="text-red-400">EXPENDED</span>}
          </div>
        </div>

        {/* 2.5D Raid SVG Map */}
        <div className="w-full h-64 sm:h-72 bg-[#dfcba6] rounded-2xl border-2 border-[#8c6843] flex items-center justify-center relative overflow-hidden">
          <svg viewBox="0 0 540 320" className="w-full h-full max-w-lg">
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
                  onClick={() => strikesLeft > 0 && onStrike(t.key)}
                  className={`cursor-pointer ${strikesLeft > 0 ? 'hover:opacity-80' : ''}`}
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
                      ${x},${y + ISO_H / 3 - height}
                      ${x - ISO_W / 2.5},${y - height}
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
        <div className="bg-[#ebdcc1] border-2 border-[#8c6843] p-2.5 rounded-xl flex items-center justify-between text-xs font-mono font-bold">
          <span>Plundered Spoils:</span>
          <div className="flex gap-2">
            <span className="text-yellow-800">🪙 {lootGained.gold}</span>
            <span className="text-amber-800">🌾 {lootGained.food}</span>
            <span className="text-orange-800">🪵 {lootGained.wood}</span>
          </div>
        </div>

        {isFinished && (
          <div className="flex items-center gap-2 pt-1">
            {!doubled && (
              <button
                onClick={onDoubleLoot}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 hover:brightness-110 text-stone-950 font-black text-xs shadow"
              >
                Double Loot (Watch Ad) ✨
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-900 text-stone-200 font-black text-xs shadow"
            >
              Return to Throne
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
