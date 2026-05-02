import sfx from '../audio/SFXManager.js';

// Enemy (Goblin): the standard fast, low-HP enemy that walks a waypoint path.
// Escaping costs the player 1 heart; dying awards 1 gold.
export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    // path: array of {x, y} waypoints leading to the base
    // speedMult / hpMult: wave-scaling multipliers (see GameScene._waveConfig)
    constructor(scene, x, y, path, speedMult = 1, hpMult = 1) {
        super(scene, x, y, 'goblin_0');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.path = path;
        this.pathIndex = 1;          // index 0 is the spawn point already occupied
        this.speed = 90 * speedMult; // goblins are 5× faster than ogres at base
        this.hp = Math.ceil(45 * hpMult);
        this.maxHp = this.hp;
        this.setOrigin(0.5);
        this.play('goblin-walk');

        // HP bar drawn on top of sprite (added after so it renders above)
        this.hpBar = scene.add.graphics();
        this.on('destroy', () => { if (this.hpBar) this.hpBar.destroy(); });
    }

    // Called every frame. Moves the goblin along its path waypoint by waypoint.
    update() {
        // KnightGate capture freezes movement while the goblin is being held
        if (this.capturedBy) return;

        // Goblin reached the end of the path — penalise player and remove it
        if (this.pathIndex >= this.path.length) {
            this.scene.events.emit('goblin-escaped');
            this.destroy();
            return;
        }

        const target = this.path[this.pathIndex];
        const dist = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);

        if (dist < 8) {
            // Close enough — snap to waypoint and advance to the next one
            this.body.reset(target.x, target.y);
            this.pathIndex++;
        } else {
            this.scene.physics.moveToObject(this, target, this.speed);
        }

        this._drawHPBar();
    }

    // Redraws the HP bar above the sprite each frame.
    // Color shifts green → yellow → red as HP drops below 50% and 25%.
    _drawHPBar() {
        const bw = 44, bh = 6;
        const bx = this.x - bw / 2;
        const by = this.y - 42;
        const ratio = Math.max(0, this.hp / this.maxHp);
        const col = ratio > 0.5 ? 0x22dd22 : ratio > 0.25 ? 0xddcc00 : 0xdd2222;

        this.hpBar.clear();
        // Background track
        this.hpBar.fillStyle(0x220000);
        this.hpBar.fillRect(bx, by, bw, bh);
        // Colored fill scaled to remaining HP
        this.hpBar.fillStyle(col);
        this.hpBar.fillRect(bx, by, Math.floor(bw * ratio), bh);
    }

    // Reduces HP by amount and flashes the sprite red briefly as hit feedback.
    takeDamage(amount) {
        this.hp -= amount;
        this.setTint(0xff4444);
        this.scene.time.delayedCall(120, () => {
            if (this.active) this.clearTint();
        });
        if (this.hp <= 0) this.die();
    }

    // Handles death: stops physics, plays a shrink-and-fade tween, then
    // emits 'enemy-killed' (awarding 1 gold) before destroying the object.
    die() {
        if (!this.active) return; // guard against double-death calls
        this.body.stop();
        this.setActive(false);
        if (this.hpBar) this.hpBar.setVisible(false);
        sfx.goblinDeath();

        this.scene.tweens.add({
            targets: this,
            scale: 0,
            alpha: 0,
            duration: 280,
            ease: 'Back.easeIn',
            onComplete: () => {
                this.scene.events.emit('enemy-killed', 1, 'goblin');
                this.destroy();
            }
        });
    }
}
