import * as THREE from 'three';
import { EnemyData, BulletData } from './types';

export class CollisionDetector {
  public static checkSphereCollision(
    pos1: THREE.Vector3,
    radius1: number,
    pos2: THREE.Vector3,
    radius2: number
  ): boolean {
    const distance = pos1.distanceTo(pos2);
    return distance < radius1 + radius2;
  }

  public static checkBulletEnemyCollision(
    bullet: BulletData,
    enemy: EnemyData
  ): boolean {
    const bulletRadius = bullet.isPlayerBullet ? 0.5 : 0.3;
    const enemyRadius = enemy.type === 'boss' ? 2.5 : enemy.type === 'medium' ? 1.2 : 0.8;
    return this.checkSphereCollision(
      bullet.position,
      bulletRadius,
      enemy.position,
      enemyRadius
    );
  }

  public static checkBulletPlayerCollision(
    bullet: BulletData,
    playerPos: THREE.Vector3,
    playerRadius: number
  ): boolean {
    if (bullet.isPlayerBullet) return false;
    const bulletRadius = 0.3;
    return this.checkSphereCollision(
      bullet.position,
      bulletRadius,
      playerPos,
      playerRadius
    );
  }

  public static checkEnemyPlayerCollision(
    enemy: EnemyData,
    playerPos: THREE.Vector3,
    playerRadius: number
  ): boolean {
    const enemyRadius = enemy.type === 'boss' ? 2.5 : enemy.type === 'medium' ? 1.2 : 0.8;
    return this.checkSphereCollision(
      enemy.position,
      enemyRadius,
      playerPos,
      playerRadius
    );
  }
}
