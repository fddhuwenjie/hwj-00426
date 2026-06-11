import { useGameStore } from '../store/useGameStore';
import { Zap } from 'lucide-react';

const EnergyBar = () => {
  const { player } = useGameStore();
  const percent = (player.energy / player.maxEnergy) * 100;
  const isFull = player.energy >= player.maxEnergy;

  return (
    <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-1 z-20 pointer-events-none">
      <div className="flex items-center gap-2">
        <Zap
          size={18}
          className={isFull ? 'text-yellow-400 animate-pulse drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]' : 'text-yellow-500/60'}
        />
        <span className={`text-sm font-bold tracking-wider ${isFull ? 'text-yellow-300 animate-pulse' : 'text-yellow-500/60'}`}>
          {isFull ? 'ULTIMATE READY [Q]' : `${Math.floor(player.energy)} / ${player.maxEnergy}`}
        </span>
      </div>
      <div className="w-64 h-4 bg-black/60 rounded-full border border-yellow-500/30 overflow-hidden backdrop-blur-sm">
        <div
          className={`h-full rounded-full transition-all duration-200 ${
            isFull
              ? 'bg-gradient-to-r from-yellow-500 via-orange-400 to-yellow-500 animate-pulse'
              : 'bg-gradient-to-r from-yellow-600 via-orange-500 to-yellow-500'
          }`}
          style={{
            width: `${percent}%`,
            boxShadow: isFull
              ? '0 0 20px rgba(250, 204, 21, 0.8), inset 0 0 10px rgba(255,255,255,0.5)'
              : '0 0 10px rgba(250, 204, 21, 0.4)',
          }}
        />
      </div>
    </div>
  );
};

export default EnergyBar;
