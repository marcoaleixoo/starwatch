import { Engine } from 'noa-engine';
import { PLATFORM_BLOCK_Y, PLATFORM_HALF_SIZE } from '../config/constants';
import { BLOCK_DEFINITIONS, type BlockDefinition } from './config';
import type { PersistenceManager } from '../persistence/manager';
import { initializeSector, type SectorEnvironment } from './sector/sector';
import type { AsteroidField } from './sector/asteroid-field';
import { SunEntity } from './sector/sun';

export interface BlockPaletteEntry {
  id: number;
  label: string;
  hotkey: string;
}

export interface WorldContext {
  blockPalette: BlockPaletteEntry[];
  blockIds: Record<string, number>;
  systems: { id: string; update(dt: number): void }[];
  sector: SectorEnvironment;
  sun: SunEntity;
  field: AsteroidField;
}

const WORLD_DATA_EVENT = 'worldDataNeeded';

export function initializeWorld(noa: Engine, persistence: PersistenceManager): WorldContext {
  registerMaterials(noa, BLOCK_DEFINITIONS);
  const { blockPalette, blockIds } = registerBlocks(noa, BLOCK_DEFINITIONS);

  const sectorSeed = persistence.getSectorId();
  const sectorSetup = initializeSector(noa, {
    stone: blockIds['asteroid-stone'],
    iron: blockIds['asteroid-iron'],
    copper: blockIds['asteroid-copper'],
  }, { sectorSeed });

  setupWorldGeneration(noa, blockIds, sectorSetup.field, persistence);
  return {
    blockPalette,
    blockIds,
    systems: sectorSetup.systems,
    sector: sectorSetup.environment,
    sun: sectorSetup.sun,
    field: sectorSetup.field,
  };
}

function registerMaterials(noa: Engine, definitions: BlockDefinition[]) {
  definitions.forEach(({ materialName, materialColor }) => {
    noa.registry.registerMaterial(materialName, { color: materialColor });
  });
}

function registerBlocks(
  noa: Engine,
  definitions: BlockDefinition[],
): { blockPalette: BlockPaletteEntry[]; blockIds: Record<string, number> } {
  const blockPalette: BlockPaletteEntry[] = [];
  const blockIds: Record<string, number> = {};

  definitions.forEach(({ registryId, materialName, label, hotkey, includeInPalette = true, key }) => {
    const blockId = noa.registry.registerBlock(registryId, { material: materialName });
    blockIds[key] = blockId;
    if (includeInPalette) {
      blockPalette.push({
        id: blockId,
        label,
        hotkey,
      });
    }
  });

  return { blockPalette, blockIds };
}

function setupWorldGeneration(
  noa: Engine,
  blockIds: Record<string, number>,
  field: AsteroidField,
  persistence: PersistenceManager,
) {
  const platformId = blockIds['platform-stone'] ?? 0;
  const noaWorld = noa.world as unknown as {
    setChunkData(id: string, array: any, userData?: any, fillVoxelID?: number): void;
  };

  noa.world.on(WORLD_DATA_EVENT, (id, data, x, y, z) => {
    const sizeX = data.shape[0];
    const sizeY = data.shape[1];
    const sizeZ = data.shape[2];

    const chunkClusters = field.getClustersForChunk(x, y, z);
    const chunkCoversPlatformLayer =
      y <= PLATFORM_BLOCK_Y && y + sizeY > PLATFORM_BLOCK_Y;
    const hasOverrides = persistence.hasOverridesInChunk(x, y, z, sizeX, sizeY, sizeZ);

    if (chunkClusters.length === 0 && !chunkCoversPlatformLayer && !hasOverrides) {
      noaWorld.setChunkData(id, data, undefined, 0);
      return;
    }

    if (data?.data && typeof data.data.fill === 'function') {
      data.data.fill(0);
    } else {
      for (let i = 0; i < sizeX; i += 1) {
        for (let j = 0; j < sizeY; j += 1) {
          for (let k = 0; k < sizeZ; k += 1) {
            data.set(i, j, k, 0);
          }
        }
      }
    }

    if (chunkClusters.length > 0) {
      field.populateChunk(data, x, y, z, chunkClusters);
    }

    if (chunkCoversPlatformLayer) {
      const localY = PLATFORM_BLOCK_Y - y;
      if (localY >= 0 && localY < sizeY) {
        for (let i = 0; i < sizeX; i += 1) {
          const worldX = x + i;
          for (let k = 0; k < sizeZ; k += 1) {
            const worldZ = z + k;
            if (withinPlatform(worldX, worldZ)) {
              data.set(i, localY, k, platformId);
            }
          }
        }
      }
    }

    if (hasOverrides) {
      persistence.applyOverridesToChunk(data, x, y, z);
    }

    noaWorld.setChunkData(id, data);
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
