export default class UIManager {
    constructor() {
        this.goldEl  = document.getElementById('gold-display');
        this.livesEl = document.getElementById('lives-display');
        this.towerEl = document.getElementById('tower-count');
        this.waveEl  = document.getElementById('wave-display');
        this.scoreEl = document.getElementById('score-display');
        this.msgEl   = document.getElementById('flash-msg');
        this._msgTimer = null;
    }

    updateGold(gold) {
        if (this.goldEl) this.goldEl.innerHTML = `<span class="icon">🪙</span> ${gold}`;
    }

    updateLives(lives) {
        if (this.livesEl) this.livesEl.innerHTML = `<span class="icon">♥</span> ${lives}`;
    }

    updateTowerCount(built, total) {
        if (this.towerEl) this.towerEl.textContent = `Towers: ${built} / ${total} slots`;
    }

    updateWave(wave, total) {
        if (this.waveEl) this.waveEl.textContent = `Wave: ${wave}  (${total} monsters)`;
    }

    updateScore(score) {
        if (this.scoreEl) this.scoreEl.textContent = `Score: ${score.toLocaleString()}`;
    }

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
