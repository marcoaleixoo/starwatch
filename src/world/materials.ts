import type { Engine } from 'noa-engine';
import terrainAtlasUrl from './assets/terrain_atlas.png';
import { ASTEROID_VARIANTS } from '../config/world-options';

export interface WorldMaterials {
  dirt: string;
  asteroidVariants: string[];
}

export function registerWorldMaterials(noa: Engine): WorldMaterials {
  console.log('[starwatch] registrando materiais base do mundo');

  noa.registry.registerMaterial('dirt', {
    textureURL: terrainAtlasUrl,
    atlasIndex: 2,
  });

  const asteroidMaterials = ASTEROID_VARIANTS.map((variant) => {
    const materialName = `asteroid-${variant.id}`;
    noa.registry.registerMaterial(materialName, {
      color: variant.color,
    });
    return materialName;
  });

  return {
    dirt: 'dirt',
    asteroidVariants: asteroidMaterials,
  };
}
