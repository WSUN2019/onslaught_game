// MusicManager: procedural dark-fantasy background music using the Web Audio API.
// No audio files are loaded — all sound is synthesised in real time.
// Architecture: a master gain node → shared feedback-delay "reverb" bus.
// Four musical layers are scheduled ahead in 8-bar loops: pad, bass, melody, counter-melody.
// Percussion is layered on top using short noise bursts.
// Singleton — import the default export and call .start() / .stop().
class MusicManager {
    constructor() {
        this.ctx      = null;   // Web Audio AudioContext, created lazily on start()
        this.playing  = false;
        this._master  = null;   // master gain node (volume + fade in/out)
        this._reverb  = null;
    }

    // Creates the AudioContext, sets up the reverb bus, and kicks off the loop scheduler.
    // Safe to call multiple times — returns immediately if already playing.
    start() {
        if (this.playing) return;
        this.ctx     = new (window.AudioContext || window.webkitAudioContext)();
        this._master = this.ctx.createGain();
        this._master.gain.setValueAtTime(0, this.ctx.currentTime);
        this._master.gain.linearRampToValueAtTime(0.55, this.ctx.currentTime + 2.5); // 2.5s fade-in
        this._master.connect(this.ctx.destination);

        // Browser autoplay policy: AudioContext starts suspended until user interaction.
        // Listen on three event types to cover keyboard, mouse, and touch.
        if (this.ctx.state === 'suspended') {
            const resume = () => {
                this.ctx && this.ctx.resume();
                document.removeEventListener('keydown',    resume);
                document.removeEventListener('pointerdown', resume);
                document.removeEventListener('touchstart', resume);
            };
            document.addEventListener('keydown',    resume, { once: true });
            document.addEventListener('pointerdown', resume, { once: true });
            document.addEventListener('touchstart', resume, { once: true });
        }

        // ── Feedback-delay reverb bus ─────────────────────────────────────
        // A delay line looped through a gain node creates a simple reverb tail.
        // _wet mixes the wet signal back into the master output.
        this._delay    = this.ctx.createDelay(0.6);
        this._delay.delayTime.setValueAtTime(0.28, 0);   // 280 ms room size
        this._feedback = this.ctx.createGain();
        this._feedback.gain.setValueAtTime(0.22, 0);     // feedback amount (< 1 to prevent runaway)
        this._wet      = this.ctx.createGain();
        this._wet.gain.setValueAtTime(0.22, 0);          // reverb send level
        this._delay.connect(this._feedback);
        this._feedback.connect(this._delay);
        this._delay.connect(this._wet);
        this._wet.connect(this._master);

        this.playing = true;
        this._scheduleLoop(this.ctx.currentTime);
    }

