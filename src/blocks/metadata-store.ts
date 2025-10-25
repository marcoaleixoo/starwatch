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
}

export const blockMetadataStore = new BlockMetadataStore();
