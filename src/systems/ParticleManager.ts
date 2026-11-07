import Phaser from 'phaser';

export class ParticleManager {
  private scene: Phaser.Scene;
  private splatterLayer: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.splatterLayer = scene.add.container(0, 0);
    this.splatterLayer.setDepth(2);
  }

  // --- JUICE WALL SPLATTER ---
  public addJuiceSplatter(x: number, y: number, tintColor: number): void {
    const scale = Phaser.Math.FloatBetween(0.65, 1.1);
    const rotation = Phaser.Math.FloatBetween(0, Math.PI * 2);

    const splatter = this.scene.add.image(x, y, 'juice_splatter');
    splatter.setTint(tintColor);
    splatter.setScale(scale);
    splatter.setRotation(rotation);
    splatter.setAlpha(0.75);

    this.splatterLayer.add(splatter);

    if (this.splatterLayer.length > 30) {
      const oldest = this.splatterLayer.first as Phaser.GameObjects.Image;
      if (oldest) {
        this.splatterLayer.remove(oldest, true);
      }
    }

    this.scene.tweens.add({
      targets: splatter,
      alpha: 0,
      duration: 8000,
      delay: 3500,
      ease: 'Power1',
      onComplete: () => {
        splatter.destroy();
      }
    });
  }

  // --- JUICE BURST PARTICLES ---
  public emitJuiceBurst(x: number, y: number, juiceColor: number, sliceAngle: number): void {
    const particleCount = 20;
    const normalAngle = sliceAngle + Math.PI / 2;

    for (let i = 0; i < particleCount; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      const angle = normalAngle * side + Phaser.Math.FloatBetween(-0.6, 0.6);
      const speed = Phaser.Math.FloatBetween(200, 520);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      const particleType = i % 3 === 0 ? 'particle_pulp' : 'particle_glow';
      const particle = this.scene.physics.add.image(x, y, particleType);
      particle.setDepth(20);
      particle.setTint(juiceColor);
      particle.setScale(Phaser.Math.FloatBetween(0.6, 1.2));

      particle.setVelocity(vx, vy);
      particle.setAngularVelocity(Phaser.Math.FloatBetween(-400, 400));
      particle.setGravityY(700);

      this.scene.tweens.add({
        targets: particle,
        alpha: 0,
        scale: 0.1,
        duration: Phaser.Math.Between(450, 750),
        ease: 'Quad.easeOut',
        onComplete: () => {
          particle.destroy();
        }
      });
    }
  }

  // --- BOMB EXPLOSION FX ---
  public emitBombExplosion(x: number, y: number): void {
    const flash = this.scene.add.rectangle(
      this.scene.scale.width / 2,
      this.scene.scale.height / 2,
      this.scene.scale.width,
      this.scene.scale.height,
      0xffffff
    );
    flash.setDepth(200);
    flash.setAlpha(0.95);

    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 380,
      onComplete: () => flash.destroy()
    });

    this.scene.cameras.main.shake(450, 0.035);

    const sparkCount = 45;
    for (let i = 0; i < sparkCount; i++) {
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const speed = Phaser.Math.FloatBetween(250, 800);
      const spark = this.scene.physics.add.image(x, y, 'particle_glow');
      spark.setDepth(150);

      const color = Phaser.Utils.Array.GetRandom([0xffeb3b, 0xff5722, 0xff9800, 0xff1744]);
      spark.setTint(color);
      spark.setScale(Phaser.Math.FloatBetween(0.8, 2.0));

      spark.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
      spark.setGravityY(500);

      this.scene.tweens.add({
        targets: spark,
        alpha: 0,
        scale: 0.1,
        duration: Phaser.Math.Between(550, 1000),
        onComplete: () => spark.destroy()
      });
    }
  }

  // --- FLOATING SCORE POPUP ---
  public showScorePopup(x: number, y: number, text: string, color: string = '#ffd54f'): void {
    const popup = this.scene.add.text(x, y - 10, text, {
      fontFamily: 'Luckiest Guy, Outfit, sans-serif',
      fontSize: '28px',
      color: color,
      stroke: '#000000',
      strokeThickness: 5
    });
    popup.setOrigin(0.5);
    popup.setDepth(120);
    popup.setScale(0.5);

    this.scene.tweens.add({
      targets: popup,
      y: y - 60,
      scale: 1.15,
      alpha: 0,
      duration: 750,
      ease: 'Back.easeOut',
      onComplete: () => popup.destroy()
    });
  }

  // --- COMBO BANNER ---
  public showComboBanner(x: number, y: number, comboCount: number, bonusScore: number): void {
    const comboTitles: Record<number, { text: string; color: string; stroke: string }> = {
      2: { text: 'DOUBLE SLICE!', color: '#69f0ae', stroke: '#004d40' },
      3: { text: 'COMBO x3!', color: '#00f0ff', stroke: '#01579b' },
      4: { text: 'GREAT COMBO x4!', color: '#ffeb3b', stroke: '#e65100' },
      5: { text: 'MEGA COMBO x5!', color: '#ff4081', stroke: '#880e4f' },
      6: { text: 'UNSTOPPABLE x6!', color: '#ff1744', stroke: '#210005' }
    };

    const cfg = comboTitles[Math.min(comboCount, 6)] || comboTitles[6];

    // Clamp banner position inside screen
    const clampedX = Phaser.Math.Clamp(x, 180, this.scene.scale.width - 180);
    const clampedY = Phaser.Math.Clamp(y, 100, this.scene.scale.height - 120);

    const container = this.scene.add.container(clampedX, clampedY);
    container.setDepth(130);

    const titleText = this.scene.add.text(0, -20, cfg.text, {
      fontFamily: 'Luckiest Guy, Outfit, sans-serif',
      fontSize: '36px',
      color: cfg.color,
      stroke: cfg.stroke,
      strokeThickness: 7
    }).setOrigin(0.5);

    const bonusText = this.scene.add.text(0, 22, `+${bonusScore} BONUS POINTS`, {
      fontFamily: 'Luckiest Guy, Outfit, sans-serif',
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 5
    }).setOrigin(0.5);

    container.add([titleText, bonusText]);
    container.setScale(0.3);

    // Burst sparks around combo text
    for (let i = 0; i < 12; i++) {
      const ang = (i * Math.PI * 2) / 12;
      const dist = Phaser.Math.Between(50, 110);
      const spark = this.scene.add.image(clampedX, clampedY, 'blade_spark');
      spark.setDepth(129);
      spark.setTint(0xffd54f);
      spark.setScale(0.6);

      this.scene.tweens.add({
        targets: spark,
        x: clampedX + Math.cos(ang) * dist,
        y: clampedY + Math.sin(ang) * dist,
        alpha: 0,
        scale: 0.1,
        duration: 450,
        ease: 'Quad.easeOut',
        onComplete: () => spark.destroy()
      });
    }

    this.scene.tweens.add({
      targets: container,
      scale: 1.3,
      duration: 250,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.scene.tweens.add({
          targets: container,
          alpha: 0,
          y: clampedY - 70,
          scale: 1.0,
          duration: 650,
          delay: 450,
          onComplete: () => container.destroy()
        });
      }
    });
  }

  // --- MISS INDICATOR ---
  public showMissIndicator(x: number, y: number): void {
    const clampedY = Math.min(y, this.scene.scale.height - 40);
    const cross = this.scene.add.text(x, clampedY, '✖', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '44px',
      color: '#ff1744',
      stroke: '#210005',
      strokeThickness: 6
    }).setOrigin(0.5);
    cross.setDepth(120);

    this.scene.tweens.add({
      targets: cross,
      scale: 1.5,
      alpha: 0,
      duration: 750,
      ease: 'Power2',
      onComplete: () => cross.destroy()
    });
  }

  public destroy(): void {
    this.splatterLayer.destroy();
  }
}
