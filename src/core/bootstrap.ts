import { Engine } from 'noa-engine';
import { initializeWorld, type WorldResources } from '../world';
import { initializePlayer } from '../player';
import { ENGINE_OPTIONS } from '../config/engine-options';
import { initializeOverlay, type OverlayApi } from '../hud/overlay';
import { initializeHotbar, type HotbarApi } from '../player/hotbar';
import { initializePlacementSystem } from '../systems/building/placement-system';
import { initializeEnergySystem, type EnergySystem } from '../systems/energy';
import { initializeUseSystem } from '../systems/interactions/use-system';
import { EnergyDebugOverlay } from '../systems/energy/debug-overlay';

export interface StarwatchContext {
  noa: Engine;
  world: WorldResources;
  energy: EnergySystem;
  overlay: OverlayApi;
  hotbar: HotbarApi;
  debug?: {
    energyOverlay?: EnergyDebugOverlay;
  };
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

  const world = initializeWorld(noa);
  const energy = initializeEnergySystem(noa, world);

  const hotbar = initializeHotbar();
  const overlay = initializeOverlay(noa, { hotbarController: hotbar.controller, world, energy });
  hotbar.attachOverlay(overlay);

  initializePlayer(noa, { hotbar, overlay });
  initializePlacementSystem({ noa, overlay, hotbar, world, energy });
  initializeUseSystem({ noa, overlay, world });

  let energyDebug: EnergyDebugOverlay | undefined;
  if (import.meta.env.VITE_DEBUG_ENERGY === '1') {
    energyDebug = new EnergyDebugOverlay(energy);
    energyDebug.setVisible(true);
    noa.on('tick', (dt: number) => {
      energyDebug?.handleTick(dt);
    });
  }

  noa.container.setPointerLock(true);
  noa.container.on('DOMready', () => {
    document.getElementById('boot-status')?.setAttribute('hidden', 'true');
    console.log('[starwatch] DOM pronto, pointer lock disponível?', noa.container.supportsPointerLock);
  });

  console.log(`[starwatch] noa-engine inicializada v${noa.version}`);

  return {
    noa,
    world,
    energy,
    overlay,
    hotbar,
    debug: {
      energyOverlay: energyDebug,
    },
  };
}
