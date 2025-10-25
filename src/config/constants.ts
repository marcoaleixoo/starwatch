import { RENDER_SETTINGS_DEFAULTS } from './render-settings';

export const GRID_UNIT_METERS = 1;
export const PLATFORM_HALF_SIZE = 5; // results in a 10x10 platform
export const PLATFORM_BLOCK_Y = 1;

const {
  chunkHorizontalDistanceKm,
  chunkVerticalDistanceKm,
  chunkRemoveHorizontalMarginKm,
  chunkRemoveVerticalMarginKm,
  chunkProcessingMaxTickMs,
  chunkProcessingMaxRenderMs,
  chunkPendingCreationLimit,
  chunkPendingMeshingLimit,
  chunkMinNeighborsToMesh,
  renderMaxFps,
  sunDistanceKm,
  sunDiameterKm,
} = RENDER_SETTINGS_DEFAULTS;

const ENGINE_CHUNK_SIZE = 32;
const BLOCKS_PER_KM = 1000 / GRID_UNIT_METERS;
const MAX_CHUNK_RADIUS = 256; // NOA becomes unstable beyond this

const kmToChunks = (distanceKm: number): number => {
  if (distanceKm <= 0) {
    return 1;
  }
  const chunkCount = Math.round((distanceKm * BLOCKS_PER_KM) / ENGINE_CHUNK_SIZE);
  return Math.min(MAX_CHUNK_RADIUS, Math.max(1, chunkCount));
};

const kmToChunkMargin = (distanceKm: number): number => {
  if (distanceKm <= 0) {
    return 0;
  }
  const chunkCount = Math.round((distanceKm * BLOCKS_PER_KM) / ENGINE_CHUNK_SIZE);
  return Math.min(MAX_CHUNK_RADIUS, Math.max(1, chunkCount));
};

const chunkHorizontalAddChunks = kmToChunks(chunkHorizontalDistanceKm);
const chunkVerticalAddChunks = kmToChunks(chunkVerticalDistanceKm);
const chunkRemoveHorizontalOffsetChunks = kmToChunkMargin(chunkRemoveHorizontalMarginKm);
const chunkRemoveVerticalOffsetChunks = kmToChunkMargin(chunkRemoveVerticalMarginKm);
export const SUN_DISTANCE_BLOCKS = Math.max(1, Math.round(sunDistanceKm * BLOCKS_PER_KM));
export const SUN_DIAMETER_BLOCKS = Math.max(1, Math.round(sunDiameterKm * BLOCKS_PER_KM));

export const ENGINE_OPTIONS = {
  debug: true,
  showFPS: false,
  chunkSize: ENGINE_CHUNK_SIZE,
  maxRenderRate: renderMaxFps,
  chunkAddDistance: [chunkHorizontalAddChunks, chunkVerticalAddChunks] as [number, number],
  chunkRemoveDistance: [
    Math.min(MAX_CHUNK_RADIUS, chunkHorizontalAddChunks + chunkRemoveHorizontalOffsetChunks),
    Math.min(MAX_CHUNK_RADIUS, chunkVerticalAddChunks + chunkRemoveVerticalOffsetChunks),
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
