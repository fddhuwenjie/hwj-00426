import { EnemyType } from './types';
import { GAME_CONFIG } from './config';

export class WaveManager {
  private currentWave: number = 0;
  private waveStartTime: number = 0;
  private isBreak: boolean = false;
  private breakStartTime: number = 0;
  private enemiesSpawned: number = 0;
  private totalEnemiesThisWave: number = 0;
  private lastSpawnTime: number = 0;

  constructor() {}

  public startWave(waveNumber: number): void {
    this.currentWave = waveNumber;
    this.waveStartTime = Date.now();
    this.isBreak = false;
    this.enemiesSpawned = 0;
    this.totalEnemiesThisWave = this.calculateTotalEnemies(waveNumber);
    this.lastSpawnTime = 0;
  }

  public startBreak(): void {
    this.isBreak = true;
    this.breakStartTime = Date.now();
  }

  public update(now: number): {
    shouldSpawn: boolean;
    enemyType: EnemyType | null;
    isWaveComplete: boolean;
    isBreakComplete: boolean;
  } {
    const result = {
      shouldSpawn: false,
      enemyType: null as EnemyType | null,
      isWaveComplete: false,
      isBreakComplete: false,
    };

    if (this.isBreak) {
      if (now - this.breakStartTime > GAME_CONFIG.WAVE_BREAK_DURATION) {
        result.isBreakComplete = true;
      }
      return result;
    }

    const waveElapsed = now - this.waveStartTime;
    if (waveElapsed > GAME_CONFIG.WAVE_DURATION) {
      result.isWaveComplete = true;
      return result;
    }

    if (this.enemiesSpawned < this.totalEnemiesThisWave) {
      const spawnInterval = this.calculateSpawnInterval();
      if (now - this.lastSpawnTime > spawnInterval) {
        result.shouldSpawn = true;
        result.enemyType = this.getEnemyTypeToSpawn();
        this.lastSpawnTime = now;
        this.enemiesSpawned++;
      }
    }

    return result;
  }

  private calculateTotalEnemies(wave: number): number {
    const baseEnemies = 5;
    const increasePerWave = 2;
    return baseEnemies + (wave - 1) * increasePerWave;
  }

  private calculateSpawnInterval(): number {
    const baseInterval = 2000;
    const minInterval = 500;
    const reduction = (this.currentWave - 1) * 100;
    return Math.max(minInterval, baseInterval - reduction);
  }

  private getEnemyTypeToSpawn(): EnemyType {
    if (this.currentWave % GAME_CONFIG.BOSS_WAVE_INTERVAL === 0 && 
        this.enemiesSpawned === this.totalEnemiesThisWave - 1) {
      return 'boss';
    }

    const rand = Math.random();
    if (this.currentWave >= 3 && rand < 0.3) {
      return 'medium';
    }
    return 'small';
  }

  public getCurrentWave(): number {
    return this.currentWave;
  }

  public getTotalEnemiesThisWave(): number {
    return this.totalEnemiesThisWave;
  }

  public getEnemiesSpawned(): number {
    return this.enemiesSpawned;
  }

  public getRemainingTimeInWave(now: number): number {
    if (this.isBreak) {
      return Math.max(0, GAME_CONFIG.WAVE_BREAK_DURATION - (now - this.breakStartTime));
    }
    return Math.max(0, GAME_CONFIG.WAVE_DURATION - (now - this.waveStartTime));
  }

  public getIsBreak(): boolean {
    return this.isBreak;
  }

  public reset(): void {
    this.currentWave = 0;
    this.waveStartTime = 0;
    this.isBreak = false;
    this.breakStartTime = 0;
    this.enemiesSpawned = 0;
    this.totalEnemiesThisWave = 0;
    this.lastSpawnTime = 0;
  }
}
