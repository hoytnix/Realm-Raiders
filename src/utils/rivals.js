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
    const name = TITLES[Math.floor(Math.random() * TITLES.length)] + ` #${Math.floor(100 + Math.random() * 900)}`;

    return {
      id: `rival-${Date.now()}-${index}`,
      name,
      faction,
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
