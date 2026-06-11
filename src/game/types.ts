import * as THREE from 'three';

export type GameState = 'start' | 'playing' | 'gameover';

export type EnemyType = 'small' | 'medium' | 'boss';

export type PowerUpType = 'health' | 'fireRate' | 'shield' | 'scatter';

export interface PlayerState {
  hp: number;
  maxHp: number;
  hasShield: boolean;
  fireRateBoost: boolean;
  scatterBoost: boolean;
  fireRateEndTime: number;
  scatterEndTime: number;
}

export interface EnemyConfig {
  type: EnemyType;
  hp: number;
  speed: number;
  score: number;
  scale: number;
  hasShield: boolean;
  color: number;
  fireRate: number;
}

export interface BulletData {
  id: string;
  mesh: THREE.Mesh | THREE.Line;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  isPlayerBullet: boolean;
}

export interface EnemyData {
  id: string;
  type: EnemyType;
  mesh: THREE.Group;
  hp: number;
  maxHp: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  hasShield: boolean;
  shieldMesh?: THREE.Mesh;
  lastShotTime: number;
  fireRate: number;
}

export interface PowerUpData {
  id: string;
  type: PowerUpType;
  mesh: THREE.Mesh;
  position: THREE.Vector3;
}

export interface ParticleData {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
}

export interface GameStore {
  gameState: GameState;
  score: number;
  highScore: number;
  wave: number;
  enemiesRemaining: number;
  waveTimer: number;
  isWaveBreak: boolean;
  player: PlayerState;
  setGameState: (state: GameState) => void;
  addScore: (points: number) => void;
  setWave: (wave: number) => void;
  setEnemiesRemaining: (count: number) => void;
  setWaveTimer: (timer: number) => void;
  setIsWaveBreak: (isBreak: boolean) => void;
  resetGame: () => void;
  updatePlayer: (player: Partial<PlayerState>) => void;
  setHighScore: (score: number) => void;
}
