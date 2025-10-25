import type { OverlayApi } from '../hud/overlay';
import { HotbarController } from './hotbar-controller';

export interface HotbarApi {
  controller: HotbarController;
  attachOverlay(overlay: OverlayApi): void;
  destroy(): void;
}

export function initializeHotbar(initialOverlay?: OverlayApi): HotbarApi {
  const controller = new HotbarController();
  let overlayRef: OverlayApi | null = initialOverlay ?? null;

  const isOverlayCapturing = (): boolean => {
    if (!overlayRef) {
      return false;
    }
    return overlayRef.controller.getState().captureInput;
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (isOverlayCapturing()) {
      return;
    }

    if (event.code.startsWith('Digit')) {
      const digit = Number.parseInt(event.code.replace('Digit', ''), 10);
      if (Number.isFinite(digit) && digit >= 1 && digit <= 9) {
        controller.setActiveIndex(digit - 1);
        event.preventDefault();
      }
      return;
    }

    if (event.code.startsWith('Numpad')) {
      const digit = Number.parseInt(event.code.replace('Numpad', ''), 10);
      if (Number.isFinite(digit) && digit >= 1 && digit <= 9) {
        controller.setActiveIndex(digit - 1);
        event.preventDefault();
      }
    }
  };

  const handleWheel = (event: WheelEvent) => {
    if (isOverlayCapturing()) {
      return;
    }

    if (event.deltaY === 0) {
      return;
    }

    controller.stepActiveIndex(event.deltaY > 0 ? 1 : -1);
    event.preventDefault();
  };

  window.addEventListener('keydown', handleKeyDown, { passive: false, capture: true });
  window.addEventListener('wheel', handleWheel, { passive: false, capture: true });

  const destroy = () => {
    window.removeEventListener('keydown', handleKeyDown, true);
    window.removeEventListener('wheel', handleWheel, true);
    controller.reset();
    overlayRef = null;
  };

  return {
    controller,
    attachOverlay(overlay) {
      overlayRef = overlay;
    },
    destroy,
  };
}
