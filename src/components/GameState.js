import * as THREE from 'three';

export const GAME_STATES = {
  PLAYING: 'PLAYING',
  GAME_OVER: 'GAME_OVER',
};

export class GameState {
  constructor({ scene, player, enemies, scoreSystem, attackSystem, onReset }) {
    this.scene = scene;
    this.player = player;
    this.enemies = enemies;
    this.scoreSystem = scoreSystem;
    this.attackSystem = attackSystem;
    this.onReset = onReset;

    this.state = GAME_STATES.PLAYING;
    this.overlayElement = null;

    // Listen for Space key to reset when in GAME_OVER state
    window.addEventListener('keydown', (event) => {
      if (this.state === GAME_STATES.GAME_OVER && event.code === 'Space') {
        event.preventDefault();
        event.stopImmediatePropagation();
        this.resetGame();
      }
    });
  }

  isPlaying() {
    return this.state === GAME_STATES.PLAYING;
  }

  isGameOver() {
    return this.state === GAME_STATES.GAME_OVER;
  }

  triggerGameOver() {
    if (this.state === GAME_STATES.GAME_OVER) return;

    this.state = GAME_STATES.GAME_OVER;

    // 1. Display a "Game Over" overlay (a div with class game-over)
    if (!this.overlayElement) {
      this.overlayElement = document.createElement('div');
      this.overlayElement.className = 'game-over';
      this.overlayElement.innerHTML = `
        <h1>GAME OVER</h1>
        <p>Press SPACE to restart</p>
      `;
    }
    if (!document.body.contains(this.overlayElement)) {
      document.body.appendChild(this.overlayElement);
    }

    // 2. The player character should be removed or made invisible
    if (this.player) {
      this.player.visible = false;
      this.player.userData.canMove = false;
      this.player.userData.canAttack = false;
      if (this.player.userData.inputQueue) {
        this.player.userData.inputQueue.length = 0;
      }
    }

    // 3. Disable further player actions (e.g. movement and attack)
    if (this.attackSystem) {
      this.attackSystem.enabled = false;
      if (this.attackSystem.circleMesh) {
        this.attackSystem.circleMesh.visible = false;
      }
    }
  }

  resetGame() {
    if (this.state !== GAME_STATES.GAME_OVER) return;

    // 1. Remove the "Game Over" overlay
    if (this.overlayElement && document.body.contains(this.overlayElement)) {
      this.overlayElement.remove();
    }

    // 2. Reset player position to the starting point
    if (this.player) {
      this.player.position.set(0, 0, 0);
      this.player.visible = true;
      this.player.userData.canMove = true;
      this.player.userData.canAttack = true;
      if (this.player.userData.inputQueue) {
        this.player.userData.inputQueue.length = 0;
      }
      if (this.player.userData.movementState) {
        this.player.userData.movementState.isMoving = false;
        this.player.userData.movementState.progress = 0;
        this.player.userData.movementState.direction.set(0, -1);
        this.player.userData.movementState.startPos.set(0, 0, 0);
        this.player.userData.movementState.targetPos.set(0, 0, 0);
      }
      if (this.player.userData.model) {
        this.player.userData.model.rotation.y = 0;
      }
    }

    // 3. Clear all existing enemies and re-spawn them at map corners
    if (typeof this.onReset === 'function') {
      this.onReset();
    }

    // 4. Reset the score and update the UI
    if (this.scoreSystem) {
      this.scoreSystem.reset();
    }

    // 5. Reset attack system
    if (this.attackSystem) {
      this.attackSystem.reset();
    }

    // 6. Resume game loop
    this.state = GAME_STATES.PLAYING;
  }
}

export function createGameState(options) {
  return new GameState(options);
}

export default createGameState;
