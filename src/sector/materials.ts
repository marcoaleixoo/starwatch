import type { Engine } from 'noa-engine';
import terrainAtlasUrl from './assets/terrain_atlas.png';
import { ASTEROID_VARIANTS } from '../config/sector-options';

export interface RegisteredMaterial {
  name: string;
  solarOpacity: number;
}

export interface AsteroidMaterialDescriptor {
  id: string;
  weight: number;
  material: RegisteredMaterial;
}

export interface SectorMaterials {
  dirt: RegisteredMaterial;
  deck: RegisteredMaterial;
  solarPanel: RegisteredMaterial;
  battery: RegisteredMaterial;
  terminal: RegisteredMaterial;
  asteroidVariants: AsteroidMaterialDescriptor[];
}

interface RegisterMaterialOptions {
  color?: [number, number, number];
  textureURL?: string;
  atlasIndex?: number;
  solarOpacity: number;
}

function registerMaterial(noa: Engine, name: string, options: RegisterMaterialOptions): RegisteredMaterial {
  noa.registry.registerMaterial(name, {
    color: options.color,
    textureURL: options.textureURL,
    atlasIndex: options.atlasIndex,
  });

  return {
    name,
    solarOpacity: options.solarOpacity,
  };
}

export function registerSectorMaterials(noa: Engine): SectorMaterials {
  console.log('[starwatch] registrando materiais base do setor');

  const dirt = registerMaterial(noa, 'dirt', {
    textureURL: terrainAtlasUrl,
    atlasIndex: 2,
    solarOpacity: 1,
  });

  const deck = registerMaterial(noa, 'deck-metal', {
    color: [0.22, 0.28, 0.42],
    solarOpacity: 1,
  });

  const solarPanel = registerMaterial(noa, 'solar-panel-block', {
    color: [0.09, 0.21, 0.46],
    solarOpacity: 0.05,
  });

  const battery = registerMaterial(noa, 'battery-block', {
    color: [0.14, 0.18, 0.28],
    solarOpacity: 1,
  });

  const terminal = registerMaterial(noa, 'terminal-block', {
    color: [0.12, 0.2, 0.36],
    solarOpacity: 1,
  });

  const asteroidMaterials = ASTEROID_VARIANTS.map((variant) => {
    const [r, g, b] = variant.color;
    const material = registerMaterial(noa, `asteroid-${variant.id}`, {
      color: [r, g, b],
      solarOpacity: 1,
    });
    return {
      id: variant.id,
      weight: variant.weight,
      material,
    };
  });

  return {
    dirt,
    deck,
    solarPanel,
    battery,
    terminal,
    asteroidVariants: asteroidMaterials,
  };
}
