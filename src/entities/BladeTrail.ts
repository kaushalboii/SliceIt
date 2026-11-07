import Phaser from 'phaser';
import { GAME_CONSTANTS } from '../config/GameConfig';
import { SoundManager } from '../audio/SoundManager';

interface TrailPoint {
  x: number;
  y: number;
  time: number;
}

export class BladeTrail {
  private scene: Phaser.Scene;
  private graphics: Phaser.GameObjects.Graphics;
  private points: TrailPoint[] = [];
  private isPointerDown: boolean = false;
  private currentSpeed: number = 0;
  private lastSwooshTime: number = 0;
  private activeColor: number = 0x00f0ff; // Neon cyan blade
  private activeCoreColor: number = 0xffffff;
  private isComboActive: boolean = false;
  private comboResetTimer?: Phaser.Time.TimerEvent;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.graphics = scene.add.graphics();
    this.graphics.setDepth(100);

    this.setupInput();
  }

  private setupInput(): void {
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.isPointerDown = true;
      this.points = [{ x: pointer.x, y: pointer.y, time: this.scene.time.now }];
      SoundManager.getInstance().init();
    });

    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.isPointerDown) return;

      const now = this.scene.time.now;
      const lastPoint = this.points[this.points.length - 1];

      if (lastPoint) {
        const dx = pointer.x - lastPoint.x;
        const dy = pointer.y - lastPoint.y;
        const dt = (now - lastPoint.time) / 1000;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dt > 0) {
          this.currentSpeed = dist / dt;
        }

        // Trigger swoosh sound if blade is moving fast enough
        if (this.currentSpeed > GAME_CONSTANTS.BLADE_MIN_VELOCITY && now - this.lastSwooshTime > 220) {
          SoundManager.getInstance().playSwoosh();
          this.lastSwooshTime = now;
        }

        // Emit subtle sparks on high speed slice
        if (this.currentSpeed > 600 && Math.random() < 0.35) {
          this.emitTipSpark(pointer.x, pointer.y);
        }
      }

      this.points.push({ x: pointer.x, y: pointer.y, time: now });
    });

    this.scene.input.on('pointerup', () => {
      this.isPointerDown = false;
    });

    this.scene.input.on('pointerout', () => {
      this.isPointerDown = false;
    });
  }

  private emitTipSpark(x: number, y: number): void {
    const spark = this.scene.add.image(x, y, 'blade_spark');
    spark.setDepth(105);
    spark.setTint(this.isComboActive ? 0xffd54f : 0x00f0ff);
    spark.setScale(Phaser.Math.FloatBetween(0.4, 0.7));

    this.scene.tweens.add({
      targets: spark,
      alpha: 0,
      scale: 0.1,
      duration: 180,
      onComplete: () => spark.destroy()
    });
  }

  public activateComboFlare(): void {
    this.isComboActive = true;
    this.activeColor = 0xffa000; // Blazing gold fiery blade
    this.activeCoreColor = 0xfff9c4;

    if (this.comboResetTimer) this.comboResetTimer.remove();
    this.comboResetTimer = this.scene.time.delayedCall(700, () => {
      this.isComboActive = false;
      this.activeColor = 0x00f0ff;
      this.activeCoreColor = 0xffffff;
    });
  }

  public update(): void {
    const now = this.scene.time.now;
    this.graphics.clear();

    // Prune old points
    this.points = this.points.filter((pt) => now - pt.time <= GAME_CONSTANTS.BLADE_LIFETIME_MS);

    if (this.points.length < 2) return;

    // Draw Blade Glow & Blade Core
    for (let i = 0; i < this.points.length - 1; i++) {
      const p1 = this.points[i];
      const p2 = this.points[i + 1];

      const ageRatio = (now - p2.time) / GAME_CONSTANTS.BLADE_LIFETIME_MS;
      const alpha = Math.max(0, 1 - ageRatio);
      const width = (1 - ageRatio) * (this.isComboActive ? 18 : 13);

      // Outer neon flare
      this.graphics.lineStyle(width * 2.2, this.activeColor, alpha * 0.35);
      this.graphics.lineBetween(p1.x, p1.y, p2.x, p2.y);

      // Mid blade
      this.graphics.lineStyle(width * 1.2, this.activeColor, alpha * 0.75);
      this.graphics.lineBetween(p1.x, p1.y, p2.x, p2.y);

      // Core white sharp edge
      this.graphics.lineStyle(Math.max(1, width * 0.5), this.activeCoreColor, alpha * 0.98);
      this.graphics.lineBetween(p1.x, p1.y, p2.x, p2.y);
    }
  }

  public getRecentCutSegment(): { p1: { x: number; y: number }; p2: { x: number; y: number }; speed: number; angle: number } | null {
    if (this.points.length < 2) return null;

    const p2 = this.points[this.points.length - 1];
    const p1 = this.points[this.points.length - 2];
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 3) return null;

    const angle = Math.atan2(dy, dx);
    return {
      p1,
      p2,
      speed: this.currentSpeed,
      angle
    };
  }

  public checkSliceIntersection(circleX: number, circleY: number, radius: number): { hit: boolean; angle: number } | null {
    const cut = this.getRecentCutSegment();
    if (!cut) return null;

    // Must exceed minimum slicing speed
    if (cut.speed < GAME_CONSTANTS.BLADE_MIN_VELOCITY && this.points.length > 2) {
      return null;
    }

    const { p1, p2, angle } = cut;
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const lenSq = dx * dx + dy * dy;

    if (lenSq === 0) return null;

    const t = Math.max(0, Math.min(1, ((circleX - p1.x) * dx + (circleY - p1.y) * dy) / lenSq));
    const projX = p1.x + t * dx;
    const projY = p1.y + t * dy;

    const distSq = (circleX - projX) * (circleX - projX) + (circleY - projY) * (circleY - projY);

    if (distSq <= radius * radius) {
      return { hit: true, angle };
    }

    return null;
  }

  public getIsPointerDown(): boolean {
    return this.isPointerDown;
  }

  public destroy(): void {
    if (this.comboResetTimer) this.comboResetTimer.remove();
    this.graphics.destroy();
    this.points = [];
  }
}
