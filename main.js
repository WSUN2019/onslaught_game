import SplashScene from './src/scenes/SplashScene.js';
import GameScene from './src/scenes/GameScene.js';

// Phaser game configuration.
// type: AUTO lets Phaser pick WebGL or Canvas depending on browser support.
// The canvas is injected into #game-container in index.html.
const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 1080,
    height: 960,
    scale: {
        // FIT scales the canvas to fill the browser window while maintaining aspect ratio.
        // CENTER_BOTH keeps it centred horizontally and vertically.
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: { debug: false } // set debug:true to see hitboxes during development
    },
    // Scenes are started in order: SplashScene runs first, then transitions to GameScene.
    scene: [SplashScene, GameScene]
};

new Phaser.Game(config);
