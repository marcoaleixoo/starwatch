import type { Engine } from 'noa-engine';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import '@babylonjs/core/Meshes/thinInstanceMesh';
import { Scene } from '@babylonjs/core/scene';
import { ShaderMaterial } from '@babylonjs/core/Materials/shaderMaterial';
import type { Effect } from '@babylonjs/core/Materials/effect';
import { Matrix, Vector2, Vector3 } from '@babylonjs/core/Maths/math.vector';
import type { Observer } from '@babylonjs/core/Misc/observable';

import {
  STARFIELD_COLOR_A,
  STARFIELD_COLOR_B,
  STARFIELD_NEAR_COUNT,
  STARFIELD_NEAR_INTENSITY_MAX,
  STARFIELD_NEAR_INTENSITY_MIN,
  STARFIELD_NEAR_PARALLAX_SCALE,
  STARFIELD_NEAR_ROTATION_SPEED_DEG,
  STARFIELD_NEAR_SIZE_MAX,
  STARFIELD_NEAR_SIZE_MIN,
  STARFIELD_NEAR_SPHERE_RADIUS_METERS,
  STARFIELD_NEAR_TWINKLE_AMPLITUDE,
  STARFIELD_NEAR_TWINKLE_SPEED,
} from '../../config/sky-options';
import { ensureNearStarfieldShader } from './near-starfield-shader';

const NEAR_STARFIELD_MESH_NAME = 'starwatch:starfield-near';

let thinInstancePrepared = false;
let beforeRenderObserver: Observer<Scene> | undefined;
let timeAccumulator = 0;
let rotationAngle = 0;
const sharedCameraPosition = new Vector3();
const sharedAnchor = new Vector3();
const sharedParallax = new Vector3();
const sharedRotation = Matrix.Identity();
const sharedMatrixArray = new Float32Array(16);

/**
 * Instancia estrelas próximas com cintilância e parallax leve.
 */
export function initializeNearStarfield(noa: Engine): void {
  const scene = noa.rendering.getScene();
  ensureNearStarfieldShader();

  timeAccumulator = 0;
  rotationAngle = 0;

  const mesh = getOrCreateMesh(scene);
  const material = getOrCreateMaterial(scene);

  mesh.material = material;

  if (!thinInstancePrepared) {
    populateThinInstances(mesh);
    thinInstancePrepared = true;
  }
  if (!mesh.metadata?.noa_added_to_scene) {
    noa.rendering.addMeshToScene(mesh, false, [0, 0, 0]);
  }

  attachUpdater(scene, noa, material);

  if (import.meta.env.DEV && typeof window !== 'undefined') {
    material.onError = (_effect: Effect, error: string) => {
      console.error('[starwatch:sky] erro ao compilar starfield próximo', error);
    };
    material.onCompiled = () => {
      console.log('[starwatch:sky] starfield próximo compilado');
    };
    material.forceCompilation(mesh, () => {
      console.log('[starwatch:sky] starfield próximo compilado (force)');
    });
    console.log('[starwatch:sky]', 'starfield próximo ativo', {
      count: STARFIELD_NEAR_COUNT,
      radius: STARFIELD_NEAR_SPHERE_RADIUS_METERS,
    });
    (window as any).starwatchNearStarfield = {
      mesh,
      material,
      options: {
        count: STARFIELD_NEAR_COUNT,
        radius: STARFIELD_NEAR_SPHERE_RADIUS_METERS,
      },
    };
  }
}

function getOrCreateMesh(scene: Scene): Mesh {
  const existing = scene.getMeshByName(NEAR_STARFIELD_MESH_NAME);
  if (existing) {
    return existing as Mesh;
  }

  const mesh = MeshBuilder.CreatePlane(
    NEAR_STARFIELD_MESH_NAME,
    {
      size: 1,
      sideOrientation: Mesh.DOUBLESIDE,
    },
    scene,
  );

  mesh.isPickable = false;
  mesh.alwaysSelectAsActiveMesh = true;
  mesh.doNotSyncBoundingInfo = true;
  mesh.renderingGroupId = 1;
  mesh.applyFog = false;
  mesh.infiniteDistance = false;
  mesh.billboardMode = Mesh.BILLBOARDMODE_NONE;
  mesh.thinInstanceEnablePicking = false;
  mesh.freezeWorldMatrix();
  return mesh;
}

function getOrCreateMaterial(scene: Scene): ShaderMaterial {
  const existing = scene.getMaterialByName('starwatch:near-starfield-material');
  if (existing) {
    return existing as ShaderMaterial;
  }

  const material = new ShaderMaterial(
    'starwatch:near-starfield-material',
    scene,
    {
      vertex: 'starwatchNearStarfield',
      fragment: 'starwatchNearStarfield',
    },
    {
      attributes: ['position', 'uv', 'instanceDirection', 'instanceSize', 'instanceColor', 'instanceTwinkle'],
      uniforms: [
        'view',
        'projection',
        'uRotation',
        'uCameraPosition',
        'uAnchor',
        'uParallaxOffset',
        'uRadius',
        'uIntensityRange',
        'uTime',
        'uTwinkleAmplitude',
        'uTwinkleSpeed',
      ],
      needAlphaBlending: true,
      needAlphaTesting: false,
    },
  );

  material.backFaceCulling = false;
  material.alpha = 1;
  material.disableDepthWrite = true;
  material.forceDepthWrite = false;
  material.fogEnabled = false;

  material.setFloat('uRadius', STARFIELD_NEAR_SPHERE_RADIUS_METERS);
  material.setVector2('uIntensityRange', new Vector2(STARFIELD_NEAR_INTENSITY_MIN, STARFIELD_NEAR_INTENSITY_MAX));
  material.setFloat('uTwinkleAmplitude', STARFIELD_NEAR_TWINKLE_AMPLITUDE);
  material.setFloat('uTwinkleSpeed', STARFIELD_NEAR_TWINKLE_SPEED);
  (material as any).useThinInstances = true;

  return material;
}

