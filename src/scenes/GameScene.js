import MapManager from '../map/MapManager.js';
import Enemy from '../entities/Enemy.js';
import Ogre from '../entities/Ogre.js';
import Tower from '../entities/Tower.js';
import Hero from '../entities/Hero.js';
import UIManager from '../ui/UIManager.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });

        // ── GOBLIN (40×40) ──────────────────────────────────────────────
        g.fillStyle(0x3a8a3a);
        g.fillTriangle(6, 14, 0, 3, 14, 16);
        g.fillTriangle(34, 14, 26, 16, 40, 3);
        g.fillStyle(0x4db34d);
        g.fillCircle(20, 18, 13);
        g.fillStyle(0x7a5010);
        g.fillTriangle(13, 7, 11, 1, 19, 9);
        g.fillTriangle(27, 7, 21, 9, 29, 1);
        g.fillStyle(0xffcc00);
        g.fillCircle(14, 15, 4);
        g.fillCircle(26, 15, 4);
        g.fillStyle(0xcc0000);
        g.fillCircle(14, 15, 2.5);
        g.fillCircle(26, 15, 2.5);
        g.fillStyle(0xffffff);
        g.fillCircle(13, 14, 1);
        g.fillCircle(25, 14, 1);
        g.fillStyle(0x3a9a3a);
        g.fillCircle(20, 21, 3);
        g.fillStyle(0x110000);
        g.fillRect(12, 25, 16, 5);
        g.fillStyle(0xeeeeee);
        g.fillRect(13, 25, 3, 6);
        g.fillRect(24, 25, 3, 6);
        g.fillStyle(0x5a2e10);
        g.fillRect(12, 29, 16, 11);
        g.generateTexture('enemy_tex', 40, 40);
        g.clear();

        // ── KNIGHT HERO (50×50) ─────────────────────────────────────────
        g.fillStyle(0x1a33aa);
        g.fillRect(6, 26, 38, 24);
        g.fillTriangle(6, 50, 6, 30, 20, 50);
        g.fillTriangle(44, 50, 30, 50, 44, 30);
        g.fillStyle(0xaaaaaa);
        g.fillRect(16, 28, 18, 20);
        g.fillStyle(0x888888);
        g.fillCircle(25, 19, 13);
        g.fillStyle(0x222222);
        g.fillRect(16, 16, 18, 6);
        g.fillStyle(0xffd700);
        g.fillRect(16, 28, 18, 3);
        g.fillRect(22, 7, 6, 6);
        g.fillStyle(0xcc2200);
        g.fillRect(23, 2, 4, 9);
        g.fillStyle(0xaa1a00);
        g.fillRect(4, 26, 13, 18);
        g.fillStyle(0xffd700);
        g.fillRect(7, 29, 4, 11);
        g.fillRect(4, 33, 10, 4);
        g.fillStyle(0xdddddd);
        g.fillRect(36, 16, 4, 28);
        g.fillStyle(0xffd700);
        g.fillRect(32, 26, 12, 4);
        g.fillStyle(0x8b4513);
        g.fillRect(37, 42, 3, 8);
        g.generateTexture('hero_tex', 50, 50);
        g.clear();

        // ── STONE TOWER (80×80) ─────────────────────────────────────────
        g.fillStyle(0x666677);
        g.fillRect(15, 26, 50, 50);
        g.fillStyle(0x808090);
        g.fillRect(15, 26, 4, 50);
        g.fillRect(15, 26, 50, 4);
        g.fillStyle(0x444455);
        g.fillRect(15, 40, 50, 3);
        g.fillRect(15, 55, 50, 3);
        g.fillRect(15, 68, 50, 3);
        g.fillRect(30, 26, 2, 14);
        g.fillRect(50, 26, 2, 14);
        g.fillRect(40, 43, 2, 12);
        g.fillRect(22, 58, 2, 10);
        g.fillRect(58, 58, 2, 10);
        g.fillStyle(0x111122);
        g.fillRect(36, 34, 8, 18);
        g.fillRect(32, 40, 16, 6);
        g.fillStyle(0x666677);
        g.fillRect(15, 14, 13, 14);
        g.fillRect(33, 14, 14, 14);
        g.fillRect(52, 14, 13, 14);
        g.fillStyle(0x444455);
        g.fillRect(15, 22, 13, 2);
        g.fillRect(33, 22, 14, 2);
        g.fillRect(52, 22, 13, 2);
        g.generateTexture('tower_tex', 80, 80);
        g.clear();

        // ── OGRE (64×64) ────────────────────────────────────────────────
        // Body
        g.fillStyle(0x6b5040);
        g.fillCircle(32, 42, 22);
        // Head
        g.fillStyle(0x7a5a48);
        g.fillCircle(32, 24, 20);
        // Brow ridge
        g.fillStyle(0x3a2010);
        g.fillRect(14, 13, 36, 7);
        // Eyes
        g.fillStyle(0xdd2200);
        g.fillCircle(22, 20, 5);
        g.fillCircle(42, 20, 5);
        g.fillStyle(0x111111);
        g.fillCircle(22, 20, 2.5);
        g.fillCircle(42, 20, 2.5);
        // Nose
        g.fillStyle(0x5a3a28);
        g.fillRect(27, 24, 10, 7);
        // Jaw / mouth
        g.fillStyle(0x2a0e06);
        g.fillRect(18, 32, 28, 10);
        // Tusks
        g.fillStyle(0xeeeecc);
        g.fillTriangle(20, 32, 16, 44, 26, 44);
        g.fillTriangle(44, 32, 38, 44, 48, 44);
        // Left arm
        g.fillStyle(0x6b5040);
        g.fillRect(6, 32, 14, 10);
        // Right arm + club
        g.fillRect(44, 32, 14, 10);
        g.fillStyle(0x4a2a10);
        g.fillRect(54, 16, 8, 28);
        g.fillStyle(0x5a3820);
        g.fillRect(50, 10, 16, 14);
        g.generateTexture('ogre_tex', 64, 64);
        g.clear();

        // ── ROCK PROJECTILE (12×12) ──────────────────────────────────────
        g.fillStyle(0x888888);
        g.fillCircle(6, 6, 6);
        g.fillStyle(0xaaaaaa);
        g.fillCircle(4, 4, 3);
        g.fillStyle(0x555555);
        g.fillCircle(8, 8, 2);
        g.generateTexture('bullet_tex', 12, 12);
        g.destroy();
    }

    create() {
        this.cameras.main.fadeIn(400, 0, 0, 0);

        this.gold = 100;
        this.lives = 20;
        this.path = MapManager.getPathPoints();

        this.drawBackground();

        this.enemies     = this.add.group({ runChildUpdate: true });
        this.projectiles = this.add.group({ runChildUpdate: true });
        this.towers      = this.add.group();

        // Build slot data — each slot tracks its graphics icon
        this.slots = MapManager.getSlotPositions();
        this.slots.forEach(slot => {
            slot.gfx = this.add.graphics();
            this._drawSlotIcon(slot, false);
        });

        // Hero starts unplaced — player must left-click a slot to place it
        this.hero = new Hero(this);
        this.heroSlot = null;

        this.ui = new UIManager();
        this.ui.updateGold(this.gold);
        this.ui.updateLives(this.lives);

        // Show placement instruction at start
        this.time.delayedCall(300, () => {
            this.ui.flashMessage('Left-click a slot to place your Hero!');
        });

        // Left-click slot  → place / move hero
        // Right-click slot → build tower (50g)
        this.input.on('pointerdown', (pointer) => {
            const slot = this._slotNear(pointer.x, pointer.y);

            if (pointer.rightButtonDown()) {
                if (slot && slot.occupied) {
                    this._upgradeTower(slot);
                } else if (slot && !slot.occupied && slot !== this.heroSlot) {
                    this._buildOnSlot(slot);
                } else {
                    this.ui.flashMessage('Right-click an empty slot to build a tower (50g)');
                }
                return;
            }

            // Left-click
            if (!slot) return;

            if (slot === this.heroSlot) {
                // Clicking hero's slot picks the hero back up
                this._unplaceHero();
                this.ui.flashMessage('Hero picked up — left-click a slot to place');
            } else if (!slot.occupied) {
                // Place (or move) hero to this slot
                this._unplaceHero();
                this._placeHero(slot);
            }
        });

        // Hover: highlight the nearest available slot
        this.input.on('pointermove', (pointer) => {
            this.slots.forEach(slot => {
                if (slot.occupied) return;
                const near = Phaser.Math.Distance.Between(
                    pointer.x, pointer.y, slot.x, slot.y
                ) <= 42;
                if (near !== slot._hovered) {
                    slot._hovered = near;
                    if (slot !== this.heroSlot) this._drawSlotIcon(slot, near);
                }
            });
        });

        this.game.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

        this.physics.add.overlap(this.projectiles, this.enemies, (projectile, enemy) => {
            if (!enemy.active) return;
            enemy.takeDamage(projectile.damage);
            projectile.destroy();
        });

        // Wave / score state
        this.wave       = 1;
        this.score      = 0;
        this.gameOver   = false;
        this.spawnQueue = [];
        this.monstersAlive = 0;
        this.allSpawned    = false;
        this.betweenWaves  = false;

        this.ui.updateWave(this.wave, this._waveConfig(this.wave).total);
        this.ui.updateScore(this.score);

        this.events.on('enemy-killed', (gold, type) => {
            this.gold += gold;
            this.ui.updateGold(this.gold);
            const pts = (type === 'ogre' ? 50 : 10) * this.wave;
            this.score += pts;
            this.ui.updateScore(this.score);
            this.monstersAlive--;
            this._checkWaveComplete();
        });

        this.events.on('goblin-escaped', (hearts = 1) => {
            this.lives = Math.max(0, this.lives - hearts);
            this.ui.updateLives(this.lives);
            this.monstersAlive--;
            if (this.lives === 0) {
                this.gameOver = true;
                this.time.removeAllEvents();
                this.physics.pause();
                this._showGameOver();
                return;
            }
            this._checkWaveComplete();
        });

        // Pause overlay text (drawn last so it sits on top)
        this.pauseText = this.add.text(540, 480, 'PAUSED', {
            fontSize: '72px',
            fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8,
            alpha: 0.95,
        }).setOrigin(0.5).setVisible(false).setDepth(100);

        this.paused = false;
        this.input.keyboard.on('keydown-SPACE', () => {
            if (this.gameOver) return;
            this.paused = !this.paused;
            if (this.paused) {
                this.physics.pause();
                this.time.paused = true;
                this.pauseText.setVisible(true);
            } else {
                this.physics.resume();
                this.time.paused = false;
                this.pauseText.setVisible(false);
            }
        });

        // Speed toggle — F key or button click
        this.speedMult = 1;
        const speedBtn = document.getElementById('speed-btn');
        const toggleSpeed = () => {
            if (this.gameOver) return;
            this.speedMult = this.speedMult === 1 ? 2 : 1;
            const fast = this.speedMult === 2;
            this.physics.world.timeScale = fast ? 0.5 : 1; // inverse for arcade physics
            this.time.timeScale = fast ? 2 : 1;
            speedBtn.textContent = fast ? '▶▶ 2x' : '▶ 1x';
            speedBtn.classList.toggle('fast', fast);
        };
        this.input.keyboard.on('keydown-F', toggleSpeed);
        speedBtn.addEventListener('click', toggleSpeed);
        // Clean up listener when scene shuts down
        this.events.once('shutdown', () => speedBtn.removeEventListener('click', toggleSpeed));

        // Kick off wave 1
        this._startWave();
    }

    // ── Slot helpers ──────────────────────────────────────────────────────

    // Returns the nearest slot within radius regardless of state
    _slotNear(px, py) {
        return this.slots.find(s =>
            Phaser.Math.Distance.Between(px, py, s.x, s.y) <= 42
        ) || null;
    }

    _placeHero(slot) {
        this.heroSlot = slot;
        slot.gfx.setVisible(false);
        this.hero.placeAt(slot.x, slot.y);
    }

    _unplaceHero() {
        if (!this.heroSlot) return;
        // Restore the slot icon if the slot doesn't also have a tower
        if (!this.heroSlot.occupied) {
            this.heroSlot.gfx.setVisible(true);
            this._drawSlotIcon(this.heroSlot, false);
        }
        this.heroSlot = null;
        this.hero.unplace();
    }

    _buildOnSlot(slot) {
        if (this.gold < 50) {
            this.ui.flashMessage('Not enough gold! (need 50g)');
            return;
        }
        slot.occupied = true;
        slot.gfx.setVisible(false);

        const tower = new Tower(this, slot.x, slot.y);
        slot.tower = tower;
        this.towers.add(tower);
        this.gold -= 50;
        this.ui.updateGold(this.gold);
    }

    _upgradeTower(slot) {
        const tower = slot.tower;
        if (!tower) return;
        if (tower.towerLevel >= 5) {
            this.ui.flashMessage('Tower is already max level!');
            return;
        }
        const cost = tower.upgradeCost;
        if (this.gold < cost) {
            this.ui.flashMessage(`Not enough gold! Upgrade costs ${cost}g`);
            return;
        }
        tower.upgrade(this, this.gold);
        this.gold -= cost;
        this.ui.updateGold(this.gold);
    }

    // Draw (or redraw) the slot icon — grey normally, amber on hover
    _drawSlotIcon(slot, hover) {
        const g   = slot.gfx;
        const { x, y } = slot;
        const r   = 30;
        const col = hover ? 0xffcc44 : 0x9a9a7a;
        const a   = hover ? 0.92 : 0.55;

        g.clear();

        // Soft fill
        g.fillStyle(hover ? 0xffcc44 : 0x5a5a44, hover ? 0.14 : 0.08);
        g.fillCircle(x, y, r);

        // Outer ring (double stroke for depth)
        g.lineStyle(4, col, a);
        g.strokeCircle(x, y, r);
        g.lineStyle(1, hover ? 0xffffff : 0xcccc99, a * 0.35);
        g.strokeCircle(x, y, r - 5);

        // Four corner tick marks
        const d = r - 3;
        const t = 9;
        g.lineStyle(3, col, a);
        const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
        corners.forEach(([sx, sy]) => {
            const cx = x + sx * d * 0.7;
            const cy = y + sy * d * 0.7;
            g.lineBetween(cx, cy, cx - sx * t, cy);
            g.lineBetween(cx, cy, cx, cy - sy * t);
        });

        // Centre cross-hair
        g.lineStyle(2, col, a * 0.75);
        g.lineBetween(x, y - 13, x, y + 13);
        g.lineBetween(x - 13, y, x + 13, y);

        // "50g" cost label
        if (!hover) return;
        // Draw a tiny coin-icon dot
        g.fillStyle(0xffd700, 0.9);
        g.fillCircle(x, y - r - 10, 5);
    }

    // ── Background drawing ────────────────────────────────────────────────

    drawBackground() {
        const W = 1080, H = 960;

        // ── Sky ──────────────────────────────────────────────────────────
        const sky = this.add.graphics();
        sky.fillGradientStyle(0x010510, 0x010510, 0x081630, 0x081630, 1);
        sky.fillRect(0, 0, W, H);

        // Moon with layered glow
        sky.fillStyle(0xfaf2d8);
        sky.fillCircle(870, 88, 54);
        sky.fillStyle(0xe8e0c2);
        sky.fillCircle(856, 76, 10);
        sky.fillCircle(884, 100, 7);
        sky.fillCircle(860, 104, 8);
        [80, 106, 138, 176].forEach(r => { sky.fillStyle(0xfaf2d8, 0.04); sky.fillCircle(870, 88, r); });

        // Stars
        sky.fillStyle(0xffffff);
        [
            [55,45,2.2],[190,28,1.5],[330,62,2.0],[460,22,1.2],[575,52,2.0],
            [695,32,1.5],[800,18,1.2],[960,58,2.0],[1030,28,1.5],[105,138,1.5],
            [245,108,2.0],[395,148,1.2],[510,122,1.5],[665,92,2.0],[720,152,1.2],
            [35,208,1.5],[165,188,1.2],[475,202,2.0],[645,218,1.5],[915,188,1.2],
            [285,238,1.5],[775,228,1.2],[140,92,1.2],[1005,122,1.5],[1045,198,2.0],
            [420,78,1.2],[88,175,1.0],[600,168,1.0],[350,195,1.0],[68,305,1.2],
            [450,288,1.0],[810,272,1.5],[1060,310,1.0],[220,328,1.2],[540,258,1.0],
        ].forEach(([sx, sy, sr]) => sky.fillCircle(sx, sy, sr));

        // Cross-flare on brightest stars
        [[330,62],[665,92],[475,202],[810,272]].forEach(([sx, sy]) => {
            sky.fillStyle(0xffffff, 0.22);
            sky.fillRect(sx - 9, sy - 0.5, 18, 1);
            sky.fillRect(sx - 0.5, sy - 9, 1, 18);
        });

        // Wispy clouds (rows of overlapping circles)
        sky.fillStyle(0x0d2040, 0.22);
        [-60,-30,0,30,60,90,120].forEach(dx => sky.fillCircle(210+dx, 290, 20));
        [-50,-20,10,40,70,100].forEach(dx => sky.fillCircle(620+dx, 332, 16));
        [-40,-10,20,50,80].forEach(dx => sky.fillCircle(970+dx, 272, 14));

        // ── Mountain ranges ──────────────────────────────────────────────
        const mtn = this.add.graphics();

        // Far peaks
        mtn.fillStyle(0x0d1e36);
        mtn.fillTriangle(0, 520, 190, 298, 400, 520);
        mtn.fillTriangle(290, 520, 502, 262, 714, 520);
        mtn.fillTriangle(592, 520, 802, 236, 994, 520);
        mtn.fillTriangle(872, 520, 1080, 322, 1080, 520);
        mtn.fillRect(0, 518, W, 4);

        // Snow caps
        mtn.fillStyle(0xddeef8, 0.52);
        mtn.fillTriangle(176, 326, 190, 298, 204, 326);
        mtn.fillTriangle(488, 288, 502, 262, 516, 288);
        mtn.fillTriangle(788, 260, 802, 236, 816, 260);
        mtn.fillStyle(0xc8daf0, 0.28);
        mtn.fillTriangle(190, 318, 200, 298, 216, 322);

        // Ridge edge highlights
        mtn.lineStyle(1, 0x1a3a60, 0.4);
        mtn.lineBetween(0, 520, 190, 298);
        mtn.lineBetween(290, 520, 502, 262);
        mtn.lineBetween(592, 520, 802, 236);

        // Mid range
        mtn.fillStyle(0x091424);
        mtn.fillTriangle(0, 680, 240, 468, 500, 680);
        mtn.fillTriangle(410, 680, 660, 432, 910, 680);
        mtn.fillTriangle(800, 680, 1052, 486, 1080, 680);
        mtn.fillRect(0, 658, W, 24);

        // Close mountain base
        mtn.fillStyle(0x060c1a);
        mtn.fillTriangle(0, 860, 340, 596, 652, 860);
        mtn.fillTriangle(558, 860, 852, 564, 1080, 860);
        mtn.fillRect(0, 840, W, H - 840);

        // Atmosphere / fog bands
        mtn.fillStyle(0x0e1e34, 0.18);
        mtn.fillRect(0, 538, W, 68);
        mtn.fillStyle(0x0a1628, 0.13);
        mtn.fillRect(0, 648, W, 58);
        mtn.fillStyle(0x060e1c, 0.1);
        mtn.fillRect(0, 756, W, 60);

        // ── Rocky ledge platforms ────────────────────────────────────────
        for (const y of MapManager.getLedgeYValues()) {
            this._drawRockyLedge(mtn, y);
        }

        // ── Cobblestone path + torches ───────────────────────────────────
        this._drawCobblePath();

        // ── Edge vignette ────────────────────────────────────────────────
        const vig = this.add.graphics();
        vig.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0.42, 0, 0.42, 0);
        vig.fillRect(0, 0, 100, H);
        vig.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0, 0.42, 0, 0.42);
        vig.fillRect(W - 100, 0, 100, H);
        vig.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0.28, 0.28, 0, 0);
        vig.fillRect(0, 0, W, 80);
    }

    _drawRockyLedge(g, y) {
        const lx = 75, lw = 930;
        const topH = 26;    // top surface thickness
        const faceH = 60;   // cliff face height below top surface

        // ── Cliff face (front vertical surface) ──────────────────────────
        g.fillStyle(0x1c1c2c);
        g.fillRect(lx, y + topH / 2, lw, faceH);

        // Upper band — ambient sky bounce
        g.fillStyle(0x272740);
        g.fillRect(lx, y + topH / 2, lw, Math.round(faceH * 0.36));

        // Horizontal mortar courses
        const courseH = 17;
        g.fillStyle(0x121220);
        for (let fy = y + topH / 2 + courseH; fy < y + topH / 2 + faceH; fy += courseH) {
            g.fillRect(lx, Math.round(fy), lw, 2);
        }

        // Vertical block joints — alternating offset per course
        const bW = 70;
        g.fillStyle(0x121220);
        for (let course = 0; course * courseH < faceH; course++) {
            const fy = y + topH / 2 + course * courseH;
            const off = (course % 2 === 0) ? 0 : bW / 2;
            for (let fx = lx + off; fx < lx + lw; fx += bW) {
                g.fillRect(Math.round(fx), Math.round(fy), 2, courseH);
            }
        }

        // Top-left highlight on each face block (3D sheen)
        g.fillStyle(0x2e2e48, 0.45);
        for (let course = 0; course < 2; course++) {
            const fy = y + topH / 2 + course * courseH + 2;
            const off = (course % 2 === 0) ? 0 : bW / 2;
            for (let fx = lx + off + 2; fx < lx + lw; fx += bW) {
                g.fillRect(Math.round(fx), Math.round(fy), bW - 6, 4);
            }
        }

        // Diagonal crack veins
        g.fillStyle(0x0a0a16);
        [[160,8,10,26],[338,12,14,32],[518,6,12,24],[698,10,9,22],[878,14,16,36]].forEach(([cx, cy1, dx, len]) => {
            for (let i = 0; i < len; i += 2) {
                g.fillRect(lx + cx + Math.round(i * dx / len), y + topH / 2 + cy1 + i, 1, 2);
            }
        });

        // ── Top surface ───────────────────────────────────────────────────
        g.fillStyle(0x34344c);
        g.fillRect(lx, y - topH / 2, lw, topH);

        // Surface stones — irregular widths for natural look
        let sx2 = lx + 4;
        [42,36,48,38,44,40,46,36,42,44,38,46,40,42,36,48,38,44,42,40].forEach((sw, i) => {
            g.fillStyle((i % 3 === 0) ? 0x3c3c54 : (i % 3 === 1) ? 0x393952 : 0x414150);
            g.fillRect(sx2, y - topH / 2 + 4, sw - 2, topH - 8);
            sx2 += sw;
        });

        // Moonlight highlight on very top edge
        g.fillStyle(0x545470);
        g.fillRect(lx, y - topH / 2, lw, 4);
        g.fillStyle(0x484862, 0.4);
        g.fillRect(lx, y - topH / 2 + 4, lw, 2);

        // Inner shadow where top meets cliff face
        g.fillStyle(0x08081a, 0.7);
        g.fillRect(lx, y + topH / 2 - 5, lw, 6);

        // ── Drop shadow below cliff ───────────────────────────────────────
        g.fillStyle(0x000000, 0.62);
        g.fillRect(lx, y + topH / 2 + faceH, lw, 14);
        g.fillStyle(0x000000, 0.24);
        g.fillRect(lx, y + topH / 2 + faceH + 14, lw, 8);

        // ── Moss tufts at cliff base ──────────────────────────────────────
        g.fillStyle(0x163018, 0.65);
        [128, 298, 472, 642, 814].forEach(mx => {
            g.fillRect(lx + mx, y + topH / 2 + faceH - 10, 38, 12);
            g.fillRect(lx + mx + 8, y + topH / 2 + faceH - 17, 20, 8);
            g.fillRect(lx + mx + 13, y + topH / 2 + faceH - 22, 10, 6);
        });

        // Fallen rubble at cliff base
        g.fillStyle(0x1a1a28);
        [88, 218, 388, 552, 718, 888].forEach(rx => {
            g.fillRect(lx + rx, y + topH / 2 + faceH + 10, 16, 7);
            g.fillRect(lx + rx + 20, y + topH / 2 + faceH + 13, 9, 5);
        });
    }

    _drawCobblePath() {
        const lx = 75, lw = 930;
        const topH = 26, faceH = 60;
        const cobble = this.add.graphics();

        // Helper: fill area with 3D cobblestone brick pattern
        const cobbleRect = (rx, ry, rw, rh, sW = 28, sH = 14) => {
            cobble.fillStyle(0x22160a);
            cobble.fillRect(rx, ry, rw, rh);
            let row = 0;
            for (let cy = ry + 2; cy + sH <= ry + rh - 2; cy += sH + 2) {
                const off = (row % 2) * Math.round(sW / 2 + 1);
                for (let cx = rx + 2 - off; cx < rx + rw - 2; cx += sW + 2) {
                    const bx = Math.max(cx, rx + 2);
                    const bw = Math.min(cx + sW, rx + rw - 2) - bx;
                    if (bw < 4) continue;
                    cobble.fillStyle(0x7a6240);      // stone base
                    cobble.fillRect(bx, cy, bw, sH);
                    cobble.fillStyle(0x8c7250);      // top highlight
                    cobble.fillRect(bx, cy, bw, 3);
                    cobble.fillRect(bx, cy, 2, sH);
                    cobble.fillStyle(0x584430);      // bottom shadow
                    cobble.fillRect(bx, cy + sH - 3, bw, 3);
                    cobble.fillRect(bx + bw - 2, cy, 2, sH);
                    cobble.fillStyle(0x6a5438, 0.3); // worn centre
                    cobble.fillRect(bx + 3, cy + 3, bw - 6, sH - 6);
                }
                row++;
            }
        };

        // ── Ledge top cobblestone surfaces ───────────────────────────────
        MapManager.getLedgeYValues().forEach(y => {
            cobbleRect(lx, y - topH / 2, lw, topH, 34, 12);
            // Raised front lip
            cobble.fillStyle(0x3a2a0e);
            cobble.fillRect(lx, y + topH / 2 - 4, lw, 5);
            // Rear highlight
            cobble.fillStyle(0x6a5840, 0.35);
            cobble.fillRect(lx, y - topH / 2, lw, 2);
        });

        // Phaser Graphics has no bezierCurveTo — sample the cubic manually
        const bez = (width, color, alpha, p0x, p0y, c1x, c1y, c2x, c2y, p3x, p3y, steps = 28) => {
            cobble.lineStyle(width, color, alpha);
            cobble.beginPath();
            cobble.moveTo(p0x, p0y);
            for (let i = 1; i <= steps; i++) {
                const t = i / steps, mt = 1 - t;
                const x = mt*mt*mt*p0x + 3*mt*mt*t*c1x + 3*mt*t*t*c2x + t*t*t*p3x;
                const y = mt*mt*mt*p0y + 3*mt*mt*t*c1y + 3*mt*t*t*c2y + t*t*t*p3y;
                cobble.lineTo(x, y);
            }
            cobble.strokePath();
        };

        // ── Right connector — U-curve bulging RIGHT ───────────────────────
        // Center bezier: (930,rcBot) → C1=(1030,rcBot) → C2=(1030,rcTop) → (930,rcTop)
        // Edges offset ±38px in x on each control point for parallel approximation
        const rcTop = Math.round(500 + topH / 2);   // 513
        const rcBot = Math.round(850 - topH / 2);   // 837
        const rcCX = 1030;   // control-point x (sets bulge distance)

        // Drop shadow (cliff-drop side, right)
        bez(18, 0x000000, 0.45,  968, rcBot, rcCX+38, rcBot, rcCX+38, rcTop,  968, rcTop);
        // Dark mortar base
        bez(84, 0x1c1408, 1,     930, rcBot, rcCX,    rcBot, rcCX,    rcTop,  930, rcTop);
        // Stone surface
        bez(74, 0x7a6240, 1,     930, rcBot, rcCX,    rcBot, rcCX,    rcTop,  930, rcTop);
        // Worn centre highlight
        bez(22, 0x8c7452, 0.38,  930, rcBot, rcCX,    rcBot, rcCX,    rcTop,  930, rcTop);
        // Inner edge line (left / mountain side)
        bez(3,  0x1c1408, 0.9,   892, rcBot, rcCX-38, rcBot, rcCX-38, rcTop,  892, rcTop);
        // Outer edge line (right / cliff side)
        bez(3,  0x1c1408, 0.9,   968, rcBot, rcCX+38, rcBot, rcCX+38, rcTop,  968, rcTop);
        // Retaining wall (mountain side, slightly left of inner edge)
        bez(16, 0x1e1e30, 1,     878, rcBot, rcCX-52, rcBot, rcCX-52, rcTop,  878, rcTop);
        bez(12, 0x28283e, 1,     878, rcBot, rcCX-52, rcBot, rcCX-52, rcTop,  878, rcTop);

        // ── Left connector — U-curve bulging LEFT ─────────────────────────
        // Center bezier: (150,lcBot) → C1=(50,lcBot) → C2=(50,lcTop) → (150,lcTop)
        const lcTop = Math.round(150 + topH / 2);   // 163
        const lcBot = Math.round(500 - topH / 2);   // 487
        const lcCX = 50;    // control-point x

        // Drop shadow (cliff-drop side, left)
        bez(18, 0x000000, 0.45,  112, lcBot, lcCX-38, lcBot, lcCX-38, lcTop,  112, lcTop);
        // Dark mortar base
        bez(84, 0x1c1408, 1,     150, lcBot, lcCX,    lcBot, lcCX,    lcTop,  150, lcTop);
        // Stone surface
        bez(74, 0x7a6240, 1,     150, lcBot, lcCX,    lcBot, lcCX,    lcTop,  150, lcTop);
        // Worn centre highlight
        bez(22, 0x8c7452, 0.38,  150, lcBot, lcCX,    lcBot, lcCX,    lcTop,  150, lcTop);
        // Inner edge line (right / mountain side)
        bez(3,  0x1c1408, 0.9,   188, lcBot, lcCX+38, lcBot, lcCX+38, lcTop,  188, lcTop);
        // Outer edge line (left / cliff side)
        bez(3,  0x1c1408, 0.9,   112, lcBot, lcCX-38, lcBot, lcCX-38, lcTop,  112, lcTop);
        // Retaining wall (mountain side, slightly right of inner edge)
        bez(16, 0x1e1e30, 1,     202, lcBot, lcCX+52, lcBot, lcCX+52, lcTop,  202, lcTop);
        bez(12, 0x28283e, 1,     202, lcBot, lcCX+52, lcBot, lcCX+52, lcTop,  202, lcTop);

        // ── Wall torches along each ledge ────────────────────────────────
        const torch = this.add.graphics();
        const torchAt = (tx, ty) => {
            // Warm glow halos
            torch.fillStyle(0xff7700, 0.06); torch.fillCircle(tx, ty - 34, 72);
            torch.fillStyle(0xff5500, 0.07); torch.fillCircle(tx, ty - 34, 42);
            torch.fillStyle(0xff9900, 0.04); torch.fillCircle(tx, ty - 34, 100);
            // Pole
            torch.fillStyle(0x4a2e0a);
            torch.fillRect(tx - 3, ty - 40, 6, 28);
            // Bracket arm
            torch.fillStyle(0x3a2008);
            torch.fillRect(tx - 9, ty - 42, 20, 5);
            torch.fillRect(tx + 9, ty - 50, 3, 10);
            // Bracket detail
            torch.fillStyle(0x2a1404);
            torch.fillRect(tx - 8, ty - 42, 2, 5);
            torch.fillRect(tx + 16, ty - 50, 2, 10);
            // Flame — outer orange
            torch.fillStyle(0xcc4400, 0.95);
            torch.fillTriangle(tx - 7, ty - 50, tx + 7, ty - 50, tx, ty - 66);
            // Flame — mid amber
            torch.fillStyle(0xff7700, 0.9);
            torch.fillTriangle(tx - 5, ty - 50, tx + 5, ty - 50, tx + 1, ty - 64);
            // Flame — inner yellow
            torch.fillStyle(0xffcc00, 0.85);
            torch.fillTriangle(tx - 3, ty - 50, tx + 3, ty - 50, tx, ty - 60);
            // Flame core
            torch.fillStyle(0xffffff, 0.45); torch.fillCircle(tx, ty - 56, 3);
        };

        // Torches between slot positions (at x=205, 410, 665, 865 per ledge)
        [850, 500, 150].forEach(y => {
            [200, 415, 668, 862].forEach(x => torchAt(x, y));
        });
    }

    _waveConfig(wave) {
        const goblins   = 80 + (wave - 1) * 10;
        const ogres     = Math.floor(2 + (wave - 1) * 1.5);
        const total     = goblins + ogres;
        const speedMult = Math.min(3.5, 1 + (wave - 1) * 0.15);
        const hpMult    = Math.min(10,  1 + (wave - 1) * 0.25);
        const spawnDelay = Math.max(120, 380 - (wave - 1) * 25);
        return { goblins, ogres, total, speedMult, hpMult, spawnDelay };
    }

    _startWave() {
        if (this.gameOver) return;
        const cfg = this._waveConfig(this.wave);
        this.ui.updateWave(this.wave, cfg.total);
        this.ui.flashMessage(`Wave ${this.wave} incoming!  (${cfg.total} monsters)`);

        // Build a shuffled queue: 'goblin' × goblins, 'ogre' × ogres
        this.spawnQueue = [
            ...Array(cfg.goblins).fill('goblin'),
            ...Array(cfg.ogres).fill('ogre'),
        ];
        // Shuffle
        for (let i = this.spawnQueue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.spawnQueue[i], this.spawnQueue[j]] = [this.spawnQueue[j], this.spawnQueue[i]];
        }

        this.monstersAlive = cfg.total;
        this.allSpawned    = false;
        this.betweenWaves  = false;

        this.spawnEvent = this.time.addEvent({
            delay: cfg.spawnDelay,
            callback: this._spawnNext,
            callbackScope: this,
            repeat: cfg.total - 1,
        });
    }

    _spawnNext() {
        if (this.gameOver) return;
        const type = this.spawnQueue.shift();
        const cfg  = this._waveConfig(this.wave);
        const start = this.path[0];

        if (type === 'ogre') {
            this.enemies.add(new Ogre(this, start.x, start.y, this.path, cfg.speedMult, cfg.hpMult));
        } else {
            this.enemies.add(new Enemy(this, start.x, start.y, this.path, cfg.speedMult, cfg.hpMult));
        }

        if (this.spawnQueue.length === 0) {
            this.allSpawned = true;
            this._checkWaveComplete();
        }
    }

    _checkWaveComplete() {
        if (!this.allSpawned || this.monstersAlive > 0 || this.betweenWaves || this.gameOver) return;
        this.betweenWaves = true;
        this.wave++;
        this.ui.flashMessage(`Wave complete!  Next wave in 5 seconds…`, 4500);
        this.time.delayedCall(5000, () => {
            if (!this.gameOver) this._startWave();
        });
    }

    _showGameOver() {
        const W = 1080, H = 960;

        // Dark overlay
        const overlay = this.add.graphics().setDepth(200);
        overlay.fillStyle(0x000000, 0);
        overlay.fillRect(0, 0, W, H);
        this.tweens.add({ targets: overlay, alpha: 0, fillAlpha: 0.72, duration: 800 });

        // "GAME OVER"
        const title = this.add.text(W / 2, H / 2 - 80, 'GAME OVER', {
            fontSize: '96px',
            fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
            fontStyle: 'bold',
            color: '#cc2222',
            stroke: '#000000',
            strokeThickness: 10,
        }).setOrigin(0.5).setAlpha(0).setDepth(201);

        // "You Died."
        const sub = this.add.text(W / 2, H / 2 + 20, 'You Died.', {
            fontSize: '52px',
            fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
            fontStyle: 'italic',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6,
        }).setOrigin(0.5).setAlpha(0).setDepth(201);

        // Score line
        const scoreLine = this.add.text(W / 2, H / 2 + 100, `Wave ${this.wave}  •  Score: ${this.score.toLocaleString()}`, {
            fontSize: '32px',
            fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
            color: '#ffdd44',
            stroke: '#000000',
            strokeThickness: 5,
        }).setOrigin(0.5).setAlpha(0).setDepth(201);

        // "Press SPACE to return" — appears after score, blinks
        const returnPrompt = this.add.text(W / 2, H / 2 + 180, 'Press  SPACE  to return to menu', {
            fontSize: '30px',
            fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 5,
        }).setOrigin(0.5).setAlpha(0).setDepth(201);

        this.tweens.add({ targets: title,        alpha: 1, duration: 600, delay: 400,  ease: 'Power2' });
        this.tweens.add({ targets: sub,          alpha: 1, duration: 600, delay: 700,  ease: 'Power2' });
        this.tweens.add({ targets: scoreLine,    alpha: 1, duration: 600, delay: 1000, ease: 'Power2' });
        this.tweens.add({
            targets: returnPrompt, alpha: 1, duration: 600, delay: 1400, ease: 'Power2',
            onComplete: () => {
                this.tweens.add({
                    targets: returnPrompt, alpha: 0.1,
                    duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
                });
            }
        });

        // Re-bind space to go back to splash (override the pause listener)
        // Reset speed
        this.physics.world.timeScale = 1;
        this.time.timeScale = 1;
        const speedBtn = document.getElementById('speed-btn');
        if (speedBtn) { speedBtn.textContent = '▶ 1x'; speedBtn.classList.remove('fast'); }

        this.input.keyboard.removeAllListeners('keydown-SPACE');
        this.input.keyboard.once('keydown-SPACE', () => {
            this.cameras.main.fadeOut(400, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('SplashScene');
            });
        });
    }

    update(time) {
        if (this.paused || this.gameOver) return;
        this.hero.update(time);
        this.towers.getChildren().forEach(tower => tower.update(time));
    }
}
