import * as THREE from 'three';

// Attack constants
export const ATTACK_COOLDOWN = 1.0;
export const ATTACK_RADIUS = 35;
export const ATTACK_DURATION = 0.35;

export class AttackSystem {
  constructor(scene, player, enemies) {
    this.scene = scene;
    this.player = player;
    this.enemies = enemies;
    this.cooldown = ATTACK_COOLDOWN;
    this.remainingCooldown = 0;
    this.radius = ATTACK_RADIUS;
    this.enabled = true;

    // Visual feedback circle
    this.currentGeometryRadius = this.radius;
    this.geometry = new THREE.CircleGeometry(this.radius, 32);
    this.material = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    this.circleMesh = new THREE.Mesh(this.geometry, this.material);
    this.circleMesh.visible = false;
    this.scene.add(this.circleMesh);

    this.activeDuration = 0;
    this.onEnemyDefeated = null;

    // Space key listener
    window.addEventListener('keydown', (event) => {
      if (event.code === 'Space') {
        if (!this.enabled || this.player?.userData?.canAttack === false) return;
        event.preventDefault();
        this.executeAttack();
      }
    });
  }

  canAttack() {
    return (
      this.enabled &&
      this.player?.userData?.canAttack !== false &&
      this.remainingCooldown <= 0
    );
  }

  executeAttack() {
    if (!this.canAttack()) return;

    // Apply attack cooldown
    const currentCooldown = this.player.userData.attackCooldown || this.cooldown;
    const currentRadius = this.player.userData.attackRadius || this.radius;
    this.remainingCooldown = currentCooldown;

    // Update geometry if radius was modified dynamically
    if (this.currentGeometryRadius !== currentRadius) {
      this.circleMesh.geometry.dispose();
      this.circleMesh.geometry = new THREE.CircleGeometry(currentRadius, 32);
      this.currentGeometryRadius = currentRadius;
    }

    // Place circle on ground plane (XY) around player with small Z offset (z = 0.25)
    this.circleMesh.position.set(this.player.position.x, this.player.position.y, 0.25);
    this.material.opacity = 0.8;
    this.circleMesh.visible = true;
    this.activeDuration = ATTACK_DURATION;

    // Combat logic: detect collisions between attack area and enemies
    const playerX = this.player.position.x;
    const playerY = this.player.position.y;

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      const dist = Math.hypot(enemy.position.x - playerX, enemy.position.y - playerY);

      if (dist <= currentRadius) {
        // Remove defeated enemy from scene and delete from tracking array
        this.scene.remove(enemy);
        this.enemies.splice(i, 1);

        if (typeof this.onEnemyDefeated === 'function') {
          this.onEnemyDefeated(enemy);
        }
      }
    }
  }

  reset() {
    this.enabled = true;
    this.remainingCooldown = 0;
    this.activeDuration = 0;
    if (this.circleMesh) {
      this.circleMesh.visible = false;
    }
  }

  update(delta) {
    // Decrease remaining cooldown time
    if (this.remainingCooldown > 0) {
      this.remainingCooldown = Math.max(0, this.remainingCooldown - delta);
    }

    // Fade out visual feedback
    if (this.activeDuration > 0) {
      this.activeDuration -= delta;
      const progress = Math.max(0, this.activeDuration / ATTACK_DURATION);
      this.material.opacity = progress * 0.8;

      if (this.activeDuration <= 0) {
        this.circleMesh.visible = false;
      }
    }
  }
}

export function createAttackSystem(scene, player, enemies) {
  return new AttackSystem(scene, player, enemies);
}

export default createAttackSystem;
