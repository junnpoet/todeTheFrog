import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { canPlayerMoveTo } from './Collision.js';

// Movement constants
export const MOVE_SPEED = 6.0; // Responsive jump speed to prevent input queue delay
export const JUMP_HEIGHT = 20;
export const JUMP_DISTANCE = 50;

// Direction mappings for isometric ground movement (Z is up)
export const KEY_DIRECTIONS = {
  ArrowUp: { x: 0, y: 1 },
  ArrowDown: { x: 0, y: -1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  KeyW: { x: 0, y: 1 },
  KeyS: { x: 0, y: -1 },
  KeyA: { x: -1, y: 0 },
  KeyD: { x: 1, y: 0 },
  w: { x: 0, y: 1 },
  W: { x: 0, y: 1 },
  s: { x: 0, y: -1 },
  S: { x: 0, y: -1 },
  a: { x: -1, y: 0 },
  A: { x: -1, y: 0 },
  d: { x: 1, y: 0 },
  D: { x: 1, y: 0 },
};

export function createPlayer() {
  const player = new THREE.Group();
  player.position.set(0, 0, 0);

  // Movement state attached to player instance
  player.userData.inputQueue = [];
  player.userData.movementState = {
    isMoving: false,
    progress: 0,
    direction: new THREE.Vector2(0, -1),
    startPos: new THREE.Vector3(),
    targetPos: new THREE.Vector3(),
  };
  player.userData.moveSpeed = MOVE_SPEED;
  player.userData.jumpHeight = JUMP_HEIGHT;
  player.userData.jumpDistance = JUMP_DISTANCE;
  player.userData.canMove = true;
  player.userData.canAttack = true;

  const loader = new GLTFLoader();
  loader.load(
    '/models/tode.glb',
    (gltf) => {
      const model = gltf.scene;
      model.rotation.x = Math.PI / 2;
      model.scale.setScalar(20);

      // Compute bounding box after initial rotation & scale for ground offset
      const box = new THREE.Box3().setFromObject(model);
      model.position.z = -box.min.z;

      player.add(model);
      player.userData.model = model;
    },
    undefined,
    (error) => {
      console.error('Error loading tode.glb:', error);
    }
  );

  // Input listener for keyboard events
  window.addEventListener('keydown', (event) => {
    // If movement is disabled (e.g. during Game Over), ignore inputs
    if (player.userData.canMove === false) return;

    const key = KEY_DIRECTIONS[event.code] ? event.code : KEY_DIRECTIONS[event.key] ? event.key : null;
    if (key) {
      // Prevent scrolling the page with arrow keys
      event.preventDefault();
      // Cap queue size to prevent excessive input buffering
      if (player.userData.inputQueue.length < 3) {
        player.userData.inputQueue.push(key);
      }
    }
  });

  return player;
}

export function resetPlayer(player) {
  if (!player) return;
  player.position.set(0, 0, 0);
  player.visible = true;
  player.userData.canMove = true;
  player.userData.canAttack = true;
  player.userData.moveSpeed = MOVE_SPEED;
  player.userData.inputQueue = [];
  player.userData.movementState = {
    isMoving: false,
    progress: 0,
    direction: new THREE.Vector2(0, -1),
    startPos: new THREE.Vector3(0, 0, 0),
    targetPos: new THREE.Vector3(0, 0, 0),
  };
  if (player.userData.model) {
    player.userData.model.rotation.y = 0;
  }
}

export function updatePlayer(player, delta, obstacles = []) {
  if (!player) return;

  const state = player.userData.movementState;
  const queue = player.userData.inputQueue;
  const speed = player.userData.moveSpeed || MOVE_SPEED;
  const jumpHeight = player.userData.jumpHeight || JUMP_HEIGHT;
  const jumpDist = player.userData.jumpDistance || JUMP_DISTANCE;

  // Process input queue when idle
  if (!state.isMoving && player.userData.canMove !== false && queue.length > 0) {
    const code = queue.shift();
    const dir = KEY_DIRECTIONS[code];

    if (dir) {
      const targetX = player.position.x + dir.x * jumpDist;
      const targetY = player.position.y + dir.y * jumpDist;

      // Rotate model to face the intended direction
      if (player.userData.model) {
        player.userData.model.rotation.y = Math.atan2(dir.x, -dir.y);
      }

      // Collision check: player only moves if intended next position is clear of obstacles
      if (canPlayerMoveTo(targetX, targetY, obstacles)) {
        state.isMoving = true;
        state.progress = 0;
        state.direction.set(dir.x, dir.y);
        state.startPos.copy(player.position);
        state.targetPos.set(targetX, targetY, 0);
      }
    }
  }

  // Update ongoing jump movement
  if (state.isMoving) {
    state.progress += speed * delta;

    if (state.progress >= 1) {
      state.progress = 1;
      state.isMoving = false;
      player.position.x = state.targetPos.x;
      player.position.y = state.targetPos.y;
      player.position.z = 0;
    } else {
      player.position.x = THREE.MathUtils.lerp(state.startPos.x, state.targetPos.x, state.progress);
      player.position.y = THREE.MathUtils.lerp(state.startPos.y, state.targetPos.y, state.progress);
      // Parabolic jump arc on Z-axis using Math.sin(progress * Math.PI)
      player.position.z = Math.sin(state.progress * Math.PI) * jumpHeight;
    }
  }
}

export default createPlayer;
