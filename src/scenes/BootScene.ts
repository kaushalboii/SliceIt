import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    this.generateTextures();
    this.scene.start('MenuScene');
  }

  private generateTextures(): void {
    this.generateWatermelonTextures();
    this.generateOrangeTextures();
    this.generateAppleTextures();
    this.generatePineappleTextures();
    this.generateKiwiTextures();
    this.generateStrawberryTextures();
    this.generateBombTexture();
    this.generateFrostTextures();
    this.generateFrenzyTextures();
    this.generateStarTextures();
    this.generateJuiceSplatterTexture();
    this.generateParticleTextures();
    this.generateBladeSparkTexture();
  }

  // --- WATERMELON ---
  private generateWatermelonTextures(): void {
    const size = 100;
    const center = size / 2;

    // Whole
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Outer rind
    const grad = ctx.createRadialGradient(center - 15, center - 15, 5, center, center, 44);
    grad.addColorStop(0, '#43a047');
    grad.addColorStop(0.7, '#2e7d32');
    grad.addColorStop(1, '#1b5e20');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(center, center, 42, 0, Math.PI * 2);
    ctx.fill();

    // Dark wavy stripes
    ctx.strokeStyle = '#0d3810';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 3) {
      ctx.beginPath();
      ctx.arc(center, center, 40, angle, angle + 0.35);
      ctx.stroke();
    }

    // Gloss shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.beginPath();
    ctx.ellipse(center - 14, center - 18, 12, 6, -0.4, 0, Math.PI * 2);
    ctx.fill();

    this.textures.addCanvas('fruit_watermelon', canvas);

    // Left Half
    const makeHalf = (isLeft: boolean): HTMLCanvasElement => {
      const c = document.createElement('canvas');
      c.width = size;
      c.height = size;
      const x = c.getContext('2d')!;

      x.save();
      x.translate(center, center);
      if (!isLeft) x.scale(-1, 1);

      // Cut arc
      x.beginPath();
      x.arc(0, 0, 42, Math.PI / 2, -Math.PI / 2);
      x.closePath();

      // Green Rind
      x.fillStyle = '#2e7d32';
      x.fill();

      // White/light rind
      x.beginPath();
      x.arc(0, 0, 38, Math.PI / 2, -Math.PI / 2);
      x.closePath();
      x.fillStyle = '#c8e6c9';
      x.fill();

      // Red Flesh
      x.beginPath();
      x.arc(0, 0, 35, Math.PI / 2, -Math.PI / 2);
      x.closePath();
      const fleshGrad = x.createRadialGradient(-10, 0, 5, -5, 0, 35);
      fleshGrad.addColorStop(0, '#ff5252');
      fleshGrad.addColorStop(1, '#d32f2f');
      x.fillStyle = fleshGrad;
      x.fill();

      // Seeds
      x.fillStyle = '#212121';
      const seedOffsets = [
        [-12, -18], [-18, -6], [-20, 10], [-10, 20]
      ];
      seedOffsets.forEach(([sx, sy]) => {
        x.beginPath();
        x.ellipse(sx, sy, 3, 1.8, 0.3, 0, Math.PI * 2);
        x.fill();
      });

      // Highlight on flat cut edge
      x.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      x.lineWidth = 2;
      x.beginPath();
      x.moveTo(0, -35);
      x.lineTo(0, 35);
      x.stroke();

      x.restore();
      return c;
    };

    this.textures.addCanvas('fruit_watermelon_half_left', makeHalf(true));
    this.textures.addCanvas('fruit_watermelon_half_right', makeHalf(false));
  }

  // --- ORANGE ---
  private generateOrangeTextures(): void {
    const size = 90;
    const center = size / 2;

    // Whole
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    const grad = ctx.createRadialGradient(center - 12, center - 14, 4, center, center, 36);
    grad.addColorStop(0, '#ffb74d');
    grad.addColorStop(0.6, '#f57c00');
    grad.addColorStop(1, '#e65100');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(center, center, 36, 0, Math.PI * 2);
    ctx.fill();

    // Stem dot & green leaf
    ctx.fillStyle = '#4caf50';
    ctx.beginPath();
    ctx.ellipse(center + 6, center - 34, 7, 3.5, 0.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#5d4037';
    ctx.beginPath();
    ctx.arc(center, center - 32, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.ellipse(center - 10, center - 14, 10, 5, -0.3, 0, Math.PI * 2);
    ctx.fill();

    this.textures.addCanvas('fruit_orange', canvas);

    // Halves
    const makeHalf = (isLeft: boolean): HTMLCanvasElement => {
      const c = document.createElement('canvas');
      c.width = size;
      c.height = size;
      const x = c.getContext('2d')!;

      x.save();
      x.translate(center, center);
      if (!isLeft) x.scale(-1, 1);

      // Peel
      x.beginPath();
      x.arc(0, 0, 36, Math.PI / 2, -Math.PI / 2);
      x.closePath();
      x.fillStyle = '#f57c00';
      x.fill();

      // Pith
      x.beginPath();
      x.arc(0, 0, 32, Math.PI / 2, -Math.PI / 2);
      x.closePath();
      x.fillStyle = '#fff3e0';
      x.fill();

      // Segments
      const numSegments = 5;
      for (let i = 0; i < numSegments; i++) {
        const start = -Math.PI / 2 + (i * Math.PI) / numSegments + 0.08;
        const end = -Math.PI / 2 + ((i + 1) * Math.PI) / numSegments - 0.08;
        x.beginPath();
        x.moveTo(0, 0);
        x.arc(0, 0, 29, start, end);
        x.closePath();
        x.fillStyle = '#ff9800';
        x.fill();
      }

      x.restore();
      return c;
    };

    this.textures.addCanvas('fruit_orange_half_left', makeHalf(true));
    this.textures.addCanvas('fruit_orange_half_right', makeHalf(false));
  }

  // --- APPLE ---
  private generateAppleTextures(): void {
    const size = 90;
    const center = size / 2;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Apple body
    const grad = ctx.createRadialGradient(center - 12, center - 10, 5, center, center, 36);
    grad.addColorStop(0, '#ff5252');
    grad.addColorStop(0.7, '#d32f2f');
    grad.addColorStop(1, '#b71c1c');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(center - 10, center, 28, 0, Math.PI * 2);
    ctx.arc(center + 10, center, 28, 0, Math.PI * 2);
    ctx.arc(center, center + 6, 30, 0, Math.PI * 2);
    ctx.fill();

    // Stem
    ctx.strokeStyle = '#5d4037';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(center, center - 24);
    ctx.quadraticCurveTo(center + 6, center - 38, center + 4, center - 42);
    ctx.stroke();

    // Leaf
    ctx.fillStyle = '#43a047';
    ctx.beginPath();
    ctx.ellipse(center + 10, center - 34, 8, 4, 0.6, 0, Math.PI * 2);
    ctx.fill();

    // Gloss
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.beginPath();
    ctx.ellipse(center - 12, center - 12, 10, 5, -0.4, 0, Math.PI * 2);
    ctx.fill();

    this.textures.addCanvas('fruit_apple', canvas);

    // Apple Halves
    const makeHalf = (isLeft: boolean): HTMLCanvasElement => {
      const c = document.createElement('canvas');
      c.width = size;
      c.height = size;
      const x = c.getContext('2d')!;

      x.save();
      x.translate(center, center);
      if (!isLeft) x.scale(-1, 1);

      // Red skin
      x.beginPath();
      x.arc(0, 0, 34, Math.PI / 2, -Math.PI / 2);
      x.closePath();
      x.fillStyle = '#d32f2f';
      x.fill();

      // Pale flesh
      x.beginPath();
      x.arc(0, 0, 30, Math.PI / 2, -Math.PI / 2);
      x.closePath();
      x.fillStyle = '#fff9c4';
      x.fill();

      // Core notch & Seed
      x.fillStyle = '#ffe082';
      x.beginPath();
      x.ellipse(0, 0, 8, 14, 0, Math.PI / 2, -Math.PI / 2);
      x.fill();

      x.fillStyle = '#3e2723';
      x.beginPath();
      x.ellipse(-5, 0, 3, 2, 0.4, 0, Math.PI * 2);
      x.fill();

      x.restore();
      return c;
    };

    this.textures.addCanvas('fruit_apple_half_left', makeHalf(true));
    this.textures.addCanvas('fruit_apple_half_right', makeHalf(false));
  }

  // --- PINEAPPLE ---
  private generatePineappleTextures(): void {
    const size = 110;
    const center = size / 2;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Green leafy crown
    ctx.fillStyle = '#2e7d32';
    const crownOffsets = [-16, -8, 0, 8, 16];
    crownOffsets.forEach((ox) => {
      ctx.beginPath();
      ctx.moveTo(center + ox, center - 16);
      ctx.lineTo(center + ox * 1.4, center - 48);
      ctx.lineTo(center + ox + 6, center - 16);
      ctx.fill();
    });

    // Body
    const grad = ctx.createRadialGradient(center - 10, center + 6, 6, center, center + 10, 38);
    grad.addColorStop(0, '#fbc02d');
    grad.addColorStop(0.7, '#f57f17');
    grad.addColorStop(1, '#e65100');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(center, center + 10, 32, 40, 0, 0, Math.PI * 2);
    ctx.fill();

    // Diamond texture
    ctx.strokeStyle = '#af4448';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = -24; i <= 24; i += 12) {
      ctx.moveTo(center + i - 18, center - 15);
      ctx.lineTo(center + i + 18, center + 38);
      ctx.moveTo(center + i + 18, center - 15);
      ctx.lineTo(center + i - 18, center + 38);
    }
    ctx.stroke();

    this.textures.addCanvas('fruit_pineapple', canvas);

    // Pineapple Halves
    const makeHalf = (isLeft: boolean): HTMLCanvasElement => {
      const c = document.createElement('canvas');
      c.width = size;
      c.height = size;
      const x = c.getContext('2d')!;

      x.save();
      x.translate(center, center + 10);
      if (!isLeft) x.scale(-1, 1);

      // Half Crown
      x.fillStyle = '#2e7d32';
      [-12, -4].forEach((ox) => {
        x.beginPath();
        x.moveTo(ox, -26);
        x.lineTo(ox * 1.5, -55);
        x.lineTo(ox + 6, -26);
        x.fill();
      });

      // Spiky rind
      x.beginPath();
      x.ellipse(0, 0, 32, 40, 0, Math.PI / 2, -Math.PI / 2);
      x.closePath();
      x.fillStyle = '#f57f17';
      x.fill();

      // Yellow juicy interior
      x.beginPath();
      x.ellipse(0, 0, 27, 35, 0, Math.PI / 2, -Math.PI / 2);
      x.closePath();
      x.fillStyle = '#fff59d';
      x.fill();

      // Core
      x.beginPath();
      x.ellipse(0, 0, 8, 30, 0, Math.PI / 2, -Math.PI / 2);
      x.closePath();
      x.fillStyle = '#ffee58';
      x.fill();

      x.restore();
      return c;
    };

    this.textures.addCanvas('fruit_pineapple_half_left', makeHalf(true));
    this.textures.addCanvas('fruit_pineapple_half_right', makeHalf(false));
  }

  // --- KIWI ---
  private generateKiwiTextures(): void {
    const size = 80;
    const center = size / 2;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Fuzzy brown exterior
    const grad = ctx.createRadialGradient(center - 8, center - 8, 4, center, center, 32);
    grad.addColorStop(0, '#8d6e63');
    grad.addColorStop(0.7, '#6d4c41');
    grad.addColorStop(1, '#4e342e');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(center, center, 32, 28, 0, 0, Math.PI * 2);
    ctx.fill();

    // Fuzzy speckles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    for (let i = 0; i < 30; i++) {
      const rx = center + (Math.random() - 0.5) * 50;
      const ry = center + (Math.random() - 0.5) * 44;
      ctx.fillRect(rx, ry, 2, 2);
    }

    this.textures.addCanvas('fruit_kiwi', canvas);

    // Kiwi Halves
    const makeHalf = (isLeft: boolean): HTMLCanvasElement => {
      const c = document.createElement('canvas');
      c.width = size;
      c.height = size;
      const x = c.getContext('2d')!;

      x.save();
      x.translate(center, center);
      if (!isLeft) x.scale(-1, 1);

      // Brown skin
      x.beginPath();
      x.ellipse(0, 0, 32, 28, 0, Math.PI / 2, -Math.PI / 2);
      x.closePath();
      x.fillStyle = '#5d4037';
      x.fill();

      // Lime green flesh
      x.beginPath();
      x.ellipse(0, 0, 28, 25, 0, Math.PI / 2, -Math.PI / 2);
      x.closePath();
      x.fillStyle = '#7cb342';
      x.fill();

      // White/cream core
      x.beginPath();
      x.ellipse(0, 0, 8, 12, 0, Math.PI / 2, -Math.PI / 2);
      x.closePath();
      x.fillStyle = '#f1f8e9';
      x.fill();

      // Tiny black seeds
      x.fillStyle = '#212121';
      for (let i = 0; i < 8; i++) {
        const ang = -Math.PI / 2 + (i * Math.PI) / 8 + 0.15;
        const dist = 14;
        const sx = Math.cos(ang) * dist;
        const sy = Math.sin(ang) * dist;
        x.beginPath();
        x.ellipse(sx, sy, 1.8, 1.2, ang, 0, Math.PI * 2);
        x.fill();
      }

      x.restore();
      return c;
    };

    this.textures.addCanvas('fruit_kiwi_half_left', makeHalf(true));
    this.textures.addCanvas('fruit_kiwi_half_right', makeHalf(false));
  }

  // --- STRAWBERRY ---
  private generateStrawberryTextures(): void {
    const size = 80;
    const center = size / 2;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Heart / strawberry shape
    const grad = ctx.createRadialGradient(center - 8, center - 6, 4, center, center, 32);
    grad.addColorStop(0, '#ff4081');
    grad.addColorStop(0.6, '#e91e63');
    grad.addColorStop(1, '#c2185b');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(center, center + 26);
    ctx.bezierCurveTo(center - 28, center + 14, center - 26, center - 16, center, center - 12);
    ctx.bezierCurveTo(center + 26, center - 16, center + 28, center + 14, center, center + 26);
    ctx.fill();

    // Yellow seeds
    ctx.fillStyle = '#fff59d';
    const seedPoints = [
      [center - 10, center - 2], [center, center - 2], [center + 10, center - 2],
      [center - 14, center + 6], [center - 4, center + 6], [center + 6, center + 6], [center + 14, center + 6],
      [center - 8, center + 14], [center + 2, center + 14], [center - 2, center + 20]
    ];
    seedPoints.forEach(([sx, sy]) => {
      ctx.beginPath();
      ctx.ellipse(sx, sy, 1.5, 2.5, 0.2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Leaf cap
    ctx.fillStyle = '#4caf50';
    [-12, -4, 4, 12].forEach((lx) => {
      ctx.beginPath();
      ctx.moveTo(center + lx, center - 10);
      ctx.lineTo(center + lx * 1.3, center - 24);
      ctx.lineTo(center + lx + 4, center - 10);
      ctx.fill();
    });

    this.textures.addCanvas('fruit_strawberry', canvas);

    // Halves
    const makeHalf = (isLeft: boolean): HTMLCanvasElement => {
      const c = document.createElement('canvas');
      c.width = size;
      c.height = size;
      const x = c.getContext('2d')!;

      x.save();
      x.translate(center, center);
      if (!isLeft) x.scale(-1, 1);

      // Red outer
      x.beginPath();
      x.arc(0, 0, 26, Math.PI / 2, -Math.PI / 2);
      x.closePath();
      x.fillStyle = '#e91e63';
      x.fill();

      // Light pink center
      x.beginPath();
      x.arc(0, 0, 18, Math.PI / 2, -Math.PI / 2);
      x.closePath();
      x.fillStyle = '#f8bbd0';
      x.fill();

      // White core rays
      x.strokeStyle = '#ffffff';
      x.lineWidth = 1.5;
      for (let i = 0; i < 4; i++) {
        const ang = -Math.PI / 2 + (i * Math.PI) / 4 + 0.2;
        x.beginPath();
        x.moveTo(0, 0);
        x.lineTo(Math.cos(ang) * 14, Math.sin(ang) * 14);
        x.stroke();
      }

      x.restore();
      return c;
    };

    this.textures.addCanvas('fruit_strawberry_half_left', makeHalf(true));
    this.textures.addCanvas('fruit_strawberry_half_right', makeHalf(false));
  }

  // --- BOMB ---
  private generateBombTexture(): void {
    const size = 90;
    const center = size / 2;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Curved rope fuse
    ctx.strokeStyle = '#d7ccc8';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(center, center - 24);
    ctx.quadraticCurveTo(center + 14, center - 38, center + 24, center - 36);
    ctx.stroke();

    // Fuse brass cap
    ctx.fillStyle = '#ffd54f';
    ctx.fillRect(center - 6, center - 28, 12, 6);

    // Metallic Bomb sphere
    const grad = ctx.createRadialGradient(center - 10, center - 10, 4, center, center, 32);
    grad.addColorStop(0, '#78909c');
    grad.addColorStop(0.3, '#37474f');
    grad.addColorStop(0.85, '#212121');
    grad.addColorStop(1, '#000000');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(center, center, 30, 0, Math.PI * 2);
    ctx.fill();

    // Red warning skull / hazard emblem
    ctx.fillStyle = '#ff1744';
    ctx.beginPath();
    ctx.arc(center, center - 2, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#212121';
    // Eye holes
    ctx.beginPath();
    ctx.arc(center - 3.5, center - 3, 2.2, 0, Math.PI * 2);
    ctx.arc(center + 3.5, center - 3, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Crossbones accent
    ctx.fillStyle = '#ff1744';
    ctx.fillRect(center - 12, center + 9, 24, 3);

    // Specular highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.arc(center - 11, center - 11, 5, 0, Math.PI * 2);
    ctx.fill();

    this.textures.addCanvas('bomb', canvas);
  }

  // --- JUICE SPLATTER (Background) ---
  private generateJuiceSplatterTexture(): void {
    const size = 180;
    const center = size / 2;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#ffffff';

    // Central splash blotch
    ctx.beginPath();
    ctx.arc(center, center, 36, 0, Math.PI * 2);
    ctx.fill();

    // Droplets radiating outward
    const numDroplets = 14;
    for (let i = 0; i < numDroplets; i++) {
      const angle = (i * Math.PI * 2) / numDroplets + (Math.random() - 0.5) * 0.4;
      const distance = 44 + Math.random() * 38;
      const radius = 4 + Math.random() * 9;
      const dx = center + Math.cos(angle) * distance;
      const dy = center + Math.sin(angle) * distance;

      ctx.beginPath();
      ctx.arc(dx, dy, radius, 0, Math.PI * 2);
      ctx.fill();

      // Connecting trail to center
      ctx.lineWidth = radius * 0.7;
      ctx.strokeStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(dx, dy);
      ctx.stroke();
    }

    this.textures.addCanvas('juice_splatter', canvas);
  }

  // --- PARTICLES ---
  private generateParticleTextures(): void {
    // Soft circle particle
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 32;
    pCanvas.height = 32;
    const pCtx = pCanvas.getContext('2d')!;

    const grad = pCtx.createRadialGradient(16, 16, 2, 16, 16, 15);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.6, 'rgba(255, 255, 255, 0.8)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    pCtx.fillStyle = grad;
    pCtx.beginPath();
    pCtx.arc(16, 16, 15, 0, Math.PI * 2);
    pCtx.fill();

    this.textures.addCanvas('particle_glow', pCanvas);

    // Teardrop seed / pulp particle
    const sCanvas = document.createElement('canvas');
    sCanvas.width = 16;
    sCanvas.height = 16;
    const sCtx = sCanvas.getContext('2d')!;

    sCtx.fillStyle = '#ffffff';
    sCtx.beginPath();
    sCtx.moveTo(8, 2);
    sCtx.bezierCurveTo(3, 8, 3, 14, 8, 14);
    sCtx.bezierCurveTo(13, 14, 13, 8, 8, 2);
    sCtx.fill();

    this.textures.addCanvas('particle_pulp', sCanvas);
  }

  // --- FROST MELON (Special: Freeze Time) ---
  private generateFrostTextures(): void {
    const size = 94;
    const center = size / 2;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Ice cyan gradient sphere
    const grad = ctx.createRadialGradient(center - 12, center - 12, 4, center, center, 40);
    grad.addColorStop(0, '#e0f7fa');
    grad.addColorStop(0.5, '#4dd0e1');
    grad.addColorStop(1, '#00838f');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(center, center, 38, 0, Math.PI * 2);
    ctx.fill();

    // Snowflake crystal facet lines
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    for (let i = 0; i < 6; i++) {
      const ang = (i * Math.PI) / 3;
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(center + Math.cos(ang) * 32, center + Math.sin(ang) * 32);
      ctx.stroke();
    }

    // Specular icy glint
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(center - 12, center - 12, 5, 0, Math.PI * 2);
    ctx.fill();

    this.textures.addCanvas('fruit_frost', canvas);

    const makeHalf = (isLeft: boolean): HTMLCanvasElement => {
      const c = document.createElement('canvas');
      c.width = size;
      c.height = size;
      const x = c.getContext('2d')!;
      x.save();
      x.translate(center, center);
      if (!isLeft) x.scale(-1, 1);

      x.beginPath();
      x.arc(0, 0, 38, Math.PI / 2, -Math.PI / 2);
      x.closePath();
      x.fillStyle = '#00838f';
      x.fill();

      x.beginPath();
      x.arc(0, 0, 33, Math.PI / 2, -Math.PI / 2);
      x.closePath();
      x.fillStyle = '#b2ebf2';
      x.fill();

      // Crystalline core
      x.fillStyle = '#ffffff';
      x.beginPath();
      x.arc(-6, 0, 8, 0, Math.PI * 2);
      x.fill();

      x.restore();
      return c;
    };

    this.textures.addCanvas('fruit_frost_half_left', makeHalf(true));
    this.textures.addCanvas('fruit_frost_half_right', makeHalf(false));
  }

  // --- DRAGON FRUIT (Special: Fruit Frenzy) ---
  private generateFrenzyTextures(): void {
    const size = 96;
    const center = size / 2;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Vibrant Magenta sphere
    const grad = ctx.createRadialGradient(center - 10, center - 10, 4, center, center, 40);
    grad.addColorStop(0, '#ff4081');
    grad.addColorStop(0.6, '#d500f9');
    grad.addColorStop(1, '#880e4f');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(center, center, 38, 0, Math.PI * 2);
    ctx.fill();

    // Spiky lime green scales
    ctx.fillStyle = '#76ff03';
    for (let i = 0; i < 7; i++) {
      const ang = (i * Math.PI * 2) / 7;
      const sx = center + Math.cos(ang) * 36;
      const sy = center + Math.sin(ang) * 36;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(center + Math.cos(ang) * 44, center + Math.sin(ang) * 44);
      ctx.lineTo(sx + 5, sy + 5);
      ctx.fill();
    }

    this.textures.addCanvas('fruit_frenzy', canvas);

    const makeHalf = (isLeft: boolean): HTMLCanvasElement => {
      const c = document.createElement('canvas');
      c.width = size;
      c.height = size;
      const x = c.getContext('2d')!;
      x.save();
      x.translate(center, center);
      if (!isLeft) x.scale(-1, 1);

      x.beginPath();
      x.arc(0, 0, 38, Math.PI / 2, -Math.PI / 2);
      x.closePath();
      x.fillStyle = '#d500f9';
      x.fill();

      // White seeded flesh
      x.beginPath();
      x.arc(0, 0, 32, Math.PI / 2, -Math.PI / 2);
      x.closePath();
      x.fillStyle = '#ffffff';
      x.fill();

      // Black speckled seeds
      x.fillStyle = '#212121';
      for (let i = 0; i < 12; i++) {
        const rx = -5 - Math.random() * 22;
        const ry = (Math.random() - 0.5) * 45;
        x.beginPath();
        x.arc(rx, ry, 1.6, 0, Math.PI * 2);
        x.fill();
      }

      x.restore();
      return c;
    };

    this.textures.addCanvas('fruit_frenzy_half_left', makeHalf(true));
    this.textures.addCanvas('fruit_frenzy_half_right', makeHalf(false));
  }

  // --- STAR FRUIT (Special: Double Points) ---
  private generateStarTextures(): void {
    const size = 90;
    const center = size / 2;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // 5-point star
    ctx.fillStyle = '#ffd600';
    ctx.strokeStyle = '#ff6d00';
    ctx.lineWidth = 3;

    ctx.beginPath();
    const points = 5;
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? 38 : 18;
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const x = center + Math.cos(angle) * r;
      const y = center + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Star shiny core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(center - 5, center - 5, 4, 0, Math.PI * 2);
    ctx.fill();

    this.textures.addCanvas('fruit_star', canvas);

    const makeHalf = (isLeft: boolean): HTMLCanvasElement => {
      const c = document.createElement('canvas');
      c.width = size;
      c.height = size;
      const x = c.getContext('2d')!;
      x.save();
      x.translate(center, center);
      if (!isLeft) x.scale(-1, 1);

      x.beginPath();
      x.arc(0, 0, 36, Math.PI / 2, -Math.PI / 2);
      x.closePath();
      x.fillStyle = '#ffd600';
      x.fill();

      x.beginPath();
      x.arc(0, 0, 28, Math.PI / 2, -Math.PI / 2);
      x.closePath();
      x.fillStyle = '#fffde7';
      x.fill();

      x.restore();
      return c;
    };

    this.textures.addCanvas('fruit_star_half_left', makeHalf(true));
    this.textures.addCanvas('fruit_star_half_right', makeHalf(false));
  }

  // --- BLADE SPARK ---
  private generateBladeSparkTexture(): void {
    const canvas = document.createElement('canvas');
    canvas.width = 24;
    canvas.height = 24;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#ffffff';
    // 4-point spark star
    ctx.beginPath();
    ctx.moveTo(12, 1);
    ctx.lineTo(14, 10);
    ctx.lineTo(23, 12);
    ctx.lineTo(14, 14);
    ctx.lineTo(12, 23);
    ctx.lineTo(10, 14);
    ctx.lineTo(1, 12);
    ctx.lineTo(10, 10);
    ctx.closePath();
    ctx.fill();

    this.textures.addCanvas('blade_spark', canvas);
  }
}

