import type { Engine } from 'noa-engine';
import type { WorldMaterials } from './materials';

export interface AsteroidBlockDescriptor {
  id: string;
  weight: number;
  materialName: string;
  blockId: number;
}

export interface WorldBlocks {
  dirt: number;
  asteroidVariants: AsteroidBlockDescriptor[];
}

export function registerWorldBlocks(noa: Engine, materials: WorldMaterials): WorldBlocks {
  console.log('[starwatch] registrando blocos do mundo');

  const dirt = noa.registry.registerBlock(1, {
    material: materials.dirt,
    solid: true,
  });

  let nextBlockId = 2;

  const asteroidVariantBlocks = materials.asteroidVariants.map((variant) => {
    const blockId = noa.registry.registerBlock(nextBlockId, {
      material: variant.materialName,
      solid: true,
      opaque: true,
      blockLight: true,
      hardness: 3,
      displayName: `asteroid-${variant.id}`,
    });
    nextBlockId += 1;
    return {
      id: variant.id,
      weight: variant.weight,
      materialName: variant.materialName,
      blockId,
    };
  });

  return {
    dirt,
    asteroidVariants: asteroidVariantBlocks,
  };
}
