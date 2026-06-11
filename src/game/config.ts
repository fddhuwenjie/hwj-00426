import { EnemyConfig, WeaponType, AchievementId } from './types';

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

  MISSILE_COOLDOWN: 5000,
  MISSILE_SPEED: 0.5,
  MISSILE_TRACKING_STRENGTH: 0.05,
  SCATTER_BULLET_COUNT: 5,
  SCATTER_SPREAD_ANGLE: 0.3,
  SCATTER_DAMAGE: 0.5,
  LASER_DAMAGE: 1,
  MISSILE_DAMAGE: 3,

  MAX_ENERGY: 100,
  ENERGY_PER_KILL_SMALL: 5,
  ENERGY_PER_KILL_MEDIUM: 10,
  ENERGY_PER_KILL_BOSS: 25,
};

export const WEAPON_CONFIGS: Record<WeaponType, { name: string; key: string; color: string }> = {
  laser: { name: '激光', key: '1', color: 'cyan' },
  missile: { name: '导弹', key: '2', color: 'orange' },
  scatter: { name: '散射炮', key: '3', color: 'green' },
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

export const ACHIEVEMENT_DEFINITIONS: Record<AchievementId, { name: string; description: string; icon: string }> = {
  first_kill: {
    name: '首次击杀',
    description: '击败你的第一个敌人',
    icon: '🎯',
  },
  kill_streak_10: {
    name: '连杀达人',
    description: '连续击杀10个敌人而不被击中',
    icon: '🔥',
  },
  first_boss: {
    name: 'Boss终结者',
    description: '击败第一个Boss',
    icon: '👑',
  },
  score_5000: {
    name: '高分选手',
    description: '单局得分超过5000',
    icon: '⭐',
  },
  collect_all_powerups: {
    name: '道具收藏家',
    description: '一局中收集所有4种道具',
    icon: '💎',
  },
  survive_5_waves: {
    name: '幸存者',
    description: '存活超过5波',
    icon: '🛡️',
  },
  multi_kill_3: {
    name: '一发入魂',
    description: '一发子弹击杀3个敌人',
    icon: '💥',
  },
  full_hp_wave: {
    name: '毫发无损',
    description: '满血通过一波',
    icon: '❤️',
  },
  ulti_kill_5: {
    name: '毁天灭地',
    description: '使用终极技能击杀5个以上敌人',
    icon: '☄️',
  },
  total_kills_100: {
    name: '百人斩',
    description: '累计击杀100个敌人',
    icon: '🏆',
  },
};
