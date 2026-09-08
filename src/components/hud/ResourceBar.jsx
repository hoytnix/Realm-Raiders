import React from 'react';
import { ResourcePill } from '../common/ResourcePill.jsx';

export function ResourceBar({ resources, stats }) {
  const resourceConfigs = [
    { key: 'food', label: 'Food', icon: '🌾', color: 'text-amber-300', upkeep: stats.upkeep.food },
    { key: 'water', label: 'Water', icon: '💧', color: 'text-sky-300', upkeep: stats.upkeep.water },
    { key: 'wood', label: 'Wood', icon: '🪵', color: 'text-orange-300' },
    { key: 'stone', label: 'Stone', icon: '🪨', color: 'text-stone-300' },
    { key: 'flora', label: 'Flora', icon: '🌿', color: 'text-emerald-300' },
    { key: 'gold', label: 'Gold', icon: '🪙', color: 'text-yellow-300' }
  ];

  return (
    <div className="flex flex-wrap items-center gap-1.5 bg-gradient-to-r from-stone-950/90 via-[#2a1c12]/90 to-stone-950/90 border-2 border-amber-700/60 rounded-2xl p-1.5 shadow-2xl backdrop-blur">
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
