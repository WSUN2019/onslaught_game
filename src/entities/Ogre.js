import sfx from '../audio/SFXManager.js';

// Ogre: a slow, high-HP enemy that follows a predefined path toward the base.
// Worth 4 gold on kill; costs the player 3 hearts if it escapes.
export default class Ogre extends Phaser.Physics.Arcade.Sprite {
    // path: array of {x, y} waypoints the ogre walks along
    // speedMult / hpMult: wave-scaling multipliers applied on top of base stats
    constructor(scene, x, y, path, speedMult = 1, hpMult = 1) {
        super(scene, x, y, 'ogre_0');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.path = path;
        this.pathIndex = 1;          // start at index 1 — index 0 is the spawn point already occupied
        this.speed = 18 * speedMult; // pixels/frame movement speed
        this.hp = Math.ceil(450 * hpMult);
        this.maxHp = this.hp;
        this.setOrigin(0.5);
        this.play('ogre-walk');

        // HP bar is a separate Graphics object so it renders above the sprite
        this.hpBar = scene.add.graphics();
        // Clean up the graphics object when the sprite is destroyed
        this.on('destroy', () => { if (this.hpBar) this.hpBar.destroy(); });
    }

    // Called every frame by the scene. Moves the ogre along its path waypoint by waypoint.
    update() {
        // KnightGate capture freezes movement while the ogre is being held
        if (this.capturedBy) return;

        // Ogre reached the end of the path — penalise the player and remove it
        if (this.pathIndex >= this.path.length) {
            this.scene.events.emit('goblin-escaped', 3); // ogre costs 3 hearts
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
        const bw = 64, bh = 8;
        const bx = this.x - bw / 2;
        const by = this.y - 48;
        const ratio = Math.max(0, this.hp / this.maxHp);
        const col = ratio > 0.5 ? 0x22dd22 : ratio > 0.25 ? 0xddcc00 : 0xdd2222;

        this.hpBar.clear();
        // Dark background track
        this.hpBar.fillStyle(0x220000);
        this.hpBar.fillRect(bx, by, bw, bh);
        // Colored fill scaled to remaining HP
        this.hpBar.fillStyle(col);
        this.hpBar.fillRect(bx, by, Math.floor(bw * ratio), bh);
    }

    // Reduces HP by amount and flashes the sprite red briefly as hit feedback.
    takeDamage(amount) {
        this.hp -= amount;
        this.setTint(0xff6666);
        this.scene.time.delayedCall(120, () => {
            if (this.active) this.clearTint();
        });
        if (this.hp <= 0) this.die();
    }

    // Handles death: stops physics, plays a shrink-and-fade tween, then
    // emits 'enemy-killed' (awarding 4 gold) before destroying the object.
    die() {
        if (!this.active) return; // guard against double-death calls
        this.body.stop();
        this.setActive(false);
        if (this.hpBar) this.hpBar.setVisible(false);
        sfx.ogreDeath();

        this.scene.tweens.add({
            targets: this,
            scale: 0,
            alpha: 0,
            duration: 400,
            ease: 'Back.easeIn',
            onComplete: () => {
                this.scene.events.emit('enemy-killed', 4, 'ogre');
                this.destroy();
            }
        });
    }
}
