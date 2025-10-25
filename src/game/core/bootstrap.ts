import { Engine } from 'noa-engine';
import { buildWorld } from '../world/build-world';
import { configurePlayer } from '../player/configure-player';

export interface StarwatchContext {
  noa: Engine;
}

export function bootstrapStarwatch(): StarwatchContext {
  const mountElement = document.getElementById('starwatch-canvas-host');
  if (!mountElement) {
    throw new Error('Host DOM node #starwatch-canvas-host não encontrado.');
  }

  const noa = new Engine({
    debug: import.meta.env.DEV,
    showFPS: import.meta.env.DEV,
    inverseY: false,
    chunkSize: 32,
    chunkAddDistance: [2.5, 2],
    playerStart: [0.5, 2.5, 0.5],
    playerAutoStep: true,
    playerShadowComponent: false,
    originRebaseDistance: 32,
    domElement: mountElement,
    stickyPointerLock: true,
    dragCameraOutsidePointerLock: false,
    maxRenderRate: 0,
    blockTestDistance: 16,
  });

  buildWorld(noa);
  configurePlayer(noa);

  noa.container.setPointerLock(true);
  noa.container.on('DOMready', () => {
    document.getElementById('boot-status')?.setAttribute('hidden', 'true');
    console.log('[starwatch] DOM pronto, pointer lock disponível?', noa.container.supportsPointerLock);
  });

  console.log(`[starwatch] noa-engine inicializada v${noa.version}`);

  return { noa };
}
