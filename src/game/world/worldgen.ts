import type { Engine } from 'noa-engine';
import type { BlockHandles } from './blocks';
import { sampleNoise } from './noise';

const PLATFORM_HALF_EXTENT = 5; // 10x10 grid centered on 0
const PLATFORM_HEIGHT = 0;
const CLOUD_BAND_HEIGHT = 38;
const CLOUD_BAND_THICKNESS = 4;
const ASTEROID_RING_INNER = 40;
const ASTEROID_RING_OUTER = 180;
const CLOUD_THRESHOLD = 0.72;

export function setupWorldGenerator(noa: Engine, blocks: BlockHandles): void {
  console.log('[starwatch] worldgen configurado (plataforma %dx%d, nuvens distantes)',
    PLATFORM_HALF_EXTENT * 2,
    PLATFORM_HALF_EXTENT * 2
  );

  noa.world.on('worldDataNeeded', (requestID: number, data: any, x: number, y: number, z: number) => {
    const sizeX = data.shape[0];
    const sizeY = data.shape[1];
    const sizeZ = data.shape[2];

    for (let ix = 0; ix < sizeX; ix += 1) {
      const worldX = x + ix;
      for (let iz = 0; iz < sizeZ; iz += 1) {
        const worldZ = z + iz;
        const radial = Math.hypot(worldX, worldZ);

        for (let iy = 0; iy < sizeY; iy += 1) {
          const worldY = y + iy;
          let blockId = 0;

          const onPlatformLevel = worldY === PLATFORM_HEIGHT;
          const insidePlatform = onPlatformLevel &&
            worldX >= -PLATFORM_HALF_EXTENT && worldX < PLATFORM_HALF_EXTENT &&
            worldZ >= -PLATFORM_HALF_EXTENT && worldZ < PLATFORM_HALF_EXTENT;

          if (insidePlatform) {
            blockId = blocks.dirt;
          } else if (radial >= ASTEROID_RING_INNER && radial <= ASTEROID_RING_OUTER) {
            const dy = Math.abs(worldY - CLOUD_BAND_HEIGHT);
            if (dy <= CLOUD_BAND_THICKNESS) {
              const density =
                0.55 * sampleNoise(worldX + worldZ, 140) +
                0.45 * sampleNoise(worldX - worldZ * 0.5, 90);
              const heightBias = 1 - (dy / CLOUD_BAND_THICKNESS);
              if (density * heightBias > CLOUD_THRESHOLD) {
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
