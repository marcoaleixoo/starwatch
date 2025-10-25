import type { Engine } from 'noa-engine';
import type { WorldBlocks } from './blocks';
import { sampleCloudNoise } from './cloud-noise';
import {
  PLATFORM_HALF_EXTENT,
  PLATFORM_HEIGHT,
  CLOUD_LAYER_ALTITUDE,
  CLOUD_LAYER_THICKNESS,
  CLOUD_RING_INNER_RADIUS,
  CLOUD_RING_OUTER_RADIUS,
  CLOUD_DENSITY_THRESHOLD,
} from '../config/world-options';

export function installChunkGenerator(noa: Engine, blocks: WorldBlocks): void {
  console.log('[starwatch] chunk generator habilitado');

  noa.world.on('worldDataNeeded', (requestID: number, data: any, x: number, y: number, z: number) => {
    const sizeX = data.shape[0];
    const sizeY = data.shape[1];
    const sizeZ = data.shape[2];

    for (let ix = 0; ix < sizeX; ix += 1) {
      const worldX = x + ix;
      for (let iz = 0; iz < sizeZ; iz += 1) {
        const worldZ = z + iz;
        const radialDistance = Math.hypot(worldX, worldZ);

        for (let iy = 0; iy < sizeY; iy += 1) {
          const worldY = y + iy;
          let blockId = 0;

          const onPlatformLayer = worldY === PLATFORM_HEIGHT;
          const withinPlatformBounds = onPlatformLayer &&
            worldX >= -PLATFORM_HALF_EXTENT && worldX < PLATFORM_HALF_EXTENT &&
            worldZ >= -PLATFORM_HALF_EXTENT && worldZ < PLATFORM_HALF_EXTENT;

          if (withinPlatformBounds) {
            blockId = blocks.dirt;
          } else if (radialDistance >= CLOUD_RING_INNER_RADIUS && radialDistance <= CLOUD_RING_OUTER_RADIUS) {
            const altitudeOffset = Math.abs(worldY - CLOUD_LAYER_ALTITUDE);
            if (altitudeOffset <= CLOUD_LAYER_THICKNESS) {
              const density =
                0.55 * sampleCloudNoise(worldX + worldZ, 140) +
                0.45 * sampleCloudNoise(worldX - worldZ * 0.5, 90);
              const heightBias = 1 - (altitudeOffset / CLOUD_LAYER_THICKNESS);
              if (density * heightBias > CLOUD_DENSITY_THRESHOLD) {
                blockId = blocks.cloud;
              }
            }
          }

          data.set(ix, iy, iz, blockId);
        }
      }
    }

    noa.world.setChunkData(requestID, data);
  });
}
