import Phaser from 'phaser';
import { FruitConfig } from '../config/GameConfig';

export class CustomObjectManager {
  private static instance: CustomObjectManager;
  private customConfig: FruitConfig | null = null;
  private isCustomActive: boolean = false;

  private constructor() {}

  public static getInstance(): CustomObjectManager {
    if (!CustomObjectManager.instance) {
      CustomObjectManager.instance = new CustomObjectManager();
    }
    return CustomObjectManager.instance;
  }

  public getCustomConfig(): FruitConfig | null {
    return this.isCustomActive ? this.customConfig : null;
  }

  public clearCustomObject(scene: Phaser.Scene): void {
    this.isCustomActive = false;
    this.customConfig = null;
    if (scene.textures.exists('fruit_custom')) scene.textures.remove('fruit_custom');
    if (scene.textures.exists('fruit_custom_half_left')) scene.textures.remove('fruit_custom_half_left');
    if (scene.textures.exists('fruit_custom_half_right')) scene.textures.remove('fruit_custom_half_right');
  }

  public openImagePicker(scene: Phaser.Scene, onSuccess: (config: FruitConfig) => void, onError?: (err: string) => void): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';

    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (!target.files || target.files.length === 0) return;

      const file = target.files[0];
      if (!file.type.startsWith('image/')) {
        if (onError) onError('Please select a valid image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (readerEvent: ProgressEvent<FileReader>) => {
        const result = readerEvent.target?.result as string;
        if (!result) return;

        const img = new Image();
        img.onload = () => {
          this.processImage(scene, img);
          if (this.customConfig) {
            this.isCustomActive = true;
            onSuccess(this.customConfig);
          }
        };
        img.onerror = () => {
          if (onError) onError('Failed to load image');
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
      document.body.removeChild(input);
    };

    document.body.appendChild(input);
    input.click();
  }

  private processImage(scene: Phaser.Scene, img: HTMLImageElement): void {
    const size = 100;
    const center = size / 2;
    const radius = 42;

    // Remove existing if any
    if (scene.textures.exists('fruit_custom')) scene.textures.remove('fruit_custom');
    if (scene.textures.exists('fruit_custom_half_left')) scene.textures.remove('fruit_custom_half_left');
    if (scene.textures.exists('fruit_custom_half_right')) scene.textures.remove('fruit_custom_half_right');

    // 1. Whole canvas
    const canvasWhole = document.createElement('canvas');
    canvasWhole.width = size;
    canvasWhole.height = size;
    const ctx = canvasWhole.getContext('2d')!;

    // Circular clip
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    // Draw scaled image to fit
    ctx.drawImage(img, 8, 8, size - 16, size - 16);
    ctx.restore();

    // Outer border ring
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.stroke();

    scene.textures.addCanvas('fruit_custom', canvasWhole);

    // Sample dominant juice color from center
    const pixel = ctx.getImageData(center, center, 1, 1).data;
    const juiceColor = (pixel[0] << 16) | (pixel[1] << 8) | pixel[2];

    // 2. Left Half canvas
    const makeHalf = (isLeft: boolean): HTMLCanvasElement => {
      const c = document.createElement('canvas');
      c.width = size;
      c.height = size;
      const x = c.getContext('2d')!;

      x.save();
      x.translate(center, center);
      if (!isLeft) x.scale(-1, 1);

      x.beginPath();
      x.arc(0, 0, radius, Math.PI / 2, -Math.PI / 2);
      x.closePath();
      x.clip();

      x.drawImage(img, -center + 8, -center + 8, size - 16, size - 16);

      // Cut highlight edge
      x.strokeStyle = '#ffffff';
      x.lineWidth = 2.5;
      x.beginPath();
      x.moveTo(0, -radius);
      x.lineTo(0, radius);
      x.stroke();

      x.restore();
      return c;
    };

    scene.textures.addCanvas('fruit_custom_half_left', makeHalf(true));
    scene.textures.addCanvas('fruit_custom_half_right', makeHalf(false));

    this.customConfig = {
      type: 'custom',
      name: 'Custom Slice',
      radius: radius,
      points: 2,
      primaryColor: juiceColor,
      juiceColor: juiceColor,
      accentColor: 0x00f0ff,
      textureWhole: 'fruit_custom',
      textureHalfLeft: 'fruit_custom_half_left',
      textureHalfRight: 'fruit_custom_half_right',
      weight: 35
    };
  }
}
