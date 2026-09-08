import React from 'react';
import { ResourcePill } from '../common/ResourcePill.jsx';

export function ResourceBar({ resources, stats }) {
  const resourceConfigs = [
    { key: 'gold', label: 'Gold', icon: '🪙', color: 'text-yellow-300' },
    { key: 'food', label: 'Food', icon: '🌾', color: 'text-amber-300', upkeep: stats.upkeep.food },
    { key: 'water', label: 'Water', icon: '💧', color: 'text-sky-300', upkeep: stats.upkeep.water },
    { key: 'wood', label: 'Wood', icon: '🪵', color: 'text-orange-300' },
    { key: 'stone', label: 'Stone', icon: '🪨', color: 'text-stone-300' },
    { key: 'flora', label: 'Flora', icon: '🌿', color: 'text-emerald-300' }
  ];

  return (
    <div className="w-full md:w-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 px-2 bg-gradient-to-r from-stone-950/90 via-[#2a1c12]/90 to-stone-950/90 border border-amber-700/60 md:border-2 rounded-2xl shadow-xl backdrop-blur scroll-smooth">
      {resourceConfigs.map(res => (
        <ResourcePill
          key={res.key}
          icon={res.icon}
          amount={resources[res.key]}
          cap={stats.caps[res.key] || 1000}
          upkeep={res.upkeep}
          color={res.color}
        />
      ))}
    </div>
  );
}
