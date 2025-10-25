import type { SectorSnapshot } from './types';
import type { PersistenceAdapter } from './adapter';

const STORAGE_PREFIX = 'starwatch/save';

function makeKey(playerId: string, sectorId: string): string {
  return `${STORAGE_PREFIX}/${playerId}/${sectorId}`;
}

export class LocalStorageAdapter implements PersistenceAdapter {
  loadSnapshot(playerId: string, sectorId: string): SectorSnapshot | null {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    const raw = window.localStorage.getItem(makeKey(playerId, sectorId));
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as SectorSnapshot;
    } catch (error) {
      console.warn('[starwatch:persistence] snapshot inválido, limpando storage', error);
      window.localStorage.removeItem(makeKey(playerId, sectorId));
      return null;
    }
  }

  saveSnapshot(snapshot: SectorSnapshot): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    window.localStorage.setItem(makeKey(snapshot.player.id, snapshot.sector.id), JSON.stringify(snapshot));
  }

  clearSnapshot(playerId: string, sectorId: string): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    window.localStorage.removeItem(makeKey(playerId, sectorId));
  }
}
