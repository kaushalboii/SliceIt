import Phaser from 'phaser';

export class ParticleManager {
  private scene: Phaser.Scene;
  private splatterLayer: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.splatterLayer = scene.add.container(0, 0);
    this.splatterLayer.setDepth(2); // Behind active fruits, in front of background
  }

  // --- JUICE WALL SPLATTER ---
  public addJuiceSplatter(x: number, y: number, tintColor: number): void {
    const scale = Phaser.Math.FloatBetween(0.55, 0.95);
    const rotation = Phaser.Math.FloatBetween(0, Math.PI * 2);

    const splatter = this.scene.add.image(x, y, 'juice_splatter');
    splatter.setTint(tintColor);
    splatter.setScale(scale);
    splatter.setRotation(rotation);
    splatter.setAlpha(0.7);

    this.splatterLayer.add(splatter);

    // Limit total splatters on screen to prevent buildup
    if (this.splatterLayer.length > 25) {
      const oldest = this.splatterLayer.first as Phaser.GameObjects.Image;
      if (oldest) {
        this.splatterLayer.remove(oldest, true);
      }
    }

    // Slowly fade out
    this.scene.tweens.add({
      targets: splatter,
      alpha: 0,
      duration: 7000,
      delay: 3000,
      ease: 'Power1',
      onComplete: () => {
        splatter.destroy();
      }
    });
  }

  // --- JUICE BURST PARTICLES ---
  public emitJuiceBurst(x: number, y: number, juiceColor: number, sliceAngle: number): void {
    const particleCount = 18;
    const normalAngle = sliceAngle + Math.PI / 2;

    for (let i = 0; i < particleCount; i++) {
      // Half fly to one side of the slice, half to the other
      const side = i % 2 === 0 ? 1 : -1;
      const angle = normalAngle * side + Phaser.Math.FloatBetween(-0.6, 0.6);
      const speed = Phaser.Math.FloatBetween(180, 480);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      const particleType = i % 3 === 0 ? 'particle_pulp' : 'particle_glow';
      const particle = this.scene.physics.add.image(x, y, particleType);
      particle.setDepth(20);
      particle.setTint(juiceColor);
      particle.setScale(Phaser.Math.FloatBetween(0.5, 1.1));

      particle.setVelocity(vx, vy);
      particle.setAngularVelocity(Phaser.Math.FloatBetween(-400, 400));
      particle.setGravityY(700);

      this.scene.tweens.add({
        targets: particle,
        alpha: 0,
        scale: 0.1,
        duration: Phaser.Math.Between(400, 700),
        ease: 'Quad.easeOut',
        onComplete: () => {
          particle.destroy();
        }
      });
    }
  }

  // --- BOMB EXPLOSION FX ---
  public emitBombExplosion(x: number, y: number): void {
    // Screen flash
    const flash = this.scene.add.rectangle(
      this.scene.cameras.main.centerX,
      this.scene.cameras.main.centerY,
      this.scene.cameras.main.width,
      this.scene.cameras.main.height,
      0xffffff
    );
    flash.setDepth(200);
    flash.setAlpha(0.9);

    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 350,
      onComplete: () => flash.destroy()
    });

    // Camera shake
    this.scene.cameras.main.shake(400, 0.03);

    // Blast fiery sparks
    const sparkCount = 35;
    for (let i = 0; i < sparkCount; i++) {
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const speed = Phaser.Math.FloatBetween(250, 700);
      const spark = this.scene.physics.add.image(x, y, 'particle_glow');
      spark.setDepth(150);

      const color = Phaser.Utils.Array.GetRandom([0xffeb3b, 0xff5722, 0xff9800, 0xff1744]);
      spark.setTint(color);
      spark.setScale(Phaser.Math.FloatBetween(0.8, 1.8));

      spark.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
      spark.setGravityY(500);

      this.scene.tweens.add({
        targets: spark,
        alpha: 0,
        scale: 0.1,
        duration: Phaser.Math.Between(500, 900),
        onComplete: () => spark.destroy()
      });
    }
  }

  // --- FLOATING SCORE POPUP ---
  public showScorePopup(x: number, y: number, text: string, color: string = '#ffd54f'): void {
    const popup = this.scene.add.text(x, y - 10, text, {
      fontFamily: 'Luckiest Guy, Outfit, sans-serif',
      fontSize: '26px',
      color: color,
      stroke: '#000000',
      strokeThickness: 5
    });
    popup.setOrigin(0.5);
    popup.setDepth(120);
    popup.setScale(0.5);

    this.scene.tweens.add({
      targets: popup,
      y: y - 55,
      scale: 1.1,
      alpha: 0,
      duration: 750,
      ease: 'Back.easeOut',
      onComplete: () => popup.destroy()
    });
  }

  // --- COMBO BANNER ---
  public showComboBanner(x: number, y: number, comboCount: number, bonusScore: number): void {
    const messages = ['NICE SLICE!', 'GREAT COMBO!', 'SPLENDID!', 'BLITZ SLICE!', 'UNSTOPPABLE!'];
    const title = messages[Math.min(comboCount - 3, messages.length - 1)];

    const container = this.scene.add.container(x, y);
    container.setDepth(130);

    const titleText = this.scene.add.text(0, -18, title, {
      fontFamily: 'Luckiest Guy, Outfit, sans-serif',
      fontSize: '32px',
      color: '#00f0ff',
      stroke: '#051b2e',
      strokeThickness: 6
    }).setOrigin(0.5);

    const bonusText = this.scene.add.text(0, 18, `x${comboCount} COMBO +${bonusScore}`, {
      fontFamily: 'Luckiest Guy, Outfit, sans-serif',
      fontSize: '24px',
      color: '#ffeb3b',
      stroke: '#000000',
      strokeThickness: 5
    }).setOrigin(0.5);

    container.add([titleText, bonusText]);
    container.setScale(0.4);

    this.scene.tweens.add({
      targets: container,
      scale: 1.25,
      y: y - 30,
      duration: 300,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.scene.tweens.add({
          targets: container,
          alpha: 0,
          y: y - 80,
          duration: 600,
          delay: 400,
          onComplete: () => container.destroy()
        });
      }
    });
  }

  // --- MISS INDICATOR ---
  public showMissIndicator(x: number, y: number): void {
    const cross = this.scene.add.text(x, Math.min(y, this.scene.cameras.main.height - 40), '✖', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '38px',
      color: '#ff1744',
      stroke: '#210005',
      strokeThickness: 5
    }).setOrigin(0.5);
    cross.setDepth(120);

    this.scene.tweens.add({
      targets: cross,
      scale: 1.4,
      alpha: 0,
      duration: 700,
      ease: 'Power2',
      onComplete: () => cross.destroy()
    });
  }

  public destroy(): void {
    this.splatterLayer.destroy();
  }
}

