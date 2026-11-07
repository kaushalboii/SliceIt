import { GameMode, GAME_CONSTANTS } from '../config/GameConfig';
import { SoundManager } from '../audio/SoundManager';
import { ParticleManager } from './ParticleManager';

export class ScoreManager {
  private mode: GameMode;
  private currentScore: number = 0;
  private currentCombo: number = 0;
  private lastSliceTime: number = 0;
  private particleManager: ParticleManager;
  private onScoreChanged?: (score: number) => void;

  constructor(mode: GameMode, particleManager: ParticleManager, onScoreChanged?: (score: number) => void) {
    this.mode = mode;
    this.particleManager = particleManager;
    this.onScoreChanged = onScoreChanged;
  }

  public addFruitSlice(basePoints: number, x: number, y: number, time: number): void {
    const isCombo = time - this.lastSliceTime <= GAME_CONSTANTS.COMBO_WINDOW_MS;

    if (isCombo) {
      this.currentCombo++;
    } else {
      this.finalizeCombo(x, y);
      this.currentCombo = 1;
    }

    this.lastSliceTime = time;
    this.currentScore += basePoints;

    this.particleManager.showScorePopup(x, y, `+${basePoints}`);

    if (this.onScoreChanged) {
      this.onScoreChanged(this.currentScore);
    }
  }

  public update(time: number, lastSliceX: number, lastSliceY: number): void {
    if (this.currentCombo > 1 && time - this.lastSliceTime > GAME_CONSTANTS.COMBO_WINDOW_MS) {
      this.finalizeCombo(lastSliceX, lastSliceY);
      this.currentCombo = 0;
    }
  }

  private finalizeCombo(x: number, y: number): void {
    if (this.currentCombo >= 3) {
      const bonusMap: Record<number, number> = {
        3: 3,
        4: 8,
        5: 15,
        6: 25
      };
      const bonus = bonusMap[Math.min(this.currentCombo, 6)] || this.currentCombo * 4;
      this.currentScore += bonus;

      SoundManager.getInstance().playCombo(this.currentCombo);
      this.particleManager.showComboBanner(x, y, this.currentCombo, bonus);

      if (this.onScoreChanged) {
        this.onScoreChanged(this.currentScore);
      }
    }
  }

  public deductPoints(amount: number): void {
    this.currentScore = Math.max(0, this.currentScore - amount);
    if (this.onScoreChanged) {
      this.onScoreChanged(this.currentScore);
    }
  }

  public getScore(): number {
    return this.currentScore;
  }

  public getBestScore(): number {
    const saved = localStorage.getItem(`slice_it_best_${this.mode}`);
    return saved ? parseInt(saved, 10) : 0;
  }

  public saveIfBest(): boolean {
    const best = this.getBestScore();
    if (this.currentScore > best) {
      localStorage.setItem(`slice_it_best_${this.mode}`, String(this.currentScore));
      return true;
    }
    return false;
  }
}

