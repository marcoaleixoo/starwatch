import type { Engine } from 'noa-engine';
import type { WorldMaterials } from '../world/materials';
import type { BlockCatalog, BlockDefinition, BlockKind } from './types';

function registerSimpleBlock(
  noa: Engine,
  blockId: number,
  options: {
    material: string;
    solid?: boolean;
    opaque?: boolean;
  },
  definition: Omit<BlockDefinition, 'id'>,
): BlockDefinition {
  const id = noa.registry.registerBlock(blockId, {
    material: options.material,
    solid: options.solid ?? true,
    opaque: options.opaque ?? true,
  });

  return {
    ...definition,
    id,
  };
}

export function registerStarwatchBlocks(
  noa: Engine,
  materials: WorldMaterials,
  startingBlockId: number,
): BlockCatalog {
  let nextId = startingBlockId;

  const deck = registerSimpleBlock(
    noa,
    nextId,
    { material: materials.deck.name, solid: true, opaque: true },
    {
      kind: 'starwatch:deck',
      orientable: false,
      defaultOrientation: 'north',
    },
  );
  nextId += 1;

  const solarPanel = registerSimpleBlock(
    noa,
    nextId,
    { material: materials.solarPanel.name, solid: true, opaque: false },
    {
      kind: 'starwatch:solar-panel',
      orientable: true,
      defaultOrientation: 'south',
    },
  );
  nextId += 1;

  const battery = registerSimpleBlock(
    noa,
    nextId,
    { material: materials.battery.name, solid: true, opaque: true },
    {
      kind: 'starwatch:battery',
      orientable: false,
      defaultOrientation: 'north',
    },
  );
  nextId += 1;

  const halTerminal = registerSimpleBlock(
    noa,
    nextId,
    { material: materials.terminal.name, solid: true, opaque: true },
    {
      kind: 'starwatch:hal-terminal',
      orientable: true,
      defaultOrientation: 'south',
    },
  );

  const byKind = new Map<BlockKind, BlockDefinition>([
    [deck.kind, deck],
    [solarPanel.kind, solarPanel],
    [battery.kind, battery],
    [halTerminal.kind, halTerminal],
  ]);

  const byId = new Map<number, BlockDefinition>([
    [deck.id, deck],
    [solarPanel.id, solarPanel],
    [battery.id, battery],
    [halTerminal.id, halTerminal],
  ]);

  console.log('[starwatch] blocos de gameplay registrados', {
    deck: deck.id,
    solarPanel: solarPanel.id,
    battery: battery.id,
    halTerminal: halTerminal.id,
  });

  return {
    deck,
    solarPanel,
    battery,
    halTerminal,
    byKind,
    byId,
  };
}
