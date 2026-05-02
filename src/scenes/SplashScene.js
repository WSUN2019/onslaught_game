import music from '../audio/MusicManager.js';

export default class SplashScene extends Phaser.Scene {
    constructor() {
        super('SplashScene');
    }

    create() {
        // Start music immediately — AudioContext resumes on first user gesture
        music.start();

        const W = 1080, H = 960;
        const g = this.add.graphics();

        // Sky gradient
        g.fillGradientStyle(0x06061a, 0x06061a, 0x0d1a38, 0x0d1a38, 1);
        g.fillRect(0, 0, W, H);

        // Moon
        g.fillStyle(0xf8f0cc);
        g.fillCircle(860, 100, 58);
        g.fillStyle(0xe0d8b8);
        g.fillCircle(846, 90, 10);
        g.fillCircle(874, 116, 7);
        g.fillStyle(0xf8f0cc, 0.06);
        g.fillCircle(860, 100, 100);
        g.fillStyle(0xf8f0cc, 0.03);
        g.fillCircle(860, 100, 140);

        // Stars
        g.fillStyle(0xffffff);
        [
            [55,45,2],[190,28,1.5],[330,62,2],[460,22,1],[575,52,2],
            [695,32,1.5],[800,18,1],[960,58,2],[1030,28,1.5],[105,138,1.5],
            [245,108,2],[395,148,1],[510,122,1.5],[665,92,2],[720,152,1],
            [35,208,1.5],[165,188,1],[475,202,2],[645,218,1.5],[915,188,1],
            [285,238,1.5],[775,228,1],[140,92,1],[1005,122,1.5],[1045,198,2],
        ].forEach(([x, y, r]) => g.fillCircle(x, y, r));

        // Far mountains
        g.fillStyle(0x12203a);
        g.fillTriangle(0,620, 160,390, 360,620);
        g.fillTriangle(280,620, 500,360, 720,620);
        g.fillTriangle(620,620, 860,380, 1080,620);
        g.fillRect(0, 620, W, H - 620);

        // Mid mountains
        g.fillStyle(0x0e1828);
        g.fillTriangle(0,740, 220,560, 460,740);
        g.fillTriangle(380,740, 640,530, 880,740);
        g.fillTriangle(760,740, 1000,580, 1080,740);
        g.fillRect(0, 740, W, H - 740);

        // Ground
        g.fillStyle(0x0a1020);
        g.fillRect(0, 820, W, H - 820);

        // ── Title ────────────────────────────────────────────────────────
        this.add.text(W / 2, 200, 'ONSLAUGHT', {
            fontSize: '110px',
            fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
            fontStyle: 'bold',
            color: '#ffd700',
            stroke: '#000000',
            strokeThickness: 12,
            shadow: { offsetX: 4, offsetY: 4, color: '#000', blur: 8, fill: true },
        }).setOrigin(0.5);

        this.add.text(W / 2, 308, 'Vertical Tower Defense', {
            fontSize: '34px',
            fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
            color: '#aaccff',
            stroke: '#000000',
            strokeThickness: 5,
        }).setOrigin(0.5);

        // ── How to play ──────────────────────────────────────────────────
        const instructions = [
            '🪙  Earn gold by killing monsters',
            '♥  Lose a heart when a monster escapes',
            '🖱 Left-click a slot to place your Hero',
            '🖱 Right-click an empty slot to build a Tower  (50g)',
            '🖱 Right-click a tower to upgrade it  (75–200g)',
            '⎵  Spacebar pauses the game',
        ];

        this.add.text(W / 2, 420, 'HOW TO PLAY', {
            fontSize: '28px',
            fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
            fontStyle: 'bold',
            color: '#ffdd44',
            stroke: '#000000',
            strokeThickness: 4,
        }).setOrigin(0.5);

        instructions.forEach((line, i) => {
            this.add.text(W / 2, 468 + i * 46, line, {
                fontSize: '24px',
                fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
                color: '#dddddd',
                stroke: '#000000',
                strokeThickness: 3,
            }).setOrigin(0.5);
        });

        // ── Press SPACE prompt (blinking) ────────────────────────────────
        const prompt = this.add.text(W / 2, 820, 'Press  SPACE  to begin', {
            fontSize: '40px',
            fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6,
        }).setOrigin(0.5);

        this.tweens.add({
            targets: prompt,
            alpha: 0.1,
            duration: 700,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // ── Wave info footer ─────────────────────────────────────────────
        this.add.text(W / 2, 900, 'Survive as many waves as you can — each wave grows stronger', {
            fontSize: '20px',
            fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
            color: '#888888',
            stroke: '#000000',
            strokeThickness: 3,
        }).setOrigin(0.5);

        // Start on SPACE
        this.input.keyboard.once('keydown-SPACE', () => {
            this.cameras.main.fadeOut(400, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('GameScene');
            });
        });
    }
}
