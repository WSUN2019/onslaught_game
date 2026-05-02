// Projectile: a homing bullet fired by towers and the Hero.
// It tracks its target every frame and destroys itself if the target dies first.
// Callers set p.damage after construction; collision handling lives in GameScene.
export default class Projectile extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, target) {
        super(scene, x, y, 'bullet_tex');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.target = target;
        this.speed = 900;  // px/s — fast enough to feel responsive at any range
        this.damage = 10;  // overwritten by the firing tower/hero before use
        this.setOrigin(0.5);
    }

    // Called every frame. Steers toward the target using Arcade physics.
    // If the target was killed before impact, the projectile self-destructs.
    update() {
        if (!this.target || !this.target.active) {
            this.destroy();
            return;
        }
        this.scene.physics.moveToObject(this, this.target, this.speed);
    }
}
