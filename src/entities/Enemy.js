export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, path, speedMult = 1, hpMult = 1) {
        super(scene, x, y, 'enemy_tex');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.path = path;
        this.pathIndex = 1;
        this.speed = 90 * speedMult;
        this.hp = Math.ceil(30 * hpMult);
        this.maxHp = this.hp;
        this.setOrigin(0.5);

        // HP bar drawn on top of sprite (added after so it renders above)
        this.hpBar = scene.add.graphics();
        this.on('destroy', () => { if (this.hpBar) this.hpBar.destroy(); });
    }

    update() {
        if (this.pathIndex >= this.path.length) {
            this.scene.events.emit('goblin-escaped');
            this.destroy();
            return;
        }

        const target = this.path[this.pathIndex];
        const dist = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);

        if (dist < 8) {
            this.body.reset(target.x, target.y);
            this.pathIndex++;
        } else {
            this.scene.physics.moveToObject(this, target, this.speed);
        }

        this._drawHPBar();
    }

    _drawHPBar() {
        const bw = 44, bh = 6;
        const bx = this.x - bw / 2;
        const by = this.y - 32;
        const ratio = Math.max(0, this.hp / this.maxHp);
        const col = ratio > 0.5 ? 0x22dd22 : ratio > 0.25 ? 0xddcc00 : 0xdd2222;

        this.hpBar.clear();
        // Background
        this.hpBar.fillStyle(0x220000);
        this.hpBar.fillRect(bx, by, bw, bh);
        // HP fill
        this.hpBar.fillStyle(col);
        this.hpBar.fillRect(bx, by, Math.floor(bw * ratio), bh);
    }

    takeDamage(amount) {
        this.hp -= amount;
        this.setTint(0xff4444);
        this.scene.time.delayedCall(120, () => {
            if (this.active) this.clearTint();
        });
        if (this.hp <= 0) this.die();
    }

    die() {
        if (!this.active) return;
        this.body.stop();
        this.setActive(false);
        if (this.hpBar) this.hpBar.setVisible(false);

        this.scene.tweens.add({
            targets: this,
            scale: 0,
            alpha: 0,
            duration: 280,
            ease: 'Back.easeIn',
            onComplete: () => {
                this.scene.events.emit('enemy-killed', 8, 'goblin');
                this.destroy();
            }
        });
    }
}
