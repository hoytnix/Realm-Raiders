import React from 'react';
import { BUILDINGS, EMPTY_PLOT, WEATHER_CONDITIONS } from '../../constants/index.js';
import { CitadelSvgGrid } from './CitadelSvgGrid.jsx';
import { BuildingInspector } from './BuildingInspector.jsx';
import { SovereignLedger } from './SovereignLedger.jsx';

export function ParchmentCitadelMap({
  buildings,
  harvestTimers,
  grid,
  territoryTier = 1,
  troops = { total: 20, maxCapacity: 30 },
  technologies = [],
  onHarvest,
  onHarvestAll,
  selectedBuildingId,
  onSelectBuilding,
  onUpgradeBuilding,
  onConstructBuilding,
  onExpandTerritory,
  onTrainTroops,
  onResearchTechnology,
  resources,
  faction,
  stats,
  timeState,
  inkPulseTick,
  stampingDecree,
  onHoverUpgrade,
  multiSelectedIds = [],
  onMultiSelectBuildings,
  onClearMultiSelect,
  onBulkUpgrade,
  activeLedgerTab = 'structure',
  setActiveLedgerTab,
  battleLogs = []
}) {
  const selectedPlot = (grid || []).find(p => p.id === selectedBuildingId || p.buildingId === selectedBuildingId);
  const isEmptyPlot = selectedPlot ? !selectedPlot.buildingId : (selectedBuildingId?.startsWith('plot-') || false);
  const selectedDef = selectedPlot?.buildingId ? (BUILDINGS[selectedPlot.buildingId] || BUILDINGS.keep) : (isEmptyPlot ? EMPTY_PLOT : (BUILDINGS[selectedBuildingId] || BUILDINGS.keep));
  const currentLvl = selectedPlot ? (selectedPlot.buildingId ? (selectedPlot.level || 1) : 0) : (isEmptyPlot ? 0 : (buildings[selectedBuildingId] || 1));
  const discount = faction?.id === 'humans' ? 0.5 : 1.0;

  const costGold = isEmptyPlot ? 0 : Math.round((selectedDef.baseCost?.gold || 0) * Math.pow(selectedDef.costMult || 1.5, currentLvl - 1) * discount);
  const costWood = isEmptyPlot ? 0 : Math.round((selectedDef.baseCost?.wood || 0) * Math.pow(selectedDef.costMult || 1.5, currentLvl - 1) * discount);
  const costStone = isEmptyPlot ? 0 : Math.round((selectedDef.baseCost?.stone || 0) * Math.pow(selectedDef.costMult || 1.5, currentLvl - 1) * discount);

  const canAfford =
    !isEmptyPlot &&
    resources.gold >= costGold &&
    resources.wood >= costWood &&
    resources.stone >= costStone;

  const weatherCond = WEATHER_CONDITIONS[timeState?.weather || 'clear'] || WEATHER_CONDITIONS.clear;

  // Calculate ready harvests
  const readyCount = (grid && Array.isArray(grid) && grid.some(p => p.buildingId))
    ? grid.filter(p => {
        if (!p.buildingId) return false;
        const bDef = BUILDINGS[p.buildingId];
        if (!bDef || !bDef.cycleDuration) return false;
        const prog = harvestTimers[p.id] ?? harvestTimers[p.buildingId] ?? 0;
        return prog >= bDef.cycleDuration;
      }).length
    : Object.keys(BUILDINGS).filter(bId => {
        const bDef = BUILDINGS[bId];
        return bDef && bDef.cycleDuration && (harvestTimers[bId] || 0) >= bDef.cycleDuration;
      }).length;

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full w-full relative overflow-hidden">
      {/* -----------------------------------------------------------------
          LEFT PANE (70% on Desktop, 100% on Mobile): Living Cartography Map
          ----------------------------------------------------------------- */}
      <div className="flex-1 md:w-[70%] flex flex-col h-full relative overflow-hidden">
        {/* Weather Dynamic Tint & Precipitation Overlay */}
        <div
          className="absolute inset-0 pointer-events-none transition-colors duration-1000 z-10 overflow-hidden"
          style={{
            backgroundColor:
              timeState.hour < 5 || timeState.hour >= 21
                ? 'rgba(15, 23, 42, 0.40)'
                : timeState.hour >= 18
                ? 'rgba(180, 83, 9, 0.20)'
                : weatherCond.tint
          }}
        >
          {/* Visual Weather Particles */}
          {(timeState.weather === 'downpour' || timeState.weather === 'amber_rain' || timeState.weather === 'thunderstorm') && (
            <div className="absolute inset-0 opacity-35 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:14px_14px] animate-pulse" />
          )}
          {(timeState.weather === 'blizzard' || timeState.weather === 'heavy_snow' || timeState.weather === 'flurries') && (
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:20px_20px] animate-ping" />
          )}
          {(timeState.weather === 'heatwave' || timeState.weather === 'radiant_sun') && (
            <div className="absolute inset-0 bg-gradient-to-t from-amber-600/10 via-transparent to-orange-500/10 animate-pulse" />
          )}
          {(timeState.weather === 'mist' || timeState.weather === 'overcast') && (
            <div className="absolute inset-0 bg-stone-500/10" />
          )}
          {timeState.weather === 'autumn_breeze' && (
            <div className="absolute inset-0 bg-gradient-to-r from-amber-700/5 via-transparent to-orange-700/5" />
          )}
        </div>

        {/* Floating "Claim All" Action Seal Button when crops are ready */}
        {readyCount > 0 && onHarvestAll && (
          <button
            onClick={() => onHarvestAll(stats.caps, faction)}
            className="hidden md:flex absolute top-2 left-2 z-20 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-800 to-green-700 hover:brightness-110 active:scale-95 border-2 border-emerald-400 text-emerald-100 text-xs font-mono font-black shadow-2xl items-center gap-1.5 animate-bounce transition"
            title="Claim all ripe yields immediately [Space]"
          >
            <span className="text-base">🌾</span>
            <span>Claim All ({readyCount})</span>
            <kbd className="hidden sm:inline-block px-1 py-0.2 rounded bg-emerald-950/80 text-[9px] text-emerald-300 font-mono border border-emerald-600/60">
              SPACE
            </kbd>
          </button>
        )}

        {/* The 2.5D Isometric SVG Living Ink Canvas */}
        <CitadelSvgGrid
          buildings={buildings}
          harvestTimers={harvestTimers}
          grid={grid}
          territoryTier={territoryTier}
          technologies={technologies}
          troops={troops}
          onHarvest={onHarvest}
          selectedBuildingId={selectedBuildingId}
          onSelectBuilding={onSelectBuilding}
          canAfford={canAfford}
          inkPulseTick={inkPulseTick}
          onHoverUpgrade={onHoverUpgrade}
          multiSelectedIds={multiSelectedIds}
          onMultiSelectBuildings={onMultiSelectBuildings}
          onClearMultiSelect={onClearMultiSelect}
          resources={resources}
          faction={faction}
          stats={stats}
        />

        {/* Mobile-Only Collapsible Bottom Sheet */}
        <div className="md:hidden">
          <BuildingInspector
            selectedDef={selectedDef}
            currentLvl={currentLvl}
            costGold={costGold}
            costWood={costWood}
            costStone={costStone}
            canAfford={canAfford}
            resources={resources}
            stampingDecree={stampingDecree}
            onUpgradeBuilding={onUpgradeBuilding}
            selectedBuildingId={selectedBuildingId}
            onHoverUpgrade={onHoverUpgrade}
            territoryTier={territoryTier}
            troops={troops}
            stats={stats}
            technologies={technologies}
            onConstructBuilding={onConstructBuilding}
            onExpandTerritory={onExpandTerritory}
            onTrainTroops={onTrainTroops}
            onResearchTechnology={onResearchTechnology}
          />
        </div>
      </div>

      {/* -----------------------------------------------------------------
          RIGHT PANE (30% on Desktop, Hidden on Mobile): Sovereign Ledger Folio
          ----------------------------------------------------------------- */}
      <div className="hidden md:flex md:w-[30%] h-full flex-col border-l-2 border-[#8c6843]/60 bg-[#eedebf] overflow-hidden shadow-[-6px_0_18px_rgba(0,0,0,0.15)] z-20">
        <SovereignLedger
          selectedBuildingId={selectedBuildingId}
          multiSelectedIds={multiSelectedIds}
          onClearMultiSelect={onClearMultiSelect}
          grid={grid}
          buildings={buildings}
          resources={resources}
          troops={troops}
          stats={stats}
          technologies={technologies}
          territoryTier={territoryTier}
          stampingDecree={stampingDecree}
          onUpgradeBuilding={onUpgradeBuilding}
          onBulkUpgrade={onBulkUpgrade}
          onConstructBuilding={onConstructBuilding}
          onExpandTerritory={onExpandTerritory}
          onTrainTroops={onTrainTroops}
          onResearchTechnology={onResearchTechnology}
          activeLedgerTab={activeLedgerTab}
          setActiveLedgerTab={setActiveLedgerTab}
          battleLogs={battleLogs}
        />
      </div>
    </div>
  );
}
