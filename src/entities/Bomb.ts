import Phaser from 'phaser';
import { GAME_CONSTANTS } from '../config/GameConfig';
import { ParticleManager } from '../systems/ParticleManager';
import { SoundManager } from '../audio/SoundManager';

export class Bomb extends Phaser.Physics.Arcade.Image {
  public isDetonated: boolean = false;
  private particleManager: ParticleManager;
  private sparkTimer: Phaser.Time.TimerEvent;
  private hasReachedApex: boolean = false;
  public radius: number = 32;

  constructor(scene: Phaser.Scene, x: number, y: number, particleManager: ParticleManager) {
    super(scene, x, y, 'bomb');
    this.particleManager = particleManager;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(11);
    this.setCircle(this.radius, (this.width - this.radius * 2) / 2, (this.height - this.radius * 2) / 2);

    // Fuse spark emitter
    this.sparkTimer = scene.time.addEvent({
      delay: 65,
      loop: true,
      callback: () => this.emitFuseSpark()
    });
  }

  public launch(vx: number, vy: number, angularVelocity: number): void {
    this.setVelocity(vx, vy);
    this.setAngularVelocity(angularVelocity);
    this.setGravityY(GAME_CONSTANTS.GRAVITY);
    SoundManager.getInstance().playFuseHiss();
  }

  private emitFuseSpark(): void {
    if (this.isDetonated || !this.active) return;

    // Calculate fuse tip position based on rotation
    const rot = this.rotation;
    const fuseOffsetX = 18;
    const fuseOffsetY = -30;
    const sparkX = this.x + (fuseOffsetX * Math.cos(rot) - fuseOffsetY * Math.sin(rot));
    const sparkY = this.y + (fuseOffsetX * Math.sin(rot) + fuseOffsetY * Math.cos(rot));

    const spark = this.scene.add.image(sparkX, sparkY, 'blade_spark');
    spark.setDepth(15);
    spark.setTint(Phaser.Utils.Array.GetRandom([0xffeb3b, 0xff5722, 0xff9800]));
    spark.setScale(Phaser.Math.FloatBetween(0.4, 0.7));

    this.scene.tweens.add({
      targets: spark,
      alpha: 0,
      scale: 0.1,
      y: sparkY - Phaser.Math.Between(5, 15),
      duration: 150,
      onComplete: () => spark.destroy()
    });
  }

  public update(): void {
    if (this.isDetonated) return;

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (!body) return;

    if (body.velocity.y > 0) {
      this.hasReachedApex = true;
    }

    if (this.hasReachedApex && this.y > 790) {
      this.cleanup();
      this.destroy();
    }
  }

  public detonate(): void {
    if (this.isDetonated) return;
    this.isDetonated = true;

    this.cleanup();
    SoundManager.getInstance().playExplosion();
    this.particleManager.emitBombExplosion(this.x, this.y);

    this.destroy();
  }

  private cleanup(): void {
    if (this.sparkTimer) {
      this.sparkTimer.remove();
    }
  }

  public override destroy(fromScene?: boolean): void {
    this.cleanup();
    super.destroy(fromScene);
  }
}
