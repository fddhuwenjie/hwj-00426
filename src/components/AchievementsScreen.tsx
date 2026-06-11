import { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Lock, Star } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { Achievement } from '../game/types';

interface Props {
  onBack: () => void;
}

const AchievementsScreen = ({ onBack }: Props) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const { getAchievements } = useGameStore();

  useEffect(() => {
    setAchievements(getAchievements());
    const t = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(t);
  }, [getAchievements]);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const percent = achievements.length > 0 ? (unlockedCount / achievements.length) * 100 : 0;

  const formatDate = (timestamp: number) => {
    try {
      return new Date(timestamp).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
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
        className={`relative z-10 max-w-4xl w-full mx-auto px-6 py-8 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}
      >
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 text-white/70 hover:border-cyan-400/50 hover:text-white hover:bg-white/5 transition-all duration-300"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>

          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-1">
              <Trophy className="text-yellow-400" size={32} />
              <h1 className="text-4xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400">
                ACHIEVEMENTS
              </h1>
              <Trophy className="text-yellow-400" size={32} />
            </div>
            <div className="text-gray-400 text-sm tracking-widest">
              {unlockedCount} / {achievements.length} Unlocked
            </div>
          </div>

          <div className="w-[108px]" />
        </div>

        <div className="w-full h-3 bg-black/60 rounded-full border border-yellow-500/30 overflow-hidden mb-10 backdrop-blur-sm">
          <div
            className="h-full rounded-full bg-gradient-to-r from-yellow-600 via-orange-400 to-yellow-500 transition-all duration-1000"
            style={{
              width: `${percent}%`,
              boxShadow: '0 0 20px rgba(250,204,21,0.5)',
            }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement, idx) => (
            <div
              key={achievement.id}
              className={`relative group rounded-xl border-2 p-5 transition-all duration-500 ${
                achievement.unlocked
                  ? 'bg-gradient-to-br from-yellow-950/40 via-orange-950/30 to-yellow-950/40 border-yellow-500/50 hover:border-yellow-400/80 hover:shadow-[0_0_25px_rgba(250,204,21,0.25)]'
                  : 'bg-white/3 border-white/10 hover:border-white/20'
              }`}
              style={{
                transitionDelay: `${idx * 40}ms`,
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`relative flex items-center justify-center w-16 h-16 rounded-xl flex-shrink-0 ${
                    achievement.unlocked
                      ? 'bg-gradient-to-br from-yellow-500/30 to-orange-500/20 border border-yellow-400/60'
                      : 'bg-white/5 border border-white/10'
                  }`}
                >
                  {achievement.unlocked ? (
                    <span className="text-3xl drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]">
                      {achievement.icon}
                    </span>
                  ) : (
                    <Lock size={28} className="text-gray-600" />
                  )}
                  {achievement.unlocked && (
                    <div className="absolute -top-1 -right-1">
                      <Star size={16} className="text-yellow-400 fill-yellow-400" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div
                    className={`text-lg font-bold mb-1 ${
                      achievement.unlocked
                        ? 'text-yellow-100'
                        : 'text-gray-500'
                    }`}
                  >
                    {achievement.unlocked ? achievement.name : '???'}
                  </div>
                  <div
                    className={`text-sm leading-relaxed ${
                      achievement.unlocked ? 'text-yellow-100/70' : 'text-gray-600'
                    }`}
                  >
                    {achievement.unlocked ? achievement.description : '完成未知条件解锁此成就'}
                  </div>
                  {achievement.unlocked && achievement.unlockedAt && (
                    <div className="text-xs text-yellow-400/60 mt-2 flex items-center gap-1">
                      <Star size={12} className="fill-yellow-400/60" />
                      Unlocked: {formatDate(achievement.unlockedAt)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AchievementsScreen;
