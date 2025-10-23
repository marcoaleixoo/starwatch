import type { BlockPaletteEntry } from './world';

export interface BlockDefinition {
  registryId: number;
  materialName: string;
  materialColor: [number, number, number];
  label: string;
  hotkey: string;
}

export const BLOCK_DEFINITIONS: BlockDefinition[] = [
  {
    registryId: 1,
    materialName: 'rock',
    materialColor: [0.4, 0.4, 0.46],
    label: 'ROCK',
    hotkey: '1',
  },
  {
    registryId: 2,
    materialName: 'grass',
    materialColor: [0.12, 0.45, 0.24],
    label: 'GRASS',
    hotkey: '2',
  },
];
