import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import type { Engine } from 'noa-engine';

const DECK_MICRO_LAYER_NAME = 'starwatch:deck-micro-layer-material';
const MATERIAL_COLOR = new Color3(0.32, 0.58, 0.96);

let cachedMaterial: StandardMaterial | null = null;

function ensureMaterial(noa: Engine): StandardMaterial {
  if (cachedMaterial) {
    return cachedMaterial;
  }
  const scene = noa.rendering.getScene();
  const material = new StandardMaterial(DECK_MICRO_LAYER_NAME, scene);
  material.diffuseColor = MATERIAL_COLOR;
  material.emissiveColor = MATERIAL_COLOR.scale(0.65);
  material.specularColor = MATERIAL_COLOR.scale(0.4);
  material.alpha = 1;
  material.backFaceCulling = false;
  material.freeze();
  cachedMaterial = material;
  return material;
}

export function getDeckMicroMesh(noa: Engine): Mesh {
  const scene = noa.rendering.getScene();
  const template = MeshBuilder.CreatePlane('deck-micro-template', { size: 1 }, scene);
  template.rotation.x = Math.PI / 2;
  template.position.y = 0.56;
  template.isPickable = false;
  template.alwaysSelectAsActiveMesh = true;
  template.rotationQuaternion = null;
  template.renderingGroupId = 2;
  template.material = ensureMaterial(noa);
  noa.rendering.addMeshToScene(template, false);
  return template;
}
