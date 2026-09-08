import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  BUILDINGS,
  ISO_W,
  ISO_H,
  MAX_GRID_SIZE,
  gridToParchmentIso,
  isPlotAnnexed,
  createDefaultGrid,
  sounds
} from '../../constants/index.js';
import { haptics } from '../../utils/index.js';
import { BuildingHoverTooltip } from './BuildingHoverTooltip.jsx';

export function CitadelSvgGrid({
  buildings = {},
  harvestTimers = {},
  grid = null,
  territoryTier = 1,
  technologies = [],
  troops = null,
  onHarvest,
  selectedBuildingId,
  onSelectBuilding,
  canAfford,
  inkPulseTick,
  onHoverUpgrade,
  multiSelectedIds = [],
  onMultiSelectBuildings,
  onClearMultiSelect,
  resources = {},
  faction = null,
  stats = {}
}) {
  const containerRef = useRef(null);
  // Pinch-to-zoom and pan state
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isInteracting, setIsInteracting] = useState(false);

  // Desktop Hover preview tooltip state
  const [hoveredBuilding, setHoveredBuilding] = useState(null);

  // Desktop Marquee selection state
  const [marqueeBox, setMarqueeBox] = useState(null);
  const marqueeRef = useRef(null);

  // Desktop Mouse drag-pan tracking ref
  const mousePanRef = useRef({
    isPanning: false,
    startX: 0,
    startY: 0,
    initialPanX: 0,
    initialPanY: 0
  });

  // Active grid tiles
  const activeGrid = grid && Array.isArray(grid) && grid.length > 0 ? grid : createDefaultGrid();

  // Touch tracking refs
  const touchStateRef = useRef({
    initialDist: 0,
    initialScale: 1,
    lastX: 0,
    lastY: 0,
    isDragging: false,
    harvestedThisGesture: new Set()
  });

  const handleSnapToKeep = useCallback(() => {
    haptics.light();
    sounds.playCoin();
    setScale(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Desktop Mouse Wheel Zoom Handler
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const zoomDelta = e.deltaY < 0 ? 0.12 : -0.12;
    setScale(prev => Math.max(0.6, Math.min(2.5, +(prev + zoomDelta).toFixed(2))));
  }, []);

  // Attach non-passive wheel listener to prevent page scrolling while zooming map
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // Desktop Mouse Down: Pan (middle/right click or space+left) or Marquee Selection (left click on ground)
  const handleMouseDown = (e) => {
    // If middle click (button 1), right click (button 2), or space key held: initiate pan
    if (e.button === 1 || e.button === 2 || e.spaceKey) {
      e.preventDefault();
      mousePanRef.current.isPanning = true;
      mousePanRef.current.startX = e.clientX;
      mousePanRef.current.startY = e.clientY;
      mousePanRef.current.initialPanX = pan.x;
      mousePanRef.current.initialPanY = pan.y;
      setIsInteracting(true);
      return;
    }

    // If left click on background / ground, start marquee selection box
    if (e.button === 0) {
      const target = e.target;
      // If clicking directly on an interactable building or button, do not start marquee
      if (target.closest('[data-building-id]') || target.closest('button')) {
        return;
      }
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const relX = e.clientX - rect.left;
      const relY = e.clientY - rect.top;
      marqueeRef.current = {
        startX: relX,
        startY: relY,
        curX: relX,
        curY: relY,
        screenStartX: e.clientX,
        screenStartY: e.clientY
      };
      setMarqueeBox({
        x: relX,
        y: relY,
        w: 0,
        h: 0
      });
    }
  };

  // Desktop Mouse Move: Handle drag panning or updating marquee selection
  const handleMouseMove = (e) => {
    // Handle Mouse Panning
    if (mousePanRef.current.isPanning) {
      const dx = e.clientX - mousePanRef.current.startX;
      const dy = e.clientY - mousePanRef.current.startY;
      setPan({
        x: Math.max(-260, Math.min(260, mousePanRef.current.initialPanX + dx)),
        y: Math.max(-180, Math.min(180, mousePanRef.current.initialPanY + dy))
      });
      return;
    }

    // Handle Marquee Dragging
    if (marqueeRef.current) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const relX = e.clientX - rect.left;
      const relY = e.clientY - rect.top;
      marqueeRef.current.curX = relX;
      marqueeRef.current.curY = relY;

      const x = Math.min(marqueeRef.current.startX, relX);
      const y = Math.min(marqueeRef.current.startY, relY);
      const w = Math.abs(relX - marqueeRef.current.startX);
      const h = Math.abs(relY - marqueeRef.current.startY);

      setMarqueeBox({ x, y, w, h });
    }
  };

  // Desktop Mouse Up: Conclude panning or select buildings in marquee box
  const handleMouseUp = (e) => {
    if (mousePanRef.current.isPanning) {
      mousePanRef.current.isPanning = false;
      setIsInteracting(false);
    }

    if (marqueeRef.current) {
      const screenStartX = marqueeRef.current.screenStartX;
      const screenStartY = marqueeRef.current.screenStartY;
      const dist = Math.hypot(e.clientX - screenStartX, e.clientY - screenStartY);

      if (dist > 15 && containerRef.current) {
        // Find buildings within the marquee rectangle
        const minX = Math.min(screenStartX, e.clientX);
        const maxX = Math.max(screenStartX, e.clientX);
        const minY = Math.min(screenStartY, e.clientY);
        const maxY = Math.max(screenStartY, e.clientY);

        const buildingElements = containerRef.current.querySelectorAll('[data-building-id]');
        const enclosedIds = [];
        buildingElements.forEach(el => {
          const bRect = el.getBoundingClientRect();
          const centerX = bRect.left + bRect.width / 2;
          const centerY = bRect.top + bRect.height / 2;
          if (centerX >= minX && centerX <= maxX && centerY >= minY && centerY <= maxY) {
            const bId = el.getAttribute('data-building-id');
            if (bId) enclosedIds.push(bId);
          }
        });

        if (enclosedIds.length > 0) {
          sounds.playCoin();
          haptics.light();
          onMultiSelectBuildings?.(enclosedIds);
        }
      } else if (dist <= 6) {
        // Minimal drag / click on ground clears multi-selection
        onClearMultiSelect?.();
      }

      marqueeRef.current = null;
      setMarqueeBox(null);
    }
  };

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
        const newScale = Math.max(0.6, Math.min(2.5, touchStateRef.current.initialScale * factor));
        setScale(newScale);
      }
    } else if (e.touches.length === 1 && touchStateRef.current.isDragging) {
      const touch = e.touches[0];
      const dx = touch.clientX - touchStateRef.current.lastX;
      const dy = touch.clientY - touchStateRef.current.lastY;

      // Pan translation (damped)
      setPan(prev => ({
        x: Math.max(-260, Math.min(260, prev.x + dx * 0.8)),
        y: Math.max(-180, Math.min(180, prev.y + dy * 0.8))
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

  // Find coordinates for aqueducts dynamically
  const keepPlot = activeGrid.find(p => p.buildingId === 'keep');
  const wellPlot = activeGrid.find(p => p.buildingId === 'well');
  const granaryPlot = activeGrid.find(p => p.buildingId === 'granary');

  const keepIso = keepPlot ? gridToParchmentIso(keepPlot.gx, keepPlot.gy, 270, 48) : gridToParchmentIso(1, 1, 270, 48);
  const wellIso = wellPlot ? gridToParchmentIso(wellPlot.gx, wellPlot.gy, 270, 48) : gridToParchmentIso(2, 1, 270, 48);
  const granaryIso = granaryPlot ? gridToParchmentIso(granaryPlot.gx, granaryPlot.gy, 270, 48) : gridToParchmentIso(0, 1, 270, 48);

  // Coordinate arrays for all 6x6 grid positions
  const coords = [];
  for (let gx = 0; gx < MAX_GRID_SIZE; gx++) {
    for (let gy = 0; gy < MAX_GRID_SIZE; gy++) {
      coords.push({ gx, gy });
    }
  }

  // Sorted items within annexed territory (empty plots + constructed buildings)
  const annexedPlots = activeGrid
    .filter(p => isPlotAnnexed(p.gx, p.gy, territoryTier))
    .sort((a, b) => (a.gx + a.gy) - (b.gx + b.gy));

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onContextMenu={(e) => e.preventDefault()}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="flex-1 w-full h-full relative flex items-center justify-center overflow-hidden touch-none select-none"
    >
      {/* Marquee Drag Selection Box Overlay */}
      {marqueeBox && (
        <div
          className="absolute pointer-events-none border-2 border-amber-600 bg-amber-500/20 rounded z-30"
          style={{
            left: `${marqueeBox.x}px`,
            top: `${marqueeBox.y}px`,
            width: `${marqueeBox.w}px`,
            height: `${marqueeBox.h}px`,
            borderStyle: 'dashed'
          }}
        />
      )}

      {/* Gilded Compass Rose & Snap to Royal Keep */}
      <div className="absolute top-3 right-3 z-20 flex flex-col items-center gap-0.5">
        <button
          onClick={handleSnapToKeep}
          className="group relative w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-[#3a2213] via-[#5c3a21] to-[#2b170c] border-2 border-amber-500/80 shadow-2xl flex items-center justify-center text-amber-200 hover:scale-105 active:scale-95 transition backdrop-blur"
          title="Snap to Royal Keep (Recenter Citadel Map)"
        >
          <div className="absolute inset-0 rounded-full border border-amber-300/40 group-hover:animate-ping pointer-events-none opacity-30" />
          <span className="text-base sm:text-xl group-hover:rotate-45 transition-transform duration-300">🧭</span>
          <span className="absolute -top-1 font-mono text-[8px] font-black text-amber-400">N</span>
        </button>
        <span className="text-[8px] sm:text-[9px] font-mono font-bold text-[#442813] bg-[#ebdcc1]/90 px-1 py-0.2 rounded shadow border border-[#8c6843]/60 select-none">
          Snap Keep
        </span>
      </div>

      {/* SVG Canvas with Pinch / Pan Transform */}
      <svg
        viewBox="0 0 540 330"
        className="w-full h-full max-h-[360px] md:max-h-full cursor-pointer select-none transition-transform duration-100 ease-out"
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
          <linearGradient id="parchmentFog" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#c8b28f" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#b59c77" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="roofGoldInk" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>
        </defs>

        {/* Isometric Ground Grid Lines (Annexed Plots & Unpurchased Fog Borders) */}
        {coords.map(({ gx, gy }) => {
          const { x, y } = gridToParchmentIso(gx, gy, 270, 48);
          const isAnnexed = isPlotAnnexed(gx, gy, territoryTier);
          const isRoad = isAnnexed && ((gx === 1 && gy <= 3) || (gy === 1 && gx <= 3));

          return (
            <g key={`tile-${gx}-${gy}`}>
              <polygon
                points={`
                  ${x},${y - ISO_H / 2}
                  ${x + ISO_W / 2},${y}
                  ${x},${y + ISO_H / 2}
                  ${x - ISO_W / 2},${y}
                `}
                fill={
                  !isAnnexed
                    ? 'url(#parchmentFog)'
                    : isRoad
                    ? '#d5be97'
                    : 'url(#parchmentGround)'
                }
                stroke={isAnnexed ? '#8c6843' : '#a88d6a'}
                strokeWidth={isAnnexed ? '1.2' : '0.9'}
                strokeDasharray={!isAnnexed ? '3,3' : isRoad ? '2,2' : 'none'}
                opacity={isAnnexed ? 1 : 0.65}
                onClick={() => {
                  if (!isAnnexed) {
                    sounds.playCoin();
                    haptics.light();
                    onSelectBuilding('keep'); // Guide player to Keep to annex
                  }
                }}
              />

              {/* Fog-of-War Lock Glyphs on Un-annexed Border Tiles */}
              {!isAnnexed && (
                <text
                  x={x}
                  y={y + 4}
                  textAnchor="middle"
                  fill="#78553d"
                  fontSize="11"
                  opacity="0.45"
                  className="select-none pointer-events-none"
                >
                  🔒
                </text>
              )}
            </g>
          );
        })}

        {/* Animated Aqueduct Pulses connecting Spring Well to Keep and Granary */}
        {wellPlot && (
          <>
            <line
              x1={wellIso.x}
              y1={wellIso.y}
              x2={keepIso.x}
              y2={keepIso.y}
              stroke="#0284c7"
              strokeWidth="2"
              strokeDasharray="4,6"
              strokeDashoffset={-inkPulseTick}
              opacity="0.8"
            />
            <line
              x1={wellIso.x}
              y1={wellIso.y}
              x2={granaryIso.x}
              y2={granaryIso.y}
              stroke="#0284c7"
              strokeWidth="2"
              strokeDasharray="4,6"
              strokeDashoffset={-inkPulseTick}
              opacity="0.8"
            />
          </>
        )}

        {/* Render Annexed Citadel Plots: Empty Foundations and Constructed Structures */}
        {annexedPlots.map(plot => {
          const { x, y } = gridToParchmentIso(plot.gx, plot.gy, 270, 48);

          // CASE 1: EMPTY FOUNDATION PLOT
          if (!plot.buildingId) {
            const isSelected = selectedBuildingId === plot.id;
            return (
              <g
                key={plot.id}
                data-plot-id={plot.id}
                onClick={() => {
                  sounds.playCoin();
                  haptics.light();
                  onSelectBuilding(plot.id);
                }}
                className="cursor-pointer group"
              >
                {/* Dashed Foundation Diamond Marker */}
                <polygon
                  points={`
                    ${x},${y - ISO_H / 2.5}
                    ${x + ISO_W / 2.5},${y}
                    ${x},${y + ISO_H / 2.5}
                    ${x - ISO_W / 2.5},${y}
                  `}
                  fill={isSelected ? 'rgba(217, 119, 6, 0.28)' : 'rgba(140, 104, 67, 0.12)'}
                  stroke={isSelected ? '#d97706' : '#8c6843'}
                  strokeWidth={isSelected ? '2' : '1.2'}
                  strokeDasharray="4,4"
                  className="transition group-hover:fill-amber-600/20"
                />

                {/* Stone Foundation Center Marker "+" */}
                <text
                  x={x}
                  y={y + 4}
                  textAnchor="middle"
                  fill={isSelected ? '#78350f' : '#8c6843'}
                  fontSize="13"
                  fontWeight="black"
                  className="select-none pointer-events-none"
                >
                  +
                </text>

                {/* Subtle Plot Coordinate Stamp */}
                <text
                  x={x}
                  y={y - 9}
                  textAnchor="middle"
                  fill={isSelected ? '#78350f' : '#8c6843'}
                  fontSize="8"
                  fontWeight="bold"
                  letterSpacing="0.4"
                  opacity={isSelected ? '1' : '0.65'}
                  className="select-none pointer-events-none font-mono"
                >
                  PLOT
                </text>
              </g>
            );
          }

          // CASE 2: CONSTRUCTED 2.5D BUILDING
          const b = BUILDINGS[plot.buildingId];
          if (!b) return null;

          const level = buildings[b.id] || 1;
          const isSelected = selectedBuildingId === b.id;
          const height = 24 + level * 7;

          // Harvest calculation
          const cycleDur = b.cycleDuration || 0;
          const timerVal = harvestTimers[b.id] || 0;
          const progressRatio = cycleDur > 0 ? Math.min(1, timerVal / cycleDur) : 0;
          const isReadyToHarvest = cycleDur > 0 && progressRatio >= 1;
          const hasTroopLogistics = (technologies || []).includes('tech_troop_logistics');
          const isAutomated = hasTroopLogistics && (troops?.total ?? 20) >= 1 && cycleDur > 0 && b.baseYield;

          return (
            <g
              key={plot.id}
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
              onMouseEnter={(e) => {
                if (isSelected && canAfford) onHoverUpgrade?.(true);
                setHoveredBuilding({ id: b.id, x: e.clientX, y: e.clientY });
              }}
              onMouseMove={(e) => {
                setHoveredBuilding(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : { id: b.id, x: e.clientX, y: e.clientY });
              }}
              onMouseLeave={() => {
                onHoverUpgrade?.(false);
                setHoveredBuilding(null);
              }}
              className="cursor-pointer group"
            >
              {/* Multi-Selection Glowing Halo */}
              {multiSelectedIds && multiSelectedIds.includes(b.id) && (
                <ellipse
                  cx={x}
                  cy={y}
                  rx={ISO_W / 2 + 6}
                  ry={ISO_H / 2 + 3}
                  fill="rgba(245, 158, 11, 0.22)"
                  stroke="#d97706"
                  strokeWidth="2.5"
                  strokeDasharray="5,3"
                  opacity="0.95"
                />
              )}

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
                  ${x + ISO_W / 2.5},${y + ISO_H / 3 - height}
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
                x={x - (isAutomated ? 18 : 14)}
                y={y - height + 8}
                width={isAutomated ? 36 : 28}
                height="12"
                rx="3"
                fill="#3f2314"
                stroke={isAutomated ? '#22c55e' : '#eab308'}
                strokeWidth={isAutomated ? '1.5' : '1'}
              />
              <text
                x={x}
                y={y - height + 17}
                textAnchor="middle"
                fill={isAutomated ? '#86efac' : '#fef08a'}
                fontSize="8.5"
                fontWeight="bold"
                fontFamily="monospace"
              >
                {isAutomated ? `🛡️ T${level}` : `T${level}`}
              </text>

              {/* Click-to-Collect Floating Ink Banner */}
              {isReadyToHarvest && (
                <g className="animate-bounce">
                  <rect
                    x={x - 38}
                    y={y - height - 24}
                    width="76"
                    height="16"
                    rx="4"
                    fill={isAutomated ? '#065f46' : '#15803d'}
                    stroke={isAutomated ? '#34d399' : '#86efac'}
                    strokeWidth="1.2"
                    className="shadow"
                  />
                  <text
                    x={x}
                    y={y - height - 12}
                    textAnchor="middle"
                    fill="#f0fdf4"
                    fontSize="8.5"
                    fontWeight="black"
                    fontFamily="sans-serif"
                  >
                    {isAutomated ? 'GARRISON AUTO 🛡️' : 'CLAIM YIELD!'}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* Rich Desktop Hover Preview Tooltip */}
      {hoveredBuilding && (
        <BuildingHoverTooltip
          buildingId={hoveredBuilding.id}
          level={buildings[hoveredBuilding.id] || 1}
          resources={resources}
          technologies={technologies}
          troops={troops || { total: 20 }}
          laborEfficiency={stats?.laborEfficiency || 1.0}
          faction={faction}
          mousePos={{ x: hoveredBuilding.x, y: hoveredBuilding.y }}
        />
      )}
    </div>
  );
}
