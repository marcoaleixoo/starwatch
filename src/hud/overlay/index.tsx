import { createRoot, type Root } from 'react-dom/client';
import type { Engine } from 'noa-engine';
import { OverlayController } from './overlay-controller';
import { OverlayApp } from './OverlayApp';
import type { HotbarController } from '../../player/hotbar-controller';

export interface OverlayApi {
  controller: OverlayController;
  destroy(): void;
}

export interface OverlayDependencies {
  hotbarController: HotbarController;
}

export function initializeOverlay(noa: Engine, deps: OverlayDependencies): OverlayApi {
  const mountNode = document.getElementById('starwatch-overlay-root');
  if (!mountNode) {
    throw new Error('Host DOM node #starwatch-overlay-root não encontrado.');
  }

  const controller = new OverlayController();
  const root: Root = createRoot(mountNode);

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

  root.render(<OverlayApp controller={controller} hotbarController={deps.hotbarController} />);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.code === 'KeyT' && event.altKey) {
      event.preventDefault();
      controller.toggleModal('dummy');
    }
  };

  window.addEventListener('keydown', handleKeyDown, { capture: true });

  const api: OverlayApi = {
    controller,
    destroy() {
      window.removeEventListener('keydown', handleKeyDown, true);
      controller.reset();
      root.unmount();
    },
  };

  return api;
}
