# Architecture & System Specifications: Tode the Frog

This directory contains the system specifications organized by architectural domain.

## Specifications Index

### 1. Setup & Scene Engine (`docs/specs/setup/`)
- [`scene-setup.md`](./setup/scene-setup.md): Scene initialization, Three.js isometric camera, directional/ambient lighting, and WebGL renderer.

### 2. Entities (`docs/specs/entities/`)
- [`player.md`](./entities/player.md): Player movement physics, parabolic Z-arc jump, input queuing, and model orientation.
- [`enemy.md`](./entities/enemy.md): Enemy model loading (SkinnedMesh cloning), corner spawn points, and pursuit steering toward the player.

### 3. Combat & Physics (`docs/specs/combat/`)
- [`collision.md`](./combat/collision.md): Radial collision detection, shape-based contact boundaries, and obstacle avoidance.
- [`attack.md`](./combat/attack.md): AOE attack execution, cooldown management, fading visual ring, and enemy elimination.

### 4. Core Loop (`docs/specs/core/`)
- [`game-state.md`](./core/game-state.md): Finite state machine (`PLAYING`, `GAME_OVER`), collision-to-defeat priority, and clean Space-key reset.
- [`difficulty.md`](./core/difficulty.md): Dynamic difficulty scaling based on score, differential growth factors (enemies scale faster than player).
- [`score.md`](./core/score.md): Dual scoring system (survival time ticks + enemy kill bonuses) and UI HUD synchronization.

### 5. World & Environment (`docs/specs/world/`)
- [`world.md`](./world/world.md): Checkerboard floor generation (alternating Dark Green `#228B22` and Light Green `#90EE90`), 3 random house obstacles, and AABB collision walls.
