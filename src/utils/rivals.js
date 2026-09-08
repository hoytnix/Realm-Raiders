// ==========================================
// PROCEDURAL RIVAL GENERATOR (WAR COUNCIL)
// ==========================================
import { FACTIONS } from '../constants/factions.js';
const TITLES = ['Baron Malakor', 'Warmaster Grak', 'Lady Sylviara', 'Thane Ironjaw', 'Chieftain Torvash', 'High Priest Corin', 'Queen Vespera', 'Warden Bronzepeak', 'General Kaelen', 'Matron Morwena', 'Jarl Valgard', 'Archdruid Baelor'];
export function generateRivals(playerRating) {
  const factionKeys = Object.keys(FACTIONS);
  return [1, 2, 3].map(index => {
    const variance = Math.random() * 0.14 - 0.07; // within +/- 7%
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
    position: {
      x: 475,
      y: 55
    }
  },
  'South-East': {
    clan: 'Ash / Fire Raiders',
    faction: 'orcs',
    element: 'Flame',
    sigil: '🔥',
    troopType: 'Bloodfury Berserkers',
    desc: 'Aggressive raider encampment surrounded by spiked palisades, burning oil cauldrons, and siege barricades.',
    position: {
      x: 475,
      y: 255
    }
  },
  'North-West': {
    clan: 'River Clan',
    faction: 'humans',
    element: 'Water',
    sigil: '🌊',
    troopType: 'Longbow Mariners',
    desc: 'River delta fortress controlling aquifer irrigation and lock gates. Manned by vigilant river sentinels.',
    position: {
      x: 65,
      y: 60
    }
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
    const variance = Math.random() * 0.40 - 0.20;
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
export function calculateProvocationIndex(state) {
  if (!state) return 0;
  const gold = state.resources?.gold || 0;
  const food = state.resources?.food || 0;
  const wood = state.resources?.wood || 0;
  const stone = state.resources?.stone || 0;
  const flora = state.resources?.flora || 0;
  const totalWealth = gold + food + Math.floor((wood + stone + flora) * 0.4);
  const troops = state.troops?.total || 0;
  const wallLevel = state.buildings?.barracks?.level || 0;
  const defenseStrength = troops * 3 + wallLevel * 20 + 15;
  return totalWealth / Math.max(1, defenseStrength);
}
export function getFactionExtortionDemand(rival, state) {
  const faction = (rival?.faction || 'orcs').toLowerCase();
  const res = state?.resources || {};
  const pool = ['gold', 'food', 'wood', 'stone', 'flora'];
  const weights = {
    gold: 1,
    food: 1,
    wood: 1,
    stone: 1,
    flora: 1
  };
  if (faction.includes('orc') || faction.includes('cinder')) {
    weights.food = 7;
    weights.wood = 3;
    weights.stone = 2;
  } else if (faction.includes('dwarf') || faction.includes('ironforge')) {
    weights.gold = 7;
    weights.stone = 4;
    weights.wood = 2;
  } else if (faction.includes('elf') || faction.includes('tide')) {
    weights.flora = 7;
    weights.wood = 4;
    weights.food = 2;
  } else {
    weights.gold = 4;
    weights.food = 4;
  }
  const rollCount = Math.random();
  const numDemands = rollCount < 0.35 ? 1 : rollCount < 0.75 ? 2 : 3;
  const chosenResources = [];
  const available = [...pool];
  for (let i = 0; i < numDemands && available.length > 0; i++) {
    const totalWeight = available.reduce((acc, r) => acc + (weights[r] || 1), 0);
    let selector = Math.random() * totalWeight;
    let picked = available[0];
    for (const r of available) {
      selector -= weights[r] || 1;
      if (selector <= 0) {
        picked = r;
        break;
      }
    }
    chosenResources.push(picked);
    const idx = available.indexOf(picked);
    if (idx > -1) available.splice(idx, 1);
  }
  const resourceLabels = {
    gold: 'Gold',
    food: 'Sustenance',
    wood: 'Wood',
    stone: 'Stone',
    flora: 'Flora'
  };
  const items = chosenResources.map(resource => {
    const currentStock = res[resource] || 0;
    const ratio = 0.12 + Math.random() * 0.16;
    const minBase = resource === 'flora' ? 8 : resource === 'gold' ? 20 : 15;
    const amount = Math.max(minBase, Math.min(Math.floor(currentStock * ratio), 120));
    return {
      resource,
      amount,
      label: resourceLabels[resource] || resource
    };
  });
  const summary = items.map(it => it.amount + ' ' + it.label).join(' & ');
  return {
    items,
    summary,
    factionName: rival?.name || 'Rival Clan'
  };
}
export function checkIncomingRaid(state) {
  if (!state) return null;
  const currentDay = state.calendar?.day ?? state.day ?? 1;
  if (currentDay < 5) return null;
  if ((state.raidCooldown || 0) > 0) return null;
  if (state.impendingRaid || state.incomingRaid) return null;
  const provocation = calculateProvocationIndex(state);
  if (provocation < 1.35) return null;
  const roll = Math.random();
  const raidChance = Math.min(0.75, (provocation - 1.0) * 0.15);
  if (roll > raidChance) return null;
  const rivals = state.rivalSettlements && state.rivalSettlements.length > 0 ? state.rivalSettlements : generateRivals(100);
  const selectedRival = rivals[Math.floor(Math.random() * rivals.length)];
  const demand = getFactionExtortionDemand(selectedRival, state);
  return {
    rival: selectedRival,
    threatLevel: Math.round(provocation * 10) / 10,
    warningTicks: 30,
    maxWarningTicks: 30,
    demand
  };
}