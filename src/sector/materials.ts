import type { Engine } from 'noa-engine';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import terrainAtlasUrl from './assets/terrain_atlas.png';
import { ASTEROID_VARIANTS } from '../config/sector-options';

const DECK_ALBEDO_URL = new URL('../../assets/metalgrid3-bl/metalgrid3_basecolor.png', import.meta.url).href;
const DECK_NORMAL_URL = new URL('../../assets/metalgrid3-bl/metalgrid3_normal-ogl.png', import.meta.url).href;
const DECK_AO_URL = new URL('../../assets/metalgrid3-bl/metalgrid3_AO.png', import.meta.url).href;
const DECK_METALLIC_URL = new URL('../../assets/metalgrid3-bl/metalgrid3_metallic.png', import.meta.url).href;

let cachedDeckMaterial: StandardMaterial | undefined;

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
  renderMaterial?: StandardMaterial;
}

function registerMaterial(noa: Engine, name: string, options: RegisterMaterialOptions): RegisteredMaterial {
  noa.registry.registerMaterial(name, {
    color: options.color,
    textureURL: options.textureURL,
    atlasIndex: options.atlasIndex,
    renderMaterial: options.renderMaterial,
  });

  return {
    name,
    solarOpacity: options.solarOpacity,
  };
}

function ensureDeckRenderMaterial(noa: Engine): StandardMaterial {
  const scene = noa.rendering.getScene();
  if (cachedDeckMaterial) {
    const disposed = ((cachedDeckMaterial as unknown as { isDisposed?: () => boolean }).isDisposed?.() ?? false);
    if (!disposed && cachedDeckMaterial.getScene() === scene) {
      return cachedDeckMaterial;
    }
    cachedDeckMaterial.dispose();
  }

  const material = new StandardMaterial('starwatch:deck-material', scene);

  const diffuseTexture = new Texture(DECK_ALBEDO_URL, scene, false, false, Texture.BILINEAR_SAMPLINGMODE);
  diffuseTexture.wrapU = Texture.WRAP_ADDRESSMODE;
  diffuseTexture.wrapV = Texture.WRAP_ADDRESSMODE;
  material.diffuseTexture = diffuseTexture;

  const bumpTexture = new Texture(DECK_NORMAL_URL, scene, false, false, Texture.BILINEAR_SAMPLINGMODE);
  bumpTexture.level = 0.9;
  material.bumpTexture = bumpTexture;

  const specularTexture = new Texture(DECK_METALLIC_URL, scene, false, false, Texture.BILINEAR_SAMPLINGMODE);
  specularTexture.wrapU = Texture.WRAP_ADDRESSMODE;
  specularTexture.wrapV = Texture.WRAP_ADDRESSMODE;
  material.specularTexture = specularTexture;

  const ambientTexture = new Texture(DECK_AO_URL, scene, false, false, Texture.BILINEAR_SAMPLINGMODE);
  ambientTexture.wrapU = Texture.WRAP_ADDRESSMODE;
  ambientTexture.wrapV = Texture.WRAP_ADDRESSMODE;
  material.ambientTexture = ambientTexture;

  material.roughness = 0.45;

  material.specularColor = new Color3(0.86, 0.9, 0.95);
  material.specularPower = 96;
  material.emissiveColor = new Color3(0.02, 0.02, 0.03);
  material.ambientColor = new Color3(0.08, 0.08, 0.1);
  material.disableLighting = false;
  material.backFaceCulling = true;

  material.freeze();

  cachedDeckMaterial = material;
  return material;
}

export function registerSectorMaterials(noa: Engine): SectorMaterials {
  console.log('[starwatch] registrando materiais base do setor');

  const dirt = registerMaterial(noa, 'dirt', {
    textureURL: terrainAtlasUrl,
    atlasIndex: 2,
    solarOpacity: 1,
  });

  const deck = registerMaterial(noa, 'deck-metal', {
    textureURL: DECK_ALBEDO_URL,
    renderMaterial: ensureDeckRenderMaterial(noa),
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
