import { create } from 'zustand';
import {
  GameStore,
  GameState,
  PlayerState,
  WeaponType,
  AchievementId,
  Achievement,
  ScreenEffect,
  AchievementToast,
  PowerUpType,
  MinimapEnemy,
  MinimapPowerUp,
  ScreenEdgeIndicator,
} from '../game/types';
import {
  getHighScore,
  setHighScore,
  getAchievements,
  saveAchievement,
  isAchievementUnlocked,
  getLeaderboard,
  addLeaderboardEntry,
  addTotalKills,
} from '../utils/storage';
import { GAME_CONFIG, ACHIEVEMENT_DEFINITIONS } from '../game/config';

const initialPlayerState: PlayerState = {
  hp: GAME_CONFIG.PLAYER_MAX_HP,
  maxHp: GAME_CONFIG.PLAYER_MAX_HP,
  hasShield: false,
  fireRateBoost: false,
  scatterBoost: false,
  fireRateEndTime: 0,
  scatterEndTime: 0,
  currentWeapon: 'laser',
  missileCooldownEndTime: 0,
  energy: 0,
  maxEnergy: GAME_CONFIG.MAX_ENERGY,
};

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: 'start' as GameState,
  score: 0,
  highScore: getHighScore(),
  wave: 0,
  enemiesRemaining: 0,
  waveTimer: 0,
  isWaveBreak: false,
  player: { ...initialPlayerState },
  screenEffect: null,
  achievementToasts: [],
  bossWarning: false,
  collectedPowerUps: [],
  killStreak: 0,
  totalKills: 0,
  ultiKillCount: 0,
  waveStartHp: GAME_CONFIG.PLAYER_MAX_HP,
  bulletKillMap: {},
  playerPosition: { x: 0, y: 0 },
  minimapEnemies: [],
  minimapPowerUps: [],
  screenEdgeIndicators: [],

  setGameState: (state: GameState) => {
    const { score, highScore } = get();
    if (state === 'gameover') {
      if (score > highScore) {
        setHighScore(score);
        set({ highScore: score });
      }
    }
    set({ gameState: state });
  },

  addScore: (points: number) => {
    set((state) => {
      const newScore = state.score + points;
      if (newScore >= 5000 && !isAchievementUnlocked('score_5000')) {
        setTimeout(() => get().unlockAchievement('score_5000'), 0);
      }
      return { score: newScore };
    });
  },

  setWave: (wave: number) => set({ wave }),
  setEnemiesRemaining: (count: number) => set({ enemiesRemaining: count }),
  setWaveTimer: (timer: number) => set({ waveTimer: timer }),
  setIsWaveBreak: (isBreak: boolean) => set({ isWaveBreak: isBreak }),

  resetGame: () => {
    set({
      score: 0,
      wave: 0,
      enemiesRemaining: 0,
      waveTimer: 0,
      isWaveBreak: false,
      player: { ...initialPlayerState },
      screenEffect: null,
      achievementToasts: [],
      bossWarning: false,
      collectedPowerUps: [],
      killStreak: 0,
      totalKills: 0,
      ultiKillCount: 0,
      waveStartHp: GAME_CONFIG.PLAYER_MAX_HP,
      bulletKillMap: {},
      playerPosition: { x: 0, y: 0 },
      minimapEnemies: [],
      minimapPowerUps: [],
      screenEdgeIndicators: [],
    });
  },

  updatePlayer: (playerUpdate: Partial<PlayerState>) => {
    set((state) => ({
      player: { ...state.player, ...playerUpdate },
    }));
  },

  setHighScore: (score: number) => {
    setHighScore(score);
    set({ highScore: score });
  },

  setCurrentWeapon: (weapon: WeaponType) => {
    set((state) => ({
      player: { ...state.player, currentWeapon: weapon },
    }));
  },

  fireMissile: (): boolean => {
    const state = get();
    const now = Date.now();
    if (now < state.player.missileCooldownEndTime) return false;
    set((s) => ({
      player: {
        ...s.player,
        missileCooldownEndTime: now + GAME_CONFIG.MISSILE_COOLDOWN,
      },
    }));
    return true;
  },

  addEnergy: (amount: number) => {
    set((state) => ({
      player: {
        ...state.player,
        energy: Math.min(state.player.maxEnergy, state.player.energy + amount),
      },
    }));
  },

  consumeEnergy: (): boolean => {
    const state = get();
    if (state.player.energy < state.player.maxEnergy) return false;
    set((s) => ({
      player: { ...s.player, energy: 0 },
    }));
    return true;
  },

  setScreenEffect: (effect: ScreenEffect | null) => {
    set({ screenEffect: effect });
  },

  pushAchievementToast: (achievement: Achievement) => {
    const toast: AchievementToast = {
      id: `toast_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      achievement,
      startTime: Date.now(),
    };
    set((state) => ({
      achievementToasts: [...state.achievementToasts, toast],
    }));
    setTimeout(() => {
      get().removeAchievementToast(toast.id);
    }, 3000);
  },

  removeAchievementToast: (id: string) => {
    set((state) => ({
      achievementToasts: state.achievementToasts.filter((t) => t.id !== id),
    }));
  },

  setBossWarning: (show: boolean) => {
    set({ bossWarning: show });
  },

  registerKill: (isMultiKill?: boolean, bulletId?: string) => {
    void isMultiKill;
    void bulletId;
    set((state) => {
      const newKillStreak = state.killStreak + 1;
      const newTotalKills = state.totalKills + 1;

      if (newTotalKills === 1 && !isAchievementUnlocked('first_kill')) {
        setTimeout(() => get().unlockAchievement('first_kill'), 0);
      }
      if (newKillStreak >= 10 && !isAchievementUnlocked('kill_streak_10')) {
        setTimeout(() => get().unlockAchievement('kill_streak_10'), 0);
      }

      const persistedTotal = addTotalKills(1);
      if (persistedTotal >= 100 && !isAchievementUnlocked('total_kills_100')) {
        setTimeout(() => get().unlockAchievement('total_kills_100'), 0);
      }

      return {
        killStreak: newKillStreak,
        totalKills: newTotalKills,
      };
    });
  },

  registerHit: () => {
    set({ killStreak: 0 });
  },

  registerPowerUpCollected: (type: PowerUpType) => {
    set((state) => {
      const exists = state.collectedPowerUps.includes(type);
      const newCollected = exists
        ? state.collectedPowerUps
        : [...state.collectedPowerUps, type];

      if (
        newCollected.length >= 4 &&
        !isAchievementUnlocked('collect_all_powerups')
      ) {
        setTimeout(() => get().unlockAchievement('collect_all_powerups'), 0);
      }

      return { collectedPowerUps: newCollected };
    });
  },

  registerBossDefeated: () => {
    if (!isAchievementUnlocked('first_boss')) {
      get().unlockAchievement('first_boss');
    }
  },

  registerWaveComplete: () => {
    const state = get();
    if (state.wave >= 5 && !isAchievementUnlocked('survive_5_waves')) {
      setTimeout(() => get().unlockAchievement('survive_5_waves'), 0);
    }
    if (
      state.player.hp === state.player.maxHp &&
      state.waveStartHp === state.player.maxHp &&
      !isAchievementUnlocked('full_hp_wave')
    ) {
      setTimeout(() => get().unlockAchievement('full_hp_wave'), 0);
    }
  },

  registerUltiKill: (count: number) => {
    set((state) => {
      if (count >= 5 && !isAchievementUnlocked('ulti_kill_5')) {
        setTimeout(() => get().unlockAchievement('ulti_kill_5'), 0);
      }
      return { ultiKillCount: state.ultiKillCount + count };
    });
  },

  setWaveStartHp: (hp: number) => {
    set({ waveStartHp: hp });
  },

  incrementBulletKill: (bulletId: string): number => {
    let newCount = 0;
    set((state) => {
      const current = state.bulletKillMap[bulletId] || 0;
      newCount = current + 1;
      if (newCount >= 3 && !isAchievementUnlocked('multi_kill_3')) {
        setTimeout(() => get().unlockAchievement('multi_kill_3'), 0);
      }
      return {
        bulletKillMap: { ...state.bulletKillMap, [bulletId]: newCount },
      };
    });
    return newCount;
  },

  unlockAchievement: (id: AchievementId) => {
    if (isAchievementUnlocked(id)) return;
    saveAchievement(id);
    const def = ACHIEVEMENT_DEFINITIONS[id];
    const achievement: Achievement = {
      id,
      name: def.name,
      description: def.description,
      icon: def.icon,
      unlocked: true,
      unlockedAt: Date.now(),
    };
    get().pushAchievementToast(achievement);
  },

  getAchievements: (): Achievement[] => {
    return getAchievements();
  },

  addLeaderboardEntry: (score: number, wave: number) => {
    addLeaderboardEntry(score, wave);
  },

  getLeaderboard: () => {
    return getLeaderboard();
  },

  updateMinimapData: (
    playerX: number,
    playerY: number,
    enemies: MinimapEnemy[],
    powerUps: MinimapPowerUp[],
    indicators: ScreenEdgeIndicator[]
  ) => {
    set({
      playerPosition: { x: playerX, y: playerY },
      minimapEnemies: enemies,
      minimapPowerUps: powerUps,
      screenEdgeIndicators: indicators,
    });
  },
}));
