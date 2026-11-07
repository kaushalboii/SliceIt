import Phaser from 'phaser';
import { GameMode, GAME_CONSTANTS } from '../config/GameConfig';
import { SoundManager } from '../audio/SoundManager';

export class HUD {
  private scene: Phaser.Scene;
  private mode: GameMode;
  private scoreText!: Phaser.GameObjects.Text;
  private bestText!: Phaser.GameObjects.Text;
  private timerText?: Phaser.GameObjects.Text;
  private lifeIcons: Phaser.GameObjects.Text[] = [];
  private soundButton!: Phaser.GameObjects.Text;
  private pauseButton!: Phaser.GameObjects.Text;
  private pauseOverlay?: Phaser.GameObjects.Container;
  private isPaused: boolean = false;
  private onResumeCallback?: () => void;
  private onRestartCallback?: () => void;
  private onQuitCallback?: () => void;

  constructor(
    scene: Phaser.Scene,
    mode: GameMode,
    callbacks?: {
      onResume?: () => void;
      onRestart?: () => void;
      onQuit?: () => void;
    }
  ) {
    this.scene = scene;
    this.mode = mode;
    this.onResumeCallback = callbacks?.onResume;
    this.onRestartCallback = callbacks?.onRestart;
    this.onQuitCallback = callbacks?.onQuit;

    this.createHUD();
  }

  private createHUD(): void {
    const width = this.scene.cameras.main.width;

    // --- SCORE & BEST DISPLAY (Top Left) ---
    const scoreContainer = this.scene.add.container(28, 24);
    scoreContainer.setDepth(90);

    const fruitIcon = this.scene.add.image(14, 18, 'fruit_watermelon').setScale(0.38);

    this.scoreText = this.scene.add.text(42, 0, '0', {
      fontFamily: 'Luckiest Guy, Outfit, sans-serif',
      fontSize: '44px',
      color: '#ffffff',
      stroke: '#051b2e',
      strokeThickness: 6
    });

    const bestScore = localStorage.getItem(`slice_it_best_${this.mode}`) || '0';
    this.bestText = this.scene.add.text(44, 46, `BEST: ${bestScore}`, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#ffd54f',
      stroke: '#000000',
      strokeThickness: 3
    });

