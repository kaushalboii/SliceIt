import Phaser from 'phaser';
import { FruitConfig, GAME_CONSTANTS } from '../config/GameConfig';
import { ParticleManager } from '../systems/ParticleManager';
import { SoundManager } from '../audio/SoundManager';

export class Fruit extends Phaser.Physics.Arcade.Image {
  public fruitConfig: FruitConfig;
  public isSliced: boolean = false;
  private particleManager: ParticleManager;
  private onMissCallback?: (fruit: Fruit) => void;
  private hasReachedApex: boolean = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: FruitConfig,
    particleManager: ParticleManager,
    onMiss?: (fruit: Fruit) => void
  ) {
    super(scene, x, y, config.textureWhole);
    this.fruitConfig = config;
    this.particleManager = particleManager;
    this.onMissCallback = onMiss;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(10);
    this.setCircle(config.radius, (this.width - config.radius * 2) / 2, (this.height - config.radius * 2) / 2);
  }

  public launch(vx: number, vy: number, angularVelocity: number): void {
    this.setVelocity(vx, vy);
    this.setAngularVelocity(angularVelocity);
    this.setGravityY(GAME_CONSTANTS.GRAVITY);
  }

  public update(): void {
    if (this.isSliced) return;

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (!body) return;

    if (body.velocity.y > 0) {
      this.hasReachedApex = true;
    }

    // Check if fallen below screen
    if (this.hasReachedApex && this.y > GAME_CONSTANTS.CANVAS_HEIGHT + 70) {
      if (this.onMissCallback) {
        this.onMissCallback(this);
      }
      this.destroy();
    }
  }

  public slice(sliceAngle: number): { points: number; config: FruitConfig } {
    if (this.isSliced) return { points: 0, config: this.fruitConfig };
    this.isSliced = true;

    const x = this.x;
    const y = this.y;
    const currentVelocity = (this.body as Phaser.Physics.Arcade.Body).velocity;

    // Visual FX
    this.particleManager.addJuiceSplatter(x, y, this.fruitConfig.juiceColor);
    this.particleManager.emitJuiceBurst(x, y, this.fruitConfig.juiceColor, sliceAngle);

    // Audio FX
    SoundManager.getInstance().playSlice(this.fruitConfig.type);

    // Spawn two halves
    this.spawnHalves(x, y, currentVelocity, sliceAngle);

    this.destroy();
    return { points: this.fruitConfig.points, config: this.fruitConfig };
  }

  private spawnHalves(
    x: number,
    y: number,
    parentVel: Phaser.Math.Vector2,
    sliceAngle: number
  ): void {
    const normalAngle = sliceAngle + Math.PI / 2;
    const separationSpeed = 160;

    // Left Half
    const halfLeft = this.scene.physics.add.image(x, y, this.fruitConfig.textureHalfLeft);
    halfLeft.setDepth(9);
    halfLeft.setRotation(sliceAngle);
    halfLeft.setVelocity(
      parentVel.x * 0.5 + Math.cos(normalAngle) * separationSpeed,
      parentVel.y * 0.6 + Math.sin(normalAngle) * separationSpeed
    );
    halfLeft.setAngularVelocity(-280);
    halfLeft.setGravityY(GAME_CONSTANTS.GRAVITY * 1.1);

    // Right Half
    const halfRight = this.scene.physics.add.image(x, y, this.fruitConfig.textureHalfRight);
    halfRight.setDepth(9);
    halfRight.setRotation(sliceAngle);
    halfRight.setVelocity(
      parentVel.x * 0.5 - Math.cos(normalAngle) * separationSpeed,
      parentVel.y * 0.6 - Math.sin(normalAngle) * separationSpeed
    );
    halfRight.setAngularVelocity(280);
    halfRight.setGravityY(GAME_CONSTANTS.GRAVITY * 1.1);

    // Fade and destroy halves when they drop below screen
    const cleanupHalves = () => {
      this.scene.time.delayedCall(1600, () => {
        if (halfLeft.active) halfLeft.destroy();
        if (halfRight.active) halfRight.destroy();
      });
    };
    cleanupHalves();
  }
}

