import { useState, useEffect } from 'react';
import { Rocket, Gamepad2, Keyboard, MousePointer2, Trophy, Award, BarChart3 } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';

interface Props {
  onShowAchievements: () => void;
  onShowLeaderboard: () => void;
}

const StartScreen = ({ onShowAchievements, onShowLeaderboard }: Props) => {
  const [isVisible, setIsVisible] = useState(false);
  const { setGameState, highScore } = useGameStore();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleStart = () => {
    setGameState('playing');
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#0a0a1a] via-[#0d0d2b] to-[#0a0a1a] flex flex-col items-center justify-center z-50 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 100 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              opacity: Math.random() * 0.8 + 0.2,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${Math.random() * 2 + 1}s`,
            }}
          />
        ))}
      </div>

      <div
        className={`relative z-10 transition-all duration-1000 transform ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Rocket
              className="text-cyan-400 animate-bounce"
              size={48}
              style={{ animationDuration: '2s' }}
            />
            <h1 className="text-6xl md:text-7xl font-black tracking-wider">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-cyan-400 animate-pulse drop-shadow-[0_0_30px_rgba(34,211,238,0.5)]">
                SPACE
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-fuchsia-500 animate-pulse drop-shadow-[0_0_30px_rgba(232,121,249,0.5)]">
                SHOOTER
              </span>
            </h1>
            <Rocket
              className="text-fuchsia-400 animate-bounce transform rotate-180"
              size={48}
              style={{ animationDuration: '2s', animationDelay: '0.5s' }}
            />
          </div>
          <p className="text-gray-400 text-lg tracking-widest">3D SPACE COMBAT</p>
        </div>

        {highScore > 0 && (
          <div className="flex items-center justify-center gap-2 mb-8 text-yellow-400">
            <Trophy size={24} className="drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
            <span className="text-xl font-bold">
              High Score: <span className="text-yellow-300">{highScore.toLocaleString()}</span>
            </span>
          </div>
        )}

        <div className="flex flex-col items-center gap-4 mb-10">
          <button
            onClick={handleStart}
            className="group relative w-72 h-16 mx-auto block overflow-hidden rounded-lg bg-gradient-to-r from-cyan-500 to-fuchsia-500 p-0.5 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(34,211,238,0.5)]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-fuchsia-500 blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative flex h-full w-full items-center justify-center gap-3 bg-[#0a0a1a] rounded-lg group-hover:bg-[#0d0d2b] transition-colors">
              <Gamepad2 className="text-cyan-400 group-hover:text-white transition-colors" size={28} />
              <span className="text-2xl font-bold text-white tracking-wider">
                START GAME
              </span>
            </div>
          </button>

          <div className="flex gap-3">
            <button
              onClick={onShowAchievements}
              className="group relative w-44 h-12 overflow-hidden rounded-lg bg-gradient-to-r from-yellow-600 to-orange-500 p-0.5 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(250,204,21,0.4)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-orange-500 blur-md opacity-40 group-hover:opacity-60 transition-opacity" />
              <div className="relative flex h-full w-full items-center justify-center gap-2 bg-[#0a0a1a] rounded-lg group-hover:bg-[#0d0d2b] transition-colors">
                <Award className="text-yellow-400 group-hover:text-yellow-200 transition-colors" size={20} />
                <span className="font-bold text-yellow-100 tracking-wide">
                  ACHIEVEMENTS
                </span>
              </div>
            </button>

            <button
              onClick={onShowLeaderboard}
              className="group relative w-44 h-12 overflow-hidden rounded-lg bg-gradient-to-r from-cyan-600 to-fuchsia-500 p-0.5 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(217,70,239,0.4)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-fuchsia-500 blur-md opacity-40 group-hover:opacity-60 transition-opacity" />
              <div className="relative flex h-full w-full items-center justify-center gap-2 bg-[#0a0a1a] rounded-lg group-hover:bg-[#0d0d2b] transition-colors">
                <BarChart3 className="text-fuchsia-400 group-hover:text-fuchsia-200 transition-colors" size={20} />
                <span className="font-bold text-fuchsia-100 tracking-wide">
                  LEADERBOARD
                </span>
              </div>
            </button>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 text-center hover:border-cyan-500/50 transition-colors">
            <Keyboard className="mx-auto mb-3 text-cyan-400" size={32} />
            <h3 className="text-white font-bold mb-2">Movement</h3>
            <p className="text-gray-400 text-sm">WASD or Arrow Keys to move your ship</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 text-center hover:border-fuchsia-500/50 transition-colors">
            <MousePointer2 className="mx-auto mb-3 text-fuchsia-400" size={32} />
            <h3 className="text-white font-bold mb-2">Aim</h3>
            <p className="text-gray-400 text-sm">Move mouse to control ship tilt</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 text-center hover:border-yellow-500/50 transition-colors">
            <span className="block mx-auto mb-3 text-yellow-400 text-2xl font-bold">␣</span>
            <h3 className="text-white font-bold mb-2">Shoot</h3>
            <p className="text-gray-400 text-sm">Spacebar or Left Mouse Button</p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center hover:border-orange-500/50 transition-colors">
            <div className="text-orange-400 font-bold mb-1">1 / 2 / 3</div>
            <p className="text-gray-400 text-xs">Switch Weapons</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center hover:border-orange-500/50 transition-colors">
            <div className="text-orange-400 font-bold mb-1">E</div>
            <p className="text-gray-400 text-xs">Fire Missile (Tracks)</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center hover:border-yellow-500/50 transition-colors">
            <div className="text-yellow-400 font-bold mb-1">Q</div>
            <p className="text-gray-400 text-xs">Ultimate (Full Energy)</p>
          </div>
        </div>

        <div className="mt-10 text-center">
          <h3 className="text-white font-bold mb-4 tracking-wider">POWER-UPS</h3>
          <div className="flex justify-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]" />
              <span className="text-gray-400 text-sm">Health</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.6)]" />
              <span className="text-gray-400 text-sm">Fire Rate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]" />
              <span className="text-gray-400 text-sm">Shield</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]" />
              <span className="text-gray-400 text-sm">Scatter</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartScreen;
