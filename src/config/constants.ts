import { RENDER_SETTINGS_DEFAULTS } from './render-settings';

export const GRID_UNIT_METERS = 0.3;
export const PLATFORM_HALF_SIZE = 5; // results in a 10x10 platform
export const PLATFORM_BLOCK_Y = 1;

const {
  chunkHorizontalAddChunks,
  chunkVerticalAddChunks,
  chunkRemoveHorizontalOffsetChunks,
  chunkRemoveVerticalOffsetChunks,
  chunkProcessingMaxTickMs,
  chunkProcessingMaxRenderMs,
  chunkPendingCreationLimit,
  chunkPendingMeshingLimit,
  chunkMinNeighborsToMesh,
  renderMaxFps,
} = RENDER_SETTINGS_DEFAULTS;

export const ENGINE_OPTIONS = {
  debug: true,
  showFPS: false,
  chunkSize: 32,
  maxRenderRate: renderMaxFps,
  chunkAddDistance: [chunkHorizontalAddChunks, chunkVerticalAddChunks] as [number, number],
  chunkRemoveDistance: [
    chunkHorizontalAddChunks + chunkRemoveHorizontalOffsetChunks,
    chunkVerticalAddChunks + chunkRemoveVerticalOffsetChunks,
  ] as [number, number],
  maxProcessingPerTick: chunkProcessingMaxTickMs,
  maxProcessingPerRender: chunkProcessingMaxRenderMs,
  maxChunksPendingCreation: chunkPendingCreationLimit,
  maxChunksPendingMeshing: chunkPendingMeshingLimit,
  minNeighborsToMesh: chunkMinNeighborsToMesh,
  worldGenWhilePaused: true,
  playerStart: [0, 6, 0] as [number, number, number],
  clearColor: [0, 0, 0, 1] as [number, number, number, number],
};

export const DEFAULT_BLOCK_SELECTION_INDEX = 0;
