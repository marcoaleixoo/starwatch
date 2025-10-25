import type { Engine } from 'noa-engine';
import { registerWorldMaterials } from './materials';
import { registerWorldBlocks } from './blocks';
import { installChunkGenerator } from './chunk-generator';
import { CHUNK_ADD_DISTANCE, CHUNK_REMOVE_DISTANCE } from '../config/render-options';

export function initializeWorld(noa: Engine): void {
  const materials = registerWorldMaterials(noa);
  const blocks = registerWorldBlocks(noa, materials);
  installChunkGenerator(noa, blocks);

  noa.world.setAddRemoveDistance(CHUNK_ADD_DISTANCE, CHUNK_REMOVE_DISTANCE);
  console.log('[starwatch] distâncias de chunk configuradas');
}
