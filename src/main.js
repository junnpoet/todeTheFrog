import * as THREE from 'three';
import './style.css';
import { createPlayer, updatePlayer, resetPlayer } from './components/Player.js';
import { createCamera } from './components/Camera.js';
import { createRenderer } from './components/Renderer.js';
import {
  spawnEnemyAtCorner,
  updateEnemies,
  clearAndRespawnEnemies,
  SPAWN_DELAY,
  SPAWN_CORNERS,
} from './components/Enemy.js';
import { createAttackSystem } from './components/Attack.js';
import { createScoreSystem } from './components/Score.js';
import { checkPlayerEnemyCollision } from './components/Collision.js';
import { createGameState } from './components/GameState.js';
import { calculateDifficulty } from './components/Difficulty.js';
import { createMap } from './components/Map.js';
import { loadHouses } from './components/House.js';

// Scene setup
const scene = new THREE.Scene();
window.scene = scene;

// Map background (checkerboard floor)
const map = createMap();
scene.add(map);
window.map = map;

// Obstacles (houses)
const houses = [];
window.houses = houses;

// Load houses and add to map group
loadHouses(map)
  .then((loadedHouses) => {
    houses.push(...loadedHouses);
  })
  .catch((err) => {
    console.error('Failed to load houses:', err);
  });

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(-100, -100, 200);
scene.add(directionalLight);

// Player
const player = createPlayer();
scene.add(player);
window.player = player;

// Camera
const camera = createCamera();
scene.add(camera);
window.camera = camera;

// Renderer
const renderer = createRenderer();

// Clock for frame delta calculation
const clock = new THREE.Clock();

// Enemies state
const enemies = [];
window.enemies = enemies;
let spawnTimer = 0;
let nextCornerIndex = 0;

// Score system
const scoreSystem = createScoreSystem();
window.scoreSystem = scoreSystem;

// Attack system
const attackSystem = createAttackSystem(scene, player, enemies);
window.attackSystem = attackSystem;

// Hook enemy defeat into score system (10 points per kill)
attackSystem.onEnemyDefeated = () => {
  scoreSystem.onEnemyDefeated();
};

// Spawn initial enemies at the 4 corners of the map
for (let i = 0; i < SPAWN_CORNERS.length; i++) {
  spawnEnemyAtCorner(scene, enemies, i);
}

// Game state management
const gameState = createGameState({
  scene,
  player,
  enemies,
  scoreSystem,
  attackSystem,
  onReset: () => {
    resetPlayer(player);
    clearAndRespawnEnemies(scene, enemies);
    spawnTimer = 0;
    nextCornerIndex = 0;
  },
});
window.gameState = gameState;

// Resize handling
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
renderer.setAnimationLoop(() => {
  const delta = clock.getDelta();

  if (gameState.isPlaying()) {
    // 1. Recalculate dynamic difficulty parameters using current score
    const currentScore = scoreSystem.getScore();
    const difficulty = calculateDifficulty(currentScore);

    // 2. Apply updated speeds and delays to the respective game systems
    player.userData.moveSpeed = difficulty.playerSpeed;
    player.userData.attackCooldown = difficulty.attackCooldown;
    player.userData.attackRadius = difficulty.attackRadius;

    // Process player movement with house collision prevention
    updatePlayer(player, delta, houses);

    // Collision check: player vs enemies (handling Game Over has higher priority)
    if (checkPlayerEnemyCollision(player, enemies)) {
      gameState.triggerGameOver();
      renderer.render(scene, camera);
      return;
    }

    // Periodic enemy spawning using accumulated delta timer and dynamic spawn delay
    spawnTimer += delta;
    if (spawnTimer >= difficulty.spawnDelay) {
      spawnTimer = 0;
      spawnEnemyAtCorner(scene, enemies, nextCornerIndex++);
    }

    // Update enemy positions with dynamic speed, enemy-enemy and enemy-house collision prevention
    updateEnemies(enemies, player, delta, difficulty.enemySpeed, houses);

    // Collision check: moving enemies vs player (moving enemies trigger Game Over on contact)
    if (checkPlayerEnemyCollision(player, enemies)) {
      gameState.triggerGameOver();
      renderer.render(scene, camera);
      return;
    }

    // Update attack cooldown and visual effect fade-out
    attackSystem.update(delta);

    // Update score based on survival time (0.1 points/second)
    scoreSystem.update(delta);
  }

  // Render scene
  renderer.render(scene, camera);
});
