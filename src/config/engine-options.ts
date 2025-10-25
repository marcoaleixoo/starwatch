import type { Engine } from 'noa-engine';

export type EngineOptions = ConstructorParameters<typeof Engine>[0];

export const ENGINE_OPTIONS: EngineOptions = {
  inverseY: false,
  chunkSize: 32,
  chunkAddDistance: [2.5, 2],
  playerStart: [0.5, 2.5, 0.5],
  playerAutoStep: true,
  playerShadowComponent: false,
  originRebaseDistance: 32,
  stickyPointerLock: true,
  dragCameraOutsidePointerLock: false,
  maxRenderRate: 0,
  blockTestDistance: 16,
};
