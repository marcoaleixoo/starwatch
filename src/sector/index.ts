import type { Engine } from 'noa-engine';
import { registerSectorMaterials, type SectorMaterials } from './materials';
import { registerSectorBlocks, type SectorBlocks } from './blocks';
import { installChunkGenerator } from './chunk-generator';
import { CHUNK_ADD_DISTANCE, CHUNK_REMOVE_DISTANCE } from '../config/render-options';
import { registerStarwatchBlocks } from '../blocks/register';
import type { BlockCatalog } from '../blocks/types';

export interface SectorResources {
  materials: SectorMaterials;
  terrainBlocks: SectorBlocks;
  starwatchBlocks: BlockCatalog;
}

export function initializeSector(noa: Engine): SectorResources {
  const materials = registerSectorMaterials(noa);
  const terrainBlocks = registerSectorBlocks(noa, materials);
  const starwatchBlocks = registerStarwatchBlocks(noa, materials, terrainBlocks.nextBlockId);
  installChunkGenerator(noa, terrainBlocks, starwatchBlocks);

  noa.world.setAddRemoveDistance(CHUNK_ADD_DISTANCE, CHUNK_REMOVE_DISTANCE);
  console.log('[starwatch] distâncias de chunk configuradas');

  return {
    materials,
    terrainBlocks,
    starwatchBlocks,
  };
}
