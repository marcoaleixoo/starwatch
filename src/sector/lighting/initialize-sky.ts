import type { Engine } from 'noa-engine';
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Scene } from '@babylonjs/core/scene';
import { ShaderMaterial } from '@babylonjs/core/Materials/shaderMaterial';
import type { Observer } from '@babylonjs/core/Misc/observable';

import {
  SKY_CLEAR_COLOR,
  STARFIELD_COLOR_A,
  STARFIELD_COLOR_B,
  STARFIELD_DENSITY,
  STARFIELD_INTENSITY,
  STARFIELD_RADIUS_METERS,
  STARFIELD_TWINKLE_BASE_SPEED,
  STARFIELD_THRESHOLD_HIGH,
  STARFIELD_THRESHOLD_LOW,
} from '../../config/sky-options';
import { ensureStarfieldShader } from './starfield-shader';

const SKY_MESH_NAME = 'starwatch:sky-dome';

let skyMaterial: ShaderMaterial | undefined;
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

  material.setFloat('uDensity', STARFIELD_DENSITY);
  material.setFloat('uIntensity', STARFIELD_INTENSITY);
  material.setFloat('uBaseSpeed', STARFIELD_TWINKLE_BASE_SPEED);
  material.setColor3('uColorA', Color3.FromArray(STARFIELD_COLOR_A));
  material.setColor3('uColorB', Color3.FromArray(STARFIELD_COLOR_B));
  material.setFloat('uTime', 0);
  material.setFloat('uThresholdLow', STARFIELD_THRESHOLD_LOW);
  material.setFloat('uThresholdHigh', STARFIELD_THRESHOLD_HIGH);

  attachMaterialUpdater(scene, material);

  if (import.meta.env.DEV && typeof window !== 'undefined') {
    console.log('[starwatch:sky] starfield inicializado', {
      density: STARFIELD_DENSITY,
      intensity: STARFIELD_INTENSITY,
      radius: STARFIELD_RADIUS_METERS,
    });
    (window as any).starwatchSky = {
      mesh,
      material,
      options: {
        density: STARFIELD_DENSITY,
        intensity: STARFIELD_INTENSITY,
        radius: STARFIELD_RADIUS_METERS,
      },
    };
  }
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

  mesh.parent = noa.rendering.camera;
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
        'uThresholdLow',
        'uThresholdHigh',
      ],
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

function attachMaterialUpdater(scene: Scene, material: ShaderMaterial): void {
  if (beforeRenderObserver) {
    scene.onBeforeRenderObservable.remove(beforeRenderObserver);
    beforeRenderObserver = undefined;
  }

  beforeRenderObserver = scene.onBeforeRenderObservable.add(() => {
    const delta = scene.getEngine().getDeltaTime() * 0.001;
    timeAccumulator += delta;
    material.setFloat('uTime', timeAccumulator);
  });
}
