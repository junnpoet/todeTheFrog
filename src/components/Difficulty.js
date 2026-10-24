// Complexity constants
export const COMPLEXITY_GROWTH_RATE = 0.01;

export const BASE_SPAWN_DELAY = 2.0;
export const MIN_SPAWN_DELAY = 0.5;

export const BASE_ENEMY_SPEED = 35;

export const BASE_PLAYER_SPEED = 6.0; // Responsive jump speed to prevent input queue delay

export const BASE_ATTACK_COOLDOWN = 1.0;
export const MIN_ATTACK_COOLDOWN = 0.35;

export const BASE_ATTACK_RADIUS = 35;
export const MAX_ATTACK_RADIUS = 55;

// Scaling factors: enemy parameters scale slightly faster than player parameters to maintain a challenge
export const ENEMY_SCALING_FACTOR = 1.2;
export const PLAYER_SCALING_FACTOR = 0.6;

/**
 * Calculates dynamic difficulty parameters based on current score.
 * Recalculated each frame in the animation loop.
 */
export function calculateDifficulty(score = 0) {
  const currentScore = Math.max(0, score);
  const growth = currentScore * COMPLEXITY_GROWTH_RATE;

  // Overall difficulty factor
  const difficultyFactor = 1 + growth;

  // Enemy scaling factor (scales faster)
  const enemyFactor = 1 + growth * ENEMY_SCALING_FACTOR;

  // Player scaling factor (scales slower)
  const playerFactor = 1 + growth * PLAYER_SCALING_FACTOR;

  // 1. Enemy spawn delay: decreases down to MIN_SPAWN_DELAY
  const spawnDelay = Math.max(MIN_SPAWN_DELAY, BASE_SPAWN_DELAY / enemyFactor);

  // 2. Enemy movement speed: increases linearly with enemy factor
  const enemySpeed = BASE_ENEMY_SPEED * enemyFactor;

  // 3. Player movement speed: slightly increases with player factor
  const playerSpeed = BASE_PLAYER_SPEED * playerFactor;

  // 4. Player attack delay (cooldown): decreases down to MIN_ATTACK_COOLDOWN
  const attackCooldown = Math.max(MIN_ATTACK_COOLDOWN, BASE_ATTACK_COOLDOWN / playerFactor);

  // 5. Player attack distance (radius): slightly increases up to MAX_ATTACK_RADIUS
  const attackRadius = Math.min(MAX_ATTACK_RADIUS, BASE_ATTACK_RADIUS * playerFactor);

  return {
    difficultyFactor,
    spawnDelay,
    enemySpeed,
    playerSpeed,
    attackCooldown,
    attackRadius,
  };
}

export default {
  COMPLEXITY_GROWTH_RATE,
  BASE_SPAWN_DELAY,
  MIN_SPAWN_DELAY,
  BASE_ENEMY_SPEED,
  BASE_PLAYER_SPEED,
  BASE_ATTACK_COOLDOWN,
  MIN_ATTACK_COOLDOWN,
  BASE_ATTACK_RADIUS,
  MAX_ATTACK_RADIUS,
  ENEMY_SCALING_FACTOR,
  PLAYER_SCALING_FACTOR,
  calculateDifficulty,
};
