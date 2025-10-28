import type { Engine } from 'noa-engine';
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Scene } from '@babylonjs/core/scene';
import { ShaderMaterial } from '@babylonjs/core/Materials/shaderMaterial';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import type { Effect } from '@babylonjs/core/Materials/effect';
import type { Observer } from '@babylonjs/core/Misc/observable';

import {
  SKY_CLEAR_COLOR,
  STARFIELD_BACKGROUND_INTENSITY,
  STARFIELD_COLOR_A,
  STARFIELD_COLOR_B,
  STARFIELD_DENSITY,
  STARFIELD_INTENSITY,
  STARFIELD_NEBULA_CONTRAST,
  STARFIELD_NEBULA_INTENSITY,
  STARFIELD_RADIUS_METERS,
  STARFIELD_STAR_PROBABILITY,
  STARFIELD_STAR_RADIUS_MAX,
  STARFIELD_STAR_RADIUS_MIN,
  STARFIELD_TWINKLE_BASE_SPEED,
} from '../../config/sky-options';
import { ensureStarfieldShader } from './starfield-shader';
import { initializeNearStarfield } from './near-starfield';

const SKY_MESH_NAME = 'starwatch:sky-dome';
const NEBULA_TEXTURE_URL = new URL('../../assets/sky/hazy_nebulae_1.png', import.meta.url).href;

let skyMaterial: ShaderMaterial | undefined;
let nebulaTexture: Texture | undefined;
let timeAccumulator = 0;
let beforeRenderObserver: Observer<Scene> | undefined;

/**
 * Ajusta o clear color da cena, cria a esfera de fundo e aplica o shader de estrelas.
 */
export function initializeSky(noa: Engine): void {
  const scene = noa.rendering.getScene();
  scene.clearColor = Color4.FromArray(SKY_CLEAR_COLOR);

  ensureStarfieldShader();

  const mesh = getOrCreateSkyMesh(scene, noa);
  const material = getOrCreateSkyMaterial(scene);

  mesh.material = material;
  if (!mesh.metadata?.noa_added_to_scene) {
    noa.rendering.addMeshToScene(mesh, false, [0, 0, 0]);
  }

  const texture = ensureNebulaTexture(scene);
  material.setTexture('uNebulaTexture', texture);
  material.setFloat('uNebulaIntensity', STARFIELD_NEBULA_INTENSITY);
  material.setFloat('uNebulaContrast', STARFIELD_NEBULA_CONTRAST);
  material.setFloat('uDensity', STARFIELD_DENSITY);
  material.setFloat('uIntensity', STARFIELD_INTENSITY);
  material.setFloat('uBaseSpeed', STARFIELD_TWINKLE_BASE_SPEED);
  material.setColor3('uColorA', Color3.FromArray(STARFIELD_COLOR_A));
  material.setColor3('uColorB', Color3.FromArray(STARFIELD_COLOR_B));
  material.setFloat('uTime', 0);
  material.setFloat('uStarProbability', STARFIELD_STAR_PROBABILITY);
  material.setFloat('uStarRadiusMin', STARFIELD_STAR_RADIUS_MIN);
  material.setFloat('uStarRadiusMax', STARFIELD_STAR_RADIUS_MAX);
  material.setFloat('uBackgroundIntensity', STARFIELD_BACKGROUND_INTENSITY);

  attachMaterialUpdater(noa, scene, mesh, material);

  if (import.meta.env.DEV && typeof window !== 'undefined') {
    material.onError = (_effect: Effect, error: string) => {
      console.error('[starwatch:sky] erro ao compilar starfield distante', error);
    };
    material.onCompiled = () => {
      console.log('[starwatch:sky] starfield distante compilado');
    };
    material.forceCompilation(mesh, () => {
      console.log('[starwatch:sky] starfield distante compilado (force)');
    });
    console.log('[starwatch:sky] starfield inicializado', {
      density: STARFIELD_DENSITY,
      intensity: STARFIELD_INTENSITY,
      radius: STARFIELD_RADIUS_METERS,
      nebula: NEBULA_TEXTURE_URL,
    });
    (window as any).starwatchSky = {
      mesh,
      material,
      options: {
        density: STARFIELD_DENSITY,
        intensity: STARFIELD_INTENSITY,
        radius: STARFIELD_RADIUS_METERS,
        nebulaTexture: NEBULA_TEXTURE_URL,
      },
    };
  }

  initializeNearStarfield(noa);
}

