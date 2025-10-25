import type { Engine } from 'noa-engine';
import { CAMERA_ZOOM_LIMITS, PLAYER_MOVEMENT } from '../config/player-options';

export function initializePlayer(noa: Engine): void {
  const movement = noa.entities.getMovement(noa.playerEntity);
  movement.maxSpeed = PLAYER_MOVEMENT.maxSpeed;
  movement.moveForce = PLAYER_MOVEMENT.moveForce;

  noa.inputs.bind('pause', 'KeyP');
  let paused = false;
  noa.inputs.down.on('pause', () => {
    paused = !paused;
    noa.setPaused(paused);
    console.log('[starwatch] jogo %s', paused ? 'pausado' : 'retomado');
  });

  noa.on('tick', () => {
    const scroll = noa.inputs.pointerState.scrolly;
    if (scroll !== 0) {
      noa.camera.zoomDistance += scroll > 0 ? CAMERA_ZOOM_LIMITS.step : -CAMERA_ZOOM_LIMITS.step;
      noa.camera.zoomDistance = Math.min(Math.max(noa.camera.zoomDistance, CAMERA_ZOOM_LIMITS.min), CAMERA_ZOOM_LIMITS.max);
    }
  });
}
