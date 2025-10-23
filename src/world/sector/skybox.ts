import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import type { Scene } from '@babylonjs/core/scene';
import type { Engine } from 'noa-engine';
import { SeededRandom } from '../../utils/seeded-random';

const SKYBOX_SIZE = 4000;
const STAR_CANVAS_SIZE = 1024;
const STAR_COUNT = 560;

const STAR_PALETTES: Array<{
  core: [number, number, number];
  mid: [number, number, number];
}> = [
  { core: [255, 244, 224], mid: [255, 196, 120] },
  { core: [230, 242, 255], mid: [130, 170, 255] },
  { core: [255, 255, 255], mid: [200, 220, 255] },
];

function colorToString([r, g, b]: [number, number, number], alpha: number): string {
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function drawStarField(texture: DynamicTexture, seed: string) {
  const ctx = texture.getContext();
  if (!ctx) {
    return;
  }

  const random = new SeededRandom(`${seed}-skybox`);

  ctx.fillStyle = '#02030a';
  ctx.fillRect(0, 0, STAR_CANVAS_SIZE, STAR_CANVAS_SIZE);

  for (let i = 0; i < STAR_COUNT; i += 1) {
    const radius = random.nextFloat(0.8, 2.2);
    const x = random.nextFloat(0, STAR_CANVAS_SIZE);
    const y = random.nextFloat(0, STAR_CANVAS_SIZE);
    const palette = STAR_PALETTES[random.nextInt(0, STAR_PALETTES.length)];
    const brightness = random.nextFloat(0.75, 1.0);

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, colorToString(palette.core, 0.9 * brightness));
    gradient.addColorStop(0.35, colorToString(palette.mid, 0.35 * brightness));
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);

    if (random.next() > 0.86) {
      // occasional bright pixel in the center
      ctx.fillStyle = colorToString(palette.core, 0.6 + 0.4 * brightness);
      ctx.fillRect(x - 0.5, y - 0.5, 1, 1);
    }
  }

  texture.update(false);
}

export class SectorSkybox {
  private readonly material: StandardMaterial;

  private readonly texture: DynamicTexture;

  private twinkleTime = 0;

  constructor(noa: Engine, scene: Scene, sectorSeed: string) {
    scene.clearColor = Color4.FromHexString('#000000ff');
    const mesh = MeshBuilder.CreateBox('sector-skybox', { size: SKYBOX_SIZE }, scene);
    mesh.isPickable = false;
    mesh.isVisible = true;
    mesh.infiniteDistance = true;
    mesh.material = this.createMaterial(scene, sectorSeed);
    mesh.applyFog = false;
    mesh.alwaysSelectAsActiveMesh = true;
    mesh.renderingGroupId = 0;
    noa.rendering.addMeshToScene(mesh, false);

    this.material = mesh.material as StandardMaterial;
    this.texture = this.material.emissiveTexture as DynamicTexture;
  }

  update(dt: number) {
    const dtSeconds = dt > 5 ? dt / 1000 : dt;
    this.twinkleTime += dtSeconds;
    const twinkle = 0.92 + 0.08 * Math.sin(this.twinkleTime * 0.7);
    this.material.emissiveColor = new Color3(0.05 * twinkle, 0.06 * twinkle, 0.09 * twinkle);
    this.texture.level = 0.85 + 0.15 * Math.sin((this.twinkleTime + 1.3) * 0.45);
  }

  private createMaterial(scene: Scene, sectorSeed: string) {
    const material = new StandardMaterial('sector-skybox-material', scene);
    material.backFaceCulling = false;
    material.disableLighting = true;
    material.specularColor = Color3.Black();
    material.diffuseColor = Color3.Black();

    const texture = new DynamicTexture(
      'sector-skybox-stars',
      {
        width: STAR_CANVAS_SIZE,
        height: STAR_CANVAS_SIZE,
      },
      scene,
      false,
    );
    drawStarField(texture, sectorSeed);

    material.emissiveTexture = texture;
    material.emissiveColor = new Color3(0.06, 0.07, 0.1);
    return material;
  }
}
