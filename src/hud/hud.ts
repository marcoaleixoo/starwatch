import { HUD_BLOCK_PREFIX, HUD_POSITION_PREFIX } from './constants';

const energyEl = document.getElementById('status-energy');
const blockEl = document.getElementById('status-heat');

export interface HudController {
  updatePosition(position: [number, number, number]): void;
  updateSelected(label: string): void;
}

export function createHudController(): HudController {
  return {
    updatePosition(position) {
      if (!energyEl) return;
      energyEl.textContent = `${HUD_POSITION_PREFIX} ${position
        .map((value) => value.toFixed(1))
        .join(' ')}`;
    },
    updateSelected(label) {
      if (!blockEl) return;
      blockEl.textContent = `${HUD_BLOCK_PREFIX} ${label}`;
    },
  };
}
