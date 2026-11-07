# 🍉 SLICE IT! - Arcade Fruit Slicing Game

A vibrant, juicy fruit-slicing arcade game built with **Phaser 3**, **TypeScript**, and **Vite**.

![Slice It Game](https://img.shields.io/badge/SLICE_IT!-Phaser_3-00f0ff?style=for-the-badge&logo=html5)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite)

## 🎮 Play Online
👉 **[Play SLICE IT! on GitHub Pages](https://kaushalboii.github.io/SliceIt/)**

---

## 🌟 Features
* **Slice-to-Select Start Screen**: Slice floating mode fruits directly on screen to start!
* **Neon Blade Trail**: Dynamic glow trails with speed velocity thresholds and multi-touch support.
* **6 Detailed Fruits**: Watermelon, Orange, Apple, Pineapple, Kiwi, and Strawberry.
* **Physics & Halving Mechanics**: Whole fruits slice cleanly into two spinning halves that separate along the slice angle normal.
* **Juicy Particle Effects**: Wall-splattering juice that slowly fades, pulp droplets, seed bursts, and floating score/combo popups.
* **Hazard Bombs**: Bombs with animated sparking fuses, hiss audio, and explosive detonation FX.
* **3 Game Modes**:
  * **Classic Mode**: 3 lives (`✖✖✖`), occasional bombs, drop penalties.
  * **Zen Mode**: 90-second peaceful slice spree without bombs or life penalties.
  * **Time Attack**: 60-second speedrun blitz! Bombs penalize time and score.
* **100% Procedural Web Audio**: Swooshes, squelches, fuse tick, explosion rumble, combo pentatonic chimes, and an arcade background groove with mute toggle.
* **High Score Tracking**: Best scores saved locally via `localStorage` for each mode.

---

## 🛠️ Local Development

```bash
# Clone the repository
git clone https://github.com/kaushalboii/SliceIt.git
cd SliceIt

# Install dependencies
npm install

# Start the dev server
npm run dev

# Build for production
npm run build
```

