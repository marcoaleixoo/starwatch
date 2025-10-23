export interface BlockDefinition {
  key: string;
  registryId: number;
  materialName: string;
  materialColor: [number, number, number];
  label: string;
  hotkey: string;
  includeInPalette?: boolean;
}

export const BLOCK_DEFINITIONS: BlockDefinition[] = [
  {
    key: 'platform-stone',
    registryId: 1,
    materialName: 'platform-stone',
    materialColor: [0.36, 0.38, 0.44],
    label: 'PLATFORM',
    hotkey: '1',
  },
  {
    key: 'construction-alloy',
    registryId: 2,
    materialName: 'construction-alloy',
    materialColor: [0.52, 0.54, 0.6],
    label: 'ALLOY',
    hotkey: '2',
  },
  {
    key: 'asteroid-stone',
    registryId: 3,
    materialName: 'asteroid-stone',
    materialColor: [0.32, 0.32, 0.36],
    label: 'ASTEROID STONE',
    hotkey: '3',
    includeInPalette: false,
  },
  {
    key: 'asteroid-iron',
    registryId: 4,
    materialName: 'asteroid-iron',
    materialColor: [0.44, 0.32, 0.26],
    label: 'ASTEROID IRON',
    hotkey: '4',
    includeInPalette: false,
  },
  {
    key: 'asteroid-copper',
    registryId: 5,
    materialName: 'asteroid-copper',
    materialColor: [0.62, 0.33, 0.18],
    label: 'ASTEROID COPPER',
    hotkey: '5',
    includeInPalette: false,
  },
];
