import type { Engine } from 'noa-engine';
import type { HotbarApi } from '../player/hotbar';
import type { SectorResources } from '../sector';
import type { EnergySystem } from '../systems/energy';
import type { PersistenceAdapter } from './adapter';
import type { SectorSnapshot } from './types';
import { captureSnapshot, restoreSnapshot } from './snapshot';
import { SNAPSHOT_SCHEMA_VERSION, type SnapshotContextMeta } from './types';

interface ManagerContext {
  noa: Engine;
  sector: SectorResources;
  energy: EnergySystem;
  hotbar: HotbarApi;
}

interface PersistenceManagerOptions {
  adapter: PersistenceAdapter;
  playerId: string;
  sectorId: string;
  context: ManagerContext;
  autosaveIntervalMs?: number;
}

export class PersistenceManager {
  private readonly adapter: PersistenceAdapter;
  private readonly meta: SnapshotContextMeta;
  private readonly ctx: ManagerContext;
  private autosaveHandle: ReturnType<typeof setInterval> | null = null;

  constructor(options: PersistenceManagerOptions) {
    this.adapter = options.adapter;
    this.meta = {
      playerId: options.playerId,
      sectorId: options.sectorId,
    };
    this.ctx = options.context;

    if (options.autosaveIntervalMs && options.autosaveIntervalMs > 0) {
      this.startAutoSave(options.autosaveIntervalMs);
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', this.handleBeforeUnload);
    }
  }

  load(): void {
    const snapshot = this.adapter.loadSnapshot(this.meta.playerId, this.meta.sectorId);
    if (!snapshot) {
      return;
    }
    if (snapshot.schemaVersion !== SNAPSHOT_SCHEMA_VERSION) {
      console.warn('[starwatch:persistence] versão de snapshot incompatível, ignorando.');
      return;
    }
    restoreSnapshot(
      {
        noa: this.ctx.noa,
        sector: this.ctx.sector,
        energy: this.ctx.energy,
        hotbar: this.ctx.hotbar,
      },
      snapshot,
    );
  }

  save(): void {
    const snapshot: SectorSnapshot = captureSnapshot(
      {
        noa: this.ctx.noa,
        sector: this.ctx.sector,
        energy: this.ctx.energy,
        hotbar: this.ctx.hotbar,
      },
      this.meta,
    );
    this.adapter.saveSnapshot(snapshot);
  }

  clear(): void {
    this.adapter.clearSnapshot(this.meta.playerId, this.meta.sectorId);
  }

  startAutoSave(intervalMs: number): void {
    if (this.autosaveHandle) {
      clearInterval(this.autosaveHandle);
    }
    this.autosaveHandle = setInterval(() => {
      try {
        this.save();
      } catch (error) {
        console.warn('[starwatch:persistence] falha no autosave', error);
      }
    }, intervalMs);
  }

  dispose(): void {
    if (this.autosaveHandle) {
      clearInterval(this.autosaveHandle);
      this.autosaveHandle = null;
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('beforeunload', this.handleBeforeUnload);
    }
  }

  private handleBeforeUnload = () => {
    try {
      this.save();
    } catch (error) {
      console.warn('[starwatch:persistence] erro ao salvar no beforeunload', error);
    }
  };
}

export function ensurePlayerId(): string {
  if (typeof window === 'undefined' || !window.localStorage) {
    return generateId();
  }
  const key = 'starwatch/playerId';
  const existing = window.localStorage.getItem(key);
  if (existing) {
    return existing;
  }
  const fresh = generateId();
  window.localStorage.setItem(key, fresh);
  return fresh;
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `player-${Math.random().toString(36).slice(2, 11)}`;
}
