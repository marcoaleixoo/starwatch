import { createSeededRng, hash2D, hash3D, randomInt } from '../../utils/random';
import { sampleAsteroidNoise } from '../asteroid-noise';
import {
  ASTEROID_BLOCK_COUNT,
  ASTEROID_CELL_MARGIN,
  ASTEROID_CELL_SIZE,
  ASTEROID_CENTER_PROBABILITY,
  ASTEROID_CLUSTER_SIZE,
  ASTEROID_CLUSTER_SPREAD,
  ASTEROID_DENSITY_THRESHOLD,
  ASTEROID_HEIGHT_VARIATION,
  ASTEROID_LAYER_ALTITUDE,
  ASTEROID_MAJOR_RADIUS,
  ASTEROID_MINOR_RADIUS,
  ASTEROID_RING_INNER_RADIUS,
  ASTEROID_RING_OUTER_RADIUS,
  ASTEROID_VERTICAL_RADIUS,
} from '../../config/sector-options';
import type { ChunkGenerationContext } from './types';
import type { AsteroidBlockDescriptor } from '../blocks';

export function generateAsteroidField(ctx: ChunkGenerationContext): void {
  if (ctx.bounds.maxY < ASTEROID_LAYER_ALTITUDE - ASTEROID_HEIGHT_VARIATION) return;
  if (ctx.bounds.minY > ASTEROID_LAYER_ALTITUDE + ASTEROID_HEIGHT_VARIATION) return;

  const variants = ctx.blocks.asteroidVariants;
  if (variants.length === 0) return;

  const weightSum = variants.reduce((sum, variant) => sum + variant.weight, 0);
  if (weightSum <= 0) return;

  const minCellX = Math.floor((ctx.bounds.minX - ASTEROID_CELL_MARGIN) / ASTEROID_CELL_SIZE);
  const maxCellX = Math.floor((ctx.bounds.maxX + ASTEROID_CELL_MARGIN) / ASTEROID_CELL_SIZE);
  const minCellZ = Math.floor((ctx.bounds.minZ - ASTEROID_CELL_MARGIN) / ASTEROID_CELL_SIZE);
  const maxCellZ = Math.floor((ctx.bounds.maxZ + ASTEROID_CELL_MARGIN) / ASTEROID_CELL_SIZE);

  for (let cellX = minCellX; cellX <= maxCellX; cellX += 1) {
    for (let cellZ = minCellZ; cellZ <= maxCellZ; cellZ += 1) {
      const baseSeed = hash2D(cellX, cellZ);
      const baseRng = createSeededRng(baseSeed);

      const offsetX = Math.round((baseRng() - 0.5) * (ASTEROID_CELL_SIZE - 1));
      const offsetZ = Math.round((baseRng() - 0.5) * (ASTEROID_CELL_SIZE - 1));

      const baseCenterX = cellX * ASTEROID_CELL_SIZE + offsetX;
      const baseCenterZ = cellZ * ASTEROID_CELL_SIZE + offsetZ;
      const baseRadius = Math.hypot(baseCenterX, baseCenterZ);

      if (baseRadius < ASTEROID_RING_INNER_RADIUS || baseRadius > ASTEROID_RING_OUTER_RADIUS) {
        continue;
      }

      const density = sampleAsteroidDensity(baseCenterX, baseCenterZ);
      const normalizedDensity = (density + 1) * 0.5;
      if (normalizedDensity < ASTEROID_DENSITY_THRESHOLD) {
        continue;
      }

      if (baseRng() > ASTEROID_CENTER_PROBABILITY) {
        continue;
      }

      const clusterCount = randomInt(baseRng, ASTEROID_CLUSTER_SIZE.min, ASTEROID_CLUSTER_SIZE.max);
      for (let clusterIndex = 0; clusterIndex < clusterCount; clusterIndex += 1) {
        const clusterAngle = baseRng() * Math.PI * 2;
        const clusterDistance = clusterIndex === 0 ? 0 : ASTEROID_CLUSTER_SPREAD * (0.5 + baseRng() * 0.5);

        const clusterCenterX = Math.round(baseCenterX + Math.cos(clusterAngle) * clusterDistance);
        const clusterCenterZ = Math.round(baseCenterZ + Math.sin(clusterAngle) * clusterDistance);
        const clusterCenterY = ASTEROID_LAYER_ALTITUDE + Math.round((baseRng() - 0.5) * 2 * ASTEROID_HEIGHT_VARIATION);

        const clusterRadius = Math.hypot(clusterCenterX, clusterCenterZ);
        if (clusterRadius < ASTEROID_RING_INNER_RADIUS || clusterRadius > ASTEROID_RING_OUTER_RADIUS) {
          continue;
        }

        const clusterSeed = hash3D(cellX, cellZ, clusterIndex);
        const clusterRng = createSeededRng(clusterSeed);
        const variant = pickAsteroidVariant(clusterRng, variants, weightSum);
        if (!variant) continue;

        const offsets = buildAsteroidOffsets(clusterRng);
        for (const [offsetXBlock, offsetYBlock, offsetZBlock] of offsets) {
          const worldX = clusterCenterX + offsetXBlock;
          const worldY = clusterCenterY + offsetYBlock;
          const worldZ = clusterCenterZ + offsetZBlock;

          const radialDistance = Math.hypot(worldX, worldZ);
          if (radialDistance < ASTEROID_RING_INNER_RADIUS || radialDistance > ASTEROID_RING_OUTER_RADIUS + ASTEROID_MAJOR_RADIUS) {
            continue;
          }

          ctx.writeBlock(worldX, worldY, worldZ, variant.blockId);
        }
      }
    }
  }
}

function pickAsteroidVariant(rng: () => number, variants: AsteroidBlockDescriptor[], weightSum: number): AsteroidBlockDescriptor | undefined {
  let r = rng() * weightSum;
  for (const variant of variants) {
    r -= variant.weight;
    if (r <= 0) {
      return variant;
    }
  }
  return variants[variants.length - 1];
}

function buildAsteroidOffsets(rng: () => number): Array<[number, number, number]> {
  const totalBlocks = randomInt(rng, ASTEROID_BLOCK_COUNT.min, ASTEROID_BLOCK_COUNT.max);
  const majorRadius = ASTEROID_MAJOR_RADIUS * (0.8 + rng() * 0.4);
  const minorRadius = ASTEROID_MINOR_RADIUS * (0.8 + rng() * 0.4);
  const verticalRadius = ASTEROID_VERTICAL_RADIUS * (0.8 + rng() * 0.4);
  const orientation = rng() * Math.PI * 2;

  const offsets: Array<[number, number, number]> = [];
  const used = new Set<string>();
  let attempts = 0;
  const maxAttempts = totalBlocks * 30;

  while (offsets.length < totalBlocks && attempts < maxAttempts) {
    attempts += 1;
    const along = (rng() * 2 - 1) * majorRadius;
    const lateral = (rng() * 2 - 1) * minorRadius;
    const vertical = (rng() * 2 - 1) * verticalRadius;

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

function sampleAsteroidDensity(x: number, z: number): number {
  const a = sampleAsteroidNoise(x, 160) * 0.6;
  const b = sampleAsteroidNoise(z + 51.37, 120) * 0.25;
  const c = sampleAsteroidNoise(x - z - 97.53, 90) * 0.15;
  return a + b + c;
}
