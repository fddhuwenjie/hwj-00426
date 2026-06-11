import { useState, useEffect } from 'react';
import { Skull, RotateCcw, Trophy, Star, TrendingUp } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';

const GameOverScreen = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { score, highScore, wave, setGameState, resetGame } = useGameStore();
  const isNewHighScore = score >= highScore && score > 0;

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleRestart = () => {
    resetGame();
    setGameState('playing');
  };

  const handleMainMenu = () => {
    resetGame();
    setGameState('start');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        className={`relative bg-gradient-to-b from-[#0d0d2b]/95 to-[#0a0a1a]/95 border border-red-500/30 rounded-2xl p-8 max-w-md w-full mx-4 transition-all duration-700 transform ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
        }`}
      >
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
          <div className="relative">
            <Skull 
              className="text-red-500 drop-shadow-[0_0_30px_rgba(239,68,68,0.8)]" 
              size={80}
            />
            <div className="absolute inset-0 bg-red-500/30 blur-2xl rounded-full animate-pulse" />
          </div>
        </div>

        <div className="text-center mt-12">
          <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 mb-2">
            GAME OVER
          </h2>
          <p className="text-gray-400 mb-8">You were destroyed in combat</p>

          {isNewHighScore && (
            <div className="mb-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-xl p-4 animate-pulse">
              <div className="flex items-center justify-center gap-2 text-yellow-400">
                <Trophy size={28} className="drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
                <span className="text-xl font-bold">NEW HIGH SCORE!</span>
                <Trophy size={28} className="drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-center gap-2 text-cyan-400 mb-2">
                <Star size={20} />
                <span className="text-sm text-gray-400">SCORE</span>
              </div>
              <div className="text-3xl font-bold text-white">
                {score.toLocaleString()}
              </div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-center gap-2 text-fuchsia-400 mb-2">
                <TrendingUp size={20} />
                <span className="text-sm text-gray-400">WAVE</span>
              </div>
              <div className="text-3xl font-bold text-white">
                {wave}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 rounded-xl p-4 mb-8 border border-yellow-500/20">
            <div className="flex items-center justify-center gap-2 text-yellow-500">
              <Trophy size={20} />
              <span className="text-sm">BEST SCORE</span>
            </div>
            <div className="text-2xl font-bold text-yellow-300 mt-1">
              {highScore.toLocaleString()}
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleRestart}
              className="group relative w-full h-14 overflow-hidden rounded-lg bg-gradient-to-r from-cyan-500 to-fuchsia-500 p-0.5 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(34,211,238,0.4)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-fuchsia-500 blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative flex h-full w-full items-center justify-center gap-3 bg-[#0a0a1a] rounded-lg group-hover:bg-[#0d0d2b] transition-colors">
                <RotateCcw className="text-cyan-400 group-hover:text-white transition-colors" size={24} />
                <span className="text-xl font-bold text-white">
                  PLAY AGAIN
                </span>
              </div>
            </button>

            <button
              onClick={handleMainMenu}
              className="w-full h-12 rounded-lg border border-gray-600 text-gray-400 font-medium hover:border-gray-500 hover:text-white hover:bg-white/5 transition-all duration-300"
            >
              MAIN MENU
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameOverScreen;
