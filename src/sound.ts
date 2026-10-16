// Web Audio API procedural sound engine for Mochi
// 100% zero external sound assets - lightweight & instantly available

class SoundEngine {
  private ctx: AudioContext | null = null;
  private purrOsc: OscillatorNode | null = null;
  private purrGain: GainNode | null = null;
  private purrLfo: OscillatorNode | null = null;
  private isPurring = false;
  private enabled = true;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
    if (!val) {
      this.stopPurr();
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  // Play a soft, charming UI click
  public playClick(pitch = 1.0) {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(600 * pitch, now);
    osc.frequency.exponentialRampToValueAtTime(150 * pitch, now + 0.04);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.045);
  }

  // Play a cute kitten chirp / meow
  public playMeow() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Dual-tone formant meow
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc1.type = "triangle";
    osc2.type = "sine";

    // Frequency trajectory: gentle rise then fall (me-ow)
    osc1.frequency.setValueAtTime(440, now);
    osc1.frequency.exponentialRampToValueAtTime(680, now + 0.08);
    osc1.frequency.exponentialRampToValueAtTime(320, now + 0.28);

    osc2.frequency.setValueAtTime(880, now);
    osc2.frequency.exponentialRampToValueAtTime(1360, now + 0.08);
    osc2.frequency.exponentialRampToValueAtTime(640, now + 0.28);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(900, now);
    filter.Q.setValueAtTime(2.5, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.32);
    osc2.stop(now + 0.32);
  }

  // Cute heart pop / chime when pet
  public playChime() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + idx * 0.04;

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.04, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.2);
    });
  }

  // Laser activation blip
  public playLaserBlip() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(240, now + 0.12);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  // Start continuous rhythmic cat purr
  public startPurr() {
    if (!this.enabled || this.isPurring) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Low rumble osc (purr frequency ~26Hz)
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(28, now);

      // Amplitude modulation for the purr breath cycle (~2.5 Hz)
      const lfo = ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.setValueAtTime(2.6, now);

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(0.025, now);

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, now);
      masterGain.gain.linearRampToValueAtTime(0.045, now + 0.4);

      lfo.connect(lfoGain);
      lfoGain.connect(masterGain.gain);

      osc.connect(masterGain);
      masterGain.connect(ctx.destination);

      osc.start(now);
      lfo.start(now);

      this.purrOsc = osc;
      this.purrLfo = lfo;
      this.purrGain = masterGain;
      this.isPurring = true;
    } catch {
      // AudioContext policy fallback
    }
  }

  // Stop purring
  public stopPurr() {
    if (!this.isPurring) return;
    try {
      if (this.ctx && this.purrGain) {
        const now = this.ctx.currentTime;
        this.purrGain.gain.linearRampToValueAtTime(0.0001, now + 0.2);
        setTimeout(() => {
          this.purrOsc?.stop();
          this.purrLfo?.stop();
          this.purrOsc?.disconnect();
          this.purrLfo?.disconnect();
          this.purrGain?.disconnect();
          this.purrOsc = null;
          this.purrLfo = null;
          this.purrGain = null;
          this.isPurring = false;
        }, 220);
      } else {
        this.isPurring = false;
      }
    } catch {
      this.isPurring = false;
    }
  }
}

export const sound = new SoundEngine();
