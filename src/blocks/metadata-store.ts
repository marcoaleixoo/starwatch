import type { BlockKind, BlockOrientation } from './types';

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

class BlockMetadataStore {
  private orientations = new Map<string, BlockOrientation>();

  setOrientation(coord: OrientationKey, orientation: BlockOrientation): void {
    this.orientations.set(makeKey(coord), orientation);
  }

  getOrientation(coord: OrientationKey): BlockOrientation | null {
    return this.orientations.get(makeKey(coord)) ?? null;
  }

  deleteOrientation(coord: OrientationKey): void {
    this.orientations.delete(makeKey(coord));
  }

  clear(): void {
    this.orientations.clear();
  }
}

export const blockMetadataStore = new BlockMetadataStore();
