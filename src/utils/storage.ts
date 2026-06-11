const HIGH_SCORE_KEY = 'space_shooter_high_score';

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
