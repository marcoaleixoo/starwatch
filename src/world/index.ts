import type { Engine } from 'noa-engine';
import { registerWorldMaterials } from './materials';
import { registerWorldBlocks } from './blocks';
import { installChunkGenerator } from './chunk-generator';

export function initializeWorld(noa: Engine): void {
  const materials = registerWorldMaterials(noa);
  const blocks = registerWorldBlocks(noa, materials);
  installChunkGenerator(noa, blocks);

  noa.world.setAddRemoveDistance([3, 2], [3.5, 2.5]);
  console.log('[starwatch] distâncias de chunk configuradas');
}
