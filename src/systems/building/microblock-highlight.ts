import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import type { Engine } from 'noa-engine';

export interface MicroHighlightDescriptor {
  position: [number, number, number];
  size: [number, number, number];
}

export class MicroblockHighlight {
  private mesh: Mesh;
  private material: StandardMaterial;
  private visible = false;

  constructor(noa: Engine) {
    const scene = noa.rendering.getScene();
    this.material = new StandardMaterial('microblock-highlight-material', scene);
    this.material.diffuseColor = Color3.FromHexString('#fef08a').scale(0.7);
    this.material.emissiveColor = Color3.FromHexString('#facc15').scale(0.35);
    this.material.alpha = 0.45;
    this.material.disableLighting = true;
    this.material.backFaceCulling = false;

    this.mesh = MeshBuilder.CreateBox('microblock-highlight', { size: 1 }, scene);
    this.mesh.material = this.material;
    this.mesh.isPickable = false;
    this.mesh.alwaysSelectAsActiveMesh = true;
    this.mesh.rotationQuaternion = null;
    this.mesh.renderingGroupId = 2;
    this.mesh.isVisible = false;
    noa.rendering.addMeshToScene(this.mesh, false);
  }

  show(descriptor: MicroHighlightDescriptor): void {
    this.mesh.scaling.x = descriptor.size[0];
    this.mesh.scaling.y = descriptor.size[1];
    this.mesh.scaling.z = descriptor.size[2];
    this.mesh.position.x = descriptor.position[0];
    this.mesh.position.y = descriptor.position[1];
    this.mesh.position.z = descriptor.position[2];
    this.mesh.isVisible = true;
    this.visible = true;
  }

  hide(): void {
    if (!this.visible) {
      return;
    }
    this.mesh.isVisible = false;
    this.visible = false;
  }
}
