import type { Engine } from 'noa-engine';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Scene } from '@babylonjs/core/scene';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { GlowLayer } from '@babylonjs/core/Layers/glowLayer';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import type { Observer } from '@babylonjs/core/Misc/observable';

import {
  STAR_DIRECTION,
  STAR_DISTANCE_METERS,
  STAR_DIFFUSE_COLOR,
  STAR_GLOW_INTENSITY,
  STAR_LIGHT_INTENSITY,
  STAR_SHADOW_RANGE,
  STAR_SPECULAR_COLOR,
  STAR_VISUAL_RADIUS_METERS,
  STAR_CAMERA_FAR_PLANE_PADDING,
  STAR_EMISSIVE_INTENSITY,
} from '../../config/star-options';

const STAR_MESH_NAME = 'starwatch:star';
const STAR_GLOW_LAYER_NAME = 'starwatch:star-glow';

let cachedGlowLayer: GlowLayer | undefined;
let glowLayerScene: Scene | undefined;
let beforeRenderObserver: Observer<Scene> | undefined;
const sharedCameraPosition = [0, 0, 0] as [number, number, number];
const sharedGlobalPosition = [0, 0, 0] as [number, number, number];
const sharedLocalPosition = [0, 0, 0] as [number, number, number];

/**
 * Configura a luz direcional global e instancia o mesh emissivo que representa o sol.
 */
export function initializeStar(noa: Engine): void {
  const { light } = noa.rendering;
  if (!light) {
    console.warn('[starwatch] DirectionalLight não disponível para configurar estrela.');
    return;
  }

  const scene = noa.rendering.getScene();
  const starDirection = Vector3.FromArray(STAR_DIRECTION);
  starDirection.normalize();
  const lightDirection = new Vector3();
  starDirection.scaleToRef(-1, lightDirection);

  // Atualiza o light principal mantendo o pipeline de sombras existente.
  light.direction.copyFrom(lightDirection);
  light.intensity = STAR_LIGHT_INTENSITY;
  light.diffuse = Color3.FromArray(STAR_DIFFUSE_COLOR);
  light.specular = Color3.FromArray(STAR_SPECULAR_COLOR);
  light.shadowMinZ = STAR_SHADOW_RANGE[0];
  light.shadowMaxZ = STAR_SHADOW_RANGE[1];

  // O mesh é posicionado no sentido da estrela, a grande distância.
  const existingMesh = scene.getMeshByName(STAR_MESH_NAME);
  const starMesh = (existingMesh as Mesh | null) ?? createStarMesh(scene);
  const starMaterial = starMesh.material as StandardMaterial | null;
  if (starMaterial) {
    const emissive = Color3.FromArray(STAR_DIFFUSE_COLOR).scale(STAR_EMISSIVE_INTENSITY);
    starMaterial.emissiveColor = emissive;
    starMaterial.diffuseColor = emissive.clone();
    starMaterial.specularColor = new Color3(0, 0, 0);
    starMaterial.alpha = 1;
    starMaterial.disableLighting = true;
  }

  starMesh.scaling.setAll(STAR_VISUAL_RADIUS_METERS);
  starMesh.computeWorldMatrix(true);
  starMesh.refreshBoundingInfo();
  updateStarTransform(noa, starMesh, starDirection, true);

  ensureGlowLayer(scene, starMesh);
  attachStarUpdater(scene, noa, starMesh, starDirection);

  const camera = noa.rendering.camera;
  if (camera && typeof camera.maxZ === 'number') {
    const targetFar = STAR_DISTANCE_METERS + STAR_VISUAL_RADIUS_METERS * 2 + STAR_CAMERA_FAR_PLANE_PADDING;
    if (camera.maxZ < targetFar) {
      camera.maxZ = targetFar;
    }
  }

  if (import.meta.env.DEV && typeof window !== 'undefined') {
    const activeCamera = scene.activeCamera ?? noa.rendering.camera;
    const distanceToCamera = Vector3.Distance(starMesh.getAbsolutePosition(), activeCamera.position);
    const boundingRadius = starMesh.getBoundingInfo().boundingSphere.radius;
    const debugMesh = starMesh as any;
    debugMesh.showBoundingBox = true;
    debugMesh.renderOutline = true;
    debugMesh.outlineWidth = 0.1;
    debugMesh.outlineColor = new Color3(1, 0.9, 0);
    console.log(
      '[starwatch:star]',
      `dir=(${starDirection.x.toFixed(3)}, ${starDirection.y.toFixed(3)}, ${starDirection.z.toFixed(3)})`,
      `dist-config=${STAR_DISTANCE_METERS}`,
      `dist-camera=${distanceToCamera.toFixed(2)}`,
      `radius=${boundingRadius.toFixed(2)}`,
      `radiusWorld=${starMesh.getBoundingInfo().boundingSphere.radiusWorld.toFixed(2)}`,
      `scaling=${starMesh.scaling.asArray().map((v) => v.toFixed(2)).join(',')}`,
      `camera.maxZ=${(activeCamera as any).maxZ ?? 'n/a'}`,
    );
    (window as any).starwatchStar = {
      mesh: starMesh,
      direction: starDirection.clone(),
      lightDirection: lightDirection.clone(),
      options: {
        distance: STAR_DISTANCE_METERS,
        radius: STAR_VISUAL_RADIUS_METERS,
      },
      updatePreviewPosition(): void {
        updateStarTransform(noa, starMesh, starDirection, true);
      },
      logSnapshot(): void {
        const cam = scene.activeCamera ?? noa.rendering.camera;
        const camPos = cam.position;
        const absPos = starMesh.getAbsolutePosition();
        const bounding = starMesh.getBoundingInfo().boundingSphere;
        console.log('[starwatch:star:snapshot]', {
          globalPosition: absPos.asArray(),
          cameraPosition: [camPos.x, camPos.y, camPos.z],
          distanceToCamera: Vector3.Distance(absPos, camPos),
          radius: bounding.radius,
          diameter: bounding.radius * 2,
        });
      },
      getDistanceToCamera(): number {
        const cameraPos = scene.activeCamera?.position ?? starMesh.getScene().activeCamera?.position;
        if (!cameraPos) {
          return 0;
        }
        return Vector3.Distance(starMesh.getAbsolutePosition(), cameraPos);
      },
    };
  }
}

