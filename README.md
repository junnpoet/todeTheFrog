# 🐸 Tode the Frog

A 3D isometric action-survival browser game built with **Three.js** and **Vite**.

Survive waves of pursuing enemies on a vibrant checkerboard map, hop over obstacles, defeat monsters with your area-of-effect attack, and watch the challenge scale dynamically as your score climbs!

---

## 🎮 Gameplay & Controls

| Action | Key(s) | Description |
| :--- | :--- | :--- |
| **Move / Jump** | `W`, `A`, `S`, `D` or `Arrow Keys` | Hop in 4 directions with smooth parabolic Z-axis arcs and responsive input buffering. |
| **Attack** | `Space` | Unleash an explosive circular AOE attack to vaporize nearby enemies. |
| **Restart** | `Space` *(on Game Over)* | Instantly resets the arena, score, and entities to jump back into action. |

---

## 🌟 Key Features

- **Isometric 3D World**: Custom Three.js camera setup with directional shadows and a clean checkerboard floor alternating Dark Green (`#228B22`) and Light Green (`#90EE90`).
- **Smooth Hop Mechanics**: Parabolic jump trajectory on the vertical Z-axis with high-velocity queue draining (~166ms per jump) for zero-latency controls.
- **Armature-Aware Enemies**: Enemies spawned from 4 corners using `SkeletonUtils` cloning, maintaining independent bone hierarchies while steering toward Tode.
- **Dynamic Difficulty Engine**:
  - Spawn delays progressively shrink down to 0.5s.
  - Enemy speed accelerates faster than player capabilities to maintain high stakes.
  - Tode's attack cooldown decreases and blast radius expands with higher scores.
- **Dual Scoring**: Earn passive survival points over time (`0.1 pts/s`) plus high-value bonuses (`10 pts`) per eliminated enemy.
- **AABB Obstacle Physics**: 3 procedurally placed houses rotated and grounded at $Z = 0$, featuring 2D Axis-Aligned Bounding Box collision detection preventing entities from clipping walls.

---

## 📁 Project Architecture

```text
.
├── docs/
│   └── specs/                # Domain-driven system specifications
│       ├── core/             # Game state machine, difficulty scaling, score
│       ├── entities/         # Player movement physics, enemy pursuit
│       ├── combat/           # AOE attacks, collision boundaries
│       ├── world/            # Checkerboard floor, house obstacles
│       └── setup/            # Scene lighting, isometric camera, renderer
├── public/
│   ├── models/               # 3D GLTF models (tode.glb, enemy.glb, small_house.glb)
│   └── tode.svg              # Favicon
├── src/
│   ├── components/
│   │   ├── Attack.js         # AOE combat logic and visual feedback ring
│   │   ├── Camera.js         # Isometric perspective camera
│   │   ├── Collision.js      # Radial contact and AABB box collision engine
│   │   ├── Difficulty.js     # Real-time difficulty factor calculator
│   │   ├── Enemy.js          # Corner spawner and pursuit steering
│   │   ├── GameState.js      # State manager (PLAYING, GAME_OVER) and overlay
│   │   ├── House.js          # Procedural placement and Z=0 alignment
│   │   ├── Map.js            # Checkerboard floor mesh generator
│   │   ├── Player.js         # Tode character controller and input queue
│   │   ├── Renderer.js       # Antialiased WebGLRenderer with resize handling
│   │   └── Score.js          # Real-time score tracker and HUD interface
│   ├── main.js               # Central game loop coordinator
│   └── style.css             # HUD styling and Game Over overlay
├── index.html                # Canvas container and entry point
├── package.json              # Project dependencies and scripts
└── vite.config.js            # Vite configuration
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm

### Installation
```bash
# Install dependencies
npm install
```

### Development
```bash
# Start local Vite dev server
npm run dev
```
Open your browser at `http://localhost:5173/` to play.

### Production Build
```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
