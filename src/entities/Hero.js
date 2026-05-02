import Projectile from './Projectile.js';

// Hero: a player-placed unit that auto-attacks the nearest enemy in range.
// Unlike towers it is a plain Sprite (no physics body) and can be repositioned
// at will via placeAt / unplace.
export default class Hero extends Phaser.GameObjects.Sprite {
    constructor(scene) {
        // Start off-screen and hidden until the player places it
        super(scene, -200, -200, 'hero_tex');
        scene.add.existing(this);
        this.setOrigin(0.5);
        this.setVisible(false);

        this.attackPower = 10;
        this.range = 220;
        this.fireRate = 900; // ms between shots
        this.nextFire = 0;
    }

    // Move the hero onto the map at the given tile position.
    placeAt(x, y) {
        this.setPosition(x, y);
        this.setVisible(true);
    }

    // Hide the hero (e.g. when the player picks it back up).
    unplace() {
        this.setVisible(false);
    }

    // Called every frame with the current scene time (ms).
    // Fires at the nearest in-range enemy once the cooldown has elapsed.
    update(time) {
        if (!this.visible) return;
        if (time < this.nextFire) return;
        const target = this._findTarget();
        if (!target) return;
        const p = new Projectile(this.scene, this.x, this.y, target);
        p.damage = this.attackPower;
        this.scene.projectiles.add(p);
        this.nextFire = time + this.fireRate;
    }

    // Returns the first active enemy within range, or null if none exist.
    // Iterates the scene's enemy group in insertion order (no priority sorting).
    _findTarget() {
        for (const enemy of this.scene.enemies.getChildren()) {
            if (!enemy.active) continue;
            if (Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y) <= this.range)
                return enemy;
        }
        return null;
    }
}
