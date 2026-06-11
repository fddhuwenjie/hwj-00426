import { EnemyConfig } from './types';

export const GAME_CONFIG = {
  PLAYER_SPEED: 0.15,
  PLAYER_BOUNDARY_X: 12,
  PLAYER_BOUNDARY_Y: 8,
  SHOOT_COOLDOWN: 200,
  SHOOT_COOLDOWN_BOOSTED: 100,
  BULLET_SPEED: 0.8,
  ENEMY_BULLET_SPEED: 0.4,
  WAVE_DURATION: 30000,
  WAVE_BREAK_DURATION: 5000,
  BOSS_WAVE_INTERVAL: 5,
  POWER_UP_DURATION: 10000,
  POWER_UP_DROP_CHANCE: 0.3,
  PLAYER_MAX_HP: 3,
  SCORE_SMALL: 100,
  SCORE_MEDIUM: 300,
  SCORE_BOSS: 1000,
  CAMERA_DISTANCE: 12,
  CAMERA_HEIGHT: 6,
  FIELD_DEPTH: 50,
};

export const ENEMY_CONFIGS: Record<string, EnemyConfig> = {
  small: {
    type: 'small',
    hp: 1,
    speed: 0.06,
    score: 100,
    scale: 0.6,
    hasShield: false,
    color: 0xff3366,
    fireRate: 3000,
  },
  medium: {
    type: 'medium',
    hp: 2,
    speed: 0.04,
    score: 300,
    scale: 1,
    hasShield: false,
    color: 0x9933ff,
    fireRate: 2500,
  },
  boss: {
    type: 'boss',
    hp: 5,
    speed: 0.02,
    score: 1000,
    scale: 2,
    hasShield: true,
    color: 0xff6600,
    fireRate: 1500,
  },
};

export const POWER_UP_COLORS: Record<string, number> = {
  health: 0xff3366,
  fireRate: 0xffcc00,
  shield: 0x0099ff,
  scatter: 0x00ff66,
};
