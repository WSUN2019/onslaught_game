// SFXManager: procedural one-shot sound effects using the Web Audio API.
// All audio is synthesised at runtime — no audio files are loaded.
// Singleton — import the default export and call its methods directly.
class SFXManager {
    constructor() {
        this.ctx = null;
        this._lastImpact = 0; // timestamp used to throttle rapid impact sounds
    }

    // Lazily creates the AudioContext on first use (browser autoplay policy requires
    // a user gesture before audio can start, so we defer creation until needed).
    _getCtx() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            if (this.ctx.state === 'suspended') {
                // Resume on the next user interaction
                const resume = () => this.ctx?.resume();
                ['keydown', 'pointerdown', 'touchstart'].forEach(e =>
                    document.addEventListener(e, resume, { once: true })
                );
            }
        }
        return this.ctx;
    }

    // Returns true only when the AudioContext is actively running.
    // All sound methods check this before doing any work.
    _ready() {
        return this._getCtx().state === 'running';
    }

    // Short crack + low thud when projectile hits.
    // Throttled to ~18 hits/s to avoid audio clipping under heavy fire.
    impact() {
        if (!this._ready()) return;
        const now = Date.now();
        if (now - this._lastImpact < 55) return; // throttle: ~18 hits/s max
        this._lastImpact = now;

        const ctx = this._getCtx();
        const t = ctx.currentTime;

        // Crack: bandpass-filtered white-noise burst (sharp transient)
        const bufLen = Math.floor(ctx.sampleRate * 0.05);
        const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;
        const noise = ctx.createBufferSource();
        noise.buffer = buf;
        const bpf = ctx.createBiquadFilter();
        bpf.type = 'bandpass'; bpf.frequency.value = 900; bpf.Q.value = 1.5;
        const gCrack = ctx.createGain();
        gCrack.gain.setValueAtTime(0.22, t);
        gCrack.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        noise.connect(bpf); bpf.connect(gCrack); gCrack.connect(ctx.destination);
        noise.start(t); noise.stop(t + 0.05);

        // Thud: sine wave that pitch-drops rapidly (110 Hz → 32 Hz) for a low body hit
        const thud = ctx.createOscillator();
        thud.type = 'sine';
        thud.frequency.setValueAtTime(110, t);
        thud.frequency.exponentialRampToValueAtTime(32, t + 0.08);
        const gThud = ctx.createGain();
        gThud.gain.setValueAtTime(0.32, t);
        gThud.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        thud.connect(gThud); gThud.connect(ctx.destination);
        thud.start(t); thud.stop(t + 0.08);
    }

    // High-pitched descending groan — goblin death.
    // Sawtooth through a closing low-pass filter gives the squeaky screech.
    goblinDeath() {
        if (!this._ready()) return;
        const ctx = this._getCtx();
        const t = ctx.currentTime;

        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(340, t);
        osc.frequency.exponentialRampToValueAtTime(65, t + 0.42); // pitch falls over 420 ms

        const lpf = ctx.createBiquadFilter();
        lpf.type = 'lowpass';
        lpf.frequency.setValueAtTime(1500, t);
        lpf.frequency.exponentialRampToValueAtTime(160, t + 0.42); // filter closes with pitch
        lpf.Q.value = 3;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.16, t + 0.03); // fast attack
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.42);

        osc.connect(lpf); lpf.connect(gain); gain.connect(ctx.destination);
        osc.start(t); osc.stop(t + 0.42);
    }

    // Deep growling groan + sub-rumble — ogre death.
    // Two layers: a waveshaped sawtooth for the growl, plus a sine sub for weight.
    ogreDeath() {
        if (!this._ready()) return;
        const ctx = this._getCtx();
        const t = ctx.currentTime;

        // Growl: sawtooth through a soft-clipper WaveShaper (adds harmonic warmth)
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(190, t);
        osc.frequency.exponentialRampToValueAtTime(32, t + 0.85);

        // Soft-clip curve: x / (1 + 7|x|) — gentle saturation, no hard limiting
        const ws = ctx.createWaveShaper();
        const c = new Float32Array(256);
        for (let i = 0; i < 256; i++) { const x = (i * 2 / 255) - 1; c[i] = x / (1 + 7 * Math.abs(x)); }
        ws.curve = c;

        const lpf = ctx.createBiquadFilter();
        lpf.type = 'lowpass';
        lpf.frequency.setValueAtTime(950, t);
        lpf.frequency.exponentialRampToValueAtTime(75, t + 0.85);
        lpf.Q.value = 4;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.38, t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.85);

        osc.connect(ws); ws.connect(lpf); lpf.connect(gain); gain.connect(ctx.destination);
        osc.start(t); osc.stop(t + 0.85);

        // Deep sub-rumble: sine wave dropping to sub-bass for physical thud
        const sub = ctx.createOscillator();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(70, t);
        sub.frequency.exponentialRampToValueAtTime(16, t + 0.85);
        const gSub = ctx.createGain();
        gSub.gain.setValueAtTime(0.22, t + 0.04); // slight onset delay to feel like echo
        gSub.gain.exponentialRampToValueAtTime(0.001, t + 0.85);
        sub.connect(gSub); gSub.connect(ctx.destination);
        sub.start(t); sub.stop(t + 0.85);
    }
}

export default new SFXManager();
