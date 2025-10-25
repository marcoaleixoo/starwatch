import type { Engine } from 'noa-engine';
import type { WorldMaterials } from './materials';
import { ASTEROID_VARIANTS } from '../config/world-options';

export interface WorldBlocks {
  dirt: number;
  asteroidVariants: number[];
}

export function registerWorldBlocks(noa: Engine, materials: WorldMaterials): WorldBlocks {
  console.log('[starwatch] registrando blocos do mundo');

  let blockId = 1;

  const dirt = noa.registry.registerBlock(blockId++, {
    material: materials.dirt,
    solid: true,
  });

  const asteroidVariantBlocks = materials.asteroidVariants.map((materialName, index) => {
    const blockName = `asteroid-${ASTEROID_VARIANTS[index]?.id ?? index}`;
    return noa.registry.registerBlock(blockId++, {
      material: materialName,
      solid: true,
      opaque: true,
      blockLight: true,
      hardness: 3,
      displayName: blockName,
    });
  });

  return {
    dirt,
    asteroidVariants: asteroidVariantBlocks,
  };
}
