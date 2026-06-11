import { useGameStore } from '../store/useGameStore';
import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';

const AchievementToasts = () => {
  const { achievementToasts } = useGameStore();
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => forceUpdate((n) => n + 1), 50);
    return () => clearInterval(interval);
  }, []);

  const now = Date.now();

  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 flex flex-col gap-3 pointer-events-none">
      {achievementToasts.map((toast) => {
        const elapsed = now - toast.startTime;
        const duration = 3000;
        let opacity = 1;
        let translateY = 0;

        if (elapsed < 300) {
          opacity = elapsed / 300;
          translateY = -20 * (1 - opacity);
        } else if (elapsed > duration - 500) {
          opacity = Math.max(0, (duration - elapsed) / 500);
          translateY = -20 * (1 - opacity);
        }

        return (
          <div
            key={toast.id}
            className="flex items-center gap-4 px-6 py-4 rounded-xl border-2"
            style={{
              opacity,
              transform: `translateY(${translateY}px)`,
              background:
                'linear-gradient(135deg, rgba(120,53,15,0.9) 0%, rgba(161,98,7,0.85) 50%, rgba(120,53,15,0.9) 100%)',
              borderColor: 'rgba(250,204,21,0.6)',
              boxShadow:
                '0 0 30px rgba(250,204,21,0.4), inset 0 0 20px rgba(250,204,21,0.1)',
              minWidth: '320px',
            }}
          >
            <div
              className="flex items-center justify-center w-12 h-12 rounded-full flex-shrink-0"
              style={{
                background:
                  'radial-gradient(circle, rgba(253,224,71,0.3) 0%, rgba(250,204,21,0.1) 100%)',
                border: '2px solid rgba(250,204,21,0.7)',
              }}
            >
              <span className="text-2xl">{toast.achievement.icon}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Trophy size={14} className="text-yellow-300" />
                <span className="text-xs font-bold text-yellow-300 tracking-wider uppercase">
                  Achievement Unlocked
                </span>
              </div>
              <div className="text-xl font-black text-yellow-50 mt-0.5 drop-shadow-[0_0_4px_rgba(250,204,21,0.5)]">
                {toast.achievement.name}
              </div>
              <div className="text-sm text-yellow-100/80 mt-0.5">
                {toast.achievement.description}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AchievementToasts;
