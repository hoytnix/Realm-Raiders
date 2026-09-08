import React, { useState } from 'react';
import { FACTIONS, getElementalMatchup, sounds } from '../../constants/index.js';
import { generateRivals, haptics } from '../../utils/index.js';
export function ParchmentWarCouncil({
  stats,
  state,
  onLaunchRaid,
  onDeclareBloodFeud,
  onResearchTechnology,
  onTrainTroops
}) {
  const [warCouncilTab, setWarCouncilTab] = React.useState('campaigns');
  const [rivals, setRivals] = useState(() => generateRivals(stats.overallRating));
  const [selectedRivalId, setSelectedRivalId] = useState(() => rivals[0]?.id || null);
  const [isInfused, setIsInfused] = useState(false);
  const [recruitCount, setRecruitCount] = useState(1);
  const activeSelectedRival = rivals.find(r => r.id === selectedRivalId) || rivals[0] || null;
  const playerFactionData = FACTIONS[state.faction] || FACTIONS.humans;
  const playerElement = playerFactionData.element || 'Flora';
  const dispatchedSoldiers = Math.max(1, state.troops?.total || 10);
  const infusionFloraCost = dispatchedSoldiers * 3;
  const canAffordInfusion = (state.resources?.flora || 0) >= infusionFloraCost;
  const troops = state.troops || {
    total: 20,
    maxCapacity: 30
  };
  const maxTroopCap = stats?.maxTroopCapacity || troops.maxCapacity || 30;
  const recruitCostGold = recruitCount * 25;
  const spaceAvailable = Math.max(0, maxTroopCap - (troops.total || 0));
  const canRecruit = (state.resources?.gold || 0) >= recruitCostGold && spaceAvailable >= recruitCount;
  const maxAffordable = Math.floor((state.resources?.gold || 0) / 25);
  const maxCanRecruit = Math.max(1, Math.min(spaceAvailable, maxAffordable));
  const handleRefresh = () => {
    sounds.playCoin();
    haptics.light();
    const newRivals = generateRivals(stats.overallRating);
    setRivals(newRivals);
    if (newRivals.length > 0) {
      setSelectedRivalId(newRivals[0].id);
    }
  };
  const handleRaidClick = rival => {
    haptics.heavy();
    const useInfusion = isInfused && canAffordInfusion;
    onLaunchRaid(rival, {
      isInfused: useInfusion,
      floraCost: useInfusion ? infusionFloraCost : 0
    });
  };
  const handleFeudClick = record => {
    haptics.heavy();
    onDeclareBloodFeud(record);
  };
  const selectedFaction = activeSelectedRival ? FACTIONS[activeSelectedRival.faction] || FACTIONS.humans : FACTIONS.humans;
  return <div className="flex-1 h-full w-full overflow-hidden flex flex-col">
      {/* =========================================================================
          DESKTOP PANORAMIC 2-PAGE WAR ROOM SPREAD (md:grid-cols-2)
          ========================================================================= */}
      <div className="hidden md:grid md:grid-cols-2 gap-5 h-full p-6 overflow-hidden">
        {/* -------------------------------------------------------------
            LEFT PAGE: Scouted Target Roster & Retaliation Blood Feud Register
            ------------------------------------------------------------- */}
        <div className="flex flex-col h-full bg-[#f2e7ce] border-2 border-[#8c6843] rounded-2xl p-4 shadow-inner overflow-hidden">
          <div className="flex items-center justify-between border-b-2 border-[#bfa379]/70 pb-2 mb-3">
            <div>
              <h2 className="text-sm font-black text-[#442813] flex items-center gap-1.5">
                <span>⚔️ Scouted Rival Strongholds</span>
              </h2>
              <span className="text-[10px] text-[#6b4a2e]">Select a rival settlement to stage deployment</span>
            </div>
            <button onClick={handleRefresh} className="px-2.5 py-1 rounded-xl bg-[#ddcca8] hover:bg-[#d0bc93] active:scale-95 text-[#442813] text-xs font-bold border border-[#8c6843] flex items-center gap-1 transition shadow-sm" title="Scout New Targets">
              <span>🔄</span>
              <span>Scout</span>
            </button>
          </div>

          {/* Roster of Rivals (Selectable Cards) */}
          <div className="space-y-2 mb-4 overflow-y-auto max-h-48 pr-1">
            {rivals.map(rival => {
            const rFaction = FACTIONS[rival.faction] || FACTIONS.humans;
            const isSelected = rival.id === selectedRivalId;
            const rMatchup = getElementalMatchup(playerElement, rival.element || rFaction.element || 'Stone');
            return <div key={rival.id} onClick={() => {
              sounds.playCoin();
              setSelectedRivalId(rival.id);
            }} className={`p-2.5 rounded-xl border-2 cursor-pointer transition flex flex-col gap-1.5 ${isSelected ? 'bg-[#e2ceaa] border-[#78350f] shadow-md scale-[1.01]' : 'bg-[#ebdcc1]/80 border-[#8c6843]/60 hover:bg-[#dfcba6]'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{rFaction.sigil || '🏰'}</span>
                      <div>
                        <h4 className="text-xs font-black text-[#442813]">{rival.name}</h4>
                        <span className="text-[9px] uppercase tracking-wider text-[#6b4a2e]">
                          {rFaction.name} • Def {rival.defensePower}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-amber-900 block">⭐ {rival.rating}</span>
                      <span className="text-[9px] font-mono text-[#6b4a2e]">
                        🪙{rival.lootPool?.gold || 0} 🌾{rival.lootPool?.food || 0}
                      </span>
                    </div>
                  </div>
                  {/* Elemental Matchup Badge */}
                  <div className={`px-2 py-0.5 rounded-md border text-[9px] font-mono font-bold flex items-center justify-between ${rMatchup.sealColor}`}>
                    <span>{rMatchup.badge}</span>
                  </div>
                </div>;
          })}
          </div>

          {/* Retaliation Missives / Blood Feud Ledger */}
          <div className="flex-1 border-t-2 border-[#bfa379]/70 pt-2 flex flex-col overflow-hidden">
            <h3 className="text-xs font-black text-[#442813] mb-1.5 flex items-center gap-1.5">
              <span>🩸 Intercepted Retaliation Missives</span>
            </h3>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {state.revengeLedger.length === 0 ? <div className="text-[11px] text-[#6b4a2e] italic text-center py-4">
                  No pending blood feuds. Your borders remain secure.
                </div> : state.revengeLedger.map(record => <div key={record.id} className={`p-2 rounded-xl border flex items-center justify-between gap-2 ${record.revenged ? 'bg-[#e4d4b3]/60 border-stone-400 opacity-60' : 'bg-[#ebdcc1] border-red-800/80 shadow-sm'}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{record.revenged ? '⚖️' : '🔥'}</span>
                      <div>
                        <h4 className="text-xs font-bold text-[#442813]">{record.rivalName}</h4>
                        <span className="text-[9px] font-mono text-red-800 block">
                          Pillage: {Object.entries(record.stolen).map(([k, v]) => `-${v} ${k}`).join(', ')}
                        </span>
                      </div>
                    </div>

                    {record.revenged ? <span className="text-[10px] font-mono text-[#6b4a2e] font-bold">Avenged ✓</span> : <button onClick={() => handleFeudClick(record)} className="px-2 py-1 rounded-lg bg-red-800 hover:bg-red-700 active:scale-95 text-rose-100 text-[10px] font-bold shadow transition">
                        Declare Feud 🗡️
                      </button>}
                  </div>)}
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------------
            RIGHT PAGE: Vanguard Deployment Order & Royal Logistics Decree
            ------------------------------------------------------------- */}
        <div className="flex flex-col h-full bg-[#f2e7ce] border-2 border-[#8c6843] rounded-2xl p-4 shadow-inner overflow-hidden justify-between">
          {activeSelectedRival ? (() => {
          const selectedMatchup = getElementalMatchup(playerElement, activeSelectedRival.element || selectedFaction.element || 'Stone');
          return <div className="space-y-2.5">
                {/* Selected Rival Dossier Header */}
                <div className="flex items-center justify-between border-b-2 border-[#bfa379]/70 pb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{selectedFaction.sigil || '🏰'}</span>
                    <div>
                      <h3 className="text-sm font-black text-[#442813]">{activeSelectedRival.name}</h3>
                      <span className="text-[10px] font-mono uppercase text-[#6b4a2e]">
                        {selectedFaction.name} • {selectedFaction.doctrine || 'Fortified Domain'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded bg-amber-900/15 border border-amber-800/40 text-xs font-mono font-bold text-amber-900">
                      ⭐ {activeSelectedRival.rating}
                    </span>
                  </div>
                </div>

                {/* Elemental Affinity Matchup Seal */}
                <div className={`p-2 rounded-xl border text-[11px] font-mono font-bold flex items-center justify-between shadow-sm ${selectedMatchup.sealColor}`}>
                  <span>{selectedMatchup.badge}</span>
                </div>

                {/* Tactical Comparison Bar */}
                <div className="bg-[#dfcba6]/70 p-2 rounded-xl border border-[#bfa379]/50 text-[11px] font-mono space-y-1">
                  <div className="flex justify-between items-center text-[#442813]">
                    <span>Enemy Fortification:</span>
                    <span className="font-bold text-red-900">🛡️ Def {activeSelectedRival.defensePower}</span>
                  </div>
                  <div className="flex justify-between items-center text-[#442813]">
                    <span>Your Catapult Force:</span>
                    <span className="font-bold text-green-900">⚔️ Atk {Math.round(stats.attackPower)}</span>
                  </div>
                </div>

                {/* Briar / Verdant Infusion Toggle Card */}
                <div className={`p-2.5 rounded-xl border-2 transition flex items-center justify-between gap-2 ${isInfused ? 'bg-emerald-900/20 border-emerald-700/80 shadow-md' : 'bg-[#dfcba6]/70 border-[#bfa379]/50'}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🌿</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-black text-[#442813]">Briar Infusion</h4>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-950/20 text-emerald-900">
                          {infusionFloraCost} Flora ({dispatchedSoldiers} troops)
                        </span>
                      </div>
                      <p className="text-[10px] text-[#6b4a2e] leading-tight">
                        +20% troop survivability & +15% plunder vs Stone strongholds
                      </p>
                    </div>
                  </div>
                  <button onClick={() => {
                if (!isInfused && !canAffordInfusion) {
                  sounds.playFamineAlarm();
                  return;
                }
                sounds.playCoin();
                haptics.light();
                setIsInfused(v => !v);
              }} disabled={!isInfused && !canAffordInfusion} className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold border transition ${isInfused ? 'bg-emerald-800 text-emerald-100 border-emerald-600 shadow-inner' : canAffordInfusion ? 'bg-[#ebdcc1] text-[#442813] border-[#8c6843] hover:bg-[#dfcba6]' : 'bg-stone-300 text-stone-500 border-stone-400 cursor-not-allowed'}`}>
                    {isInfused ? 'Infused ✓' : 'Infuse'}
                  </button>
                </div>

                {/* Exposed Plunder Loot Pool */}
                <div className="bg-[#dfcba6]/70 p-2 rounded-xl border border-[#bfa379]/50">
                  <span className="text-[10px] font-mono text-[#6b4a2e] uppercase font-bold block mb-1">
                    Unbanked Stores Vulnerable to Catapult Strikes:
                  </span>
                  <div className="grid grid-cols-3 gap-1.5 text-xs font-mono">
                    <span className="p-1.5 rounded bg-[#ebdcc1] border border-[#bfa379]/60 text-yellow-900 font-bold text-center">
                      🪙 {activeSelectedRival.lootPool?.gold || 0}
                    </span>
                    <span className="p-1.5 rounded bg-[#ebdcc1] border border-[#bfa379]/60 text-amber-900 font-bold text-center">
                      🌾 {activeSelectedRival.lootPool?.food || 0}
                    </span>
                    <span className="p-1.5 rounded bg-[#ebdcc1] border border-[#bfa379]/60 text-orange-900 font-bold text-center">
                      🪵 {activeSelectedRival.lootPool?.wood || 0}
                    </span>
                  </div>
                </div>

                {/* Prominent March Vanguard CTA */}
                <button onClick={() => handleRaidClick(activeSelectedRival)} className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-800 via-rose-900 to-red-950 hover:brightness-110 active:scale-95 text-amber-100 font-black text-sm shadow-xl transition flex items-center justify-center gap-2 border-2 border-amber-600/60">
                  <span className="text-base">📺</span>
                  <span>March Vanguard {isInfused ? '(Briar Infused)' : ''}</span>
                </button>
              </div>;
        })() : null}

          {/* RECRUITMENT ACTION: LEVY RECRUITS / ENLIST LABORERS */}
          <div className="bg-[#ebdcc1] border-2 border-[#8c6843] rounded-xl p-3 shadow-md flex items-center justify-between gap-3 mt-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">⚔️</span>
              <div>
                <h4 className="text-xs font-black text-[#442813]">Levy Recruits / Enlist Laborers</h4>
                <p className="text-[10px] text-[#6b4a2e] leading-tight">
                  Workforce: {troops.total}/{maxTroopCap} • Restores garrison & labor (25 🪙 / recruit)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[1, 5].map(cnt => <button key={cnt} onClick={() => {
                sounds.playCoin();
                haptics.light();
                setRecruitCount(cnt);
              }} className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition ${recruitCount === cnt ? 'bg-amber-900 text-amber-100 border border-amber-950' : 'bg-[#ddcca8] text-[#442813] border border-[#8c6843]'}`}>
                    +{cnt}
                  </button>)}
                <button onClick={() => {
                sounds.playCoin();
                haptics.light();
                setRecruitCount(maxCanRecruit);
              }} className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#ddcca8] text-[#442813] border border-[#8c6843] hover:bg-[#cbb38b]">
                  Max
                </button>
              </div>

              <button onClick={() => {
              haptics.heavy();
              sounds.playCoin();
              if (onTrainTroops) onTrainTroops(recruitCount);
            }} disabled={!canRecruit} className={`px-3 py-1.5 rounded-lg text-xs font-black shadow transition flex items-center gap-1 ${canRecruit ? 'bg-gradient-to-r from-red-800 to-rose-900 text-amber-100 hover:brightness-110 active:scale-95 border border-red-700' : 'bg-stone-400 text-stone-600 cursor-not-allowed'}`}>
                <span>⚔️</span>
                <span>Enlist ({recruitCostGold}🪙)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MOBILE WAR COUNCIL (Preserved vertical scrolling stack for <md)
          ========================================================================= */}
      <div className="md:hidden flex-1 p-3 overflow-y-auto space-y-4 pb-[calc(5rem+env(safe-area-inset-bottom,0px))]">
        <div className="flex items-center justify-between border-b-2 border-[#bfa379]/60 pb-2">
          <div>
            <h2 className="text-sm font-black text-[#442813] flex items-center gap-1.5">
              <span>⚔️ Scouted Targets (±7% Rating)</span>
            </h2>
            <p className="text-[11px] text-[#6b4a2e]">
              Intercepted cartography pins targets holding exposed unbanked stores.
            </p>
          </div>
          <button onClick={handleRefresh} className="min-h-[44px] px-3 py-1.5 rounded-xl bg-[#ddcca8] hover:bg-[#d0bc93] active:scale-95 text-[#442813] text-xs font-bold border border-[#8c6843] flex items-center gap-1.5 transition flex-shrink-0">
            <span>🔄</span>
            <span>Scout</span>
          </button>
        </div>

        {/* Mobile Briar Infusion Toggle Bar */}
        <div className={`p-2.5 rounded-2xl border-2 transition flex items-center justify-between gap-2 shadow-sm ${isInfused ? 'bg-emerald-900/20 border-emerald-700/80' : 'bg-[#ebdcc1] border-[#8c6843]'}`}>
          <div className="flex items-center gap-2">
            <span className="text-xl">🌿</span>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-black text-[#442813]">Briar Infusion</h4>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-950/20 text-emerald-900">
                  {infusionFloraCost} Flora
                </span>
              </div>
              <p className="text-[10px] text-[#6b4a2e]">
                +20% survivability & +15% plunder vs Stone targets
              </p>
            </div>
          </div>
          <button onClick={() => {
          if (!isInfused && !canAffordInfusion) {
            sounds.playFamineAlarm();
            return;
          }
          sounds.playCoin();
          haptics.light();
          setIsInfused(v => !v);
        }} disabled={!isInfused && !canAffordInfusion} className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition ${isInfused ? 'bg-emerald-800 text-emerald-100 border-emerald-600' : canAffordInfusion ? 'bg-[#dfcba6] text-[#442813] border-[#8c6843]' : 'bg-stone-300 text-stone-500 border-stone-400 cursor-not-allowed'}`}>
            {isInfused ? 'Infused ✓' : 'Infuse'}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {rivals.map(rival => {
          const rivalFaction = FACTIONS[rival.faction] || FACTIONS.humans;
          const rMatchup = getElementalMatchup(playerElement, rival.element || rivalFaction.element || 'Stone');
          return <div key={rival.id} className="bg-[#ebdcc1] border-2 border-[#8c6843] rounded-2xl p-3 shadow-md flex flex-col justify-between gap-2">
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

                  {/* Elemental Matchup Badge */}
                  <div className={`mt-1.5 px-2 py-0.5 rounded-md border text-[9px] font-mono font-bold ${rMatchup.sealColor}`}>
                    {rMatchup.badge}
                  </div>

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

                <button onClick={() => handleRaidClick(rival)} className="mt-2 w-full min-h-[48px] py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-800 to-rose-900 hover:brightness-110 active:scale-95 text-amber-100 font-black text-xs shadow transition flex items-center justify-center gap-1.5">
                  <span>📺</span>
                  <span>March Vanguard {isInfused ? '(Briar Infused)' : '(Watch Ad)'}</span>
                </button>
              </div>;
        })}
        </div>

        {/* RECRUITMENT ACTION: LEVY RECRUITS / ENLIST LABORERS (Mobile) */}
        <div className="bg-[#ebdcc1] border-2 border-[#8c6843] rounded-2xl p-3 shadow-md flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-[#cbb38b] border border-[#8c6843] flex items-center justify-center text-xl shadow-inner flex-shrink-0">
                ⚔️
              </div>
              <div>
                <h3 className="text-xs font-black text-[#442813]">
                  Levy Recruits / Enlist Laborers
                </h3>
                <p className="text-[10px] text-[#6b4a2e]">
                  Enlist troops to restore garrison defense & labor capacity.
                </p>
              </div>
            </div>
            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-amber-900/15 text-amber-900 border border-amber-800/30">
              Workforce: {troops.total} / {maxTroopCap}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#bfa379]/50">
            <div className="flex items-center gap-1.5">
              {[1, 5].map(cnt => <button key={cnt} onClick={() => {
              sounds.playCoin();
              haptics.light();
              setRecruitCount(cnt);
            }} className={`min-h-[38px] px-2.5 py-1 rounded-xl text-xs font-mono font-bold border transition ${recruitCount === cnt ? 'bg-amber-900 text-amber-100 border-amber-950' : 'bg-[#dfcba6] text-[#442813] border-[#8c6843]'}`}>
                  +{cnt}
                </button>)}
              <button onClick={() => {
              sounds.playCoin();
              haptics.light();
              setRecruitCount(maxCanRecruit);
            }} className="min-h-[38px] px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-[#dfcba6] text-[#442813] border border-[#8c6843] hover:bg-[#cbb38b]">
                Max
              </button>
            </div>

            <button onClick={() => {
            haptics.heavy();
            sounds.playCoin();
            if (onTrainTroops) onTrainTroops(recruitCount);
          }} disabled={!canRecruit} className={`min-h-[44px] flex-1 py-2 px-3 rounded-xl font-black text-xs transition flex items-center justify-center gap-1.5 shadow ${canRecruit ? 'bg-gradient-to-r from-red-800 to-rose-900 text-amber-100 hover:brightness-110 active:scale-95 shadow border border-red-700' : 'bg-stone-400 text-stone-600 cursor-not-allowed'}`}>
              <span>⚔️</span>
              <span>Enlist ({recruitCostGold}🪙)</span>
            </button>
          </div>
        </div>

        {/* Pinned Retaliation / Blood Feud Ledger */}
        <div className="border-t-2 border-[#bfa379]/80 pt-3">
          <h3 className="text-xs font-black text-[#442813] mb-2 flex items-center gap-1.5">
            <span>🩸 Intercepted Retaliation Missives</span>
          </h3>
          <div className="space-y-2">
            {state.revengeLedger.map(record => <div key={record.id} className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${record.revenged ? 'bg-[#e4d4b3]/60 border-stone-400 opacity-60' : 'bg-[#ebdcc1] border-red-800/80 shadow-sm'}`}>
                <div className="flex items-center gap-2">
                  <span className="text-base">{record.revenged ? '⚖️' : '🔥'}</span>
                  <div>
                    <h4 className="text-xs font-bold text-[#442813]">{record.rivalName}</h4>
                    <div className="text-[10px] font-mono text-red-800">
                      Pillage: {Object.entries(record.stolen).map(([k, v]) => `-${v} ${k}`).join(', ')}
                    </div>
                  </div>
                </div>

                {record.revenged ? <span className="text-[10px] font-mono text-[#6b4a2e] font-bold">Avenged ✓</span> : <button onClick={() => handleFeudClick(record)} className="min-h-[44px] px-3 py-1.5 rounded-xl bg-red-800 hover:bg-red-700 active:scale-95 text-rose-100 text-xs font-bold shadow transition">
                    Declare Blood Feud 🗡️
                  </button>}
              </div>)}
          </div>
        </div>
      </div>
    </div>;
}