import Projectile from './Projectile.js';

// Stats indexed by level 1-5
const LEVELS = [
    null,                                          // 0 (unused)
    { damage: 10, fireRate: 800, range: 200, tint: 0xffffff, upgradeCost: 8  },
    { damage: 16, fireRate: 680, range: 215, tint: 0xaaffaa, upgradeCost: 10 },
    { damage: 25, fireRate: 540, range: 230, tint: 0x88aaff, upgradeCost: 15 },
    { damage: 38, fireRate: 400, range: 248, tint: 0xffdd44, upgradeCost: 20 },
    { damage: 55, fireRate: 280, range: 268, tint: 0xff6644, upgradeCost: null }, // max
];

export default class Tower extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene, x, y);

        this.towerLevel = 1;
        this._applyStats();

        this.nextFire = 0;

        this.sprite = scene.add.image(0, 0, 'tower_tex');
        this.label = scene.add.text(0, -52, 'Lv.1', {
            fontSize: '22px', color: '#ffffff',
            fontStyle: 'bold', stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5);

        this.add([this.sprite, this.label]);
        scene.add.existing(this);
    }

    _applyStats() {
        const s = LEVELS[this.towerLevel];
        this.damage   = s.damage;
        this.fireRate = s.fireRate;
        this.range    = s.range;
    }

    upgrade(scene, gold) {
        if (this.towerLevel >= 5) return false;
        const cost = LEVELS[this.towerLevel].upgradeCost;
        if (gold < cost) return false;

        this.towerLevel++;
        this._applyStats();

        const s = LEVELS[this.towerLevel];
        this.sprite.setTint(s.tint);
        this.label.setText(`Lv.${this.towerLevel}`);

        // Flash upgrade text
        const txt = scene.add.text(this.x, this.y - 80, `UPGRADED! Lv.${this.towerLevel}`, {
            fontSize: '28px', color: '#ffdd44',
            fontStyle: 'bold', stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5).setDepth(100);
        scene.tweens.add({
            targets: txt, y: txt.y - 80, alpha: 0, duration: 900,
            onComplete: () => txt.destroy()
        });

        return cost;
    }

    get upgradeCost() {
        return this.towerLevel < 5 ? LEVELS[this.towerLevel].upgradeCost : null;
    }

    update(time) {
        if (time < this.nextFire) return;
        const target = this.findTarget();
        if (target) {
            this.fire(target);
            this.nextFire = time + this.fireRate;
        }
    }

    findTarget() {
        for (const enemy of this.scene.enemies.getChildren()) {
            if (!enemy.active) continue;
            if (Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y) <= this.range)
                return enemy;
        }
        return null;
    }

    fire(target) {
        const p = new Projectile(this.scene, this.x, this.y, target);
        p.damage = this.damage;
        this.scene.projectiles.add(p);
    }
}
