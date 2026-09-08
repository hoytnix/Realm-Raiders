import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

// ==========================================
// DIEGETIC AUDIO SYNTHESIZER (Web Audio API)
// ==========================================
class SoundController {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playCoin() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1318.51, this.ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch (e) {
      console.warn(e);
    }
  }

  playWaxSealThud() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Heavy mechanical thud + sizzle
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(25, now + 0.25);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.25);

      // Sizzle tone for hot wax
      const noise = this.ctx.createOscillator();
      const nGain = this.ctx.createGain();
      noise.type = 'sawtooth';
      noise.frequency.setValueAtTime(800, now + 0.05);
      noise.frequency.exponentialRampToValueAtTime(300, now + 0.22);
      nGain.gain.setValueAtTime(0.08, now + 0.05);
      nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      noise.connect(nGain);
      nGain.connect(this.ctx.destination);
      noise.start(now + 0.05);
      noise.stop(now + 0.22);
    } catch (e) {
      console.warn(e);
    }
  }

  playDaggerThrust() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.18);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.2);
    } catch (e) {
      console.warn(e);
    }
  }

  playImpact() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.45, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);
    } catch (e) {
      console.warn(e);
    }
  }

  playLaunch() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(540, this.ctx.currentTime + 0.22);
      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.22);
    } catch (e) {
      console.warn(e);
    }
  }

  playUpgrade() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [440, 554.37, 659.25, 880].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.frequency.setValueAtTime(freq, now + i * 0.07);
        gain.gain.setValueAtTime(0.2, now + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.07);
        osc.stop(now + i * 0.07 + 0.22);
      });
    } catch (e) {
      console.warn(e);
    }
  }

  playFamineAlarm() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, this.ctx.currentTime);
      osc.frequency.setValueAtTime(390, this.ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
    } catch (e) {
      console.warn(e);
    }
  }
}

const sounds = new SoundController();

// ==========================================
// ASTRONOMICAL CALENDAR & METEOROLOGY
// ==========================================
export const SEASONS = {
  spring: {
    id: 'spring',
    name: 'Verdant Thaw',
    icon: '🌸',
    color: 'text-emerald-400',
    description: '+30% Flora & Aquifer Yields, +15% Upkeep demand',
    multipliers: { food: 1.1, water: 1.3, wood: 1.0, stone: 0.9, flora: 1.3, gold: 1.0, upkeep: 1.15 }
  },
  summer: {
    id: 'summer',
    name: 'Sunfire Solstice',
    icon: '☀️',
    color: 'text-amber-400',
    description: '+25% Grain & Timber, +40% Water Evaporation/Upkeep',
    multipliers: { food: 1.25, water: 0.7, wood: 1.25, stone: 1.0, flora: 1.1, gold: 1.1, upkeep: 1.4 }
  },
  autumn: {
    id: 'autumn',
    name: 'Golden Harvest',
    icon: '🍂',
    color: 'text-orange-400',
    description: '+35% Food & Bullion minting, +15% Catapult Raid Spoils',
    multipliers: { food: 1.35, water: 1.0, wood: 1.1, stone: 1.1, flora: 0.9, gold: 1.35, upkeep: 1.0 }
  },
  winter: {
    id: 'winter',
    name: 'Frostveil Eclipse',
    icon: '❄️',
    color: 'text-sky-300',
    description: '-30% Agriculture, +35% Granite Masonry & Deep Vault fortification',
    multipliers: { food: 0.7, water: 0.8, wood: 0.85, stone: 1.35, flora: 0.6, gold: 0.9, upkeep: 1.25 }
  }
};

export const WEATHER_CONDITIONS = {
  clear: {
    id: 'clear',
    name: 'Temperate Skies',
    icon: '🌤️',
    tint: 'rgba(245, 158, 11, 0.08)',
    multipliers: { food: 1.0, water: 1.0, wood: 1.0, stone: 1.0, flora: 1.0, gold: 1.0, raidAtk: 1.0 }
  },
  downpour: {
    id: 'downpour',
    name: 'Monsoon Deluge',
    icon: '🌧️',
    tint: 'rgba(14, 116, 144, 0.20)',
    multipliers: { food: 1.1, water: 1.7, wood: 0.8, stone: 0.8, flora: 1.4, gold: 0.9, raidAtk: 0.85 }
  },
  heatwave: {
    id: 'heatwave',
    name: 'Scorching Drought',
    icon: '🔥',
    tint: 'rgba(194, 65, 12, 0.22)',
    multipliers: { food: 0.75, water: 0.5, wood: 1.15, stone: 1.2, flora: 0.7, gold: 1.0, raidAtk: 1.1 }
  },
  blizzard: {
    id: 'blizzard',
    name: 'Biting Gale',
    icon: '🌨️',
    tint: 'rgba(224, 242, 254, 0.25)',
    multipliers: { food: 0.6, water: 0.7, wood: 0.75, stone: 1.2, flora: 0.5, gold: 0.85, raidAtk: 0.75 }
  }
};

const SEASON_ORDER = ['spring', 'summer', 'autumn', 'winter'];

