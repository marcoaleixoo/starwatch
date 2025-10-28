import type { BlockKind, BlockOrientation } from './types';
import type { GridScaleId } from '../config/build-options';

interface BlockCoordinate {
  x: number;
  y: number;
  z: number;
}

interface OrientationKey extends BlockCoordinate {
  kind: BlockKind;
}

function makeKey(coord: OrientationKey): string {
  return `${coord.kind}:${coord.x}:${coord.y}:${coord.z}`;
}

interface MicroblockKey extends BlockCoordinate {}

export interface MicroblockCellState {
  kind: BlockKind;
  orientation: BlockOrientation;
}

export interface MicroblockEntry {
  scaleId: GridScaleId;
  cells: Map<number, MicroblockCellState>;
}

function makeMicroblockKey(coord: MicroblockKey): string {
  return `${coord.x}:${coord.y}:${coord.z}`;
}

class BlockMetadataStore {
  private orientations = new Map<string, BlockOrientation>();
  private microblocks = new Map<string, MicroblockEntry>();

  setOrientation(coord: OrientationKey, orientation: BlockOrientation): void {
    this.orientations.set(makeKey(coord), orientation);
  }

  getOrientation(coord: OrientationKey): BlockOrientation | null {
    return this.orientations.get(makeKey(coord)) ?? null;
  }

  deleteOrientation(coord: OrientationKey): void {
    this.orientations.delete(makeKey(coord));
  }

  setMicroblockCell(coord: MicroblockKey, scaleId: GridScaleId, cellIndex: number, state: MicroblockCellState): void {
    const key = makeMicroblockKey(coord);
    const entry = this.microblocks.get(key);
    if (entry && entry.scaleId !== scaleId) {
      const nextEntry: MicroblockEntry = {
        scaleId,
        cells: new Map([[cellIndex, state]]),
      };
      this.microblocks.set(key, nextEntry);
      return;
    }
    if (!entry) {
      const nextEntry: MicroblockEntry = {
        scaleId,
        cells: new Map([[cellIndex, state]]),
      };
      this.microblocks.set(key, nextEntry);
      return;
    }
    entry.scaleId = scaleId;
    entry.cells.set(cellIndex, state);
  }

  getMicroblockEntry(coord: MicroblockKey): MicroblockEntry | null {
    const key = makeMicroblockKey(coord);
    const entry = this.microblocks.get(key);
    if (!entry) {
      return null;
    }
    return {
      scaleId: entry.scaleId,
      cells: new Map(entry.cells),
    };
  }

  deleteMicroblockCell(coord: MicroblockKey, cellIndex: number): void {
    const key = makeMicroblockKey(coord);
    const entry = this.microblocks.get(key);
    if (!entry) {
      return;
    }
    entry.cells.delete(cellIndex);
    if (entry.cells.size === 0) {
      this.microblocks.delete(key);
    }
  }

  deleteMicroblockEntry(coord: MicroblockKey): void {
    const key = makeMicroblockKey(coord);
    this.microblocks.delete(key);
  }

  clearMicroblocks(): void {
    this.microblocks.clear();
  }

  clear(): void {
    this.orientations.clear();
    this.clearMicroblocks();
  }

  listOrientations(): Array<{ kind: BlockKind; position: [number, number, number]; orientation: BlockOrientation }> {
    const entries: Array<{ kind: BlockKind; position: [number, number, number]; orientation: BlockOrientation }> = [];
    for (const [key, orientation] of this.orientations.entries()) {
      const [kind, x, y, z] = key.split(':');
      entries.push({
        kind: kind as BlockKind,
        position: [Number(x), Number(y), Number(z)],
        orientation,
      });
    }
    return entries;
  }

  listMicroblocks(): Array<{
    position: [number, number, number];
    scaleId: GridScaleId;
    cells: Array<{ index: number; state: MicroblockCellState }>;
  }> {
    const entries: Array<{
      position: [number, number, number];
      scaleId: GridScaleId;
      cells: Array<{ index: number; state: MicroblockCellState }>;
    }> = [];
    for (const [key, entry] of this.microblocks.entries()) {
      const [x, y, z] = key.split(':').map(Number);
      entries.push({
        position: [x, y, z],
        scaleId: entry.scaleId,
        cells: Array.from(entry.cells.entries()).map(([index, state]) => ({
          index,
          state,
        })),
      });
    }
    return entries;
  }
}

export const blockMetadataStore = new BlockMetadataStore();
