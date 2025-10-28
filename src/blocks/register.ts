import type { Engine } from 'noa-engine';
import type { SectorMaterials } from '../sector/materials';
import type { BlockCatalog, BlockDefinition, BlockKind } from './types';
import type { GridScaleId } from '../config/build-options';

const DECK_SCALES: GridScaleId[] = ['grid:full', 'grid:half', 'grid:quarter'];

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
  materials: SectorMaterials,
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
      placement: {
        defaultScale: 'grid:full',
        supportedScales: DECK_SCALES,
        shapes: {
          'grid:full': { size: [1, 1, 1] },
          'grid:half': { size: [0.98, 0.2, 0.98], offset: [0, 0.6, 0] },
          'grid:quarter': { size: [0.6, 0.2, 0.6], offset: [0, 0.6, 0] },
        },
      },
    },
  );
  nextId += 1;

  const deckMicroHost = registerSimpleBlock(
    noa,
    nextId,
    { material: materials.deckMicroHost.name, solid: true, opaque: true },
    {
      kind: 'starwatch:deck-micro-host',
      orientable: false,
      defaultOrientation: 'north',
      placement: {
        defaultScale: 'grid:full',
        supportedScales: ['grid:full'],
        shapes: {
          'grid:full': { size: [1, 1, 1] },
        },
      },
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
      placement: {
        defaultScale: 'grid:full',
        supportedScales: ['grid:full'],
        shapes: {
          'grid:full': { size: [1, 0.25, 1], offset: [0, -0.375, 0] },
        },
      },
    },
  );
  nextId += 1;

  const battery = registerSimpleBlock(
    noa,
    nextId,
    { material: materials.battery.name, solid: true, opaque: true },
    {
      kind: 'starwatch:battery',
      orientable: true,
      defaultOrientation: 'south',
      placement: {
        defaultScale: 'grid:full',
        supportedScales: ['grid:full'],
        shapes: {
          'grid:full': { size: [1, 1, 1] },
        },
      },
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
      placement: {
        defaultScale: 'grid:full',
        supportedScales: ['grid:full'],
        shapes: {
          'grid:full': { size: [1, 1, 1] },
        },
      },
    },
  );

  const byKind = new Map<BlockKind, BlockDefinition>([
    [deck.kind, deck],
    [deckMicroHost.kind, deckMicroHost],
    [solarPanel.kind, solarPanel],
    [battery.kind, battery],
    [halTerminal.kind, halTerminal],
  ]);

  const byId = new Map<number, BlockDefinition>([
    [deck.id, deck],
    [deckMicroHost.id, deckMicroHost],
    [solarPanel.id, solarPanel],
    [battery.id, battery],
    [halTerminal.id, halTerminal],
  ]);

  console.log('[starwatch] blocos de gameplay registrados', {
    deck: deck.id,
    deckMicroHost: deckMicroHost.id,
    solarPanel: solarPanel.id,
    battery: battery.id,
    halTerminal: halTerminal.id,
  });

  return {
    deck,
    deckMicroHost,
    solarPanel,
    battery,
    halTerminal,
    byKind,
    byId,
  };
}
