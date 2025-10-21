import { createEmptyShipState, SHIP_STATE_VERSION, type ShipState } from "./shipState";
import type { ShipStore } from "./shipStore";

const DEFAULT_STORAGE_KEY = "starwatch.ship-state";
const DEFAULT_DEBOUNCE_MS = 250;

export function loadShipState(storageKey = DEFAULT_STORAGE_KEY): ShipState | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as ShipState | undefined;
    if (!parsed || typeof parsed.version !== "number") {
      return null;
    }
    if (parsed.version !== SHIP_STATE_VERSION) {
      return null;
    }
    return normalizeShipState(parsed);
  } catch (error) {
    console.warn("[ShipPersistence] Failed to load ship state:", error);
    return null;
  }
}

export function saveShipState(state: ShipState, storageKey = DEFAULT_STORAGE_KEY) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    const payload = JSON.stringify(state);
    window.localStorage.setItem(storageKey, payload);
  } catch (error) {
    console.warn("[ShipPersistence] Failed to save ship state:", error);
  }
}

export interface ShipPersistenceController {
  dispose(): void;
  flush(): void;
}

export function createShipPersistence(
  store: ShipStore,
  options?: {
    storageKey?: string;
    debounceMs?: number;
  },
): ShipPersistenceController {
  const storageKey = options?.storageKey ?? DEFAULT_STORAGE_KEY;
  const debounceMs = options?.debounceMs ?? DEFAULT_DEBOUNCE_MS;

  let latestState: ShipState | null = null;
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
      saveShipState(latestState, storageKey);
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
      saveShipState(latestState, storageKey);
    },
  };
}

function normalizeShipState(state: ShipState): ShipState {
  const next = createEmptyShipState();
  next.walls = {};
  next.lamps = {};
  next.removedStructuralLamps = {};

  Object.entries(state.walls ?? {}).forEach(([id, wall]) => {
    if (!wall) {
      return;
    }
    next.walls[id] = {
      id,
      position: wall.position,
      rotation: wall.rotation,
    };
  });

  Object.entries(state.lamps ?? {}).forEach(([id, lamp]) => {
    if (!lamp) {
      return;
    }
    next.lamps[id] = {
      id,
      anchorSurfaceId: lamp.anchorSurfaceId,
      position: lamp.position,
      rotation: lamp.rotation,
      color: lamp.color,
      local: lamp.local,
    };
  });

  Object.entries(state.removedStructuralLamps ?? {}).forEach(([id, removed]) => {
    if (!removed) {
      return;
    }
    next.removedStructuralLamps[id] = true;
  });

  return next;
}
