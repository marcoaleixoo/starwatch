import type { Engine } from 'noa-engine';
import type { SectorBlocks } from './blocks';
import { runGenerationPipeline } from './generation';
import type { ChunkGenerationContext } from './generation/types';
import type { BlockCatalog } from '../blocks/types';

export function installChunkGenerator(noa: Engine, blocks: SectorBlocks, catalog: BlockCatalog): void {
  console.log('[starwatch] chunk generator habilitado (pipeline modular)');

  noa.world.on('worldDataNeeded', (requestID: number, data: any, x: number, y: number, z: number) => {
    const sizeX = data.shape[0];
    const sizeY = data.shape[1];
    const sizeZ = data.shape[2];

    const bounds = {
      minX: x,
      maxX: x + sizeX - 1,
      minY: y,
      maxY: y + sizeY - 1,
      minZ: z,
      maxZ: z + sizeZ - 1,
    };

    const writeBlock = (worldX: number, worldY: number, worldZ: number, blockId: number) => {
      if (worldY < bounds.minY || worldY > bounds.maxY) return;
      if (worldX < bounds.minX || worldX > bounds.maxX) return;
      if (worldZ < bounds.minZ || worldZ > bounds.maxZ) return;
      const ix = worldX - x;
      const iy = worldY - y;
      const iz = worldZ - z;
      data.set(ix, iy, iz, blockId);
    };

    const context: ChunkGenerationContext = {
      blocks,
      catalog,
      bounds,
      dimensions: {
        sizeX,
        sizeY,
        sizeZ,
      },
      writeBlock,
    };

    runGenerationPipeline(context);

    noa.world.setChunkData(requestID, data);
  });
}
