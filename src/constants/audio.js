// ==========================================
// DIEGETIC AUDIO SYNTHESIZER (Web Audio API)
// ==========================================
export class SoundController {
  constructor() {
    this.ctx = null;
    this.masterMuted = false;
    this.sfxMuted = false;
    this.ambientMuted = false;
    this.ambientVolume = 0.5;
    this.sfxVolume = 0.8;
    this.ambientNodes = null;
  }

  get muted() {
    return this.masterMuted;
  }

  set muted(val) {
    this.masterMuted = !!val;
    if (this.masterMuted) {
      this.stopAmbient();
    } else if (!this.ambientMuted) {
      this.startAmbient();
    }
  }

  setMasterMute(val) {
    this.muted = val;
  }

  setSfxMute(val) {
    this.sfxMuted = !!val;
  }

  setAmbientMute(val) {
    this.ambientMuted = !!val;
    if (this.ambientMuted) {
      this.stopAmbient();
    } else if (!this.masterMuted) {
      this.startAmbient();
    }
  }

  setAmbientVolume(vol) {
    this.ambientVolume = Math.max(0, Math.min(1, vol));
    if (this.ambientNodes && this.ambientNodes.gain && this.ctx) {
      this.ambientNodes.gain.gain.setValueAtTime(this.ambientVolume * 0.08, this.ctx.currentTime);
    }
  }

  setSfxVolume(vol) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
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

  startAmbient() {
    if (this.masterMuted || this.ambientMuted || this.ambientNodes) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Procedural medieval castle breeze drone
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(73.42, now); // D2
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(110.0, now); // A2

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(this.ambientVolume * 0.06, now + 1.5);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);

      this.ambientNodes = { osc1, osc2, gain };
    } catch (_) {}
  }

  stopAmbient() {
    if (!this.ambientNodes) return;
    try {
      const { osc1, osc2, gain } = this.ambientNodes;
      if (this.ctx && gain) {
        gain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5);
        setTimeout(() => {
          try {
            osc1.stop();
            osc2.stop();
            osc1.disconnect();
            osc2.disconnect();
            gain.disconnect();
          } catch (_) {}
        }, 500);
      }
    } catch (_) {}
    this.ambientNodes = null;
  }

  playCoin() {
    if (this.masterMuted || this.sfxMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1318.51, this.ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.2 * this.sfxVolume, this.ctx.currentTime);
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
    if (this.masterMuted || this.sfxMuted) return;
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
    if (this.masterMuted || this.sfxMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.18);
      gain.gain.setValueAtTime(0.35 * this.sfxVolume, now);
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
    if (this.masterMuted || this.sfxMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.45 * this.sfxVolume, this.ctx.currentTime);
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
    if (this.masterMuted || this.sfxMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(540, this.ctx.currentTime + 0.22);
      gain.gain.setValueAtTime(0.25 * this.sfxVolume, this.ctx.currentTime);
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
    if (this.masterMuted || this.sfxMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [440, 554.37, 659.25, 880].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.frequency.setValueAtTime(freq, now + i * 0.07);
        gain.gain.setValueAtTime(0.2 * this.sfxVolume, now + i * 0.07);
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
    if (this.masterMuted || this.sfxMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, this.ctx.currentTime);
      osc.frequency.setValueAtTime(390, this.ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.18 * this.sfxVolume, this.ctx.currentTime);
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

export const sounds = new SoundController();
