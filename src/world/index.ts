import type { Engine } from 'noa-engine';
import { registerWorldMaterials, type WorldMaterials } from './materials';
import { registerWorldBlocks, type WorldBlocks } from './blocks';
import { installChunkGenerator } from './chunk-generator';
import { CHUNK_ADD_DISTANCE, CHUNK_REMOVE_DISTANCE } from '../config/render-options';
import { registerStarwatchBlocks } from '../blocks/register';
import type { BlockCatalog } from '../blocks/types';

export interface WorldResources {
  materials: WorldMaterials;
  terrainBlocks: WorldBlocks;
  starwatchBlocks: BlockCatalog;
}

export function initializeWorld(noa: Engine): WorldResources {
  const materials = registerWorldMaterials(noa);
  const terrainBlocks = registerWorldBlocks(noa, materials);
  const starwatchBlocks = registerStarwatchBlocks(noa, materials, terrainBlocks.nextBlockId);
  installChunkGenerator(noa, terrainBlocks);

  noa.world.setAddRemoveDistance(CHUNK_ADD_DISTANCE, CHUNK_REMOVE_DISTANCE);
  console.log('[starwatch] distâncias de chunk configuradas');

  return {
    materials,
    terrainBlocks,
    starwatchBlocks,
  };
}
