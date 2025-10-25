import type { SectorBlocks } from '../blocks';

export interface ChunkBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}

export interface ChunkDimensions {
  sizeX: number;
  sizeY: number;
  sizeZ: number;
}

export interface ChunkGenerationContext {
  blocks: SectorBlocks;
  bounds: ChunkBounds;
  dimensions: ChunkDimensions;
  writeBlock: (worldX: number, worldY: number, worldZ: number, blockId: number) => void;
}
