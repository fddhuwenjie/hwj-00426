import * as THREE from 'three';
import { BulletData } from './types';
import { GAME_CONFIG } from './config';

export class BulletManager {
  private scene: THREE.Scene;
  private bullets: BulletData[] = [];
  private bulletIdCounter = 0;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  public createPlayerBullet(
    position: THREE.Vector3,
    direction: THREE.Vector3 = new THREE.Vector3(0, 0, -1)
  ): void {
    const bulletGeometry = new THREE.CylinderGeometry(0.08, 0.08, 1.5, 8);
    const bulletMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.9,
    });
    const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);

    bullet.position.copy(position);
    bullet.rotation.x = Math.PI / 2;

    const glowGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1.2, 8);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.3,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.rotation.x = Math.PI / 2;
    bullet.add(glow);

    this.scene.add(bullet);

    const velocity = direction.clone().normalize().multiplyScalar(GAME_CONFIG.BULLET_SPEED);

    this.bullets.push({
      id: `bullet_${this.bulletIdCounter++}`,
      mesh: bullet,
      position: position.clone(),
      velocity,
      isPlayerBullet: true,
    });
  }

  public createEnemyBullet(
    position: THREE.Vector3,
    targetPosition: THREE.Vector3
  ): void {
    const direction = new THREE.Vector3()
      .subVectors(targetPosition, position)
      .normalize();

    const bulletGeometry = new THREE.SphereGeometry(0.2, 8, 8);
    const bulletMaterial = new THREE.MeshBasicMaterial({
      color: 0xff3366,
      transparent: true,
      opacity: 0.9,
    });
    const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);

    bullet.position.copy(position);

    const glowGeometry = new THREE.SphereGeometry(0.3, 8, 8);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xff3366,
      transparent: true,
      opacity: 0.3,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    bullet.add(glow);

    this.scene.add(bullet);

    const velocity = direction.multiplyScalar(GAME_CONFIG.ENEMY_BULLET_SPEED);

    this.bullets.push({
      id: `enemy_bullet_${this.bulletIdCounter++}`,
      mesh: bullet,
      position: position.clone(),
      velocity,
      isPlayerBullet: false,
    });
  }

  public update(): BulletData[] {
    const toRemove: BulletData[] = [];

    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      bullet.position.add(bullet.velocity);
      bullet.mesh.position.copy(bullet.position);

      if (
        bullet.position.z > 10 ||
        bullet.position.z < -GAME_CONFIG.FIELD_DEPTH - 20 ||
        Math.abs(bullet.position.x) > GAME_CONFIG.PLAYER_BOUNDARY_X + 10 ||
        Math.abs(bullet.position.y) > GAME_CONFIG.PLAYER_BOUNDARY_Y + 10
      ) {
        toRemove.push(bullet);
        this.removeBullet(bullet);
      }
    }

    return toRemove;
  }

  public removeBullet(bullet: BulletData): void {
    const index = this.bullets.indexOf(bullet);
    if (index > -1) {
      this.bullets.splice(index, 1);
    }

    this.scene.remove(bullet.mesh);
    if (bullet.mesh instanceof THREE.Mesh) {
      bullet.mesh.geometry.dispose();
      if (Array.isArray(bullet.mesh.material)) {
        bullet.mesh.material.forEach((m) => m.dispose());
      } else {
        bullet.mesh.material.dispose();
      }
    }
  }

  public getBullets(): BulletData[] {
    return this.bullets;
  }

  public clearAll(): void {
    for (const bullet of this.bullets) {
      this.scene.remove(bullet.mesh);
      if (bullet.mesh instanceof THREE.Mesh) {
        bullet.mesh.geometry.dispose();
        if (Array.isArray(bullet.mesh.material)) {
          bullet.mesh.material.forEach((m) => m.dispose());
        } else {
          bullet.mesh.material.dispose();
        }
      }
    }
    this.bullets = [];
  }
}
