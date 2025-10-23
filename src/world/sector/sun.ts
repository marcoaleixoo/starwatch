import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { PointLight } from '@babylonjs/core/Lights/pointLight';
import { GlowLayer } from '@babylonjs/core/Layers/glowLayer';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import type { Scene } from '@babylonjs/core/scene';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture';

const SUN_DIAMETER = 72;
const SUN_GLOW_INTENSITY = 2.2;
const SUN_LIGHT_INTENSITY = 3.6;
const SUN_LIGHT_RANGE = 2_400;
const SUN_TEXTURE_SIZE = 512;

function createSunTexture(scene: Scene) {
  const texture = new DynamicTexture(
    'sector-sun-texture',
    {
      width: SUN_TEXTURE_SIZE,
      height: SUN_TEXTURE_SIZE,
    },
    scene,
    false,
  );
  const ctx = texture.getContext();
  if (!ctx) {
    return texture;
  }
  const center = SUN_TEXTURE_SIZE / 2;
  const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);
  gradient.addColorStop(0, 'rgba(255, 255, 245, 1)');
  gradient.addColorStop(0.35, 'rgba(255, 220, 120, 0.85)');
  gradient.addColorStop(0.65, 'rgba(255, 160, 60, 0.35)');
  gradient.addColorStop(1, 'rgba(255, 130, 40, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, SUN_TEXTURE_SIZE, SUN_TEXTURE_SIZE);
  texture.hasAlpha = true;
  texture.update(false);
  return texture;
}

export class SunEntity {
  private readonly mesh: Mesh;

  private readonly glow: GlowLayer;

  private readonly light: PointLight;

  private pulseTime = 0;

  constructor(scene: Scene, position: Vector3) {
    this.mesh = MeshBuilder.CreateSphere('sector-sun', { diameter: SUN_DIAMETER, segments: 64 }, scene);
    this.mesh.position = position.clone();
    this.mesh.billboardMode = Mesh.BILLBOARDMODE_ALL;
    this.mesh.alwaysSelectAsActiveMesh = true;
    this.mesh.isPickable = false;
    this.mesh.applyFog = false;
    this.mesh.renderingGroupId = 1;

    const material = new StandardMaterial('sector-sun-material', scene);
    material.disableLighting = true;
    material.emissiveColor = new Color3(1.0, 0.9, 0.75);
    material.emissiveTexture = createSunTexture(scene);
    material.alpha = 0.9;
    material.specularColor = Color3.Black();
    this.mesh.material = material;

    this.light = new PointLight('sector-solar-light', position.clone(), scene);
    this.light.intensity = SUN_LIGHT_INTENSITY;
    this.light.range = SUN_LIGHT_RANGE;
    this.light.diffuse = new Color3(1.0, 0.9, 0.8);
    this.light.specular = new Color3(1.0, 0.95, 0.85);

    this.glow = new GlowLayer('sector-sun-glow', scene, {
      blurKernelSize: 64,
    });
    this.glow.intensity = SUN_GLOW_INTENSITY;
    this.glow.addIncludedOnlyMesh(this.mesh);
  }

  update(dt: number) {
    const dtSeconds = dt > 5 ? dt / 1000 : dt;
    this.pulseTime += dtSeconds;
    const pulse = 0.92 + 0.08 * Math.sin(this.pulseTime * 0.8);
    const material = this.mesh.material as StandardMaterial;
    material.emissiveColor = new Color3(1.0 * pulse, 0.9 * pulse, 0.7 * pulse);
    this.glow.intensity = SUN_GLOW_INTENSITY * pulse;
  }

  getPosition(): Vector3 {
    return this.mesh.position.clone();
  }
}
