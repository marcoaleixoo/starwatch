import type { Engine } from 'noa-engine';
import { CHUNK_ADD_DISTANCE, CHUNK_SIZE } from './render-options';
import { PLAYER_SPAWN_POSITION } from './world-options';

export type EngineOptions = ConstructorParameters<typeof Engine>[0];

export const ENGINE_OPTIONS: EngineOptions = {
  inverseY: false,
  chunkSize: CHUNK_SIZE,
  chunkAddDistance: CHUNK_ADD_DISTANCE,
  playerStart: PLAYER_SPAWN_POSITION,
  playerAutoStep: true,
  playerShadowComponent: false,
  originRebaseDistance: 32,
  stickyPointerLock: true,
  dragCameraOutsidePointerLock: false,
  maxRenderRate: 0,
  blockTestDistance: 16,
};