    // Fades out and closes the AudioContext after the fade completes (~1.8s).
    stop() {
        if (!this.playing || !this.ctx) return;
        this._master.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1.8);
        this.playing = false;
        setTimeout(() => { if (this.ctx) { this.ctx.close(); this.ctx = null; } }, 2200);
    }

    // Fade master gain to 0 without stopping the scheduler (music paused, not stopped).
    mute() {
        if (!this._master) return;
        this._master.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);
    }

    // Restore master gain to normal playback level.
    unmute() {
        if (!this._master) return;
        this._master.gain.linearRampToValueAtTime(0.55, this.ctx.currentTime + 0.3);
    }

    // ── Private helpers ───────────────────────────────────────────────────

    // Schedule a single oscillator note.
    // freq: Hz, t: start time (AudioContext seconds), dur: duration (s)
    // type: oscillator waveform, vol: peak gain, detune: cents offset
    // reverb: if true, also routes to the delay bus for a wet signal
    _osc(freq, t, dur, type, vol, detune = 0, reverb = false) {
        if (!this.playing || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const g   = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, t);
        if (detune) osc.detune.setValueAtTime(detune, t);
        const att = Math.min(0.04, dur * 0.08);  // attack: 4% of duration, max 40ms
        const rel = Math.min(0.12, dur * 0.25);  // release: 25% of duration, max 120ms
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(vol, t + att);
        g.gain.setValueAtTime(vol, t + dur - rel);
        g.gain.linearRampToValueAtTime(0, t + dur);
        osc.connect(g);
        g.connect(this._master);
        if (reverb) g.connect(this._delay);
        osc.start(t);
        osc.stop(t + dur + 0.08); // tiny tail past envelope to avoid click
    }

    // Schedule a filtered noise burst (used for kick, snare, hi-hat percussion).
    // lpHz: low-pass cutoff — low values (~90) = kick, high values (~9000) = hi-hat
    _noise(t, dur, vol, lpHz) {
        if (!this.playing || !this.ctx) return;
        const sr  = this.ctx.sampleRate;
        const buf = this.ctx.createBuffer(1, Math.ceil(sr * dur), sr);
        const d   = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; // white noise
        const src = this.ctx.createBufferSource();
        src.buffer = buf;
        const lp  = this.ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(lpHz, t);
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(vol, t);
        g.gain.linearRampToValueAtTime(0, t + dur);
        src.connect(lp); lp.connect(g); g.connect(this._master);
        src.start(t); src.stop(t + dur + 0.05);
    }

    // Core loop scheduler — pre-renders one full 8-bar phrase starting at t0.
    // Before the phrase ends it schedules itself again to loop seamlessly.
    // All notes are created as Web Audio nodes with precise start/stop times —
    // the CPU cost is paid upfront; playback is handled by the audio hardware.
    _scheduleLoop(t0) {
        if (!this.playing || !this.ctx) return;

        const bpm  = 96;
        const beat = 60 / bpm;        // ~0.625 s per beat
        const bar  = beat * 4;        // ~2.5 s per 4/4 bar
        const loop = bar * 8;         // full 8-bar phrase (~20 s)

        // ── Note frequency constants (A-minor scale, multiple octaves) ────
        // A-minor: A B C D E F G
        const A2=110, E2=82.41, D2=73.42, C2=65.41, G2=98, F2=87.31, B2=123.47;
        const A3=220, E3=164.81, D3=146.83, C3=130.81, G3=196, F3=174.61, B3=246.94, Bb3=233.08, Gs3=207.65;
        const A4=440, E4=329.63, D4=293.66, C4=261.63, G4=392, F4=349.23, B4=493.88;

        // ── Layer 1: PAD (detuned sawtooth pairs, very soft, long sustain) ─
        // Two slightly detuned copies (-10 / +10 cents) create a natural chorus.
        // Chord progression: Am  F  C  G  Am  F  E  Am  (one chord per bar)
        const padChords = [
            [A2, C3, E3],   // Am
            [F2, A3, C3],   // F
            [C2, E3, G3],   // C
            [G2, B3, D3],   // G
            [A2, C3, E3],   // Am
            [F2, A3, C3],   // F
            [E2, B2, Gs3, E3],  // E dominant (tension before resolve)
            [A2, C3, E3],   // Am resolve
        ];
        padChords.forEach((notes, bi) => {
            notes.forEach(freq => {
                if (!freq) return;
                this._osc(freq, t0 + bi*bar, bar*0.97, 'sawtooth', 0.028, -10, true);
                this._osc(freq, t0 + bi*bar, bar*0.97, 'sawtooth', 0.028,  10, true);
            });
        });

        // ── Layer 2: BASS LINE (triangle + octave sine for warmth) ───────
        // Each entry: [freq, timeOffset, duration, volume]
        // Triangle gives the fundamental body; a quiet sine an octave up adds clarity.
        const bassNotes = [
            // Bar 1: Am
            [A2, 0,          beat*1.5, 0.32], [E2, beat*1.5, beat*0.5, 0.24],
            [A2, beat*2,     beat,     0.28], [G2, beat*3,   beat,     0.22],
            // Bar 2: F
            [F2, bar,        beat*1.5, 0.30], [C2, bar+beat*1.5, beat*0.5, 0.22],
            [F2, bar+beat*2, beat,     0.28], [A2, bar+beat*3,   beat,     0.20],
            // Bar 3: C
            [C2, bar*2,      beat*1.5, 0.30], [G2, bar*2+beat*1.5, beat*0.5, 0.22],
            [C2, bar*2+beat*2, beat,   0.26], [E2, bar*2+beat*3,   beat,     0.20],
            // Bar 4: G
            [G2, bar*3,      beat*1.5, 0.30], [D2, bar*3+beat*1.5, beat*0.5, 0.22],
            [G2, bar*3+beat*2, beat,   0.28], [B2, bar*3+beat*3,   beat,     0.20],
            // Bar 5: Am (repeat pattern with variation)
            [A2, bar*4,      beat,     0.32], [A2, bar*4+beat, beat*0.5, 0.26],
            [E2, bar*4+beat*1.5, beat*0.5, 0.24], [A2, bar*4+beat*2, beat, 0.28],
            [G2, bar*4+beat*3, beat*0.5, 0.22], [E2, bar*4+beat*3.5, beat*0.5, 0.20],
            // Bar 6: F
            [F2, bar*5,      beat,     0.30], [F2, bar*5+beat, beat*0.5, 0.24],
            [C2, bar*5+beat*1.5, beat*0.5, 0.22], [F2, bar*5+beat*2, beat, 0.26],
            [A2, bar*5+beat*3, beat,   0.20],
            // Bar 7: E (tension)
            [E2, bar*6,      beat*2,   0.34], [B2, bar*6+beat*2, beat,   0.28],
            [E2, bar*6+beat*3, beat,   0.30],
            // Bar 8: Am (resolve)
            [A2, bar*7,      beat*2,   0.34], [E2, bar*7+beat*2, beat,   0.24],
            [A2, bar*7+beat*3, beat,   0.30],
        ];
        bassNotes.forEach(([freq, tOff, dur, vol]) => {
            this._osc(freq,   t0+tOff, dur*0.82, 'triangle', vol);
            this._osc(freq*2, t0+tOff, dur*0.65, 'sine',     vol * 0.25); // octave up, quieter
        });

        // ── Layer 3: MELODY (square + sine blend for a medieval flute/horn feel)
        // Square gives brightness; the louder sine beneath adds body.
        // The melody follows the chord progression with a call-and-answer phrasing.
        const mel = [
            // Bar 1: Am motif
            [E4, 0,              beat*0.5,  0.13],
            [A4, beat*0.5,       beat*0.75, 0.16],
            [G4, beat*1.25,      beat*0.75, 0.14],
            [E4, beat*2,         beat*0.5,  0.13],
            [D4, beat*2.5,       beat*0.5,  0.11],
            [C4, beat*3,         beat,      0.12],
            // Bar 2: F — answer phrase
            [A3, bar,            beat*0.5,  0.11],
            [C4, bar+beat*0.5,   beat*0.75, 0.13],
            [D4, bar+beat*1.25,  beat*0.75, 0.14],
            [F4, bar+beat*2,     beat,      0.15],
            [E4, bar+beat*3,     beat,      0.13],
            // Bar 3: C — rising line
            [E4, bar*2,          beat*0.75, 0.13],
            [G4, bar*2+beat*0.75,beat*0.75, 0.15],
            [A4, bar*2+beat*1.5, beat*0.5,  0.17],
            [G4, bar*2+beat*2,   beat*0.75, 0.15],
            [E4, bar*2+beat*2.75,beat*0.25, 0.12],
            [D4, bar*2+beat*3,   beat,      0.13],
            // Bar 4: G — descending line
            [D4, bar*3,          beat*0.5,  0.13],
            [B3, bar*3+beat*0.5, beat*0.5,  0.12],
            [G3, bar*3+beat,     beat*0.75, 0.13],
            [A3, bar*3+beat*1.75,beat*0.25, 0.11],
            [B3, bar*3+beat*2,   beat,      0.13],
            [D4, bar*3+beat*3,   beat,      0.14],
            // Bar 5: Am — second half, more ornate with faster passing notes
            [E4, bar*4,          beat*0.25, 0.12],
            [D4, bar*4+beat*0.25,beat*0.25, 0.11],
            [E4, bar*4+beat*0.5, beat*0.5,  0.14],
            [A4, bar*4+beat,     beat,      0.17],
            [G4, bar*4+beat*2,   beat*0.5,  0.15],
            [F4, bar*4+beat*2.5, beat*0.5,  0.13],
            [E4, bar*4+beat*3,   beat,      0.14],
            // Bar 6: F
            [D4, bar*5,          beat*0.75, 0.13],
            [C4, bar*5+beat*0.75,beat*0.5,  0.12],
            [D4, bar*5+beat*1.25,beat*0.5,  0.13],
            [F4, bar*5+beat*1.75,beat*0.25, 0.15],
            [E4, bar*5+beat*2,   beat*0.75, 0.14],
            [D4, bar*5+beat*2.75,beat*0.25, 0.12],
            [C4, bar*5+beat*3,   beat,      0.13],
            // Bar 7: E — dramatic tension, ascending run to high B
            [B3, bar*6,          beat*0.5,  0.12],
            [D4, bar*6+beat*0.5, beat*0.5,  0.14],
            [E4, bar*6+beat,     beat*0.5,  0.16],
            [G4, bar*6+beat*1.5, beat*0.5,  0.17],
            [B4, bar*6+beat*2,   beat*0.75, 0.18],
            [A4, bar*6+beat*2.75,beat*0.25, 0.16],
            [G4, bar*6+beat*3,   beat,      0.15],
            // Bar 8: Am — resolve with long final note
            [E4, bar*7,          beat*0.5,  0.14],
            [D4, bar*7+beat*0.5, beat*0.5,  0.12],
            [C4, bar*7+beat,     beat*0.5,  0.13],
            [A3, bar*7+beat*1.5, beat*0.5,  0.14],
            [A3, bar*7+beat*2,   beat*2,    0.16],  // long final note resolves to root
        ];
        mel.forEach(([freq, tOff, dur, vol]) => {
            this._osc(freq, t0+tOff, dur*0.90, 'square', vol*0.40, 0, true);
            this._osc(freq, t0+tOff, dur*0.90, 'sine',   vol*0.60, 0, true);
        });

        // ── Layer 4: COUNTER-MELODY (soft triangle, bars 5-8 only) ──────
        // Adds harmonic movement in the second half to prevent repetition fatigue.
        const ctr = [
            [C4, bar*4,           beat*2,   0.07],
            [D4, bar*4+beat*2,    beat*2,   0.07],
            [E4, bar*5,           beat*2,   0.08],
            [F4, bar*5+beat*2,    beat*2,   0.07],
            [E4, bar*6,           beat*3,   0.09],
            [B3, bar*6+beat*3,    beat,     0.07],
            [A3, bar*7,           beat*4,   0.10],
        ];
        ctr.forEach(([freq, tOff, dur, vol]) => {
            this._osc(freq, t0+tOff, dur*0.88, 'triangle', vol, 0, true);
        });

        // ── Layer 5: PERCUSSION ──────────────────────────────────────────
        // All percussion uses filtered noise bursts — no samples.
        // Kick (lpHz 90): low thud on beats 1 & 3
        // Snare (lpHz 3500): mid crack on beats 2 & 4
        // Hi-hat (lpHz 9000): every 8th note; accent open-hat on beat 3.5 in odd bars
        for (let bi = 0; bi < 8; bi++) {
            const bt = t0 + bi * bar;
            // Kick: beats 1 & 3
            this._noise(bt,            0.18, 0.22, 90);
            this._noise(bt+beat*2,     0.18, 0.18, 90);
            // Snare: beats 2 & 4
            this._noise(bt+beat,       0.10, 0.08, 3500);
            this._noise(bt+beat*3,     0.10, 0.08, 3500);
            // Hi-hat: every eighth note (closed = quieter odd steps)
            for (let e = 0; e < 8; e++) {
                this._noise(bt + e*beat*0.5, 0.05, e%2===0 ? 0.025 : 0.015, 9000);
            }
            // Open hi-hat accent on beat 3.5 in odd bars (adds swing feel)
            if (bi % 2 === 1) {
                this._noise(bt + beat*3.5, 0.12, 0.03, 11000);
            }
        }

        // ── Schedule next loop 300ms before this one ends ─────────────────
        // Pre-scheduling avoids audible gaps; the 300ms safety margin covers
        // timer jitter without creating noticeable overlap.
        const next   = t0 + loop;
        const delayMs = Math.max(100, (next - 0.3 - this.ctx.currentTime) * 1000);
        setTimeout(() => {
            if (this.playing) this._scheduleLoop(next);
        }, delayMs);
    }
}

export default new MusicManager();
