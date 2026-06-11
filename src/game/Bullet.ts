import * as THREE from 'three';
import { BulletData, EnemyData } from './types';
import { GAME_CONFIG } from './config';

interface TrailParticle {
  mesh: THREE.Mesh;
  life: number;
  maxLife: number;
}

export class BulletManager {
  private scene: THREE.Scene;
  private bullets: BulletData[] = [];
  private bulletIdCounter = 0;
  private trailParticles: Map<string, TrailParticle[]> = new Map();

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  public createPlayerBullet(
    position: THREE.Vector3,
    direction: THREE.Vector3 = new THREE.Vector3(0, 0, -1),
    type: 'laser' | 'scatter' = 'laser'
  ): BulletData {
    const bulletGeometry = new THREE.CylinderGeometry(0.08, 0.08, 1.5, 8);
    const color = type === 'laser' ? 0x00ffff : 0x00ff66;
    const bulletMaterial = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.9,
    });
    const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);

    bullet.position.copy(position);
    bullet.rotation.x = Math.PI / 2;

    const glowGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1.2, 8);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.3,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.rotation.x = Math.PI / 2;
    bullet.add(glow);

    this.scene.add(bullet);

    const velocity = direction.clone().normalize().multiplyScalar(GAME_CONFIG.BULLET_SPEED);
    const damage = type === 'scatter' ? GAME_CONFIG.SCATTER_DAMAGE : GAME_CONFIG.LASER_DAMAGE;

    const id = `bullet_${this.bulletIdCounter++}`;
    const data: BulletData = {
      id,
      mesh: bullet,
      position: position.clone(),
      velocity,
      isPlayerBullet: true,
      damage,
      type,
    };
    this.bullets.push(data);
    return data;
  }

  public createScatterBullets(position: THREE.Vector3): BulletData[] {
    const bullets: BulletData[] = [];
    const count = GAME_CONFIG.SCATTER_BULLET_COUNT;
    const spread = GAME_CONFIG.SCATTER_SPREAD_ANGLE;
    const baseDir = new THREE.Vector3(0, 0, -1);

    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0.5 : i / (count - 1);
      const angle = (t - 0.5) * 2 * spread;
      const dir = baseDir.clone();
      dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
      bullets.push(this.createPlayerBullet(position, dir, 'scatter'));
    }
    return bullets;
  }

  public createMissile(
    position: THREE.Vector3,
    enemies: EnemyData[]
  ): BulletData | null {
    let targetEnemy: EnemyData | null = null;
    let minDist = Infinity;

    for (const enemy of enemies) {
      const dist = position.distanceTo(enemy.position);
      if (dist < minDist) {
        minDist = dist;
        targetEnemy = enemy;
      }
    }

    const missileGroup = new THREE.Group();

    const bodyGeometry = new THREE.CylinderGeometry(0.15, 0.2, 0.8, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0xff6600,
      metalness: 0.7,
      roughness: 0.3,
      emissive: 0xff3300,
      emissiveIntensity: 0.5,
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.x = Math.PI / 2;
    missileGroup.add(body);

    const coneGeometry = new THREE.ConeGeometry(0.15, 0.4, 8);
    const coneMaterial = new THREE.MeshStandardMaterial({
      color: 0xffaa00,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0xff6600,
      emissiveIntensity: 0.4,
    });
    const cone = new THREE.Mesh(coneGeometry, coneMaterial);
    cone.rotation.x = Math.PI / 2;
    cone.position.z = -0.6;
    missileGroup.add(cone);

    const finGeometry = new THREE.BoxGeometry(0.02, 0.4, 0.15);
    const finMaterial = new THREE.MeshStandardMaterial({
      color: 0xcc3300,
      metalness: 0.5,
      roughness: 0.5,
    });
    const fin1 = new THREE.Mesh(finGeometry, finMaterial);
    fin1.position.set(0.18, 0, 0.3);
    missileGroup.add(fin1);
    const fin2 = new THREE.Mesh(finGeometry, finMaterial);
    fin2.position.set(-0.18, 0, 0.3);
    missileGroup.add(fin2);
    const fin3 = fin1.clone();
    fin3.rotation.z = Math.PI / 2;
    fin3.position.set(0, 0.18, 0.3);
    missileGroup.add(fin3);
    const fin4 = fin2.clone();
    fin4.rotation.z = Math.PI / 2;
    fin4.position.set(0, -0.18, 0.3);
    missileGroup.add(fin4);

    missileGroup.position.copy(position);
    missileGroup.rotation.x = Math.PI / 2;

    this.scene.add(missileGroup);

    const baseDir = new THREE.Vector3(0, 0, -1);
    const velocity = baseDir.multiplyScalar(GAME_CONFIG.MISSILE_SPEED);

    const id = `missile_${this.bulletIdCounter++}`;
    const data: BulletData = {
      id,
      mesh: missileGroup,
      position: position.clone(),
      velocity,
      isPlayerBullet: true,
      damage: GAME_CONFIG.MISSILE_DAMAGE,
      type: 'missile',
      targetId: targetEnemy?.id,
    };
    this.bullets.push(data);
    this.trailParticles.set(id, []);
    return data;
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
      damage: 1,
      type: 'enemy',
    });
  }

  private spawnMissileTrail(bullet: BulletData): void {
    const trailId = bullet.id;
    const trails = this.trailParticles.get(trailId);
    if (!trails) return;

    for (let i = 0; i < 2; i++) {
      const geometry = new THREE.SphereGeometry(0.1 + Math.random() * 0.1, 6, 6);
      const color = Math.random() > 0.5 ? 0xff6600 : 0xffcc00;
      const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.8,
      });
      const particle = new THREE.Mesh(geometry, material);
      particle.position.copy(bullet.position);
      particle.position.x += (Math.random() - 0.5) * 0.2;
      particle.position.y += (Math.random() - 0.5) * 0.2;
      particle.position.z += 0.5;
      this.scene.add(particle);
      const life = 15 + Math.random() * 15;
      trails.push({
        mesh: particle,
        life,
        maxLife: life,
      });
    }
  }

  private updateTrailParticles(bulletId: string): void {
    const trails = this.trailParticles.get(bulletId);
    if (!trails) return;

    for (let i = trails.length - 1; i >= 0; i--) {
      const p = trails[i];
      p.life--;
      const opacity = p.life / p.maxLife;
      (p.mesh.material as THREE.MeshBasicMaterial).opacity = opacity;
      p.mesh.scale.setScalar(opacity);

      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        (p.mesh.material as THREE.Material).dispose();
        trails.splice(i, 1);
      }
    }
  }

  private clearTrailParticles(bulletId: string): void {
    const trails = this.trailParticles.get(bulletId);
    if (!trails) return;
    for (const p of trails) {
      this.scene.remove(p.mesh);
      p.mesh.geometry.dispose();
      (p.mesh.material as THREE.Material).dispose();
    }
    this.trailParticles.delete(bulletId);
  }

  public update(enemies?: EnemyData[]): BulletData[] {
    const toRemove: BulletData[] = [];

    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];

      if (bullet.type === 'missile' && enemies && enemies.length > 0) {
        let target: EnemyData | undefined;
        if (bullet.targetId) {
          target = enemies.find((e) => e.id === bullet.targetId);
        }
        if (!target) {
          let minDist = Infinity;
          for (const e of enemies) {
            const d = bullet.position.distanceTo(e.position);
            if (d < minDist) {
              minDist = d;
              target = e;
            }
          }
          if (target) bullet.targetId = target.id;
        }

        if (target) {
          const desiredDir = new THREE.Vector3()
            .subVectors(target.position, bullet.position)
            .normalize();
          bullet.velocity.lerp(
            desiredDir.multiplyScalar(GAME_CONFIG.MISSILE_SPEED),
            GAME_CONFIG.MISSILE_TRACKING_STRENGTH
          );
        }

        this.spawnMissileTrail(bullet);
        this.updateTrailParticles(bullet.id);

        if (bullet.mesh instanceof THREE.Group) {
          const dir = bullet.velocity.clone().normalize();
          const lookTarget = bullet.position.clone().add(dir);
          bullet.mesh.lookAt(lookTarget);
          bullet.mesh.rotateX(Math.PI / 2);
        }
      }

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
    const disposeMesh = (mesh: THREE.Object3D) => {
      if (mesh instanceof THREE.Mesh) {
        mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose());
        } else {
          mesh.material.dispose();
        }
      }
    };

    if (bullet.mesh instanceof THREE.Group) {
      bullet.mesh.traverse(disposeMesh);
    } else {
      disposeMesh(bullet.mesh);
    }

    if (bullet.type === 'missile') {
      this.clearTrailParticles(bullet.id);
    }
  }

  public getBullets(): BulletData[] {
    return this.bullets;
  }

  public clearAll(): void {
    for (const bullet of this.bullets) {
      this.scene.remove(bullet.mesh);
      const disposeMesh = (mesh: THREE.Object3D) => {
        if (mesh instanceof THREE.Mesh) {
          mesh.geometry.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else {
            mesh.material.dispose();
          }
        }
      };
      if (bullet.mesh instanceof THREE.Group) {
        bullet.mesh.traverse(disposeMesh);
      } else {
        disposeMesh(bullet.mesh);
      }
      if (bullet.type === 'missile') {
        this.clearTrailParticles(bullet.id);
      }
    }
    this.bullets = [];
  }
}
