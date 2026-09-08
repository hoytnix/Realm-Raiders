import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  BUILDINGS,
  ISO_W,
  ISO_H,
  MAX_GRID_SIZE,
  gridToParchmentIso,
  gridToIso,
  rotateGridCoords,
  isPlotAnnexed,
  createDefaultGrid,
  toRomanTier,
  sounds
} from '../../constants/index.js';
import { haptics, triggerHaptic } from '../../utils/index.js';
import { generateNpcVillages } from '../../utils/rivals.js';
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
  stats = {},
  rotationAngle = 0,
  rotateKingdom,
  villagers = [],
  onDispatchSpy,
  onDeployRaid,
  playerRating = 60
}) {
  const containerRef = useRef(null);
  // Pinch-to-zoom and pan state
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isInteracting, setIsInteracting] = useState(false);

  // Opposing NPC Settlements state & inspected village flyout
  const [npcVillages] = useState(() => generateNpcVillages(playerRating || 60));
  const [activeNpcVillage, setActiveNpcVillage] = useState(null);

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

  // Keyboard shortcut 'R' to rotate kingdom 90 degrees
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        triggerHaptic('selection');
        haptics.light();
        sounds.playCoin();
        rotateKingdom?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rotateKingdom]);

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

  // Find coordinates for aqueducts dynamically using 4-way rotated coordinates
  const keepPlot = activeGrid.find(p => p.buildingId === 'keep');
  const wellPlot = activeGrid.find(p => p.buildingId === 'well');
  const granaryPlot = activeGrid.find(p => p.buildingId === 'granary');

  const keepRot = keepPlot
    ? rotateGridCoords(keepPlot.gx, keepPlot.gy, rotationAngle, MAX_GRID_SIZE)
    : rotateGridCoords(1, 1, rotationAngle, MAX_GRID_SIZE);
  const wellRot = wellPlot
    ? rotateGridCoords(wellPlot.gx, wellPlot.gy, rotationAngle, MAX_GRID_SIZE)
    : rotateGridCoords(2, 1, rotationAngle, MAX_GRID_SIZE);
  const granaryRot = granaryPlot
    ? rotateGridCoords(granaryPlot.gx, granaryPlot.gy, rotationAngle, MAX_GRID_SIZE)
    : rotateGridCoords(0, 1, rotationAngle, MAX_GRID_SIZE);

  const keepIso = gridToIso(keepRot.gxPrime, keepRot.gyPrime, 270, 48);
  const wellIso = gridToIso(wellRot.gxPrime, wellRot.gyPrime, 270, 48);
  const granaryIso = gridToIso(granaryRot.gxPrime, granaryRot.gyPrime, 270, 48);

  // Dynamic 4-Way Rotated Coordinates for all 6x6 grid positions
  const coords = [];
  for (let gx = 0; gx < MAX_GRID_SIZE; gx++) {
    for (let gy = 0; gy < MAX_GRID_SIZE; gy++) {
      const { gxPrime, gyPrime } = rotateGridCoords(gx, gy, rotationAngle, MAX_GRID_SIZE);
      const { x, y } = gridToIso(gxPrime, gyPrime, 270, 48);
      const isAnnexed = isPlotAnnexed(gx, gy, territoryTier);
      const isRoad = isAnnexed && ((gx === 1 && gy <= 3) || (gy === 1 && gx <= 3));
      coords.push({ gx, gy, gxPrime, gyPrime, x, y, isAnnexed, isRoad });
    }
  }
  // Depth sort ground tiles (Painter's Algorithm): Sort key: r' + c' (tie-break with r')
  coords.sort((a, b) => ((a.gxPrime + a.gyPrime) - (b.gxPrime + b.gyPrime)) || (a.gxPrime - b.gxPrime));

  // Sorted items within annexed territory (empty plots + constructed buildings)
  // Dynamic 4-Way Rotation & Painter's Algorithm depth sorting: Sort key: r' + c' (tie-break with r')
  const annexedPlots = activeGrid
    .filter(p => isPlotAnnexed(p.gx, p.gy, territoryTier))
    .map(plot => {
      const { gxPrime, gyPrime } = rotateGridCoords(plot.gx, plot.gy, rotationAngle, MAX_GRID_SIZE);
      const { x, y } = gridToIso(gxPrime, gyPrime, 270, 48);
      return {
        ...plot,
        gxPrime,
        gyPrime,
        x,
        y
      };
    })
    .sort((a, b) => ((a.gxPrime + a.gyPrime) - (b.gxPrime + b.gyPrime)) || (a.gxPrime - b.gxPrime));

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
        {coords.map(tile => {
          const { x, y, gx, gy, isAnnexed, isRoad } = tile;
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

        {/* Opposing NPC Settlements in Peripheral Cartography Sectors */}
        {npcVillages.map(village => {
          const { x, y } = village.position;
          const isHovered = activeNpcVillage?.id === village.id;
          const bannerColor = village.faction === 'dwarves' ? '#78350f' : village.faction === 'orcs' ? '#991b1b' : '#0284c7';

          return (
            <g
              key={village.id}
              onClick={() => {
                sounds.playDaggerThrust();
                triggerHaptic('medium');
                setActiveNpcVillage(village);
              }}
              className="cursor-pointer group"
            >
              {/* Outer Ground Base Diamond */}
              <polygon
                points={`
                  ${x},${y - 18}
                  ${x + 36},${y}
                  ${x},${y + 18}
                  ${x - 36},${y}
                `}
                fill={village.faction === 'orcs' ? 'rgba(127, 29, 29, 0.28)' : village.faction === 'dwarves' ? 'rgba(120, 53, 15, 0.28)' : 'rgba(3, 105, 161, 0.25)'}
                stroke={bannerColor}
                strokeWidth={isHovered ? '2.5' : '1.4'}
                strokeDasharray="4,2"
                className="transition-all duration-300 group-hover:stroke-amber-400"
              />

              {/* Exterior Sentry Patrol Ring Path */}
              <ellipse
                cx={x}
                cy={y + 3}
                rx="28"
                ry="13"
                fill="none"
                stroke="#8c6843"
                strokeWidth="0.8"
                strokeDasharray="2,3"
                opacity="0.5"
              />

              {/* Patrolling Sentry Animation */}
              <g className="animate-pulse">
                <circle cx={x - 16} cy={y + 2} r="3" fill="#292524" stroke={bannerColor} strokeWidth="0.8" />
                <text x={x - 16} y={y + 4.5} textAnchor="middle" fontSize="4.5" fill="#fef08a">⚔️</text>
              </g>

              {/* Stronghold Watchtower Base & Walls */}
              <polygon
                points={`
                  ${x - 14},${y - 22}
                  ${x},${y - 29}
                  ${x + 14},${y - 22}
                  ${x + 14},${y - 2}
                  ${x},${y + 5}
                  ${x - 14},${y - 2}
                `}
                fill={village.faction === 'dwarves' ? '#44403c' : village.faction === 'orcs' ? '#450a0a' : '#1e293b'}
                stroke="#1c1917"
                strokeWidth="1.2"
              />

              {/* Fluttering Faction Banner */}
              <line x1={x - 12} y1={y - 8} x2={x - 12} y2={y - 42} stroke="#78350f" strokeWidth="1.5" />
              <polygon
                points={`
                  ${x - 12},${y - 40}
                  ${x - 26},${y - 35}
                  ${x - 12},${y - 30}
                `}
                fill={bannerColor}
                stroke="#451a03"
                strokeWidth="0.8"
                className="animate-pulse"
              />

              {/* Watchtower Brazier with Animated Flame and Smoke */}
              <rect x={x + 7} y={y - 28} width="5" height="7" fill="#1c1917" />
              <circle cx={x + 9.5} cy={y - 30} r="3.5" fill="#f97316" className="animate-ping" opacity="0.7" />
              <circle cx={x + 9.5} cy={y - 30} r="2.2" fill="#fef08a" />
              <path
                d={`M ${x + 9.5} ${y - 33} Q ${x + 6} ${y - 42} ${x + 10} ${y - 50}`}
                stroke="#a8a29e"
                strokeWidth="1.2"
                strokeLinecap="round"
                fill="none"
                opacity="0.65"
                className="animate-pulse"
              />

              {/* Central Sigil Glyph */}
              <text
                x={x}
                y={y - 10}
                textAnchor="middle"
                fontSize="12"
                className="select-none pointer-events-none"
              >
                {village.sigil}
              </text>

              {/* Clan Crest Name Tag */}
              <rect
                x={x - 36}
                y={y + 11}
                width="72"
                height="13"
                rx="3.5"
                fill="#1c1917"
                stroke={bannerColor}
                strokeWidth="1"
                opacity="0.92"
              />
              <text
                x={x}
                y={y + 20.5}
                textAnchor="middle"
                fill="#f5ecd8"
                fontSize="6.8"
                fontWeight="bold"
                fontFamily="monospace"
                className="select-none pointer-events-none"
              >
                {village.name}
              </text>
            </g>
          );
        })}

        {/* Render Annexed Citadel Plots: Empty Foundations and Constructed Structures */}
        {annexedPlots.map(plot => {
          const { x, y } = plot;

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

          const level = plot.level || (buildings && buildings[b.id]) || 1;
          const isSelected = selectedBuildingId === plot.id || selectedBuildingId === b.id;
          const height = 24 + level * 7;

          // Harvest calculation
          const cycleDur = b.cycleDuration || 0;
          const timerVal = harvestTimers[plot.id] ?? harvestTimers[b.id] ?? 0;
          const progressRatio = cycleDur > 0 ? Math.min(1, timerVal / cycleDur) : 0;
          const isReadyToHarvest = cycleDur > 0 && progressRatio >= 1;
          const hasTroopLogistics = (technologies || []).includes('tech_troop_logistics');
          const isAutomated = hasTroopLogistics && (troops?.total ?? 20) >= 1 && cycleDur > 0 && b.baseYield;
          const plotWorkers = (villagers || []).filter(v => v.assignedBuildingId === plot.id);
          const isUnstaffed = cycleDur > 0 && b.baseYield && plotWorkers.length === 0;

          return (
            <g
              key={plot.id}
              data-building-id={plot.id}
              data-building-type={b.id}
              data-harvest-ready={isReadyToHarvest ? 'true' : 'false'}
              onClick={() => {
                if (isReadyToHarvest) {
                  haptics.harvest();
                  onHarvest(plot.id);
                } else {
                  sounds.playCoin();
                  haptics.light();
                  onSelectBuilding(plot.id);
                }
              }}
              onMouseEnter={(e) => {
                if (isSelected && canAfford) onHoverUpgrade?.(true);
                setHoveredBuilding({ id: b.id, plotId: plot.id, level, x: e.clientX, y: e.clientY });
              }}
              onMouseMove={(e) => {
                setHoveredBuilding(prev => prev ? { ...prev, plotId: plot.id, level, x: e.clientX, y: e.clientY } : { id: b.id, plotId: plot.id, level, x: e.clientX, y: e.clientY });
              }}
              onMouseLeave={() => {
                onHoverUpgrade?.(false);
                setHoveredBuilding(null);
              }}
              className="cursor-pointer group"
            >
              {/* Multi-Selection Glowing Halo */}
              {multiSelectedIds && (multiSelectedIds.includes(plot.id) || multiSelectedIds.includes(b.id)) && (
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
              {/* Ongoing Construction / Masonry Floating Banner */}
              {plot.isUpgrading && (
                <g className="animate-pulse pointer-events-none select-none">
                  <rect
                    x={x - 24}
                    y={y - height - (isReadyToHarvest ? 42 : 24)}
                    width="48"
                    height="14"
                    rx="3"
                    fill="#3f2314"
                    stroke="#f59e0b"
                    strokeWidth="1.2"
                  />
                  <text
                    x={x}
                    y={y - height - (isReadyToHarvest ? 32 : 14)}
                    textAnchor="middle"
                    fill="#fef08a"
                    fontSize="7.5"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    🧱 Tier {toRomanTier(plot.targetTier || level + 1)}
                  </text>
                </g>
              )}

              <rect
                x={x - (isAutomated ? 22 : 16)}
                y={y - height + 8}
                width={isAutomated ? 44 : 32}
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
                fontSize="8"
                fontWeight="bold"
                fontFamily="monospace"
              >
                {isAutomated ? `🛡️ ${toRomanTier(level)}` : `Tier ${toRomanTier(level)}`}
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

              {/* Unstaffed Worker Warning Floating Badge */}
              {isUnstaffed && !isReadyToHarvest && !plot.isUpgrading && (
                <g className="animate-pulse pointer-events-none select-none">
                  <rect
                    x={x - 36}
                    y={y - height - 24}
                    width="72"
                    height="15"
                    rx="4"
                    fill="#451a03"
                    stroke="#f59e0b"
                    strokeWidth="1.2"
                    className="shadow"
                  />
                  <text
                    x={x}
                    y={y - height - 13}
                    textAnchor="middle"
                    fill="#fef08a"
                    fontSize="7.5"
                    fontWeight="black"
                    fontFamily="monospace"
                  >
                    ⚠️ UNSTAFFED
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* Interactive Opposing Settlement Intel Flyout Modal */}
      {activeNpcVillage && (
        <div
          onClick={() => setActiveNpcVillage(null)}
          className="fixed inset-0 z-50 bg-black/60 md:backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-gradient-to-b from-[#f5ebd6] via-[#ebdcc1] to-[#dfcba6] border-2 border-[#8c6843] rounded-3xl shadow-2xl p-4 text-[#442813] font-serif space-y-3"
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#8c6843]/40 pb-2.5">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl p-2 rounded-2xl bg-[#dfcba6] border border-[#8c6843] shadow-inner">
                  {activeNpcVillage.sigil}
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-black uppercase text-[#3f2314]">
                      {activeNpcVillage.name}
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-[#6b4a2e]">
                    {activeNpcVillage.clan} • {activeNpcVillage.quadrant} Sector
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  sounds.playCoin();
                  haptics.light();
                  setActiveNpcVillage(null);
                }}
                className="w-6 h-6 rounded-full bg-[#dfcba6] hover:bg-[#cbb38b] border border-[#8c6843] text-xs font-bold text-[#442813] flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Description */}
            <p className="text-[10.5px] leading-relaxed text-[#6b4a2e] bg-[#dfcba6]/50 p-2.5 rounded-xl border border-[#bfa379]/50">
              {activeNpcVillage.description}
            </p>

            {/* Garrison Readiness & Defense Power */}
            <div className="bg-[#dfcba6] p-2.5 rounded-xl border border-[#bfa379] space-y-1.5 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-[#6b4a2e]">Garrison Intel:</span>
                <span className="text-emerald-900 font-bold text-[10.5px]">{activeNpcVillage.garrisonReady}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#442813]">
                <span>Manned By:</span>
                <span className="font-bold">{activeNpcVillage.garrison}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#442813]">
                <span>Defense Power:</span>
                <span className="font-bold text-red-900">🛡️ {activeNpcVillage.defensePower} (Rating: {activeNpcVillage.rating})</span>
              </div>
            </div>

            {/* Scouted Stockpiles */}
            <div className="space-y-1">
              <span className="text-[9px] font-mono uppercase font-bold text-[#6b4a2e]">
                Scouted Stockpiles (Plunder Potential):
              </span>
              <div className="grid grid-cols-5 gap-1 text-[10px] font-mono text-center">
                <div className="bg-[#ebdcc1] p-1 rounded-lg border border-[#bfa379]">
                  <span className="block">🪙</span>
                  <span className="font-bold text-[#442813]">{activeNpcVillage.lootPool.gold}</span>
                </div>
                <div className="bg-[#ebdcc1] p-1 rounded-lg border border-[#bfa379]">
                  <span className="block">🌾</span>
                  <span className="font-bold text-[#442813]">{activeNpcVillage.lootPool.food}</span>
                </div>
                <div className="bg-[#ebdcc1] p-1 rounded-lg border border-[#bfa379]">
                  <span className="block">💧</span>
                  <span className="font-bold text-[#442813]">{activeNpcVillage.lootPool.water}</span>
                </div>
                <div className="bg-[#ebdcc1] p-1 rounded-lg border border-[#bfa379]">
                  <span className="block">🪵</span>
                  <span className="font-bold text-[#442813]">{activeNpcVillage.lootPool.wood}</span>
                </div>
                <div className="bg-[#ebdcc1] p-1 rounded-lg border border-[#bfa379]">
                  <span className="block">🪨</span>
                  <span className="font-bold text-[#442813]">{activeNpcVillage.lootPool.stone}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1 font-mono">
              <button
                onClick={() => {
                  onDispatchSpy?.(activeNpcVillage);
                  sounds.playDaggerThrust();
                  triggerHaptic('heavy');
                  haptics.heavy();
                }}
                className="flex-1 py-2 px-2 rounded-xl bg-[#dfcba6] hover:bg-[#d5be97] border border-[#8c6843] text-[#3f2314] font-bold text-xs transition flex items-center justify-center gap-1.5 active:scale-95 shadow cursor-pointer"
              >
                <span>🕵️</span>
                <span>Dispatch Spy</span>
              </button>

              <button
                onClick={() => {
                  sounds.playWarHorn();
                  triggerHaptic('heavy');
                  haptics.heavy();
                  setActiveNpcVillage(null);
                  onDeployRaid?.(activeNpcVillage);
                }}
                className="flex-1 py-2 px-2 rounded-xl bg-gradient-to-r from-red-800 to-rose-900 hover:brightness-110 text-amber-100 font-black text-xs transition flex items-center justify-center gap-1.5 active:scale-95 shadow border border-red-700 cursor-pointer"
              >
                <span>⚔️</span>
                <span>Deploy Raid</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rich Desktop Hover Preview Tooltip */}
      {hoveredBuilding && (
        <BuildingHoverTooltip
          buildingId={hoveredBuilding.id}
          level={hoveredBuilding.level || buildings[hoveredBuilding.id] || 1}
          resources={resources}
          technologies={technologies}
          troops={troops || { total: 20 }}
          laborEfficiency={stats?.laborEfficiency || 1.0}
          faction={faction}
          mousePos={{ x: hoveredBuilding.x, y: hoveredBuilding.y }}
        />
      )}

      {/* Floating Map Control Cluster: Circular Compass Rose 4-Way Rotation, Zoom In, Zoom Out, Recenter */}
      <div className="absolute top-2.5 right-2.5 z-30 flex flex-col items-center gap-1.5 pointer-events-auto select-none">
        {/* Circular Compass Rose Button (↺ / ↻) with Smooth Needle Animation */}
        <button
          onClick={() => {
            triggerHaptic('selection');
            haptics.light();
            sounds.playCoin();
            rotateKingdom?.();
          }}
          className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f6ebd6] via-[#ebdcc1] to-[#dfcba6] border-2 border-[#8c6843] shadow-[0_4px_14px_rgba(0,0,0,0.55)] flex flex-col items-center justify-center text-[#442813] hover:brightness-110 active:scale-90 transition group cursor-pointer"
          title={`Rotate Kingdom Grid 90° (${rotationAngle}°) [R]`}
          aria-label="Rotate Citadel Grid"
        >
          <div
            className="w-5 h-5 flex items-center justify-center transition-transform duration-500 ease-out"
            style={{ transform: `rotate(${rotationAngle}deg)` }}
          >
            <span className="text-sm leading-none select-none">🧭</span>
          </div>
          <span className="text-[7.5px] font-mono font-black text-[#5c3e23] -mt-0.5 leading-none">
            {rotationAngle === 0 ? '0°' : `${rotationAngle}°`}
          </span>
        </button>

        {/* Zoom In Button */}
        <button
          onClick={() => {
            triggerHaptic('selection');
            haptics.light();
            setScale(s => Math.min(2.5, +(s + 0.2).toFixed(2)));
          }}
          className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#ebdcc1] to-[#dfcba6] border border-[#8c6843] shadow-md flex items-center justify-center text-sm font-black text-[#442813] hover:brightness-105 active:scale-90 transition cursor-pointer"
          title="Zoom In (+)"
          aria-label="Zoom In"
        >
          +
        </button>

        {/* Zoom Out Button */}
        <button
          onClick={() => {
            triggerHaptic('selection');
            haptics.light();
            setScale(s => Math.max(0.6, +(s - 0.2).toFixed(2)));
          }}
          className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#ebdcc1] to-[#dfcba6] border border-[#8c6843] shadow-md flex items-center justify-center text-sm font-black text-[#442813] hover:brightness-105 active:scale-90 transition cursor-pointer"
          title="Zoom Out (−)"
          aria-label="Zoom Out"
        >
          −
        </button>
      </div>
    </div>
  );
}
