import * as THREE from 'three';
import { EnemyType, EnemyData } from './types';
import { ENEMY_CONFIGS, GAME_CONFIG } from './config';

export class EnemyFactory {
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  public createEnemy(type: EnemyType, wave: number): EnemyData {
    const config = ENEMY_CONFIGS[type];
    const speedMultiplier = 1 + (wave - 1) * 0.1;
    const group = new THREE.Group();

    this.createEnemyMesh(group, config);

    const x = (Math.random() - 0.5) * 20;
    const y = (Math.random() - 0.5) * 12;
    const z = -GAME_CONFIG.FIELD_DEPTH - Math.random() * 10;

    group.position.set(x, y, z);
    group.scale.setScalar(config.scale);

    this.scene.add(group);

    let shieldMesh: THREE.Mesh | undefined;
    if (config.hasShield) {
      shieldMesh = this.createShield(group);
    }

    return {
      id: `enemy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      mesh: group,
      hp: config.hp,
      maxHp: config.hp,
      position: group.position.clone(),
      velocity: new THREE.Vector3(0, 0, config.speed * speedMultiplier),
      hasShield: config.hasShield,
      shieldMesh,
      lastShotTime: 0,
      fireRate: config.fireRate / speedMultiplier,
    };
  }

  private createEnemyMesh(group: THREE.Group, config: typeof ENEMY_CONFIGS[string]): void {
    const bodyGeometry = new THREE.ConeGeometry(0.8, 1.8, 4);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: config.color,
      metalness: 0.7,
      roughness: 0.3,
      emissive: new THREE.Color(config.color).multiplyScalar(0.2),
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.x = -Math.PI / 2;
    group.add(body);

    const wingGeometry = new THREE.BoxGeometry(2, 0.1, 0.6);
    const wingMaterial = new THREE.MeshStandardMaterial({
      color: config.color,
      metalness: 0.6,
      roughness: 0.4,
      emissive: new THREE.Color(config.color).multiplyScalar(0.15),
    });
    const wings = new THREE.Mesh(wingGeometry, wingMaterial);
    wings.position.z = -0.2;
    group.add(wings);

    if (config.type === 'boss') {
      const extraWingGeometry = new THREE.BoxGeometry(3, 0.1, 0.4);
      const extraWings = new THREE.Mesh(extraWingGeometry, wingMaterial);
      extraWings.position.z = 0.3;
      group.add(extraWings);

      const turretGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.8, 8);
      const turretMaterial = new THREE.MeshStandardMaterial({
        color: 0xffff00,
        emissive: 0x333300,
      });
      const turret1 = new THREE.Mesh(turretGeometry, turretMaterial);
      turret1.position.set(0.8, 0, -0.5);
      turret1.rotation.x = Math.PI / 2;
      group.add(turret1);

      const turret2 = new THREE.Mesh(turretGeometry, turretMaterial);
      turret2.position.set(-0.8, 0, -0.5);
      turret2.rotation.x = Math.PI / 2;
      group.add(turret2);
    }

    const engineGeometry = new THREE.ConeGeometry(0.25, 0.5, 8);
    const engineMaterial = new THREE.MeshBasicMaterial({
      color: config.color,
      transparent: true,
      opacity: 0.7,
    });
    const engine = new THREE.Mesh(engineGeometry, engineMaterial);
    engine.rotation.x = Math.PI / 2;
    engine.position.z = 1;
    group.add(engine);
  }

  private createShield(group: THREE.Group): THREE.Mesh {
    const shieldGeometry = new THREE.SphereGeometry(1.8, 32, 32);
    const shieldMaterial = new THREE.MeshBasicMaterial({
      color: 0x00aaff,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
    });
    const shield = new THREE.Mesh(shieldGeometry, shieldMaterial);
    group.add(shield);
    return shield;
  }

  public updateEnemy(enemy: EnemyData, playerPosition: THREE.Vector3): boolean {
    enemy.position.add(enemy.velocity);

    const dx = playerPosition.x - enemy.position.x;
    const dy = playerPosition.y - enemy.position.y;
    enemy.position.x += dx * 0.001;
    enemy.position.y += dy * 0.001;

    enemy.mesh.position.copy(enemy.position);
    enemy.mesh.lookAt(playerPosition);

    if (enemy.shieldMesh) {
      enemy.shieldMesh.rotation.y += 0.02;
      enemy.shieldMesh.rotation.x += 0.01;
    }

    if (enemy.position.z > 5) {
      return true;
    }

    return false;
  }

  public shouldShoot(enemy: EnemyData, now: number): boolean {
    if (now - enemy.lastShotTime > enemy.fireRate && enemy.position.z > -30) {
      enemy.lastShotTime = now;
      return true;
    }
    return false;
  }

  public damage(enemy: EnemyData, amount: number): boolean {
    if (enemy.hasShield && enemy.shieldMesh) {
      enemy.hasShield = false;
      enemy.mesh.remove(enemy.shieldMesh);
      enemy.shieldMesh.geometry.dispose();
      (enemy.shieldMesh.material as THREE.Material).dispose();
      return false;
    }

    enemy.hp -= amount;
    return enemy.hp <= 0;
  }

  public removeEnemy(enemy: EnemyData): void {
    this.scene.remove(enemy.mesh);
    enemy.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
  }
}
