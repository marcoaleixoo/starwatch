import { PLATFORM_HALF_EXTENT, PLATFORM_HEIGHT } from '../../config/sector-options';
import type { ChunkGenerationContext } from './types';

export function generateStartingPlatform(ctx: ChunkGenerationContext): void {
  if (ctx.bounds.maxY < PLATFORM_HEIGHT || ctx.bounds.minY > PLATFORM_HEIGHT) {
    return;
  }

  const platformMinX = -PLATFORM_HALF_EXTENT;
  const platformMaxX = PLATFORM_HALF_EXTENT - 1;
  const platformMinZ = -PLATFORM_HALF_EXTENT;
  const platformMaxZ = PLATFORM_HALF_EXTENT - 1;

  for (let localX = 0; localX < ctx.dimensions.sizeX; localX += 1) {
    const worldX = ctx.bounds.minX + localX;
    if (worldX < platformMinX || worldX > platformMaxX) continue;

    for (let localZ = 0; localZ < ctx.dimensions.sizeZ; localZ += 1) {
      const worldZ = ctx.bounds.minZ + localZ;
      if (worldZ < platformMinZ || worldZ > platformMaxZ) continue;

      ctx.writeBlock(worldX, PLATFORM_HEIGHT, worldZ, ctx.blocks.dirt);
    }
  }
}
