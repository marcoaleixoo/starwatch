import type { Engine } from 'noa-engine';

export function configurePlayer(noa: Engine): void {
  const movement = noa.entities.getMovement(noa.playerEntity);
  movement.maxSpeed = 8;
  movement.moveForce = 35;

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
      noa.camera.zoomDistance += scroll > 0 ? 0.5 : -0.5;
      noa.camera.zoomDistance = Math.min(Math.max(noa.camera.zoomDistance, 0), 10);
    }
  });
}
