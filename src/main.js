import Phaser from 'phaser';
import PlayScene from './scenes/PlayScene.js';
import { buildHud, showRoleSelect } from './ui.js';

showRoleSelect(() => {
  buildHud();

  new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 960,
    height: 540,
    backgroundColor: '#0a0e17',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: 'arcade',
      arcade: { gravity: { y: 900 }, debug: false },
    },
    scene: [PlayScene],
  });
});
