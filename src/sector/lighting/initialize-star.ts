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
  STAR_APPROACH_DISTANCE_METERS,
  STAR_CAMERA_FAR_PLANE_PADDING,
  STAR_CAMERA_PHYSICAL_PADDING,
  STAR_DIFFUSE_COLOR,
  STAR_GLOW_INTENSITY,
  STAR_LIGHT_INTENSITY,
  STAR_PHYSICAL_DISTANCE_METERS,
  STAR_PHYSICAL_POSITION_METERS,
  STAR_PHYSICAL_RADIUS_METERS,
  STAR_SHADOW_RANGE,
  STAR_SPECULAR_COLOR,
  STAR_VISUAL_RADIUS_METERS,
  STAR_VISUAL_DISTANCE_METERS,
  STAR_VISUAL_APERTURE_DEGREES,
  STAR_EMISSIVE_INTENSITY,
} from '../../config/star-options';
import { STARFIELD_NEAR_SPHERE_RADIUS_METERS, STARFIELD_NEAR_SIZE_MAX } from '../../config/sky-options';

const STAR_PROXY_MESH_NAME = 'starwatch:star-proxy';
const STAR_PHYSICAL_MESH_NAME = 'starwatch:star-physical';
const STAR_GLOW_LAYER_NAME = 'starwatch:star-glow';

let cachedGlowLayer: GlowLayer | undefined;
let glowLayerScene: Scene | undefined;
let beforeRenderObserver: Observer<Scene> | undefined;
const sharedCameraPosition = [0, 0, 0] as [number, number, number];
const sharedProxyGlobalPosition = [0, 0, 0] as [number, number, number];
const sharedProxyLocalPosition = [0, 0, 0] as [number, number, number];
const sharedPhysicalLocalPosition = [0, 0, 0] as [number, number, number];
const sharedDirection = new Vector3();
const starWorldDirection = new Vector3(
  STAR_PHYSICAL_POSITION_METERS[0],
  STAR_PHYSICAL_POSITION_METERS[1],
  STAR_PHYSICAL_POSITION_METERS[2],
);
if (starWorldDirection.lengthSquared() === 0) {
  starWorldDirection.set(0, 1, 0);
} else {
  starWorldDirection.normalize();
}
const starLightDirection = starWorldDirection.clone().scale(-1);
let cachedProxyMesh: Mesh | undefined;
let cachedPhysicalMesh: Mesh | undefined;
let isUsingPhysicalMesh = false;

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
  // Atualiza o light principal mantendo o pipeline de sombras existente.
  light.direction.copyFrom(starLightDirection);
  light.intensity = STAR_LIGHT_INTENSITY;
  light.diffuse = Color3.FromArray(STAR_DIFFUSE_COLOR);
  light.specular = Color3.FromArray(STAR_SPECULAR_COLOR);
  light.shadowMinZ = STAR_SHADOW_RANGE[0];
  light.shadowMaxZ = STAR_SHADOW_RANGE[1];

  // Proxy visual sempre acompanha a câmera para representar o disco aparente.
  const existingProxy = scene.getMeshByName(STAR_PROXY_MESH_NAME);
  const proxyMesh = (existingProxy as Mesh | null) ?? createStarMesh(scene, STAR_PROXY_MESH_NAME);
  cachedProxyMesh = proxyMesh;
  const starMaterial = proxyMesh.material as StandardMaterial | null;
  if (starMaterial) {
    const emissive = Color3.FromArray(STAR_DIFFUSE_COLOR).scale(STAR_EMISSIVE_INTENSITY);
    starMaterial.emissiveColor = emissive;
    starMaterial.diffuseColor = emissive.clone();
    starMaterial.specularColor = new Color3(0, 0, 0);
    starMaterial.alpha = 1;
    starMaterial.disableLighting = true;
  }

  proxyMesh.scaling.setAll(STAR_VISUAL_RADIUS_METERS);
  proxyMesh.computeWorldMatrix(true);
  proxyMesh.refreshBoundingInfo();

  ensureGlowLayer(scene, proxyMesh);
  updateStarState(noa, scene, proxyMesh, true);
  attachStarUpdater(scene, noa, proxyMesh);

  const camera = noa.rendering.camera;
  if (camera && typeof camera.maxZ === 'number') {
    ensureCameraFarPlane(
      camera,
      STAR_VISUAL_DISTANCE_METERS + STAR_VISUAL_RADIUS_METERS * 2 + STAR_CAMERA_FAR_PLANE_PADDING,
    );
  }

  if (import.meta.env.DEV && typeof window !== 'undefined') {
    const activeCamera = scene.activeCamera ?? noa.rendering.camera;
    const distanceToCamera = Vector3.Distance(proxyMesh.getAbsolutePosition(), activeCamera.position);
    const boundingRadius = proxyMesh.getBoundingInfo().boundingSphere.radius;
    const debugMesh = proxyMesh as any;
    debugMesh.showBoundingBox = true;
    debugMesh.renderOutline = true;
    debugMesh.outlineWidth = 0.1;
    debugMesh.outlineColor = new Color3(1, 0.9, 0);
    console.log(
      '[starwatch:star]',
      `dir-world=(${starWorldDirection.x.toFixed(3)}, ${starWorldDirection.y.toFixed(3)}, ${starWorldDirection.z.toFixed(
        3,
      )})`,
      `dist-physical=${STAR_PHYSICAL_DISTANCE_METERS.toFixed(0)}`,
      `dist-camera-proxy=${distanceToCamera.toFixed(2)}`,
      `radius=${boundingRadius.toFixed(2)}`,
      `radiusWorld=${proxyMesh.getBoundingInfo().boundingSphere.radiusWorld.toFixed(2)}`,
      `scaling=${proxyMesh.scaling.asArray().map((v) => v.toFixed(2)).join(',')}`,
      `aperture=${STAR_VISUAL_APERTURE_DEGREES}deg`,
      `camera.maxZ=${(activeCamera as any).maxZ ?? 'n/a'}`,
    );
    (window as any).starwatchStar = {
      proxy: proxyMesh,
      physical: cachedPhysicalMesh,
      worldDirection: starWorldDirection.clone(),
      lightDirection: starLightDirection.clone(),
      options: {
        visualDistance: STAR_VISUAL_DISTANCE_METERS,
        radius: STAR_VISUAL_RADIUS_METERS,
        approach: STAR_APPROACH_DISTANCE_METERS,
        physicalDistance: STAR_PHYSICAL_DISTANCE_METERS,
        physicalRadius: STAR_PHYSICAL_RADIUS_METERS,
      },
      updatePreviewPosition(): void {
        updateStarState(noa, scene, proxyMesh, true);
      },
      logSnapshot(): void {
        const cam = scene.activeCamera ?? noa.rendering.camera;
        const camPos = cam.position;
        const absPos = proxyMesh.getAbsolutePosition();
        const bounding = proxyMesh.getBoundingInfo().boundingSphere;
        console.log('[starwatch:star:snapshot]', {
          globalPosition: absPos.asArray(),
          cameraPosition: [camPos.x, camPos.y, camPos.z],
          distanceToCamera: Vector3.Distance(absPos, camPos),
          radius: bounding.radius,
          diameter: bounding.radius * 2,
        });
      },
      getDistanceToCamera(): number {
        const cameraPos = scene.activeCamera?.position ?? proxyMesh.getScene().activeCamera?.position;
        if (!cameraPos) {
          return 0;
        }
        return Vector3.Distance(proxyMesh.getAbsolutePosition(), cameraPos);
      },
    };
  }
}

