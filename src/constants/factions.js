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
    vaultProtectionBase: 0.25,
    element: 'Water',
    doctrine: 'River Trade & Commerce'
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
    vaultProtectionBase: 0.20,
    element: 'Flame',
    doctrine: 'Ash & Carnage'
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
    vaultProtectionBase: 0.25,
    element: 'Flora',
    doctrine: 'Living Arbor & Aquifers'
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
    vaultProtectionBase: 0.40,
    element: 'Stone',
    doctrine: 'Granite & Deep Vaults'
  }
};

export const ELEMENTAL_AFFINITIES = {
  Flora: {
    strongAgainst: 'Stone',
    defendAgainst: 'Water',
    weakAgainst: 'Flame',
    atkBonus: 0.25, // +25% troop attack vs Stone/Earth
    defBonus: 0.15, // +15% troop defense vs Water/Tide
    vulnPenalty: 0.20 // -20% troop defense vs Flame/Pyre
  },
  Stone: {
    strongAgainst: 'Flame',
    defendAgainst: 'Flora',
    weakAgainst: 'Water',
    atkBonus: 0.25,
    defBonus: 0.15,
    vulnPenalty: 0.20
  },
  Water: {
    strongAgainst: 'Flame',
    defendAgainst: 'Stone',
    weakAgainst: 'Flora',
    atkBonus: 0.25,
    defBonus: 0.15,
    vulnPenalty: 0.20
  },
  Flame: {
    strongAgainst: 'Flora',
    defendAgainst: 'Water',
    weakAgainst: 'Stone',
    atkBonus: 0.25,
    defBonus: 0.15,
    vulnPenalty: 0.20
  }
};

export function getElementalMatchup(playerElement = 'Flora', rivalElement = 'Stone') {
  if (!playerElement || !rivalElement || playerElement === rivalElement) {
    return {
      advantage: null,
      atkMult: 1.0,
      defMult: 1.0,
      badge: '⚖️ Neutral Elemental Alignment',
      sealColor: 'border-stone-500 text-stone-300'
    };
  }

  const affinity = ELEMENTAL_AFFINITIES[playerElement];
  if (affinity) {
    if (rivalElement === affinity.strongAgainst) {
      return {
        advantage: 'strong',
        atkMult: 1 + affinity.atkBonus,
        defMult: 1.0,
        badge: `🌱 ${playerElement} vs. 🪨 ${rivalElement}: +25% Garrison Dominance`,
        sealColor: 'border-emerald-600 bg-emerald-950/80 text-emerald-200'
      };
    }
    if (rivalElement === affinity.defendAgainst) {
      return {
        advantage: 'defend',
        atkMult: 1.0,
        defMult: 1 + affinity.defBonus,
        badge: `🌱 ${playerElement} vs. 💧 ${rivalElement}: +15% Botanical Absorption`,
        sealColor: 'border-sky-600 bg-sky-950/80 text-sky-200'
      };
    }
    if (rivalElement === affinity.weakAgainst) {
      return {
        advantage: 'weak',
        atkMult: 1.0,
        defMult: 1 - affinity.vulnPenalty,
        badge: `🌱 ${playerElement} vs. 🔥 ${rivalElement}: -20% Flammable Vulnerability`,
        sealColor: 'border-red-600 bg-red-950/80 text-rose-200'
      };
    }
  }

  return {
    advantage: null,
    atkMult: 1.0,
    defMult: 1.0,
    badge: '⚖️ Neutral Elemental Alignment',
    sealColor: 'border-stone-500 text-stone-300'
  };
}
