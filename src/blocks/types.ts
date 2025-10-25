export type BlockKind =
  | 'starwatch:deck'
  | 'starwatch:solar-panel'
  | 'starwatch:battery'
  | 'starwatch:hal-terminal';

export type BlockOrientation = 'north' | 'east' | 'south' | 'west';

export interface BlockDefinition {
  kind: BlockKind;
  id: number;
  orientable: boolean;
  defaultOrientation: BlockOrientation;
}

export interface BlockCatalog {
  deck: BlockDefinition;
  solarPanel: BlockDefinition;
  battery: BlockDefinition;
  halTerminal: BlockDefinition;
  byKind: Map<BlockKind, BlockDefinition>;
  byId: Map<number, BlockDefinition>;
}