function ensurePhysicalMesh(scene: Scene): Mesh {
  if (cachedPhysicalMesh && !cachedPhysicalMesh.isDisposed()) {
    return cachedPhysicalMesh;
  }

  cachedPhysicalMesh = createStarMesh(scene, STAR_PHYSICAL_MESH_NAME);
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    const debugStar = (window as any).starwatchStar;
    if (debugStar) {
      debugStar.physical = cachedPhysicalMesh;
    }
  }
  return cachedPhysicalMesh;
}

function ensureCameraFarPlane(camera: any, targetFar: number): void {
  if (typeof camera?.maxZ !== 'number') {
    return;
  }

  if (!Number.isFinite(targetFar)) {
    return;
  }

  if (Math.abs(camera.maxZ - targetFar) > 1) {
    camera.maxZ = targetFar;
  }
}

function createStarMesh(scene: Scene, name: string): Mesh {
  const mesh = MeshBuilder.CreateSphere(
    name,
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

  const material = new StandardMaterial(`${name}-material`, scene);
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

function attachStarUpdater(scene: Scene, noa: Engine, proxyMesh: Mesh): void {
  if (beforeRenderObserver) {
    scene.onBeforeRenderObservable.remove(beforeRenderObserver);
    beforeRenderObserver = undefined;
  }

  beforeRenderObserver = scene.onBeforeRenderObservable.add(() => {
    updateStarState(noa, scene, proxyMesh, false);
  });
}

function updateStarState(
  noa: Engine,
  scene: Scene,
  proxyMesh: Mesh,
  forceSync: boolean,
): void {
  const cameraPosition = noa.camera.getPosition();
  sharedCameraPosition[0] = cameraPosition[0];
  sharedCameraPosition[1] = cameraPosition[1];
  sharedCameraPosition[2] = cameraPosition[2];

  const dirX = STAR_PHYSICAL_POSITION_METERS[0] - sharedCameraPosition[0];
  const dirY = STAR_PHYSICAL_POSITION_METERS[1] - sharedCameraPosition[1];
  const dirZ = STAR_PHYSICAL_POSITION_METERS[2] - sharedCameraPosition[2];
  let distanceToPhysical = Math.sqrt(dirX * dirX + dirY * dirY + dirZ * dirZ);

  if (distanceToPhysical > 0.0001) {
    const inv = 1 / distanceToPhysical;
    sharedDirection.set(dirX * inv, dirY * inv, dirZ * inv);
  } else {
    sharedDirection.copyFrom(starWorldDirection);
    distanceToPhysical = 0;
  }

  sharedProxyGlobalPosition[0] = sharedCameraPosition[0] + sharedDirection.x * STAR_VISUAL_DISTANCE_METERS;
  sharedProxyGlobalPosition[1] = sharedCameraPosition[1] + sharedDirection.y * STAR_VISUAL_DISTANCE_METERS;
  sharedProxyGlobalPosition[2] = sharedCameraPosition[2] + sharedDirection.z * STAR_VISUAL_DISTANCE_METERS;

  if (!proxyMesh.metadata?.noa_added_to_scene) {
    noa.rendering.addMeshToScene(proxyMesh, false, [...sharedProxyGlobalPosition]);
  }

  noa.globalToLocal(sharedProxyGlobalPosition, null, sharedProxyLocalPosition);
  proxyMesh.position.set(sharedProxyLocalPosition[0], sharedProxyLocalPosition[1], sharedProxyLocalPosition[2]);

  const shouldUsePhysical = distanceToPhysical <= STAR_APPROACH_DISTANCE_METERS;
  if (shouldUsePhysical && !isUsingPhysicalMesh) {
    const physicalMesh = ensurePhysicalMesh(scene);
    cachedPhysicalMesh = physicalMesh;
    ensureGlowLayer(scene, physicalMesh);
    physicalMesh.scaling.setAll(STAR_PHYSICAL_RADIUS_METERS);
    if (!physicalMesh.metadata?.noa_added_to_scene) {
      noa.rendering.addMeshToScene(physicalMesh, false, [...STAR_PHYSICAL_POSITION_METERS]);
    }
    isUsingPhysicalMesh = true;
  } else if (!shouldUsePhysical && isUsingPhysicalMesh) {
    if (cachedPhysicalMesh) {
      cachedPhysicalMesh.setEnabled(false);
    }
    isUsingPhysicalMesh = false;
  }

  if (isUsingPhysicalMesh && cachedPhysicalMesh) {
    noa.globalToLocal(STAR_PHYSICAL_POSITION_METERS, null, sharedPhysicalLocalPosition);
    cachedPhysicalMesh.position.set(
      sharedPhysicalLocalPosition[0],
      sharedPhysicalLocalPosition[1],
      sharedPhysicalLocalPosition[2],
    );
    proxyMesh.setEnabled(false);
    cachedPhysicalMesh.setEnabled(true);
  } else {
    proxyMesh.setEnabled(true);
  }

  const camera = noa.rendering.camera;
  if (camera && typeof camera.maxZ === 'number') {
    if (isUsingPhysicalMesh) {
      ensureCameraFarPlane(
        camera,
        distanceToPhysical + STAR_PHYSICAL_RADIUS_METERS + STAR_CAMERA_PHYSICAL_PADDING,
      );
    } else {
      const proxyRange =
        STAR_VISUAL_DISTANCE_METERS + STAR_VISUAL_RADIUS_METERS * 2 + STAR_CAMERA_FAR_PLANE_PADDING;
      const nearFieldRange = STARFIELD_NEAR_SPHERE_RADIUS_METERS + STARFIELD_NEAR_SIZE_MAX * 2;
      ensureCameraFarPlane(camera, Math.max(proxyRange, nearFieldRange));
    }
  }

  if (forceSync) {
    proxyMesh.computeWorldMatrix(true);
    proxyMesh.refreshBoundingInfo();
    if (cachedPhysicalMesh && isUsingPhysicalMesh) {
      cachedPhysicalMesh.computeWorldMatrix(true);
      cachedPhysicalMesh.refreshBoundingInfo();
    }
  }
}
