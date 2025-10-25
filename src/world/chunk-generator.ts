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
  ASTEROID_BLOCK_COUNT,
  ASTEROID_CLUSTER_SIZE,
  ASTEROID_CLUSTER_SPREAD,
  ASTEROID_VARIANTS,
} from '../config/world-options';

const ASTEROID_WEIGHT_SUM = ASTEROID_VARIANTS.reduce((sum, variant) => sum + variant.weight, 0);

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
    const platformMinX = -PLATFORM_HALF_EXTENT;
    const platformMaxX = PLATFORM_HALF_EXTENT - 1;
    const platformMinZ = -PLATFORM_HALF_EXTENT;
    const platformMaxZ = PLATFORM_HALF_EXTENT - 1;

    for (let ix = 0; ix < sizeX; ix += 1) {
      const worldX = x + ix;
      if (worldX < platformMinX || worldX > platformMaxX) continue;
      for (let iz = 0; iz < sizeZ; iz += 1) {
        const worldZ = z + iz;
        if (worldZ < platformMinZ || worldZ > platformMaxZ) continue;
        const iy = PLATFORM_HEIGHT - y;
        if (iy >= 0 && iy < sizeY) {
          data.set(ix, iy, iz, blocks.dirt);
        }
      }
    }

    generateAsteroidsForChunk({
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
    blocks,
    chunkMinX,
    chunkMaxX,
    chunkMinZ,
    chunkMaxZ,
    writeBlock,
  } = ctx;

  const minCellX = Math.floor((chunkMinX - ASTEROID_CELL_MARGIN) / ASTEROID_CELL_SIZE);
  const maxCellX = Math.floor((chunkMaxX + ASTEROID_CELL_MARGIN) / ASTEROID_CELL_SIZE);
  const minCellZ = Math.floor((chunkMinZ - ASTEROID_CELL_MARGIN) / ASTEROID_CELL_SIZE);
  const maxCellZ = Math.floor((chunkMaxZ + ASTEROID_CELL_MARGIN) / ASTEROID_CELL_SIZE);

  for (let cellX = minCellX; cellX <= maxCellX; cellX += 1) {
    for (let cellZ = minCellZ; cellZ <= maxCellZ; cellZ += 1) {
      const baseSeed = hash2D(cellX, cellZ);
      const baseRand = createRandom(baseSeed);

      const offsetX = Math.round((baseRand() - 0.5) * (ASTEROID_CELL_SIZE - 1));
      const offsetZ = Math.round((baseRand() - 0.5) * (ASTEROID_CELL_SIZE - 1));

      const baseCenterX = cellX * ASTEROID_CELL_SIZE + offsetX;
      const baseCenterZ = cellZ * ASTEROID_CELL_SIZE + offsetZ;
      const baseRadius = Math.hypot(baseCenterX, baseCenterZ);

      if (
        baseRadius < ASTEROID_RING_INNER_RADIUS ||
        baseRadius > ASTEROID_RING_OUTER_RADIUS
      ) {
        continue;
      }

      const density = sampleAsteroidDensity(baseCenterX, baseCenterZ);
      const normalizedDensity = (density + 1) * 0.5; // [-1,1] → [0,1]
      if (normalizedDensity < ASTEROID_DENSITY_THRESHOLD) {
        continue;
      }

      if (baseRand() > ASTEROID_CENTER_PROBABILITY) {
        continue;
      }

      const clusterCount = randomInt(baseRand, ASTEROID_CLUSTER_SIZE.min, ASTEROID_CLUSTER_SIZE.max);
      for (let clusterIndex = 0; clusterIndex < clusterCount; clusterIndex += 1) {
        const clusterAngle = baseRand() * Math.PI * 2;
        const clusterDistance = clusterIndex === 0
          ? 0
          : ASTEROID_CLUSTER_SPREAD * (0.5 + baseRand() * 0.5);

        const clusterCenterX = Math.round(baseCenterX + Math.cos(clusterAngle) * clusterDistance);
        const clusterCenterZ = Math.round(baseCenterZ + Math.sin(clusterAngle) * clusterDistance);
        const clusterCenterY = ASTEROID_LAYER_ALTITUDE + Math.round((baseRand() - 0.5) * 2 * ASTEROID_HEIGHT_VARIATION);

        const clusterRadius = Math.hypot(clusterCenterX, clusterCenterZ);
        if (
          clusterRadius < ASTEROID_RING_INNER_RADIUS ||
          clusterRadius > ASTEROID_RING_OUTER_RADIUS
        ) {
          continue;
        }

        const clusterSeed = hash3D(cellX, cellZ, clusterIndex);
        const clusterRand = createRandom(clusterSeed);
        const blockId = pickAsteroidBlockId(clusterRand, blocks);
        const offsets = buildAsteroidOffsets(clusterRand);

        for (const [ox, oy, oz] of offsets) {
          const wx = clusterCenterX + ox;
          const wy = clusterCenterY + oy;
          const wz = clusterCenterZ + oz;
          const radialDistance = Math.hypot(wx, wz);
          if (
            radialDistance < ASTEROID_RING_INNER_RADIUS ||
            radialDistance > ASTEROID_RING_OUTER_RADIUS + ASTEROID_MAJOR_RADIUS
          ) {
            continue;
          }
          writeBlock(wx, wy, wz, blockId);
        }
      }
    }
  }
}

