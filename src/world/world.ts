import { Engine } from 'noa-engine';
import { PLATFORM_BLOCK_Y, PLATFORM_HALF_SIZE } from '../config/constants';
import { BLOCK_DEFINITIONS } from './config';

export interface BlockPaletteEntry {
  id: number;
  label: string;
  hotkey: string;
}

export interface WorldContext {
  blockPalette: BlockPaletteEntry[];
}

const WORLD_DATA_EVENT = 'worldDataNeeded';

export function initializeWorld(noa: Engine): WorldContext {
  registerMaterials(noa);
  const blockPalette = registerBlocks(noa);
  setupWorldGeneration(noa, blockPalette);
  return {
    blockPalette,
  };
}

function registerMaterials(noa: Engine) {
  BLOCK_DEFINITIONS.forEach(({ materialName, materialColor }) => {
    noa.registry.registerMaterial(materialName, { color: materialColor });
  });
}

function registerBlocks(noa: Engine): BlockPaletteEntry[] {
  return BLOCK_DEFINITIONS.map(({ registryId, materialName, label, hotkey }) => {
    const blockId = noa.registry.registerBlock(registryId, { material: materialName });
    return {
      id: blockId,
      label,
      hotkey,
    };
  });
}

function setupWorldGeneration(noa: Engine, palette: BlockPaletteEntry[]) {
  const rockID = palette[0]?.id ?? 0;

  noa.world.on(WORLD_DATA_EVENT, (id, data, x, y, z) => {
    for (let i = 0; i < data.shape[0]; i += 1) {
      for (let j = 0; j < data.shape[1]; j += 1) {
        for (let k = 0; k < data.shape[2]; k += 1) {
          const blockID = getVoxelId(x + i, y + j, z + k, rockID);
          data.set(i, j, k, blockID);
        }
      }
    }

    noa.world.setChunkData(id, data);
  });
}

function withinPlatform(x: number, z: number): boolean {
  return (
    x >= -PLATFORM_HALF_SIZE &&
    x < PLATFORM_HALF_SIZE &&
    z >= -PLATFORM_HALF_SIZE &&
    z < PLATFORM_HALF_SIZE
  );
}

function getVoxelId(x: number, y: number, z: number, rockID: number): number {
  if (!withinPlatform(x, z)) {
    return 0;
  }

  if (y === PLATFORM_BLOCK_Y) {
    return rockID;
  }

  return 0;
}
