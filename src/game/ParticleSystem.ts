import * as THREE from 'three';
import { ParticleData } from './types';

export class ParticleSystem {
  private scene: THREE.Scene;
  private particles: ParticleData[] = [];
  private starField: THREE.Points | null = null;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.createStarField();
  }

  private createStarField(): void {
    const starsGeometry = new THREE.BufferGeometry();
    const starCount = 2000;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 100;
      positions[i3 + 1] = (Math.random() - 0.5) * 60;
      positions[i3 + 2] = (Math.random() - 0.5) * 100;

      const colorChoice = Math.random();
      if (colorChoice < 0.6) {
        colors[i3] = 1;
        colors[i3 + 1] = 1;
        colors[i3 + 2] = 1;
      } else if (colorChoice < 0.8) {
        colors[i3] = 0.7;
        colors[i3 + 1] = 0.8;
        colors[i3 + 2] = 1;
      } else {
        colors[i3] = 1;
        colors[i3 + 1] = 0.8;
        colors[i3 + 2] = 0.7;
      }

      sizes[i] = Math.random() * 2 + 0.5;
    }

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    starsGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const starsMaterial = new THREE.PointsMaterial({
      size: 0.3,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
    });

    this.starField = new THREE.Points(starsGeometry, starsMaterial);
    this.scene.add(this.starField);
  }

  public createExplosion(position: THREE.Vector3, color: number = 0xff6600, count: number = 30): void {
    for (let i = 0; i < count; i++) {
      const geometry = new THREE.SphereGeometry(0.1 + Math.random() * 0.2, 8, 8);
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color).offsetHSL(Math.random() * 0.1 - 0.05, 0, Math.random() * 0.2 - 0.1),
        transparent: true,
        opacity: 1,
      });

      const particle = new THREE.Mesh(geometry, material);
      particle.position.copy(position);

      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.4
      );

      const life = 30 + Math.random() * 30;

      this.scene.add(particle);

      this.particles.push({
        mesh: particle,
        velocity,
        life,
        maxLife: life,
      });
    }
  }

  public update(): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];

      particle.mesh.position.add(particle.velocity);
      particle.life--;

      const opacity = particle.life / particle.maxLife;
      (particle.mesh.material as THREE.MeshBasicMaterial).opacity = opacity;
      particle.mesh.scale.setScalar(opacity);

      if (particle.life <= 0) {
        this.removeParticle(particle);
      }
    }

    if (this.starField) {
      this.starField.rotation.z += 0.0002;
      const positions = this.starField.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 2] += 0.05;
        if (positions[i + 2] > 50) {
          positions[i + 2] = -50;
        }
      }
      this.starField.geometry.attributes.position.needsUpdate = true;
    }
  }

  private removeParticle(particle: ParticleData): void {
    const index = this.particles.indexOf(particle);
    if (index > -1) {
      this.particles.splice(index, 1);
    }

    this.scene.remove(particle.mesh);
    particle.mesh.geometry.dispose();
    (particle.mesh.material as THREE.Material).dispose();
  }

  public clearAll(): void {
    for (const particle of this.particles) {
      this.scene.remove(particle.mesh);
      particle.mesh.geometry.dispose();
      (particle.mesh.material as THREE.Material).dispose();
    }
    this.particles = [];
  }
}
