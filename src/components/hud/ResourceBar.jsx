import React from 'react';
import { ResourcePill } from '../common/ResourcePill.jsx';

export function ResourceBar({ resources = {}, stats = {}, variant = 'desktop', className = '' }) {
  const isMobile = variant === 'mobile';

  const resourceConfigs = [
    {
      key: 'gold',
      label: 'Gold',
      icon: '🪙',
      color: 'text-yellow-300',
      amount: resources?.gold,
      cap: stats?.caps?.gold || 1500,
      tooltip: 'Imperial treasury for construction, royal decrees, and army recruitment.'
    },
    {
      key: 'food',
      label: 'Sustenance',
      icon: '🌾',
      color: 'text-amber-300',
      amount: resources?.food,
      cap: stats?.caps?.food || 1000,
      upkeep: stats?.upkeep?.food,
      tooltip: 'Grain stores feeding the populace & levies. Depletion triggers starvation!'
    },
    {
      key: 'wood',
      label: 'Timber',
      icon: '🪵',
      color: 'text-orange-400',
      amount: resources?.wood,
      cap: stats?.caps?.wood || 1000,
      tooltip: 'Hewn lumber for timber mills, barracks expansions, and siege munitions.'
    },
    {
      key: 'stone',
      label: 'Stone',
      icon: '🪨',
      color: 'text-stone-300',
      amount: resources?.stone,
      cap: stats?.caps?.stone || 1000,
      tooltip: 'Quarried masonry for keep fortifications, watchtowers, and catapult boulders.'
    },
    {
      key: 'flora',
      label: 'Flora',
      icon: '🌿',
      color: 'text-emerald-300',
      amount: resources?.flora,
      cap: stats?.caps?.flora || 1000,
      tooltip: 'Botanical essence for Verdant Bloom crop surges and Living Bramble Shield.'
    }
  ];

  if (isMobile) {
    return (
      <div className={`flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 px-2.5 bg-stone-950/90 backdrop-blur-md border border-amber-700/60 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.7)] max-w-full ${className}`}>
        {resourceConfigs.map(res => (
          <ResourcePill
            key={res.key}
            icon={res.icon}
            amount={res.amount}
            cap={res.cap}
            upkeep={res.upkeep}
            color={res.color}
            label={res.label}
            tooltip={res.tooltip}
            compact={true}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`w-auto flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 px-3 bg-gradient-to-r from-stone-950/90 via-[#261810]/90 to-stone-950/90 border border-amber-600/60 rounded-2xl shadow-xl backdrop-blur ${className}`}>
      {resourceConfigs.map(res => (
        <ResourcePill
          key={res.key}
          icon={res.icon}
          amount={res.amount}
          cap={res.cap}
          upkeep={res.upkeep}
          color={res.color}
          label={res.label}
          tooltip={res.tooltip}
          compact={false}
        />
      ))}
    </div>
  );
}
