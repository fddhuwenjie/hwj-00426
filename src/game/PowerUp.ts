import * as THREE from 'three';
import { PowerUpData, PowerUpType } from './types';
import { POWER_UP_COLORS, GAME_CONFIG } from './config';

export class PowerUpManager {
  private scene: THREE.Scene;
  private powerUps: PowerUpData[] = [];
  private powerUpIdCounter = 0;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  public createPowerUp(
    position: THREE.Vector3,
    type: PowerUpType
  ): void {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const color = POWER_UP_COLORS[type];
    const material = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.5,
      metalness: 0.8,
      roughness: 0.2,
      transparent: true,
      opacity: 0.9,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);

    const edgeGeometry = new THREE.EdgesGeometry(geometry);
    const edgeMaterial = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.8 });
    const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
    mesh.add(edges);

    this.scene.add(mesh);

    this.powerUps.push({
      id: `powerup_${this.powerUpIdCounter++}`,
      type,
      mesh,
      position: position.clone(),
    });
  }

  public update(playerPosition: THREE.Vector3): PowerUpData | null {
    let collectedPowerUp: PowerUpData | null = null;

    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.powerUps[i];

      powerUp.mesh.rotation.x += 0.02;
      powerUp.mesh.rotation.y += 0.03;

      powerUp.position.z += 0.02;
      powerUp.mesh.position.copy(powerUp.position);

      const distance = powerUp.position.distanceTo(playerPosition);
      if (distance < 2) {
        collectedPowerUp = powerUp;
        this.removePowerUp(powerUp);
        continue;
      }

      if (powerUp.position.z > 10) {
        this.removePowerUp(powerUp);
      }
    }

    return collectedPowerUp;
  }

  private removePowerUp(powerUp: PowerUpData): void {
    const index = this.powerUps.indexOf(powerUp);
    if (index > -1) {
      this.powerUps.splice(index, 1);
    }

    this.scene.remove(powerUp.mesh);
    powerUp.mesh.geometry.dispose();
    if (Array.isArray(powerUp.mesh.material)) {
      powerUp.mesh.material.forEach((m) => m.dispose());
    } else {
      powerUp.mesh.material.dispose();
    }
  }

  public getPowerUps(): PowerUpData[] {
    return this.powerUps;
  }

  public clearAll(): void {
    for (const powerUp of this.powerUps) {
      this.scene.remove(powerUp.mesh);
      powerUp.mesh.geometry.dispose();
      if (Array.isArray(powerUp.mesh.material)) {
        powerUp.mesh.material.forEach((m) => m.dispose());
      } else {
        powerUp.mesh.material.dispose();
      }
    }
    this.powerUps = [];
  }

  public shouldDropPowerUp(): boolean {
    return Math.random() < GAME_CONFIG.POWER_UP_DROP_CHANCE;
  }

  public getRandomPowerUpType(): PowerUpType {
    const types: PowerUpType[] = ['health', 'fireRate', 'shield', 'scatter'];
    return types[Math.floor(Math.random() * types.length)];
  }
}
