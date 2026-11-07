import { GameMode, GAME_CONSTANTS } from '../config/GameConfig';
import { SoundManager } from '../audio/SoundManager';
import { ParticleManager } from './ParticleManager';

export class ScoreManager {
  private mode: GameMode;
  private currentScore: number = 0;
  private currentCombo: number = 0;
  private sliceStreak: number = 0;
  private lastSliceTime: number = 0;
  private particleManager: ParticleManager;
  private onScoreChanged?: (score: number) => void;
  private onStreakChanged?: (streak: number) => void;
  private onComboTriggered?: (comboCount: number, bonus: number) => void;

  constructor(
    mode: GameMode,
    particleManager: ParticleManager,
    callbacks?: {
      onScoreChanged?: (score: number) => void;
      onStreakChanged?: (streak: number) => void;
      onComboTriggered?: (comboCount: number, bonus: number) => void;
    }
  ) {
    this.mode = mode;
    this.particleManager = particleManager;
    this.onScoreChanged = callbacks?.onScoreChanged;
    this.onStreakChanged = callbacks?.onStreakChanged;
    this.onComboTriggered = callbacks?.onComboTriggered;
  }

  public addFruitSlice(basePoints: number, x: number, y: number, time: number): void {
    const isCombo = time - this.lastSliceTime <= GAME_CONSTANTS.COMBO_WINDOW_MS;

    if (isCombo) {
      this.currentCombo++;
    } else {
      this.finalizeCombo(x, y);
      this.currentCombo = 1;
    }

    this.sliceStreak++;
    this.lastSliceTime = time;
    this.currentScore += basePoints;

    this.particleManager.showScorePopup(x, y, `+${basePoints}`);

    // Streak milestone celebrations
    if (this.sliceStreak === 10) {
      this.particleManager.showScorePopup(x, y - 40, '🔥 10 STREAK!', '#ff9100');
    } else if (this.sliceStreak === 25) {
      this.particleManager.showScorePopup(x, y - 40, '⚡ 25 MEGA STREAK!', '#00e5ff');
    } else if (this.sliceStreak === 50) {
      this.particleManager.showScorePopup(x, y - 40, '👑 50 GODLIKE!', '#ffd600');
    }

    if (this.onStreakChanged) {
      this.onStreakChanged(this.sliceStreak);
    }

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

  public forceEndStroke(lastSliceX: number, lastSliceY: number): void {
    if (this.currentCombo > 1) {
      this.finalizeCombo(lastSliceX, lastSliceY);
      this.currentCombo = 0;
    }
  }

  public resetStreak(): void {
    this.sliceStreak = 0;
    if (this.onStreakChanged) {
      this.onStreakChanged(this.sliceStreak);
    }
  }

  private finalizeCombo(x: number, y: number): void {
    if (this.currentCombo >= 2) {
      const bonusMap: Record<number, number> = {
        2: 2,
        3: 3,
        4: 8,
        5: 15,
        6: 25
      };
      const bonus = bonusMap[Math.min(this.currentCombo, 6)] || this.currentCombo * 4;
      this.currentScore += bonus;

      SoundManager.getInstance().playCombo(this.currentCombo);
      this.particleManager.showComboBanner(x, y, this.currentCombo, bonus);

      if (this.onComboTriggered) {
        this.onComboTriggered(this.currentCombo, bonus);
      }

      if (this.onScoreChanged) {
        this.onScoreChanged(this.currentScore);
      }
    }
  }

  public deductPoints(amount: number): void {
    this.currentScore = Math.max(0, this.currentScore - amount);
    this.resetStreak();
    if (this.onScoreChanged) {
      this.onScoreChanged(this.currentScore);
    }
  }

  public getScore(): number {
    return this.currentScore;
  }

  public getStreak(): number {
    return this.sliceStreak;
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
