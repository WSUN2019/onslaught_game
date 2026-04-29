export default class Projectile extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, target) {
        super(scene, x, y, 'bullet_tex');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.target = target;
        this.speed = 900;
        this.damage = 10;
        this.setOrigin(0.5);
    }

    update() {
        if (!this.target || !this.target.active) {
            this.destroy();
            return;
        }
        this.scene.physics.moveToObject(this, this.target, this.speed);
    }
}
