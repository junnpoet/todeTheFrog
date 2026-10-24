# Developer & AI Agent Guidelines

## Architecture Overview
- **Source Code**: All application logic lives in `src/` following modular component separation.
- **Components (`src/components/`)**:
  - `Camera.js`: Isometric perspective camera configuration.
  - `Renderer.js`: WebGLRenderer setup and resizing.
  - `Player.js`: Tode movement state, parabolic Z-arc jumps, input queue.
  - `Enemy.js`: Corner spawning, SkinnedMesh cloning, pursuit steering.
  - `Attack.js`: AOE attack circle, cooldown timer, visual feedback, defeat callback.
  - `Collision.js`: Radial entity collision and AABB house obstacle collision detection.
  - `House.js`: Procedural house placement, bounding box calculation, ground alignment.
  - `Map.js`: Grid-based checkerboard floor generation with alternating colors.
  - `GameState.js`: State management (`PLAYING`, `GAME_OVER`), overlay UI, clean reset loop.
  - `Difficulty.js`: Dynamic difficulty scaling based on player score.
  - `Score.js`: Survival scoring (0.1 pts/sec) and enemy kill bonuses (10 pts/kill).
- **Static Assets**: 3D GLTF models (`tode.glb`, `enemy.glb`, `small_house.glb`) live in `public/models/`.
- **System Specifications**: Full architectural domain specifications are preserved in `docs/specs/`.

## Development Commands
- `npm run dev`: Starts local Vite development server.
- `npm run build`: Builds production bundle in `dist/`.
- `npm run preview`: Previews production build locally.
