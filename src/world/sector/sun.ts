import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { PointLight } from '@babylonjs/core/Lights/pointLight';
import { GlowLayer } from '@babylonjs/core/Layers/glowLayer';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import type { Scene } from '@babylonjs/core/scene';
import type { Engine } from 'noa-engine';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { GRID_UNIT_METERS } from '../../config/constants';

const BLOCKS_PER_KM = 1000 / GRID_UNIT_METERS;

export const SUN_BASE_DIAMETER = 4;
export const DEFAULT_SUN_DISTANCE_BLOCKS = Math.round(1000 * BLOCKS_PER_KM); // ≈1 000 km
export const DEFAULT_SUN_DIAMETER_BLOCKS = Math.round(90 * BLOCKS_PER_KM); // ≈90 km
const SUN_GLOW_INTENSITY = 1.6;
const SUN_LIGHT_INTENSITY = 1.2;
const SUN_LIGHT_RANGE = 90;
const MIN_DIAMETER = 0.5;
const MIN_DISTANCE = 1;
const MAX_GLOW_SCALE = 4;

export class SunEntity {
  private readonly noa: Engine;

  private readonly mesh: Mesh;

  private readonly glow: GlowLayer;

  private readonly light: PointLight;

  private pulseTime = 0;

  private readonly direction: Vector3;

  private currentDistance: number;

  private currentDiameter: number;

  private readonly baseGlowIntensity = SUN_GLOW_INTENSITY;

  private readonly baseLightRange = SUN_LIGHT_RANGE;

  private readonly baseLightIntensity = SUN_LIGHT_INTENSITY;

  private readonly globalPosition: Vector3;

  constructor(noa: Engine, scene: Scene, position: Vector3) {
    this.noa = noa;
    this.mesh = MeshBuilder.CreateSphere('sector-sun', { diameter: SUN_BASE_DIAMETER, segments: 24 }, scene);
    this.mesh.position = position.clone();
    this.mesh.billboardMode = Mesh.BILLBOARDMODE_ALL;
    this.mesh.alwaysSelectAsActiveMesh = true;
    this.mesh.isPickable = false;
    this.mesh.applyFog = false;
    this.mesh.renderingGroupId = 1;
    this.mesh.isVisible = true;
    this.mesh.alwaysSelectAsActiveMesh = true;
    this.mesh.doNotSyncBoundingInfo = false;
    noa.rendering.addMeshToScene(this.mesh, false);

    const material = new StandardMaterial('sector-sun-material', scene);
    material.disableLighting = true;
    material.emissiveColor = new Color3(1.0, 0.2, 0.9);
    material.alpha = 0.9;
    material.specularColor = Color3.Black();
    this.mesh.material = material;
    this.mesh.refreshBoundingInfo();

    this.light = new PointLight('sector-solar-light', position.clone(), scene);
    this.light.intensity = SUN_LIGHT_INTENSITY;
    this.light.range = SUN_LIGHT_RANGE;
    this.light.diffuse = new Color3(1.0, 0.4, 0.8);
    this.light.specular = new Color3(1.0, 0.4, 0.8);

    this.glow = new GlowLayer('sector-sun-glow', scene, {
      blurKernelSize: 64,
    });
    this.glow.intensity = SUN_GLOW_INTENSITY;
    this.glow.addIncludedOnlyMesh(this.mesh);

    const initialDirection = position.clone();
    if (initialDirection.length() < 0.001) {
      initialDirection.set(0, 1, 0);
    }
    initialDirection.normalize();
    this.direction = initialDirection;
    this.currentDistance = position.length();
    if (this.currentDistance < MIN_DISTANCE) {
      this.currentDistance = MIN_DISTANCE;
    }

    this.currentDiameter = SUN_BASE_DIAMETER;
    this.globalPosition = position.clone();
    const initialDistance = position.length() < MIN_DISTANCE ? DEFAULT_SUN_DISTANCE_BLOCKS : position.length();
    this.setDistance(initialDistance);
    this.setDiameter(DEFAULT_SUN_DIAMETER_BLOCKS);

    console.log('[Sector] SunEntity initialized at', position.toString());
  }

  update(dt: number) {
    const dtSeconds = dt > 5 ? dt / 1000 : dt;
    this.pulseTime += dtSeconds;
    const pulse = 0.9 + 0.1 * Math.sin(this.pulseTime * 1.1);
    const material = this.mesh.material as StandardMaterial;
    material.emissiveColor = new Color3(1.0 * pulse, 0.4 * pulse, 0.85 * pulse);
    this.glow.intensity = Math.min(this.baseGlowIntensity * this.getSizeScale() * pulse, this.baseGlowIntensity * MAX_GLOW_SCALE);
  }

  getPosition(): Vector3 {
    return this.mesh.position.clone();
  }

  getDistance(): number {
    return this.currentDistance;
  }

  setDistance(distance: number) {
    const clamped = Math.max(distance, MIN_DISTANCE);
    this.currentDistance = clamped;
    this.direction.scaleToRef(clamped, this.globalPosition);
    this.applyTransforms();
    this.mesh.refreshBoundingInfo();
  }

  getDiameter(): number {
    return this.currentDiameter;
  }

  setDiameter(diameter: number) {
    const clamped = Math.max(diameter, MIN_DIAMETER);
    this.currentDiameter = clamped;
    const scale = clamped / SUN_BASE_DIAMETER;
    this.mesh.scaling.setAll(scale);
    const rangeScale = Math.max(scale, 0.2);
    const intensityScale = Math.min(Math.max(scale, 0.2), 50);
    this.light.range = Math.min(this.baseLightRange * rangeScale, this.baseLightRange * 100000);
    this.light.intensity = this.baseLightIntensity * intensityScale;
    this.mesh.refreshBoundingInfo();
  }

  private getSizeScale(): number {
    return this.currentDiameter / SUN_BASE_DIAMETER;
  }

  private applyTransforms() {
    const globalArray = this.globalPosition.asArray();
    const localPosition = this.noa.globalToLocal(globalArray, null, []);
    const [lx, ly, lz] = localPosition as [number, number, number];
    this.mesh.position.set(lx, ly, lz);
    this.light.position.set(lx, ly, lz);
  }
}
