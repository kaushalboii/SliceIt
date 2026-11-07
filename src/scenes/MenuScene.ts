import Phaser from 'phaser';
import { BladeTrail } from '../entities/BladeTrail';
import { ParticleManager } from '../systems/ParticleManager';
import { SoundManager } from '../audio/SoundManager';
import { GameMode, FRUIT_CONFIGS } from '../config/GameConfig';

interface ModeFruit {
  mode: GameMode;
  fruitKey: string;
  juiceColor: number;
  container: Phaser.GameObjects.Container;
  sprite: Phaser.GameObjects.Image;
  ring: Phaser.GameObjects.Graphics;
  radius: number;
  isSliced: boolean;
}

export class MenuScene extends Phaser.Scene {
  private bladeTrail!: BladeTrail;
  private particleManager!: ParticleManager;
  private modeFruits: ModeFruit[] = [];
  private isTransitioning: boolean = false;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    this.isTransitioning = false;
    this.modeFruits = [];

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background dojo plank pattern / dark vignette
    this.createBackground(width, height);

    // Particles & Blade
    this.particleManager = new ParticleManager(this);
    this.bladeTrail = new BladeTrail(this);

    // Start background music loop
    SoundManager.getInstance().startMusic();

    // Title graphics & Juice splatter
    this.createTitle(width);

    // Interactive Mode Fruit Buttons (Sliceable!)
    this.createModeFruits(width, height);

    // Audio & Fullscreen HUD controls
    this.createMenuControls(width);

