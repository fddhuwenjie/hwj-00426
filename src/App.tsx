import { useGameStore } from './store/useGameStore';
import Game from './components/Game';
import HUD from './components/HUD';
import StartScreen from './components/StartScreen';
import GameOverScreen from './components/GameOverScreen';

export default function App() {
  const { gameState } = useGameStore();

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#0a0a1a]">
      {gameState === 'start' && <StartScreen />}
      
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
    </div>
  );
}
