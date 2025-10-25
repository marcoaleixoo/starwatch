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
  nextBlockId: number;
}

export function registerWorldBlocks(noa: Engine, materials: WorldMaterials): WorldBlocks {
  console.log('[starwatch] registrando blocos do mundo');

  const dirt = noa.registry.registerBlock(1, {
    material: materials.dirt.name,
    solid: true,
  });

  let nextBlockId = 2;

  const asteroidVariantBlocks = materials.asteroidVariants.map((variant) => {
    const blockId = noa.registry.registerBlock(nextBlockId, {
      material: variant.material.name,
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
      materialName: variant.material.name,
      blockId,
    };
  });

  return {
    dirt,
    asteroidVariants: asteroidVariantBlocks,
    nextBlockId,
  };
}
