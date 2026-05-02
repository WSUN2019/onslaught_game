import sfx from '../audio/SFXManager.js';

// LEVELS[1..5]: hold duration (ms) and sprite tint per upgrade tier.
// null at index 0 keeps level numbers 1-based.
const LEVELS = [
    null,
    { holdMs: 5000,  tint: 0xffffff, upgradeCost: 8  },
    { holdMs: 10000, tint: 0xffeeaa, upgradeCost: 10 },
    { holdMs: 20000, tint: 0xffcc44, upgradeCost: 15 },
    { holdMs: 40000, tint: 0xff9922, upgradeCost: 20 },
    { holdMs: 80000, tint: 0xff6644, upgradeCost: null }, // max level — no further upgrade
];

// KnightGate: a defensive tower that grabs a single nearby enemy, holds it in
// place for holdMs, then executes it. Only one captive at a time.
// Range is fixed at 90px; the hold duration doubles with each upgrade level.
export default class KnightGate extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene, x, y);
        this.towerLevel = 1;
        this.captive    = null;  // the currently held enemy, or null
        this.releaseTime = 0;    // scene time (ms) when the captive will be killed
        this._applyStats();

        this.sprite = scene.add.image(0, -18, 'knight_tex');
        this.icon   = scene.add.image(0, -105, 'knight_icon_tex');
        this.label  = scene.add.text(0, -72, 'Lv.1', {
            fontSize: '22px', color: '#ffddaa',
            fontStyle: 'bold', stroke: '#000000', strokeThickness: 3,
        }).setOrigin(0.5);

        this.add([this.sprite, this.icon, this.label]);
        scene.add.existing(this);
    }

    // Pull holdMs from the current level config.
    _applyStats() {
        this.holdMs = LEVELS[this.towerLevel].holdMs;
    }

    // Returns the gold cost of the next upgrade, or null at max level.
    get upgradeCost() {
        return this.towerLevel < 5 ? LEVELS[this.towerLevel].upgradeCost : null;
    }

    // Upgrades to the next level, updating stats, tint, and label.
    // Returns the gold cost deducted, or false if already at max level.
    upgrade(scene) {
        if (this.towerLevel >= 5) return false;
        const cost = LEVELS[this.towerLevel].upgradeCost;
        this.towerLevel++;
        this._applyStats();
        this.sprite.setTint(LEVELS[this.towerLevel].tint);
        this.label.setText(`Lv.${this.towerLevel}`);

        // Float an upgrade label that fades upward
        const txt = scene.add.text(this.x, this.y - 120, `UPGRADED! Lv.${this.towerLevel}`, {
            fontSize: '28px', color: '#ffdd44',
            fontStyle: 'bold', stroke: '#000000', strokeThickness: 3,
        }).setOrigin(0.5).setDepth(100);
        scene.tweens.add({ targets: txt, y: txt.y - 80, alpha: 0, duration: 900, onComplete: () => txt.destroy() });
        return cost;
    }

    // Called every frame. If holding a captive, shake it and check whether
    // the hold timer has expired. Otherwise scan for a new target to grab.
    update(time) {
        if (this.captive) {
            // Captive may have been killed externally (e.g. tower projectile)
            if (!this.captive.active) { this.captive = null; return; }

            // Shake the held monster so it looks like it's struggling
            this.captive.x = this.x + Math.sin(time * 0.018) * 5;
            this.captive.y = this.y + Math.cos(time * 0.013) * 4;

            if (time >= this.releaseTime) {
                // Hold time expired — execute the captive
                this.captive.capturedBy = null;
                sfx.impact();
                this.captive.die();
                this.captive = null;
            }
            return;
        }

        const enemy = this._findTarget();
        if (enemy) this._capture(enemy, time);
    }

    // Returns the first uncaptured active enemy within 90px, or null.
    _findTarget() {
        for (const enemy of this.scene.enemies.getChildren()) {
            if (!enemy.active || enemy.capturedBy) continue;
            if (Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y) <= 90)
                return enemy;
        }
        return null;
    }

    // Freezes the enemy in place and schedules its execution after holdMs.
    _capture(enemy, time) {
        this.captive      = enemy;
        enemy.capturedBy  = this;     // signals the enemy's update() to stop moving
        enemy.body.stop();
        enemy.x = this.x;
        enemy.y = this.y;
        if (enemy.hpBar) enemy.hpBar.setVisible(false);
        this.releaseTime = time + this.holdMs;

        // Flash the knight sprite to signal a capture
        this.scene.tweens.add({ targets: this.sprite, alpha: 0.35, duration: 120, yoyo: true, repeat: 3 });
    }
}
