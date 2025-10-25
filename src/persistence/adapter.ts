import type { SectorSnapshot } from './types';

export interface PersistenceAdapter {
  loadSnapshot(playerId: string, sectorId: string): SectorSnapshot | null;
  saveSnapshot(snapshot: SectorSnapshot): void;
  clearSnapshot(playerId: string, sectorId: string): void;
}