// ==========================================
// GAME CONSTANTS & FACTION ARCHETYPES
// ==========================================
const FACTIONS = {
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

const BUILDINGS = {
  keep: {
    id: 'keep',
    name: 'Royal Keep',
    inkSymbol: '🏰',
    tag: 'Citadel Heart',
    description: 'Heart of the realm. Fortifies overall defense power and unlocks higher structural tiers.',
    gx: 2, gy: 2,
    baseCost: { gold: 120, wood: 100, stone: 100 },
    costMult: 1.6,
    baseHp: 650,
    type: 'core'
  },
  granary: {
    id: 'granary',
    name: 'Windmill & Granary',
    inkSymbol: '🌾',
    tag: 'Ration Silo',
    description: 'Cultivates grain crops and stores bread flour. Sustains realm population and standing garrison.',
    gx: 1, gy: 1,
    baseCost: { gold: 50, wood: 60, stone: 20 },
    costMult: 1.45,
    cycleDuration: 12,
    baseYield: { food: 55 },
    baseCapacity: 1200,
    baseHp: 280,
    type: 'eco'
  },
  well: {
    id: 'well',
    name: 'Spring Aqueduct',
    inkSymbol: '💧',
    tag: 'Aquifer',
    description: 'Pumps fresh spring aquifer water essential to ward off severe dehydration and mutinous unrest.',
    gx: 3, gy: 1,
    baseCost: { gold: 45, wood: 40, stone: 40 },
    costMult: 1.42,
    cycleDuration: 10,
    baseYield: { water: 50 },
    baseCapacity: 1200,
    baseHp: 260,
    type: 'eco'
  },
  lumber: {
    id: 'lumber',
    name: 'Timber Mill',
    inkSymbol: '🪵',
    tag: 'Forester',
    description: 'Harvests sturdy timber used for siege engines, scaffolding, and perimeter palisades.',
    gx: 0, gy: 2,
    baseCost: { gold: 40, wood: 20, stone: 50 },
    costMult: 1.4,
    cycleDuration: 15,
    baseYield: { wood: 60 },
    baseCapacity: 1500,
    baseHp: 250,
    type: 'resource'
  },
  quarry: {
    id: 'quarry',
    name: 'Granite Quarry',
    inkSymbol: '🪨',
    tag: 'Masonry',
    description: 'Chisels granite blocks to reinforce battlements and withstand enemy catapult bombardments.',
    gx: 4, gy: 2,
    baseCost: { gold: 60, wood: 50, stone: 30 },
    costMult: 1.45,
    cycleDuration: 18,
    baseYield: { stone: 60 },
    baseCapacity: 1500,
    baseHp: 320,
    type: 'resource'
  },
  greenhouse: {
    id: 'greenhouse',
    name: 'Mystic Herbalist',
    inkSymbol: '🌿',
    tag: 'Alchemist',
    description: 'Nurtures moonlit flora used for alchemical healing salves, magical wards, and raid enhancements.',
    gx: 1, gy: 3,
    baseCost: { gold: 75, wood: 60, stone: 40 },
    costMult: 1.5,
    cycleDuration: 14,
    baseYield: { flora: 35 },
    baseCapacity: 800,
    baseHp: 220,
    type: 'magic'
  },
  vault: {
    id: 'vault',
    name: 'Ironclad Vault',
    inkSymbol: '🪙',
    tag: 'Treasury',
    description: 'Mints golden crowns and keeps bullion safe beneath stone slabs during asynchronous pillage incursions.',
    gx: 3, gy: 3,
    baseCost: { gold: 100, wood: 80, stone: 110 },
    costMult: 1.55,
    cycleDuration: 20,
    baseYield: { gold: 65 },
    baseCapacity: 2000,
    baseHp: 420,
    type: 'finance'
  },
  watchtower: {
    id: 'watchtower',
    name: 'Ballista Watchtower',
    inkSymbol: '🏹',
    tag: 'Perimeter Bastion',
    description: 'Manned bastion that automatically unleashes ballista bolts at invading warbands.',
    gx: 2, gy: 0,
    baseCost: { gold: 90, wood: 75, stone: 85 },
    costMult: 1.5,
    defense: 38,
    baseHp: 460,
    type: 'military'
  }
};

const DEFAULT_STATE = {
  faction: null,
  resources: {
    food: 220,
    water: 220,
    wood: 260,
    stone: 210,
    flora: 90,
    gold: 320
  },
  buildings: {
    keep: 1,
    granary: 1,
    well: 1,
    lumber: 1,
    quarry: 1,
    greenhouse: 1,
    vault: 1,
    watchtower: 1
  },
  harvestTimers: {
    granary: 0,
    well: 0,
    lumber: 0,
    quarry: 0,
    greenhouse: 0,
    vault: 0
  },
  timeState: {
    day: 1,
    hour: 8,
    minute: 0,
    seasonIndex: 0,
    weather: 'clear',
    timeSpeed: 1
  },
  population: 14,
  garrison: 8,
  totalRaidsWon: 0,
  totalRaidsDefended: 0,
  revengeLedger: [
    {
      id: 'rev-1',
      rivalName: 'Warlord Grashnak',
      rivalFaction: 'orcs',
      stolen: { gold: 85, food: 110, stone: 45 },
      timestamp: Date.now() - 3600000 * 2.8,
      revenged: false
    },
    {
      id: 'rev-2',
      rivalName: 'Archmage Zephyr',
      rivalFaction: 'elves',
      stolen: { flora: 70, water: 95 },
      timestamp: Date.now() - 3600000 * 6.5,
      revenged: true
    }
  ],
  battleLogs: [
    {
      id: 'log-1',
      title: 'Perimeter Breached at Sundown',
      text: 'Warlord Grashnak catapulted outer silos, plundering 85 Gold & 110 Food.',
      type: 'loss',
      timestamp: Date.now() - 3600000 * 2.8
    },
    {
      id: 'log-2',
      title: 'Ballista Bastion Repelled Scouts',
      text: 'Manned towers pinned down an elven raiding vanguard. Recovered 45 defensive scrap.',
      type: 'win',
      timestamp: Date.now() - 3600000 * 5.2
    }
  ],
  lastTickTimestamp: Date.now()
};

function generateRivals(playerRating) {
  const factionKeys = Object.keys(FACTIONS);
  const titles = [
    'Baron Malakor', 'Warmaster Grak', 'Lady Sylviara', 'Thane Ironjaw',
    'Chieftain Torvash', 'High Priest Corin', 'Queen Vespera', 'Warden Bronzepeak',
    'General Kaelen', 'Matron Morwena', 'Jarl Valgard', 'Archdruid Baelor'
  ];

  return [1, 2, 3].map(index => {
    const variance = (Math.random() * 0.14) - 0.07; // within +/- 7%
    const targetRating = Math.max(12, Math.round(playerRating * (1 + variance)));
    const faction = factionKeys[Math.floor(Math.random() * factionKeys.length)];
    const name = titles[Math.floor(Math.random() * titles.length)] + ` #${Math.floor(100 + Math.random() * 900)}`;

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

// 2.5D Isometric Transform on the parchment
const ISO_W = 68;
const ISO_H = 34;
function gridToParchmentIso(gx, gy, originX = 270, originY = 75) {
  return {
    x: (gx - gy) * (ISO_W / 2) + originX,
    y: (gx + gy) * (ISO_H / 2) + originY
  };
}

// ==========================================
// MAIN COMPONENT EXPORT
// ==========================================
export default function App() {
  const [gameState, setGameState] = useState(() => {
    try {
      const saved = localStorage.getItem('realmraid_parchment_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        const now = Date.now();
        // Deterministic offline calculation
        parsed.lastTickTimestamp = now;
        if (!parsed.harvestTimers) {
          parsed.harvestTimers = { granary: 0, well: 0, lumber: 0, quarry: 0, greenhouse: 0, vault: 0 };
        }
        if (!parsed.timeState) {
          parsed.timeState = {
            day: 1,
            hour: 8,
            minute: 0,
            seasonIndex: 0,
            weather: 'clear',
            timeSpeed: 1
          };
        }
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_STATE;
  });

  // Navigation desk mode: 'citadel' | 'war' | 'chronicle' | 'menu'
  const [deskView, setDeskView] = useState('citadel');
  const [selectedBuildingId, setSelectedBuildingId] = useState('keep');
  const [isMuted, setIsMuted] = useState(false);
  const [isStarving, setIsStarving] = useState(false);
  const [inkPulseTick, setInkPulseTick] = useState(0);

  // Parallax tilt coordinates [-1, 1]
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [isHoveringUpgradeable, setIsHoveringUpgradeable] = useState(false);
  const [waxSplats, setWaxSplats] = useState([]);

  // Rewarded Video Ad Modal Simulator
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [adCountdown, setAdCountdown] = useState(15);
  const [pendingRaidTarget, setPendingRaidTarget] = useState(null);

  // Active Raid Battlefield State
  const [activeRaid, setActiveRaid] = useState(null);
  const [screenShake, setScreenShake] = useState(false);
  const [stampingDecree, setStampingDecree] = useState(false);

  useEffect(() => {
    sounds.muted = isMuted;
  }, [isMuted]);

  useEffect(() => {
    try {
      localStorage.setItem('realmraid_parchment_v1', JSON.stringify(gameState));
    } catch (e) {
      console.warn(e);
    }
  }, [gameState]);

  const currentFaction = useMemo(() => {
    if (!gameState.faction) return null;
    return FACTIONS[gameState.faction] || FACTIONS.humans;
  }, [gameState.faction]);

  const stats = useMemo(() => {
    if (!currentFaction) {
      return {
        upkeep: { food: 0, water: 0 },
        caps: { food: 1000, water: 1000, wood: 1000, stone: 1000, flora: 500, gold: 1500 },
        vaultProtected: { food: 200, water: 200, wood: 200, stone: 200, flora: 100, gold: 300 },
        attackPower: 50,
        defensePower: 50,
        overallRating: 50
      };
    }

    const { buildings, population, garrison } = gameState;
    const bLevels = buildings;

    const seasonKey = SEASON_ORDER[gameState.timeState?.seasonIndex || 0];
    const season = SEASONS[seasonKey] || SEASONS.spring;
    const weatherKey = gameState.timeState?.weather || 'clear';
    const weather = WEATHER_CONDITIONS[weatherKey] || WEATHER_CONDITIONS.clear;

    const baseUpkeepFood = (population * 0.35 + garrison * 0.65) * currentFaction.upkeepMultiplier * (season.multipliers.upkeep || 1.0);
    const baseUpkeepWater = (population * 0.30 + garrison * 0.55) * currentFaction.upkeepMultiplier * (season.multipliers.upkeep || 1.0);

    const starving = gameState.resources.food <= 0.1 || gameState.resources.water <= 0.1;

    const caps = {
      food: BUILDINGS.granary.baseCapacity * (bLevels.granary || 1),
      water: BUILDINGS.well.baseCapacity * (bLevels.well || 1),
      wood: BUILDINGS.lumber.baseCapacity * (bLevels.lumber || 1),
      stone: BUILDINGS.quarry.baseCapacity * (bLevels.quarry || 1),
      flora: BUILDINGS.greenhouse.baseCapacity * (bLevels.greenhouse || 1),
      gold: BUILDINGS.vault.baseCapacity * (bLevels.vault || 1)
    };

    const vaultProtectionRatio = currentFaction.vaultProtectionBase + ((bLevels.vault || 1) * 0.03);
    const vaultProtected = {
      food: Math.round(caps.food * vaultProtectionRatio),
      water: Math.round(caps.water * vaultProtectionRatio),
      wood: Math.round(caps.wood * vaultProtectionRatio),
      stone: Math.round(caps.stone * vaultProtectionRatio),
      flora: Math.round(caps.flora * vaultProtectionRatio),
      gold: Math.round(caps.gold * vaultProtectionRatio)
    };

    const baseAtk = (garrison * 12 + ((bLevels.keep || 1) * 15)) * (1 + currentFaction.raidAttackBonus) * (weather.multipliers.raidAtk || 1.0);
    const baseDef = (((bLevels.watchtower || 1) * 42) + ((bLevels.keep || 1) * 26)) * (starving ? 0.5 : 1.0) * (currentFaction.id === 'elves' ? 0.75 : 1.0);
    const overallRating = Math.round(baseAtk + baseDef + Object.values(bLevels).reduce((a, b) => a + b * 8, 0));

    return {
      upkeep: { food: baseUpkeepFood, water: baseUpkeepWater },
      caps,
      vaultProtected,
      attackPower: baseAtk,
      defensePower: baseDef,
      overallRating
    };
  }, [gameState, currentFaction]);

  useEffect(() => {
    if (!gameState.faction) return;

    const timer = setInterval(() => {
      setInkPulseTick(t => (t + 1) % 100);

      setGameState(prev => {
        if (!prev.faction) return prev;
        const factionData = FACTIONS[prev.faction] || FACTIONS.humans;

        // 1. Advance Clock & Weather Dynamics
        const speed = prev.timeState?.timeSpeed || 1;
        let newMinute = (prev.timeState?.minute || 0) + (10 * speed);
        let newHour = prev.timeState?.hour ?? 8;
        let newDay = prev.timeState?.day ?? 1;
        let newSeasonIdx = prev.timeState?.seasonIndex ?? 0;
        let currentWeather = prev.timeState?.weather || 'clear';

        if (newMinute >= 60) {
          const hoursElapsed = Math.floor(newMinute / 60);
          newMinute = newMinute % 60;
          newHour += hoursElapsed;

          // Shift weather every few hours probabilistically
          if (Math.random() < 0.28) {
            const weatherPool = ['clear', 'downpour', 'heatwave', 'blizzard'];
            currentWeather = weatherPool[Math.floor(Math.random() * weatherPool.length)];
          }
        }

        if (newHour >= 24) {
          newDay += Math.floor(newHour / 24);
          newHour = newHour % 24;

          // Rotate seasons every 7 in-game days
          newSeasonIdx = Math.floor((newDay - 1) / 7) % 4;
        }

        const seasonKey = SEASON_ORDER[newSeasonIdx];
        const season = SEASONS[seasonKey] || SEASONS.spring;

        const starvingNow = prev.resources.food <= 0.05 || prev.resources.water <= 0.05;
        if (starvingNow !== isStarving) {
          setIsStarving(starvingNow);
          if (starvingNow) sounds.playFamineAlarm();
        }

        const upkeepFood = (prev.population * 0.35 + prev.garrison * 0.65) *
          factionData.upkeepMultiplier *
          (season.multipliers.upkeep || 1.0);

        const upkeepWater = (prev.population * 0.30 + prev.garrison * 0.55) *
          factionData.upkeepMultiplier *
          (season.multipliers.upkeep || 1.0);

        const nextRes = { ...prev.resources };
        nextRes.food = Math.max(0, nextRes.food - upkeepFood);
        nextRes.water = Math.max(0, nextRes.water - upkeepWater);

        // Advance harvest cycle timers scaled by speed
        const updatedTimers = { ...prev.harvestTimers };
        Object.keys(updatedTimers).forEach(bId => {
          const bDef = BUILDINGS[bId];
          if (bDef && bDef.cycleDuration) {
            const currentVal = updatedTimers[bId] || 0;
            if (currentVal < bDef.cycleDuration) {
              updatedTimers[bId] = Math.min(bDef.cycleDuration, currentVal + (1 * speed));
            }
          }
        });

        return {
          ...prev,
          resources: nextRes,
          harvestTimers: updatedTimers,
          timeState: {
            day: newDay,
            hour: newHour,
            minute: newMinute,
            seasonIndex: newSeasonIdx,
            weather: currentWeather,
            timeSpeed: speed
          },
          lastTickTimestamp: Date.now()
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.faction, isStarving]);

  const handleToggleSpeed = () => {
    sounds.playCoin();
    setGameState(prev => {
      const curSpeed = prev.timeState?.timeSpeed || 1;
      const nextSpeed = curSpeed === 1 ? 2 : curSpeed === 2 ? 5 : 1;
      return {
        ...prev,
        timeState: {
          ...(prev.timeState || { day: 1, hour: 8, minute: 0, seasonIndex: 0, weather: 'clear' }),
          timeSpeed: nextSpeed
        }
      };
    });
  };

  const handleHarvestBuilding = (bId) => {
    const bDef = BUILDINGS[bId];
    if (!bDef || !bDef.baseYield || !currentFaction) return;

    const currentProgress = gameState.harvestTimers[bId] || 0;
    if (currentProgress < bDef.cycleDuration) return; // not ready

    const season = SEASONS[SEASON_ORDER[gameState.timeState?.seasonIndex || 0]] || SEASONS.spring;
    const weather = WEATHER_CONDITIONS[gameState.timeState?.weather || 'clear'] || WEATHER_CONDITIONS.clear;

    sounds.playCoin();
    const lvl = gameState.buildings[bId] || 1;
    const starvingPenalty = isStarving ? 0.5 : 1.0;

    const [resKey, baseVal] = Object.entries(bDef.baseYield)[0];
    const fMult = currentFaction.productionMultipliers[resKey] || 1.0;
    const sMult = season.multipliers[resKey] || 1.0;
    const wMult = weather.multipliers[resKey] || 1.0;

    const totalYield = Math.round(
      baseVal * (1 + (lvl - 1) * 0.5) * fMult * sMult * wMult * starvingPenalty
    );

    setGameState(prev => {
      const cap = stats.caps[resKey] || 1000;
      const currentAmt = prev.resources[resKey] || 0;
      return {
        ...prev,
        resources: {
          ...prev.resources,
          [resKey]: Math.min(cap, currentAmt + totalYield)
        },
        harvestTimers: {
          ...prev.harvestTimers,
          [bId]: 0
        }
      };
    });
  };

  const handleIssueRoyalDecree = (bId, e) => {
    const bDef = BUILDINGS[bId];
    if (!bDef || !currentFaction) return;

    const currentLvl = gameState.buildings[bId] || 1;
    const discount = currentFaction.id === 'humans' ? 0.5 : 1.0;
    const costGold = Math.round(bDef.baseCost.gold * Math.pow(bDef.costMult, currentLvl - 1) * discount);
    const costWood = Math.round(bDef.baseCost.wood * Math.pow(bDef.costMult, currentLvl - 1) * discount);
    const costStone = Math.round(bDef.baseCost.stone * Math.pow(bDef.costMult, currentLvl - 1) * discount);

    if (
      gameState.resources.gold < costGold ||
      gameState.resources.wood < costWood ||
      gameState.resources.stone < costStone
    ) {
      sounds.playFamineAlarm();
      return;
    }

    // Diegetic wax seal stamping feedback
    sounds.playWaxSealThud();
    setStampingDecree(true);

    if (e && e.clientX) {
      const newSplat = {
        id: Date.now(),
        x: e.clientX,
        y: e.clientY
      };
      setWaxSplats(prev => [...prev.slice(-4), newSplat]);
      setTimeout(() => {
        setWaxSplats(prev => prev.filter(s => s.id !== newSplat.id));
      }, 1200);
    }

    setTimeout(() => {
      sounds.playUpgrade();
      setStampingDecree(false);
    }, 350);

    setGameState(prev => ({
      ...prev,
      resources: {
        ...prev.resources,
        gold: prev.resources.gold - costGold,
        wood: prev.resources.wood - costWood,
        stone: prev.resources.stone - costStone
      },
      buildings: {
        ...prev.buildings,
        [bId]: currentLvl + 1
      },
      population: prev.population + (bId === 'granary' || bId === 'keep' ? 3 : 1),
      garrison: prev.garrison + (bId === 'watchtower' || bId === 'keep' ? 2 : 0)
    }));
  };

  const handlePointerMove = (e) => {
    const nx = (e.clientX / window.innerWidth) * 2 - 1;
    const ny = (e.clientY / window.innerHeight) * 2 - 1;
    setTilt({ x: Math.max(-1, Math.min(1, nx)), y: Math.max(-1, Math.min(1, ny)) });
    setCursorPos({ x: e.clientX, y: e.clientY });
  };

  const startRaidAdFlow = (targetRival) => {
    sounds.playCoin();
    setPendingRaidTarget(targetRival);
    setAdCountdown(15);
    setAdModalOpen(true);
  };

  useEffect(() => {
    let timer;
    if (adModalOpen && adCountdown > 0) {
      timer = setTimeout(() => setAdCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [adModalOpen, adCountdown]);

  const confirmAdAndLaunchPillage = () => {
    if (!pendingRaidTarget) return;
    setAdModalOpen(false);
    sounds.playLaunch();
    setActiveRaid({
      rival: pendingRaidTarget,
      strikesLeft: 3,
      targetedBuildings: {},
      lootGained: { gold: 0, food: 0, wood: 0, stone: 0, flora: 0 },
      isFinished: false,
      doubled: false
    });
    setPendingRaidTarget(null);
  };

  const handleCatapultStrike = (targetKey) => {
    if (!activeRaid || activeRaid.strikesLeft <= 0 || activeRaid.isFinished) return;

    sounds.playImpact();
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 450);

    const { rival, targetedBuildings, lootGained, strikesLeft } = activeRaid;
    const currentFactionData = FACTIONS[gameState.faction] || FACTIONS.humans;

    const seasonKey = SEASON_ORDER[gameState.timeState?.seasonIndex || 0];
    const season = SEASONS[seasonKey] || SEASONS.spring;
    const weather = WEATHER_CONDITIONS[gameState.timeState?.weather || 'clear'] || WEATHER_CONDITIONS.clear;
    const weatherRaidMult = weather.multipliers?.raidAtk || 1.0;
    const seasonRaidMult = season.id === 'autumn' ? 1.15 : 1.0;
    const bonusLootRatio = (currentFactionData.id === 'humans' ? 1.1 : 1.0) * seasonRaidMult * weatherRaidMult;

    let lootStolen = 0;
    const newLoot = { ...lootGained };

    if (targetKey === 'granary') {
      lootStolen = Math.round((rival.lootPool.food * 0.35) * bonusLootRatio);
      newLoot.food += lootStolen;
    } else if (targetKey === 'vault') {
      lootStolen = Math.round((rival.lootPool.gold * 0.35) * bonusLootRatio);
      newLoot.gold += lootStolen;
    } else if (targetKey === 'lumber') {
      lootStolen = Math.round((rival.lootPool.wood * 0.35) * bonusLootRatio);
      newLoot.wood += lootStolen;
    } else if (targetKey === 'keep') {
      lootStolen = Math.round((rival.lootPool.stone * 0.25) * bonusLootRatio);
      newLoot.stone += lootStolen;
      newLoot.gold += Math.round((rival.lootPool.gold * 0.15) * bonusLootRatio);
    } else if (targetKey === 'watchtower') {
      newLoot.flora += Math.round((rival.lootPool.flora * 0.4) * bonusLootRatio);
    }

    const updatedStrikes = strikesLeft - 1;
    const nextRaidState = {
      ...activeRaid,
      strikesLeft: updatedStrikes,
      targetedBuildings: {
        ...targetedBuildings,
        [targetKey]: (targetedBuildings[targetKey] || 0) + 1
      },
      lootGained: newLoot,
      isFinished: updatedStrikes === 0
    };

    setActiveRaid(nextRaidState);

    if (updatedStrikes === 0) {
      setGameState(prev => ({
        ...prev,
        totalRaidsWon: prev.totalRaidsWon + 1,
        resources: {
          ...prev.resources,
          gold: Math.min(stats.caps.gold, prev.resources.gold + newLoot.gold),
          food: Math.min(stats.caps.food, prev.resources.food + newLoot.food),
          wood: Math.min(stats.caps.wood, prev.resources.wood + newLoot.wood),
          stone: Math.min(stats.caps.stone, prev.resources.stone + newLoot.stone),
          flora: Math.min(stats.caps.flora, prev.resources.flora + newLoot.flora)
        },
        battleLogs: [
          {
            id: `log-victory-${Date.now()}`,
            title: `Sacked ${rival.name}`,
            text: `Catapult vanguard extracted ${newLoot.gold} Gold and ${newLoot.food} Food stores.`,
            type: 'win',
            timestamp: Date.now()
          },
          ...prev.battleLogs
        ]
      }));
    }
  };

  const handleDoubleRaidBounty = () => {
    if (!activeRaid || activeRaid.doubled) return;
    sounds.playUpgrade();
    const doubledLoot = { ...activeRaid.lootGained };

    setGameState(prev => ({
      ...prev,
      resources: {
        ...prev.resources,
        gold: Math.min(stats.caps.gold, prev.resources.gold + doubledLoot.gold),
        food: Math.min(stats.caps.food, prev.resources.food + doubledLoot.food),
        wood: Math.min(stats.caps.wood, prev.resources.wood + doubledLoot.wood),
        stone: Math.min(stats.caps.stone, prev.resources.stone + doubledLoot.stone),
        flora: Math.min(stats.caps.flora, prev.resources.flora + doubledLoot.flora)
      }
    }));

    setActiveRaid(prev => ({
      ...prev,
      doubled: true,
      lootGained: {
        gold: prev.lootGained.gold * 2,
        food: prev.lootGained.food * 2,
        wood: prev.lootGained.wood * 2,
        stone: prev.lootGained.stone * 2,
        flora: prev.lootGained.flora * 2
      }
    }));
  };

  const handleResetKingdom = () => {
    localStorage.removeItem('realmraid_parchment_v1');
    setGameState(DEFAULT_STATE);
    setDeskView('citadel');
  };

  if (!gameState.faction) {
    return (
      <ThroneRoomOnboarding
        onSelectFaction={(factionId) => {
          sounds.playWaxSealThud();
          setGameState(prev => ({ ...prev, faction: factionId }));
        }}
      />
    );
  }

  return (
    <div
      onMouseMove={handlePointerMove}
      className={`relative w-full h-screen overflow-hidden bg-stone-950 font-serif select-none flex flex-col justify-between ${screenShake ? 'animate-bounce' : ''}`}
    >
      {/* -------------------------------------------------------------
          DIEGETIC WAX STAMP CURSOR (Tracks pointer when hovering decrees)
          ------------------------------------------------------------- */}
      {isHoveringUpgradeable && (
        <div
          className="fixed pointer-events-none z-50 transition-transform duration-75"
          style={{
            left: cursorPos.x - 22,
            top: cursorPos.y - 28,
            transform: stampingDecree ? 'scale(0.85) translateY(10px)' : 'scale(1)'
          }}
        >
          <div className="w-12 h-14 bg-gradient-to-b from-amber-200 via-amber-600 to-amber-900 border-2 border-amber-950 rounded-t-full rounded-b-lg shadow-[0_8px_20px_rgba(0,0,0,0.8)] flex flex-col items-center justify-between p-1">
            <div className="w-4 h-4 rounded-full bg-amber-300 border border-amber-800 shadow-inner" />
            <div className="w-9 h-3 rounded bg-red-800 border border-amber-400/80 flex items-center justify-center">
              <span className="text-[8px] text-amber-200 font-black">SEAL</span>
            </div>
          </div>
        </div>
      )}

      {/* Ephemeral Stamped Crimson Wax Splats */}
      {waxSplats.map(splat => (
        <div
          key={splat.id}
          className="fixed pointer-events-none z-40 animate-ping opacity-80"
          style={{ left: splat.x - 24, top: splat.y - 24 }}
        >
          <div className="w-12 h-12 rounded-full bg-red-700/90 border-2 border-red-500 shadow-[0_0_25px_rgba(220,38,38,0.9)] flex items-center justify-center">
            <span className="text-xs text-amber-200">⚜️</span>
          </div>
        </div>
      ))}

      {/* -------------------------------------------------------------
          LAYER 1: UPPER BACKGROUND (Parallax Masonry Arch & God-Rays)
          ------------------------------------------------------------- */}
      <div
        className="absolute inset-0 pointer-events-none z-0 transition-transform duration-300 ease-out"
        style={{
          transform: `translate(${tilt.x * -16}px, ${tilt.y * -10}px)`
        }}
      >
        {/* Stone Arch Silhouette */}
        <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-stone-900 via-stone-950/80 to-transparent flex justify-center">
          <div className="w-[85%] h-28 border-b-4 border-stone-800/90 rounded-b-[140px] shadow-[inset_0_-20px_40px_rgba(0,0,0,0.8)] flex items-center justify-center relative">
            {/* Stained Glass Rose Window */}
            <div className="w-20 h-20 rounded-full border-2 border-stone-700/80 bg-gradient-to-tr from-amber-500/20 via-rose-500/20 to-blue-500/20 flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.25)]">
              <span className="text-xl opacity-70">⚜️</span>
            </div>
          </div>
        </div>

        {/* Dynamic God-Ray Cast Across Table */}
        <div
          className={`absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[900px] pointer-events-none transition-colors duration-1000 ${
            isStarving
              ? 'bg-gradient-to-b from-red-600/25 via-rose-950/15 to-transparent'
              : 'bg-gradient-to-b from-amber-400/20 via-yellow-600/10 to-transparent'
          }`}
          style={{ clipPath: 'polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%)' }}
        />

        {/* Flickering Sconces */}
        <div className="absolute top-16 left-4 sm:left-12 flex flex-col items-center">
          <div className="w-3.5 h-3.5 rounded-full bg-amber-400 animate-ping opacity-60 blur-xs" />
          <div className="w-3 h-5 rounded-t-full bg-gradient-to-t from-amber-600 to-yellow-300 shadow-[0_0_25px_#f59e0b]" />
          <div className="w-1.5 h-6 bg-stone-700 rounded-b" />
        </div>
        <div className="absolute top-16 right-4 sm:right-12 flex flex-col items-center">
          <div className="w-3.5 h-3.5 rounded-full bg-amber-400 animate-ping opacity-60 blur-xs" />
          <div className="w-3 h-5 rounded-t-full bg-gradient-to-t from-amber-600 to-yellow-300 shadow-[0_0_25px_#f59e0b]" />
          <div className="w-1.5 h-6 bg-stone-700 rounded-b" />
        </div>

        {/* Heraldic Faction Banner */}
        <div className="absolute top-4 left-24 hidden md:flex flex-col items-center opacity-85">
          <div className={`w-14 h-28 bg-gradient-to-b ${currentFaction.bannerGradient} border-x border-b border-amber-500/40 rounded-b-lg shadow-xl flex flex-col items-center justify-between p-1.5`}>
            <span className="text-sm">{currentFaction.sigil}</span>
            <span className="text-[9px] uppercase tracking-widest text-amber-300 font-mono font-bold writing-vertical rotate-180">
              {currentFaction.id}
            </span>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          LAYER 2: DIEGETIC STATUS HUD (Floating Gilded Banner)
          ------------------------------------------------------------- */}
      <header className="relative z-20 w-full px-4 sm:px-8 pt-3 flex flex-wrap items-center justify-between gap-2">
        {/* Monarch Title, Realm Rating & Astrological Chronometer */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="bg-stone-900/90 border border-amber-600/40 rounded-2xl px-3 py-1.5 shadow-lg backdrop-blur flex items-center gap-2">
            <span className="text-xl">{currentFaction.sigil}</span>
            <div>
              <h1 className="text-xs sm:text-sm font-black tracking-wider text-amber-200">
                {currentFaction.name}
              </h1>
              <span className="text-[10px] text-amber-500/80 font-mono block">
                Rating {stats.overallRating} ⭐ • Def {Math.round(stats.defensePower)}
              </span>
            </div>
          </div>

          {/* Astrological Chronometer & Weather Dial */}
          <RealmChronometerHUD
            timeState={gameState.timeState || { day: 1, hour: 8, minute: 0, seasonIndex: 0, weather: 'clear', timeSpeed: 1 }}
            onToggleSpeed={handleToggleSpeed}
          />

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="w-8 h-8 rounded-xl bg-stone-900/80 border border-amber-700/40 text-amber-400 hover:text-amber-200 flex items-center justify-center text-xs shadow transition active:scale-95"
            title="Toggle Synthesizer Sound"
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>

        {/* Famine Warning Inscription */}
        {isStarving && (
          <div className="bg-red-950/90 border-2 border-red-600 text-red-200 px-3 py-1 rounded-xl text-xs font-bold shadow-[0_0_20px_rgba(220,38,38,0.4)] flex items-center gap-2 animate-pulse">
            <span>⚠️</span>
            <span>FAMINE IN THE REALM: Sustenance exhausted! Harvest yields & defenses halved.</span>
          </div>
        )}

        {/* Compact Gilded Resource HUD */}
        <div className="flex flex-wrap items-center gap-1.5 bg-gradient-to-r from-stone-950/90 via-[#2a1c12]/90 to-stone-950/90 border-2 border-amber-700/60 rounded-2xl p-1.5 shadow-2xl backdrop-blur">
          {[
            { key: 'food', label: 'Food', icon: '🌾', color: 'text-amber-300', upkeep: stats.upkeep.food },
            { key: 'water', label: 'Water', icon: '💧', color: 'text-sky-300', upkeep: stats.upkeep.water },
            { key: 'wood', label: 'Wood', icon: '🪵', color: 'text-orange-300' },
            { key: 'stone', label: 'Stone', icon: '🪨', color: 'text-stone-300' },
            { key: 'flora', label: 'Flora', icon: '🌿', color: 'text-emerald-300' },
            { key: 'gold', label: 'Gold', icon: '🪙', color: 'text-yellow-300' }
          ].map(res => {
            const val = Math.floor(gameState.resources[res.key] || 0);
            const cap = stats.caps[res.key] || 1000;
            return (
              <div
                key={res.key}
                className="px-2 py-0.5 rounded-lg bg-stone-900/90 border border-amber-800/40 flex items-center gap-1 text-xs font-mono"
              >
                <span>{res.icon}</span>
                <span className={`font-bold ${res.color}`}>{val.toLocaleString()}</span>
                <span className="text-[9px] text-stone-500">/{cap}</span>
                {res.upkeep && (
                  <span className="text-[9px] text-rose-400 font-bold ml-0.5">
                    -{res.upkeep.toFixed(1)}/s
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </header>

      {/* -------------------------------------------------------------
          LAYER 3: THE OAK WAR TABLE & THE LIVING PARCHMENT
          ------------------------------------------------------------- */}
      <main className="relative z-10 flex-1 w-full max-w-6xl mx-auto flex items-center justify-center p-2 sm:p-4 perspective-[1200px]">
        {/* The Heavy Iron-Banded Oak Desk Surface with Parallax Tilt */}
        <div
          className="relative w-full h-[82vh] max-h-[680px] bg-[#221710] border-4 border-[#3e271c] rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.9),inset_0_2px_15px_rgba(255,255,255,0.08)] flex items-center justify-center p-3 sm:p-6 transition-transform duration-200 ease-out overflow-hidden"
          style={{
            transform: `rotateX(${12 + tilt.y * 4}deg) rotateY(${tilt.x * 6}deg)`,
            backgroundImage: 'radial-gradient(#2d1e15 15%, transparent 16%), radial-gradient(#18100b 15%, transparent 16%)',
            backgroundSize: '24px 24px',
            backgroundPosition: '0 0, 12px 12px'
          }}
        >
          {/* Iron Corner Bands */}
          <div className="absolute top-2 left-2 w-10 h-10 border-t-4 border-l-4 border-amber-800/80 rounded-tl-xl pointer-events-none" />
          <div className="absolute top-2 right-2 w-10 h-10 border-t-4 border-r-4 border-amber-800/80 rounded-tr-xl pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-10 h-10 border-b-4 border-l-4 border-amber-800/80 rounded-bl-xl pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-10 h-10 border-b-4 border-r-4 border-amber-800/80 rounded-br-xl pointer-events-none" />

          {/* Radial Candle Glows */}
          <div className="absolute top-8 left-8 w-44 h-44 rounded-full bg-radial from-amber-400/25 via-amber-700/10 to-transparent blur-xl pointer-events-none animate-pulse" />
          <div className="absolute bottom-10 right-8 w-48 h-48 rounded-full bg-radial from-amber-400/20 via-yellow-700/10 to-transparent blur-xl pointer-events-none animate-pulse" />

          {/* Tabletop Prop 1: Pewter Goblet / Sustenance Horn */}
          <div
            className="absolute top-4 left-4 z-20 hidden lg:flex flex-col items-center bg-stone-900/90 border border-amber-800/60 p-2.5 rounded-2xl shadow-xl backdrop-blur"
            title="Citadel Sustenance Horn"
          >
            <div className="relative w-8 h-20 bg-stone-800 border-2 border-stone-600 rounded-b-2xl overflow-hidden flex flex-col justify-end shadow-inner">
              <div
                className={`w-full transition-all duration-700 ${isStarving ? 'bg-rose-900 h-1' : 'bg-gradient-to-t from-amber-600 to-yellow-400'}`}
                style={{ height: `${Math.min(100, Math.max(5, ((gameState.resources.food + gameState.resources.water) / (stats.caps.food + stats.caps.water)) * 100))}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-amber-300/80 mt-1 font-bold">Rations</span>
          </div>

          {/* Tabletop Prop 2: Iron Strongbox */}
          <div
            className="absolute top-4 right-4 z-20 hidden lg:flex flex-col items-center bg-stone-900/90 border border-amber-800/60 p-2.5 rounded-2xl shadow-xl backdrop-blur"
            title="Imperial Treasury Vault Protection"
          >
            <div className="w-14 h-12 bg-gradient-to-b from-stone-800 to-stone-950 border-2 border-amber-700/60 rounded-xl flex flex-col items-center justify-center relative shadow-lg">
              <span className="text-base">🪙</span>
              <span className="text-[9px] font-mono text-amber-400 font-bold">
                {Math.round(currentFaction.vaultProtectionBase * 100)}% Safe
              </span>
            </div>
            <span className="text-[10px] font-mono text-amber-300/80 mt-1 font-bold">Deep Vault</span>
          </div>

          {/* -------------------------------------------------------
              THE CENTRAL LIVING PARCHMENT SCROLL
              ------------------------------------------------------- */}
          <div className="relative w-full h-full max-w-4xl bg-[#f4ecd8] border-[6px] border-[#cbb38b] rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.8),inset_0_0_30px_rgba(139,94,60,0.4)] text-stone-900 flex flex-col overflow-hidden">
            {/* Brass Corner Weights */}
            <div className="absolute top-1.5 left-1.5 w-6 h-6 rounded-full bg-gradient-to-br from-yellow-300 to-amber-700 border border-amber-900 shadow-md z-30" />
            <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-gradient-to-br from-yellow-300 to-amber-700 border border-amber-900 shadow-md z-30" />
            <div className="absolute bottom-1.5 left-1.5 w-6 h-6 rounded-full bg-gradient-to-br from-yellow-300 to-amber-700 border border-amber-900 shadow-md z-30" />
            <div className="absolute bottom-1.5 right-1.5 w-6 h-6 rounded-full bg-gradient-to-br from-yellow-300 to-amber-700 border border-amber-900 shadow-md z-30" />

            {/* Parchment Header & Single Hamburger Menu Switcher */}
            <div className="px-4 py-2 border-b-2 border-[#bfa379]/60 flex items-center justify-between bg-[#ece1c5]/60 z-20">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg">📜</span>
                <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#5c3e23]">
                  {deskView === 'citadel' && 'The Living Cartography: Royal Citadel'}
                  {deskView === 'war' && 'War Council: Scouted Encampments'}
                  {deskView === 'chronicle' && 'Chronicle of Battle & Kingdom Ledger'}
                  {deskView === 'menu' && 'Grand Realm Directory: Royal Menu'}
                </span>
              </div>

              {/* Single Menu Hamburger Icon Button */}
              <button
                onClick={() => {
                  sounds.playCoin();
                  setDeskView(deskView === 'menu' ? 'citadel' : 'menu');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 relative shadow-md active:scale-95 ${
                  deskView === 'menu'
                    ? 'bg-[#5c3e23] text-amber-100 ring-2 ring-amber-600/60'
                    : 'bg-[#ddcca8] text-[#442813] hover:bg-[#d0bc93] border border-[#8c6843]'
                }`}
                title="Toggle Realm Menu"
              >
                <div className="flex flex-col justify-center items-center w-3.5 h-3 gap-0.5">
                  <span className={`w-3.5 h-0.5 rounded-full transition-all ${deskView === 'menu' ? 'bg-amber-200 rotate-45 translate-y-1' : 'bg-[#442813]'}`} />
                  <span className={`w-3.5 h-0.5 rounded-full transition-all ${deskView === 'menu' ? 'opacity-0' : 'bg-[#442813]'}`} />
                  <span className={`w-3.5 h-0.5 rounded-full transition-all ${deskView === 'menu' ? 'bg-amber-200 -rotate-45 -translate-y-1' : 'bg-[#442813]'}`} />
                </div>
                <span className="tracking-wide">Menu</span>
                {gameState.revengeLedger.some(r => !r.revenged) && (
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping absolute -top-1 -right-1 border border-[#ebdcc1]" />
                )}
              </button>
            </div>

            {/* Parchment Body Canvas */}
            <div className="relative flex-1 w-full overflow-hidden flex flex-col">
              {deskView === 'citadel' && (
                <ParchmentCitadelMap
                  buildings={gameState.buildings}
                  harvestTimers={gameState.harvestTimers}
                  onHarvest={handleHarvestBuilding}
                  selectedBuildingId={selectedBuildingId}
                  onSelectBuilding={setSelectedBuildingId}
                  onUpgradeBuilding={handleIssueRoyalDecree}
                  resources={gameState.resources}
                  faction={currentFaction}
                  stats={stats}
                  timeState={gameState.timeState || { day: 1, hour: 8, minute: 0, seasonIndex: 0, weather: 'clear', timeSpeed: 1 }}
                  inkPulseTick={inkPulseTick}
                  stampingDecree={stampingDecree}
                  onHoverUpgrade={setIsHoveringUpgradeable}
                />
              )}

              {deskView === 'war' && (
                <ParchmentWarCouncil
                  stats={stats}
                  state={gameState}
                  onLaunchRaid={startRaidAdFlow}
                  onDeclareBloodFeud={(feudRecord) => {
                    const feudRival = {
                      id: `feud-${feudRecord.id}`,
                      name: feudRecord.rivalName,
                      faction: feudRecord.rivalFaction,
                      rating: stats.overallRating,
                      defensePower: stats.defensePower,
                      lootPool: {
                        gold: (feudRecord.stolen.gold || 50) * 2,
                        food: (feudRecord.stolen.food || 50) * 2,
                        wood: (feudRecord.stolen.wood || 40) * 2,
                        stone: (feudRecord.stolen.stone || 40) * 2,
                        flora: (feudRecord.stolen.flora || 20) * 2
                      }
                    };
                    startRaidAdFlow(feudRival);
                  }}
                />
              )}

              {deskView === 'chronicle' && (
                <ParchmentChronicleTome
                  logs={gameState.battleLogs}
                  state={gameState}
                  onResetSave={handleResetKingdom}
                />
              )}

              {deskView === 'menu' && (
                <ParchmentMenuView
                  currentFaction={currentFaction}
                  stats={stats}
                  state={gameState}
                  isMuted={isMuted}
                  onToggleMute={() => setIsMuted(!isMuted)}
                  onNavigate={(view) => {
                    if (view === 'war') sounds.playDaggerThrust();
                    else sounds.playCoin();
                    setDeskView(view);
                  }}
                  onResetSave={handleResetKingdom}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* -------------------------------------------------------------
          LAYER 4: LOWER FOREGROUND (The Royal Throne & Monarch Hands)
          ------------------------------------------------------------- */}
      <footer
        className="relative z-30 pointer-events-none w-full flex items-end justify-between px-2 sm:px-8 pb-1 transition-transform duration-200 ease-out"
        style={{
          transform: `translate(${tilt.x * 12}px, ${tilt.y * 8}px)`
        }}
      >
        {/* Left Throne Armrest */}
        <div className="w-24 sm:w-40 h-16 sm:h-24 bg-gradient-to-t from-red-950 via-rose-900 to-amber-900/60 border-t-4 border-r-4 border-amber-600/70 rounded-tr-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.8)] flex items-center justify-center relative">
          <div className="flex gap-2 opacity-60">
            <div className="w-2 h-2 rounded-full bg-amber-400 shadow" />
            <div className="w-2 h-2 rounded-full bg-amber-400 shadow" />
            <div className="w-2 h-2 rounded-full bg-amber-400 shadow" />
          </div>
          {/* Monarch Signet Ring */}
          <div className="absolute -top-3 right-3 w-8 h-8 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 border-2 border-amber-700 shadow-md flex items-center justify-center text-xs pointer-events-auto cursor-pointer hover:scale-110 transition">
            <span>{currentFaction.sigil}</span>
          </div>
        </div>

        {/* Throne center hint */}
        <div className="pointer-events-auto bg-stone-950/80 border border-amber-800/40 px-4 py-1 rounded-t-xl text-[11px] font-mono text-amber-300/80 backdrop-blur">
          Royal Throne POV • Click completed harvests to collect • Tap to seal upgrades
        </div>

        {/* Right Throne Armrest */}
        <div className="w-24 sm:w-40 h-16 sm:h-24 bg-gradient-to-t from-red-950 via-rose-900 to-amber-900/60 border-t-4 border-l-4 border-amber-600/70 rounded-tl-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.8)] flex items-center justify-center relative">
          <div className="flex gap-2 opacity-60">
            <div className="w-2 h-2 rounded-full bg-amber-400 shadow" />
            <div className="w-2 h-2 rounded-full bg-amber-400 shadow" />
            <div className="w-2 h-2 rounded-full bg-amber-400 shadow" />
          </div>
          <button
            onClick={() => { sounds.playDaggerThrust(); setDeskView(v => v === 'war' ? 'citadel' : 'war'); }}
            className="absolute -top-4 left-3 px-2 py-1 rounded-lg bg-stone-900 border border-red-700/80 text-rose-300 text-xs font-mono font-bold shadow-xl pointer-events-auto hover:bg-stone-800 active:scale-95 transition"
            title="Draw War Dagger"
          >
            🗡️ War Dagger
          </button>
        </div>
      </footer>

      {/* REWARDED VIDEO AD GATE SIMULATOR */}
      {adModalOpen && (
        <RewardedAdGateModal
          countdown={adCountdown}
          targetRival={pendingRaidTarget}
          onComplete={confirmAdAndLaunchPillage}
          onDevSkip={confirmAdAndLaunchPillage}
        />
      )}

      {/* ACTIVE 2.5D CATAPULT RAID */}
      {activeRaid && (
        <ParchmentRaidBattlefieldModal
          raid={activeRaid}
          onStrike={handleCatapultStrike}
          onDoubleLoot={handleDoubleRaidBounty}
          onClose={() => setActiveRaid(null)}
        />
      )}
    </div>
  );
}

// =============================================================
// PARCHMENT SUB-VIEW 1: CITADEL ISOMETRIC CARTOGRAPHY
// =============================================================
function ParchmentCitadelMap({
  buildings,
  harvestTimers,
  onHarvest,
  selectedBuildingId,
  onSelectBuilding,
  onUpgradeBuilding,
  resources,
  faction,
  stats,
  timeState,
  inkPulseTick,
  stampingDecree,
  onHoverUpgrade
}) {
  const selectedDef = BUILDINGS[selectedBuildingId] || BUILDINGS.keep;
  const currentLvl = buildings[selectedBuildingId] || 1;
  const discount = faction?.id === 'humans' ? 0.5 : 1.0;

  const costGold = Math.round(selectedDef.baseCost.gold * Math.pow(selectedDef.costMult, currentLvl - 1) * discount);
  const costWood = Math.round(selectedDef.baseCost.wood * Math.pow(selectedDef.costMult, currentLvl - 1) * discount);
  const costStone = Math.round(selectedDef.baseCost.stone * Math.pow(selectedDef.costMult, currentLvl - 1) * discount);

  const canAfford =
    resources.gold >= costGold &&
    resources.wood >= costWood &&
    resources.stone >= costStone;

  const weatherCond = WEATHER_CONDITIONS[timeState?.weather || 'clear'] || WEATHER_CONDITIONS.clear;

  return (
    <div className="flex-1 flex flex-col h-full relative">
      {}
      <div
        className="absolute inset-0 pointer-events-none transition-colors duration-1000 z-10 overflow-hidden"
        style={{
          backgroundColor:
            timeState.hour < 5 || timeState.hour >= 21
              ? 'rgba(15, 23, 42, 0.40)'
              : timeState.hour >= 18
              ? 'rgba(180, 83, 9, 0.20)'
              : weatherCond.tint
        }}
      >
        {/* Visual Weather Particles */}
        {timeState.weather === 'downpour' && (
          <div className="absolute inset-0 opacity-35 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:14px_14px] animate-pulse" />
        )}
        {timeState.weather === 'blizzard' && (
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:20px_20px] animate-ping" />
        )}
        {timeState.weather === 'heatwave' && (
          <div className="absolute inset-0 bg-gradient-to-t from-amber-600/10 via-transparent to-orange-500/10 animate-pulse" />
        )}
      </div>

      {/* The 2.5D Isometric SVG Living Ink Canvas */}
      <div className="flex-1 w-full relative flex items-center justify-center overflow-hidden">
        <svg viewBox="0 0 540 330" className="w-full h-full max-h-[360px] cursor-pointer select-none">
          <defs>
            <linearGradient id="parchmentGround" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ebdcc1" />
              <stop offset="100%" stopColor="#dfcba6" />
            </linearGradient>
            <linearGradient id="roofGoldInk" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
          </defs>

          {/* Isometric Ground Grid Lines */}
          {[0, 1, 2, 3, 4].map(gx =>
            [0, 1, 2, 3, 4].map(gy => {
              const { x, y } = gridToParchmentIso(gx, gy, 270, 50);
              const isRoad = gx === 2 || gy === 2;
              return (
                <polygon
                  key={`tile-${gx}-${gy}`}
                  points={`
                    ${x},${y - ISO_H / 2}
                    ${x + ISO_W / 2},${y}
                    ${x},${y + ISO_H / 2}
                    ${x - ISO_W / 2},${y}
                  `}
                  fill={isRoad ? '#d5be97' : 'url(#parchmentGround)'}
                  stroke="#8c6843"
                  strokeWidth="1.2"
                  strokeDasharray={isRoad ? '2,2' : 'none'}
                />
              );
            })
          )}

          {/* Animated Aqueduct Pulses */}
          <line
            x1={gridToParchmentIso(1, 1, 270, 50).x}
            y1={gridToParchmentIso(1, 1, 270, 50).y}
            x2={gridToParchmentIso(2, 2, 270, 50).x}
            y2={gridToParchmentIso(2, 2, 270, 50).y}
            stroke="#0284c7"
            strokeWidth="2"
            strokeDasharray="4,6"
            strokeDashoffset={-inkPulseTick}
            opacity="0.8"
          />
          <line
            x1={gridToParchmentIso(3, 1, 270, 50).x}
            y1={gridToParchmentIso(3, 1, 270, 50).y}
            x2={gridToParchmentIso(2, 2, 270, 50).x}
            y2={gridToParchmentIso(2, 2, 270, 50).y}
            stroke="#0284c7"
            strokeWidth="2"
            strokeDasharray="4,6"
            strokeDashoffset={-inkPulseTick}
            opacity="0.8"
          />

          {/* 2.5D Isometric Buildings with Illuminated Harvest Rings */}
          {Object.values(BUILDINGS)
            .sort((a, b) => (a.gx + a.gy) - (b.gx + b.gy))
            .map(b => {
              const level = buildings[b.id] || 1;
              const { x, y } = gridToParchmentIso(b.gx, b.gy, 270, 50);
              const isSelected = selectedBuildingId === b.id;
              const height = 24 + level * 7;

              // Harvest calculation
              const cycleDur = b.cycleDuration || 0;
              const timerVal = harvestTimers[b.id] || 0;
              const progressRatio = cycleDur > 0 ? Math.min(1, timerVal / cycleDur) : 0;
              const isReadyToHarvest = cycleDur > 0 && progressRatio >= 1;

              return (
                <g
                  key={b.id}
                  onClick={() => {
                    if (isReadyToHarvest) {
                      onHarvest(b.id);
                    } else {
                      sounds.playCoin();
                      onSelectBuilding(b.id);
                    }
                  }}
                  onMouseEnter={() => {
                    if (isSelected && canAfford) onHoverUpgrade(true);
                  }}
                  onMouseLeave={() => onHoverUpgrade(false)}
                  className="cursor-pointer group"
                >
                  {/* Cast Ground Shadow */}
                  <polygon
                    points={`
                      ${x},${y}
                      ${x + ISO_W / 2},${y - ISO_H / 4}
                      ${x + ISO_W / 1.5},${y + 8}
                      ${x},${y + 6}
                    `}
                    fill="rgba(78, 52, 34, 0.35)"
                  />

                  {/* Harvest Timer Arc / Ring around building base */}
                  {cycleDur > 0 && (
                    <ellipse
                      cx={x}
                      cy={y}
                      rx={ISO_W / 2 + 4}
                      ry={ISO_H / 2 + 2}
                      fill="none"
                      stroke={isReadyToHarvest ? '#16a34a' : '#d97706'}
                      strokeWidth={isReadyToHarvest ? '3' : '2'}
                      strokeDasharray="140"
                      strokeDashoffset={140 - (progressRatio * 140)}
                      opacity="0.85"
                    />
                  )}

                  {/* Left Facet */}
                  <polygon
                    points={`
                      ${x - ISO_W / 2.5},${y - height}
                      ${x},${y + ISO_H / 3 - height}
                      ${x},${y + ISO_H / 3}
                      ${x - ISO_W / 2.5},${y}
                    `}
                    fill={isSelected ? '#c2410c' : '#78553d'}
                    stroke="#3f2314"
                    strokeWidth="1.2"
                  />

                  {/* Right Facet */}
                  <polygon
                    points={`
                      ${x},${y + ISO_H / 3 - height}
                      ${x + ISO_W / 2.5},${y - height}
                      ${x + ISO_W / 2.5},${y}
                      ${x},${y + ISO_H / 3}
                    `}
                    fill={isSelected ? '#9a3412' : '#5e3f2b'}
                    stroke="#3f2314"
                    strokeWidth="1.2"
                  />

                  {/* Roof Diamond */}
                  <polygon
                    points={`
                      ${x},${y - ISO_H / 3 - height}
                      ${x + ISO_W / 2.5},${y - height}
                      ${x},${y + ISO_H / 3 - height}
                      ${x - ISO_W / 2.5},${y - height}
                    `}
                    fill={isSelected ? '#f97316' : b.id === 'keep' ? 'url(#roofGoldInk)' : '#9c7349'}
                    stroke="#3f2314"
                    strokeWidth="1.2"
                  />

                  {/* Ink Drawn Icon & Tier Seal */}
                  <text
                    x={x}
                    y={y - height - 4}
                    textAnchor="middle"
                    className="text-base select-none pointer-events-none"
                  >
                    {b.inkSymbol}
                  </text>
                  <rect
                    x={x - 14}
                    y={y - height + 8}
                    width="28"
                    height="12"
                    rx="3"
                    fill="#3f2314"
                    stroke="#eab308"
                    strokeWidth="1"
                  />
                  <text
                    x={x}
                    y={y - height + 17}
                    textAnchor="middle"
                    fill="#fef08a"
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    T{level}
                  </text>

                  {/* Click-to-Collect Floating Ink Banner */}
                  {isReadyToHarvest && (
                    <g className="animate-bounce">
                      <rect
                        x={x - 32}
                        y={y - height - 24}
                        width="64"
                        height="16"
                        rx="4"
                        fill="#15803d"
                        stroke="#86efac"
                        strokeWidth="1.2"
                        className="shadow"
                      />
                      <text
                        x={x}
                        y={y - height - 12}
                        textAnchor="middle"
                        fill="#f0fdf4"
                        fontSize="9"
                        fontWeight="black"
                        fontFamily="sans-serif"
                      >
                        CLAIM YIELD!
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
        </svg>
      </div>

      {/* Diegetic Inspection Banner & Wax Seal Decree Button */}
      <div className="bg-[#e4d4b3] border-t-2 border-[#bfa379] p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#cbb38b] border border-[#8c6843] flex items-center justify-center text-2xl shadow-inner">
            {selectedDef.inkSymbol}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-[#442813]">{selectedDef.name}</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#6b4724] text-amber-200 font-bold">
                Tier {currentLvl}
              </span>
              {selectedDef.cycleDuration && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-900/20 text-amber-900 font-bold">
                  ⏱️ {selectedDef.cycleDuration}s Harvest
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#6b4a2e] max-w-sm line-clamp-1">{selectedDef.description}</p>
          </div>
        </div>

        {/* Cost Requirements & Monarch Wax Seal Stamper */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className={`px-2 py-0.5 rounded border ${resources.gold >= costGold ? 'bg-yellow-900/10 border-yellow-800 text-yellow-900' : 'bg-red-900/10 border-red-800 text-red-900 font-bold'}`}>
              🪙 {costGold}
            </span>
            <span className={`px-2 py-0.5 rounded border ${resources.wood >= costWood ? 'bg-orange-900/10 border-orange-800 text-orange-900' : 'bg-red-900/10 border-red-800 text-red-900 font-bold'}`}>
              🪵 {costWood}
            </span>
            <span className={`px-2 py-0.5 rounded border ${resources.stone >= costStone ? 'bg-stone-900/10 border-stone-800 text-stone-900' : 'bg-red-900/10 border-red-800 text-red-900 font-bold'}`}>
              🪨 {costStone}
            </span>
          </div>

          <button
            onClick={(e) => onUpgradeBuilding(selectedBuildingId, e)}
            onMouseEnter={() => { if (canAfford) onHoverUpgrade(true); }}
            onMouseLeave={() => onHoverUpgrade(false)}
            disabled={!canAfford || stampingDecree}
            className={`px-4 py-2 rounded-xl font-black text-xs transition flex items-center gap-2 shadow-lg ${
              canAfford
                ? 'bg-gradient-to-r from-red-800 to-rose-900 text-amber-100 hover:brightness-110 active:scale-95 shadow-red-950/40 border border-red-700'
                : 'bg-stone-400 text-stone-700 cursor-not-allowed border border-stone-500'
            }`}
          >
            <span className={stampingDecree ? 'animate-spin' : ''}>🩸</span>
            <span>Seal Royal Decree (T{currentLvl + 1})</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================================
// ASTROLOGICAL CHRONOMETER & WEATHER HUD
// =============================================================
function RealmChronometerHUD({ timeState, onToggleSpeed }) {
  const season = SEASONS[SEASON_ORDER[timeState.seasonIndex]] || SEASONS.spring;
  const weather = WEATHER_CONDITIONS[timeState.weather] || WEATHER_CONDITIONS.clear;
  const isNight = timeState.hour < 6 || timeState.hour >= 20;

  const formattedTime = `${timeState.hour.toString().padStart(2, '0')}:${timeState.minute.toString().padStart(2, '0')}`;

  return (
    <div className="flex items-center gap-2 bg-stone-900/90 border border-amber-600/50 rounded-2xl px-2.5 sm:px-3 py-1.5 shadow-xl backdrop-blur text-amber-200">
      {/* Sun / Moon Orb Dial */}
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-amber-700 via-stone-800 to-amber-950 border border-amber-500/60 flex items-center justify-center text-xs sm:text-sm shadow-inner">
        {isNight ? '🌙' : '☀️'}
      </div>

      <div className="text-left">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-black font-mono tracking-wider">{formattedTime}</span>
          <span className="text-[10px] font-mono text-stone-400">Day {timeState.day}</span>
        </div>
        <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-mono">
          <span className={season.color}>{season.icon} {season.name}</span>
          <span className="text-stone-500">•</span>
          <span title={weather.name}>{weather.icon} {weather.name}</span>
        </div>
      </div>

      {/* Speed Accelerator Controls */}
      <button
        onClick={onToggleSpeed}
        className="ml-1 px-1.5 py-0.5 rounded bg-amber-900/40 hover:bg-amber-900/70 border border-amber-600/40 text-[10px] font-mono font-bold text-amber-300 transition active:scale-95"
        title="Cycle Simulation Speed (1x / 2x / 5x)"
      >
        {timeState.timeSpeed}x
      </button>
    </div>
  );
}

// =============================================================
// PARCHMENT SUB-VIEW 2: WAR COUNCIL & BLOOD FEUD BOARD
// =============================================================
function ParchmentWarCouncil({ stats, state, onLaunchRaid, onDeclareBloodFeud }) {
  const [rivals, setRivals] = useState(() => generateRivals(stats.overallRating));
  const factionData = FACTIONS[state.faction] || FACTIONS.humans;

  const handleRefresh = () => {
    sounds.playCoin();
    setRivals(generateRivals(stats.overallRating));
  };

  return (
    <div className="flex-1 p-3 sm:p-5 overflow-y-auto space-y-4">
      <div className="flex items-center justify-between border-b-2 border-[#bfa379]/60 pb-2">
        <div>
          <h2 className="text-sm sm:text-base font-black text-[#442813] flex items-center gap-1.5">
            <span>⚔️ Scouted Rival Strongholds (±7% Rating)</span>
          </h2>
          <p className="text-[11px] text-[#6b4a2e]">
            Intercepted cartography pins targets holding exposed unbanked stores vulnerable to catapult bombardments.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="px-2.5 py-1 rounded-lg bg-[#ddcca8] hover:bg-[#d0bc93] text-[#442813] text-xs font-bold border border-[#8c6843] flex items-center gap-1 transition"
        >
          <span>🔄</span>
          <span>Scout Targets</span>
        </button>
      </div>

      {/* Target Settlement Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {rivals.map(rival => {
          const rivalFaction = FACTIONS[rival.faction] || FACTIONS.humans;
          return (
            <div
              key={rival.id}
              className="bg-[#ebdcc1] border-2 border-[#8c6843] rounded-2xl p-3 shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <h3 className="text-xs font-black text-[#442813]">{rival.name}</h3>
                  <span className="text-[10px] font-mono font-bold text-amber-800">
                    ⭐ {rival.rating}
                  </span>
                </div>
                <span className="text-[9px] uppercase tracking-wider text-[#6b4a2e] block mt-0.5">
                  {rivalFaction.badge} • Def {rival.defensePower}
                </span>

                <div className="mt-2 pt-2 border-t border-[#bfa379]/60">
                  <span className="text-[9px] font-mono text-[#6b4a2e] uppercase font-bold block mb-1">
                    Exposed Stockpiles:
                  </span>
                  <div className="flex flex-wrap gap-1 text-[10px] font-mono">
                    <span className="px-1.5 py-0.5 rounded bg-amber-900/10 text-amber-900 font-bold">
                      🪙 {rival.lootPool.gold}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-900/10 text-amber-900 font-bold">
                      🌾 {rival.lootPool.food}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-900/10 text-amber-900 font-bold">
                      🪵 {rival.lootPool.wood}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onLaunchRaid(rival)}
                className="mt-3 w-full py-2 px-3 rounded-xl bg-gradient-to-r from-red-800 to-rose-900 hover:brightness-110 active:scale-95 text-amber-100 font-black text-xs shadow transition flex items-center justify-center gap-1.5"
              >
                <span>📺</span>
                <span>March Vanguard (Watch Ad)</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Pinned Retaliation / Blood Feud Ledger */}
      {}
      <div className="border-t-2 border-[#bfa379]/80 pt-3">
        <h3 className="text-xs font-black text-[#442813] mb-2 flex items-center gap-1.5">
          <span>🩸 Intercepted Retaliation Missives</span>
        </h3>
        <div className="space-y-2">
          {state.revengeLedger.map(record => (
            <div
              key={record.id}
              className={`p-2.5 rounded-xl border flex items-center justify-between ${
                record.revenged
                  ? 'bg-[#e4d4b3]/60 border-stone-400 opacity-60'
                  : 'bg-[#ebdcc1] border-red-800/80 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{record.revenged ? '⚖️' : '🔥'}</span>
                <div>
                  <h4 className="text-xs font-bold text-[#442813]">{record.rivalName}</h4>
                  <div className="text-[10px] font-mono text-red-800">
                    Pillage: {Object.entries(record.stolen).map(([k, v]) => `-${v} ${k}`).join(', ')}
                  </div>
                </div>
              </div>

              {record.revenged ? (
                <span className="text-[10px] font-mono text-[#6b4a2e] font-bold">Avenged ✓</span>
              ) : (
                <button
                  onClick={() => onDeclareBloodFeud(record)}
                  className="px-2.5 py-1 rounded-lg bg-red-800 hover:bg-red-700 text-rose-100 text-xs font-bold shadow transition"
                >
                  Declare Blood Feud 🗡️
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============================================================
// PARCHMENT SUB-VIEW 3: CHRONICLE TOME
// =============================================================
function ParchmentChronicleTome({ logs, state, onResetSave }) {
  return (
    <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
      <div className="border-b-2 border-[#bfa379] pb-2">
        <h2 className="text-sm sm:text-base font-black text-[#442813] flex items-center gap-2">
          <span>📖 Kingdom Chronicles & Battle Archives</span>
        </h2>
        <p className="text-[11px] text-[#6b4a2e]">
          Scribe records detailing all perimeter breaches, defended sieges, and royal decisions.
        </p>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {logs.map(log => (
          <div
            key={log.id}
            className={`p-2.5 rounded-xl border flex items-start gap-2.5 ${
              log.type === 'win'
                ? 'bg-emerald-900/10 border-emerald-800/40 text-emerald-950'
                : 'bg-rose-900/10 border-rose-800/40 text-rose-950'
            }`}
          >
            <span className="text-base">{log.type === 'win' ? '🏆' : '🔥'}</span>
            <div className="flex-1">
              <h4 className="text-xs font-black">{log.title}</h4>
              <p className="text-[11px] mt-0.5">{log.text}</p>
              <span className="text-[9px] font-mono opacity-60 block mt-1">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t-2 border-[#bfa379]/60 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-black text-[#442813]">Citadel Rebirth</h4>
          <p className="text-[10px] text-[#6b4a2e]">Reset all archives to choose a different faction allegiance.</p>
        </div>
        <button
          onClick={onResetSave}
          className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-900 text-rose-300 text-xs font-bold shadow transition"
        >
          Reset Kingdom ⚠️
        </button>
      </div>
    </div>
  );
}

// =============================================================
// PARCHMENT SUB-VIEW 4: GRAND REALM MENU & DIRECTORY
// =============================================================
function ParchmentMenuView({ currentFaction, stats, state, isMuted, onToggleMute, onNavigate, onResetSave }) {
  const pendingBloodFeuds = state.revengeLedger.filter(r => !r.revenged).length;

  const menuSections = [
    {
      id: 'citadel',
      title: 'Royal Citadel Cartography',
      tagline: 'Settlement Architecture & Upgrades',
      description: 'Review isometric layout, upgrade economic granaries and aqueducts, and stamp royal decrees.',
      icon: '🏰',
      badge: `Tier Sum ${Object.values(state.buildings).reduce((a, b) => a + b, 0)}`,
      actionLabel: 'Open Citadel Map →',
      accentColor: 'border-amber-700/60 bg-[#eedebf]'
    },
    {
      id: 'war',
      title: 'War Council & Retaliation Board',
      tagline: 'Asynchronous Catapult Raids & Feuds',
      description: 'Scout rival encampments matched to your rating, dispatch siege vanguards, and avenge pillaged silos.',
      icon: '⚔️',
      badge: pendingBloodFeuds > 0 ? `🩸 ${pendingBloodFeuds} Blood Feuds Active` : '3 Scouts Ready',
      badgeHighlight: pendingBloodFeuds > 0,
      actionLabel: 'Enter War Council →',
      accentColor: 'border-red-800/60 bg-[#edd6cc]'
    },
    {
      id: 'chronicle',
      title: 'Kingdom Chronicles & Tome',
      tagline: 'Battle Logs & Historical Records',
      description: 'Inspect past raid defenses, defensive scrap salvage records, and scribe chronicles.',
      icon: '📖',
      badge: `${state.battleLogs.length} Battle Inscriptions`,
      actionLabel: 'Open Scribe Tome →',
      accentColor: 'border-stone-600/60 bg-[#e6ddc9]'
    }
  ];

  return (
    <div className="flex-1 p-3 sm:p-5 overflow-y-auto space-y-4 text-stone-900">
      {/* Menu Header */}
      <div className="border-b-2 border-[#bfa379]/80 pb-2.5 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm sm:text-base font-black text-[#442813] flex items-center gap-2">
            <span>📜 Grand Realm Directory</span>
          </h2>
          <p className="text-[11px] text-[#6b4a2e]">
            Choose a royal ledger, dispatch council emissaries, or inspect treasury vaults.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('citadel')}
            className="px-2.5 py-1 rounded-lg bg-[#ddcca8] hover:bg-[#d0bc93] text-[#442813] text-xs font-bold border border-[#8c6843] flex items-center gap-1 transition"
          >
            <span>🏰</span>
            <span>Return to Map</span>
          </button>
        </div>
      </div>

      {/* Primary Destination Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {menuSections.map(sec => (
          <div
            key={sec.id}
            onClick={() => onNavigate(sec.id)}
            className={`p-3.5 rounded-2xl border-2 ${sec.accentColor} shadow-md flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition-transform group`}
          >
            <div>
              <div className="flex items-start justify-between">
                <span className="text-2xl group-hover:scale-110 transition-transform">{sec.icon}</span>
                <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  sec.badgeHighlight ? 'bg-red-800 text-rose-100 animate-pulse' : 'bg-[#6b4724]/20 text-[#5c3e23]'
                }`}>
                  {sec.badge}
                </span>
              </div>

              <h3 className="text-xs sm:text-sm font-black text-[#442813] mt-2 group-hover:text-amber-900 transition-colors">
                {sec.title}
              </h3>
              <span className="text-[10px] font-bold text-[#8c6843] block mt-0.5">
                {sec.tagline}
              </span>
              <p className="text-[11px] text-[#6b4a2e] mt-1.5 line-clamp-2">
                {sec.description}
              </p>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); onNavigate(sec.id); }}
              className="mt-3 w-full py-1.5 px-2.5 rounded-xl bg-[#6b4724] group-hover:bg-[#523315] text-amber-100 text-xs font-bold transition flex items-center justify-center gap-1 shadow-sm"
            >
              {sec.actionLabel}
            </button>
          </div>
        ))}
      </div>

      {/* Realm Status & Faction Doctrines Overview Card */}
      <div className="bg-[#ebdcc1] border-2 border-[#8c6843] rounded-2xl p-3.5 shadow-md">
        <div className="flex items-center justify-between border-b border-[#bfa379]/60 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">{currentFaction.sigil}</span>
            <div>
              <h4 className="text-xs font-black text-[#442813]">{currentFaction.name}</h4>
              <span className="text-[10px] text-[#6b4a2e] font-mono">{currentFaction.title}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono font-bold text-amber-900 block">
              Rating {stats.overallRating} ⭐
            </span>
            <span className="text-[10px] text-stone-600 font-mono">
              Atk {Math.round(stats.attackPower)} • Def {Math.round(stats.defensePower)}
            </span>
          </div>
        </div>

        {/* Faction Perks */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 pt-1 text-[11px] text-[#5c3e23]">
          {currentFaction.perks.map((p, i) => (
            <div key={i} className="flex items-start gap-1.5 bg-[#dfcba6]/50 p-1.5 rounded-lg border border-[#bfa379]/40">
              <span className="text-amber-800 font-bold">✦</span>
              <span>{p}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stockpile & Vault Security Ledger */}
      <div className="bg-[#ebdcc1] border-2 border-[#8c6843] rounded-2xl p-3.5 shadow-md">
        <h4 className="text-xs font-black text-[#442813] mb-2 flex items-center gap-1.5">
          <span>🪙 Deep Vault Security & Silo Stockpiles</span>
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-[10px] font-mono">
          {[
            { key: 'food', label: 'Food', icon: '🌾' },
            { key: 'water', label: 'Water', icon: '💧' },
            { key: 'wood', label: 'Wood', icon: '🪵' },
            { key: 'stone', label: 'Stone', icon: '🪨' },
            { key: 'flora', label: 'Flora', icon: '🌿' },
            { key: 'gold', label: 'Gold', icon: '🪙' }
          ].map(item => {
            const current = Math.floor(state.resources[item.key] || 0);
            const cap = stats.caps[item.key] || 1000;
            const protectedAmt = stats.vaultProtected[item.key] || 0;
            const isExposed = current > protectedAmt;

            return (
              <div key={item.key} className="bg-[#dfcba6]/70 border border-[#bfa379]/60 p-2 rounded-xl">
                <div className="flex items-center justify-between font-bold text-[#442813]">
                  <span>{item.icon} {item.label}</span>
                  <span>{current}</span>
                </div>
                <div className="text-[9px] text-stone-600 mt-1">
                  Cap: {cap}
                </div>
                <div className={`text-[9px] mt-0.5 font-bold ${isExposed ? 'text-amber-900' : 'text-emerald-800'}`}>
                  {isExposed ? `Unbanked: ${current - protectedAmt}` : '100% Secured'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Diegetic Controls & Realm Rebirth */}
      <div className="border-t-2 border-[#bfa379]/60 pt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleMute}
            className="px-3 py-1.5 rounded-xl bg-[#ddcca8] hover:bg-[#d0bc93] text-[#442813] text-xs font-bold border border-[#8c6843] flex items-center gap-1.5 shadow-sm transition"
          >
            <span>{isMuted ? '🔇' : '🔊'}</span>
            <span>{isMuted ? 'Synthesizer Muted' : 'Audio Active'}</span>
          </button>
        </div>

        <button
          onClick={onResetSave}
          className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-900 text-rose-300 text-xs font-bold shadow transition flex items-center gap-1.5"
        >
          <span>⚠️</span>
          <span>Reset Citadel & Allegiance</span>
        </button>
      </div>
    </div>
  );
}

// =============================================================
// REWARDED VIDEO AD GATE (15-Second Scout Gate)
// =============================================================
function RewardedAdGateModal({ countdown, targetRival, onComplete, onDevSkip }) {
  return (
    <div className="fixed inset-0 bg-stone-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#241812] border-4 border-amber-700/80 rounded-3xl max-w-md w-full p-6 shadow-2xl text-center space-y-4 text-amber-100">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-2xl">
          📺
        </div>

        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
            Scout Sponsorship Contract
          </span>
          <h3 className="text-base sm:text-lg font-black mt-1">
            Funding Vanguard March to {targetRival?.name}
          </h3>
          <p className="text-xs text-amber-300/70 mt-1">
            Catapult expeditions require scout funding. Complete transmission to launch 3 siege strikes.
          </p>
        </div>

        {/* Circular Countdown Wheel */}
        <div className="py-2">
          <div className="w-16 h-16 rounded-full border-4 border-amber-500/20 border-t-amber-400 flex items-center justify-center mx-auto animate-spin">
            <span className="text-xl font-black font-mono text-amber-400 -rotate-45">
              {countdown}
            </span>
          </div>
          <span className="text-xs text-amber-300/60 mt-2 block">
            {countdown > 0 ? `Scout dispatching in ${countdown}s...` : 'Vanguard Ready to Strike!'}
          </span>
        </div>

        {countdown === 0 ? (
          <button
            onClick={onComplete}
            className="w-full py-3 rounded-xl font-black text-sm bg-gradient-to-r from-red-700 to-amber-600 hover:brightness-110 text-white shadow-xl animate-bounce"
          >
            Launch Catapults! 🚀
          </button>
        ) : (
          <div className="space-y-2">
            <button
              disabled
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-stone-800 text-stone-500 border border-stone-700 cursor-not-allowed"
            >
              Sponsored Transmission in Progress ({countdown}s)
            </button>
            <button
              onClick={onDevSkip}
              className="text-[11px] font-mono text-amber-400/70 hover:text-amber-300 underline transition block mx-auto"
            >
              [⚡ Dev Skip Ad for Testing]
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================
// 2.5D PARCHMENT RAID BATTLEFIELD
// =============================================================
function ParchmentRaidBattlefieldModal({ raid, onStrike, onDoubleLoot, onClose }) {
  const { rival, strikesLeft, targetedBuildings, lootGained, isFinished, doubled } = raid;
  const rivalFaction = FACTIONS[rival.faction] || FACTIONS.humans;

  const targets = [
    { key: 'keep', name: 'Town Keep', gx: 2, gy: 2, icon: '🏰' },
    { key: 'granary', name: 'Granary', gx: 1, gy: 1, icon: '🌾' },
    { key: 'vault', name: 'Vault', gx: 3, gy: 3, icon: '🪙' },
    { key: 'lumber', name: 'Lumber', gx: 0, gy: 2, icon: '🪵' },
    { key: 'watchtower', name: 'Tower', gx: 2, gy: 0, icon: '🏹' }
  ];

  return (
    <div className="fixed inset-0 bg-stone-950/90 backdrop-blur-md z-50 flex items-center justify-center p-3">
      <div className="bg-[#ebdcc1] border-4 border-[#8c6843] rounded-3xl max-w-2xl w-full p-4 sm:p-5 shadow-2xl flex flex-col space-y-3 text-stone-900">
        <div className="flex items-center justify-between border-b-2 border-[#bfa379] pb-2">
          <div>
            <h3 className="text-base font-black text-[#442813]">
              Catapult Siege: {rival.name}
            </h3>
            <span className="text-[10px] text-[#6b4a2e]">
              Tap target structures to expend your 3 heavy stone munitions.
            </span>
          </div>

          <div className="px-3 py-1 rounded-xl bg-red-950 text-red-200 font-mono text-xs font-bold flex items-center gap-1.5">
            <span>Ammo:</span>
            <span>{'💣 '.repeat(strikesLeft)}</span>
            {strikesLeft === 0 && <span className="text-red-400">EXPENDED</span>}
          </div>
        </div>

        {/* 2.5D Raid SVG Map */}
        <div className="w-full h-64 sm:h-72 bg-[#dfcba6] rounded-2xl border-2 border-[#8c6843] flex items-center justify-center relative overflow-hidden">
          <svg viewBox="0 0 540 320" className="w-full h-full max-w-lg">
            {/* Grid */}
            {[0, 1, 2, 3, 4].map(gx =>
              [0, 1, 2, 3, 4].map(gy => {
                const { x, y } = gridToParchmentIso(gx, gy, 270, 50);
                return (
                  <polygon
                    key={`raid-grid-${gx}-${gy}`}
                    points={`
                      ${x},${y - ISO_H / 2}
                      ${x + ISO_W / 2},${y}
                      ${x},${y + ISO_H / 2}
                      ${x - ISO_W / 2},${y}
                    `}
                    fill="#d5be97"
                    stroke="#8c6843"
                    strokeWidth="1"
                  />
                );
              })
            )}

            {/* Targets */}
            {targets.map(t => {
              const { x, y } = gridToParchmentIso(t.gx, t.gy, 270, 50);
              const hits = targetedBuildings[t.key] || 0;
              const isDestroyed = hits > 0;
              const height = isDestroyed ? 10 : 32;

              return (
                <g
                  key={t.key}
                  onClick={() => strikesLeft > 0 && onStrike(t.key)}
                  className={`cursor-pointer ${strikesLeft > 0 ? 'hover:opacity-80' : ''}`}
                >
                  <polygon
                    points={`
                      ${x - ISO_W / 2.5},${y - height}
                      ${x},${y + ISO_H / 3 - height}
                      ${x},${y + ISO_H / 3}
                      ${x - ISO_W / 2.5},${y}
                    `}
                    fill={isDestroyed ? '#7f1d1d' : '#854d0e'}
                    stroke="#3f2314"
                    strokeWidth="1.2"
                  />
                  <polygon
                    points={`
                      ${x},${y + ISO_H / 3 - height}
                      ${x + ISO_W / 2.5},${y - height}
                      ${x + ISO_W / 2.5},${y}
                      ${x},${y + ISO_H / 3}
                    `}
                    fill={isDestroyed ? '#991b1b' : '#a16207'}
                    stroke="#3f2314"
                    strokeWidth="1.2"
                  />
                  <polygon
                    points={`
                      ${x},${y - ISO_H / 3 - height}
                      ${x + ISO_W / 2.5},${y - height}
                      ${x},${y + ISO_H / 3 - height}
                      ${x - ISO_W / 2.5},${y - height}
                    `}
                    fill={isDestroyed ? '#450a0a' : '#ca8a04'}
                    stroke="#3f2314"
                    strokeWidth="1.2"
                  />
                  <text
                    x={x}
                    y={y - height - 4}
                    textAnchor="middle"
                    className="text-base select-none pointer-events-none"
                  >
                    {isDestroyed ? '💥' : t.icon}
                  </text>
                  <text
                    x={x}
                    y={y + 14}
                    textAnchor="middle"
                    fill="#442813"
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {t.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Live Loot Tallies */}
        <div className="bg-[#ebdcc1] border-2 border-[#8c6843] p-2.5 rounded-xl flex items-center justify-between text-xs font-mono font-bold">
          <span>Plundered Spoils:</span>
          <div className="flex gap-2">
            <span className="text-yellow-800">🪙 {lootGained.gold}</span>
            <span className="text-amber-800">🌾 {lootGained.food}</span>
            <span className="text-orange-800">🪵 {lootGained.wood}</span>
          </div>
        </div>

        {isFinished && (
          <div className="flex items-center gap-2 pt-1">
            {!doubled && (
              <button
                onClick={onDoubleLoot}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 hover:brightness-110 text-stone-950 font-black text-xs shadow"
              >
                Double Loot (Watch Ad) ✨
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-900 text-stone-200 font-black text-xs shadow"
            >
              Return to Throne
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================
// INITIAL THRONE ROOM ONBOARDING
// =============================================================
function ThroneRoomOnboarding({ onSelectFaction }) {
  const [selectedId, setSelectedId] = useState('humans');

  return (
    <div className="fixed inset-0 bg-stone-950 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="max-w-3xl w-full my-auto py-6 flex flex-col items-center text-amber-100">
        <div className="text-center max-w-xl mb-6">
          <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
            The Living Parchment (Throne Room POV)
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1 text-amber-200">
            Swear Allegiance to Your Faction
          </h1>
          <p className="text-xs sm:text-sm text-amber-400/70 mt-1">
            Your high seat commands an asymmetric fantasy realm. Your chosen bloodline permanently shapes macro-production, upkeep consumption, and raid pillage styles.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
          {Object.values(FACTIONS).map(faction => {
            const isSelected = selectedId === faction.id;
            return (
              <div
                key={faction.id}
                onClick={() => { sounds.playCoin(); setSelectedId(faction.id); }}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#2a1d15] border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)] scale-[1.01]'
                    : 'bg-[#18110c] border-stone-800 hover:border-stone-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{faction.sigil}</span>
                    <span className="text-[9px] uppercase px-2 py-0.5 rounded-full bg-amber-900/60 text-amber-200 font-mono font-bold">
                      {faction.title}
                    </span>
                  </div>

                  <h3 className="text-sm font-black text-amber-100 mt-2">{faction.name}</h3>
                  <p className="text-xs text-amber-300/70 mt-1">{faction.description}</p>

                  <div className="mt-3 space-y-1 pt-2 border-t border-amber-900/40">
                    {faction.perks.map((p, i) => (
                      <div key={i} className="text-[11px] text-amber-200/90 flex items-center gap-1.5">
                        <span className="text-amber-400">✦</span>
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-amber-900/40 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-amber-400/80">Upkeep: {faction.upkeepMultiplier}x</span>
                  <span className={`font-bold ${isSelected ? 'text-amber-300' : 'text-stone-500'}`}>
                    {isSelected ? '● Chosen' : 'Select'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => onSelectFaction(selectedId)}
          className="mt-6 w-full max-w-md py-3.5 px-6 rounded-2xl font-black text-sm bg-gradient-to-r from-red-800 via-amber-700 to-yellow-600 hover:brightness-110 active:scale-95 text-amber-100 transition shadow-2xl flex items-center justify-center gap-2 border border-amber-500/50"
        >
          <span>👑</span>
          <span>Ascend the Throne & Seal Realm Allegiance</span>
        </button>
      </div>
    </div>
  );
}
