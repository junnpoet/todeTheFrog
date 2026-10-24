import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// House constants
export const HOUSE_MODEL_PATH = '/models/small_house.glb';
export const HOUSE_SCALE = 65;
export const HOUSE_COUNT = 3;

const loader = new GLTFLoader();

/**
 * Generates non-overlapping random positions for houses, keeping safe distance from the player origin (0, 0).
 */
export function generateHousePositions(
  count = HOUSE_COUNT,
  minDistFromOrigin = 60,
  minDistBetween = 80,
  spawnRange = 90
) {
  const positions = [];
  const maxAttempts = 150;

  for (let i = 0; i < count; i++) {
    let placed = false;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const x = (Math.random() - 0.5) * 2 * spawnRange;
      const y = (Math.random() - 0.5) * 2 * spawnRange;

      // Keep safe distance from player starting position
      if (Math.hypot(x, y) < minDistFromOrigin) continue;

      // Keep safe distance from other houses
      let tooClose = false;
      for (const pos of positions) {
        if (Math.hypot(x - pos.x, y - pos.y) < minDistBetween) {
          tooClose = true;
          break;
        }
      }
      if (tooClose) continue;

      positions.push({ x, y });
      placed = true;
      break;
    }

    // Deterministic fallback if random attempts exhaust
    if (!placed) {
      const angle = (i * 2 * Math.PI) / count + Math.PI / 4;
      positions.push({
        x: Math.cos(angle) * minDistFromOrigin,
        y: Math.sin(angle) * minDistFromOrigin,
      });
    }
  }

  return positions;
}

/**
 * Creates a single house instance from a GLTF template model.
 */
export function createHouse(x, y, template) {
  const house = new THREE.Group();
  house.position.set(x, y, 0);

  const model = template.clone();

  // Rotate Math.PI / 2 around X-axis to align with Z-up coordinate system
  model.rotation.x = Math.PI / 2;

  // Assign random rotation around Y-axis in multiples of Math.PI / 2
  const randomMultiplier = Math.floor(Math.random() * 4);
  model.rotation.y = (randomMultiplier * Math.PI) / 2;

  // Scale model by 65
  model.scale.setScalar(HOUSE_SCALE);

  // Ensure houses sit exactly on ground level (Z = 0) by calculating bounding box
  const box = new THREE.Box3().setFromObject(model);
  model.position.z = -box.min.z;

  house.add(model);

  // Compute and store world-aligned bounding box for obstacle collision detection
  house.updateMatrixWorld(true);
  const worldBox = new THREE.Box3().setFromObject(house);
  house.userData.boundingBox = worldBox;
  house.userData.isHouse = true;

  return house;
}

/**
 * Loads the 3 houses and adds them to the map group.
 *
 * @param {THREE.Group} [mapGroup] Optional map group to add the houses to
 * @param {number} [count=HOUSE_COUNT] Number of houses to generate
 * @returns {Promise<THREE.Group[]>} Array of created house groups
 */
export function loadHouses(mapGroup, count = HOUSE_COUNT) {
  return new Promise((resolve, reject) => {
    loader.load(
      HOUSE_MODEL_PATH,
      (gltf) => {
        const template = gltf.scene;
        const positions = generateHousePositions(count);
        const houses = [];

        for (let i = 0; i < positions.length; i++) {
          const pos = positions[i];
          const house = createHouse(pos.x, pos.y, template);
          houses.push(house);

          if (mapGroup) {
            mapGroup.add(house);
          }
        }

        resolve(houses);
      },
      undefined,
      (error) => {
        console.error('Error loading small_house.glb:', error);
        reject(error);
      }
    );
  });
}

export default {
  HOUSE_MODEL_PATH,
  HOUSE_SCALE,
  HOUSE_COUNT,
  generateHousePositions,
  createHouse,
  loadHouses,
};
