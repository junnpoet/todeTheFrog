import * as THREE from 'three';

// Calibrated collision radii calculated directly from model vertex boundaries:
// Tode (scaled x20): half-width = 10, half-depth = 7.6 -> effective radius ~ 9 units
// Enemy (scaled x5): body half-width = 3.8, with wings = 5.5 -> effective radius ~ 5 units
export const PLAYER_RADIUS = 9;
export const ENEMY_RADIUS = 5;

// Exact physical contact distances to prevent invisible barriers
export const PLAYER_COLLISION_DISTANCE = PLAYER_RADIUS + ENEMY_RADIUS; // 14 units
export const ENEMY_COLLISION_DISTANCE = ENEMY_RADIUS + ENEMY_RADIUS;   // 10 units
export const COLLISION_DISTANCE = PLAYER_COLLISION_DISTANCE;

/**
 * Checks for 2D collision between a circular entity (x, y, radius) and a house AABB in the XY plane.
 *
 * @param {number} x Entity center X
 * @param {number} y Entity center Y
 * @param {number} radius Entity collision radius
 * @param {THREE.Object3D} house House object
 * @returns {boolean} True if collision detected
 */
export function isCircleCollidingWithHouse(x, y, radius, house) {
  let box = house.userData.boundingBox;
  if (!box) {
    box = new THREE.Box3().setFromObject(house);
    house.userData.boundingBox = box;
  }

  // Find the closest point on the AABB rectangle to the circle center
  const closestX = Math.max(box.min.x, Math.min(x, box.max.x));
  const closestY = Math.max(box.min.y, Math.min(y, box.max.y));

  const distX = x - closestX;
  const distY = y - closestY;
  const distSq = distX * distX + distY * distY;

  return distSq < radius * radius;
}

/**
 * Checks for collision between player and any enemy.
 * Returns true if an enemy is within collision distance of the player.
 */
export function checkPlayerEnemyCollision(player, enemies, minDistance = PLAYER_COLLISION_DISTANCE) {
  if (!player || !enemies || enemies.length === 0) return false;
  const px = player.position.x;
  const py = player.position.y;

  for (let i = 0; i < enemies.length; i++) {
    const enemy = enemies[i];
    const dist = Math.hypot(px - enemy.position.x, py - enemy.position.y);
    if (dist <= minDistance) {
      return true;
    }
  }

  return false;
}

/**
 * Checks if a 2D target position (targetX, targetY) is clear of collisions with obstacles (e.g. houses).
 * Prevents the player from jumping into or through houses.
 */
export function canPlayerMoveTo(targetX, targetY, obstacles = [], playerRadius = PLAYER_RADIUS) {
  if (!obstacles || obstacles.length === 0) return true;

  for (let i = 0; i < obstacles.length; i++) {
    const obs = obstacles[i];
    if (obs.userData && obs.userData.isHouse) {
      if (isCircleCollidingWithHouse(targetX, targetY, playerRadius, obs)) {
        return false; // Collision with house detected
      }
    } else if (obs.position) {
      const dist = Math.hypot(targetX - obs.position.x, targetY - obs.position.y);
      if (dist < playerRadius) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Checks if an enemy moving to (nextX, nextY) is collision-free against other enemies and obstacles (houses).
 * Note: Player collision is intentionally NOT blocked here so moving enemies can collide with the player to trigger Game Over.
 */
export function canEnemyMoveTo(
  enemyIndex,
  nextX,
  nextY,
  enemies = [],
  obstaclesOrPlayer = [],
  maybeObstacles = [],
  enemyMinDistance = ENEMY_COLLISION_DISTANCE
) {
  // Check against other enemies to prevent enemy overlapping
  if (enemies) {
    for (let i = 0; i < enemies.length; i++) {
      if (i === enemyIndex) continue;
      const other = enemies[i];
      const distToOther = Math.hypot(nextX - other.position.x, nextY - other.position.y);
      if (distToOther < enemyMinDistance) {
        return false;
      }
    }
  }

  // Determine obstacles array (handles both (enemies, obstacles) and (enemies, player, obstacles) signatures)
  const obstacles = Array.isArray(obstaclesOrPlayer)
    ? obstaclesOrPlayer
    : (Array.isArray(maybeObstacles) ? maybeObstacles : []);

  if (obstacles) {
    for (let i = 0; i < obstacles.length; i++) {
      const obs = obstacles[i];
      if (obs.userData && obs.userData.isHouse) {
        if (isCircleCollidingWithHouse(nextX, nextY, ENEMY_RADIUS, obs)) {
          return false; // Collision with house detected
        }
      } else if (obs.position && obs.userData && !obs.userData.isPlayer) {
        const dist = Math.hypot(nextX - obs.position.x, nextY - obs.position.y);
        if (dist < enemyMinDistance) {
          return false;
        }
      }
    }
  }

  return true;
}

export default {
  PLAYER_RADIUS,
  ENEMY_RADIUS,
  COLLISION_DISTANCE,
  PLAYER_COLLISION_DISTANCE,
  ENEMY_COLLISION_DISTANCE,
  isCircleCollidingWithHouse,
  checkPlayerEnemyCollision,
  canPlayerMoveTo,
  canEnemyMoveTo,
};
