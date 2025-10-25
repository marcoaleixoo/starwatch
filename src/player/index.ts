import type { Engine } from 'noa-engine';
import { PLAYER_MOVEMENT } from '../config/player-options';
import type { HotbarApi } from './hotbar';
import type { OverlayApi } from '../hud/overlay';

interface PlayerDependencies {
  hotbar: HotbarApi;
  overlay: OverlayApi;
}

export function initializePlayer(noa: Engine, { hotbar, overlay }: PlayerDependencies): void {
  const movement = noa.entities.getMovement(noa.playerEntity);
  movement.maxSpeed = PLAYER_MOVEMENT.maxSpeed;
  movement.moveForce = PLAYER_MOVEMENT.moveForce;

  noa.inputs.bind('pause', 'KeyP');
  let paused = false;
  noa.inputs.down.on('pause', () => {
    if (overlay.controller.getState().captureInput) {
      return;
    }
    paused = !paused;
    noa.setPaused(paused);
    console.log('[starwatch] jogo %s', paused ? 'pausado' : 'retomado');
  });

  if (import.meta.env.DEV) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).starwatchHotbar = hotbar.controller;
  }
}
