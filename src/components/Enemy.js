import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { canEnemyMoveTo, ENEMY_COLLISION_DISTANCE, PLAYER_COLLISION_DISTANCE } from './Collision.js';

// Enemy constants
export const ENEMY_SPEED = 35;
export const SPAWN_DELAY = 2.0;

// Four visible corner locations for the isometric camera frustum
export const SPAWN_CORNERS = [
  { x: -140, y: -140 }, // Left edge of screen
  { x: 80, y: -80 },    // Bottom edge of screen
  { x: -140, y: 140 },  // Top edge of screen
  { x: 140, y: 140 },   // Right edge of screen
];

const loader = new GLTFLoader();
let cachedModelTemplate = null;
let templateLoadingPromise = null;

export function loadEnemyTemplate() {
  if (!templateLoadingPromise) {
    templateLoadingPromise = new Promise((resolve, reject) => {
      loader.load(
        '/models/enemy.glb',
        (gltf) => {
          const model = gltf.scene;
          model.rotation.x = Math.PI / 2;
          model.scale.setScalar(5);

          // Calculate Z offset so enemy sits on top of the ground (Z = 0)
          const box = new THREE.Box3().setFromObject(model);
          model.position.z = -box.min.z;

          cachedModelTemplate = model;
          resolve(model);
        },
        undefined,
        (error) => {
          console.error('Error loading enemy.glb:', error);
          reject(error);
        }
      );
    });
  }
  return templateLoadingPromise;
}

// Start preloading template immediately
loadEnemyTemplate().catch(() => {});

export function createEnemy(x = 0, y = 0) {
  const enemy = new THREE.Group();
  enemy.position.set(x, y, 0);
  enemy.userData.speed = ENEMY_SPEED;
  enemy.userData.isEnemy = true;

  if (cachedModelTemplate) {
    const model = SkeletonUtils.clone(cachedModelTemplate);
    enemy.add(model);
    enemy.userData.model = model;
  } else {
    loadEnemyTemplate().then((template) => {
      const model = SkeletonUtils.clone(template);
      enemy.add(model);
      enemy.userData.model = model;
    });
  }

  return enemy;
}

export function spawnEnemyAtCorner(scene, enemies, cornerIndex = 0) {
  const corner = SPAWN_CORNERS[cornerIndex % SPAWN_CORNERS.length];
  const enemy = createEnemy(corner.x, corner.y);
  scene.add(enemy);
  enemies.push(enemy);
  return enemy;
}

export function clearAndRespawnEnemies(scene, enemies) {
  for (let i = 0; i < enemies.length; i++) {
    scene.remove(enemies[i]);
  }
  enemies.length = 0;

  for (let i = 0; i < SPAWN_CORNERS.length; i++) {
    spawnEnemyAtCorner(scene, enemies, i);
  }
}

export function updateEnemies(enemies, player, delta, speed = ENEMY_SPEED, obstacles = []) {
  if (!enemies || !player) return;

  const playerPos = player.position;

  for (let i = 0; i < enemies.length; i++) {
    const enemy = enemies[i];
    // Dynamic speed parameter takes precedence when supplied
    const currentSpeed = speed !== undefined ? speed : (enemy.userData.speed || ENEMY_SPEED);

    // Direction vector toward player in XY plane
    const dx = playerPos.x - enemy.position.x;
    const dy = playerPos.y - enemy.position.y;
    const distance = Math.hypot(dx, dy);

    if (distance > 1) {
      const dirX = dx / distance;
      const dirY = dy / distance;

      // Rotate enemy to face the player based on direction in XY plane
      enemy.rotation.z = Math.atan2(dirX, -dirY);

      // Calculate intended next coordinates
      const step = currentSpeed * delta;
      const nextX = enemy.position.x + dirX * step;
      const nextY = enemy.position.y + dirY * step;

      // Validate collision rules: Enemy vs Enemy AND Enemy vs Houses
      if (canEnemyMoveTo(i, nextX, nextY, enemies, obstacles)) {
        enemy.position.x = nextX;
        enemy.position.y = nextY;
      } else {
        // Try axis sliding if direct diagonal step is blocked by another enemy or house
        if (canEnemyMoveTo(i, nextX, enemy.position.y, enemies, obstacles)) {
          enemy.position.x = nextX;
        } else if (canEnemyMoveTo(i, enemy.position.x, nextY, enemies, obstacles)) {
          enemy.position.y = nextY;
        }
      }
    }
  }
}

export default createEnemy;
