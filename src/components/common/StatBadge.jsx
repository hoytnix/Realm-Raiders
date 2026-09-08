import React from 'react';

export function StatBadge({ children, variant = 'default', className = '' }) {
  const base = 'text-[10px] font-mono px-2 py-0.5 rounded font-bold inline-flex items-center gap-1';
  const variants = {
    default: 'bg-[#6b4724] text-amber-200',
    amber: 'bg-amber-900/20 text-amber-900',
    red: 'bg-red-800 text-rose-100',
    emerald: 'bg-emerald-900/20 text-emerald-900',
    stone: 'bg-stone-800 text-stone-300'
  };

  return (
    <span className={`${base} ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  );
}
