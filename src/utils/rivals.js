// ==========================================
// PROCEDURAL RIVAL GENERATOR (WAR COUNCIL)
// ==========================================
import { FACTIONS } from '../constants/factions.js';

const TITLES = [
  'Baron Malakor', 'Warmaster Grak', 'Lady Sylviara', 'Thane Ironjaw',
  'Chieftain Torvash', 'High Priest Corin', 'Queen Vespera', 'Warden Bronzepeak',
  'General Kaelen', 'Matron Morwena', 'Jarl Valgard', 'Archdruid Baelor'
];

export function generateRivals(playerRating) {
  const factionKeys = Object.keys(FACTIONS);

  return [1, 2, 3].map(index => {
    const variance = (Math.random() * 0.14) - 0.07; // within +/- 7%
    const targetRating = Math.max(12, Math.round(playerRating * (1 + variance)));
    const faction = factionKeys[Math.floor(Math.random() * factionKeys.length)];
    const element = FACTIONS[faction]?.element || 'Stone';
    const name = TITLES[Math.floor(Math.random() * TITLES.length)] + ` #${Math.floor(100 + Math.random() * 900)}`;

    return {
      id: `rival-${Date.now()}-${index}`,
      name,
      faction,
      element,
      rating: targetRating,
      defensePower: Math.round(targetRating * 0.88 + Math.random() * 14),
      lootPool: {
        gold: Math.round(150 + Math.random() * 180),
        food: Math.round(130 + Math.random() * 170),
        wood: Math.round(110 + Math.random() * 150),
        stone: Math.round(95 + Math.random() * 135),
        flora: Math.round(55 + Math.random() * 105)
      }
    };
  });
}

// ==========================================
// PROCEDURAL OPPOSING NPC SETTLEMENT GENERATOR
// ==========================================
const NPC_PREFIXES = {
  'North-East': ['Ironforge', 'Basalt-Peak', 'Crag-Deep', 'Granite-Spire', 'Stone-Hold', 'Deep-Barrow'],
  'South-East': ['Cinder-Camp', 'Ashen-Hold', 'Brimstone-Keep', 'Blood-Redoubt', 'Flame-Gulch', 'Pyre-Watch'],
  'North-West': ['Tide-Watch', 'River-Delta', 'Mist-Haven', 'Aquifer-Keep', 'Stream-Spire', 'Shoal-Bastion']
};

const NPC_SUFFIXES = ['Outpost', 'Stronghold', 'Redoubt', 'Camp', 'Bastion', 'Garrison', 'Keep'];

const CLAN_PROFILES = {
  'North-East': {
    clan: 'Mountain / Stone Clan',
    faction: 'dwarves',
    element: 'Stone',
    sigil: '⚒️',
    troopType: 'Ironclad Legionnaires',
    desc: 'Subterranean stoneworks fortress carved directly into basalt crags. Heavy stone vaults and deep shaft mines.',
    position: { x: 475, y: 55 }
  },
  'South-East': {
    clan: 'Ash / Fire Raiders',
    faction: 'orcs',
    element: 'Flame',
    sigil: '🔥',
    troopType: 'Bloodfury Berserkers',
    desc: 'Aggressive raider encampment surrounded by spiked palisades, burning oil cauldrons, and siege barricades.',
    position: { x: 475, y: 255 }
  },
  'North-West': {
    clan: 'River Clan',
    faction: 'humans',
    element: 'Water',
    sigil: '🌊',
    troopType: 'Longbow Mariners',
    desc: 'River delta fortress controlling aquifer irrigation and lock gates. Manned by vigilant river sentinels.',
    position: { x: 65, y: 60 }
  }
};

export function generateNpcVillages(playerRating = 60) {
  const quadrants = ['North-East', 'South-East', 'North-West'];

  return quadrants.map((quadrant, idx) => {
    const profile = CLAN_PROFILES[quadrant];
    const prefixList = NPC_PREFIXES[quadrant];
    const prefix = prefixList[Math.floor(Math.random() * prefixList.length)];
    const suffix = NPC_SUFFIXES[Math.floor(Math.random() * NPC_SUFFIXES.length)];
    const name = `${prefix} ${suffix}`;

    // Variance around player rating (+/- 20%)
    const variance = (Math.random() * 0.40) - 0.20;
    const targetRating = Math.max(30, Math.round(playerRating * (1 + variance) + 20));
    const defensePower = Math.round(targetRating * 0.85 + Math.random() * 15);
    const troopCount = Math.round(12 + Math.random() * 16);
    const readinessPct = Math.round(80 + Math.random() * 20);

    return {
      id: `npc-${idx + 1}-${Date.now().toString(36)}`,
      name,
      clan: profile.clan,
      faction: profile.faction,
      element: profile.element,
      quadrant,
      sigil: profile.sigil,
      rating: targetRating,
      defensePower,
      garrison: `${troopCount} ${profile.troopType}`,
      garrisonReady: `${readinessPct}% Armed & Alert`,
      position: profile.position,
      lootPool: {
        gold: Math.round(120 + Math.random() * 120),
        food: Math.round(100 + Math.random() * 100),
        water: Math.round(90 + Math.random() * 130),
        wood: Math.round(80 + Math.random() * 90),
        stone: Math.round(90 + Math.random() * 140),
        flora: Math.round(30 + Math.random() * 50)
      },
      description: profile.desc
    };
  });
}

export const NPC_VILLAGES = generateNpcVillages(150);


