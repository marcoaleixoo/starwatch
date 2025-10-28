import type { BlockKind, BlockOrientation } from '../blocks/types';
import type { GridScaleId } from '../config/build-options';
import type { VoxelPosition } from '../systems/energy/energy-network-manager';

export const SNAPSHOT_SCHEMA_VERSION = 2;

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
  orientation?: BlockOrientation;
}

export interface MicroblockLevelSnapshot {
  orientation?: BlockOrientation;
}

export interface MicroblockCellSnapshot {
  index: number;
  kind: BlockKind;
  levels: MicroblockLevelSnapshot[];
}

export interface MicroblockSnapshotEntry {
  position: VoxelPosition;
  scaleId: GridScaleId;
  cells: MicroblockCellSnapshot[];
}

export interface ConstructionSnapshot {
  decks: DeckSnapshotEntry[];
  solarPanels: OrientedBlockSnapshotEntry[];
  batteries: BatterySnapshotEntry[];
  terminals: OrientedBlockSnapshotEntry[];
  microblocks: MicroblockSnapshotEntry[];
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
