import { useState } from 'react';
import { useGameStore } from './store/useGameStore';
import Game from './components/Game';
import HUD from './components/HUD';
import StartScreen from './components/StartScreen';
import GameOverScreen from './components/GameOverScreen';
import AchievementsScreen from './components/AchievementsScreen';
import LeaderboardScreen from './components/LeaderboardScreen';

export default function App() {
  const { gameState, setGameState } = useGameStore();
  const [menuScreen, setMenuScreen] = useState<'main' | 'achievements' | 'leaderboard'>('main');

  const handleBackToMain = () => {
    setMenuScreen('main');
  };

  const handleShowAchievements = () => {
    setMenuScreen('achievements');
  };

  const handleShowLeaderboard = () => {
    setMenuScreen('leaderboard');
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#0a0a1a]">
      {gameState === 'start' && (
        <>
          {menuScreen === 'main' && (
            <StartScreen
              onShowAchievements={handleShowAchievements}
              onShowLeaderboard={handleShowLeaderboard}
            />
          )}
          {menuScreen === 'achievements' && (
            <AchievementsScreen onBack={handleBackToMain} />
          )}
          {menuScreen === 'leaderboard' && (
            <LeaderboardScreen onBack={handleBackToMain} />
          )}
        </>
      )}

      {gameState === 'playing' && (
        <>
          <Game />
          <HUD />
        </>
      )}

      {gameState === 'gameover' && (
        <>
          <Game />
          <GameOverScreen />
        </>
      )}

      {gameState === 'achievements' && (
        <AchievementsScreen onBack={() => setGameState('start')} />
      )}

      {gameState === 'leaderboard' && (
        <LeaderboardScreen onBack={() => setGameState('start')} />
      )}
    </div>
  );
}
