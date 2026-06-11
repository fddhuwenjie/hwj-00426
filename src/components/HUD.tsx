import { Heart, Shield, Zap, Target } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import WeaponPanel from './WeaponPanel';
import EnergyBar from './EnergyBar';
import Minimap from './Minimap';
import ScreenEffectLayer from './ScreenEffectLayer';
import AchievementToasts from './AchievementToasts';

const HUD = () => {
  const { player, score, wave, enemiesRemaining, waveTimer, isWaveBreak } = useGameStore();

  const formatTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}s`;
  };

  const getRemainingPowerUpTime = (endTime: number) => {
    const remaining = Math.max(0, endTime - Date.now());
    return Math.ceil(remaining / 1000);
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      <ScreenEffectLayer />
      <AchievementToasts />

      <div className="absolute top-6 left-6 flex items-center gap-2">
        {Array.from({ length: player.maxHp }).map((_, i) => (
          <div
            key={i}
            className={`transition-all duration-300 ${
              i < player.hp
                ? 'text-red-500 scale-100'
                : 'text-gray-600 scale-75 opacity-50'
            }`}
          >
            <Heart
              size={32}
              fill={i < player.hp ? 'currentColor' : 'none'}
              strokeWidth={2}
              className="drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]"
            />
          </div>
        ))}
        {player.hasShield && (
          <div className="ml-2 text-cyan-400 animate-pulse">
            <Shield
              size={28}
              fill="currentColor"
              className="drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]"
            />
          </div>
        )}
      </div>

      <div className="absolute top-6 right-6 text-right">
        <div className="text-4xl font-bold text-white tracking-wider font-mono">
          <span className="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">
            {score.toLocaleString()}
          </span>
        </div>
        <div className="text-sm text-gray-400 mt-1">SCORE</div>
      </div>

      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 text-center">
        <div className="text-2xl font-bold text-white tracking-widest">
          {isWaveBreak ? (
            <span className="text-yellow-400 animate-pulse drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]">
              WAVE {wave} COMPLETE
            </span>
          ) : (
            <span className="text-fuchsia-400 drop-shadow-[0_0_10px_rgba(232,121,249,0.8)]">
              WAVE {wave}
            </span>
          )}
        </div>
        <div className="text-sm text-gray-300 mt-1">
          {isWaveBreak ? (
            <span className="text-yellow-300">
              Next wave in: {formatTime(waveTimer)}
            </span>
          ) : (
            <>
              <span className="text-cyan-300">Enemies: {enemiesRemaining}</span>
              <span className="mx-2 text-gray-500">|</span>
              <span className="text-gray-400">{formatTime(waveTimer)}</span>
            </>
          )}
        </div>
      </div>

      <div className="absolute bottom-6 left-6 flex flex-col gap-4">
        <div className="flex flex-wrap gap-3">
          {player.fireRateBoost && (
            <div className="flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/50 rounded-lg px-4 py-2 backdrop-blur-sm">
              <Zap className="text-yellow-400" size={20} />
              <span className="text-yellow-300 text-sm font-medium">
                Fire Rate +{getRemainingPowerUpTime(player.fireRateEndTime)}s
              </span>
            </div>
          )}
          {player.scatterBoost && (
            <div className="flex items-center gap-2 bg-green-500/20 border border-green-500/50 rounded-lg px-4 py-2 backdrop-blur-sm">
              <Target className="text-green-400" size={20} />
              <span className="text-green-300 text-sm font-medium">
                Scatter +{getRemainingPowerUpTime(player.scatterEndTime)}s
              </span>
            </div>
          )}
        </div>

        <div className="text-gray-500 text-xs leading-relaxed">
          <div>WASD - Move | Mouse - Aim | Space/LMB - Shoot</div>
          <div>1/2/3 - Weapon | E - Missile | Q - Ultimate</div>
        </div>
      </div>

      <EnergyBar />
      <WeaponPanel />
      <Minimap />
    </div>
  );
};

export default HUD;
