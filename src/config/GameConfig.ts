export type GameMode = 'classic' | 'zen' | 'time';

export interface FruitConfig {
  type: string;
  name: string;
  radius: number;
  points: number;
  primaryColor: number;
  juiceColor: number;
  accentColor: number;
  textureWhole: string;
  textureHalfLeft: string;
  textureHalfRight: string;
  weight: number; // spawn probability weight
}

export const FRUIT_CONFIGS: Record<string, FruitConfig> = {
  watermelon: {
    type: 'watermelon',
    name: 'Watermelon',
    radius: 46,
    points: 1,
    primaryColor: 0x2e7d32,
    juiceColor: 0xe53935,
    accentColor: 0x81c784,
    textureWhole: 'fruit_watermelon',
    textureHalfLeft: 'fruit_watermelon_half_left',
    textureHalfRight: 'fruit_watermelon_half_right',
    weight: 25
  },
  orange: {
    type: 'orange',
    name: 'Orange',
    radius: 38,
    points: 1,
    primaryColor: 0xf57c00,
    juiceColor: 0xff9800,
    accentColor: 0xffe082,
    textureWhole: 'fruit_orange',
    textureHalfLeft: 'fruit_orange_half_left',
    textureHalfRight: 'fruit_orange_half_right',
    weight: 22
  },
  apple: {
    type: 'apple',
    name: 'Apple',
    radius: 36,
    points: 1,
    primaryColor: 0xd32f2f,
    juiceColor: 0xff5252,
    accentColor: 0xfff9c4,
    textureWhole: 'fruit_apple',
    textureHalfLeft: 'fruit_apple_half_left',
    textureHalfRight: 'fruit_apple_half_right',
    weight: 22
  },
  pineapple: {
    type: 'pineapple',
    name: 'Pineapple',
    radius: 44,
    points: 2,
    primaryColor: 0xfbc02d,
    juiceColor: 0xffeb3b,
    accentColor: 0x388e3c,
    textureWhole: 'fruit_pineapple',
    textureHalfLeft: 'fruit_pineapple_half_left',
    textureHalfRight: 'fruit_pineapple_half_right',
    weight: 15
  },
  kiwi: {
    type: 'kiwi',
    name: 'Kiwi',
    radius: 32,
    points: 2,
    primaryColor: 0x795548,
    juiceColor: 0x7cb342,
    accentColor: 0xaed581,
    textureWhole: 'fruit_kiwi',
    textureHalfLeft: 'fruit_kiwi_half_left',
    textureHalfRight: 'fruit_kiwi_half_right',
    weight: 18
  },
  strawberry: {
    type: 'strawberry',
    name: 'Strawberry',
    radius: 30,
    points: 2,
    primaryColor: 0xe91e63,
    juiceColor: 0xff4081,
    accentColor: 0x4caf50,
    textureWhole: 'fruit_strawberry',
    textureHalfLeft: 'fruit_strawberry_half_left',
    textureHalfRight: 'fruit_strawberry_half_right',
    weight: 20
  }
};

export const GAME_CONSTANTS = {
  CANVAS_WIDTH: 1000,
  CANVAS_HEIGHT: 650,
  GRAVITY: 800,
  BLADE_MIN_VELOCITY: 350, // Minimum cursor speed in px/s to register a slice
  BLADE_LIFETIME_MS: 160,
  CLASSIC_MAX_LIVES: 3,
  TIME_MODE_DURATION: 60,
  ZEN_MODE_DURATION: 90,
  COMBO_WINDOW_MS: 300,
  BASE_SPAWN_INTERVAL: 1800,
  MIN_SPAWN_INTERVAL: 900
};

