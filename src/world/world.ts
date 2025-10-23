import { Engine } from 'noa-engine';
import { PLATFORM_BLOCK_Y, PLATFORM_HALF_SIZE } from '../config/constants';
import { BLOCK_DEFINITIONS, type BlockDefinition } from './config';
import type { PersistenceManager } from '../persistence/manager';
import { initializeSector, type SectorEnvironment } from './sector/sector';
import type { AsteroidField } from './sector/asteroid-field';

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

  noa.world.on(WORLD_DATA_EVENT, (id, data, x, y, z) => {
    for (let i = 0; i < data.shape[0]; i += 1) {
      for (let j = 0; j < data.shape[1]; j += 1) {
        for (let k = 0; k < data.shape[2]; k += 1) {
          const worldX = x + i;
          const worldY = y + j;
          const worldZ = z + k;
          const blockId = getVoxelId(worldX, worldY, worldZ, platformId, field, persistence);
          data.set(i, j, k, blockId);
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

function getVoxelId(
  x: number,
  y: number,
  z: number,
  platformId: number,
  field: AsteroidField,
  persistence: PersistenceManager,
): number {
  const persistedBlock = persistence.getBlockOverride(x, y, z);
  if (typeof persistedBlock === 'number') {
    return persistedBlock;
  }

  if (y === PLATFORM_BLOCK_Y && withinPlatform(x, z)) {
    return platformId;
  }

  const asteroidBlock = field.sample(x, y, z);
  if (asteroidBlock > 0) {
    return asteroidBlock;
  }

  return 0;
}
