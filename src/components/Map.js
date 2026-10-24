import * as THREE from 'three';

// Map constants
export const GRID_SIZE = 10;
export const TILE_SIZE = 50;

export const COLOR_DARK_GREEN = 0x228b22; // #228B22
export const COLOR_LIGHT_GREEN = 0x90ee90; // #90EE90

/**
 * Creates a checkerboard floor grid using alternating Dark Green and Light Green tiles.
 *
 * @param {Object} options
 * @param {number} [options.gridSize=GRID_SIZE] Number of tiles per row/column
 * @param {number} [options.tileSize=TILE_SIZE] Width and height of each tile
 * @returns {THREE.Group} Map group containing the floor tiles
 */
export function createMap({ gridSize = GRID_SIZE, tileSize = TILE_SIZE } = {}) {
  const mapGroup = new THREE.Group();
  mapGroup.name = 'map';

  const tileGeometry = new THREE.PlaneGeometry(tileSize, tileSize);
  const darkMaterial = new THREE.MeshLambertMaterial({
    color: COLOR_DARK_GREEN,
    side: THREE.DoubleSide,
  });
  const lightMaterial = new THREE.MeshLambertMaterial({
    color: COLOR_LIGHT_GREEN,
    side: THREE.DoubleSide,
  });

  const halfOffset = (gridSize - 1) / 2;

  for (let ix = 0; ix < gridSize; ix++) {
    for (let iy = 0; iy < gridSize; iy++) {
      const isDark = (ix + iy) % 2 === 0;
      const material = isDark ? darkMaterial : lightMaterial;
      const tile = new THREE.Mesh(tileGeometry, material);

      const posX = (ix - halfOffset) * tileSize;
      const posY = (iy - halfOffset) * tileSize;

      tile.position.set(posX, posY, 0);
      mapGroup.add(tile);
    }
  }

  return mapGroup;
}

export default createMap;
