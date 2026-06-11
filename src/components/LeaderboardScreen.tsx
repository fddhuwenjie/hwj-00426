import { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Medal, Clock, TrendingUp, Star } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { LeaderboardEntry } from '../game/types';

interface Props {
  onBack: () => void;
}

const medalColors = [
  { bg: 'from-yellow-500 to-amber-400', border: 'border-yellow-400', text: 'text-yellow-100', shadow: 'shadow-[0_0_25px_rgba(250,204,21,0.5)]' },
  { bg: 'from-gray-300 to-gray-400', border: 'border-gray-300', text: 'text-gray-100', shadow: 'shadow-[0_0_20px_rgba(209,213,219,0.4)]' },
  { bg: 'from-orange-600 to-amber-700', border: 'border-orange-500', text: 'text-orange-100', shadow: 'shadow-[0_0_18px_rgba(234,88,12,0.4)]' },
];

const LeaderboardScreen = ({ onBack }: Props) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const { getLeaderboard } = useGameStore();

  useEffect(() => {
    setEntries(getLeaderboard());
    const t = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(t);
  }, [getLeaderboard]);

  const formatDate = (timestamp: number) => {
    try {
      return new Date(timestamp).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch {
      return '-';
    }
  };

  const formatTime = (timestamp: number) => {
    try {
      return new Date(timestamp).toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#0a0a1a] via-[#0d0d2b] to-[#0a0a1a] flex flex-col z-50 overflow-auto">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 80 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              opacity: Math.random() * 0.6 + 0.1,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 2 + 1}s`,
            }}
          />
        ))}
      </div>

      <div
        className={`relative z-10 max-w-2xl w-full mx-auto px-6 py-8 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}
      >
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 text-white/70 hover:border-fuchsia-400/50 hover:text-white hover:bg-white/5 transition-all duration-300"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>

          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-1">
              <Trophy className="text-fuchsia-400" size={32} />
              <h1 className="text-4xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-yellow-400">
                LEADERBOARD
              </h1>
              <Trophy className="text-yellow-400" size={32} />
            </div>
            <div className="text-gray-400 text-sm tracking-widest">
              TOP 10 PILOTS · ALL TIME
            </div>
          </div>

          <div className="w-[108px]" />
        </div>

        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="relative mb-6">
              <Trophy
                size={80}
                className="text-gray-700"
              />
              <div className="absolute inset-0 bg-gray-700/20 blur-3xl rounded-full" />
            </div>
            <h3 className="text-2xl font-bold text-gray-400 mb-2">No Records Yet</h3>
            <p className="text-gray-500 max-w-xs">
              Be the first to claim your spot on the leaderboard! Complete a game to record your score.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, idx) => {
              const medal = idx < 3 ? medalColors[idx] : null;
              return (
                <div
                  key={entry.id}
                  className={`relative group rounded-xl border p-4 transition-all duration-500 backdrop-blur-sm ${
                    medal
                      ? `bg-gradient-to-r ${medal.bg} bg-opacity-10 ${medal.border} ${medal.shadow}`
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                  style={{
                    transitionDelay: `${idx * 40}ms`,
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-xl flex-shrink-0 ${
                        medal
                          ? `bg-gradient-to-br ${medal.bg} ${medal.border} border-2 ${medal.shadow}`
                          : 'bg-white/5 border border-white/10'
                      }`}
                    >
                      {medal ? (
                        <Medal size={24} className={`${medal.text} drop-shadow-md`} />
                      ) : (
                        <span className="text-xl font-black text-gray-500">#{idx + 1}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span
                          className={`text-2xl font-black ${
                            medal ? medal.text : 'text-white'
                          }`}
                          style={{
                            textShadow: medal ? '0 0 10px rgba(255,255,255,0.3)' : 'none',
                          }}
                        >
                          {entry.score.toLocaleString()}
                        </span>
                        {idx === 0 && (
                          <div className="flex items-center gap-0.5">
                            <Star size={14} className="text-yellow-300 fill-yellow-300" />
                            <Star size={14} className="text-yellow-300 fill-yellow-300" />
                            <Star size={14} className="text-yellow-300 fill-yellow-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                          <TrendingUp size={12} className="text-fuchsia-400" />
                          <span>Wave <span className="text-fuchsia-300 font-bold">{entry.wave}</span></span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={12} className="text-cyan-400" />
                          <span>{formatDate(entry.date)} · {formatTime(entry.date)}</span>
                        </div>
                      </div>
                    </div>

                    {idx < 3 && (
                      <div
                        className={`text-xs font-black px-3 py-1 rounded-full ${
                          medal?.bg
                        } ${medal?.text} bg-opacity-30 border ${medal?.border} tracking-wider`}
                      >
                        {idx === 0 ? 'CHAMPION' : idx === 1 ? 'RUNNER-UP' : 'BRONZE'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardScreen;
