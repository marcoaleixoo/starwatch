import type { Engine } from 'noa-engine';
import terrainAtlasUrl from '../assets/textures/terrain_atlas.png';

export interface MaterialHandles {
  dirt: string;
  cloud: string;
}

export function registerMaterials(noa: Engine): MaterialHandles {
  console.log('[starwatch] registrando materiais base');

  noa.registry.registerMaterial('dirt', {
    textureURL: terrainAtlasUrl,
    atlasIndex: 2,
  });

  noa.registry.registerMaterial('cloud', {
    color: [1, 1, 1, 0.45],
    transparent: true,
  });

  return {
    dirt: 'dirt',
    cloud: 'cloud',
  };
}
