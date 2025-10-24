import type { Engine } from 'noa-engine';
import { PERSISTENCE_SYSTEM_ID } from '../core/constants';

export interface BlockMutation {
  position: [number, number, number];
  type: number;
}

export interface PlayerSnapshot {
  pos: [number, number, number];
  rot: [number, number];
}

interface StoredPlayerPayload extends PlayerSnapshot {
  version: number;
  updatedAt: string;
}

interface StoredBlocksPayload {
  version: number;
  updatedAt: string;
  blocks: Record<string, number>;
}

const STORAGE_ROOT = 'starwatch.save';
const STORAGE_VERSION = 1;
const SAVE_INTERVAL_MS = 10_000;

function getNow(): number {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }
  return Date.now();
}

function coordsKey(x: number, y: number, z: number): string {
  return `${x},${y},${z}`;
}

function approxEqual(a: number, b: number, epsilon = 0.001) {
  return Math.abs(a - b) <= epsilon;
}

function positionsEqual(
  a: [number, number, number],
  b: [number, number, number],
  epsilon = 0.001,
): boolean {
  return approxEqual(a[0], b[0], epsilon) && approxEqual(a[1], b[1], epsilon) && approxEqual(a[2], b[2], epsilon);
}

function rotationsEqual(
  a: [number, number],
  b: [number, number],
  epsilon = 0.0001,
): boolean {
  return approxEqual(a[0], b[0], epsilon) && approxEqual(a[1], b[1], epsilon);
}

function safeStringify<T>(value: T): string | null {
  try {
    return JSON.stringify(value);
  } catch (error) {
    console.warn('[Persistence] Unable to stringify value', error);
    return null;
  }
}

export class PersistenceManager {
  private readonly storage: Storage | null;

  private readonly keyPlayer: string;

  private readonly keyBlocks: string;

  private lastSaveTimestamp = getNow();

  private blockOverrides: Map<string, number> = new Map();

  private playerState: PlayerSnapshot | null = null;

  private dirtyBlocks = false;

  private dirtyPlayer = false;

  constructor(private readonly noa: Engine, private readonly sectorId: string) {
    this.storage = typeof window !== 'undefined' && window.localStorage ? window.localStorage : null;
    const baseKey = `${STORAGE_ROOT}.${sectorId}`;
    this.keyPlayer = `${baseKey}.player`;
    this.keyBlocks = `${baseKey}.blocks`;

    this.loadBlocks();
    this.loadPlayer();
  }

  getSectorId(): string {
    return this.sectorId;
  }

  getBlockOverride(x: number, y: number, z: number): number | undefined {
    return this.blockOverrides.get(coordsKey(x, y, z));
  }

  hasOverridesInChunk(
    chunkX: number,
    chunkY: number,
    chunkZ: number,
    sizeX: number,
    sizeY: number,
    sizeZ: number,
  ): boolean {
    if (this.blockOverrides.size === 0) {
      return false;
    }
    const maxX = chunkX + sizeX;
    const maxY = chunkY + sizeY;
    const maxZ = chunkZ + sizeZ;
    for (const key of this.blockOverrides.keys()) {
      const [rawX, rawY, rawZ] = key.split(',').map(Number);
      if (rawX >= chunkX && rawX < maxX && rawY >= chunkY && rawY < maxY && rawZ >= chunkZ && rawZ < maxZ) {
        return true;
      }
    }
    return false;
  }

  applyOverridesToChunk(
    target: { shape: number[]; set(x: number, y: number, z: number, value: number): void },
    chunkX: number,
    chunkY: number,
    chunkZ: number,
  ) {
    if (this.blockOverrides.size === 0) {
      return;
    }

    const sizeX = target.shape[0];
    const sizeY = target.shape[1];
    const sizeZ = target.shape[2];

    this.blockOverrides.forEach((value, key) => {
      const [rawX, rawY, rawZ] = key.split(',').map(Number);
      if (
        rawX >= chunkX &&
        rawX < chunkX + sizeX &&
        rawY >= chunkY &&
        rawY < chunkY + sizeY &&
        rawZ >= chunkZ &&
        rawZ < chunkZ + sizeZ
      ) {
        target.set(rawX - chunkX, rawY - chunkY, rawZ - chunkZ, value);
      }
    });
  }

