// ==========================================
// TECHNOLOGY & ROYAL DECREE DEFINITIONS
// ==========================================

export const TECHNOLOGIES = {
  tech_troop_logistics: {
    id: 'tech_troop_logistics',
    name: 'Vassal Foraging Lines',
    subtitle: 'Troop Quartermaster & Automated Logistics',
    inkSymbol: '🛡️',
    description: 'Dispatches standing garrison levies across the citadel perimeter to systematically reap completed yields from Farms, Mills, Quarries, and Mints without manual monarch intervention.',
    requirements: {
      keepTier: 2,
      cost: {
        gold: 150,
        food: 100
      }
    },
    minTroops: 1,
    automatedBuildings: ['granary', 'farm', 'well', 'lumber', 'quarry', 'greenhouse', 'vault']
  }
};
