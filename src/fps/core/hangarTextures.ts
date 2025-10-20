import { PBRMaterial, Scene, Texture } from "babylonjs";
import armorAlbedoUrl from "../../assets/armor-plating1-bl/armor-plating1_albedo.png?url";
import armorNormalUrl from "../../assets/armor-plating1-bl/armor-plating1_normal-ogl.png?url";
import armorRoughnessUrl from "../../assets/armor-plating1-bl/armor-plating1_roughness.png?url";
import armorMetallicUrl from "../../assets/armor-plating1-bl/armor-plating1_metallic.png?url";
import armorAoUrl from "../../assets/armor-plating1-bl/armor-plating1_ao.png?url";
import metalgridAlbedoUrl from "../../assets/metalgrid3-bl/metalgrid3_basecolor.png?url";
import metalgridNormalUrl from "../../assets/metalgrid3-bl/metalgrid3_normal-ogl.png?url";
import metalgridRoughnessUrl from "../../assets/metalgrid3-bl/metalgrid3_roughness.png?url";
import metalgridMetallicUrl from "../../assets/metalgrid3-bl/metalgrid3_metallic.png?url";
import metalgridAoUrl from "../../assets/metalgrid3-bl/metalgrid3_AO.png?url";

export interface HangarTextureSet {
  albedo: Texture;
  normal: Texture;
  roughness: Texture;
  metallic: Texture;
  ao: Texture;
}

type HangarTextureKey = "armor" | "metal";

interface TextureDefinition {
  albedo: string;
  normal: string;
  roughness: string;
  metallic: string;
  ao: string;
}

const TEXTURE_DEFINITIONS: Record<HangarTextureKey, TextureDefinition> = {
  armor: {
    albedo: armorAlbedoUrl,
    normal: armorNormalUrl,
    roughness: armorRoughnessUrl,
    metallic: armorMetallicUrl,
    ao: armorAoUrl,
  },
  metal: {
    albedo: metalgridAlbedoUrl,
    normal: metalgridNormalUrl,
    roughness: metalgridRoughnessUrl,
    metallic: metalgridMetallicUrl,
    ao: metalgridAoUrl,
  },
};

const textureCache = new WeakMap<Scene, Map<HangarTextureKey, HangarTextureSet>>();

function createTexture(scene: Scene, url: string): Texture {
  return new Texture(url, scene, false, true, Texture.TRILINEAR_SAMPLINGMODE);
}

function createTextureSet(scene: Scene, key: HangarTextureKey): HangarTextureSet {
  const definition = TEXTURE_DEFINITIONS[key];
  const albedo = createTexture(scene, definition.albedo);
  const normal = createTexture(scene, definition.normal);
  const roughness = createTexture(scene, definition.roughness);
  const metallic = createTexture(scene, definition.metallic);
  const ao = createTexture(scene, definition.ao);

  [albedo, normal, roughness, metallic, ao].forEach((texture) => {
    texture.wrapU = Texture.WRAP_ADDRESSMODE;
    texture.wrapV = Texture.WRAP_ADDRESSMODE;
  });
  normal.invertZ = true;
  normal.gammaSpace = false;

  return { albedo, normal, roughness, metallic, ao };
}

export function getHangarTextureSet(scene: Scene, key: HangarTextureKey): HangarTextureSet {
  let map = textureCache.get(scene);
  if (!map) {
    map = new Map<HangarTextureKey, HangarTextureSet>();
    textureCache.set(scene, map);
  }
  let set = map.get(key);
  if (!set) {
    set = createTextureSet(scene, key);
    map.set(key, set);
  }
  return set;
}

export function applyHangarTextures(
  material: PBRMaterial,
  textures: HangarTextureSet,
  tiling: { u: number; v: number },
) {
  disposeHangarMaterial(material);

  const albedo = textures.albedo.clone();
  const normal = textures.normal.clone();
  const metallic = textures.metallic.clone();
  const ao = textures.ao.clone();

  [albedo, normal, metallic, ao].forEach((texture) => {
    texture.uScale = tiling.u;
    texture.vScale = tiling.v;
    texture.wrapU = Texture.WRAP_ADDRESSMODE;
    texture.wrapV = Texture.WRAP_ADDRESSMODE;
  });

  material.albedoTexture = albedo;
  material.bumpTexture = normal;
  material.metallicTexture = metallic;
  material.ambientTexture = ao;

  const metadata = (material.metadata as { hangarTextureClones?: Texture[] } | undefined) ?? {};
  metadata.hangarTextureClones = [albedo, normal, metallic, ao];
  material.metadata = metadata;
}

export function disposeHangarMaterial(material: PBRMaterial) {
  const metadata = (material.metadata as { hangarTextureClones?: Texture[] } | undefined) ?? {};
  metadata.hangarTextureClones?.forEach((texture) => {
    texture.dispose();
  });
  if (metadata.hangarTextureClones) {
    metadata.hangarTextureClones = [];
  }
  material.metadata = metadata;
}

export function disposeHangarTextureCache(scene: Scene) {
  const map = textureCache.get(scene);
  if (!map) {
    return;
  }
  map.forEach((set) => {
    set.albedo.dispose();
    set.normal.dispose();
    set.roughness.dispose();
    set.metallic.dispose();
    set.ao.dispose();
  });
  map.clear();
  textureCache.delete(scene);
}
