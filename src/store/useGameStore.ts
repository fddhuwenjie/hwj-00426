import { create } from 'zustand';
import { GameStore, GameState, PlayerState } from '../game/types';
import { getHighScore, setHighScore } from '../utils/storage';
import { GAME_CONFIG } from '../game/config';

const initialPlayerState: PlayerState = {
  hp: GAME_CONFIG.PLAYER_MAX_HP,
  maxHp: GAME_CONFIG.PLAYER_MAX_HP,
  hasShield: false,
  fireRateBoost: false,
  scatterBoost: false,
  fireRateEndTime: 0,
  scatterEndTime: 0,
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

  setGameState: (state: GameState) => {
    if (state === 'gameover') {
      const { score, highScore } = get();
      if (score > highScore) {
        setHighScore(score);
        set({ highScore: score });
      }
    }
    set({ gameState: state });
  },

  addScore: (points: number) => {
    set((state) => ({ score: state.score + points }));
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
}));