    const modeTag = this.scene.add.text(44, 66, this.mode.toUpperCase() + ' MODE', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#4fc3f7',
      backgroundColor: '#0a1d37',
      padding: { left: 6, right: 6, top: 2, bottom: 2 }
    });

    scoreContainer.add([fruitIcon, this.scoreText, this.bestText, modeTag]);

    // --- TOP RIGHT CONTROLS & LIVES / TIMER ---
    const rightContainer = this.scene.add.container(width - 28, 24);
    rightContainer.setDepth(90);

    // Audio Mute Button
    const isMuted = SoundManager.getInstance().getIsMuted();
    this.soundButton = this.scene.add.text(-38, 4, isMuted ? '🔇' : '🔊', {
      fontSize: '26px'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.soundButton.on('pointerdown', () => {
      const nowMuted = SoundManager.getInstance().toggleMute();
      this.soundButton.setText(nowMuted ? '🔇' : '🔊');
    });

    // Pause Button
    this.pauseButton = this.scene.add.text(0, 4, '⏸', {
      fontSize: '26px'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.pauseButton.on('pointerdown', () => {
      this.togglePause();
    });

    rightContainer.add([this.soundButton, this.pauseButton]);

    // Mode specific display (Classic = 3 Lives, Zen/Time = Timer)
    if (this.mode === 'classic') {
      const livesContainer = this.scene.add.container(width - 150, 24);
      livesContainer.setDepth(90);

      for (let i = 0; i < GAME_CONSTANTS.CLASSIC_MAX_LIVES; i++) {
        const xMark = this.scene.add.text(i * 32, 0, '✖', {
          fontFamily: 'Outfit, sans-serif',
          fontSize: '34px',
          color: '#263238', // Grayed out initially (unlost)
          stroke: '#000000',
          strokeThickness: 3
        });
        this.lifeIcons.push(xMark);
        livesContainer.add(xMark);
      }
    } else {
      // Timer for Time / Zen mode
      const duration = this.mode === 'time' ? GAME_CONSTANTS.TIME_MODE_DURATION : GAME_CONSTANTS.ZEN_MODE_DURATION;
      this.timerText = this.scene.add.text(width / 2, 34, this.formatTime(duration), {
        fontFamily: 'Luckiest Guy, Outfit, sans-serif',
        fontSize: '36px',
        color: '#ffeb3b',
        stroke: '#051b2e',
        strokeThickness: 5
      }).setOrigin(0.5).setDepth(90);
    }
  }

  public updateScore(newScore: number): void {
    this.scoreText.setText(String(newScore));
    // Pop scale tween
    this.scene.tweens.add({
      targets: this.scoreText,
      scale: 1.25,
      duration: 100,
      yoyo: true,
      ease: 'Quad.easeInOut'
    });
  }

  public updateLives(remainingLives: number): void {
    if (this.mode !== 'classic') return;

    const lostCount = GAME_CONSTANTS.CLASSIC_MAX_LIVES - remainingLives;

    this.lifeIcons.forEach((icon, index) => {
      if (index < lostCount) {
        if (icon.style.color !== '#ff1744') {
          icon.setColor('#ff1744');
          this.scene.tweens.add({
            targets: icon,
            scale: 1.5,
            duration: 160,
            yoyo: true
          });
        }
      } else {
        icon.setColor('#263238');
      }
    });
  }

  public updateTimer(remainingSeconds: number): void {
    if (!this.timerText) return;
    this.timerText.setText(this.formatTime(remainingSeconds));

    if (remainingSeconds <= 10) {
      this.timerText.setColor('#ff1744');
      this.scene.tweens.add({
        targets: this.timerText,
        scale: 1.15,
        duration: 120,
        yoyo: true
      });
    }
  }

  private formatTime(totalSeconds: number): string {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  private togglePause(): void {
    if (this.isPaused) {
      this.resumeGame();
    } else {
      this.pauseGame();
    }
  }

  public pauseGame(): void {
    if (this.isPaused) return;
    this.isPaused = true;
    SoundManager.getInstance().playClick();

    const w = this.scene.cameras.main.width;
    const h = this.scene.cameras.main.height;

    this.pauseOverlay = this.scene.add.container(0, 0);
    this.pauseOverlay.setDepth(150);

    const backdrop = this.scene.add.rectangle(w / 2, h / 2, w, h, 0x070b14, 0.85);

    const title = this.scene.add.text(w / 2, h / 2 - 110, 'GAME PAUSED', {
      fontFamily: 'Luckiest Guy, Outfit, sans-serif',
      fontSize: '52px',
      color: '#ffffff',
      stroke: '#00f0ff',
      strokeThickness: 8
    }).setOrigin(0.5);

    // Resume button
    const resumeBtn = this.createButton(w / 2, h / 2 - 10, 'RESUME', '#00e676', () => {
      this.resumeGame();
    });

    // Restart button
    const restartBtn = this.createButton(w / 2, h / 2 + 55, 'RESTART', '#ff9800', () => {
      if (this.onRestartCallback) {
        this.onRestartCallback();
      }
    });

    // Quit button
    const quitBtn = this.createButton(w / 2, h / 2 + 120, 'MAIN MENU', '#e0e0e0', () => {
      if (this.onQuitCallback) {
        this.onQuitCallback();
      }
    });

    this.pauseOverlay.add([backdrop, title, resumeBtn, restartBtn, quitBtn]);
  }

  public resumeGame(): void {
    if (!this.isPaused) return;
    this.isPaused = false;
    SoundManager.getInstance().playClick();

    if (this.pauseOverlay) {
      this.pauseOverlay.destroy();
      this.pauseOverlay = undefined;
    }

    if (this.onResumeCallback) {
      this.onResumeCallback();
    }
  }

  private createButton(x: number, y: number, text: string, color: string, onClick: () => void): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);

    const bg = this.scene.add.rectangle(0, 0, 220, 48, 0x16253d, 0.95);
    bg.setStrokeStyle(2, 0x4fc3f7);
    bg.setInteractive({ useHandCursor: true });

    const label = this.scene.add.text(0, 0, text, {
      fontFamily: 'Luckiest Guy, Outfit, sans-serif',
      fontSize: '22px',
      color: color
    }).setOrigin(0.5);

    container.add([bg, label]);

    bg.on('pointerover', () => {
      bg.setFillStyle(0x233b61);
      container.setScale(1.05);
    });

    bg.on('pointerout', () => {
      bg.setFillStyle(0x16253d);
      container.setScale(1.0);
    });

    bg.on('pointerdown', () => {
      SoundManager.getInstance().playClick();
      onClick();
    });

    return container;
  }

  public getIsPaused(): boolean {
    return this.isPaused;
  }

  public destroy(): void {
    if (this.pauseOverlay) {
      this.pauseOverlay.destroy();
    }
  }
}

