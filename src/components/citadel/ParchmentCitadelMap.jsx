import React from 'react';
import { BUILDINGS, WEATHER_CONDITIONS } from '../../constants/index.js';
import { CitadelSvgGrid } from './CitadelSvgGrid.jsx';
import { BuildingInspector } from './BuildingInspector.jsx';

export function ParchmentCitadelMap({
  buildings,
  harvestTimers,
  onHarvest,
  selectedBuildingId,
  onSelectBuilding,
  onUpgradeBuilding,
  resources,
  faction,
  stats,
  timeState,
  inkPulseTick,
  stampingDecree,
  onHoverUpgrade
}) {
  const selectedDef = BUILDINGS[selectedBuildingId] || BUILDINGS.keep;
  const currentLvl = buildings[selectedBuildingId] || 1;
  const discount = faction?.id === 'humans' ? 0.5 : 1.0;

  const costGold = Math.round(selectedDef.baseCost.gold * Math.pow(selectedDef.costMult, currentLvl - 1) * discount);
  const costWood = Math.round(selectedDef.baseCost.wood * Math.pow(selectedDef.costMult, currentLvl - 1) * discount);
  const costStone = Math.round(selectedDef.baseCost.stone * Math.pow(selectedDef.costMult, currentLvl - 1) * discount);

  const canAfford =
    resources.gold >= costGold &&
    resources.wood >= costWood &&
    resources.stone >= costStone;

  const weatherCond = WEATHER_CONDITIONS[timeState?.weather || 'clear'] || WEATHER_CONDITIONS.clear;

  return (
    <div className="flex-1 flex flex-col h-full relative">
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
        {timeState.weather === 'downpour' && (
          <div className="absolute inset-0 opacity-35 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:14px_14px] animate-pulse" />
        )}
        {timeState.weather === 'blizzard' && (
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:20px_20px] animate-ping" />
        )}
        {timeState.weather === 'heatwave' && (
          <div className="absolute inset-0 bg-gradient-to-t from-amber-600/10 via-transparent to-orange-500/10 animate-pulse" />
        )}
      </div>

      {/* The 2.5D Isometric SVG Living Ink Canvas */}
      <CitadelSvgGrid
        buildings={buildings}
        harvestTimers={harvestTimers}
        onHarvest={onHarvest}
        selectedBuildingId={selectedBuildingId}
        onSelectBuilding={onSelectBuilding}
        canAfford={canAfford}
        inkPulseTick={inkPulseTick}
        onHoverUpgrade={onHoverUpgrade}
      />

      {/* Diegetic Inspection Banner & Wax Seal Decree Button */}
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
      />
    </div>
  );
}
