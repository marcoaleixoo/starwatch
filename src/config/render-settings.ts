export interface RenderSettingsState {
  chunkHorizontalAddChunks: number;
  chunkVerticalAddChunks: number;
  chunkRemoveHorizontalOffsetChunks: number;
  chunkRemoveVerticalOffsetChunks: number;
  asteroidVoxelLodChunks: number;
  asteroidMeshLodChunks: number;
  asteroidSearchMarginChunks: number;
  chunkProcessingMaxTickMs: number;
  chunkProcessingMaxRenderMs: number;
  chunkPendingCreationLimit: number;
  chunkPendingMeshingLimit: number;
  chunkMinNeighborsToMesh: number;
  renderMaxFps: number;
}

export interface RenderSettingBounds {
  min: number;
  max: number;
  step: number;
}

export const RENDER_SETTINGS_STORAGE_KEY = 'starwatch.settings.render-state.v1';

export const RENDER_SETTINGS_DEFAULTS: RenderSettingsState = {
  chunkHorizontalAddChunks: 20,
  chunkVerticalAddChunks: 16,
  chunkRemoveHorizontalOffsetChunks: 2,
  chunkRemoveVerticalOffsetChunks: 2,
  asteroidVoxelLodChunks: 20,
  asteroidMeshLodChunks: 28,
  asteroidSearchMarginChunks: 128,
  chunkProcessingMaxTickMs: 18,
  chunkProcessingMaxRenderMs: 8,
  chunkPendingCreationLimit: 160,
  chunkPendingMeshingLimit: 160,
  chunkMinNeighborsToMesh: 1,
  renderMaxFps: 1000,
};

export const RENDER_SETTINGS_BOUNDS: Record<keyof RenderSettingsState, RenderSettingBounds> = {
  chunkHorizontalAddChunks: { min: 1, max: 96, step: 1 },
  chunkVerticalAddChunks: { min: 1, max: 96, step: 1 },
  chunkRemoveHorizontalOffsetChunks: { min: 0, max: 12, step: 0.5 },
  chunkRemoveVerticalOffsetChunks: { min: 0, max: 12, step: 0.5 },
  asteroidVoxelLodChunks: { min: 4, max: 96, step: 1 },
  asteroidMeshLodChunks: { min: 4, max: 128, step: 1 },
  asteroidSearchMarginChunks: { min: 4, max: 256, step: 4 },
  chunkProcessingMaxTickMs: { min: 1, max: 32, step: 1 },
  chunkProcessingMaxRenderMs: { min: 1, max: 16, step: 1 },
  chunkPendingCreationLimit: { min: 20, max: 400, step: 10 },
  chunkPendingMeshingLimit: { min: 20, max: 400, step: 10 },
  chunkMinNeighborsToMesh: { min: 0, max: 26, step: 1 },
  renderMaxFps: { min: 0, max: 1000, step: 10 },
};

type RenderSettingsListener = (state: RenderSettingsState) => void;

let currentRenderSettings: RenderSettingsState = { ...RENDER_SETTINGS_DEFAULTS };
const listeners = new Set<RenderSettingsListener>();

export function initializeRenderSettings(
  initial?: Partial<RenderSettingsState>,
): RenderSettingsState {
  currentRenderSettings = {
    ...RENDER_SETTINGS_DEFAULTS,
    ...initial,
  };
  validateRanges();
  notifyListeners();
  return currentRenderSettings;
}

export function getRenderSettings(): RenderSettingsState {
  return currentRenderSettings;
}

export function updateRenderSettings(
  updates: Partial<RenderSettingsState>,
): RenderSettingsState {
  currentRenderSettings = {
    ...currentRenderSettings,
    ...updates,
  };
  validateRanges();
  notifyListeners();
  return currentRenderSettings;
}

export function subscribeRenderSettings(
  listener: RenderSettingsListener,
  options?: { emitCurrent?: boolean },
): () => void {
  listeners.add(listener);
  if (options?.emitCurrent ?? true) {
    listener(currentRenderSettings);
  }
  return () => {
    listeners.delete(listener);
  };
}

export function clampRenderSettingValue(
  key: keyof RenderSettingsState,
  value: number,
): number {
  const bounds = RENDER_SETTINGS_BOUNDS[key];
  if (!bounds) {
    return value;
  }
  const { min, max, step } = bounds;
  const clamped = Math.min(Math.max(value, min), max);
  if (step > 0) {
    const snapped = Math.round((clamped - min) / step) * step + min;
    return Number(snapped.toFixed(6));
  }
  return clamped;
}

export function parseRenderSettings(raw: string | null): Partial<RenderSettingsState> | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<Record<keyof RenderSettingsState, unknown>>;
    const entries = Object.entries(parsed) as [keyof RenderSettingsState, unknown][];
    const result: Partial<RenderSettingsState> = {};
    for (let i = 0; i < entries.length; i += 1) {
      const [key, value] = entries[i];
      if (typeof value === 'number' && Number.isFinite(value)) {
        result[key] = clampRenderSettingValue(key, value);
      }
    }
    return result;
  } catch (error) {
    console.warn('[RenderSettings] Failed to parse persisted settings', error);
    return null;
  }
}

export function serializeRenderSettings(state: RenderSettingsState): string {
  return JSON.stringify(state);
}

function validateRanges() {
  const boundsEntries = Object.entries(RENDER_SETTINGS_BOUNDS) as [
    keyof RenderSettingsState,
    RenderSettingBounds,
  ][];
  for (let i = 0; i < boundsEntries.length; i += 1) {
    const [key, bounds] = boundsEntries[i];
    const current = currentRenderSettings[key];
    if (current < bounds.min || current > bounds.max) {
      currentRenderSettings[key] = clampRenderSettingValue(key, current);
    }
  }
  if (currentRenderSettings.asteroidMeshLodChunks < currentRenderSettings.asteroidVoxelLodChunks + 1) {
    currentRenderSettings.asteroidMeshLodChunks = Math.min(
      clampRenderSettingValue('asteroidMeshLodChunks', currentRenderSettings.asteroidVoxelLodChunks + 1),
      RENDER_SETTINGS_BOUNDS.asteroidMeshLodChunks.max,
    );
  }
}

function notifyListeners() {
  listeners.forEach((listener) => {
    listener(currentRenderSettings);
  });
}
