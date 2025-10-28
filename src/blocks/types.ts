import type { GridScaleId } from '../config/build-options';

export type BlockKind =
  | 'starwatch:deck'
  | 'starwatch:deck-micro-host'
  | 'starwatch:solar-panel'
  | 'starwatch:battery'
  | 'starwatch:hal-terminal';

export type BlockOrientation = 'north' | 'east' | 'south' | 'west';

export interface PlacementShape {
  /**
   * Final rendered dimensions inside the base voxel, expressed in world units (meters).
   */
  size: [number, number, number];
  /**
   * Optional positional offset applied after centering the shape within the voxel.
   * Useful for peças que “flutuam” ou ficam encostadas na parede.
   */
  offset?: [number, number, number];
}

export interface BlockPlacementProfile {
  defaultScale: GridScaleId;
  supportedScales: GridScaleId[];
  /**
   * Shape definitions per escala suportada. Ausência de um shape invalida a escala.
   */
  shapes: Partial<Record<GridScaleId, PlacementShape>>;
}

export interface BlockDefinition {
  kind: BlockKind;
  id: number;
  orientable: boolean;
  defaultOrientation: BlockOrientation;
  placement: BlockPlacementProfile;
}

export interface BlockCatalog {
  deck: BlockDefinition;
  deckMicroHost: BlockDefinition;
  solarPanel: BlockDefinition;
  battery: BlockDefinition;
  halTerminal: BlockDefinition;
  byKind: Map<BlockKind, BlockDefinition>;
  byId: Map<number, BlockDefinition>;
}
