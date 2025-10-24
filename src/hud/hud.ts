import { HUD_BLOCK_PREFIX, HUD_POSITION_PREFIX } from './constants';

const positionEl = document.getElementById('status-position');
const selectionEl = document.getElementById('status-selection');

export interface HudController {
  updatePosition(position: [number, number, number]): void;
  updateSelected(label: string): void;
}

export function createHudController(): HudController {
  return {
    updatePosition(position) {
      if (!positionEl) return;
      positionEl.textContent = `${HUD_POSITION_PREFIX} ${position
        .map((value) => value.toFixed(1))
        .join(' ')}`;
    },
    updateSelected(label) {
      if (!selectionEl) return;
      selectionEl.textContent = `${HUD_BLOCK_PREFIX} ${label}`;
    },
  };
}
