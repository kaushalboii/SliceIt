import Phaser from 'phaser';
import { GameMode, GAME_CONSTANTS, BladeSkin, BLADE_SKINS } from '../config/GameConfig';
import { SoundManager } from '../audio/SoundManager';
import { BladeTrail } from '../entities/BladeTrail';
import { toggleFullscreen } from '../utils/fullscreen';

export class HUD {
  private scene: Phaser.Scene;
  private mode: GameMode;
  private bladeTrail: BladeTrail;
  private scoreText!: Phaser.GameObjects.Text;
  private bestText!: Phaser.GameObjects.Text;
  private streakText!: Phaser.GameObjects.Text;
  private streakBadge!: Phaser.GameObjects.Container;
  private timerText?: Phaser.GameObjects.Text;
  private lifeIcons: Phaser.GameObjects.Text[] = [];
  private soundButton!: Phaser.GameObjects.Text;
  private bladeButton!: Phaser.GameObjects.Text;
  private fullscreenButton!: Phaser.GameObjects.Text;
  private pauseButton!: Phaser.GameObjects.Text;
  private pauseOverlay?: Phaser.GameObjects.Container;
  private rightContainer!: Phaser.GameObjects.Container;
  private livesContainer?: Phaser.GameObjects.Container;
  private scoreContainer!: Phaser.GameObjects.Container;
  private isPaused: boolean = false;
  private onResumeCallback?: () => void;
  private onRestartCallback?: () => void;
  private onQuitCallback?: () => void;

  constructor(
    scene: Phaser.Scene,
    mode: GameMode,
    bladeTrail: BladeTrail,
    callbacks?: {
      onResume?: () => void;
      onRestart?: () => void;
      onQuit?: () => void;
    }
  ) {
    this.scene = scene;
    this.mode = mode;
    this.bladeTrail = bladeTrail;
    this.onResumeCallback = callbacks?.onResume;
    this.onRestartCallback = callbacks?.onRestart;
    this.onQuitCallback = callbacks?.onQuit;

    this.createHUD();
    this.setupResizeListener();
  }

  private createHUD(): void {
    const width = this.scene.scale.width;

    // --- SCORE & BEST DISPLAY (Top Left) ---
    this.scoreContainer = this.scene.add.container(24, 20);
    this.scoreContainer.setDepth(90);

    const fruitIcon = this.scene.add.image(18, 22, 'fruit_watermelon').setScale(0.42);

    this.scoreText = this.scene.add.text(50, 0, '0', {
      fontFamily: 'Luckiest Guy, Outfit, sans-serif',
      fontSize: '48px',
      color: '#ffffff',
      stroke: '#051b2e',
      strokeThickness: 7
    });

    const bestScore = localStorage.getItem(`slice_it_best_${this.mode}`) || '0';
    this.bestText = this.scene.add.text(52, 50, `BEST: ${bestScore}`, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#ffd54f',
      stroke: '#000000',
      strokeThickness: 3
    });

