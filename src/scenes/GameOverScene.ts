import Phaser from 'phaser';
import { GameMode } from '../config/GameConfig';
import { BladeTrail } from '../entities/BladeTrail';
import { SoundManager } from '../audio/SoundManager';
import { ParticleManager } from '../systems/ParticleManager';

interface GameOverData {
  score: number;
  bestScore: number;
  isNewHigh: boolean;
  mode: GameMode;
  reason?: string;
}

export class GameOverScene extends Phaser.Scene {
  private bladeTrail!: BladeTrail;
  private particleManager!: ParticleManager;
  private dataPayload!: GameOverData;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: GameOverData): void {
    this.dataPayload = data;
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Dark backdrop with juicy glow
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x111c2e, 0x111c2e, 0x060b13, 0x060b13, 1);
    bg.fillRect(0, 0, width, height);

    this.particleManager = new ParticleManager(this);
    this.bladeTrail = new BladeTrail(this);

    // Decorative splatter
    this.particleManager.addJuiceSplatter(width / 2, height / 2 - 40, 0xff1744);

    // Game Over Title
    const title = this.add.text(width / 2, height * 0.18, 'GAME OVER', {
      fontFamily: 'Luckiest Guy, Outfit, sans-serif',
      fontSize: '76px',
      color: '#ff1744',
      stroke: '#210005',
      strokeThickness: 10
    }).setOrigin(0.5).setScale(0.5);

    this.tweens.add({
      targets: title,
      scale: 1,
      duration: 400,
      ease: 'Back.easeOut'
    });

    if (this.dataPayload.reason) {
      this.add.text(width / 2, height * 0.27, this.dataPayload.reason.toUpperCase(), {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '18px',
        fontStyle: 'bold',
        color: '#ff8a80',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5);
    }

    // Score Board Panel
    this.createScoreCard(width, height);

    // Action Buttons
    this.createActionButtons(width, height);
  }

  private createScoreCard(width: number, height: number): void {
    const card = this.add.container(width / 2, height * 0.47);

    const panel = this.add.rectangle(0, 0, 360, 160, 0x101f33, 0.9);
    panel.setStrokeStyle(2, 0x1e3a5f);

    const scoreLabel = this.add.text(0, -50, 'FINAL SCORE', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#90caf9'
    }).setOrigin(0.5);

    // Animated count up for final score
    const scoreVal = this.add.text(0, -12, '0', {
      fontFamily: 'Luckiest Guy, Outfit, sans-serif',
      fontSize: '56px',
      color: '#ffffff',
      stroke: '#051b2e',
      strokeThickness: 6
    }).setOrigin(0.5);

    const counter = { val: 0 };
    this.tweens.add({
      targets: counter,
      val: this.dataPayload.score,
      duration: 700,
      ease: 'Power1',
      onUpdate: () => {
        scoreVal.setText(String(Math.floor(counter.val)));
      }
    });

    // Best Score
    const bestText = this.add.text(0, 42, `BEST SCORE: ${this.dataPayload.bestScore}`, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#ffd54f',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    card.add([panel, scoreLabel, scoreVal, bestText]);

    // New High Score Badge
    if (this.dataPayload.isNewHigh && this.dataPayload.score > 0) {
      const badge = this.add.text(0, -84, '★ NEW HIGH SCORE! ★', {
        fontFamily: 'Luckiest Guy, Outfit, sans-serif',
        fontSize: '22px',
        color: '#ffd700',
        stroke: '#8a6d00',
        strokeThickness: 5
      }).setOrigin(0.5);

      card.add(badge);

      this.tweens.add({
        targets: badge,
        scale: 1.15,
        duration: 400,
        yoyo: true,
        loop: -1
      });
    }
  }

  private createActionButtons(width: number, height: number): void {
    const restartY = height * 0.72;
    const menuY = height * 0.83;

    // Play Again Button
    const restartBtn = this.createButton(width / 2, restartY, 'PLAY AGAIN', '#00e676', () => {
      SoundManager.getInstance().playClick();
      this.scene.start('GameScene', { mode: this.dataPayload.mode });
    });

    // Main Menu Button
    const menuBtn = this.createButton(width / 2, menuY, 'MAIN MENU', '#e0e0e0', () => {
      SoundManager.getInstance().playClick();
      this.scene.start('MenuScene');
    });

    // Restart fruit slice shortcut (Slice watermelon to instantly replay!)
    const fruitIcon = this.add.image(width / 2 - 130, restartY, 'fruit_watermelon').setScale(0.55);
    fruitIcon.setInteractive({ useHandCursor: true });
    fruitIcon.on('pointerdown', () => {
      SoundManager.getInstance().playClick();
      this.scene.start('GameScene', { mode: this.dataPayload.mode });
    });

    this.tweens.add({
      targets: fruitIcon,
      rotation: Math.PI * 2,
      duration: 6000,
      loop: -1
    });
  }

  private createButton(x: number, y: number, text: string, color: string, onClick: () => void): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, 260, 48, 0x162740, 0.95);
    bg.setStrokeStyle(2, 0x00f0ff);
    bg.setInteractive({ useHandCursor: true });

    const label = this.add.text(0, 0, text, {
      fontFamily: 'Luckiest Guy, Outfit, sans-serif',
      fontSize: '22px',
      color: color
    }).setOrigin(0.5);

    container.add([bg, label]);

    bg.on('pointerover', () => {
      bg.setFillStyle(0x223d66);
      container.setScale(1.05);
    });

    bg.on('pointerout', () => {
      bg.setFillStyle(0x162740);
      container.setScale(1.0);
    });

    bg.on('pointerdown', onClick);

    return container;
  }

  update(): void {
    this.bladeTrail.update();
  }

  shutdown(): void {
    this.bladeTrail.destroy();
    this.particleManager.destroy();
  }
}