function getOrCreateSkyMesh(scene: Scene, noa: Engine): Mesh {
  const existing = scene.getMeshByName(SKY_MESH_NAME);
  if (existing) {
    return existing as Mesh;
  }

  const mesh = MeshBuilder.CreateSphere(
    SKY_MESH_NAME,
    {
      diameter: 2,
      segments: 32,
      sideOrientation: Mesh.BACKSIDE,
    },
    scene,
  );

  mesh.isPickable = false;
  mesh.doNotSyncBoundingInfo = true;
  mesh.alwaysSelectAsActiveMesh = true;
  mesh.applyFog = false;
  mesh.checkCollisions = false;
  mesh.infiniteDistance = true;
  mesh.renderingGroupId = 0;

  mesh.position.set(0, 0, 0);
  mesh.scaling.copyFromFloats(STARFIELD_RADIUS_METERS, STARFIELD_RADIUS_METERS, STARFIELD_RADIUS_METERS);

  return mesh;
}

function getOrCreateSkyMaterial(scene: Scene): ShaderMaterial {
  if (skyMaterial && skyMaterial.getScene() === scene) {
    return skyMaterial;
  }

  skyMaterial?.dispose();

  const material = new ShaderMaterial(
    'starwatch:sky-material',
    scene,
    {
      vertex: 'starwatchStarfield',
      fragment: 'starwatchStarfield',
    },
    {
      attributes: ['position'],
      uniforms: [
        'worldViewProjection',
        'uTime',
        'uDensity',
        'uIntensity',
        'uBaseSpeed',
        'uColorA',
        'uColorB',
        'uNebulaIntensity',
        'uNebulaContrast',
        'uStarProbability',
        'uStarRadiusMin',
        'uStarRadiusMax',
        'uBackgroundIntensity',
      ],
      samplers: ['uNebulaTexture'],
      needAlphaBlending: false,
      needAlphaTesting: false,
    },
  );

  material.backFaceCulling = false;
  material.alpha = 1;
  material.needDepthPrePass = false;
  material.fogEnabled = false;
  material.separateCullingPass = false;
  material.disableDepthWrite = true;

  skyMaterial = material;
  timeAccumulator = 0;

  return material;
}

function attachMaterialUpdater(noa: Engine, scene: Scene, mesh: Mesh, material: ShaderMaterial): void {
  if (beforeRenderObserver) {
    scene.onBeforeRenderObservable.remove(beforeRenderObserver);
    beforeRenderObserver = undefined;
  }

  beforeRenderObserver = scene.onBeforeRenderObservable.add(() => {
    const delta = scene.getEngine().getDeltaTime() * 0.001;
    timeAccumulator += delta;
    material.setFloat('uTime', timeAccumulator);
    const cameraPosition = noa.camera.getPosition();
    mesh.position.set(cameraPosition[0], cameraPosition[1], cameraPosition[2]);
    mesh.rotationQuaternion = null;
    mesh.rotation.set(0, 0, 0);
  });
}

function ensureNebulaTexture(scene: Scene): Texture {
  if (nebulaTexture && nebulaTexture.getScene() === scene) {
    return nebulaTexture;
  }

  nebulaTexture?.dispose();
  nebulaTexture = new Texture(NEBULA_TEXTURE_URL, scene, true, false, Texture.TRILINEAR_SAMPLINGMODE);
  nebulaTexture.wrapU = Texture.WRAP_ADDRESSMODE;
  nebulaTexture.wrapV = Texture.CLAMP_ADDRESSMODE;
  nebulaTexture.gammaSpace = true;

  return nebulaTexture;
}
