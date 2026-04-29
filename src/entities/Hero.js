import Projectile from './Projectile.js';

export default class Hero extends Phaser.GameObjects.Sprite {
    constructor(scene) {
        super(scene, -200, -200, 'hero_tex');
        scene.add.existing(this);
        this.setOrigin(0.5);
        this.setVisible(false);

        this.attackPower = 10;
        this.range = 220;
        this.fireRate = 900;
        this.nextFire = 0;
    }

    placeAt(x, y) {
        this.setPosition(x, y);
        this.setVisible(true);
    }

    unplace() {
        this.setVisible(false);
    }

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

    _findTarget() {
        for (const enemy of this.scene.enemies.getChildren()) {
            if (!enemy.active) continue;
            if (Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y) <= this.range)
                return enemy;
        }
        return null;
    }
}
