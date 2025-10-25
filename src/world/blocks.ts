import type { Engine } from 'noa-engine';
import type { WorldMaterials } from './materials';

export interface WorldBlocks {
  dirt: number;
  cloud: number;
}

export function registerWorldBlocks(noa: Engine, materials: WorldMaterials): WorldBlocks {
  console.log('[starwatch] registrando blocos do mundo');

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
