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
  private bgGraphics!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    this.isTransitioning = false;
    this.modeFruits = [];

    const width = this.scale.width;
    const height = this.scale.height;

    this.createBackground(width, height);

    this.particleManager = new ParticleManager(this);
    this.bladeTrail = new BladeTrail(this);

    SoundManager.getInstance().startMusic();

    this.createTitle(width);
    this.createModeFruits(width, height);
    this.createMenuControls(width);

    const hint = this.add.text(width / 2, height - 42, '🔪 SWIPE ACROSS A FRUIT TO SELECT YOUR MODE 🔪', {
      fontFamily: 'Luckiest Guy, Outfit, sans-serif',
      fontSize: '22px',
      color: '#00f0ff',
      stroke: '#051b2e',
      strokeThickness: 5
    }).setOrigin(0.5);

    this.tweens.add({
      targets: hint,
      alpha: 0.35,
      scale: 1.05,
      duration: 800,
      yoyo: true,
      loop: -1
    });

    this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      this.repositionElements(gameSize.width, gameSize.height);
    });
  }

  private createBackground(w: number, h: number): void {
    if (this.bgGraphics) this.bgGraphics.destroy();
    this.bgGraphics = this.add.graphics();
    this.bgGraphics.fillGradientStyle(0x132139, 0x132139, 0x090f1a, 0x090f1a, 1);
    this.bgGraphics.fillRect(0, 0, w, h);

    this.bgGraphics.lineStyle(1.5, 0x1d3050, 0.4);
    for (let y = 60; y < h; y += 75) {
      this.bgGraphics.lineBetween(0, y, w, y);
    }
  }

  private createTitle(width: number): void {
    const titleContainer = this.add.container(width / 2, Math.max(110, this.scale.height * 0.18));

    const titleSplatter = this.add.image(0, 0, 'juice_splatter');
    titleSplatter.setScale(1.8);
    titleSplatter.setTint(0xff1744);
    titleSplatter.setAlpha(0.45);

    const titleShadow = this.add.text(5, 5, 'SLICE IT!', {
      fontFamily: 'Luckiest Guy, sans-serif',
      fontSize: '92px',
      color: '#030a14'
    }).setOrigin(0.5);

    const titleText = this.add.text(0, 0, 'SLICE IT!', {
      fontFamily: 'Luckiest Guy, sans-serif',
      fontSize: '92px',
      color: '#ffffff',
      stroke: '#ff1744',
      strokeThickness: 14
    }).setOrigin(0.5);

    const subtitle = this.add.text(0, 62, 'ARCADE FRUIT BLADE', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '20px',
      fontStyle: '900',
      color: '#ffd54f',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    titleContainer.add([titleSplatter, titleShadow, titleText, subtitle]);

    this.tweens.add({
      targets: titleContainer,
      y: titleContainer.y + 10,
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
        x: w * 0.24,
        y: h * 0.60
      },
      {
        mode: 'zen',
        label: 'ZEN',
        sub: '90s No Bombs',
        fruit: 'orange',
        x: w * 0.50,
        y: h * 0.60
      },
      {
        mode: 'time',
        label: 'TIME ATTACK',
        sub: '60s Speedrun',
        fruit: 'strawberry',
        x: w * 0.76,
        y: h * 0.60
      }
    ];

    modes.forEach((cfg) => {
      const container = this.add.container(cfg.x, cfg.y);
      const fruitData = FRUIT_CONFIGS[cfg.fruit];

      const ring = this.add.graphics();
      this.drawDottedRing(ring, fruitData.radius + 22, 0x00f0ff);

      const sprite = this.add.image(0, 0, fruitData.textureWhole);
      sprite.setScale(1.25);

      const modeLabel = this.add.text(0, fruitData.radius + 36, cfg.label, {
        fontFamily: 'Luckiest Guy, Outfit, sans-serif',
        fontSize: '26px',
        color: '#ffffff',
        stroke: '#051b2e',
        strokeThickness: 6
      }).setOrigin(0.5);

      const subLabel = this.add.text(0, fruitData.radius + 64, cfg.sub, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#ffd54f',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5);

      const best = localStorage.getItem(`slice_it_best_${cfg.mode}`) || '0';
      const bestTag = this.add.text(0, -fruitData.radius - 26, `BEST: ${best}`, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#a7ffeb',
        stroke: '#03141f',
        strokeThickness: 3
      }).setOrigin(0.5);

      container.add([ring, sprite, modeLabel, subLabel, bestTag]);

      this.tweens.add({
        targets: container,
        y: cfg.y + (cfg.mode === 'zen' ? -14 : 14),
        duration: 1600 + Math.random() * 400,
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
        radius: fruitData.radius + 18,
        isSliced: false
      });
    });
  }

  private drawDottedRing(g: Phaser.GameObjects.Graphics, radius: number, color: number): void {
    g.clear();
    const count = 18;
    for (let i = 0; i < count; i++) {
      const angle = (i * Math.PI * 2) / count;
      const rx = Math.cos(angle) * radius;
      const ry = Math.sin(angle) * radius;
      g.fillStyle(color, 0.7);
      g.fillCircle(rx, ry, 3.5);
    }
  }

  private createMenuControls(width: number): void {
    const controlsContainer = this.add.container(width - 24, 24);

    const isMuted = SoundManager.getInstance().getIsMuted();
    const soundBtn = this.add.text(-44, 0, isMuted ? '🔇' : '🔊', {
      fontSize: '30px'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    soundBtn.on('pointerdown', () => {
      const nowMuted = SoundManager.getInstance().toggleMute();
      soundBtn.setText(nowMuted ? '🔇' : '🔊');
    });

    const fsBtn = this.add.text(0, 0, '⛶', {
      fontSize: '30px',
      color: '#ffffff'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    fsBtn.on('pointerdown', () => {
      if (this.scale.isFullscreen) {
        this.scale.stopFullscreen();
      } else {
        this.scale.startFullscreen();
      }
    });

    controlsContainer.add([soundBtn, fsBtn]);
  }

  private repositionElements(w: number, h: number): void {
    this.createBackground(w, h);
    if (this.modeFruits.length === 3) {
      this.modeFruits[0].container.setPosition(w * 0.24, h * 0.60);
      this.modeFruits[1].container.setPosition(w * 0.50, h * 0.60);
      this.modeFruits[2].container.setPosition(w * 0.76, h * 0.60);
    }
  }

  update(): void {
    this.bladeTrail.update();

    if (this.isTransitioning) return;

    this.modeFruits.forEach((mf) => {
      mf.ring.rotation += 0.015;
      mf.sprite.rotation += 0.008;

      const hit = this.bladeTrail.checkSliceIntersection(mf.container.x, mf.container.y, mf.radius);

      if (hit && !mf.isSliced) {
        this.selectMode(mf, hit.angle);
      }
    });
  }

  private selectMode(mf: ModeFruit, sliceAngle: number): void {
    mf.isSliced = true;
    this.isTransitioning = true;

    this.particleManager.addJuiceSplatter(mf.container.x, mf.container.y, mf.juiceColor);
    this.particleManager.emitJuiceBurst(mf.container.x, mf.container.y, mf.juiceColor, sliceAngle);
    SoundManager.getInstance().playSlice(mf.fruitKey);

    mf.sprite.setVisible(false);
    mf.ring.setVisible(false);

    const fruitData = FRUIT_CONFIGS[mf.fruitKey];
    const halfLeft = this.physics.add.image(mf.container.x, mf.container.y, fruitData.textureHalfLeft);
    const halfRight = this.physics.add.image(mf.container.x, mf.container.y, fruitData.textureHalfRight);

    halfLeft.setRotation(sliceAngle);
    halfRight.setRotation(sliceAngle);

    const normal = sliceAngle + Math.PI / 2;
    const speed = 280;
    halfLeft.setVelocity(Math.cos(normal) * speed, Math.sin(normal) * speed - 120);
    halfRight.setVelocity(-Math.cos(normal) * speed, -Math.sin(normal) * speed - 120);
    halfLeft.setAngularVelocity(-260);
    halfRight.setAngularVelocity(260);
    halfLeft.setGravityY(800);
    halfRight.setGravityY(800);

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
