import * as THREE from 'three';
import { GAME_CONFIG } from './config';

export class PlayerShip {
  public mesh: THREE.Group;
  public position: THREE.Vector3;
  public rotation: THREE.Vector3;
  private targetRotation: THREE.Vector3;
  private engineLight: THREE.PointLight;

  constructor() {
    this.mesh = new THREE.Group();
    this.position = new THREE.Vector3(0, 0, 0);
    this.rotation = new THREE.Vector3(0, 0, 0);
    this.targetRotation = new THREE.Vector3(0, 0, 0);

    this.createShip();
    this.engineLight = new THREE.PointLight(0x00ffff, 1, 5);
    this.engineLight.position.set(0, -0.5, -1.5);
    this.mesh.add(this.engineLight);
  }

  private createShip(): void {
    const bodyGeometry = new THREE.ConeGeometry(0.8, 2, 4);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x003333,
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.x = Math.PI / 2;
    this.mesh.add(body);

    const wingGeometry = new THREE.BoxGeometry(2.5, 0.1, 0.8);
    const wingMaterial = new THREE.MeshStandardMaterial({
      color: 0xff00ff,
      metalness: 0.7,
      roughness: 0.3,
      emissive: 0x330033,
    });
    const wings = new THREE.Mesh(wingGeometry, wingMaterial);
    wings.position.z = 0.2;
    this.mesh.add(wings);

    const cockpitGeometry = new THREE.SphereGeometry(0.4, 16, 16);
    const cockpitMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ccff,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0x002244,
      transparent: true,
      opacity: 0.8,
    });
    const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
    cockpit.position.z = -0.3;
    this.mesh.add(cockpit);

    const engineGeometry = new THREE.ConeGeometry(0.3, 0.6, 8);
    const engineMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.8,
    });
    const engine = new THREE.Mesh(engineGeometry, engineMaterial);
    engine.rotation.x = -Math.PI / 2;
    engine.position.z = 1.2;
    this.mesh.add(engine);

    const engineGlowGeometry = new THREE.SphereGeometry(0.4, 16, 16);
    const engineGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.5,
    });
    const engineGlow = new THREE.Mesh(engineGlowGeometry, engineGlowMaterial);
    engineGlow.position.z = 1.5;
    this.mesh.add(engineGlow);
  }

  public update(
    keys: Set<string>,
    mouseX: number,
    mouseY: number
  ): void {
    const speed = GAME_CONFIG.PLAYER_SPEED;
    let dx = 0;
    let dy = 0;

    if (keys.has('w') || keys.has('arrowup')) dy += speed;
    if (keys.has('s') || keys.has('arrowdown')) dy -= speed;
    if (keys.has('a') || keys.has('arrowleft')) dx -= speed;
    if (keys.has('d') || keys.has('arrowright')) dx += speed;

    this.position.x = THREE.MathUtils.clamp(
      this.position.x + dx,
      -GAME_CONFIG.PLAYER_BOUNDARY_X,
      GAME_CONFIG.PLAYER_BOUNDARY_X
    );
    this.position.y = THREE.MathUtils.clamp(
      this.position.y + dy,
      -GAME_CONFIG.PLAYER_BOUNDARY_Y,
      GAME_CONFIG.PLAYER_BOUNDARY_Y
    );

    this.targetRotation.z = -mouseX * 0.5;
    this.targetRotation.x = -mouseY * 0.3;

    this.rotation.lerp(this.targetRotation, 0.1);

    this.mesh.position.copy(this.position);
    this.mesh.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);

    const time = Date.now() * 0.01;
    this.engineLight.intensity = 0.8 + Math.sin(time) * 0.2;
  }

  public getShootPosition(): THREE.Vector3 {
    return new THREE.Vector3(
      this.position.x,
      this.position.y,
      this.position.z - 2
    );
  }

  public getBoundingRadius(): number {
    return 1.2;
  }
}
