import type { PlayerStore } from "./playerStore";
import type { PlayerState } from "./playerState";
import { PLAYER_STATE_VERSION } from "./playerState";
import { createEmptyPlayerState } from "./playerState";

const DEFAULT_STORAGE_KEY = "starwatch.player-state";
const DEFAULT_DEBOUNCE_MS = 250;

export function loadPlayerState(storageKey = DEFAULT_STORAGE_KEY): PlayerState | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as PlayerState | undefined;
    if (!parsed || typeof parsed.version !== "number") {
      return null;
    }
    if (parsed.version !== PLAYER_STATE_VERSION) {
      return null;
    }
    return normalizePlayerState(parsed);
  } catch (error) {
    console.warn("[PlayerPersistence] Failed to load player state:", error);
    return null;
  }
}

export function savePlayerState(state: PlayerState, storageKey = DEFAULT_STORAGE_KEY) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  } catch (error) {
    console.warn("[PlayerPersistence] Failed to save player state:", error);
  }
}

export interface PlayerPersistenceController {
  dispose(): void;
  flush(): void;
}

export function createPlayerPersistence(
  store: PlayerStore,
  options?: {
    storageKey?: string;
    debounceMs?: number;
  },
): PlayerPersistenceController {
  const storageKey = options?.storageKey ?? DEFAULT_STORAGE_KEY;
  const debounceMs = options?.debounceMs ?? DEFAULT_DEBOUNCE_MS;

  let latestState: PlayerState | null = null;
  let timeoutHandle: number | null = null;
  let disposed = false;
  let skipNext = true;

  const scheduleSave = () => {
    if (timeoutHandle !== null) {
      window.clearTimeout(timeoutHandle);
    }
    timeoutHandle = window.setTimeout(() => {
      timeoutHandle = null;
      if (!latestState) {
        return;
      }
      savePlayerState(latestState, storageKey);
    }, debounceMs);
  };

  const unsubscribe = store.subscribe((state) => {
    latestState = state;
    if (skipNext) {
      skipNext = false;
      return;
    }
    if (!disposed) {
      scheduleSave();
    }
  });

  return {
    dispose: () => {
      disposed = true;
      unsubscribe();
      if (timeoutHandle !== null) {
        window.clearTimeout(timeoutHandle);
        timeoutHandle = null;
      }
    },
    flush: () => {
      if (!latestState) {
        return;
      }
      if (timeoutHandle !== null) {
        window.clearTimeout(timeoutHandle);
        timeoutHandle = null;
      }
      savePlayerState(latestState, storageKey);
    },
  };
}

function normalizePlayerState(state: PlayerState): PlayerState {
  const snapshot = createEmptyPlayerState();
  snapshot.transform = {
    position: { ...state.transform.position },
    orientation: { ...state.transform.orientation },
    velocity: { ...state.transform.velocity },
  };
  snapshot.movementIntent = {
    move: { ...state.movementIntent.move },
    sprint: state.movementIntent.sprint,
    jump: state.movementIntent.jump,
    crouch: state.movementIntent.crouch,
  };
  snapshot.input = {
    pointerLocked: state.input.pointerLocked,
    movementLocked: state.input.movementLocked,
    cameraLocked: state.input.cameraLocked,
  };
  snapshot.modules = {};
  Object.values(state.modules ?? {}).forEach((module) => {
    if (!module) {
      return;
    }
    snapshot.modules[module.id] = {
      id: module.id,
      version: module.version,
      state: { ...module.state },
    };
  });
  return snapshot;
}