  registerBlockMutation(mutation: BlockMutation) {
    const [x, y, z] = mutation.position;
    const key = coordsKey(x, y, z);
    const previous = this.blockOverrides.get(key);
    if (previous === mutation.type) {
      return;
    }
    this.blockOverrides.set(key, mutation.type);
    this.dirtyBlocks = true;
  }

  capturePlayerSnapshot() {
    const positionData = this.noa.entities.getPositionData(this.noa.playerEntity);
    const position = positionData.position.slice() as [number, number, number];
    const rotation: [number, number] = [this.noa.camera.pitch ?? 0, this.noa.camera.heading ?? 0];

    if (this.playerState) {
      if (positionsEqual(this.playerState.pos, position) && rotationsEqual(this.playerState.rot, rotation)) {
        return;
      }
    }

    this.playerState = {
      pos: position,
      rot: rotation,
    };
    this.dirtyPlayer = true;
  }

  applyPlayerSnapshot() {
    if (!this.playerState) {
      return;
    }
    this.noa.entities.setPosition(this.noa.playerEntity, this.playerState.pos);
    this.noa.camera.pitch = this.playerState.rot[0];
    this.noa.camera.heading = this.playerState.rot[1];
  }

  flush(force = false) {
    if (!this.storage) {
      return;
    }

    if (!force && !this.dirtyBlocks && !this.dirtyPlayer) {
      return;
    }

    if (this.dirtyBlocks) {
      const payload: StoredBlocksPayload = {
        version: STORAGE_VERSION,
        updatedAt: new Date().toISOString(),
        blocks: Object.fromEntries(this.blockOverrides.entries()),
      };
      const serialized = safeStringify(payload);
      if (serialized) {
        try {
          this.storage.setItem(this.keyBlocks, serialized);
          console.log('[Persistence] Blocks saved:', this.blockOverrides.size);
          this.dirtyBlocks = false;
        } catch (error) {
          console.warn('[Persistence] Failed to persist block data', error);
        }
      }
    }

    if (this.dirtyPlayer && this.playerState) {
      const payload: StoredPlayerPayload = {
        version: STORAGE_VERSION,
        updatedAt: new Date().toISOString(),
        pos: this.playerState.pos,
        rot: this.playerState.rot,
      };
      const serialized = safeStringify(payload);
      if (serialized) {
        try {
          this.storage.setItem(this.keyPlayer, serialized);
          console.log('[Persistence] Player snapshot saved');
          this.dirtyPlayer = false;
        } catch (error) {
          console.warn('[Persistence] Failed to persist player state', error);
        }
      }
    }

    this.lastSaveTimestamp = getNow();
  }

  createTickSystem() {
    return {
      id: PERSISTENCE_SYSTEM_ID,
      update: (dt: number) => {
        this.capturePlayerSnapshot();
        const now = getNow();
        const elapsed = now - this.lastSaveTimestamp;
        let seconds = dt;
        if (dt > 5) {
          seconds = dt / 1000;
        }
        if (elapsed >= SAVE_INTERVAL_MS || seconds >= SAVE_INTERVAL_MS / 1000) {
          this.flush();
        }
      },
    };
  }

  private loadBlocks() {
    if (!this.storage) {
      return;
    }
    const raw = this.storage.getItem(this.keyBlocks);
    if (!raw) {
      return;
    }
    try {
      const payload = JSON.parse(raw) as StoredBlocksPayload;
      if (payload.version !== STORAGE_VERSION || typeof payload.blocks !== 'object') {
        return;
      }
      this.blockOverrides = new Map(
        Object.entries(payload.blocks).map(([key, value]) => [key, Number(value)]),
      );
      console.log('[Persistence] Loaded blocks:', this.blockOverrides.size);
    } catch (error) {
      console.warn('[Persistence] Failed to parse stored blocks', error);
    }
  }

  private loadPlayer() {
    if (!this.storage) {
      return;
    }
    const raw = this.storage.getItem(this.keyPlayer);
    if (!raw) {
      return;
    }
    try {
      const payload = JSON.parse(raw) as StoredPlayerPayload;
      if (payload.version !== STORAGE_VERSION) {
        return;
      }
      this.playerState = {
        pos: payload.pos,
        rot: payload.rot,
      };
      console.log('[Persistence] Loaded player snapshot');
    } catch (error) {
      console.warn('[Persistence] Failed to parse player snapshot', error);
    }
  }
}
