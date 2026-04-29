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
        const bg = this.add.graphics();

        bg.fillGradientStyle(0x06061a, 0x06061a, 0x0d1a38, 0x0d1a38, 1);
        bg.fillRect(0, 0, W, H);

        // Moon
        bg.fillStyle(0xf8f0cc, 1);
        bg.fillCircle(860, 80, 48);
        bg.fillStyle(0xe0d8b8, 1);
        bg.fillCircle(848, 72, 8);
        bg.fillCircle(872, 94, 5);
        bg.fillCircle(854, 100, 6);
        bg.fillStyle(0xf8f0cc, 0.06);
        bg.fillCircle(860, 80, 88);
        bg.fillStyle(0xf8f0cc, 0.03);
        bg.fillCircle(860, 80, 120);

        // Stars
        bg.fillStyle(0xffffff, 1);
        [
            [55,45,2],[190,28,1.5],[330,62,2],[460,22,1],[575,52,2],
            [695,32,1.5],[800,18,1],[960,58,2],[1030,28,1.5],[105,138,1.5],
            [245,108,2],[395,148,1],[510,122,1.5],[665,92,2],[720,152,1],
            [1005,122,1.5],[35,208,1.5],[165,188,1],[475,202,2],[645,218,1.5],
            [915,188,1],[1045,198,2],[285,238,1.5],[775,228,1],[140,92,1],
        ].forEach(([sx, sy, sr]) => bg.fillCircle(sx, sy, sr));

        // Far mountains
        bg.fillStyle(0x12203a);
        bg.fillTriangle(0,460, 140,270, 310,460);
        bg.fillTriangle(220,460, 410,235, 600,460);
        bg.fillTriangle(500,460, 700,195, 890,460);
        bg.fillTriangle(760,460, 970,255, 1080,460);
        bg.fillRect(0, 460, W, H - 460);

        // Mid mountains
        bg.fillStyle(0x0e1828);
        bg.fillTriangle(0,590, 190,420, 400,590);
        bg.fillTriangle(310,590, 540,385, 760,590);
        bg.fillTriangle(660,590, 900,440, 1080,590);
        bg.fillRect(0, 590, W, H - 590);

        // Close mountain base
        bg.fillStyle(0x0a1020);
        bg.fillTriangle(0,760, 280,580, 530,760);
        bg.fillTriangle(440,760, 730,545, 980,760);
        bg.fillTriangle(880,760, 1080,650, 1080,760);
        bg.fillRect(0, 760, W, H - 760);

        // Rocky ledge platforms
        for (const y of MapManager.getLedgeYValues()) {
            this._drawRockyLedge(bg, y);
        }

        // Mountain trail path
        const pathGfx = this.add.graphics();
        pathGfx.lineStyle(12, 0x5a3a18, 0.85);
        pathGfx.beginPath();
        pathGfx.moveTo(this.path[0].x, this.path[0].y);
        for (let i = 1; i < this.path.length; i++) {
            pathGfx.lineTo(this.path[i].x, this.path[i].y);
        }
        pathGfx.strokePath();
        pathGfx.lineStyle(4, 0x8a6030, 0.5);
        pathGfx.beginPath();
        pathGfx.moveTo(this.path[0].x, this.path[0].y);
        for (let i = 1; i < this.path.length; i++) {
            pathGfx.lineTo(this.path[i].x, this.path[i].y);
        }
        pathGfx.strokePath();
    }

    _drawRockyLedge(g, y) {
        const x = 80, w = 920, h = 34;
        g.fillStyle(0x38384a);
        g.fillRect(x, y - h / 2, w, h);
        g.fillStyle(0x50506a);
        g.fillRect(x, y - h / 2, w, 8);
        g.fillStyle(0x50506a);
        for (let i = 0; i < 9; i++) {
            g.fillRect(x + 10 + i * 100, y - h / 2 - 7, 62, 9);
        }
        g.fillStyle(0x40404e);
        for (let i = 0; i < 8; i++) {
            g.fillRect(x + 65 + i * 100, y - h / 2 - 4, 30, 6);
        }
        g.fillStyle(0x22222e);
        for (let bx = x + 90; bx < x + w; bx += 100) {
            g.fillRect(bx, y - h / 2, 3, h);
        }
        g.fillRect(x, y, w, 2);
        g.fillStyle(0x606075);
        g.fillRect(x, y - h / 2, 4, h);
        g.fillStyle(0x08080f);
        g.fillRect(x, y + h / 2, w, 10);
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

        this.tweens.add({ targets: title,     alpha: 1, duration: 600, delay: 400, ease: 'Power2' });
        this.tweens.add({ targets: sub,       alpha: 1, duration: 600, delay: 700, ease: 'Power2' });
        this.tweens.add({ targets: scoreLine, alpha: 1, duration: 600, delay: 1000, ease: 'Power2' });
    }

    update(time) {
        if (this.paused || this.gameOver) return;
        this.hero.update(time);
        this.towers.getChildren().forEach(tower => tower.update(time));
    }
}