function sampleAsteroidDensity(x: number, z: number): number {
  const a = sampleAsteroidNoise(x, 160) * 0.6;
  const b = sampleAsteroidNoise(z + 51.37, 120) * 0.25;
  const c = sampleAsteroidNoise(x - z - 97.53, 90) * 0.15;
  return a + b + c;
}

function buildAsteroidOffsets(rand: () => number): Array<[number, number, number]> {
  const totalBlocks = randomInt(rand, ASTEROID_BLOCK_COUNT.min, ASTEROID_BLOCK_COUNT.max);
  const majorRadius = ASTEROID_MAJOR_RADIUS * (0.8 + rand() * 0.4);
  const minorRadius = ASTEROID_MINOR_RADIUS * (0.8 + rand() * 0.4);
  const verticalRadius = ASTEROID_VERTICAL_RADIUS * (0.8 + rand() * 0.4);
  const orientation = rand() * Math.PI * 2;

  const offsets: Array<[number, number, number]> = [];
  const used = new Set<string>();
  let attempts = 0;
  const maxAttempts = totalBlocks * 30;

  while (offsets.length < totalBlocks && attempts < maxAttempts) {
    attempts += 1;
    const along = (rand() * 2 - 1) * majorRadius;
    const lateral = (rand() * 2 - 1) * minorRadius;
    const vertical = (rand() * 2 - 1) * verticalRadius;

    const norm = (along * along) / (majorRadius * majorRadius)
      + (lateral * lateral) / (minorRadius * minorRadius)
      + (vertical * vertical) / (verticalRadius * verticalRadius);
    if (norm > 1) continue;

    const rotX = Math.round(Math.cos(orientation) * along - Math.sin(orientation) * lateral);
    const rotZ = Math.round(Math.sin(orientation) * along + Math.cos(orientation) * lateral);
    const rotY = Math.round(vertical);

    const key = `${rotX},${rotY},${rotZ}`;
    if (used.has(key)) continue;
    used.add(key);
    offsets.push([rotX, rotY, rotZ]);
  }

  if (offsets.length === 0) {
    offsets.push([0, 0, 0]);
  }

  return offsets;
}

function pickAsteroidBlockId(rand: () => number, blocks: WorldBlocks): number {
  if (blocks.asteroidVariants.length === 0) {
    return blocks.dirt;
  }
  let r = rand() * ASTEROID_WEIGHT_SUM;
  for (let i = 0; i < ASTEROID_VARIANTS.length && i < blocks.asteroidVariants.length; i += 1) {
    r -= ASTEROID_VARIANTS[i].weight;
    if (r <= 0) {
      return blocks.asteroidVariants[i];
    }
  }
  return blocks.asteroidVariants[blocks.asteroidVariants.length - 1];
}

function hash2D(x: number, z: number): number {
  let h = x * 374761393 + z * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  h = h ^ (h >> 16);
  return h >>> 0;
}

function hash3D(x: number, y: number, z: number): number {
  let h = x * 374761393 + y * 668265263 + z * 144305901;
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
