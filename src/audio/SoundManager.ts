export class SoundManager {
  private static instance: SoundManager;
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private constructor() {
    const saved = localStorage.getItem('slice_it_muted');
    if (saved !== null) {
      this.isMuted = saved === 'true';
    }
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  public init(): void {
    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('slice_it_muted', String(this.isMuted));
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // --- AERODYNAMIC SOFT SWIPE / SWOOSH ---
  public playSwoosh(): void {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.12);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Smooth brownian-style aerodynamic air noise
      let last = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        last = (last + 0.04 * white) / 1.04;
        data[i] = last * 3.5;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, now);
      filter.frequency.exponentialRampToValueAtTime(1600 + Math.random() * 300, now + 0.04);
      filter.frequency.exponentialRampToValueAtTime(300, now + 0.11);
      filter.Q.value = 1.2;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 0.12);
    } catch {
      // Safe catch
    }
  }

  // --- SATISFYING CRISP CUT + JUICY SQUISH ---
  public playSlice(fruitType?: string): void {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // 1. Blade cut transient (crisp metallic snap)
      const snapOsc = this.ctx.createOscillator();
      const snapGain = this.ctx.createGain();
      snapOsc.type = 'sine';
      snapOsc.frequency.setValueAtTime(1400, now);
      snapOsc.frequency.exponentialRampToValueAtTime(220, now + 0.03);

      snapGain.gain.setValueAtTime(0.22, now);
      snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      snapOsc.connect(snapGain);
      snapGain.connect(this.ctx.destination);
      snapOsc.start(now);
      snapOsc.stop(now + 0.04);

      // 2. Wet pulp squelch / fruit splatter
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.14);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        const decay = Math.exp(-i / (bufferSize * 0.25));
        data[i] = (Math.random() * 2 - 1) * decay;
      }

      const squishNoise = this.ctx.createBufferSource();
      squishNoise.buffer = buffer;

      // Distinct pitch per fruit
      let filterCutoff = 1100;
      if (fruitType === 'watermelon') filterCutoff = 800; // Deep watery thud
      else if (fruitType === 'orange') filterCutoff = 1300; // Zesty squirt
      else if (fruitType === 'apple') filterCutoff = 1600; // Crunchy snap
      else if (fruitType === 'pineapple') filterCutoff = 950;
      else if (fruitType === 'strawberry') filterCutoff = 1450;

      filterCutoff += (Math.random() - 0.5) * 120;

      const squishFilter = this.ctx.createBiquadFilter();
      squishFilter.type = 'bandpass';
      squishFilter.frequency.setValueAtTime(filterCutoff * 1.5, now);
      squishFilter.frequency.exponentialRampToValueAtTime(filterCutoff * 0.4, now + 0.12);
      squishFilter.Q.value = 2.2;

      const squishGain = this.ctx.createGain();
      squishGain.gain.setValueAtTime(0.35, now);
      squishGain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

      squishNoise.connect(squishFilter);
      squishFilter.connect(squishGain);
      squishGain.connect(this.ctx.destination);

      squishNoise.start(now);
      squishNoise.stop(now + 0.14);
    } catch {
      // Safe catch
    }
  }

  // --- WARM CRYSTAL CHIME FOR COMBOS ---
  public playCombo(comboCount: number): void {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Warm pentatonic bell chords: C5, D5, E5, G5, A5, C6
      const baseNotes = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
      const startIdx = Math.min(Math.max(0, comboCount - 2), baseNotes.length - 2);

      // Play 2-3 harmonious bell harmonics
      for (let i = 0; i < 3; i++) {
        const noteIndex = Math.min(startIdx + i, baseNotes.length - 1);
        const freq = baseNotes[noteIndex];
        const offset = i * 0.05;

        // Fundamental tone
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + offset);

        gain.gain.setValueAtTime(0.18, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.45);

        // Warm harmonic overtone (glockenspiel shimmer)
        const overtone = this.ctx.createOscillator();
        const overtoneGain = this.ctx.createGain();
        overtone.type = 'sine';
        overtone.frequency.setValueAtTime(freq * 2.76, now + offset);

        overtoneGain.gain.setValueAtTime(0.05, now + offset);
        overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.25);

        overtone.connect(overtoneGain);
        overtoneGain.connect(this.ctx.destination);
        overtone.start(now + offset);
        overtone.stop(now + offset + 0.26);
      }
    } catch {
      // Safe catch
    }
  }

  // --- DEEP CINEMATIC EXPLOSION ---
  public playExplosion(): void {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // Sub-bass rumble
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(25, now + 0.7);

      oscGain.gain.setValueAtTime(0.7, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.75);

      // Lowpass explosion blast
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.8);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, now);
      filter.frequency.exponentialRampToValueAtTime(60, now + 0.6);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.65, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 0.8);
    } catch {
      // Safe catch
    }
  }

  // --- SUBTLE FUSE HISS ---
  public playFuseHiss(): void {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.04);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.08;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(4000, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.038);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 0.04);
    } catch {
      // Safe catch
    }
  }

  // --- MISS SOUND (Deep wooden strike) ---
  public playMiss(): void {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.2);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // Safe catch
    }
  }

  // --- CLEAN BUTTON TAP ---
  public playClick(): void {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, now);
      osc.frequency.exponentialRampToValueAtTime(950, now + 0.04);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // Safe catch
    }
  }

  // --- GAME OVER JINGLE ---
  public playGameOver(): void {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [440, 392, 349.2, 293.66];
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const t = now + idx * 0.16;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(t);
        osc.stop(t + 0.4);
      });
    } catch {
      // Safe catch
    }
  }

  // No annoying background MIDI synth loop!
  public startMusic(): void {}
  public stopMusic(): void {}
}
