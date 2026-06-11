import { useMemo } from 'react';
import { useGameStore } from '../store/useGameStore';
import { GAME_CONFIG } from '../game/config';
import { EnemyType, PowerUpType } from '../game/types';

const Minimap = () => {
  const { playerPosition, minimapEnemies, minimapPowerUps, screenEdgeIndicators } = useGameStore();

  const radius = 80;
  const center = radius;
  const scale = useMemo(() => {
    let maxDist = 1;
    for (const e of minimapEnemies) {
      const d = Math.sqrt((e.x - playerPosition.x) ** 2 + (e.y - playerPosition.y) ** 2);
      if (d > maxDist) maxDist = d;
    }
    const maxRange = Math.max(GAME_CONFIG.PLAYER_BOUNDARY_X, GAME_CONFIG.PLAYER_BOUNDARY_Y) * 1.5;
    return (radius - 8) / Math.max(maxDist, maxRange * 0.5);
  }, [minimapEnemies, playerPosition]);

  const powerUpColorHex: Record<PowerUpType, string> = {
    health: '#ff3366',
    fireRate: '#ffcc00',
    shield: '#0099ff',
    scatter: '#00ff66',
  };

  const enemyColorHex: Record<EnemyType, string> = {
    small: '#ff3366',
    medium: '#9933ff',
    boss: '#ff0000',
  };

  return (
    <>
      <div
        className="absolute bottom-6 right-6 z-20 rounded-full border-2 border-cyan-500/50 bg-black/60 backdrop-blur-sm overflow-hidden pointer-events-none"
        style={{
          width: radius * 2,
          height: radius * 2,
          boxShadow: '0 0 20px rgba(34,211,238,0.3), inset 0 0 15px rgba(34,211,238,0.1)',
        }}
      >
        <svg width={radius * 2} height={radius * 2}>
          <defs>
            <radialGradient id="mmBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(34,211,238,0.05)" />
              <stop offset="100%" stopColor="rgba(34,211,238,0.15)" />
            </radialGradient>
          </defs>
          <circle cx={center} cy={center} r={radius} fill="url(#mmBg)" />
          <circle cx={center} cy={center} r={radius - 2} fill="none" stroke="rgba(34,211,238,0.2)" strokeWidth="1" />
          <circle cx={center} cy={center} r={(radius - 2) * 0.66} fill="none" stroke="rgba(34,211,238,0.1)" strokeWidth="1" />
          <circle cx={center} cy={center} r={(radius - 2) * 0.33} fill="none" stroke="rgba(34,211,238,0.1)" strokeWidth="1" />
          <line x1="0" y1={center} x2={radius * 2} y2={center} stroke="rgba(34,211,238,0.1)" strokeWidth="1" />
          <line x1={center} y1="0" x2={center} y2={radius * 2} stroke="rgba(34,211,238,0.1)" strokeWidth="1" />

          {minimapPowerUps.map((p) => {
            const x = center + (p.x - playerPosition.x) * scale;
            const y = center + (p.y - playerPosition.y) * scale;
            if (x < 4 || x > radius * 2 - 4 || y < 4 || y > radius * 2 - 4) return null;
            return (
              <circle
                key={`pu_${p.id}`}
                cx={x}
                cy={y}
                r={3}
                fill={powerUpColorHex[p.type]}
                opacity={0.9}
              />
            );
          })}

          {minimapEnemies.map((e) => {
            const x = center + (e.x - playerPosition.x) * scale;
            const y = center + (e.y - playerPosition.y) * scale;
            if (e.type === 'boss') {
              const size = 7;
              return (
                <g key={`e_${e.id}`} transform={`translate(${x}, ${y}) rotate(45)`}>
                  <rect
                    x={-size / 2}
                    y={-size / 2}
                    width={size}
                    height={size}
                    fill="#ff0000"
                    stroke="#ff6666"
                    strokeWidth={1}
                  />
                </g>
              );
            }
            if (x < 3 || x > radius * 2 - 3 || y < 3 || y > radius * 2 - 3) return null;
            return (
              <circle
                key={`e_${e.id}`}
                cx={x}
                cy={y}
                r={e.type === 'medium' ? 3 : 2}
                fill={enemyColorHex[e.type]}
                opacity={0.9}
              />
            );
          })}

          <g transform={`translate(${center}, ${center})`}>
            <polygon
              points="0,-7 5,6 -5,6"
              fill="#ffffff"
              stroke="#00ffff"
              strokeWidth={1}
              opacity={0.95}
            />
          </g>
        </svg>
      </div>

      {screenEdgeIndicators.map((ind) => {
        const margin = 60;
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const indRadius = Math.min(cx, cy) - margin;
        const x = cx + Math.cos(ind.angle) * indRadius;
        const y = cy + Math.sin(ind.angle) * indRadius;
        return (
          <div
            key={ind.id}
            className="fixed z-30 pointer-events-none"
            style={{
              left: x,
              top: y,
              transform: `translate(-50%, -50%) rotate(${ind.angle}rad)`,
            }}
          >
            <div
              className={`${ind.isBoss ? 'animate-pulse' : ''}`}
              style={{
                width: 0,
                height: 0,
                borderTop: ind.isBoss ? '12px solid transparent' : '8px solid transparent',
                borderBottom: ind.isBoss ? '12px solid transparent' : '8px solid transparent',
                borderLeft: ind.isBoss ? '18px solid #ff0000' : '12px solid #ff3366',
                filter: ind.isBoss
                  ? 'drop-shadow(0 0 8px rgba(255,0,0,0.9))'
                  : 'drop-shadow(0 0 5px rgba(255,51,102,0.7))',
              }}
            />
          </div>
        );
      })}
    </>
  );
};

export default Minimap;
