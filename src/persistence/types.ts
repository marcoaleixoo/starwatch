import type { BlockOrientation } from '../blocks/types';
import type { VoxelPosition } from '../systems/energy/energy-network-manager';

export const SNAPSHOT_SCHEMA_VERSION = 1;

export interface SnapshotPlayer {
  id: string;
  lastSeenIso: string;
}

export interface SnapshotSector {
  id: string;
  seed?: number;
}

export interface DeckSnapshotEntry {
  position: VoxelPosition;
}

export interface OrientedBlockSnapshotEntry {
  position: VoxelPosition;
  orientation?: BlockOrientation;
}

export interface BatterySnapshotEntry {
  position: VoxelPosition;
  storedMJ: number;
  capacityMJ: number;
}

export interface ConstructionSnapshot {
  decks: DeckSnapshotEntry[];
  solarPanels: OrientedBlockSnapshotEntry[];
  batteries: BatterySnapshotEntry[];
  terminals: OrientedBlockSnapshotEntry[];
}

export interface HotbarSnapshot {
  activeIndex: number;
  slotItemIds: (string | null)[];
}

export interface SectorSnapshot {
  schemaVersion: number;
  player: SnapshotPlayer;
  sector: SnapshotSector;
  construction: ConstructionSnapshot;
  hotbar: HotbarSnapshot;
}

export interface SnapshotContextMeta {
  playerId: string;
  sectorId: string;
}