function createStarMesh(scene: Scene): Mesh {
  const mesh = MeshBuilder.CreateSphere(
    STAR_MESH_NAME,
    {
      diameter: 2,
      segments: 32,
    },
    scene,
  );

  mesh.isPickable = false;
  mesh.doNotSyncBoundingInfo = false;
  mesh.alwaysSelectAsActiveMesh = true;
  mesh.applyFog = false;
  mesh.infiniteDistance = false;
  mesh.renderingGroupId = 1;
  mesh.rotationQuaternion = null;

  const material = new StandardMaterial(`${STAR_MESH_NAME}-material`, scene);
  material.disableLighting = true;
  material.emissiveColor = Color3.FromArray(STAR_DIFFUSE_COLOR).scale(STAR_EMISSIVE_INTENSITY);
  material.backFaceCulling = false;
  mesh.material = material;

  return mesh;
}

function ensureGlowLayer(scene: Scene, starMesh: Mesh): void {
  if (!cachedGlowLayer || glowLayerScene !== scene) {
    cachedGlowLayer?.dispose();
    cachedGlowLayer = new GlowLayer(STAR_GLOW_LAYER_NAME, scene, {
      mainTextureFixedSize: 1024,
      blurKernelSize: 64,
    });
    cachedGlowLayer.addIncludedOnlyMesh(starMesh);
    glowLayerScene = scene;
  }

  if (cachedGlowLayer && !cachedGlowLayer.hasMesh(starMesh)) {
    cachedGlowLayer.addIncludedOnlyMesh(starMesh);
  }

  if (cachedGlowLayer) {
    cachedGlowLayer.intensity = STAR_GLOW_INTENSITY;
  }
}

function attachStarUpdater(scene: Scene, noa: Engine, starMesh: Mesh, starDirection: Vector3): void {
  if (beforeRenderObserver) {
    scene.onBeforeRenderObservable.remove(beforeRenderObserver);
    beforeRenderObserver = undefined;
  }

  beforeRenderObserver = scene.onBeforeRenderObservable.add(() => {
    updateStarTransform(noa, starMesh, starDirection, false);
  });
}

function updateStarTransform(
  noa: Engine,
  starMesh: Mesh,
  starDirection: Vector3,
  forceSync: boolean,
): void {
  const cameraPosition = noa.camera.getPosition();
  sharedCameraPosition[0] = cameraPosition[0];
  sharedCameraPosition[1] = cameraPosition[1];
  sharedCameraPosition[2] = cameraPosition[2];

  sharedGlobalPosition[0] = sharedCameraPosition[0] + starDirection.x * STAR_DISTANCE_METERS;
  sharedGlobalPosition[1] = sharedCameraPosition[1] + starDirection.y * STAR_DISTANCE_METERS;
  sharedGlobalPosition[2] = sharedCameraPosition[2] + starDirection.z * STAR_DISTANCE_METERS;

  if (!starMesh.metadata?.noa_added_to_scene) {
    noa.rendering.addMeshToScene(starMesh, false, [...sharedGlobalPosition]);
  }

  noa.globalToLocal(sharedGlobalPosition, null, sharedLocalPosition);
  starMesh.position.set(sharedLocalPosition[0], sharedLocalPosition[1], sharedLocalPosition[2]);

  if (forceSync) {
    starMesh.computeWorldMatrix(true);
    starMesh.refreshBoundingInfo();
  }
}
