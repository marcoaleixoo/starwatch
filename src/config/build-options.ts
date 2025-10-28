export type GridScaleId = 'grid:full' | 'grid:half' | 'grid:quarter';

export interface GridScaleOption {
  id: GridScaleId;
  label: string;
  /**
   * Number of uniform subdivisions applied to the base voxel on each axis.
   * A `divisions` value of 1 means the voxel is not subdivided.
   */
  divisions: number;
  /**
   * Toggle that allows enabling experimental subdivisions without changing runtime code.
   */
  enabled: boolean;
}

export const GRID_SCALE_SEQUENCE: GridScaleId[] = ['grid:full', 'grid:half', 'grid:quarter'];

export const GRID_SCALE_OPTIONS: Record<GridScaleId, GridScaleOption> = {
  'grid:full': {
    id: 'grid:full',
    label: '1x',
    divisions: 1,
    enabled: true,
  },
  'grid:half': {
    id: 'grid:half',
    label: '1/2x',
    divisions: 2,
    enabled: true,
  },
  'grid:quarter': {
    id: 'grid:quarter',
    label: '1/4x',
    divisions: 4,
    enabled: false,
  },
};

export const DEFAULT_GRID_SCALE_ID: GridScaleId = 'grid:full';

export const BUILD_INPUT_BINDINGS = {
  cycleScaleForward: ['KeyQ'] as const,
  cycleScaleBackward: ['KeyE'] as const,
};

export function getGridScaleOption(id: GridScaleId): GridScaleOption {
  return GRID_SCALE_OPTIONS[id];
}
