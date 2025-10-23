import { CROSSHAIR_STATE_IDLE, CROSSHAIR_STATE_TARGET } from './constants';

const crosshairEl = document.querySelector<HTMLDivElement>('.crosshair');

export interface CrosshairController {
  setState(state: 'target' | 'idle'): void;
}

export function createCrosshairController(): CrosshairController {
  return {
    setState(state) {
      if (!crosshairEl) return;
      const value = state === 'target' ? CROSSHAIR_STATE_TARGET : CROSSHAIR_STATE_IDLE;
      crosshairEl.dataset.state = value;
    },
  };
}
