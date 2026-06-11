import * as THREE from 'three';

export type GameState = 'start' | 'playing' | 'gameover' | 'achievements' | 'leaderboard';

export type EnemyType = 'small' | 'medium' | 'boss';

export type PowerUpType = 'health' | 'fireRate' | 'shield' | 'scatter';

export type WeaponType = 'laser' | 'missile' | 'scatter';

export interface PlayerState {
  hp: number;
  maxHp: number;
  hasShield: boolean;
  fireRateBoost: boolean;
  scatterBoost: boolean;
  fireRateEndTime: number;
  scatterEndTime: number;
  currentWeapon: WeaponType;
  missileCooldownEndTime: number;
  energy: number;
  maxEnergy: number;
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
  mesh: THREE.Mesh | THREE.Group | THREE.Line;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  isPlayerBullet: boolean;
  damage: number;
  type: 'laser' | 'missile' | 'scatter' | 'enemy';
  targetId?: string;
  killCount?: number;
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
  isTrail?: boolean;
  parentId?: string;
}

export type AchievementId =
  | 'first_kill'
  | 'kill_streak_10'
  | 'first_boss'
  | 'score_5000'
  | 'collect_all_powerups'
  | 'survive_5_waves'
  | 'multi_kill_3'
  | 'full_hp_wave'
  | 'ulti_kill_5'
  | 'total_kills_100';

export interface Achievement {
  id: AchievementId;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
}

export interface LeaderboardEntry {
  id: string;
  score: number;
  wave: number;
  date: number;
}

export interface MinimapEnemy {
  id: string;
  x: number;
  y: number;
  type: EnemyType;
}

export interface MinimapPowerUp {
  id: string;
  x: number;
  y: number;
  type: PowerUpType;
}

export interface ScreenEdgeIndicator {
  id: string;
  angle: number;
  isBoss: boolean;
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
  screenEffect: ScreenEffect | null;
  achievementToasts: AchievementToast[];
  bossWarning: boolean;
  collectedPowerUps: PowerUpType[];
  killStreak: number;
  totalKills: number;
  ultiKillCount: number;
  waveStartHp: number;
  bulletKillMap: Record<string, number>;
  playerPosition: { x: number; y: number };
  minimapEnemies: MinimapEnemy[];
  minimapPowerUps: MinimapPowerUp[];
  screenEdgeIndicators: ScreenEdgeIndicator[];

  setGameState: (state: GameState) => void;
  addScore: (points: number) => void;
  setWave: (wave: number) => void;
  setEnemiesRemaining: (count: number) => void;
  setWaveTimer: (timer: number) => void;
  setIsWaveBreak: (isBreak: boolean) => void;
  resetGame: () => void;
  updatePlayer: (player: Partial<PlayerState>) => void;
  setHighScore: (score: number) => void;

  setCurrentWeapon: (weapon: WeaponType) => void;
  fireMissile: () => boolean;
  addEnergy: (amount: number) => void;
  consumeEnergy: () => boolean;

  setScreenEffect: (effect: ScreenEffect | null) => void;
  pushAchievementToast: (achievement: Achievement) => void;
  removeAchievementToast: (id: string) => void;
  setBossWarning: (show: boolean) => void;

  registerKill: (isMultiKill?: boolean, bulletId?: string) => void;
  registerHit: () => void;
  registerPowerUpCollected: (type: PowerUpType) => void;
  registerBossDefeated: () => void;
  registerWaveComplete: () => void;
  registerUltiKill: (count: number) => void;
  setWaveStartHp: (hp: number) => void;
  incrementBulletKill: (bulletId: string) => number;

  unlockAchievement: (id: AchievementId) => void;
  getAchievements: () => Achievement[];

  addLeaderboardEntry: (score: number, wave: number) => void;
  getLeaderboard: () => LeaderboardEntry[];

  updateMinimapData: (
    playerX: number,
    playerY: number,
    enemies: MinimapEnemy[],
    powerUps: MinimapPowerUp[],
    indicators: ScreenEdgeIndicator[]
  ) => void;
}

export interface ScreenEffect {
  type: 'flash_white' | 'shake' | 'flash_red' | 'warning';
  startTime: number;
  duration: number;
  intensity?: number;
}

export interface AchievementToast {
  id: string;
  achievement: Achievement;
  startTime: number;
}
