import { Engine } from 'noa-engine';
import { CreateBox } from '@babylonjs/core/Meshes/Builders/boxBuilder';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import '@babylonjs/core/Materials/standardMaterial';

export function initializePlayer(noa: Engine) {
  const playerEntity = noa.playerEntity;
  const positionData = noa.entities.getPositionData(playerEntity);
  const scene = noa.rendering.getScene();

  const playerMesh = CreateBox('player-box', { size: 1 }, scene);
  playerMesh.scaling = new Vector3(positionData.width, positionData.height, positionData.width);
  playerMesh.material = noa.rendering.makeStandardMaterial();

  noa.entities.addComponent(playerEntity, noa.entities.names.mesh, {
    mesh: playerMesh,
    offset: [0, positionData.height / 2, 0],
  });
}
