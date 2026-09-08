// ==========================================
// ASYMMETRIC FACTION ARCHETYPES
// ==========================================
export const FACTIONS = {
  humans: {
    id: 'humans',
    name: 'Kingdom of Valor',
    title: 'The Master Traders',
    badge: '👑 Humans',
    sigil: '⚖️',
    ringColor: 'from-amber-400 to-yellow-600',
    bannerGradient: 'from-amber-600 via-amber-800 to-slate-900',
    inkColor: '#b45309',
    description: 'Balanced in all disciplines. Prosperous commerce networks, disciplined cohorts, and lower royal decree costs.',
    perks: [
      '-50% royal decree construction costs',
      '+10% additional spoils from all raid targets',
      'Stable baseline upkeep across all settlement tiers'
    ],
    productionMultipliers: { food: 1.0, water: 1.0, wood: 1.0, stone: 1.0, flora: 1.0, gold: 1.0 },
    upkeepMultiplier: 1.0,
    raidAttackBonus: 0,
    vaultProtectionBase: 0.25
  },
  orcs: {
    id: 'orcs',
    name: 'Bloodfury Horde',
    title: 'The Plunderers',
    badge: '🪓 Orcs',
    sigil: '🩸',
    ringColor: 'from-rose-600 to-red-800',
    bannerGradient: 'from-red-700 via-rose-950 to-slate-900',
    inkColor: '#b91c1c',
    description: 'Brutal warbands constructed for carnage. Massive raid strike damage, but bloodthirsty warriors demand heavy rations.',
    perks: [
      '+40% military raid attack power',
      'Raids inflict direct structural damage to buildings',
      'Standing warbands consume 1.5x Food & Water'
    ],
    productionMultipliers: { food: 1.1, water: 0.9, wood: 1.3, stone: 1.2, flora: 0.8, gold: 0.9 },
    upkeepMultiplier: 1.5,
    raidAttackBonus: 0.40,
    vaultProtectionBase: 0.20
  },
  elves: {
    id: 'elves',
    name: 'Sylvaeth Enclave',
    title: 'The Siphons',
    badge: '🌿 Elves',
    sigil: '🌱',
    ringColor: 'from-emerald-400 to-teal-700',
    bannerGradient: 'from-emerald-700 via-teal-950 to-slate-900',
    inkColor: '#059669',
    description: 'Enchanted forest mystics commanding crystal aquifers. Siphon rival treasuries directly through reinforced walls.',
    perks: [
      '2.0x Flora & Spring Water extraction',
      'Raid strikes bypass outer walls directly into vaults',
      'Fragile arbor architecture (-25% base defense HP)'
    ],
    productionMultipliers: { food: 1.1, water: 2.0, wood: 1.2, stone: 0.7, flora: 2.0, gold: 1.0 },
    upkeepMultiplier: 0.9,
    raidAttackBonus: 0.15,
    vaultProtectionBase: 0.25
  },
  dwarves: {
    id: 'dwarves',
    name: 'Ironpeak Holds',
    title: 'The Vault Keepers',
    badge: '⛏️ Dwarves',
    sigil: '⚒️',
    ringColor: 'from-blue-400 to-indigo-800',
    bannerGradient: 'from-blue-700 via-slate-950 to-slate-900',
    inkColor: '#2563eb',
    description: 'Impenetrable subterranean stoneworkers. Massive bullion mines and deep granite vaults that withstand pillaging.',
    perks: [
      '2.0x Gold & Granite extraction',
      'Deep Vaults permanently protect 40% of all stored wealth',
      'Subterranean farming penalty (-35% Food / Flora)'
    ],
    productionMultipliers: { food: 0.65, water: 1.0, wood: 0.8, stone: 2.0, flora: 0.65, gold: 2.0 },
    upkeepMultiplier: 1.0,
    raidAttackBonus: 0,
    vaultProtectionBase: 0.40
  }
};
