import type { Engine } from 'noa-engine';
import { registerMaterials } from './materials';
import { registerBlocks } from './blocks';
import { setupWorldGenerator } from './worldgen';

export function buildWorld(noa: Engine): void {
  const materials = registerMaterials(noa);
  const blocks = registerBlocks(noa, materials);
  setupWorldGenerator(noa, blocks);

  noa.world.setAddRemoveDistance([3, 2], [3.5, 2.5]);
  console.log('[starwatch] distâncias de chunk ajustadas para protótipo inicial');
}
