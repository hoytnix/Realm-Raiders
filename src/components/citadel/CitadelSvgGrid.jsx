import React, { useState, useRef, useCallback } from 'react';
import { BUILDINGS, ISO_W, ISO_H, gridToParchmentIso, sounds } from '../../constants/index.js';
import { haptics } from '../../utils/index.js';

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
  // Pinch-to-zoom and pan state
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isInteracting, setIsInteracting] = useState(false);

  // Touch tracking refs
  const touchStateRef = useRef({
    initialDist: 0,
    initialScale: 1,
    lastX: 0,
    lastY: 0,
    isDragging: false,
    harvestedThisGesture: new Set()
  });

  const handleRecenter = useCallback(() => {
    haptics.light();
    setScale(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Touch Handlers for Pinch Zoom & Pan + Sweep to Harvest
  const handleTouchStart = (e) => {
    touchStateRef.current.harvestedThisGesture = new Set();

    if (e.touches.length === 2) {
      // Pinch gesture start
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      touchStateRef.current.initialDist = dist;
      touchStateRef.current.initialScale = scale;
      setIsInteracting(true);
    } else if (e.touches.length === 1) {
      // Pan or Sweep gesture start
      touchStateRef.current.lastX = e.touches[0].clientX;
      touchStateRef.current.lastY = e.touches[0].clientY;
      touchStateRef.current.isDragging = true;
      setIsInteracting(true);
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2) {
      // Two-finger pinch zoom
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      if (touchStateRef.current.initialDist > 0) {
        const factor = dist / touchStateRef.current.initialDist;
        const newScale = Math.max(0.8, Math.min(2.5, touchStateRef.current.initialScale * factor));
        setScale(newScale);
      }
    } else if (e.touches.length === 1 && touchStateRef.current.isDragging) {
      const touch = e.touches[0];
      const dx = touch.clientX - touchStateRef.current.lastX;
      const dy = touch.clientY - touchStateRef.current.lastY;

      // Pan translation (damped)
      setPan(prev => ({
        x: Math.max(-160, Math.min(160, prev.x + dx * 0.8)),
        y: Math.max(-100, Math.min(100, prev.y + dy * 0.8))
      }));

      touchStateRef.current.lastX = touch.clientX;
      touchStateRef.current.lastY = touch.clientY;

      // Gestural "Sweep to Harvest": Check if touch point sweeps over a ready building
      if (typeof document !== 'undefined') {
        const el = document.elementFromPoint(touch.clientX, touch.clientY);
        const buildingEl = el?.closest('[data-building-id]');
        if (buildingEl) {
          const bId = buildingEl.getAttribute('data-building-id');
          const isReady = buildingEl.getAttribute('data-harvest-ready') === 'true';
          if (bId && isReady && !touchStateRef.current.harvestedThisGesture.has(bId)) {
            touchStateRef.current.harvestedThisGesture.add(bId);
            onHarvest(bId);
            haptics.harvest();
          }
        }
      }
    }
  };

  const handleTouchEnd = () => {
    touchStateRef.current.isDragging = false;
    touchStateRef.current.initialDist = 0;
    setIsInteracting(false);
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="flex-1 w-full relative flex items-center justify-center overflow-hidden touch-none"
    >
      {/* Floating Recenter Citadel Compass Button */}
      {(scale !== 1 || pan.x !== 0 || pan.y !== 0) && (
        <button
          onClick={handleRecenter}
          className="absolute top-2 right-2 z-20 px-2.5 py-1 rounded-xl bg-stone-900/90 border border-amber-600/80 text-amber-200 text-xs font-mono font-bold shadow-xl backdrop-blur flex items-center gap-1.5 hover:bg-stone-800 active:scale-95 transition"
          title="Recenter Citadel Viewport"
        >
          <span className="text-sm">🧭</span>
          <span>Recenter</span>
        </button>
      )}

      {/* SVG Canvas with Pinch / Pan Transform */}
      <svg
        viewBox="0 0 540 330"
        className="w-full h-full max-h-[360px] cursor-pointer select-none transition-transform duration-100 ease-out"
        style={{
          transform: `scale(${scale}) translate(${pan.x / scale}px, ${pan.y / scale}px)`,
          transformOrigin: 'center center'
        }}
      >
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
                data-building-id={b.id}
                data-harvest-ready={isReadyToHarvest ? 'true' : 'false'}
                onClick={() => {
                  if (isReadyToHarvest) {
                    haptics.harvest();
                    onHarvest(b.id);
                  } else {
                    sounds.playCoin();
                    haptics.light();
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
