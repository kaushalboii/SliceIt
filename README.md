<div align="center">

# 🍉 SLICE IT!
### Premium Arcade Fruit Slicing Experience

[![Play Live](https://img.shields.io/badge/PLAY_LIVE-GitHub_Pages-00f0ff?style=for-the-badge&logo=github)](https://kaushalboii.github.io/SliceIt/)
[![Phaser 3](https://img.shields.io/badge/Phaser-3.88.2-ff007f?style=for-the-badge&logo=phaser)](https://phaser.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-00e676?style=for-the-badge)](LICENSE)

**[👉 Click Here to Play SLICE IT! Live in Your Browser](https://kaushalboii.github.io/SliceIt/)**

---

</div>

## 🌟 Overview

**SLICE IT!** is a high-octane, responsive HTML5 arcade fruit slicing game built with **Phaser 3**, **TypeScript**, and **Vite**. 

Inspired by the golden era of arcade touch classics, it features **100% procedurally rendered canvas graphics** (zero missing asset links), fluid physics-based fruit splitting, organic wet-cut sound synthesis, an interactive blade arsenal, and real-time multi-fruit combo tracking.

---

## 🎮 Key Features

### ⚔️ Interactive Blade Arsenal
Switch between 4 high-fidelity blade skins in real time via the HUD or Start Menu:
* ⚡ **Cyber Katana**: Electric cyan plasma trail with high-voltage spark particles.
* 🔥 **Flame Edge**: Molten orange-crimson blaze with floating fiery embers.
* 🌿 **Jade Dragon**: Vibrant emerald katana aura with leaf-petal spark bursts.
* 🌈 **Prism Rainbow**: Dynamically shifting HSL rainbow spectrum trail.

### 🍉 Physics Fruit Slicing & Halving
* Fruits launch on parabolic trajectories with randomized spin and velocity.
* Swift swipes split fruits along the exact cut angle into two independent rotating halves.
* Halves separate along the normal vector with realistic angular momentum and gravity.

### 💥 Multi-Fruit Combo Multiplier
Cut multiple fruits in a single blade stroke or within a 300ms chain to trigger combo bonuses:
| Combo | Title | Bonus Points | Special Effect |
| :---: | :---: | :---: | :---: |
| **2x** | **DOUBLE SLICE!** | `+2 pts` | Emerald green banner & chime |
| **3x** | **COMBO x3!** | `+3 pts` | Cyan banner + Golden blade flare |
| **4x** | **GREAT COMBO x4!** | `+8 pts` | Electric yellow flare + Spark burst |
| **5x** | **MEGA COMBO x5!** | `+15 pts` | Magenta blast + Dual chord chime |
| **6x+** | **UNSTOPPABLE!** | `+25 pts` | Crimson storm + Screen pulse |

### 🔥 Slice Streak Milestones
Keep slicing without dropping fruits or hitting bombs to build your **Streak Counter**:
* `🔥 10 STREAK!` — Flame burst
* `⚡ 25 MEGA STREAK!` — Electric surge
* `👑 50 GODLIKE!` — Golden crown milestone

### 🔊 Organic Sound Design
* **Natural Blade Swoosh**: Aerodynamic brownian air whoosh that responds to swipe speed.
* **Wet Slicing Splatter**: Crisp metallic transient cut combined with frequency-modulated wet pulp squelch.
* **Harmonic Crystal Chimes**: Pentatonic bell chords for combo chains.
* **No Annoying Loops**: Zero repetitive background synth music—pure focused arcade cutting satisfaction.
* **Instant Mute Toggle**: Dedicated `🔊 / 🔇` button that remembers your preference in `localStorage`.

### 🖥️ True Fullscreen & Cross-Platform
* **Edge-to-Edge Responsive**: Automatically scales to 100% of your viewport on laptops, 4K monitors, iPads, and mobile phones.
* **1-Click Native Fullscreen (`⛶`)**: Expand to full display with no letterboxing or black margins.
* **Multi-Touch Support**: Play with multiple fingers simultaneously on touch devices.

---

## 🍉 Fruit Roster

| Fruit | Base Points | Juice Splatter Color | Cut Characteristics |
| :--- | :---: | :---: | :--- |
| **Watermelon** | 1 pt | Ruby Red (`#e53935`) | Deep watery thud, thick green rind, black seeds |
| **Orange** | 1 pt | Bright Orange (`#ff9800`) | Zesty citrus pop, segmented interior |
| **Apple** | 1 pt | Crimson Red (`#ff5252`) | Crunchy snap, pale yellow flesh, brown core |
| **Pineapple** | 2 pts | Golden Yellow (`#ffeb3b`) | Fibrous yellow flesh, leafy crown |
| **Kiwi** | 2 pts | Emerald Lime (`#7cb342`) | Cream core, concentric black seed rings |
| **Strawberry** | 2 pts | Ruby Pink (`#ff4081`) | Soft splash, starry pink interior, green calyx |
| **Black Bomb** | ⚠️ Hazard | Explosion | Sparks fuse, screen flash, instant death / penalty |

---

## 🕹️ Game Modes

1. **CLASSIC MODE**
   * 3 lives (`✖✖✖`).
   * Dropping an unsliced fruit past the bottom costs 1 life.
   * Slicing a bomb results in an immediate **GAME OVER**!
   * Recommended for competitive high-score chasers.

2. **ZEN MODE**
   * Relaxed 90-second slicing meditation.
   * Zero bombs and no lives lost for dropped fruits.
   * Maximized for continuous combos and juicy slicing flow.

3. **TIME ATTACK MODE**
   * 60-second speedrun blitz!
   * High-density fruit waves.
   * Slicing bombs deducts 10 seconds and 10 points instead of instant death.

---

## 🕹️ Controls

| Action | Desktop (Mouse) | Mobile / Tablet (Touch) |
| :--- | :--- | :--- |
| **Slice Fruit** | Click & Drag across fruits | Swipe across fruits |
| **Select Game Mode** | Slice the mode fruit on the start menu | Slice the mode fruit |
| **Switch Blade Skin** | Click `🗡️ BLADE` button | Tap `🗡️ BLADE` button |
| **Toggle Fullscreen** | Click `⛶` button | Tap `⛶` button |
| **Mute / Unmute** | Click `🔊 / 🔇` icon | Tap `🔊 / 🔇` icon |
| **Pause Game** | Click `⏸` button | Tap `⏸` button |

---

## 🛠️ Project Structure

```
SliceIt/
├── .github/workflows/
│   └── deploy.yml          # GitHub Actions automated build & Pages deployment
├── src/
│   ├── audio/
│   │   └── SoundManager.ts # Web Audio API procedural sound engine
│   ├── config/
│   │   └── GameConfig.ts   # Fruit parameters, blade skins, modes, physics
│   ├── entities/
│   │   ├── BladeTrail.ts   # Glowing neon blade trail & segment intersection
│   │   ├── Bomb.ts         # Hazard bomb entity with fuse sparks & explosion
│   │   └── Fruit.ts        # Physics fruit entity & dual-half splitting
│   ├── scenes/
│   │   ├── BootScene.ts    # Procedural canvas vector graphics generator
│   │   ├── MenuScene.ts    # Interactive slice-to-play start menu & tips
│   │   ├── GameScene.ts    # Core gameplay loop, wave spawner, collisions
│   │   └── GameOverScene.ts# Game over stats summary & replay
│   ├── systems/
│   │   ├── ParticleManager.ts # Juice splatters, pulp bursts, combo banners
│   │   └── ScoreManager.ts    # Scoring, combo multipliers & streak tracking
│   ├── ui/
│   │   └── HUD.ts          # Score counter, lives crosses, blade switcher, controls
│   ├── main.ts             # Phaser 3 game initialization & resize config
│   └── style.css           # Edge-to-edge fullscreen interface stylesheet
├── index.html              # Entry HTML shell
├── package.json            # Project dependencies & deployment scripts
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite bundler configuration with relative base
```

---

## 🚀 Local Development Setup

### Prerequisites
* [Node.js](https://nodejs.org/) (version 18 or higher recommended)
* npm (bundled with Node.js)

### Installation
```bash
# 1. Clone the repository
git clone https://github.com/kaushalboii/SliceIt.git
cd SliceIt

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Open your browser to `http://localhost:5173/` to play.

### Build & Deploy
```bash
# Type check and build production bundle
npm run build

# Deploy directly to GitHub Pages
npm run deploy
```

---

## 📜 License
This project is open-source under the **MIT License**. Created with passion for web arcade gaming!
