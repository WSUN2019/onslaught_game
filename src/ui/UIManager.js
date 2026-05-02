// UIManager: thin wrapper around the HTML overlay elements defined in index.html.
// GameScene calls these methods whenever game state changes; the manager owns
// all DOM manipulation so the scene never touches the DOM directly.
export default class UIManager {
    constructor() {
        // Grab references once at construction — these elements never move in the DOM
        this.goldEl  = document.getElementById('gold-display');
        this.livesEl = document.getElementById('lives-display');
        this.towerEl = document.getElementById('tower-count');
        this.waveEl  = document.getElementById('wave-display');
        this.scoreEl = document.getElementById('score-display');
        this.msgEl   = document.getElementById('flash-msg');
        this._msgTimer = null; // holds the setTimeout ID so rapid calls cancel the previous fade
    }

    // Update the gold counter in the top-left stat bar.
    updateGold(gold) {
        if (this.goldEl) this.goldEl.textContent = `🪙 ${gold}`;
    }

    // Update the lives (hearts) counter.
    updateLives(lives) {
        if (this.livesEl) this.livesEl.textContent = `♥ ${lives}`;
    }

    // Update the tower count display (not currently wired to a DOM element — future use).
    updateTowerCount(built, total) {
        if (this.towerEl) this.towerEl.textContent = `Towers: ${built} / ${total} slots`;
    }

    // Update the wave counter. Shows total monster count for the wave in parentheses.
    updateWave(wave, total) {
        if (this.waveEl) this.waveEl.textContent = `⚔ Wave: ${wave}  (${total})`;
    }

    // Update the score display with locale-formatted number (e.g. 12,450).
    updateScore(score) {
        if (this.scoreEl) this.scoreEl.textContent = `Score: ${score.toLocaleString()}`;
    }

    // Show a temporary message in the flash bar for `duration` ms, then fade it out.
    // Calling again before the previous message expires resets the timer.
    flashMessage(msg, duration = 2000) {
        if (!this.msgEl) return;
        this.msgEl.textContent = msg;
        this.msgEl.style.opacity = '1';
        clearTimeout(this._msgTimer);
        this._msgTimer = setTimeout(() => {
            this.msgEl.style.opacity = '0';
        }, duration);
    }
}
