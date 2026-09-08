import React from 'react';
import { sounds } from '../../constants/index.js';
import { haptics } from '../../utils/index.js';

export function ParchmentSettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetSave
}) {
  if (!isOpen) return null;

  const currentSettings = settings || {
    masterAudio: true,
    ambientAudio: true,
    sfxAudio: true,
    hapticsEnabled: true,
    ambientVolume: 0.5,
    sfxVolume: 0.8
  };

  const handleToggleMaster = () => {
    const next = !currentSettings.masterAudio;
    sounds.setMasterMute(!next);
    sounds.playCoin();
    haptics.light();
    onUpdateSettings({ masterAudio: next });
  };

  const handleToggleAmbient = () => {
    const next = !currentSettings.ambientAudio;
    sounds.setAmbientMute(!next);
    sounds.playCoin();
    haptics.light();
    onUpdateSettings({ ambientAudio: next });
  };

  const handleToggleSfx = () => {
    const next = !currentSettings.sfxAudio;
    sounds.setSfxMute(!next);
    sounds.playCoin();
    haptics.light();
    onUpdateSettings({ sfxAudio: next });
  };

  const handleToggleHaptics = () => {
    const next = !currentSettings.hapticsEnabled;
    haptics.setEnabled(next);
    if (next) haptics.harvest();
    sounds.playCoin();
    onUpdateSettings({ hapticsEnabled: next });
  };

  const handleAmbientVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    sounds.setAmbientVolume(val);
    onUpdateSettings({ ambientVolume: val });
  };

  const handleSfxVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    sounds.setSfxVolume(val);
    onUpdateSettings({ sfxVolume: val });
  };

  const handleTestSound = (type) => {
    if (type === 'coin') sounds.playCoin();
    else if (type === 'seal') sounds.playWaxSealThud();
    else if (type === 'dagger') sounds.playDaggerThrust();
    haptics.light();
  };

  const handleResetCitadel = () => {
    haptics.heavy();
    if (window.confirm('Are you certain you wish to abdicate the throne and reset all kingdom archives?')) {
      onResetSave?.();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm animate-in fade-in select-none">
      <div className="relative w-full max-w-lg bg-[#f4ecd8] border-4 border-[#8c6843] rounded-3xl shadow-2xl p-4 sm:p-6 text-stone-900 font-serif max-h-[90vh] overflow-y-auto">
        {/* Ornate Header */}
        <div className="flex items-center justify-between border-b-2 border-[#bfa379]/80 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚙️</span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#442813]">Realm Settings & Audio</h3>
              <p className="text-[11px] font-mono text-[#6b4a2e]">
                Procedural Web Audio synthesizer & tactile feedback
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playCoin();
              haptics.light();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-[#dfcba6] border border-[#8c6843] flex items-center justify-center text-sm font-bold text-[#442813] hover:bg-[#cbb38b] active:scale-95 transition"
            title="Close Settings"
          >
            ✕
          </button>
        </div>

        {/* Setting Groups */}
        <div className="space-y-4">
          {/* GROUP 1: MASTER AUDIO */}
          <div className="bg-[#ebdcc1] border-2 border-[#8c6843]/60 rounded-2xl p-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">{currentSettings.masterAudio ? '🔊' : '🔇'}</span>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-[#442813]">Master Audio Channel</h4>
                  <p className="text-[10px] text-[#6b4a2e]">
                    Synthesize all procedural soundscapes & chimes
                  </p>
                </div>
              </div>

              <button
                onClick={handleToggleMaster}
                className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-mono font-black border transition flex items-center gap-1.5 shadow-inner ${
                  currentSettings.masterAudio
                    ? 'bg-gradient-to-r from-emerald-800 to-green-700 text-emerald-100 border-emerald-500'
                    : 'bg-stone-800 text-stone-400 border-stone-600'
                }`}
              >
                <span>{currentSettings.masterAudio ? 'ACTIVE ✓' : 'MUTED ✕'}</span>
              </button>
            </div>
          </div>

          {/* GROUP 2: AMBIENT ATMOSPHERE & WEATHER */}
          <div className={`bg-[#ebdcc1] border-2 border-[#8c6843]/60 rounded-2xl p-3.5 shadow-sm transition-opacity ${
            !currentSettings.masterAudio ? 'opacity-50 pointer-events-none' : ''
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🍃</span>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-[#442813]">Atmospheric Castle Ambient</h4>
                  <p className="text-[10px] text-[#6b4a2e]">
                    Synthesized wind drone & weather atmosphere
                  </p>
                </div>
              </div>

              <button
                onClick={handleToggleAmbient}
                className={`min-h-[36px] px-3 py-1 rounded-xl text-xs font-mono font-bold border transition ${
                  currentSettings.ambientAudio
                    ? 'bg-emerald-900/20 text-emerald-900 border-emerald-700'
                    : 'bg-stone-400/40 text-stone-600 border-stone-400'
                }`}
              >
                {currentSettings.ambientAudio ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Ambient Volume Slider */}
            {currentSettings.ambientAudio && (
              <div className="mt-2 pt-2 border-t border-[#bfa379]/50 flex items-center justify-between gap-3 text-[11px] font-mono">
                <span className="text-[#6b4a2e] text-[10px]">Ambient Volume:</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={currentSettings.ambientVolume ?? 0.5}
                  onChange={handleAmbientVolumeChange}
                  className="flex-1 accent-amber-700 cursor-pointer"
                />
                <span className="w-8 text-right font-bold text-[#442813]">
                  {Math.round((currentSettings.ambientVolume ?? 0.5) * 100)}%
                </span>
              </div>
            )}
          </div>

          {/* GROUP 3: SOUND EFFECTS (SFX) */}
          <div className={`bg-[#ebdcc1] border-2 border-[#8c6843]/60 rounded-2xl p-3.5 shadow-sm transition-opacity ${
            !currentSettings.masterAudio ? 'opacity-50 pointer-events-none' : ''
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🪙</span>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-[#442813]">Sound Effects (SFX)</h4>
                  <p className="text-[10px] text-[#6b4a2e]">
                    Coins, wax seal splats, catapult launches, and horns
                  </p>
                </div>
              </div>

              <button
                onClick={handleToggleSfx}
                className={`min-h-[36px] px-3 py-1 rounded-xl text-xs font-mono font-bold border transition ${
                  currentSettings.sfxAudio
                    ? 'bg-emerald-900/20 text-emerald-900 border-emerald-700'
                    : 'bg-stone-400/40 text-stone-600 border-stone-400'
                }`}
              >
                {currentSettings.sfxAudio ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* SFX Volume & Audio Sample Testing */}
            {currentSettings.sfxAudio && (
              <div className="mt-2 pt-2 border-t border-[#bfa379]/50 space-y-2">
                <div className="flex items-center justify-between gap-3 text-[11px] font-mono">
                  <span className="text-[#6b4a2e] text-[10px]">SFX Volume:</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={currentSettings.sfxVolume ?? 0.8}
                    onChange={handleSfxVolumeChange}
                    className="flex-1 accent-amber-700 cursor-pointer"
                  />
                  <span className="w-8 text-right font-bold text-[#442813]">
                    {Math.round((currentSettings.sfxVolume ?? 0.8) * 100)}%
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] font-mono">
                  <span className="text-[#6b4a2e] text-[9px]">Sample Test:</span>
                  <button
                    onClick={() => handleTestSound('coin')}
                    className="px-2 py-0.5 rounded bg-[#dfcba6] border border-[#8c6843]/60 text-[#442813] hover:bg-[#d0bc93] active:scale-95"
                  >
                    🪙 Coin
                  </button>
                  <button
                    onClick={() => handleTestSound('seal')}
                    className="px-2 py-0.5 rounded bg-[#dfcba6] border border-[#8c6843]/60 text-[#442813] hover:bg-[#d0bc93] active:scale-95"
                  >
                    🩸 Seal
                  </button>
                  <button
                    onClick={() => handleTestSound('dagger')}
                    className="px-2 py-0.5 rounded bg-[#dfcba6] border border-[#8c6843]/60 text-[#442813] hover:bg-[#d0bc93] active:scale-95"
                  >
                    🗡️ Steel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* GROUP 4: HAPTIC VIBRATION FEEDBACK */}
          <div className="bg-[#ebdcc1] border-2 border-[#8c6843]/60 rounded-2xl p-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">📳</span>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-[#442813]">Tactile Haptic Feedback</h4>
                  <p className="text-[10px] text-[#6b4a2e]">
                    Physical touch pulses on mobile interactions
                  </p>
                </div>
              </div>

              <button
                onClick={handleToggleHaptics}
                className={`min-h-[36px] px-3.5 py-1 rounded-xl text-xs font-mono font-bold border transition ${
                  currentSettings.hapticsEnabled
                    ? 'bg-emerald-900/20 text-emerald-900 border-emerald-700'
                    : 'bg-stone-400/40 text-stone-600 border-stone-400'
                }`}
              >
                {currentSettings.hapticsEnabled ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>
          </div>

          {/* GROUP 5: ARCHIVES & CITADEL REBIRTH */}
          <div className="border-t-2 border-[#bfa379]/60 pt-3 flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#6b4a2e]">Version 1.4 ADX • LocalStorage</span>
            <button
              onClick={handleResetCitadel}
              className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-900 active:scale-95 text-rose-300 text-xs font-mono font-bold shadow flex items-center gap-1.5"
            >
              <span>⚠️</span>
              <span>Abdicate & Reset</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
