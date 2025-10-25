import type { Engine } from 'noa-engine';
import type { WorldBlocks } from './blocks';
import { sampleAsteroidNoise } from './asteroid-noise';
import {
  PLATFORM_HALF_EXTENT,
  PLATFORM_HEIGHT,
  ASTEROID_LAYER_ALTITUDE,
  ASTEROID_HEIGHT_VARIATION,
  ASTEROID_RING_INNER_RADIUS,
  ASTEROID_RING_OUTER_RADIUS,
  ASTEROID_DENSITY_THRESHOLD,
  ASTEROID_CENTER_PROBABILITY,
  ASTEROID_CELL_SIZE,
  ASTEROID_CELL_MARGIN,
  ASTEROID_MAJOR_RADIUS,
  ASTEROID_MINOR_RADIUS,
  ASTEROID_VERTICAL_RADIUS,
  ASTEROID_CLUMP_COUNT,
  ASTEROID_BLOCK_COUNT,
  ASTEROID_NOISE_PROFILE,
} from '../config/world-options';

const CLUMP_DELTAS: Array<[number, number, number]> = [
  [0, 0, 0],
  [1, 0, 0],
  [-1, 0, 0],
  [0, 0, 1],
  [0, 0, -1],
  [0, 1, 0],
  [0, -1, 0],
  [1, 0, 1],
  [-1, 0, 1],
  [1, 0, -1],
  [-1, 0, -1],
  [0, 1, 1],
  [0, 1, -1],
  [0, -1, 1],
  [0, -1, -1],
  [1, 1, 0],
  [-1, 1, 0],
  [1, -1, 0],
  [-1, -1, 0],
];

export function installChunkGenerator(noa: Engine, blocks: WorldBlocks): void {
  console.log('[starwatch] chunk generator habilitado (plataforma + campo de asteroides)');

  noa.world.on('worldDataNeeded', (requestID: number, data: any, x: number, y: number, z: number) => {
    const sizeX = data.shape[0];
    const sizeY = data.shape[1];
    const sizeZ = data.shape[2];

    const chunkMinX = x;
    const chunkMaxX = x + sizeX - 1;
    const chunkMinY = y;
    const chunkMaxY = y + sizeY - 1;
    const chunkMinZ = z;
    const chunkMaxZ = z + sizeZ - 1;

    const writeBlock = (wx: number, wy: number, wz: number, blockId: number) => {
      if (wy < chunkMinY || wy > chunkMaxY) return;
      if (wx < chunkMinX || wx > chunkMaxX) return;
      if (wz < chunkMinZ || wz > chunkMaxZ) return;
      const ix = wx - x;
      const iy = wy - y;
      const iz = wz - z;
      data.set(ix, iy, iz, blockId);
    };

    // Plataforma inicial 10x10 (1 bloco de profundidade)
    for (let ix = 0; ix < sizeX; ix += 1) {
      const worldX = x + ix;
      for (let iz = 0; iz < sizeZ; iz += 1) {
        const worldZ = z + iz;
        if (
          worldX >= -PLATFORM_HALF_EXTENT && worldX < PLATFORM_HALF_EXTENT &&
          worldZ >= -PLATFORM_HALF_EXTENT && worldZ < PLATFORM_HALF_EXTENT
        ) {
          const iy = PLATFORM_HEIGHT - y;
          if (iy >= 0 && iy < sizeY) {
            data.set(ix, iy, iz, blocks.dirt);
          }
        }
      }
    }

    generateAsteroidsForChunk({
      data,
      blocks,
      chunkMinX,
      chunkMaxX,
      chunkMinY,
      chunkMaxY,
      chunkMinZ,
      chunkMaxZ,
      writeBlock,
    });

    noa.world.setChunkData(requestID, data);
  });
}

interface ChunkContext {
  data: any;
  blocks: WorldBlocks;
  chunkMinX: number;
  chunkMaxX: number;
  chunkMinY: number;
  chunkMaxY: number;
  chunkMinZ: number;
  chunkMaxZ: number;
  writeBlock: (wx: number, wy: number, wz: number, blockId: number) => void;
}

