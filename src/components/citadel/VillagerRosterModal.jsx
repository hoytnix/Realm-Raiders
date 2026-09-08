import React from 'react';
import { sounds } from '../../constants/index.js';
import { haptics, triggerHaptic } from '../../utils/index.js';

export const ROLE_DEFINITIONS = {
  Unassigned: { label: 'Unassigned', icon: '👤', color: 'text-stone-400', desc: 'Idle labor reserve' },
  Farming: { label: 'Farming', icon: '🌾', color: 'text-amber-400', desc: 'Assigned to Grain Acreage & Silos' },
  Masonry: { label: 'Masonry', icon: '🪨', color: 'text-stone-300', desc: 'Assigned to Granite Quarries' },
  Forestry: { label: 'Forestry', icon: '🪵', color: 'text-orange-400', desc: 'Assigned to Timber Mills' },
  Waterbearing: { label: 'Waterbearing', icon: '💧', color: 'text-cyan-400', desc: 'Assigned to Spring Aquifers' },
  Soldier: { label: 'Soldier', icon: '⚔️', color: 'text-red-400', desc: 'Manning garrison & border defense' },
  Spy: { label: 'Spy', icon: '🕵️', color: 'text-purple-400', desc: 'Infiltrating opposing settlements' }
};

export function VillagerRosterModal({
  isOpen,
  onClose,
  villagers = [],
  grid = [],
  onAssignVillager,
  onUnassignVillager,
  isStarving = false,
  isDehydrated = false
}) {
  if (!isOpen) return null;

  const handleClose = () => {
    haptics.light();
    sounds.playCoin();
    onClose?.();
  };

  const handleRoleChange = (villagerId, newRole) => {
    triggerHaptic('selection');
    haptics.light();
    sounds.playCoin();
    if (newRole === 'Unassigned') {
      onUnassignVillager?.(villagerId);
    } else {
      onAssignVillager?.(villagerId, newRole);
    }
  };

  // Compute roster counts
  const totalCitizens = villagers.length;
  const roleCounts = villagers.reduce((acc, v) => {
    acc[v.role] = (acc[v.role] || 0) + 1;
    return acc;
  }, {});

  const getWorkLocationName = (villager) => {
    if (villager.role === 'Soldier') return 'Garrison & Outer Ramparts';
    if (villager.role === 'Spy') {
      return villager.assignedBuildingId ? `Infiltrating Sector [${villager.assignedBuildingId}]` : 'Foreign Espionage Station';
    }
    if (villager.role === 'Unassigned' || !villager.assignedBuildingId) {
      return 'Idle / Wandering Citadel Commons';
    }
    const plot = (grid || []).find(p => p.id === villager.assignedBuildingId);
    if (!plot) return `Sector [${villager.assignedBuildingId}]`;
    const buildingNames = {
      farm: 'Grain Acreage',
      granary: 'Windmill & Granary',
      lumber: 'Timber Mill',
      quarry: 'Granite Quarry',
      well: 'Spring Aqueduct',
      keep: 'Royal Keep',
      barracks: 'War Barracks',
      vault: 'Ironclad Vault',
      watchtower: 'Watchtower Bastion',
      greenhouse: 'Mystic Herbalist'
    };
    return `${buildingNames[plot.buildingId] || 'Citadel Plot'} (${plot.id})`;
  };

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 bg-[#120d08]/90 md:backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl max-h-[92vh] sm:max-h-[85vh] bg-gradient-to-b from-[#f5ebd6] via-[#ebdcc1] to-[#dfcba6] border-2 border-[#8c6843] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#442813] font-serif"
      >
        {/* Parchment Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b-2 border-[#8c6843]/60 flex items-center justify-between bg-[#dfcba6]/90 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl p-1.5 bg-[#ebdcc1] border border-[#8c6843] rounded-2xl shadow-inner">
              📜
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black uppercase tracking-wide text-[#3f2314]">
                  Royal Villager Roster
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#3f2314] text-amber-200 text-[10px] font-mono font-bold">
                  {totalCitizens} Citizens
                </span>
              </div>
              <p className="text-[11px] font-mono text-[#6b4a2e]">
                Named Guild Laborers, Garrison Enlistees & Intelligence Operatives
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-2xl bg-[#dfcba6] border-2 border-[#8c6843] flex items-center justify-center text-sm font-bold text-[#442813] hover:bg-[#cbb38b] active:scale-95 transition shadow cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Role Distribution Summary Strip */}
        <div className="px-4 sm:px-6 py-2 bg-[#e5d4b3]/80 border-b border-[#bfa379]/60 flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-none flex-shrink-0 text-xs font-mono">
          <span className="text-[10px] uppercase font-bold text-[#5c3e23] whitespace-nowrap">Assignments:</span>
          {Object.entries(ROLE_DEFINITIONS).map(([rKey, def]) => {
            const count = roleCounts[rKey] || 0;
            return (
              <div
                key={rKey}
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#ebdcc1] border border-[#bfa379] whitespace-nowrap text-[10.5px]"
              >
                <span>{def.icon}</span>
                <span className="font-bold text-[#3f2314]">{def.label}:</span>
                <span className="font-bold text-amber-900">{count}</span>
              </div>
            );
          })}
        </div>

        {/* Scrollable Roster Table */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-2.5">
          {villagers.length === 0 ? (
            <div className="text-center py-10 text-stone-500 font-mono text-xs">
              No villagers registered. Enlist new recruits at the Barracks!
            </div>
          ) : (
            villagers.map((villager) => {
              const rDef = ROLE_DEFINITIONS[villager.role] || ROLE_DEFINITIONS.Unassigned;
              const isWorking = villager.role !== 'Unassigned';
              const locationStr = getWorkLocationName(villager);

              return (
                <div
                  key={villager.id}
                  className="bg-[#f7f0e3] border border-[#bfa379] rounded-2xl p-3 shadow-sm hover:border-[#8c6843] transition flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                >
                  {/* Citizen Identity & Location */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-[#ebdcc1] border border-[#8c6843]/60 flex items-center justify-center text-lg shadow-inner flex-shrink-0">
                      {rDef.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-black text-[#2e190d] tracking-wide truncate">
                          {villager.name}
                        </h4>
                        <span className={`text-[9.5px] font-mono px-1.5 py-0.2 rounded border font-bold ${
                          isWorking ? 'bg-amber-900/15 text-amber-900 border-amber-800/40' : 'bg-stone-300/40 text-stone-600 border-stone-400'
                        }`}>
                          {villager.role}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-[#6b4a2e] flex items-center gap-2 flex-wrap mt-0.5">
                        <span className="truncate">📍 {locationStr}</span>
                        <span>•</span>
                        <span className="text-emerald-800 font-bold">
                          {isStarving ? '🥀 Starving' : isDehydrated ? '🏜️ Dehydrated' : '💚 Well-Nourished'}
                        </span>
                        <span>•</span>
                        <span className="text-amber-800 font-mono">
                          Morale: {villager.morale || 100}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Inline Reassignment Dropdown */}
                  <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                    <label className="text-[10px] font-mono font-bold text-[#5c3e23] whitespace-nowrap">
                      Assign Job:
                    </label>
                    <select
                      value={villager.role}
                      onChange={(e) => handleRoleChange(villager.id, e.target.value)}
                      className="px-2.5 py-1 rounded-xl bg-[#ebdcc1] border-2 border-[#8c6843] text-xs font-mono font-bold text-[#3f2314] shadow-inner focus:outline-none focus:border-amber-700 cursor-pointer"
                    >
                      {Object.keys(ROLE_DEFINITIONS).map(roleKey => (
                        <option key={roleKey} value={roleKey}>
                          {ROLE_DEFINITIONS[roleKey].icon} {roleKey}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Note */}
        <div className="px-4 sm:px-6 py-2.5 bg-[#dfcba6]/90 border-t border-[#8c6843]/60 flex items-center justify-between text-[10px] font-mono text-[#5c3e23]">
          <span>Production structures without workers remain idle (0 yield).</span>
          <span>Each citizen requires food & water sustenance daily.</span>
        </div>
      </div>
    </div>
  );
}
