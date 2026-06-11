import { Achievement, LeaderboardEntry, AchievementId } from '../game/types';
import { ACHIEVEMENT_DEFINITIONS } from '../game/config';

const HIGH_SCORE_KEY = 'space_shooter_high_score';
const ACHIEVEMENTS_KEY = 'space_shooter_achievements';
const LEADERBOARD_KEY = 'space_shooter_leaderboard';
const TOTAL_KILLS_KEY = 'space_shooter_total_kills';

export const getHighScore = (): number => {
  try {
    const stored = localStorage.getItem(HIGH_SCORE_KEY);
    return stored ? parseInt(stored, 10) : 0;
  } catch {
    return 0;
  }
};

export const setHighScore = (score: number): void => {
  try {
    localStorage.setItem(HIGH_SCORE_KEY, score.toString());
  } catch {
    console.error('Failed to save high score');
  }
};

export const getAchievements = (): Achievement[] => {
  try {
    const stored = localStorage.getItem(ACHIEVEMENTS_KEY);
    const savedUnlocked: Partial<Record<AchievementId, { unlockedAt: number }>> = stored
      ? JSON.parse(stored)
      : {};

    const allIds: AchievementId[] = [
      'first_kill',
      'kill_streak_10',
      'first_boss',
      'score_5000',
      'collect_all_powerups',
      'survive_5_waves',
      'multi_kill_3',
      'full_hp_wave',
      'ulti_kill_5',
      'total_kills_100',
    ];

    return allIds.map((id) => {
      const def = ACHIEVEMENT_DEFINITIONS[id];
      const saved = savedUnlocked[id];
      return {
        id,
        name: def.name,
        description: def.description,
        icon: def.icon,
        unlocked: !!saved,
        unlockedAt: saved?.unlockedAt,
      };
    });
  } catch {
    return [];
  }
};

export const saveAchievement = (id: AchievementId): void => {
  try {
    const stored = localStorage.getItem(ACHIEVEMENTS_KEY);
    const saved: Partial<Record<AchievementId, { unlockedAt: number }>> = stored
      ? JSON.parse(stored)
      : {};
    if (!saved[id]) {
      saved[id] = { unlockedAt: Date.now() };
      localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(saved));
    }
  } catch {
    console.error('Failed to save achievement');
  }
};

export const isAchievementUnlocked = (id: AchievementId): boolean => {
  try {
    const stored = localStorage.getItem(ACHIEVEMENTS_KEY);
    const saved: Partial<Record<AchievementId, { unlockedAt: number }>> = stored
      ? JSON.parse(stored)
      : {};
    return !!saved[id];
  } catch {
    return false;
  }
};

export const getLeaderboard = (): LeaderboardEntry[] => {
  try {
    const stored = localStorage.getItem(LEADERBOARD_KEY);
    const entries: LeaderboardEntry[] = stored ? JSON.parse(stored) : [];
    return entries.sort((a, b) => b.score - a.score).slice(0, 10);
  } catch {
    return [];
  }
};

export const addLeaderboardEntry = (score: number, wave: number): LeaderboardEntry[] => {
  try {
    const entries = getLeaderboard();
    const newEntry: LeaderboardEntry = {
      id: `entry_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      score,
      wave,
      date: Date.now(),
    };
    entries.push(newEntry);
    const sorted = entries.sort((a, b) => b.score - a.score).slice(0, 10);
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(sorted));
    return sorted;
  } catch {
    console.error('Failed to save leaderboard entry');
    return [];
  }
};

export const getTotalKills = (): number => {
  try {
    const stored = localStorage.getItem(TOTAL_KILLS_KEY);
    return stored ? parseInt(stored, 10) : 0;
  } catch {
    return 0;
  }
};

export const addTotalKills = (count: number): number => {
  try {
    const current = getTotalKills();
    const newTotal = current + count;
    localStorage.setItem(TOTAL_KILLS_KEY, newTotal.toString());
    return newTotal;
  } catch {
    return 0;
  }
};