    // Floating instructions
    const hint = this.add.text(width / 2, height - 36, '🔪 SWIPE ACROSS A FRUIT TO SELECT MODE 🔪', {
      fontFamily: 'Luckiest Guy, Outfit, sans-serif',
      fontSize: '20px',
      color: '#00f0ff',
      stroke: '#051b2e',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.tweens.add({
      targets: hint,
      alpha: 0.4,
      duration: 800,
      yoyo: true,
      loop: -1
    });
  }

  private createBackground(w: number, h: number): void {
    // Dark radial background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x132139, 0x132139, 0x090f1a, 0x090f1a, 1);
    bg.fillRect(0, 0, w, h);

    // Dojo planks lines
    bg.lineStyle(1.5, 0x1d3050, 0.4);
    for (let y = 60; y < h; y += 75) {
      bg.lineBetween(0, y, w, y);
    }
  }

  private createTitle(width: number): void {
    const titleContainer = this.add.container(width / 2, 110);

    // Splatter behind title
    const titleSplatter = this.add.image(0, 0, 'juice_splatter');
    titleSplatter.setScale(1.6);
    titleSplatter.setTint(0xff1744);
    titleSplatter.setAlpha(0.4);

    const titleShadow = this.add.text(4, 4, 'SLICE IT!', {
      fontFamily: 'Luckiest Guy, sans-serif',
      fontSize: '84px',
      color: '#030a14'
    }).setOrigin(0.5);

    const titleText = this.add.text(0, 0, 'SLICE IT!', {
      fontFamily: 'Luckiest Guy, sans-serif',
      fontSize: '84px',
      color: '#ffffff',
      stroke: '#ff1744',
      strokeThickness: 12
    }).setOrigin(0.5);

    const subtitle = this.add.text(0, 56, 'ARCADE FRUIT BLADE', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '18px',
      fontStyle: '900',
      color: '#ffd54f',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    titleContainer.add([titleSplatter, titleShadow, titleText, subtitle]);

    // Floating animation
    this.tweens.add({
      targets: titleContainer,
      y: 118,
      duration: 1800,
      yoyo: true,
      loop: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private createModeFruits(w: number, h: number): void {
    const modes: { mode: GameMode; label: string; sub: string; fruit: string; x: number; y: number }[] = [
      {
        mode: 'classic',
        label: 'CLASSIC',
        sub: '3 Lives & Bombs',
        fruit: 'watermelon',
        x: w * 0.23,
        y: h * 0.58
      },
      {
        mode: 'zen',
        label: 'ZEN',
        sub: '90s No Bombs',
        fruit: 'orange',
        x: w * 0.50,
        y: h * 0.58
      },
      {
        mode: 'time',
        label: 'TIME ATTACK',
        sub: '60s Speedrun',
        fruit: 'strawberry',
        x: w * 0.77,
        y: h * 0.58
      }
    ];

    modes.forEach((cfg) => {
      const container = this.add.container(cfg.x, cfg.y);
      const fruitData = FRUIT_CONFIGS[cfg.fruit];

      // Orbiting dotted ring
      const ring = this.add.graphics();
      this.drawDottedRing(ring, fruitData.radius + 18, 0x00f0ff);

      // Fruit sprite
      const sprite = this.add.image(0, 0, fruitData.textureWhole);
      sprite.setScale(1.15);

      // Text labels
      const modeLabel = this.add.text(0, fruitData.radius + 30, cfg.label, {
        fontFamily: 'Luckiest Guy, Outfit, sans-serif',
        fontSize: '24px',
        color: '#ffffff',
        stroke: '#051b2e',
        strokeThickness: 5
      }).setOrigin(0.5);

      const subLabel = this.add.text(0, fruitData.radius + 54, cfg.sub, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#ffd54f',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5);

      // Best score tag
      const best = localStorage.getItem(`slice_it_best_${cfg.mode}`) || '0';
      const bestTag = this.add.text(0, -fruitData.radius - 22, `BEST: ${best}`, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#a7ffeb',
        stroke: '#03141f',
        strokeThickness: 3
      }).setOrigin(0.5);

      container.add([ring, sprite, modeLabel, subLabel, bestTag]);

      // Gentle floating tween
      this.tweens.add({
        targets: container,
        y: cfg.y + (cfg.mode === 'zen' ? -12 : 12),
        duration: 1500 + Math.random() * 500,
        yoyo: true,
        loop: -1,
        ease: 'Sine.easeInOut'
      });

      this.modeFruits.push({
        mode: cfg.mode,
        fruitKey: cfg.fruit,
        juiceColor: fruitData.juiceColor,
        container,
        sprite,
        ring,
        radius: fruitData.radius + 14,
        isSliced: false
      });
    });
  }

  private drawDottedRing(g: Phaser.GameObjects.Graphics, radius: number, color: number): void {
    g.clear();
    const count = 16;
    for (let i = 0; i < count; i++) {
      const angle = (i * Math.PI * 2) / count;
      const rx = Math.cos(angle) * radius;
      const ry = Math.sin(angle) * radius;
      g.fillStyle(color, 0.65);
      g.fillCircle(rx, ry, 3);
    }
  }

  private createMenuControls(width: number): void {
    // Sound Toggle in Menu
    const isMuted = SoundManager.getInstance().getIsMuted();
    const soundBtn = this.add.text(width - 36, 32, isMuted ? '🔇' : '🔊', {
      fontSize: '28px'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    soundBtn.on('pointerdown', () => {
      const nowMuted = SoundManager.getInstance().toggleMute();
      soundBtn.setText(nowMuted ? '🔇' : '🔊');
    });
  }

  update(): void {
    this.bladeTrail.update();

    if (this.isTransitioning) return;

    // Rotate the rings
    this.modeFruits.forEach((mf) => {
      mf.ring.rotation += 0.015;
      mf.sprite.rotation += 0.008;

      // Check blade slice intersection
      const worldX = mf.container.x;
      const worldY = mf.container.y;
      const hit = this.bladeTrail.checkSliceIntersection(worldX, worldY, mf.radius);

      if (hit && !mf.isSliced) {
        this.selectMode(mf, hit.angle);
      }
    });
  }

  private selectMode(mf: ModeFruit, sliceAngle: number): void {
    mf.isSliced = true;
    this.isTransitioning = true;

    // Visual & audio juice effects
    this.particleManager.addJuiceSplatter(mf.container.x, mf.container.y, mf.juiceColor);
    this.particleManager.emitJuiceBurst(mf.container.x, mf.container.y, mf.juiceColor, sliceAngle);
    SoundManager.getInstance().playSlice(mf.fruitKey);

    // Hide whole sprite
    mf.sprite.setVisible(false);
    mf.ring.setVisible(false);

    // Spawn slice halves
    const fruitData = FRUIT_CONFIGS[mf.fruitKey];
    const halfLeft = this.physics.add.image(mf.container.x, mf.container.y, fruitData.textureHalfLeft);
    const halfRight = this.physics.add.image(mf.container.x, mf.container.y, fruitData.textureHalfRight);

    halfLeft.setRotation(sliceAngle);
    halfRight.setRotation(sliceAngle);

    const normal = sliceAngle + Math.PI / 2;
    const speed = 250;
    halfLeft.setVelocity(Math.cos(normal) * speed, Math.sin(normal) * speed - 100);
    halfRight.setVelocity(-Math.cos(normal) * speed, -Math.sin(normal) * speed - 100);
    halfLeft.setAngularVelocity(-250);
    halfRight.setAngularVelocity(250);
    halfLeft.setGravityY(800);
    halfRight.setGravityY(800);

    // Fade out and transition to GameScene
    this.cameras.main.fade(450, 7, 11, 20);
    this.time.delayedCall(450, () => {
      this.scene.start('GameScene', { mode: mf.mode });
    });
  }

  shutdown(): void {
    this.bladeTrail.destroy();
    this.particleManager.destroy();
  }
}

