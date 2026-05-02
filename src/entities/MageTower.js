import Projectile from './Projectile.js';

// LEVELS[1..5]: stat progression per upgrade tier.
// Damage and range grow steadily; fireRate drops (faster); shots unlocks multi-target at Lv3.
// null at index 0 keeps level numbers 1-based.
const LEVELS = [
    null,
    { damage: 100, fireRate: 4000, range: 600, shots: 1, tint: 0xffffff, upgradeCost: 8  },
    { damage: 160, fireRate: 3400, range: 646, shots: 1, tint: 0xcc88ff, upgradeCost: 10 },
    { damage: 250, fireRate: 2700, range: 690, shots: 2, tint: 0xaa44ff, upgradeCost: 15 },
    { damage: 380, fireRate: 2000, range: 744, shots: 2, tint: 0x8822ff, upgradeCost: 20 },
    { damage: 550, fireRate: 1400, range: 804, shots: 2, tint: 0x6600ff, upgradeCost: null }, // max level
];

// MageTower: a high-damage, long-range tower that fires large purple projectiles.
// Has the longest range of all towers but a slow fire rate at low levels.
// At Lv3+ it can hit two targets per volley.
export default class MageTower extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene, x, y);

        this.towerLevel = 1;
        this._applyStats();

        this.nextFire = 0; // scene time (ms) when the tower may fire again

        this.sprite = scene.add.image(0, -18, 'mage_tex');
        this.icon   = scene.add.image(0, -105, 'mage_icon_tex');
        this.label  = scene.add.text(0, -72, 'Lv.1', {
            fontSize: '22px', color: '#cc88ff',
            fontStyle: 'bold', stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5);

        this.add([this.sprite, this.icon, this.label]);
        scene.add.existing(this);
    }

    // Reads damage, fireRate, range, and shots from the current level config.
    _applyStats() {
        const s = LEVELS[this.towerLevel];
        this.damage   = s.damage;
        this.fireRate = s.fireRate;
        this.range    = s.range;
        this.shots    = s.shots;
    }

    // Upgrades to the next level if the player has enough gold.
    // Returns the gold cost deducted on success, or false if max level or insufficient gold.
    upgrade(scene, gold) {
        if (this.towerLevel >= 5) return false;
        const cost = LEVELS[this.towerLevel].upgradeCost;
        if (gold < cost) return false;

        this.towerLevel++;
        this._applyStats();

        const s = LEVELS[this.towerLevel];
        this.sprite.setTint(s.tint);
        this.label.setText(`Lv.${this.towerLevel}`);

        // Float an upgrade label that fades upward
        const txt = scene.add.text(this.x, this.y - 110, `UPGRADED! Lv.${this.towerLevel}`, {
            fontSize: '28px', color: '#aa44ff',
            fontStyle: 'bold', stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5).setDepth(100);
        scene.tweens.add({
            targets: txt, y: txt.y - 80, alpha: 0, duration: 900,
            onComplete: () => txt.destroy()
        });

        return cost;
    }

    // Returns the gold cost of the next upgrade, or null at max level.
    get upgradeCost() {
        return this.towerLevel < 5 ? LEVELS[this.towerLevel].upgradeCost : null;
    }

    // Called every frame. Fires at up to `shots` targets when the cooldown allows.
    // All targets in a volley share the same cooldown reset.
    update(time) {
        if (time < this.nextFire) return;
        const targets = this.findTargets();
        if (targets.length > 0) {
            targets.forEach(t => this.fire(t));
            this.nextFire = time + this.fireRate;
        }
    }

    // Returns up to `shots` active enemies within range (first-found, no sorting).
    findTargets() {
        const targets = [];
        for (const enemy of this.scene.enemies.getChildren()) {
            if (!enemy.active) continue;
            if (Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y) <= this.range) {
                targets.push(enemy);
                if (targets.length >= this.shots) break;
            }
        }
        return targets;
    }

    // Spawns a large purple projectile aimed at target and adds it to the scene group.
    fire(target) {
        const p = new Projectile(this.scene, this.x, this.y, target);
        p.damage = this.damage;
        p.setTint(0xaa44ff);
        p.setScale(1.8); // visually larger than archer shots
        this.scene.projectiles.add(p);
    }
}
