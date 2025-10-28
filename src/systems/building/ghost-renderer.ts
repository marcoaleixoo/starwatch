import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import type { Engine } from 'noa-engine';
import type { BlockDefinition } from '../../blocks/types';
import type { GridScaleId } from '../../config/build-options';

export interface GhostRenderOptions {
  definition: BlockDefinition;
  scaleId: GridScaleId;
  size: [number, number, number];
  position: [number, number, number];
  rotationY: number;
  valid: boolean;
}

function makeCacheKey(kind: string, scaleId: GridScaleId): string {
  return `${kind}:${scaleId}`;
}

export class GhostRenderer {
  private materialValid: StandardMaterial;
  private materialInvalid: StandardMaterial;
  private meshes = new Map<string, Mesh>();
  private activeMesh: Mesh | null = null;
  private scene: any;

  constructor(noa: Engine) {
    this.scene = noa.rendering.getScene();
    const scene = this.scene;

    this.materialValid = new StandardMaterial('placement-ghost-valid', scene);
    this.materialValid.diffuseColor = Color3.FromHexString('#4ade80').scale(0.6);
    this.materialValid.alpha = 0.35;
    this.materialValid.emissiveColor = Color3.FromHexString('#22c55e').scale(0.5);
    this.materialValid.disableLighting = true;
    this.materialValid.backFaceCulling = false;

    this.materialInvalid = new StandardMaterial('placement-ghost-invalid', scene);
    this.materialInvalid.diffuseColor = Color3.FromHexString('#f87171').scale(0.7);
    this.materialInvalid.alpha = 0.35;
    this.materialInvalid.emissiveColor = Color3.FromHexString('#dc2626').scale(0.5);
    this.materialInvalid.disableLighting = true;
    this.materialInvalid.backFaceCulling = false;
  }

  dispose(): void {
    for (const mesh of this.meshes.values()) {
      mesh.dispose(false, true);
    }
    this.meshes.clear();
    this.activeMesh = null;
    this.materialValid.dispose(true, true);
    this.materialInvalid.dispose(true, true);
  }

  hide(): void {
    if (!this.activeMesh) {
      return;
    }
    this.activeMesh.isVisible = false;
    this.activeMesh = null;
  }

  render(options: GhostRenderOptions): void {
    const { definition, scaleId, size, position, rotationY, valid } = options;
    const key = makeCacheKey(definition.kind, scaleId);
    let mesh = this.meshes.get(key) ?? null;
    if (!mesh) {
      mesh = MeshBuilder.CreateBox(`ghost-${key}`, { size: 1 }, this.scene);
      mesh.isPickable = false;
      mesh.alwaysSelectAsActiveMesh = true;
      mesh.rotationQuaternion = null;
      mesh.isVisible = false;
      mesh.renderingGroupId = 2;
      this.meshes.set(key, mesh);
    }

    if (this.activeMesh && this.activeMesh !== mesh) {
      this.activeMesh.isVisible = false;
    }
    this.activeMesh = mesh;

    mesh.material = valid ? this.materialValid : this.materialInvalid;
    mesh.scaling.x = size[0];
    mesh.scaling.y = size[1];
    mesh.scaling.z = size[2];
    mesh.position.x = position[0];
    mesh.position.y = position[1];
    mesh.position.z = position[2];
    mesh.rotation.y = rotationY;
    mesh.visibility = valid ? 0.7 : 0.45;
    mesh.isVisible = true;
  }
}
