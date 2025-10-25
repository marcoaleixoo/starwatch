import type { Engine } from 'noa-engine';
import terrainAtlasUrl from './assets/terrain_atlas.png';

export interface WorldMaterials {
  dirt: string;
  cloud: string;
}

export function registerWorldMaterials(noa: Engine): WorldMaterials {
  console.log('[starwatch] registrando materiais base do mundo');

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
