// ==========================================
// TECHNOLOGY & ROYAL DECREE DEFINITIONS
// ==========================================

export const TECH_CATEGORIES = {
  all: { id: 'all', label: 'All', icon: '📜' },
  economy: { id: 'economy', label: 'Economy', icon: '🌾' },
  military: { id: 'military', label: 'Military', icon: '⚔️' },
  fortification: { id: 'fortification', label: 'Fortification', icon: '🏰' }
};

export const TECHNOLOGIES = {
  tech_troop_logistics: {
    id: 'tech_troop_logistics',
    name: 'Vassal Foraging Lines',
    subtitle: 'Troop Quartermaster & Automated Logistics',
    category: 'economy',
    inkSymbol: '🛡️',
    description: 'Dispatches standing garrison levies across the citadel perimeter to systematically reap completed yields from Farms, Mills, Quarries, and Mints without manual monarch intervention.',
    benefit: 'Idle garrison troops automatically harvest completed citadel yields.',
    duration: 10,
    requirements: {
      keepTier: 1,
      cost: {
        gold: 40,
        food: 30,
        wood: 0,
        stone: 0
      }
    },
    minTroops: 1,
    automatedBuildings: ['granary', 'farm', 'well', 'lumber', 'quarry', 'greenhouse', 'vault']
  },
  tech_crop_rotation: {
    id: 'tech_crop_rotation',
    name: 'Seasonal Crop Rotation',
    subtitle: 'Agricultural Agronomy',
    category: 'economy',
    inkSymbol: '🌾',
    description: 'Implements intensive furrow scheduling across royal soil, elevating crop yields and drought tolerance.',
    benefit: '+20% base harvest yield from farms and greenhouses.',
    duration: 25,
    requirements: {
      keepTier: 1,
      cost: {
        gold: 100,
        food: 80,
        wood: 60,
        stone: 0
      }
    }
  },
  tech_phalanx_drills: {
    id: 'tech_phalanx_drills',
    name: 'Shield Wall Formations',
    subtitle: 'Infantry Tactics Doctrine',
    category: 'military',
    inkSymbol: '⚔️',
    description: 'Disciplines garrison spearmen in interlocking shield formations to resist rival catapult assaults and shock charges.',
    benefit: '+15% Garrison Defense Power during rival sieges.',
    duration: 30,
    requirements: {
      keepTier: 2,
      cost: {
        gold: 200,
        food: 120,
        wood: 80,
        stone: 50
      }
    }
  },
  tech_siege_munitions: {
    id: 'tech_siege_munitions',
    name: 'Reinforced Munitions',
    subtitle: 'Catapult Ballistics',
    category: 'military',
    inkSymbol: '💣',
    description: 'Chisels aerodynamic grooves and explosive resin cores into heavy stone boulders launched at rival citadels.',
    benefit: '+20% Catapult structural strike damage and plunder yield.',
    duration: 35,
    requirements: {
      keepTier: 2,
      cost: {
        gold: 250,
        food: 50,
        wood: 120,
        stone: 150
      }
    }
  },
  tech_crenellated_masonry: {
    id: 'tech_crenellated_masonry',
    name: 'Crenellated Battlements',
    subtitle: 'Stonework Fortifications',
    category: 'fortification',
    inkSymbol: '🏰',
    description: 'Reinforces curtain walls, palisades, and arrow slits with interlocking ashlar blocks.',
    benefit: 'Decreases rival siege structural damage by 25%.',
    duration: 30,
    requirements: {
      keepTier: 2,
      cost: {
        gold: 180,
        food: 0,
        wood: 100,
        stone: 200
      }
    }
  },
  tech_deep_vault_locks: {
    id: 'tech_deep_vault_locks',
    name: 'Dwarven Tumbler Locks',
    subtitle: 'Subterranean Treasury Security',
    category: 'fortification',
    inkSymbol: '🗝️',
    description: 'Forges heavy cold-iron combination deadbolts into subterranean vault doors.',
    benefit: '+15% Deep Vault resource protection threshold against raids.',
    duration: 40,
    requirements: {
      keepTier: 2,
      cost: {
        gold: 300,
        food: 0,
        wood: 80,
        stone: 220
      }
    }
  },
  tech_flora_bramble_wall: {
    id: 'tech_flora_bramble_wall',
    name: 'Bramble Bastion',
    subtitle: 'Living Briar Fortification',
    category: 'fortification',
    inkSymbol: '🌿',
    description: 'Entwines resilient thorny briars into the outer palisades and stone foundations, blunting enemy plunder and reducing shield upkeep.',
    benefit: 'Fortifies citadel walls with living briars, permanently reducing rival raid plunder by 30% and halving Bramble Shield hourly upkeep (to 1 Flora/hr).',
    duration: 25,
    requirements: {
      keepTier: 1,
      cost: {
        gold: 0,
        food: 80,
        wood: 120,
        stone: 0,
        flora: 50
      }
    }
  },
  tech_flora_overgrowth: {
    id: 'tech_flora_overgrowth',
    name: 'Rapid Sprout',
    subtitle: 'Botanical Overgrowth Decree',
    category: 'economy',
    inkSymbol: '🌱',
    description: 'Infuses agricultural and timber acreage with concentrated floral chlorophyll, rapidly accelerating crop maturation cycles.',
    benefit: 'Permanently cuts base production cycle duration on all Farms and Lumber Mills by 20%.',
    duration: 30,
    requirements: {
      keepTier: 2,
      cost: {
        gold: 200,
        food: 150,
        wood: 0,
        stone: 0,
        flora: 100
      }
    }
  },
  tech_flora_living_granary: {
    id: 'tech_flora_living_granary',
    name: 'Canopy Granary',
    subtitle: 'Arborial Sustenance Preservation',
    category: 'economy',
    inkSymbol: '🍃',
    description: 'Constructs living woven vine canopies over royal granaries and moisture wells to protect rations against arid droughts and spoilage.',
    benefit: 'Eliminates crop spoilage, troop starvation penalties, and drought consumption debuffs during extreme weather events.',
    duration: 30,
    requirements: {
      keepTier: 2,
      cost: {
        gold: 0,
        food: 0,
        wood: 180,
        stone: 100,
        flora: 75
      }
    }
  }
};
