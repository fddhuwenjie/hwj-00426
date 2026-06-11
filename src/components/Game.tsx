import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../store/useGameStore';
import { PlayerShip } from '../game/PlayerShip';
import { EnemyFactory } from '../game/Enemy';
import { BulletManager } from '../game/Bullet';
import { PowerUpManager } from '../game/PowerUp';
import { ParticleSystem } from '../game/ParticleSystem';
import { WaveManager } from '../game/WaveManager';
import { CollisionDetector } from '../game/CollisionDetector';
import { GAME_CONFIG, ENEMY_CONFIGS } from '../game/config';
import { EnemyData, PowerUpData } from '../game/types';

const Game = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameRef = useRef<number>(0);

  const playerShipRef = useRef<PlayerShip | null>(null);
  const enemyFactoryRef = useRef<EnemyFactory | null>(null);
  const bulletManagerRef = useRef<BulletManager | null>(null);
  const powerUpManagerRef = useRef<PowerUpManager | null>(null);
  const particleSystemRef = useRef<ParticleSystem | null>(null);
  const waveManagerRef = useRef<WaveManager | null>(null);

  const keysRef = useRef<Set<string>>(new Set());
  const mouseRef = useRef({ x: 0, y: 0 });
  const lastShotTimeRef = useRef(0);
  const enemiesRef = useRef<EnemyData[]>([]);
  const isShootingRef = useRef(false);

  const {
    gameState,
    player,
    setGameState,
    addScore,
    setWave,
    setEnemiesRemaining,
    setWaveTimer,
    setIsWaveBreak,
    resetGame,
    updatePlayer,
  } = useGameStore();

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);
    scene.fog = new THREE.Fog(0x0a0a1a, 30, 80);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, GAME_CONFIG.CAMERA_HEIGHT, GAME_CONFIG.CAMERA_DISTANCE);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(0x00ffff, 0.5, 30);
    pointLight1.position.set(-10, 5, -20);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff00ff, 0.5, 30);
    pointLight2.position.set(10, -5, -20);
    scene.add(pointLight2);

    const playerShip = new PlayerShip();
    scene.add(playerShip.mesh);
    playerShipRef.current = playerShip;

    enemyFactoryRef.current = new EnemyFactory(scene);
    bulletManagerRef.current = new BulletManager(scene);
    powerUpManagerRef.current = new PowerUpManager(scene);
    particleSystemRef.current = new ParticleSystem(scene);
    waveManagerRef.current = new WaveManager();

    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase());
      if (e.key === ' ') {
        e.preventDefault();
        isShootingRef.current = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase());
      if (e.key === ' ') {
        isShootingRef.current = false;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        isShootingRef.current = true;
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) {
        isShootingRef.current = false;
      }
    };

    const handleResize = () => {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('resize', handleResize);

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }

      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const playerShip = playerShipRef.current;
    const enemyFactory = enemyFactoryRef.current;
    const bulletManager = bulletManagerRef.current;
    const powerUpManager = powerUpManagerRef.current;
    const particleSystem = particleSystemRef.current;
    const waveManager = waveManagerRef.current;
    const camera = cameraRef.current;
    const scene = sceneRef.current;
    const renderer = rendererRef.current;

    if (!playerShip || !enemyFactory || !bulletManager || !powerUpManager || 
        !particleSystem || !waveManager || !camera || !scene || !renderer) return;

    waveManager.startWave(1);
    setWave(1);
    setEnemiesRemaining(waveManager.getTotalEnemiesThisWave());
    setIsWaveBreak(false);
    
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 16.67;
      lastTime = currentTime;

      const now = Date.now();

      if (player.fireRateBoost && now > player.fireRateEndTime) {
        updatePlayer({ fireRateBoost: false });
      }
      if (player.scatterBoost && now > player.scatterEndTime) {
        updatePlayer({ scatterBoost: false });
      }

      playerShip.update(keysRef.current, mouseRef.current.x, mouseRef.current.y, deltaTime);

      const targetCameraPos = new THREE.Vector3(
        playerShip.position.x * 0.3,
        playerShip.position.y * 0.3 + GAME_CONFIG.CAMERA_HEIGHT,
        GAME_CONFIG.CAMERA_DISTANCE
      );
      camera.position.lerp(targetCameraPos, 0.05);
      camera.lookAt(playerShip.position.x, playerShip.position.y, playerShip.position.z - 5);

      const cooldown = player.fireRateBoost 
        ? GAME_CONFIG.SHOOT_COOLDOWN_BOOSTED 
        : GAME_CONFIG.SHOOT_COOLDOWN;
      
      if (isShootingRef.current && now - lastShotTimeRef.current > cooldown) {
        const shootPos = playerShip.getShootPosition();
        
        if (player.scatterBoost) {
          bulletManager.createPlayerBullet(shootPos, new THREE.Vector3(-0.2, 0, -1));
          bulletManager.createPlayerBullet(shootPos, new THREE.Vector3(0, 0, -1));
          bulletManager.createPlayerBullet(shootPos, new THREE.Vector3(0.2, 0, -1));
        } else {
          bulletManager.createPlayerBullet(shootPos);
        }
        
        lastShotTimeRef.current = now;
      }

      const waveResult = waveManager.update(now);
      
      if (waveResult.isBreakComplete) {
        const nextWave = waveManager.getCurrentWave() + 1;
        waveManager.startWave(nextWave);
        setWave(nextWave);
        setEnemiesRemaining(waveManager.getTotalEnemiesThisWave());
        setIsWaveBreak(false);
      } else if (waveResult.isWaveComplete) {
        waveManager.startBreak();
        setIsWaveBreak(true);
        const bullets = bulletManager.getBullets();
        for (let i = bullets.length - 1; i >= 0; i--) {
          if (!bullets[i].isPlayerBullet) {
            bulletManager.removeBullet(bullets[i]);
          }
        }
      } else if (waveResult.shouldSpawn && waveResult.enemyType) {
        const enemy = enemyFactory.createEnemy(waveResult.enemyType, waveManager.getCurrentWave());
        enemiesRef.current.push(enemy);
        setEnemiesRemaining(enemiesRef.current.length);
      }

      setWaveTimer(waveManager.getRemainingTimeInWave(now));

      for (let i = enemiesRef.current.length - 1; i >= 0; i--) {
        const enemy = enemiesRef.current[i];
        const shouldRemove = enemyFactory.updateEnemy(enemy, playerShip.position, now);

        if (enemyFactory.shouldShoot(enemy, now)) {
          bulletManager.createEnemyBullet(
            enemy.position.clone().add(new THREE.Vector3(0, 0, 2)),
            playerShip.position
          );
        }

        if (shouldRemove) {
          enemyFactory.removeEnemy(enemy);
          enemiesRef.current.splice(i, 1);
          setEnemiesRemaining(enemiesRef.current.length);
        }
      }

      bulletManager.update();

      const collectedPowerUp = powerUpManager.update(playerShip.position);
      if (collectedPowerUp) {
        handlePowerUpCollection(collectedPowerUp, now);
        particleSystem.createExplosion(collectedPowerUp.position, 0x00ff00, 15);
      }

      particleSystem.update();

      const bullets = bulletManager.getBullets();
      for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        
        if (bullet.isPlayerBullet) {
          for (let j = enemiesRef.current.length - 1; j >= 0; j--) {
            const enemy = enemiesRef.current[j];
            if (CollisionDetector.checkBulletEnemyCollision(bullet, enemy)) {
              bulletManager.removeBullet(bullet);
              
              const isDead = enemyFactory.damage(enemy, 1);
              if (isDead) {
                const config = ENEMY_CONFIGS[enemy.type];
                addScore(config.score);
                particleSystem.createExplosion(enemy.position, config.color, enemy.type === 'boss' ? 60 : 30);
                
                if (powerUpManager.shouldDropPowerUp()) {
                  const powerUpType = powerUpManager.getRandomPowerUpType();
                  powerUpManager.createPowerUp(enemy.position.clone(), powerUpType);
                }
                
                enemyFactory.removeEnemy(enemy);
                enemiesRef.current.splice(j, 1);
                setEnemiesRemaining(enemiesRef.current.length);
              } else {
                particleSystem.createExplosion(bullet.position, 0xffff00, 10);
              }
              break;
            }
          }
        } else {
          if (CollisionDetector.checkBulletPlayerCollision(
            bullet, 
            playerShip.position, 
            playerShip.getBoundingRadius()
          )) {
            bulletManager.removeBullet(bullet);
            handlePlayerHit();
            particleSystem.createExplosion(bullet.position, 0xff0000, 15);
          }
        }
      }

      for (let i = enemiesRef.current.length - 1; i >= 0; i--) {
        const enemy = enemiesRef.current[i];
        if (CollisionDetector.checkEnemyPlayerCollision(
          enemy, 
          playerShip.position, 
          playerShip.getBoundingRadius()
        )) {
          const config = ENEMY_CONFIGS[enemy.type];
          particleSystem.createExplosion(enemy.position, config.color, 30);
          enemyFactory.removeEnemy(enemy);
          enemiesRef.current.splice(i, 1);
          setEnemiesRemaining(enemiesRef.current.length);
          handlePlayerHit();
        }
      }

      renderer.render(scene, camera);

      if (useGameStore.getState().gameState === 'playing') {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    const handlePlayerHit = () => {
      const currentState = useGameStore.getState();
      if (currentState.player.hasShield) {
        updatePlayer({ hasShield: false });
        particleSystem.createExplosion(playerShip.position, 0x0099ff, 30);
      } else {
        const newHp = currentState.player.hp - 1;
        updatePlayer({ hp: newHp });
        particleSystem.createExplosion(playerShip.position, 0xff3366, 20);
        
        if (newHp <= 0) {
          setGameState('gameover');
        }
      }
    };

    const handlePowerUpCollection = (powerUp: PowerUpData, now: number) => {
      switch (powerUp.type) {
        case 'health':
          const newHp = Math.min(player.hp + 1, GAME_CONFIG.PLAYER_MAX_HP);
          updatePlayer({ hp: newHp });
          break;
        case 'fireRate':
          updatePlayer({ 
            fireRateBoost: true, 
            fireRateEndTime: now + GAME_CONFIG.POWER_UP_DURATION 
          });
          break;
        case 'shield':
          updatePlayer({ hasShield: true });
          break;
        case 'scatter':
          updatePlayer({ 
            scatterBoost: true, 
            scatterEndTime: now + GAME_CONFIG.POWER_UP_DURATION 
          });
          break;
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'start' || gameState === 'gameover') {
      if (playerShipRef.current && sceneRef.current) {
        sceneRef.current.remove(playerShipRef.current.mesh);
      }
      if (bulletManagerRef.current) {
        bulletManagerRef.current.clearAll();
      }
      if (powerUpManagerRef.current) {
        powerUpManagerRef.current.clearAll();
      }
      if (particleSystemRef.current) {
        particleSystemRef.current.clearAll();
      }
      if (enemyFactoryRef.current) {
        for (const enemy of enemiesRef.current) {
          enemyFactoryRef.current.removeEnemy(enemy);
        }
      }
      enemiesRef.current = [];
      if (waveManagerRef.current) {
        waveManagerRef.current.reset();
      }
      
      if (gameState === 'gameover') {
        resetGame();
      }
    }

    if (gameState === 'playing' && playerShipRef.current && sceneRef.current) {
      playerShipRef.current.position.set(0, 0, 0);
      sceneRef.current.add(playerShipRef.current.mesh);
    }
  }, [gameState]);

  return <div ref={containerRef} className="w-full h-full" />;
};

export default Game;
