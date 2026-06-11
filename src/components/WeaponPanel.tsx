import { useGameStore } from '../store/useGameStore';
import { WEAPON_CONFIGS } from '../game/config';
import { WeaponType } from '../game/types';
import { Crosshair, Rocket, Target } from 'lucide-react';

const weaponIcons: Record<WeaponType, React.ReactNode> = {
  laser: <Crosshair size={24} />,
  missile: <Rocket size={24} />,
  scatter: <Target size={24} />,
};

const weaponColors: Record<WeaponType, { active: string; border: string; glow: string }> = {
  laser: {
    active: 'from-cyan-500/30 to-cyan-400/10',
    border: 'border-cyan-400',
    glow: 'shadow-[0_0_20px_rgba(34,211,238,0.6)]',
  },
  missile: {
    active: 'from-orange-500/30 to-orange-400/10',
    border: 'border-orange-400',
    glow: 'shadow-[0_0_20px_rgba(251,146,60,0.6)]',
  },
  scatter: {
    active: 'from-green-500/30 to-green-400/10',
    border: 'border-green-400',
    glow: 'shadow-[0_0_20px_rgba(74,222,128,0.6)]',
  },
};

const WeaponPanel = () => {
  const { player } = useGameStore();
  const weapons: WeaponType[] = ['laser', 'missile', 'scatter'];
  const now = Date.now();

  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
      {weapons.map((weapon) => {
        const config = WEAPON_CONFIGS[weapon];
        const isActive = player.currentWeapon === weapon;
        const colors = weaponColors[weapon];

        let statusText = '';
        let statusColor = '';
        if (weapon === 'missile') {
          const remaining = Math.max(0, player.missileCooldownEndTime - now);
          if (remaining > 0) {
            statusText = `${(remaining / 1000).toFixed(1)}s`;
            statusColor = 'text-gray-400';
          } else {
            statusText = 'READY [E]';
            statusColor = 'text-orange-300';
          }
        } else {
          statusText = 'AUTO';
          statusColor = isActive ? 'text-white' : 'text-gray-500';
        }

        return (
          <div
            key={weapon}
            className={`relative flex flex-col items-center justify-center w-24 h-20 rounded-xl border backdrop-blur-sm transition-all duration-300 ${
              isActive
                ? `bg-gradient-to-b ${colors.active} ${colors.border} ${colors.glow} scale-105`
                : 'bg-white/5 border-white/20 opacity-70'
            }`}
          >
            <div
              className={`absolute top-1 left-1 w-5 h-5 flex items-center justify-center rounded text-xs font-bold ${
                isActive ? 'bg-white text-gray-900' : 'bg-white/20 text-white/60'
              }`}
            >
              {config.key}
            </div>
            <div className={isActive ? 'text-white' : 'text-white/60'}>
              {weaponIcons[weapon]}
            </div>
            <div className={`text-xs font-bold mt-1 ${isActive ? 'text-white' : 'text-white/60'}`}>
              {config.name}
            </div>
            <div className={`text-[10px] mt-0.5 ${statusColor}`}>
              {statusText}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WeaponPanel;
