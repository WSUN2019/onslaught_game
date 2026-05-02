import music from '../audio/MusicManager.js';
import sfx from '../audio/SFXManager.js';
import KnightGate from '../entities/KnightGate.js';
import MageTower from '../entities/MageTower.js';
import MapManager from '../map/MapManager.js';
import Enemy from '../entities/Enemy.js';
import Ogre from '../entities/Ogre.js';
import Tower from '../entities/Tower.js';
import Hero from '../entities/Hero.js';
import UIManager from '../ui/UIManager.js';

// GameScene: the main gameplay scene.
// Responsibilities:
//   • Procedurally generate ALL textures at preload (no image files)
//   • Draw the background (sky, mountains, ledges, cobblestones, vegetation, torches)
//   • Manage 9 build slots across 3 floors (hero placement + tower building/upgrading)
//   • Run the wave system (spawn queue, scaling, inter-wave timer)
//   • Handle input (left-click = hero, right-click = build/upgrade, F = speed, SPACE = pause)
//   • Wire up Phaser physics overlap for projectile–enemy collision
export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    // Procedurally generates every texture used in the game using Phaser Graphics.
    // Textures are baked into named keys (e.g. 'goblin_0', 'tower_tex') so they
    // can be referenced by sprites and images throughout the scene.
    // Drawing order within each sprite: back limbs → torso → front limbs → head.
    preload() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });

        // ── GOBLIN animated walk (48×60, 4 frames) ─────────────────────
        {
            const FW = 48, FH = 60, cx = 24;
            // Parallelogram limb: top-centre (tx,ty) → bottom-centre (bx,by), half-width h
            const lmb = (tx, ty, bx, by, w, c) => {
                const h = w >> 1;
                g.fillStyle(c);
                g.fillTriangle(tx-h, ty, tx+h, ty, bx+h, by);
                g.fillTriangle(tx-h, ty, bx-h, by, bx+h, by);
            };
            // [leftLegOff, rightLegOff, leftArmOff, rightArmOff, bodyBob]
            [[ 0, 0, 0, 0, 0],[-8, 8, 6,-6,-2],[ 0, 0, 0, 0,-1],[ 8,-8,-6, 6,-2]]
            .forEach(([ll, rl, la, ra, b], fi) => {
                g.clear();
                // Right (back) leg
                lmb(cx+6,43+b, cx+6+rl,57+b, 9, 0x2a6a2a);
                g.fillStyle(0x241008); g.fillRect(cx+6+rl-5,55+b,12,6);
                g.fillStyle(0x3a2018); g.fillRect(cx+6+rl-4,55+b,5,3);
                // Right (back) arm
                lmb(cx+10,27+b, cx+14+ra,40+b, 7, 0x3a8a3a);
                g.fillStyle(0x4a9a4a); g.fillCircle(cx+14+ra,41+b,4);
                // Torso shadow
                g.fillStyle(0x4a2e10); g.fillRect(cx-11,24+b,22,21);
                g.fillStyle(0x8a5e3c); g.fillRect(cx-10,24+b,20,20);
                g.fillStyle(0xaa7848); g.fillRect(cx-9,25+b,9,16);   // left highlight
                g.fillStyle(0x6a4020); g.fillRect(cx+2,25+b,7,16);   // right shadow
                g.fillStyle(0x7a4c28); g.fillRect(cx-10,32+b,20,2);  // rib line
                g.fillStyle(0x2c1808); g.fillRect(cx-11,38+b,22,6);  // belt
                g.fillStyle(0xeecc44); g.fillRect(cx-3,40+b,6,3);    // buckle
                g.fillStyle(0x6a4428); g.fillCircle(cx-10,25+b,6);   // pauldron shadow
                g.fillStyle(0x9a7040); g.fillCircle(cx-11,24+b,5);   // pauldron highlight
                g.fillStyle(0x6a4428); g.fillCircle(cx+10,25+b,6);
                g.fillStyle(0x9a7040); g.fillCircle(cx+9,24+b,5);
                // Left (front) arm
                lmb(cx-10,27+b, cx-14+la,40+b, 7, 0x4a9a4a);
                g.fillStyle(0x5aaa5a); g.fillCircle(cx-14+la,41+b,4);
                g.fillStyle(0x7acc7a); g.fillCircle(cx-15+la,40+b,2);
                // Left (front) leg
                lmb(cx-6,43+b, cx-6+ll,57+b, 9, 0x3a8a3a);
                g.fillStyle(0x3a2010); g.fillRect(cx-6+ll-5,55+b,12,6);
                g.fillStyle(0x5a3828); g.fillRect(cx-6+ll-4,55+b,5,3);
                // Head
                const hy = 12+b;
                g.fillStyle(0x2a5a2a); // ear shadow
                g.fillTriangle(cx-13,hy-2, cx-17,hy+6, cx-9,hy+6);
                g.fillTriangle(cx+13,hy-2, cx+9,hy+6, cx+17,hy+6);
                g.fillStyle(0x4a9a4a); // ear
                g.fillTriangle(cx-12,hy-1, cx-15,hy+5, cx-9,hy+5);
                g.fillTriangle(cx+12,hy-1, cx+9,hy+5, cx+15,hy+5);
                g.fillStyle(0x1a4a1a); g.fillCircle(cx,hy,14);       // head shadow ring
                g.fillStyle(0x4db34d); g.fillCircle(cx,hy,13);       // head base
                g.fillStyle(0x70cc70); g.fillCircle(cx-4,hy-4,7);    // highlight
                g.fillStyle(0x88dd88); g.fillCircle(cx-5,hy-5,4);
                g.fillStyle(0x2a7a2a, 0.45); g.fillCircle(cx+4,hy+2,8); // shadow
                g.fillStyle(0x6a3808); // horn dark
                g.fillTriangle(cx-5,2+b, cx-8,0+b, cx-1,8+b);
                g.fillTriangle(cx+5,2+b, cx+1,8+b, cx+8,0+b);
                g.fillStyle(0x8a5820); // horn highlight
                g.fillTriangle(cx-4,3+b, cx-7,1+b, cx-2,7+b);
                g.fillTriangle(cx+4,3+b, cx+2,7+b, cx+7,1+b);
                g.fillStyle(0x1a5a1a); g.fillRect(cx-9,hy-5,18,5);   // brow
                g.fillStyle(0x2a6a2a); g.fillRect(cx-8,hy-5,7,3);
                g.fillStyle(0x111111); g.fillCircle(cx-4,hy-1,5); g.fillCircle(cx+4,hy-1,5);
                g.fillStyle(0xffcc00); g.fillCircle(cx-4,hy-1,4); g.fillCircle(cx+4,hy-1,4);
                g.fillStyle(0xcc2200); g.fillCircle(cx-4,hy-1,3); g.fillCircle(cx+4,hy-1,3);
                g.fillStyle(0x111111); g.fillCircle(cx-3,hy-1,1.5); g.fillCircle(cx+5,hy-1,1.5);
                g.fillStyle(0xffffff); g.fillCircle(cx-5,hy-2,1.2); g.fillCircle(cx+3,hy-2,1.2);
                g.fillStyle(0x2d7a2d); g.fillCircle(cx,hy+4,3);      // nose
                g.fillStyle(0x1d5a1d); g.fillCircle(cx-1,hy+4,1.5); g.fillCircle(cx+1,hy+4,1.5);
                g.fillStyle(0x1a1e08); g.fillRect(cx-7,hy+6,14,6);   // mouth
                g.fillStyle(0xeeeebb); // teeth
                g.fillRect(cx-6,hy+6,3,5); g.fillRect(cx-2,hy+6,3,5); g.fillRect(cx+2,hy+6,3,5);
                g.fillStyle(0xffffcc); g.fillRect(cx-8,hy+6,2,9); g.fillRect(cx+6,hy+6,2,9); // tusks
                g.generateTexture(`goblin_${fi}`, FW, FH);
            });
        }

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

        // ── CASTLE TOWER (90×100) ─────────────────────────────────────────
        g.clear();
        {
            const D=0x252336, B=0x3a3850, M=0x4c4968, L=0x5e5b78, H=0x706e88, V=0x06040c, IR=0x222038;

            // Foundation
            g.fillStyle(D); g.fillRect(0,88,90,12);
            g.fillStyle(B); g.fillRect(0,88,90,4);

            // Left turret
            g.fillStyle(B); g.fillRect(0,14,18,76);
            for(let r=0;r<7;r++){ g.fillStyle(D); g.fillRect(0,16+r*11,18,2); g.fillStyle(L); g.fillRect(0,18+r*11,18,2); }
            g.fillStyle(M); g.fillRect(0,2,8,14); g.fillRect(10,2,8,14);
            g.fillStyle(H); g.fillRect(0,2,8,2);  g.fillRect(10,2,8,2);
            g.fillStyle(V); g.fillRect(8,2,2,14);

            // Right turret
            g.fillStyle(B); g.fillRect(72,14,18,76);
            for(let r=0;r<7;r++){ g.fillStyle(D); g.fillRect(72,16+r*11,18,2); g.fillStyle(L); g.fillRect(72,18+r*11,18,2); }
            g.fillStyle(M); g.fillRect(72,2,8,14); g.fillRect(82,2,8,14);
            g.fillStyle(H); g.fillRect(72,2,8,2);  g.fillRect(82,2,8,2);
            g.fillStyle(V); g.fillRect(80,2,2,14);

            // Main body with stone block courses
            g.fillStyle(M); g.fillRect(16,4,58,86);
            for(let r=0;r<8;r++){
                const fy=6+r*11, off=(r%2)*13;
                g.fillStyle(D); g.fillRect(16,fy+9,58,2);
                for(let fx=16-off;fx<74;fx+=26){
                    const bx=Math.max(fx,17), bw=Math.min(fx+24,73)-bx;
                    if(bw<2) continue;
                    g.fillStyle(L); g.fillRect(bx,fy,bw,2);
                    if(bx>17){ g.fillStyle(D); g.fillRect(bx,fy,1,9); }
                }
            }

            // Main tower crenellations
            [16,27,38,49,62].forEach(bx=>{ g.fillStyle(M); g.fillRect(bx,0,9,6); g.fillStyle(H); g.fillRect(bx,0,9,2); });
            g.fillStyle(V); [25,36,47,59].forEach(gx=>g.fillRect(gx,0,2,6));

            // Arrow slit
            g.fillStyle(V); g.fillRect(42,14,6,22); g.fillRect(40,20,10,8);
            g.fillStyle(D); g.fillRect(39,12,12,4);

            // Side windows
            g.fillStyle(V); g.fillRect(18,44,8,12); g.fillRect(64,44,8,12);
            g.fillStyle(D); g.fillRect(17,42,10,4); g.fillRect(63,42,10,4);

            // Gate lintel (drawn before void — arch circle carves through it leaving stone jambs on sides)
            g.fillStyle(D); g.fillRect(26,52,38,10);
            g.fillStyle(L); g.fillRect(26,52,38,2);

            // Gate void: rounded arch + lower rect
            g.fillStyle(V);
            g.fillCircle(45,62,16);
            g.fillRect(29,62,32,26);

            // Keystone at crown of arch (drawn on top of void)
            g.fillStyle(H); g.fillRect(43,46,4,8);
            g.fillStyle(D); g.fillRect(42,46,6,1);

            // Portcullis bars
            g.fillStyle(IR);
            [31,37,43,49,55].forEach(bx=>g.fillRect(bx,63,2,24));
            g.fillRect(29,69,32,2); g.fillRect(29,77,32,2);
        }
        g.generateTexture('tower_tex', 90, 100);
        g.clear();

        // ── KNIGHT GATE (90×100) — warm amber-stone castle ────────────────
        {
            const D=0x2a1e18, B=0x4a3428, M=0x5c4438, L=0x70584a, H=0x887060, V=0x060208, IR=0x201818;
            g.fillStyle(D); g.fillRect(0,88,90,12); g.fillStyle(B); g.fillRect(0,88,90,4);
            g.fillStyle(B); g.fillRect(0,14,18,76);
            for(let r=0;r<7;r++){ g.fillStyle(D); g.fillRect(0,16+r*11,18,2); g.fillStyle(L); g.fillRect(0,18+r*11,18,2); }
            g.fillStyle(M); g.fillRect(0,2,8,14); g.fillRect(10,2,8,14);
            g.fillStyle(H); g.fillRect(0,2,8,2);  g.fillRect(10,2,8,2);
            g.fillStyle(V); g.fillRect(8,2,2,14);
            g.fillStyle(B); g.fillRect(72,14,18,76);
            for(let r=0;r<7;r++){ g.fillStyle(D); g.fillRect(72,16+r*11,18,2); g.fillStyle(L); g.fillRect(72,18+r*11,18,2); }
            g.fillStyle(M); g.fillRect(72,2,8,14); g.fillRect(82,2,8,14);
            g.fillStyle(H); g.fillRect(72,2,8,2);  g.fillRect(82,2,8,2);
            g.fillStyle(V); g.fillRect(80,2,2,14);
            g.fillStyle(M); g.fillRect(16,4,58,86);
            for(let r=0;r<8;r++){
                const fy=6+r*11, off=(r%2)*13;
                g.fillStyle(D); g.fillRect(16,fy+9,58,2);
                for(let fx=16-off;fx<74;fx+=26){
                    const bx=Math.max(fx,17), bw=Math.min(fx+24,73)-bx;
                    if(bw<2) continue;
                    g.fillStyle(L); g.fillRect(bx,fy,bw,2);
                    if(bx>17){ g.fillStyle(D); g.fillRect(bx,fy,1,9); }
                }
            }
            [16,27,38,49,62].forEach(bx=>{ g.fillStyle(M); g.fillRect(bx,0,9,6); g.fillStyle(H); g.fillRect(bx,0,9,2); });
            g.fillStyle(V); [25,36,47,59].forEach(gx=>g.fillRect(gx,0,2,6));
            // Knight cross emblem on arrow slit
            g.fillStyle(V); g.fillRect(42,14,6,22); g.fillRect(40,20,10,8);
            g.fillStyle(0xcc8820); g.fillRect(41,14,4,22); g.fillRect(38,20,10,4); // gold cross
            g.fillStyle(V); g.fillRect(18,44,8,12); g.fillRect(64,44,8,12);
            g.fillStyle(D); g.fillRect(17,42,10,4); g.fillRect(63,42,10,4);
            g.fillStyle(D); g.fillRect(26,52,38,10); g.fillStyle(L); g.fillRect(26,52,38,2);
            g.fillStyle(V); g.fillCircle(45,62,16); g.fillRect(29,62,32,26);
            g.fillStyle(H); g.fillRect(43,46,4,8); g.fillStyle(D); g.fillRect(42,46,6,1);
            // Knight silhouette: helmet + sword in gate
            g.fillStyle(0x485068); g.fillRect(39,52,12,10); g.fillRect(41,49,8,5); // helm
            g.fillStyle(0xcccccc); g.fillRect(51,44,3,22); // sword blade
            g.fillStyle(0xcc9920); g.fillRect(47,60,10,3); // crossguard
            g.fillStyle(IR);  g.fillRect(29,69,32,2); g.fillRect(29,77,32,2); // portcullis bars
        }
        g.generateTexture('knight_tex', 90, 100);
        g.clear();

        // ── ARCHER SHIELD ICON (36×44) ─────────────────────────────────────
        g.clear();
        g.fillStyle(0x1a2436); g.fillRect(0,0,36,28); g.fillTriangle(0,28,18,44,36,28);
        g.fillStyle(0x263450); g.fillRect(2,2,32,24); g.fillTriangle(2,26,18,42,34,26);
        g.lineStyle(2,0x4a5e7a);
        g.beginPath(); g.moveTo(0,0); g.lineTo(36,0); g.lineTo(36,28); g.lineTo(18,44); g.lineTo(0,28); g.closePath(); g.strokePath();
        g.lineStyle(1,0x3a4e6a); g.lineBetween(18,0,18,28);
        g.lineStyle(3,0x9a7830); // bow limb
        g.lineBetween(11,7, 10,11); g.lineBetween(10,11,9,16); g.lineBetween(9,16,9,20); g.lineBetween(9,20,10,25); g.lineBetween(10,25,11,29);
        g.lineStyle(1,0xddddbb); g.lineBetween(11,7,11,29); // bowstring
        g.lineStyle(2,0x9a7830); g.lineBetween(11,18,30,18); // arrow shaft
        g.fillStyle(0xccccaa); g.fillTriangle(30,15,30,21,36,18); // arrowhead
        g.lineStyle(2,0x886644); g.lineBetween(11,18,11,14); g.lineBetween(11,18,8,18); // nock
        g.generateTexture('archer_icon_tex', 36, 44);
        g.clear();

        // ── KNIGHT SHIELD ICON (36×44) ─────────────────────────────────────
        g.fillStyle(0x241414); g.fillRect(0,0,36,28); g.fillTriangle(0,28,18,44,36,28);
        g.fillStyle(0x342020); g.fillRect(2,2,32,24); g.fillTriangle(2,26,18,42,34,26);
        g.lineStyle(2,0x7a5858);
        g.beginPath(); g.moveTo(0,0); g.lineTo(36,0); g.lineTo(36,28); g.lineTo(18,44); g.lineTo(0,28); g.closePath(); g.strokePath();
        g.lineStyle(1,0x5a3e3e); g.lineBetween(18,0,18,28);
        g.fillStyle(0xcccccc); g.fillRect(16,4,4,22); g.fillStyle(0xaaaaaa); g.fillRect(17,4,2,22); // blade
        g.fillStyle(0xcc9920); g.fillRect(10,20,16,4); g.fillStyle(0xeebb30); g.fillRect(10,20,16,2); // crossguard
        g.fillStyle(0x8a5520); g.fillRect(16,24,4,8); // grip
        g.fillStyle(0xddaa22); g.fillCircle(18,35,5); g.fillStyle(0xeebb44); g.fillCircle(17,34,3); // pommel
        g.generateTexture('knight_icon_tex', 36, 44);
        g.clear();

        // ── MAGE TOWER (90×100) — arcane purple spire ──────────────────────
        {
            const D=0x1a0a30, B=0x2e1252, M=0x3e2268, L=0x5c3a88, H=0x7852a8, V=0x04020c;

            // Foundation
            g.fillStyle(D); g.fillRect(0,88,90,12);
            g.fillStyle(B); g.fillRect(0,88,90,4);

            // Left turret body
            g.fillStyle(B); g.fillRect(0,14,18,76);
            for(let r=0;r<7;r++){ g.fillStyle(D); g.fillRect(0,16+r*11,18,2); g.fillStyle(L); g.fillRect(0,18+r*11,18,2); }
            // Left turret conical cap
            g.fillStyle(M); g.fillRect(0,4,18,12);
            g.fillStyle(H); g.fillRect(0,4,18,2);
            g.fillStyle(L); g.fillTriangle(0,4,9,0,18,4);

            // Right turret body
            g.fillStyle(B); g.fillRect(72,14,18,76);
            for(let r=0;r<7;r++){ g.fillStyle(D); g.fillRect(72,16+r*11,18,2); g.fillStyle(L); g.fillRect(72,18+r*11,18,2); }
            // Right turret conical cap
            g.fillStyle(M); g.fillRect(72,4,18,12);
            g.fillStyle(H); g.fillRect(72,4,18,2);
            g.fillStyle(L); g.fillTriangle(72,4,81,0,90,4);

            // Main body with stone courses
            g.fillStyle(M); g.fillRect(16,4,58,86);
            for(let r=0;r<8;r++){
                const fy=6+r*11, off=(r%2)*13;
                g.fillStyle(D); g.fillRect(16,fy+9,58,2);
                for(let fx=16-off;fx<74;fx+=26){
                    const bx=Math.max(fx,17), bw=Math.min(fx+24,73)-bx;
                    if(bw<2) continue;
                    g.fillStyle(L); g.fillRect(bx,fy,bw,2);
                    if(bx>17){ g.fillStyle(D); g.fillRect(bx,fy,1,9); }
                }
            }

            // Central spire (replacing flat battlements)
            g.fillStyle(B); g.fillRect(30,4,30,6);
            g.fillStyle(M); g.fillRect(30,4,30,3);
            g.fillStyle(L); g.fillTriangle(33,4,57,4,45,0);
            g.fillStyle(H); g.fillTriangle(33,4,39,2,45,0);
            g.fillStyle(0xdd88ff); g.fillCircle(45,2,2);

            // Narrow arcane rune window
            g.fillStyle(V); g.fillRect(43,14,4,22); g.fillRect(41,20,8,8);
            g.fillStyle(0x8833cc,0.6); g.fillRect(44,16,2,18);

            // Side circular portals
            g.fillStyle(D); g.fillRect(17,42,10,4); g.fillRect(63,42,10,4);
            g.fillStyle(V); g.fillCircle(22,50,7); g.fillCircle(68,50,7);
            g.fillStyle(0xaa44ff,0.5); g.fillCircle(22,50,5); g.fillCircle(68,50,5);
            g.fillStyle(0xdd88ff,0.4); g.fillCircle(22,50,3); g.fillCircle(68,50,3);

            // Gate lintel (same position as archer)
            g.fillStyle(D); g.fillRect(26,52,38,10);
            g.fillStyle(L); g.fillRect(26,52,38,2);

            // Central arcane orb (replacing gate arch + portcullis)
            g.fillStyle(V); g.fillCircle(45,66,16);
            g.fillStyle(0x220044); g.fillCircle(45,66,14);
            g.fillStyle(0x6600cc,0.8); g.fillCircle(45,66,11);
            g.fillStyle(0xaa44ff,0.9); g.fillCircle(45,66,8);
            g.fillStyle(0xdd88ff,0.95); g.fillCircle(45,66,5);
            g.fillStyle(0xffffff,0.7); g.fillCircle(43,64,2.5);

            // Keystone above orb
            g.fillStyle(H); g.fillRect(43,46,4,8);
            g.fillStyle(D); g.fillRect(42,46,6,1);
        }
        g.generateTexture('mage_tex', 90, 100);
        g.clear();

        // ── MAGE SHIELD ICON (36×44) ──────────────────────────────────────
        g.fillStyle(0x1a0a30); g.fillRect(0,0,36,28); g.fillTriangle(0,28,18,44,36,28);
        g.fillStyle(0x2e1252); g.fillRect(2,2,32,24); g.fillTriangle(2,26,18,42,34,26);
        g.lineStyle(2,0x5c3a88);
        g.beginPath(); g.moveTo(0,0); g.lineTo(36,0); g.lineTo(36,28); g.lineTo(18,44); g.lineTo(0,28); g.closePath(); g.strokePath();
        g.lineStyle(1,0x3e2268); g.lineBetween(18,0,18,28);
        // Central orb
        g.fillStyle(0x220044); g.fillCircle(18,14,9);
        g.fillStyle(0x6600cc,0.8); g.fillCircle(18,14,7);
        g.fillStyle(0xaa44ff,0.9); g.fillCircle(18,14,5);
        g.fillStyle(0xdd88ff,0.95); g.fillCircle(18,14,3);
        g.fillStyle(0xffffff,0.7); g.fillCircle(16,12,1.5);
        // Sparkles
        g.fillStyle(0xdd88ff,0.8);
        g.fillCircle(8,6,1.5); g.fillCircle(28,6,1.5);
        g.fillCircle(7,21,1.5); g.fillCircle(29,21,1.5);
        g.fillCircle(18,26,1.5);
        g.generateTexture('mage_icon_tex', 36, 44);
        g.clear();

        // ── OGRE animated walk (70×80, 4 frames) ────────────────────────
        {
            const FW = 70, FH = 80, cx = 35;
            const lmb = (tx, ty, bx, by, w, c) => {
                const h = w >> 1;
                g.fillStyle(c);
                g.fillTriangle(tx-h, ty, tx+h, ty, bx+h, by);
                g.fillTriangle(tx-h, ty, bx-h, by, bx+h, by);
            };
            // [leftLegOff, rightLegOff, leftArmOff, clubSwing (ra), bodyBob]
            [[0,0,0,0,0], [-12,12,8,-14,-3], [0,0,0,0,-2], [12,-12,-8,14,-3]]
            .forEach(([ll, rl, la, ra, b], fi) => {
                g.clear();
                // Back leg (right)
                lmb(cx+8, 55+b, cx+8+rl, 73+b, 14, 0x3a5020);
                g.fillStyle(0x1a0804); g.fillRect(cx+8+rl-8, 71+b, 16, 7);
                g.fillStyle(0x3a1808); g.fillRect(cx+8+rl-7, 71+b, 6, 4);
                // Back arm (right) + club
                lmb(cx+13, 37+b, cx+17+ra, 53+b, 11, 0x4a6828);
                g.fillStyle(0x5a3010);
                g.fillRect(cx+15+ra-3, 44+b, 6, 22);
                g.fillStyle(0x2a1004); g.fillRect(cx+10+ra, 34+b, 16, 14);
                g.fillStyle(0x3c1e08); g.fillRect(cx+11+ra, 35+b, 12, 10);
                g.fillStyle(0x5a3010); g.fillRect(cx+11+ra, 35+b, 4, 4);
                // Torso
                g.fillStyle(0x2a4010); g.fillRect(cx-15, 33+b, 30, 24);
                g.fillStyle(0x5a7030); g.fillRect(cx-14, 34+b, 28, 22);
                g.fillStyle(0x7a9050); g.fillRect(cx-13, 35+b, 12, 18);
                g.fillStyle(0x3a5020); g.fillRect(cx+2, 35+b, 10, 18);
                g.fillStyle(0x4a6028); g.fillRect(cx-14, 42+b, 28, 2);
                g.fillStyle(0x4a6028); g.fillRect(cx-14, 47+b, 28, 2);
                g.fillStyle(0x2a1808); g.fillRect(cx-15, 53+b, 30, 6);
                g.fillStyle(0xcc9920); g.fillRect(cx-4, 54+b, 8, 4);
                g.fillStyle(0xeebb30); g.fillRect(cx-3, 55+b, 6, 2);
                // Shoulder pads
                g.fillStyle(0x3a5020); g.fillCircle(cx-14, 35+b, 8);
                g.fillStyle(0x5a7030); g.fillCircle(cx-15, 34+b, 7);
                g.fillStyle(0x3a5020); g.fillCircle(cx+14, 35+b, 8);
                g.fillStyle(0x5a7030); g.fillCircle(cx+13, 34+b, 7);
                // Front arm (left)
                lmb(cx-13, 37+b, cx-17+la, 53+b, 11, 0x6a8838);
                g.fillStyle(0x7a9848); g.fillCircle(cx-18+la, 54+b, 6);
                g.fillStyle(0x9ac060); g.fillCircle(cx-19+la, 53+b, 3);
                // Front leg (left)
                lmb(cx-8, 55+b, cx-8+ll, 73+b, 14, 0x5a7030);
                g.fillStyle(0x1a0804); g.fillRect(cx-8+ll-8, 71+b, 16, 7);
                g.fillStyle(0x3a2010); g.fillRect(cx-8+ll-7, 71+b, 6, 4);
                // Head
                const hy = 18+b;
                g.fillStyle(0x2a4010); g.fillRect(cx-10, hy+10, 20, 8);
                g.fillStyle(0x3a5020); g.fillRect(cx-8, hy+10, 16, 6);
                g.fillStyle(0x1a3008); g.fillCircle(cx, hy, 17);
                g.fillStyle(0x5a7030); g.fillCircle(cx, hy, 16);
                g.fillStyle(0x7a9050); g.fillCircle(cx-5, hy-4, 9);
                g.fillStyle(0x8aaa60); g.fillCircle(cx-6, hy-5, 5);
                g.fillStyle(0x3a5020, 0.5); g.fillCircle(cx+5, hy+3, 9);
                // Ear nubs
                g.fillStyle(0x2a4010); g.fillTriangle(cx-15, hy-4, cx-20, hy-12, cx-12, hy-12);
                g.fillStyle(0x4a6028); g.fillTriangle(cx-14, hy-4, cx-18, hy-10, cx-12, hy-10);
                g.fillStyle(0x2a4010); g.fillTriangle(cx+15, hy-4, cx+12, hy-12, cx+20, hy-12);
                g.fillStyle(0x4a6028); g.fillTriangle(cx+14, hy-4, cx+12, hy-10, cx+18, hy-10);
                // Brow
                g.fillStyle(0x1a3008); g.fillRect(cx-13, hy-10, 26, 7);
                g.fillStyle(0x2a4810); g.fillRect(cx-12, hy-9, 8, 4);
                // Eyes — layered glowing red
                g.fillStyle(0x111111); g.fillCircle(cx-5, hy-4, 6); g.fillCircle(cx+5, hy-4, 6);
                g.fillStyle(0xff4400); g.fillCircle(cx-5, hy-4, 5); g.fillCircle(cx+5, hy-4, 5);
                g.fillStyle(0xff8800); g.fillCircle(cx-5, hy-4, 3); g.fillCircle(cx+5, hy-4, 3);
                g.fillStyle(0xffcc00); g.fillCircle(cx-5, hy-4, 1.5); g.fillCircle(cx+5, hy-4, 1.5);
                g.fillStyle(0x111111); g.fillCircle(cx-4, hy-5, 1.5); g.fillCircle(cx+6, hy-5, 1.5);
                // Nose
                g.fillStyle(0x2a4010); g.fillRect(cx-5, hy+1, 10, 7);
                g.fillStyle(0x3a5820); g.fillRect(cx-4, hy+2, 4, 4);
                g.fillStyle(0x111111); g.fillCircle(cx-3, hy+5, 2); g.fillCircle(cx+3, hy+5, 2);
                // Mouth
                g.fillStyle(0x0a0e04); g.fillRect(cx-11, hy+7, 22, 8);
                // Tusks
                g.fillStyle(0xeeeebb);
                g.fillTriangle(cx-9, hy+8, cx-13, hy+20, cx-5, hy+20);
                g.fillTriangle(cx+9, hy+8, cx+5, hy+20, cx+13, hy+20);
                g.fillStyle(0xccccaa);
                g.fillTriangle(cx-8, hy+9, cx-11, hy+18, cx-7, hy+18);
                g.fillTriangle(cx+8, hy+9, cx+7, hy+18, cx+11, hy+18);
                // Teeth
                g.fillStyle(0xddddb8);
                g.fillRect(cx-10, hy+8, 4, 5); g.fillRect(cx-4, hy+8, 4, 5); g.fillRect(cx+2, hy+8, 4, 5);
                g.generateTexture(`ogre_${fi}`, FW, FH);
            });
        }

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

    // Sets up all game state, draws the background, wires input handlers,
    // registers physics overlap, binds UI buttons, and starts wave 1.
    create() {
        this.cameras.main.fadeIn(400, 0, 0, 0);

        this.anims.create({ key: 'goblin-walk', frames: [0,1,2,3].map(i=>({key:`goblin_${i}`})), frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'ogre-walk',   frames: [0,1,2,3].map(i=>({key:`ogre_${i}`})),   frameRate: 5, repeat: -1 });

        this.gold = 25;
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
                    this.ui.flashMessage('Right-click an empty slot to build a tower (5g)');
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
            sfx.impact();
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

        // Mute button
        const muteBtn = document.getElementById('mute-btn');
        let muted = false;
        const toggleMute = () => {
            muted = !muted;
            if (muted) { music.mute();   muteBtn.textContent = '🔇'; muteBtn.classList.add('muted'); }
            else        { music.unmute(); muteBtn.textContent = '🔊'; muteBtn.classList.remove('muted'); }
        };
        muteBtn.addEventListener('click', toggleMute);

        // Tower type selection
        this.selectedTowerType = 'archer';
        const btnArcher = document.getElementById('btn-archer');
        const btnKnight = document.getElementById('btn-knight');
        const btnMage   = document.getElementById('btn-mage');
        const selectArcher = () => { this.selectedTowerType = 'archer'; btnArcher.classList.add('active-tower'); btnKnight.classList.remove('active-tower'); btnMage.classList.remove('active-tower'); };
        const selectKnight = () => { this.selectedTowerType = 'knight'; btnKnight.classList.add('active-tower'); btnArcher.classList.remove('active-tower'); btnMage.classList.remove('active-tower'); };
        const selectMage   = () => { this.selectedTowerType = 'mage';   btnMage.classList.add('active-tower');   btnArcher.classList.remove('active-tower'); btnKnight.classList.remove('active-tower'); };
        btnArcher.addEventListener('click', selectArcher);
        btnKnight.addEventListener('click', selectKnight);
        btnMage.addEventListener('click', selectMage);

        // Clean up listeners when scene shuts down
        this.events.once('shutdown', () => {
            speedBtn.removeEventListener('click', toggleSpeed);
            muteBtn.removeEventListener('click', toggleMute);
            btnArcher.removeEventListener('click', selectArcher);
            btnKnight.removeEventListener('click', selectKnight);
            btnMage.removeEventListener('click', selectMage);
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

    // Places the selected tower type on a slot and deducts 5 gold.
    // Instantiates Tower, KnightGate, or MageTower based on this.selectedTowerType.
    _buildOnSlot(slot) {
        if (this.gold < 5) {
            this.ui.flashMessage('Not enough gold! (need 5g)');
            return;
        }
        slot.occupied = true;
        slot.gfx.setVisible(false);

        const tower = this.selectedTowerType === 'knight'
            ? new KnightGate(this, slot.x, slot.y)
            : this.selectedTowerType === 'mage'
            ? new MageTower(this, slot.x, slot.y)
            : new Tower(this, slot.x, slot.y);
        slot.tower = tower;
        this.towers.add(tower);
        this.gold -= 5;
        this.ui.updateGold(this.gold);
    }

    // Upgrades the tower on the given slot if the player has enough gold.
    // Cost is read from the tower's current level (defined in its LEVELS table).
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
        for (const [y, lx, lw] of MapManager.getFloorData()) {
            this._drawRockyLedge(mtn, y, lx, lw);
        }

        // ── Background mountain trees (in mtn layer — behind cobblestone) ──
        this._drawMountainTrees(mtn);

        // ── Cobblestone path + torches ───────────────────────────────────
        this._drawCobblePath();

        // ── Foreground vegetation (grass / vines / moss — on ledge surfaces)
        this._drawGreenery();

        // ── Edge vignette ────────────────────────────────────────────────
        const vig = this.add.graphics();
        vig.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0.42, 0, 0.42, 0);
        vig.fillRect(0, 0, 100, H);
        vig.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0, 0.42, 0, 0.42);
        vig.fillRect(W - 100, 0, 100, H);
        vig.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0.28, 0.28, 0, 0);
        vig.fillRect(0, 0, W, 80);
    }

    // ── Background mountain trees — drawn into the mtn graphics layer ────
    _drawMountainTrees(g) {
        // Seeded RNG for repeatable layout
        let seed = 0xf3a1b2c4;
        const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967295; };

        const pine = (x, y, s) => {
            // Trunk
            g.fillStyle(0x080604);
            g.fillRect(x - Math.round(2.5*s), y, Math.round(5*s), Math.round(14*s));
            // Bottom bough
            g.fillStyle(0x0e2208);
            g.fillTriangle(x - Math.round(15*s), y - Math.round(4*s),
                           x + Math.round(15*s), y - Math.round(4*s),
                           x,                    y - Math.round(28*s));
            g.fillStyle(0x163010, 0.45);
            g.fillTriangle(x - Math.round(15*s), y - Math.round(4*s),
                           x - Math.round(2*s),  y - Math.round(17*s),
                           x,                    y - Math.round(28*s));
            // Mid bough
            g.fillStyle(0x122a0c);
            g.fillTriangle(x - Math.round(10*s), y - Math.round(17*s),
                           x + Math.round(10*s), y - Math.round(17*s),
                           x,                    y - Math.round(38*s));
            g.fillStyle(0x1a3c12, 0.42);
            g.fillTriangle(x - Math.round(10*s), y - Math.round(17*s),
                           x - Math.round(1*s),  y - Math.round(28*s),
                           x,                    y - Math.round(38*s));
            // Top bough
            g.fillStyle(0x163010);
            g.fillTriangle(x - Math.round(6*s),  y - Math.round(30*s),
                           x + Math.round(6*s),  y - Math.round(30*s),
                           x,                    y - Math.round(48*s));
            g.fillStyle(0x22401a, 0.38);
            g.fillTriangle(x - Math.round(6*s),  y - Math.round(30*s),
                           x,                    y - Math.round(40*s),
                           x,                    y - Math.round(48*s));
        };

        // ── Far mountain slope tree line (~y 502–518, tiny) ───────────────
        [
            [48, 514,0.34],[114,508,0.38],[180,516,0.33],[248,506,0.37],
            [316,514,0.35],[384,510,0.39],[452,504,0.36],[520,512,0.34],
            [588,506,0.38],[656,514,0.35],[724,508,0.37],[792,512,0.34],
            [860,504,0.38],[928,510,0.35],[994,514,0.36],[1050,507,0.34],
        ].forEach(([x,y,s]) => pine(x, y, s));

        // ── Mid mountain slope tree line (~y 642–658, medium) ─────────────
        [
            [20, 655,0.52],[78, 647,0.57],[140,653,0.54],[204,645,0.59],
            [268,651,0.55],[332,643,0.58],[396,649,0.53],[460,655,0.57],
            [524,643,0.55],[588,651,0.52],[652,645,0.58],[716,651,0.54],
            [780,643,0.57],[844,649,0.53],[908,655,0.55],[972,645,0.58],
            [1036,651,0.54],
        ].forEach(([x,y,s]) => pine(x, y, s));

        // ── Tall atmospheric silhouettes at far canvas edges ──────────────
        [
            [8,  856,0.78],[42, 852,0.86],[80, 857,0.74],[116,854,0.80],
            [958,854,0.82],[994,857,0.76],[1030,852,0.84],[1066,856,0.78],
        ].forEach(([x,y,s]) => pine(x, y, s));
    }

    // ── Foreground greenery — grass / vines / moss on ledge surfaces ──────
    _drawGreenery() {
        const g = this.add.graphics();
        let seed = 0xc8a4e012;
        const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967295; };

        // ── Pine tree ──────────────────────────────────────────────────────
        const pine = (x, y, s) => {
            g.fillStyle(0x0a0806);
            g.fillRect(x - Math.round(3*s), y, Math.round(6*s), Math.round(16*s));
            g.fillStyle(0x102608);
            g.fillTriangle(x - Math.round(16*s), y - Math.round(5*s),
                           x + Math.round(16*s), y - Math.round(5*s),
                           x,                    y - Math.round(30*s));
            g.fillStyle(0x183610, 0.52);
            g.fillTriangle(x - Math.round(16*s), y - Math.round(5*s),
                           x - Math.round(2*s),  y - Math.round(19*s),
                           x,                    y - Math.round(30*s));
            g.fillStyle(0x142e0e);
            g.fillTriangle(x - Math.round(11*s), y - Math.round(18*s),
                           x + Math.round(11*s), y - Math.round(18*s),
                           x,                    y - Math.round(42*s));
            g.fillStyle(0x1c3c14, 0.48);
            g.fillTriangle(x - Math.round(11*s), y - Math.round(18*s),
                           x - Math.round(1*s),  y - Math.round(31*s),
                           x,                    y - Math.round(42*s));
            g.fillStyle(0x182e10);
            g.fillTriangle(x - Math.round(7*s),  y - Math.round(32*s),
                           x + Math.round(7*s),  y - Math.round(32*s),
                           x,                    y - Math.round(52*s));
            g.fillStyle(0x224218, 0.42);
            g.fillTriangle(x - Math.round(7*s),  y - Math.round(32*s),
                           x,                    y - Math.round(42*s),
                           x,                    y - Math.round(52*s));
        };

        // ── Round shrub / bush ─────────────────────────────────────────────
        const bush = (x, y, s) => {
            // Shadow base
            g.fillStyle(0x080e04, 0.6);
            g.fillCircle(x, y - Math.round(6*s), Math.round(13*s));
            // Main clusters
            g.fillStyle(0x0e2008);
            g.fillCircle(x - Math.round(6*s), y - Math.round(8*s),  Math.round(9*s));
            g.fillCircle(x + Math.round(5*s), y - Math.round(7*s),  Math.round(8*s));
            g.fillCircle(x,                   y - Math.round(13*s),  Math.round(9*s));
            // Lighter fronts
            g.fillStyle(0x162e0e);
            g.fillCircle(x - Math.round(7*s), y - Math.round(10*s), Math.round(7*s));
            g.fillCircle(x + Math.round(4*s), y - Math.round(11*s), Math.round(6*s));
            // Moon-lit top highlight
            g.fillStyle(0x204018, 0.35);
            g.fillCircle(x - Math.round(8*s), y - Math.round(13*s), Math.round(5*s));
        };

        // ── Grass blade cluster ────────────────────────────────────────────
        const grass = (x, y) => {
            for (let i = 0; i < 5; i++) {
                const ox   = Math.round((rnd() - 0.5) * 18);
                const h    = Math.round(7 + rnd() * 9);
                const lean = Math.round((rnd() - 0.5) * 4);
                g.fillStyle(0x2a5e14, 0.62 + rnd() * 0.22);
                g.fillTriangle(x+ox-2, y, x+ox+2, y, x+ox+lean, y-h);
                g.fillStyle(0x3c7020, 0.28 + rnd() * 0.18);
                g.fillTriangle(x+ox+1, y, x+ox+5, y, x+ox+lean+2, y - Math.round(h*0.72));
            }
        };

        // ── Fern frond ─────────────────────────────────────────────────────
        const fern = (x, y, s) => {
            for (let side = -1; side <= 1; side += 2) {
                for (let i = 1; i <= 4; i++) {
                    const fx = x + side * Math.round(i * 5 * s);
                    const fy = y - Math.round(i * 5 * s);
                    const fw = Math.round((5 - i) * 2 * s);
                    g.fillStyle(0x224e10, 0.55 - i * 0.08);
                    g.fillTriangle(fx, fy, fx - fw, fy + Math.round(3*s), fx + fw, fy + Math.round(3*s));
                }
            }
            // Stem
            g.fillStyle(0x163a08, 0.6);
            g.fillRect(x - 1, y - Math.round(20*s), 2, Math.round(20*s));
        };

        // ── Hanging vine ──────────────────────────────────────────────────
        const vine = (x, topY, len) => {
            for (let i = 0; i < len; i += 4) {
                const lean = Math.round(Math.sin(i * 0.28 + x * 0.06) * 3);
                g.fillStyle(0x143408, 0.52);
                g.fillRect(x + lean, topY + i, 1, 4);
                if (Math.round(i * 0.25) % 2 === 0) {
                    g.fillStyle(0x1e5010, 0.48);
                    g.fillTriangle(x+lean,   topY+i, x+lean-6, topY+i+4, x+lean+1, topY+i+8);
                } else {
                    g.fillStyle(0x1a440c, 0.48);
                    g.fillTriangle(x+lean+1, topY+i, x+lean+6, topY+i+4, x+lean,   topY+i+8);
                }
            }
        };

        // ── Cliff moss ─────────────────────────────────────────────────────
        const mossStrip = (x, y, w, h) => {
            for (let dy = 0; dy < h; dy += 5) {
                for (let dx = 0; dx < w; dx += 6) {
                    if (rnd() < 0.44) {
                        g.fillStyle(0x123008, 0.20 + rnd() * 0.22);
                        g.fillCircle(x + dx + Math.round(rnd()*4), y + dy, 2 + (rnd() > 0.6 ? 1 : 0));
                    }
                }
            }
        };

        // ── Ivy/climbing vines on cliff walls ─────────────────────────────
        const ivyPatch = (x, y, w, h) => {
            for (let dy = 0; dy < h; dy += 8) {
                for (let dx = 0; dx < w; dx += 10) {
                    if (rnd() < 0.38) {
                        const lx = x + dx + Math.round((rnd()-0.5)*4);
                        const ly = y + dy + Math.round((rnd()-0.5)*3);
                        g.fillStyle(0x1a3c0c, 0.32 + rnd() * 0.20);
                        g.fillTriangle(lx-4, ly+3, lx+4, ly+3, lx, ly-4);
                        g.fillStyle(0x244e12, 0.22 + rnd()*0.14);
                        g.fillTriangle(lx-3, ly+2, lx+3, ly+2, lx, ly-3);
                    }
                }
            }
        };

        // ═════════════════════════════════════════════════════════════════
        // PLATFORM LEDGE VEGETATION
        // Floors: bottom [860,0,830], middle [610,250,830], top [360,0,830]
        // Slots: bottom x=210,430,650 | middle x=440,660,880 | top x=180,400,620
        // ═════════════════════════════════════════════════════════════════
        const floors = [[860, 0, 830], [610, 250, 830], [360, 0, 830]];
        const SLOT_CLEAR = 70;   // radius to avoid around tower slots

        const slotXPerFloor = [[210,430,650],[440,660,880],[180,400,620]];

        floors.forEach(([fy, lx, lw], fi) => {
            const sy   = fy - 13;  // cobblestone top surface y
            const rx   = lx + lw;  // right edge
            const cft  = fy + 13;  // cliff face top (below ledge)
            const slots = slotXPerFloor[fi];

            const nearSlot = (x) => slots.some(sx => Math.abs(x - sx) < SLOT_CLEAR);

            // ── Dense grass along floor edges ─────────────────────────────
            for (let x = lx + 6; x < lx + 140; x += 22) {
                if (!nearSlot(x)) grass(x, sy);
            }
            for (let x = rx - 132; x < rx - 4; x += 22) {
                if (!nearSlot(x)) grass(x, sy);
            }
            // Sparse middle
            for (let x = lx + 160; x < rx - 150; x += 40) {
                if (!nearSlot(x) && rnd() > 0.38) grass(x + Math.round((rnd()-0.5)*16), sy);
            }

            // ── Ferns mixed with grass at edges ───────────────────────────
            for (let x = lx + 18; x < lx + 120; x += 36) {
                if (!nearSlot(x)) fern(x, sy, 0.55 + rnd()*0.15);
            }
            for (let x = rx - 112; x < rx - 14; x += 36) {
                if (!nearSlot(x)) fern(x, sy, 0.52 + rnd()*0.15);
            }

            // ── Small shrubs at floor extremes ────────────────────────────
            [lx+14, lx+48, lx+82].forEach(bx => {
                if (!nearSlot(bx)) bush(bx, sy, 0.40 + rnd()*0.12);
            });
            [rx-14, rx-48, rx-82].forEach(bx => {
                if (!nearSlot(bx)) bush(bx, sy, 0.38 + rnd()*0.12);
            });

            // ── Compact pines at very far edges (≤50px from edge) ─────────
            [lx+10, lx+38].forEach(tx => {
                if (!nearSlot(tx)) pine(tx, sy, 0.46 + rnd()*0.10);
            });
            [rx-10, rx-36].forEach(tx => {
                if (!nearSlot(tx)) pine(tx, sy, 0.44 + rnd()*0.10);
            });

            // ── Hanging vines below cliff edge ────────────────────────────
            for (let x = lx + 8; x < rx; x += 26 + Math.round(rnd()*20)) {
                vine(x, cft, 26 + Math.round(rnd()*48));
            }

            // ── Moss dots on cliff face ───────────────────────────────────
            mossStrip(lx, cft, lw, 52);

            // ── Ivy clusters on cliff face ────────────────────────────────
            ivyPatch(lx + Math.round(lw * 0.1), cft + 4,  Math.round(lw * 0.22), 38);
            ivyPatch(lx + Math.round(lw * 0.42), cft + 6, Math.round(lw * 0.20), 34);
            ivyPatch(lx + Math.round(lw * 0.72), cft + 4, Math.round(lw * 0.20), 40);
        });
    }

    // Draws one horizontal ledge platform into the supplied graphics layer.
    // Each ledge has: a cobblestone top surface, a cliff face with mortar courses
    // and crack veins, moss tufts at the base, and a drop shadow beneath.
    // y: floor y-coord (centre of the top surface), lx: left edge, lw: width.
    _drawRockyLedge(g, y, lx, lw) {
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

    // Draws the cobblestone walkway on top of each ledge and across the two 45° ramps.
    // The ramp bricks are drawn scanline-by-scanline to produce a smooth diagonal look.
    // Wall torches are placed along each floor and both ramps; their flames are
    // animated via a repeating 60ms timer that redraws the flame triangles each tick.
    _drawCobblePath() {
        const topH = 26, faceH = 60;
        const cobble = this.add.graphics();

        // Helper: 3D cobblestone brick fill
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
                    cobble.fillStyle(0x7a6240); cobble.fillRect(bx, cy, bw, sH);
                    cobble.fillStyle(0x8c7250); cobble.fillRect(bx, cy, bw, 3); cobble.fillRect(bx, cy, 2, sH);
                    cobble.fillStyle(0x584430); cobble.fillRect(bx, cy + sH - 3, bw, 3); cobble.fillRect(bx + bw - 2, cy, 2, sH);
                    cobble.fillStyle(0x6a5438, 0.3); cobble.fillRect(bx + 3, cy + 3, bw - 6, sH - 6);
                }
                row++;
            }
        };

        // ── Ledge top cobblestone surfaces ───────────────────────────────
        MapManager.getFloorData().forEach(([y, lx, lw]) => {
            cobbleRect(lx, y - topH / 2, lw, topH, 34, 12);
            cobble.fillStyle(0x3a2a0e); cobble.fillRect(lx, y + topH / 2 - 4, lw, 5);
            cobble.fillStyle(0x6a5840, 0.35); cobble.fillRect(lx, y - topH / 2, lw, 2);
        });

        // ── 45° diagonal ramp helper ──────────────────────────────────────
        // getCX(y) returns the ramp centre-x at scanline y
        const RAMP_W = 60, HALF = 30;
        const diagRamp = (rTopY, rBotY, getCX) => {
            // Dark cliff fill on each side (triangle fills)
            const cxT = getCX(rTopY), cxB = getCX(rBotY);
            // Left triangle (from x=0 to ramp left edge)
            cobble.fillStyle(0x16141a);
            cobble.fillTriangle(0, rTopY, cxT - HALF, rTopY, cxB - HALF, rBotY);
            cobble.fillTriangle(0, rTopY, cxB - HALF, rBotY, 0, rBotY);
            // Right triangle (from ramp right edge to x=1080)
            cobble.fillTriangle(cxT + HALF, rTopY, 1080, rTopY, 1080, rBotY);
            cobble.fillTriangle(cxT + HALF, rTopY, 1080, rBotY, cxB + HALF, rBotY);
            // Subtle stone texture on walls
            cobble.fillStyle(0x20202e, 0.5);
            cobble.fillTriangle(0, rTopY, cxT - HALF, rTopY, cxB - HALF, rTopY + Math.round((rBotY - rTopY) * 0.3));
            cobble.fillTriangle(0, rTopY, cxB - HALF, rTopY + Math.round((rBotY - rTopY) * 0.3), 0, rTopY + Math.round((rBotY - rTopY) * 0.3));

            // Cobblestone bricks — horizontal slices shifted per scanline for 45° look
            const BRICK_H = 12, MORTAR = 2;
            for (let ry = rTopY; ry <= rBotY; ry += BRICK_H + MORTAR) {
                const cx = Math.round(getCX(ry));
                const bh = Math.min(BRICK_H, rBotY - ry);
                cobble.fillStyle(0x22160a); cobble.fillRect(cx - HALF, ry, RAMP_W, bh + MORTAR);
                cobble.fillStyle(0x7a6240); cobble.fillRect(cx - HALF, ry, RAMP_W, bh);
                cobble.fillStyle(0x8c7250); cobble.fillRect(cx - HALF, ry, RAMP_W, 3); cobble.fillRect(cx - HALF, ry, 2, bh);
                cobble.fillStyle(0x584430); cobble.fillRect(cx - HALF, ry + bh - 3, RAMP_W, 3); cobble.fillRect(cx + HALF - 2, ry, 2, bh);
                cobble.fillStyle(0x6a5438, 0.3); cobble.fillRect(cx - HALF + 3, ry + 3, RAMP_W - 6, bh - 6);
            }

            // Raised edge lips (diagonal) — draw per-scanline for smooth diagonal line
            for (let ry = rTopY; ry <= rBotY; ry++) {
                const cx = Math.round(getCX(ry));
                cobble.fillStyle(0x3a2a0e); cobble.fillRect(cx - HALF - 4, ry, 4, 1);
                cobble.fillStyle(0x3a2a0e); cobble.fillRect(cx + HALF, ry, 4, 1);
                cobble.fillStyle(0x000000, 0.4); cobble.fillRect(cx - HALF, ry, 5, 1);
                cobble.fillStyle(0x000000, 0.4); cobble.fillRect(cx + HALF - 5, ry, 5, 1);
            }

            // Arch gate at top opening
            const cxTop = Math.round(getCX(rTopY));
            const cxBot = Math.round(getCX(rBotY));
            for (const [gx, gy] of [[cxTop - HALF - 16, rTopY], [cxBot - HALF - 16, rBotY]]) {
                cobble.fillStyle(0x2a2818); cobble.fillRect(gx, gy - 38, 16, 38); cobble.fillRect(gx + RAMP_W + 16, gy - 38, 16, 38);
                cobble.fillStyle(0x1e1c10); cobble.fillRect(gx, gy - 44, RAMP_W + 48, 8);
                cobble.fillStyle(0x3a3416); cobble.fillRect(gx, gy - 44, RAMP_W + 48, 3);
                cobble.fillStyle(0x4a4422); cobble.fillRect(gx + HALF + 8, gy - 52, 20, 9);
            }
        };

        // RIGHT RAMP: 45° up-right  cx = 1690 - y  (at y=860→cx=830, at y=610→cx=1080)
        const rRT = 610 + Math.round(topH / 2);   // 623
        const rRB = 860 - Math.round(topH / 2);   // 847
        diagRamp(rRT, rRB, y => 1690 - y);

        // LEFT RAMP: 45° up-left  cx = y - 360  (at y=610→cx=250, at y=360→cx=0)
        const lRT = 360 + Math.round(topH / 2);   // 373
        const lRB = 610 - Math.round(topH / 2);   // 597
        diagRamp(lRT, lRB, y => y - 360);

        // ── Wall torches ──────────────────────────────────────────────────
        const torchBrackets = this.add.graphics();
        const torchPositions = [];

        const torchAt = (tx, ty) => {
            torchPositions.push({ tx, ty });
            torchBrackets.fillStyle(0x4a2e0a); torchBrackets.fillRect(tx - 3, ty - 40, 6, 28);
            torchBrackets.fillStyle(0x3a2008); torchBrackets.fillRect(tx - 9, ty - 42, 20, 5); torchBrackets.fillRect(tx + 9, ty - 50, 3, 10);
            torchBrackets.fillStyle(0x2a1404); torchBrackets.fillRect(tx - 8, ty - 42, 2, 5); torchBrackets.fillRect(tx + 16, ty - 50, 2, 10);
        };

        // Ledge torches (spaced across each floor's x-range)
        MapManager.getFloorData().forEach(([y, lx, lw]) => {
            [0.2, 0.4, 0.6, 0.8].forEach(f => torchAt(Math.round(lx + lw * f), y));
        });

        // Ramp torches (on wall beside each diagonal ramp)
        [0.25, 0.55, 0.82].forEach(f => {
            const ry = Math.round(rRT + f * (rRB - rRT));
            torchAt(Math.round(1690 - ry) - HALF - 28, ry);
        });
        [0.25, 0.55, 0.82].forEach(f => {
            const ry = Math.round(lRT + f * (lRB - lRT));
            torchAt(Math.round(ry - 360) + HALF + 28, ry);
        });

        // Animated flame layer drawn on top of brackets
        const torchFlames = this.add.graphics();
        let _torchT = 0;
        const drawFlames = () => {
            _torchT += 0.06;
            torchFlames.clear();
            for (const { tx, ty } of torchPositions) {
                const seed = tx * 0.13 + ty * 0.07;
                const lean = Math.sin(_torchT * 4.1 + seed) * 2.5;
                const tipY = ty - 66 + Math.sin(_torchT * 3.7 + seed + 1) * 4;

                torchFlames.fillStyle(0xcc4400, 0.95); torchFlames.fillTriangle(tx - 7, ty - 50, tx + 7, ty - 50, tx + lean,           tipY);
                torchFlames.fillStyle(0xff7700, 0.9);  torchFlames.fillTriangle(tx - 5, ty - 50, tx + 5, ty - 50, tx + 1 + lean * 0.7, tipY + 2);
                torchFlames.fillStyle(0xffcc00, 0.85); torchFlames.fillTriangle(tx - 3, ty - 50, tx + 3, ty - 50, tx + lean * 0.4,     tipY + 6);
                torchFlames.fillStyle(0xffffff, 0.45); torchFlames.fillCircle(tx + lean * 0.3, ty - 56, 3);
            }
        };
        drawFlames();
        this.time.addEvent({ delay: 60, callback: drawFlames, loop: true });
    }

    // Returns the difficulty parameters for the given wave number.
    // All stats scale linearly with wave; speed and HP are capped to prevent
    // enemies from becoming impossible to stop at very high wave counts.
    //   goblins: +2.5 per wave (base 20)
    //   ogres:   +0.75 per wave (base 1, min 1)
    //   speedMult: +0.15 per wave, cap 3.5×
    //   hpMult:    +0.25 per wave, cap 10×
    //   spawnDelay: -25 ms per wave (base 380 ms, min 120 ms)
    _waveConfig(wave) {
        const goblins   = Math.round(20 + (wave - 1) * 2.5);
        const ogres     = Math.max(1, Math.floor(1 + (wave - 1) * 0.75));
        const total     = goblins + ogres;
        const speedMult = Math.min(3.5, 1 + (wave - 1) * 0.15);
        const hpMult    = Math.min(10,  1 + (wave - 1) * 0.25);
        const spawnDelay = Math.max(120, 380 - (wave - 1) * 25);
        return { goblins, ogres, total, speedMult, hpMult, spawnDelay };
    }

    // Begins a new wave: builds a shuffled spawn queue and starts a repeating timer
    // that calls _spawnNext every cfg.spawnDelay ms until all monsters are out.
    // The queue is shuffled so goblins and ogres are interleaved randomly.
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

    // Pops the next enemy type from the queue and spawns it at the path origin.
    // Sets allSpawned=true after the last enemy so _checkWaveComplete can fire.
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

    // Called after every enemy-killed or goblin-escaped event.
    // Only advances to the next wave when all enemies have been spawned AND
    // all are accounted for (killed or escaped). betweenWaves guard prevents
    // double-triggering if multiple enemies die on the same frame.
    _checkWaveComplete() {
        if (!this.allSpawned || this.monstersAlive > 0 || this.betweenWaves || this.gameOver) return;
        this.betweenWaves = true;
        this.wave++;
        this.ui.flashMessage(`Wave complete!  Next wave in 5 seconds…`, 4500);
        this.time.delayedCall(5000, () => {
            if (!this.gameOver) this._startWave();
        });
    }

    // Shows the game-over overlay: dark tint fades in, then "GAME OVER", "You Died.",
    // score, and a blinking "Press SPACE" prompt appear in sequence via delayed tweens.
    // Resets speed to 1× and re-binds SPACE to return to SplashScene.
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

    // Main game loop — called every frame by Phaser.
    // Enemies update themselves via runChildUpdate:true on the group.
    // Towers and the Hero are updated manually here so they receive scene time (ms).
    update(time) {
        if (this.paused || this.gameOver) return;
        this.hero.update(time);
        this.towers.getChildren().forEach(tower => tower.update(time));
    }
}
