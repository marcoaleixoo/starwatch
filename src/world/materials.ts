import type { Engine } from 'noa-engine';
import terrainAtlasUrl from './assets/terrain_atlas.png';

export interface WorldMaterials {
  dirt: string;
  asteroid: string;
}

export function registerWorldMaterials(noa: Engine): WorldMaterials {
  console.log('[starwatch] registrando materiais base do mundo');

  noa.registry.registerMaterial('dirt', {
    textureURL: terrainAtlasUrl,
    atlasIndex: 2,
  });

  noa.registry.registerMaterial('asteroid', {
    color: [0.58, 0.6, 0.62, 1],
  });

  return {
    dirt: 'dirt',
    asteroid: 'asteroid',
  };
}
