import Phaser from 'phaser';
import { GameMode, GAME_CONSTANTS, FRUIT_CONFIGS, FruitConfig } from '../config/GameConfig';
import { Fruit } from '../entities/Fruit';
import { Bomb } from '../entities/Bomb';
import { BladeTrail } from '../entities/BladeTrail';
import { ParticleManager } from '../systems/ParticleManager';
import { ScoreManager } from '../systems/ScoreManager';
import { HUD } from '../ui/HUD';
import { SoundManager } from '../audio/SoundManager';

export class GameScene extends Phaser.Scene {
  private mode: GameMode = 'classic';
  private bladeTrail!: BladeTrail;
  private particleManager!: ParticleManager;
  private scoreManager!: ScoreManager;
  private hud!: HUD;

  private activeFruits: Fruit[] = [];
  private activeBombs: Bomb[] = [];

  private lives: number = GAME_CONSTANTS.CLASSIC_MAX_LIVES;
  private remainingTime: number = 0;
  private timerEvent?: Phaser.Time.TimerEvent;
  private spawnEvent?: Phaser.Time.TimerEvent;

  private isGameOver: boolean = false;
  private lastSlicePos: { x: number; y: number } = { x: 500, y: 325 };
  private bgGraphics!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { mode?: GameMode }): void {
    this.mode = data.mode || 'classic';
    this.lives = GAME_CONSTANTS.CLASSIC_MAX_LIVES;
    this.isGameOver = false;
    this.activeFruits = [];
    this.activeBombs = [];
  }

  create(): void {
    const width = this.scale.width;
    const height = this.scale.height;

    this.createBackground(width, height);

    this.particleManager = new ParticleManager(this);
    this.bladeTrail = new BladeTrail(this);

    // Setup ScoreManager with Combo Flare & Streak callbacks
    this.scoreManager = new ScoreManager(
      this.mode,
      this.particleManager,
      {
        onScoreChanged: (score) => {
          this.hud.updateScore(score);
        },
        onStreakChanged: (streak) => {
          this.hud.updateStreak(streak);
        },
        onComboTriggered: (comboCount) => {
          if (comboCount >= 2) {
            this.bladeTrail.activateComboFlare();
          }
        }
      }
    );

    this.hud = new HUD(this, this.mode, this.bladeTrail, {
      onResume: () => this.physics.resume(),
      onRestart: () => this.restartGame(),
      onQuit: () => this.quitToMenu()
    });

    if (this.mode === 'time') {
      this.remainingTime = GAME_CONSTANTS.TIME_MODE_DURATION;
      this.startCountdownTimer();
    } else if (this.mode === 'zen') {
      this.remainingTime = GAME_CONSTANTS.ZEN_MODE_DURATION;
      this.startCountdownTimer();
    }

    this.startFruitSpawning();

    this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      this.createBackground(gameSize.width, gameSize.height);
    });

    this.input.on('pointerup', () => {
      this.scoreManager.forceEndStroke(this.lastSlicePos.x, this.lastSlicePos.y);
    });
  }

  private createBackground(w: number, h: number): void {
    if (this.bgGraphics) this.bgGraphics.destroy();
    this.bgGraphics = this.add.graphics();
    this.bgGraphics.fillGradientStyle(0x0e1726, 0x0e1726, 0x070c14, 0x070c14, 1);
    this.bgGraphics.fillRect(0, 0, w, h);

    this.bgGraphics.lineStyle(1.5, 0x1a2b47, 0.35);
    for (let y = 65; y < h; y += 80) {
      this.bgGraphics.lineBetween(0, y, w, y);
    }
  }

  private startCountdownTimer(): void {
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (this.hud.getIsPaused() || this.isGameOver) return;
        this.remainingTime--;
        this.hud.updateTimer(this.remainingTime);

        if (this.remainingTime <= 0) {
          this.triggerGameOver('Time is up!');
        }
      }
    });
  }

  private startFruitSpawning(): void {
    this.time.delayedCall(500, () => {
      this.scheduleNextWave();
    });
  }

  private scheduleNextWave(): void {
    if (this.isGameOver) return;

    const currentScore = this.scoreManager.getScore();
    const intervalFactor = Math.max(0.5, 1 - currentScore * 0.003);
    const nextDelay = Phaser.Math.Between(
      GAME_CONSTANTS.BASE_SPAWN_INTERVAL * intervalFactor,
      (GAME_CONSTANTS.BASE_SPAWN_INTERVAL + 600) * intervalFactor
    );

    this.spawnWave();

    this.spawnEvent = this.time.delayedCall(nextDelay, () => {
      this.scheduleNextWave();
    });
  }

  private spawnWave(): void {
    if (this.isGameOver || this.hud.getIsPaused()) return;

    const width = this.scale.width;
    const height = this.scale.height;

    const count = Phaser.Math.Between(
      1,
      this.mode === 'zen' ? 4 : this.scoreManager.getScore() > 30 ? 4 : 3
    );

    let spawnBomb = false;
    if (this.mode === 'classic') {
      const bombChance = Math.min(0.35, 0.15 + this.scoreManager.getScore() * 0.003);
      spawnBomb = Math.random() < bombChance;
    } else if (this.mode === 'time') {
      spawnBomb = Math.random() < 0.25;
    }

    const configs = Object.values(FRUIT_CONFIGS);

    for (let i = 0; i < count; i++) {
      const fruitConfig = this.pickRandomFruit(configs);

      const spawnX = Phaser.Math.Between(width * 0.12, width * 0.88);
      const spawnY = height + 45;

      const fruit = new Fruit(
        this,
        spawnX,
        spawnY,
        fruitConfig,
        this.particleManager,
        (missedFruit) => this.handleMissedFruit(missedFruit)
      );

      const targetX = width * 0.5 + (Math.random() - 0.5) * (width * 0.5);
      const targetApexY = height * 0.20 + (Math.random() - 0.5) * 90;

      const gravity = GAME_CONSTANTS.GRAVITY;
      const vy = -Math.sqrt(2 * gravity * (spawnY - targetApexY));
      const tApex = -vy / gravity;
      const vx = (targetX - spawnX) / tApex;
      const angular = Phaser.Math.Between(-200, 200);

      fruit.launch(vx, vy, angular);
      this.activeFruits.push(fruit);
    }

    if (spawnBomb) {
      const bombX = Phaser.Math.Between(width * 0.2, width * 0.8);
      const bombY = height + 50;

      const bomb = new Bomb(this, bombX, bombY, this.particleManager);
      const targetX = width * 0.5 + (Math.random() - 0.5) * (width * 0.4);
      const targetApexY = height * 0.25;
      const vy = -Math.sqrt(2 * GAME_CONSTANTS.GRAVITY * (bombY - targetApexY));
      const tApex = -vy / GAME_CONSTANTS.GRAVITY;
      const vx = (targetX - bombX) / tApex;

      bomb.launch(vx, vy, Phaser.Math.Between(-140, 140));
      this.activeBombs.push(bomb);
    }
  }

  private pickRandomFruit(configs: FruitConfig[]): FruitConfig {
    const totalWeight = configs.reduce((sum, c) => sum + c.weight, 0);
    let rand = Math.random() * totalWeight;

    for (const c of configs) {
      if (rand < c.weight) return c;
      rand -= c.weight;
    }
    return configs[0];
  }

  private handleMissedFruit(fruit: Fruit): void {
    if (this.isGameOver) return;

    this.scoreManager.resetStreak();

    if (this.mode === 'classic') {
      this.lives--;
      this.hud.updateLives(this.lives);
      SoundManager.getInstance().playMiss();
      this.particleManager.showMissIndicator(fruit.x, fruit.y);

      if (this.lives <= 0) {
        this.triggerGameOver('3 Lives Lost!');
      }
    }
  }

  update(): void {
    if (this.isGameOver || this.hud.getIsPaused()) return;

    const now = this.time.now;
    this.bladeTrail.update();

    this.activeFruits = this.activeFruits.filter((f) => f.active && !f.isSliced);
    this.activeBombs = this.activeBombs.filter((b) => b.active && !b.isDetonated);

    this.activeFruits.forEach((f) => f.update());
    this.activeBombs.forEach((b) => b.update());

    for (const fruit of this.activeFruits) {
      if (fruit.isSliced) continue;

      const hit = this.bladeTrail.checkSliceIntersection(fruit.x, fruit.y, fruit.fruitConfig.radius);
      if (hit) {
        this.lastSlicePos = { x: fruit.x, y: fruit.y };
        const result = fruit.slice(hit.angle);
        this.scoreManager.addFruitSlice(result.points, fruit.x, fruit.y, now);
      }
    }

    for (const bomb of this.activeBombs) {
      if (bomb.isDetonated) continue;

      const hit = this.bladeTrail.checkSliceIntersection(bomb.x, bomb.y, bomb.radius);
      if (hit) {
        bomb.detonate();
        this.scoreManager.resetStreak();

        if (this.mode === 'classic') {
          this.triggerGameOver('Bomb Exploded!');
          return;
        } else if (this.mode === 'time') {
          this.remainingTime = Math.max(1, this.remainingTime - 10);
          this.scoreManager.deductPoints(10);
          this.hud.updateTimer(this.remainingTime);
          this.particleManager.showScorePopup(bomb.x, bomb.y, '-10s -10pts', '#ff1744');
        }
      }
    }

    this.scoreManager.update(now, this.lastSlicePos.x, this.lastSlicePos.y);
  }

  private triggerGameOver(reason: string): void {
    if (this.isGameOver) return;
    this.isGameOver = true;

    if (this.timerEvent) this.timerEvent.remove();
    if (this.spawnEvent) this.spawnEvent.remove();

    SoundManager.getInstance().playGameOver();

    const finalScore = this.scoreManager.getScore();
    const isNewHigh = this.scoreManager.saveIfBest();
    const bestScore = this.scoreManager.getBestScore();

    this.cameras.main.flash(350, 255, 50, 50);
    this.time.delayedCall(800, () => {
      this.scene.start('GameOverScene', {
        score: finalScore,
        bestScore: bestScore,
        isNewHigh: isNewHigh,
        mode: this.mode,
        reason: reason
      });
    });
  }

  private restartGame(): void {
    this.cleanup();
    this.scene.restart({ mode: this.mode });
  }

  private quitToMenu(): void {
    this.cleanup();
    this.scene.start('MenuScene');
  }

  private cleanup(): void {
    if (this.timerEvent) this.timerEvent.remove();
    if (this.spawnEvent) this.spawnEvent.remove();
    this.bladeTrail.destroy();
    this.particleManager.destroy();
    this.hud.destroy();
  }

  shutdown(): void {
    this.cleanup();
  }
}