    const modeTag = this.scene.add.text(52, 72, this.mode.toUpperCase() + ' MODE', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#4fc3f7',
      backgroundColor: '#0a1d37',
      padding: { left: 8, right: 8, top: 2, bottom: 2 }
    });

    // Slice Streak Badge
    this.streakBadge = this.scene.add.container(52, 98);
    const streakBg = this.scene.add.rectangle(0, 0, 115, 22, 0x1f1400, 0.85);
    streakBg.setStrokeStyle(1.5, 0xffa000);
    streakBg.setOrigin(0, 0.5);

    this.streakText = this.scene.add.text(10, 0, '🔥 STREAK: 0', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#ffb300'
    }).setOrigin(0, 0.5);

    this.streakBadge.add([streakBg, this.streakText]);

    this.scoreContainer.add([fruitIcon, this.scoreText, this.bestText, modeTag, this.streakBadge]);

    // --- TOP RIGHT CONTROLS ---
    this.rightContainer = this.scene.add.container(width - 24, 20);
    this.rightContainer.setDepth(90);

    // Blade Skin Switcher Button
    const activeSkin = this.bladeTrail.getBladeSkin();
    this.bladeButton = this.scene.add.text(-135, 8, `${BLADE_SKINS[activeSkin].icon} ${BLADE_SKINS[activeSkin].name.toUpperCase()}`, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#ffffff',
      backgroundColor: '#102542',
      padding: { left: 8, right: 8, top: 4, bottom: 4 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.bladeButton.on('pointerdown', () => {
      SoundManager.getInstance().playClick();
      const nextSkin = this.bladeTrail.cycleNextSkin();
      this.bladeButton.setText(`${BLADE_SKINS[nextSkin].icon} ${BLADE_SKINS[nextSkin].name.toUpperCase()}`);
    });

    // Fullscreen Toggle Button
    this.fullscreenButton = this.scene.add.text(-50, 8, '⛶', {
      fontSize: '28px',
      color: '#ffffff'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.fullscreenButton.on('pointerdown', () => {
      SoundManager.getInstance().playClick();
      toggleFullscreen();
    });

    // Audio Mute Button
    const isMuted = SoundManager.getInstance().getIsMuted();
    this.soundButton = this.scene.add.text(-15, 8, isMuted ? '🔇' : '🔊', {
      fontSize: '28px'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.soundButton.on('pointerdown', () => {
      const nowMuted = SoundManager.getInstance().toggleMute();
      this.soundButton.setText(nowMuted ? '🔇' : '🔊');
    });

    // Pause Button
    this.pauseButton = this.scene.add.text(20, 8, '⏸', {
      fontSize: '28px'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.pauseButton.on('pointerdown', () => {
      this.togglePause();
    });

    this.rightContainer.add([this.bladeButton, this.fullscreenButton, this.soundButton, this.pauseButton]);

    // Mode specific display (Classic = 3 Lives, Zen/Time = Timer)
    if (this.mode === 'classic') {
      this.livesContainer = this.scene.add.container(width - 250, 20);
      this.livesContainer.setDepth(90);

      for (let i = 0; i < GAME_CONSTANTS.CLASSIC_MAX_LIVES; i++) {
        const xMark = this.scene.add.text(i * 36, 2, '✖', {
          fontFamily: 'Outfit, sans-serif',
          fontSize: '36px',
          color: '#263238',
          stroke: '#000000',
          strokeThickness: 4
        });
        this.lifeIcons.push(xMark);
        this.livesContainer.add(xMark);
      }
    } else {
      const duration = this.mode === 'time' ? GAME_CONSTANTS.TIME_MODE_DURATION : GAME_CONSTANTS.ZEN_MODE_DURATION;
      this.timerText = this.scene.add.text(width / 2, 40, this.formatTime(duration), {
        fontFamily: 'Luckiest Guy, Outfit, sans-serif',
        fontSize: '44px',
        color: '#ffeb3b',
        stroke: '#051b2e',
        strokeThickness: 6
      }).setOrigin(0.5).setDepth(90);
    }
  }

  private setupResizeListener(): void {
    // Under Scale.FIT, Phaser automatically scales the 1280x720 coordinate canvas cleanly
  }

  public updateScore(newScore: number): void {
    this.scoreText.setText(String(newScore));
    this.scene.tweens.add({
      targets: this.scoreText,
      scale: 1.25,
      duration: 100,
      yoyo: true,
      ease: 'Quad.easeInOut'
    });
  }

  public updateStreak(newStreak: number): void {
    this.streakText.setText(`🔥 STREAK: ${newStreak}`);
    if (newStreak > 0) {
      this.scene.tweens.add({
        targets: this.streakBadge,
        scale: 1.15,
        duration: 100,
        yoyo: true
      });
    }
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
        scale: 1.2,
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

    const w = this.scene.scale.width;
    const h = this.scene.scale.height;

    this.pauseOverlay = this.scene.add.container(0, 0);
    this.pauseOverlay.setDepth(150);

    const backdrop = this.scene.add.rectangle(w / 2, h / 2, w, h, 0x070b14, 0.88);

    const title = this.scene.add.text(w / 2, h / 2 - 130, 'GAME PAUSED', {
      fontFamily: 'Luckiest Guy, Outfit, sans-serif',
      fontSize: '56px',
      color: '#ffffff',
      stroke: '#00f0ff',
      strokeThickness: 8
    }).setOrigin(0.5);

    // Blade Skin Switcher in Pause menu
    const activeSkin = this.bladeTrail.getBladeSkin();
    const bladeSkinBtn = this.createButton(
      w / 2,
      h / 2 - 50,
      `BLADE: ${BLADE_SKINS[activeSkin].icon} ${BLADE_SKINS[activeSkin].name}`,
      '#ffd54f',
      () => {
        const nextSkin = this.bladeTrail.cycleNextSkin();
        (bladeSkinBtn.getAt(1) as Phaser.GameObjects.Text).setText(`BLADE: ${BLADE_SKINS[nextSkin].icon} ${BLADE_SKINS[nextSkin].name}`);
        this.bladeButton.setText(`${BLADE_SKINS[nextSkin].icon} ${BLADE_SKINS[nextSkin].name.toUpperCase()}`);
      }
    );

    const resumeBtn = this.createButton(w / 2, h / 2 + 15, 'RESUME', '#00e676', () => {
      this.resumeGame();
    });

    const restartBtn = this.createButton(w / 2, h / 2 + 80, 'RESTART', '#ff9800', () => {
      if (this.onRestartCallback) {
        this.onRestartCallback();
      }
    });

    const quitBtn = this.createButton(w / 2, h / 2 + 145, 'MAIN MENU', '#e0e0e0', () => {
      if (this.onQuitCallback) {
        this.onQuitCallback();
      }
    });

    this.pauseOverlay.add([backdrop, title, bladeSkinBtn, resumeBtn, restartBtn, quitBtn]);
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

    const bg = this.scene.add.rectangle(0, 0, 260, 48, 0x16253d, 0.95);
    bg.setStrokeStyle(2, 0x4fc3f7);
    bg.setInteractive({ useHandCursor: true });

    const label = this.scene.add.text(0, 0, text, {
      fontFamily: 'Luckiest Guy, Outfit, sans-serif',
      fontSize: '20px',
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
