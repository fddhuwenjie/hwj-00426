import { useGameStore } from '../store/useGameStore';
import { useEffect, useState } from 'react';

const ScreenEffectLayer = () => {
  const { screenEffect, bossWarning } = useGameStore();
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    if (!screenEffect && !bossWarning) return;
    const interval = setInterval(() => forceUpdate((n) => n + 1), 30);
    return () => clearInterval(interval);
  }, [screenEffect, bossWarning]);

  const now = Date.now();
  let flashOpacity = 0;
  let flashColor = 'transparent';
  let showWarning = false;
  let warningOpacity = 0;

  if (screenEffect) {
    const elapsed = now - screenEffect.startTime;
    const total = screenEffect.duration;
    const progress = Math.min(1, elapsed / total);

    if (screenEffect.type === 'flash_white') {
      flashOpacity = Math.max(0, 1 - progress * 2);
      flashColor = 'rgba(255,255,255,' + flashOpacity + ')';
    } else if (screenEffect.type === 'warning') {
      flashOpacity = 0.15 + Math.sin(elapsed / 80) * 0.1;
      flashColor = 'rgba(255,0,0,' + flashOpacity + ')';
      showWarning = progress < 1;
      warningOpacity = 1 - progress;
    }
  }

  if (bossWarning && !screenEffect) {
    flashOpacity = 0.1 + Math.sin(now / 80) * 0.08;
    flashColor = 'rgba(255,0,0,' + flashOpacity + ')';
    showWarning = true;
    warningOpacity = 1;
  }

  return (
    <>
      <div
        className="fixed inset-0 pointer-events-none z-40 transition-colors"
        style={{ backgroundColor: flashColor }}
      />

      {showWarning && (
        <div
          className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
          style={{ opacity: warningOpacity }}
        >
          <div className="relative">
            <div
              className="text-8xl md:text-9xl font-black tracking-[0.3em] text-red-500 animate-pulse"
              style={{
                textShadow:
                  '0 0 30px rgba(255,0,0,0.9), 0 0 60px rgba(255,0,0,0.6), 0 0 100px rgba(255,0,0,0.4)',
                WebkitTextStroke: '2px rgba(255,255,255,0.3)',
              }}
            >
              WARNING
            </div>
            <div
              className="absolute inset-0 text-8xl md:text-9xl font-black tracking-[0.3em] text-transparent animate-pulse"
              style={{
                WebkitTextStroke: '2px rgba(255,255,255,0.6)',
              }}
            >
              WARNING
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ScreenEffectLayer;
