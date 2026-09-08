import React from 'react';
import { BUILDINGS, ISO_W, ISO_H, gridToParchmentIso, sounds } from '../../constants/index.js';

export function CitadelSvgGrid({
  buildings,
  harvestTimers,
  onHarvest,
  selectedBuildingId,
  onSelectBuilding,
  canAfford,
  inkPulseTick,
  onHoverUpgrade
}) {
  return (
    <div className="flex-1 w-full relative flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 540 330" className="w-full h-full max-h-[360px] cursor-pointer select-none">
        <defs>
          <linearGradient id="parchmentGround" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ebdcc1" />
            <stop offset="100%" stopColor="#dfcba6" />
          </linearGradient>
          <linearGradient id="roofGoldInk" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>
        </defs>

        {/* Isometric Ground Grid Lines */}
        {[0, 1, 2, 3, 4].map(gx =>
          [0, 1, 2, 3, 4].map(gy => {
            const { x, y } = gridToParchmentIso(gx, gy, 270, 50);
            const isRoad = gx === 2 || gy === 2;
            return (
              <polygon
                key={`tile-${gx}-${gy}`}
                points={`
                  ${x},${y - ISO_H / 2}
                  ${x + ISO_W / 2},${y}
                  ${x},${y + ISO_H / 2}
                  ${x - ISO_W / 2},${y}
                `}
                fill={isRoad ? '#d5be97' : 'url(#parchmentGround)'}
                stroke="#8c6843"
                strokeWidth="1.2"
                strokeDasharray={isRoad ? '2,2' : 'none'}
              />
            );
          })
        )}

        {/* Animated Aqueduct Pulses */}
        <line
          x1={gridToParchmentIso(1, 1, 270, 50).x}
          y1={gridToParchmentIso(1, 1, 270, 50).y}
          x2={gridToParchmentIso(2, 2, 270, 50).x}
          y2={gridToParchmentIso(2, 2, 270, 50).y}
          stroke="#0284c7"
          strokeWidth="2"
          strokeDasharray="4,6"
          strokeDashoffset={-inkPulseTick}
          opacity="0.8"
        />
        <line
          x1={gridToParchmentIso(3, 1, 270, 50).x}
          y1={gridToParchmentIso(3, 1, 270, 50).y}
          x2={gridToParchmentIso(2, 2, 270, 50).x}
          y2={gridToParchmentIso(2, 2, 270, 50).y}
          stroke="#0284c7"
          strokeWidth="2"
          strokeDasharray="4,6"
          strokeDashoffset={-inkPulseTick}
          opacity="0.8"
        />

        {/* 2.5D Isometric Buildings with Illuminated Harvest Rings */}
        {Object.values(BUILDINGS)
          .sort((a, b) => (a.gx + a.gy) - (b.gx + b.gy))
          .map(b => {
            const level = buildings[b.id] || 1;
            const { x, y } = gridToParchmentIso(b.gx, b.gy, 270, 50);
            const isSelected = selectedBuildingId === b.id;
            const height = 24 + level * 7;

            // Harvest calculation
            const cycleDur = b.cycleDuration || 0;
            const timerVal = harvestTimers[b.id] || 0;
            const progressRatio = cycleDur > 0 ? Math.min(1, timerVal / cycleDur) : 0;
            const isReadyToHarvest = cycleDur > 0 && progressRatio >= 1;

            return (
              <g
                key={b.id}
                onClick={() => {
                  if (isReadyToHarvest) {
                    onHarvest(b.id);
                  } else {
                    sounds.playCoin();
                    onSelectBuilding(b.id);
                  }
                }}
                onMouseEnter={() => {
                  if (isSelected && canAfford) onHoverUpgrade(true);
                }}
                onMouseLeave={() => onHoverUpgrade(false)}
                className="cursor-pointer group"
              >
                {/* Cast Ground Shadow */}
                <polygon
                  points={`
                    ${x},${y}
                    ${x + ISO_W / 2},${y - ISO_H / 4}
                    ${x + ISO_W / 1.5},${y + 8}
                    ${x},${y + 6}
                  `}
                  fill="rgba(78, 52, 34, 0.35)"
                />

                {/* Harvest Timer Arc / Ring around building base */}
                {cycleDur > 0 && (
                  <ellipse
                    cx={x}
                    cy={y}
                    rx={ISO_W / 2 + 4}
                    ry={ISO_H / 2 + 2}
                    fill="none"
                    stroke={isReadyToHarvest ? '#16a34a' : '#d97706'}
                    strokeWidth={isReadyToHarvest ? '3' : '2'}
                    strokeDasharray="140"
                    strokeDashoffset={140 - (progressRatio * 140)}
                    opacity="0.85"
                  />
                )}

                {/* Left Facet */}
                <polygon
                  points={`
                    ${x - ISO_W / 2.5},${y - height}
                    ${x},${y + ISO_H / 3 - height}
                    ${x},${y + ISO_H / 3}
                    ${x - ISO_W / 2.5},${y}
                  `}
                  fill={isSelected ? '#c2410c' : '#78553d'}
                  stroke="#3f2314"
                  strokeWidth="1.2"
                />

                {/* Right Facet */}
                <polygon
                  points={`
                    ${x},${y + ISO_H / 3 - height}
                    ${x + ISO_W / 2.5},${y - height}
                    ${x + ISO_W / 2.5},${y}
                    ${x},${y + ISO_H / 3}
                  `}
                  fill={isSelected ? '#9a3412' : '#5e3f2b'}
                  stroke="#3f2314"
                  strokeWidth="1.2"
                />

                {/* Roof Diamond */}
                <polygon
                  points={`
                    ${x},${y - ISO_H / 3 - height}
                    ${x + ISO_W / 2.5},${y - height}
                    ${x},${y + ISO_H / 3 - height}
                    ${x - ISO_W / 2.5},${y - height}
                  `}
                  fill={isSelected ? '#f97316' : b.id === 'keep' ? 'url(#roofGoldInk)' : '#9c7349'}
                  stroke="#3f2314"
                  strokeWidth="1.2"
                />

                {/* Ink Drawn Icon & Tier Seal */}
                <text
                  x={x}
                  y={y - height - 4}
                  textAnchor="middle"
                  className="text-base select-none pointer-events-none"
                >
                  {b.inkSymbol}
                </text>
                <rect
                  x={x - 14}
                  y={y - height + 8}
                  width="28"
                  height="12"
                  rx="3"
                  fill="#3f2314"
                  stroke="#eab308"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={y - height + 17}
                  textAnchor="middle"
                  fill="#fef08a"
                  fontSize="9"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  T{level}
                </text>

                {/* Click-to-Collect Floating Ink Banner */}
                {isReadyToHarvest && (
                  <g className="animate-bounce">
                    <rect
                      x={x - 32}
                      y={y - height - 24}
                      width="64"
                      height="16"
                      rx="4"
                      fill="#15803d"
                      stroke="#86efac"
                      strokeWidth="1.2"
                      className="shadow"
                    />
                    <text
                      x={x}
                      y={y - height - 12}
                      textAnchor="middle"
                      fill="#f0fdf4"
                      fontSize="9"
                      fontWeight="black"
                      fontFamily="sans-serif"
                    >
                      CLAIM YIELD!
                    </text>
                  </g>
                )}
              </g>
            );
          })}
      </svg>
    </div>
  );
}
