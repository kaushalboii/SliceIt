import Phaser from 'phaser';
import { GAME_CONSTANTS, BladeSkin, BLADE_SKINS } from '../config/GameConfig';
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
  private currentSkin: BladeSkin = 'cyber';
  private activeColor: number = 0x00f0ff;
  private activeCoreColor: number = 0xffffff;
  private isComboActive: boolean = false;
  private comboResetTimer?: Phaser.Time.TimerEvent;
  private rainbowHue: number = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.graphics = scene.add.graphics();
    this.graphics.setDepth(100);

    const savedSkin = localStorage.getItem('slice_it_blade_skin') as BladeSkin | null;
    if (savedSkin && BLADE_SKINS[savedSkin]) {
      this.setBladeSkin(savedSkin);
    } else {
      this.setBladeSkin('cyber');
    }

    this.setupInput();
  }

  public setBladeSkin(skin: BladeSkin): void {
    this.currentSkin = skin;
    localStorage.setItem('slice_it_blade_skin', skin);
    const cfg = BLADE_SKINS[skin];
    this.activeColor = cfg.outerColor;
    this.activeCoreColor = cfg.coreColor;
  }

  public getBladeSkin(): BladeSkin {
    return this.currentSkin;
  }

  public cycleNextSkin(): BladeSkin {
    const skins: BladeSkin[] = ['cyber', 'flame', 'jade', 'rainbow'];
    const currentIdx = skins.indexOf(this.currentSkin);
    const nextSkin = skins[(currentIdx + 1) % skins.length];
    this.setBladeSkin(nextSkin);
    return nextSkin;
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

        // Swoosh sound on swift cut
        if (this.currentSpeed > GAME_CONSTANTS.BLADE_MIN_VELOCITY && now - this.lastSwooshTime > 220) {
          SoundManager.getInstance().playSwoosh();
          this.lastSwooshTime = now;
        }

        // Particle sparks on quick swipe
        if (this.currentSpeed > 550 && Math.random() < 0.4) {
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

    let sparkColor = this.activeColor;
    if (this.currentSkin === 'flame') {
      sparkColor = Phaser.Utils.Array.GetRandom([0xff3d00, 0xff9100, 0xffd600]);
    } else if (this.currentSkin === 'jade') {
      sparkColor = Phaser.Utils.Array.GetRandom([0x00e676, 0x69f0ae, 0xb9f6ca]);
    } else if (this.currentSkin === 'rainbow') {
      sparkColor = Phaser.Display.Color.HSLToColor(this.rainbowHue, 1, 0.6).color;
    }

    spark.setTint(sparkColor);
    spark.setScale(Phaser.Math.FloatBetween(0.4, 0.75));

    this.scene.tweens.add({
      targets: spark,
      alpha: 0,
      scale: 0.1,
      y: y - Phaser.Math.Between(4, 16),
      duration: 180,
      onComplete: () => spark.destroy()
    });
  }

  public activateComboFlare(): void {
    this.isComboActive = true;
    if (this.comboResetTimer) this.comboResetTimer.remove();
    this.comboResetTimer = this.scene.time.delayedCall(750, () => {
      this.isComboActive = false;
      this.setBladeSkin(this.currentSkin);
    });
  }

  public update(): void {
    const now = this.scene.time.now;
    this.graphics.clear();

    this.points = this.points.filter((pt) => now - pt.time <= GAME_CONSTANTS.BLADE_LIFETIME_MS);

    if (this.points.length < 2) return;

    // Rainbow shifting hue
    if (this.currentSkin === 'rainbow') {
      this.rainbowHue = (this.rainbowHue + 0.015) % 1;
      this.activeColor = Phaser.Display.Color.HSLToColor(this.rainbowHue, 1, 0.55).color;
    }

    const drawOuterColor = this.isComboActive ? 0xffab00 : this.activeColor;
    const drawCoreColor = this.isComboActive ? 0xfff9c4 : this.activeCoreColor;

    for (let i = 0; i < this.points.length - 1; i++) {
      const p1 = this.points[i];
      const p2 = this.points[i + 1];

      const ageRatio = (now - p2.time) / GAME_CONSTANTS.BLADE_LIFETIME_MS;
      const alpha = Math.max(0, 1 - ageRatio);
      const width = (1 - ageRatio) * (this.isComboActive ? 20 : 14);

      // Outer glow
      this.graphics.lineStyle(width * 2.3, drawOuterColor, alpha * 0.35);
      this.graphics.lineBetween(p1.x, p1.y, p2.x, p2.y);

      // Mid blade
      this.graphics.lineStyle(width * 1.2, drawOuterColor, alpha * 0.8);
      this.graphics.lineBetween(p1.x, p1.y, p2.x, p2.y);

      // Core sharp edge
      this.graphics.lineStyle(Math.max(1, width * 0.5), drawCoreColor, alpha * 0.98);
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