function generateAsteroidsForChunk(ctx: ChunkContext): void {
  const {
    chunkMinX,
    chunkMaxX,
    chunkMinZ,
    chunkMaxZ,
    writeBlock,
    blocks,
  } = ctx;

  const margin = ASTEROID_CELL_MARGIN + ASTEROID_MAJOR_RADIUS;
  const minCellX = Math.floor((chunkMinX - margin) / ASTEROID_CELL_SIZE);
  const maxCellX = Math.floor((chunkMaxX + margin) / ASTEROID_CELL_SIZE);
  const minCellZ = Math.floor((chunkMinZ - margin) / ASTEROID_CELL_SIZE);
  const maxCellZ = Math.floor((chunkMaxZ + margin) / ASTEROID_CELL_SIZE);

  for (let cellX = minCellX; cellX <= maxCellX; cellX += 1) {
    for (let cellZ = minCellZ; cellZ <= maxCellZ; cellZ += 1) {
      const seed = hash2D(cellX, cellZ);
      const rand = createRandom(seed);

      const offsetX = Math.round((rand() - 0.5) * (ASTEROID_CELL_SIZE - 1));
      const offsetZ = Math.round((rand() - 0.5) * (ASTEROID_CELL_SIZE - 1));

      const centerX = cellX * ASTEROID_CELL_SIZE + offsetX;
      const centerZ = cellZ * ASTEROID_CELL_SIZE + offsetZ;
      const radialDistance = Math.hypot(centerX, centerZ);

      if (
        radialDistance < ASTEROID_RING_INNER_RADIUS ||
        radialDistance > ASTEROID_RING_OUTER_RADIUS
      ) {
        continue;
      }

      const density = sampleAsteroidDensity(centerX, centerZ);
      const normalizedDensity = (density + 1) * 0.5; // map [-1, 1] → [0, 1]
      if (normalizedDensity < ASTEROID_DENSITY_THRESHOLD) {
        continue;
      }

      if (rand() > ASTEROID_CENTER_PROBABILITY) {
        continue;
      }

      const centerY = ASTEROID_LAYER_ALTITUDE + Math.round((rand() - 0.5) * 2 * ASTEROID_HEIGHT_VARIATION);
      const offsets = buildAsteroidOffsets(rand);

      offsets.forEach(([ox, oy, oz]) => {
        const wx = centerX + ox;
        const wy = centerY + oy;
        const wz = centerZ + oz;
        writeBlock(wx, wy, wz, blocks.asteroid);
      });
    }
  }
}

function sampleAsteroidDensity(x: number, z: number): number {
  const a = sampleAsteroidNoise(x, ASTEROID_NOISE_PROFILE.scaleA) * ASTEROID_NOISE_PROFILE.weightA;
  const b = sampleAsteroidNoise(z + 51.37, ASTEROID_NOISE_PROFILE.scaleB) * ASTEROID_NOISE_PROFILE.weightB;
  const c = sampleAsteroidNoise(x - z - 97.53, ASTEROID_NOISE_PROFILE.scaleC) * ASTEROID_NOISE_PROFILE.weightC;
  return a + b + c;
}

function buildAsteroidOffsets(rand: () => number): Array<[number, number, number]> {
  const totalBlocks = randomInt(rand, ASTEROID_BLOCK_COUNT.min, ASTEROID_BLOCK_COUNT.max);
  const clumpTarget = randomInt(rand, ASTEROID_CLUMP_COUNT.min, ASTEROID_CLUMP_COUNT.max);
  const majorRadius = ASTEROID_MAJOR_RADIUS * (0.85 + rand() * 0.3);
  const minorRadius = ASTEROID_MINOR_RADIUS * (0.85 + rand() * 0.3);
  const verticalRadius = ASTEROID_VERTICAL_RADIUS;
  const orientation = rand() * Math.PI * 2;

  const offsets: Array<[number, number, number]> = [];
  const used = new Set<string>();

  const addOffset = (ox: number, oy: number, oz: number) => {
    const key = `${ox},${oy},${oz}`;
    if (!used.has(key)) {
      used.add(key);
      offsets.push([ox, oy, oz]);
    }
  };

  for (let i = 0; i < clumpTarget && offsets.length < totalBlocks; i += 1) {
    const t = clumpTarget > 1 ? (i / (clumpTarget - 1)) * 2 - 1 : 0;
    const jitter = (rand() - 0.5) * 0.6;
    const along = (t + jitter) * majorRadius * 0.6;
    const lateral = (rand() - 0.5) * minorRadius;

    const baseX = Math.round(Math.cos(orientation) * along - Math.sin(orientation) * lateral);
    const baseZ = Math.round(Math.sin(orientation) * along + Math.cos(orientation) * lateral);
    const baseY = Math.round((rand() - 0.5) * 2 * verticalRadius);

    addOffset(baseX, baseY, baseZ);

    const clumpSize = Math.min(randomInt(rand, 2, 4), totalBlocks - offsets.length);
    for (let j = 0; j < clumpSize && offsets.length < totalBlocks; j += 1) {
      const [dx, dy, dz] = CLUMP_DELTAS[Math.floor(rand() * CLUMP_DELTAS.length)];
      addOffset(baseX + dx, baseY + dy, baseZ + dz);
    }
  }

  while (offsets.length < totalBlocks) {
    const [cx, cy, cz] = offsets[Math.floor(rand() * offsets.length)] || [0, 0, 0];
    const [dx, dy, dz] = CLUMP_DELTAS[Math.floor(rand() * CLUMP_DELTAS.length)];
    addOffset(cx + dx, cy + dy, cz + dz);
  }

  return offsets;
}

function hash2D(x: number, z: number): number {
  let h = x * 374761393 + z * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  h = h ^ (h >> 16);
  return h >>> 0;
}

function createRandom(seed: number): () => number {
  let state = seed || 1;
  return () => {
    state = Math.imul(state ^ (state >>> 15), 2246822519) + 0x9e3779b9;
    state = state >>> 0;
    return state / 0x100000000;
  };
}

function randomInt(rand: () => number, min: number, max: number): number {
  return min + Math.floor(rand() * (max - min + 1));
}
