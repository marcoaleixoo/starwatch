import type { Engine } from 'noa-engine';
import type { MaterialHandles } from './materials';

export interface BlockHandles {
  dirt: number;
  cloud: number;
}

export function registerBlocks(noa: Engine, materials: MaterialHandles): BlockHandles {
  console.log('[starwatch] registrando blocos base');

  let blockId = 1;

  const dirt = noa.registry.registerBlock(blockId++, {
    material: materials.dirt,
    solid: true,
  });

  const cloud = noa.registry.registerBlock(blockId++, {
    material: materials.cloud,
    solid: false,
    opaque: false,
    blockLight: false,
  });

  return {
    dirt,
    cloud,
  };
}
