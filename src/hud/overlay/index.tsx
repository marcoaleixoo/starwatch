import { createRoot, type Root } from 'react-dom/client';
import type { Engine } from 'noa-engine';
import { OverlayController } from './overlay-controller';
import { OverlayApp } from './OverlayApp';
import type { HotbarController } from '../../player/hotbar-controller';
import type { EnergySystem } from '../../systems/energy';
import { RemovalHoldTracker } from '../removal-hold-tracker';

export interface OverlayApi {
  controller: OverlayController;
  removalHold: RemovalHoldTracker;
  destroy(): void;
}

export interface OverlayDependencies {
  hotbarController: HotbarController;
  energy: EnergySystem;
}

export function initializeOverlay(noa: Engine, deps: OverlayDependencies): OverlayApi {
  const mountNode = document.getElementById('starwatch-overlay-root');
  if (!mountNode) {
    throw new Error('Host DOM node #starwatch-overlay-root não encontrado.');
  }

  const controller = new OverlayController();
  const root: Root = createRoot(mountNode);
  const removalHold = new RemovalHoldTracker();

  controller.registerCaptureHandler((capture) => {
    const canvas = noa.container.canvas;
    if (capture) {
      noa.container.setPointerLock(false);
      if (typeof canvas.blur === 'function') {
        canvas.blur();
      }
    } else {
      noa.container.setPointerLock(true);
      if (typeof canvas.focus === 'function') {
        canvas.focus();
      }
    }
  });

  root.render(
    <OverlayApp
      controller={controller}
      hotbarController={deps.hotbarController}
      energy={deps.energy}
      removalHold={removalHold}
    />,
  );

  const api: OverlayApi = {
    controller,
    removalHold,
    destroy() {
      controller.reset();
      root.unmount();
    },
  };

  return api;
}