function populateThinInstances(mesh: Mesh): void {
  const count = STARFIELD_NEAR_COUNT;
  const matrixData = new Float32Array(count * 16);
  const directionData = new Float32Array(count * 3);
  const sizeData = new Float32Array(count);
  const colorData = new Float32Array(count * 3);
  const twinkleData = new Float32Array(count * 3);

  const random = createRandom(0x5f3759df);

  const baseColorA = STARFIELD_COLOR_A;
  const baseColorB = STARFIELD_COLOR_B;

  const identity = Matrix.Identity().asArray();

  for (let i = 0; i < count; i += 1) {
    const dir = sampleDirection(random);
    directionData[i * 3 + 0] = dir.x;
    directionData[i * 3 + 1] = dir.y;
    directionData[i * 3 + 2] = dir.z;

    const size = lerp(STARFIELD_NEAR_SIZE_MIN, STARFIELD_NEAR_SIZE_MAX, Math.pow(random(), 0.95));
    sizeData[i] = size;

    const hueBlend = Math.pow(random(), 1.6);
    const tint = 0.2 * (random() - 0.5);
    const color = mixColor(baseColorA, baseColorB, hueBlend);
    colorData[i * 3 + 0] = clamp01(color[0] + tint);
    colorData[i * 3 + 1] = clamp01(color[1] + tint * 0.5);
    colorData[i * 3 + 2] = clamp01(color[2]);

    const phase = random() * Math.PI * 2;
    const speedVariance = random();
    const intensityLerp = Math.pow(random(), 0.7);
    twinkleData[i * 3 + 0] = phase;
    twinkleData[i * 3 + 1] = speedVariance;
    twinkleData[i * 3 + 2] = intensityLerp;

    matrixData.set(identity, i * 16);
  }

  mesh.thinInstanceSetBuffer('matrix', matrixData, 16, true);
  mesh.thinInstanceSetBuffer('instanceDirection', directionData, 3, true);
  mesh.thinInstanceSetBuffer('instanceSize', sizeData, 1, true);
  mesh.thinInstanceSetBuffer('instanceColor', colorData, 3, true);
  mesh.thinInstanceSetBuffer('instanceTwinkle', twinkleData, 3, true);
  mesh.thinInstanceCount = count;
}

function attachUpdater(scene: Scene, noa: Engine, material: ShaderMaterial): void {
  if (beforeRenderObserver) {
    scene.onBeforeRenderObservable.remove(beforeRenderObserver);
    beforeRenderObserver = undefined;
  }

  const degToRad = Math.PI / 180;

  beforeRenderObserver = scene.onBeforeRenderObservable.add(() => {
    const delta = scene.getEngine().getDeltaTime() * 0.001;
    timeAccumulator += delta;
    rotationAngle = (rotationAngle + STARFIELD_NEAR_ROTATION_SPEED_DEG * degToRad * delta) % (Math.PI * 2);

    const cameraPosition = noa.camera.getPosition();
    sharedCameraPosition.set(cameraPosition[0], cameraPosition[1], cameraPosition[2]);
    sharedAnchor.copyFrom(sharedCameraPosition);

    sharedParallax.set(
      sharedCameraPosition.x * STARFIELD_NEAR_PARALLAX_SCALE,
      sharedCameraPosition.y * STARFIELD_NEAR_PARALLAX_SCALE * 0.5,
      sharedCameraPosition.z * STARFIELD_NEAR_PARALLAX_SCALE,
    );

  Matrix.RotationYawPitchRollToRef(rotationAngle * 0.6, rotationAngle * 0.2, rotationAngle * 0.4, sharedRotation);

  material.setMatrix('uRotation', sharedRotation);
    material.setVector3('uCameraPosition', sharedCameraPosition);
    material.setVector3('uAnchor', sharedAnchor);
    material.setVector3('uParallaxOffset', sharedParallax);
    material.setFloat('uTime', timeAccumulator);
  });
}

function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return (state & 0xffffffff) / 0xffffffff;
  };
}

function sampleDirection(random: () => number): Vector3 {
  const u = random();
  const v = random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const sinPhi = Math.sin(phi);
  const x = sinPhi * Math.cos(theta);
  const y = Math.cos(phi);
  const z = sinPhi * Math.sin(theta);
  return new Vector3(x, y, z);
}

function mixColor(a: readonly [number, number, number], b: readonly [number, number, number], t: number) {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}
