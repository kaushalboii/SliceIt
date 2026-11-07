import Phaser from 'phaser';
import { GAME_CONSTANTS } from './config/GameConfig';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';
import { GameOverScene } from './scenes/GameOverScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME_CONSTANTS.CANVAS_WIDTH,
  height: GAME_CONSTANTS.CANVAS_HEIGHT,
  backgroundColor: '#090f1a',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  input: {
    activePointers: 3,
    touch: {
      capture: true
    }
  },
  scene: [BootScene, MenuScene, GameScene, GameOverScene]
};

window.addEventListener('DOMContentLoaded', () => {
  new Phaser.Game(config);
});

