import { Engine } from 'noa-engine';
import { initializeWorld } from '../world';
import { initializePlayer } from '../player';
import { ENGINE_OPTIONS } from '../config/engine-options';

export interface StarwatchContext {
  noa: Engine;
}

export function bootstrapStarwatch(): StarwatchContext {
  const mountElement = document.getElementById('starwatch-canvas-host');
  if (!mountElement) {
    throw new Error('Host DOM node #starwatch-canvas-host não encontrado.');
  }

  const noa = new Engine({
    ...ENGINE_OPTIONS,
    domElement: mountElement,
    debug: import.meta.env.DEV,
    showFPS: import.meta.env.DEV,
  });

  initializeWorld(noa);
  initializePlayer(noa);

  noa.container.setPointerLock(true);
  noa.container.on('DOMready', () => {
    document.getElementById('boot-status')?.setAttribute('hidden', 'true');
    console.log('[starwatch] DOM pronto, pointer lock disponível?', noa.container.supportsPointerLock);
  });

  console.log(`[starwatch] noa-engine inicializada v${noa.version}`);

  return { noa };
}
