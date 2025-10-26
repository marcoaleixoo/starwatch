import type { Engine } from 'noa-engine';
import type { HotbarApi } from '../player/hotbar';
import { INITIAL_HOTBAR_ITEMS } from '../config/hud-options';
import type { HotbarItemDefinition } from '../config/hud-options';
import type { SectorResources } from '../sector';
import type { EnergySystem } from '../systems/energy';
import type { TerminalSystem } from '../systems/terminals';
import { blockMetadataStore } from '../blocks/metadata-store';
import type { BlockKind, BlockOrientation } from '../blocks/types';
import type { VoxelPosition } from '../systems/energy/energy-network-manager';
import {
  SNAPSHOT_SCHEMA_VERSION,
  type SectorSnapshot,
  type SnapshotContextMeta,
  type HotbarSnapshot,
  type ConstructionSnapshot,
} from './types';

interface SnapshotContext {
  noa: Engine;
  sector: SectorResources;
  energy: EnergySystem;
  hotbar: HotbarApi;
  terminals: TerminalSystem;
}

const HOTBAR_SLOT_LIMIT = 9;

function clonePosition(position: VoxelPosition): VoxelPosition {
  return [position[0], position[1], position[2]];
}

function captureHotbar(hotbar: HotbarApi): HotbarSnapshot {
  const state = hotbar.controller.getState();
  const slotItemIds = state.slots.map((slot) => slot.item?.id ?? null);
  return {
    activeIndex: state.activeIndex,
    slotItemIds,
  };
}

function captureConstruction(ctx: SnapshotContext): ConstructionSnapshot {
  const decks = ctx.energy.listDecks().map((position) => ({ position: clonePosition(position) }));

  const orientationFor = (kind: BlockKind, position: VoxelPosition): BlockOrientation | undefined => {
    const value = blockMetadataStore.getOrientation({ kind, x: position[0], y: position[1], z: position[2] });
    return value ?? undefined;
  };

  const solarPanels = ctx.energy.listSolarPanels().map((panel) => ({
    position: clonePosition(panel.position),
    orientation: orientationFor(ctx.sector.starwatchBlocks.solarPanel.kind, panel.position),
  }));

  const batteries = ctx.energy.listBatteries().map((battery) => ({
    position: clonePosition(battery.position),
    storedMJ: battery.storedMJ,
    capacityMJ: battery.capacityMJ,
    orientation: orientationFor(ctx.sector.starwatchBlocks.battery.kind, battery.position),
  }));

  const terminals = ctx.energy.listTerminals().map((terminal) => ({
    position: clonePosition(terminal.position),
    orientation: orientationFor(ctx.sector.starwatchBlocks.halTerminal.kind, terminal.position),
  }));

  return {
    decks,
    solarPanels,
    batteries,
    terminals,
  };
}

export function captureSnapshot(ctx: SnapshotContext, meta: SnapshotContextMeta): SectorSnapshot {
  return {
    schemaVersion: SNAPSHOT_SCHEMA_VERSION,
    player: {
      id: meta.playerId,
      lastSeenIso: new Date().toISOString(),
    },
    sector: {
      id: meta.sectorId,
    },
    construction: captureConstruction(ctx),
    hotbar: captureHotbar(ctx.hotbar),
  };
}

function rehydrateHotbar(hotbar: HotbarApi, snapshot: HotbarSnapshot): void {
  const knownItems = new Map<string, HotbarItemDefinition>();
  INITIAL_HOTBAR_ITEMS.forEach((item) => {
    knownItems.set(item.id, item);
  });
  const currentState = hotbar.controller.getState();
  currentState.slots.forEach((slot) => {
    if (slot.item) {
      knownItems.set(slot.item.id, slot.item);
    }
  });

  for (let index = 0; index < HOTBAR_SLOT_LIMIT; index += 1) {
    const itemId = snapshot.slotItemIds[index] ?? null;
    const definition = itemId ? knownItems.get(itemId) ?? null : null;
    hotbar.controller.setSlotItem(index, definition ?? null);
  }

  hotbar.controller.setActiveIndex(Math.max(0, Math.min(HOTBAR_SLOT_LIMIT - 1, snapshot.activeIndex)));
}

export function restoreSnapshot(ctx: SnapshotContext, snapshot: SectorSnapshot): void {
  blockMetadataStore.clear();

  type PendingPlacement = {
    blockId: number;
    position: VoxelPosition;
  };

  const pendingPlacements = new Map<string, PendingPlacement>();

  const makePlacementKey = (blockId: number, position: VoxelPosition): string => (
    `${blockId}:${position[0]}:${position[1]}:${position[2]}`
  );

  const isPositionInChunk = (position: VoxelPosition, chunk: any): boolean => (
    position[0] >= chunk.x
    && position[0] < chunk.x + chunk.size
    && position[1] >= chunk.y
    && position[1] < chunk.y + chunk.size
    && position[2] >= chunk.z
    && position[2] < chunk.z + chunk.size
  );

  let chunkListenerAttached = false;

  function handleChunkAdded(chunk: any): void {
    if (!chunk) {
      return;
    }
    tryPlacePending(chunk);
  }

  function detachChunkListener(): void {
    if (!chunkListenerAttached) {
      return;
    }
    const worldEmitter = ctx.noa.world as unknown as {
      off?: (event: string, handler: (chunk: unknown) => void) => void;
      removeListener?: (event: string, handler: (chunk: unknown) => void) => void;
    };
    if (typeof worldEmitter.off === 'function') {
      worldEmitter.off('chunkAdded', handleChunkAdded);
    } else if (typeof worldEmitter.removeListener === 'function') {
      worldEmitter.removeListener('chunkAdded', handleChunkAdded);
    }
    chunkListenerAttached = false;
  }

  function tryPlacePending(chunk?: any): void {
    if (pendingPlacements.size === 0) {
      detachChunkListener();
      return;
    }
    const entries = Array.from(pendingPlacements.entries());
    for (const [key, pending] of entries) {
      if (chunk && !isPositionInChunk(pending.position, chunk)) {
        continue;
      }
      ctx.noa.setBlock(
        pending.blockId,
        pending.position[0],
        pending.position[1],
        pending.position[2],
      );
      const currentId = ctx.noa.world.getBlockID(
        pending.position[0],
        pending.position[1],
        pending.position[2],
      );
      if (currentId === pending.blockId) {
        pendingPlacements.delete(key);
      }
    }
    if (pendingPlacements.size === 0) {
      detachChunkListener();
    }
  }

  function attachChunkListener(): void {
    if (chunkListenerAttached || pendingPlacements.size === 0) {
      return;
    }
    const worldEmitter = ctx.noa.world as unknown as {
      on?: (event: string, handler: (chunk: unknown) => void) => void;
    };
    if (typeof worldEmitter.on === 'function') {
      worldEmitter.on('chunkAdded', handleChunkAdded);
      chunkListenerAttached = true;
    }
  }

  const ensureBlockPlacement = (blockId: number, position: VoxelPosition): void => {
    ctx.noa.setBlock(blockId, position[0], position[1], position[2]);
    const currentId = ctx.noa.world.getBlockID(position[0], position[1], position[2]);
    if (currentId === blockId) {
      return;
    }
    const key = makePlacementKey(blockId, position);
    pendingPlacements.set(key, {
      blockId,
      position: [position[0], position[1], position[2]] as VoxelPosition,
    });
    attachChunkListener();
  };

  for (const deck of snapshot.construction.decks) {
    ensureBlockPlacement(ctx.sector.starwatchBlocks.deck.id, deck.position);
    ctx.energy.networks.addDeck(deck.position);
  }

  for (const panel of snapshot.construction.solarPanels) {
    const orientation = panel.orientation ?? ctx.sector.starwatchBlocks.solarPanel.defaultOrientation;
    blockMetadataStore.setOrientation(
      {
        kind: ctx.sector.starwatchBlocks.solarPanel.kind,
        x: panel.position[0],
        y: panel.position[1],
        z: panel.position[2],
      },
      orientation,
    );
    ensureBlockPlacement(ctx.sector.starwatchBlocks.solarPanel.id, panel.position);
    ctx.energy.registerSolarPanel(panel.position);
    ctx.terminals.registerBlock(ctx.sector.starwatchBlocks.solarPanel.kind, panel.position);
  }

  for (const battery of snapshot.construction.batteries) {
    const orientation = battery.orientation ?? ctx.sector.starwatchBlocks.battery.defaultOrientation;
    blockMetadataStore.setOrientation(
      {
        kind: ctx.sector.starwatchBlocks.battery.kind,
        x: battery.position[0],
        y: battery.position[1],
        z: battery.position[2],
      },
      orientation,
    );
    ensureBlockPlacement(ctx.sector.starwatchBlocks.battery.id, battery.position);
    ctx.energy.registerBattery(battery.position);
    ctx.energy.setBatteryStored(battery.position, battery.storedMJ);
    ctx.terminals.registerBlock(ctx.sector.starwatchBlocks.battery.kind, battery.position);
  }

  for (const terminal of snapshot.construction.terminals) {
    const orientation = terminal.orientation ?? ctx.sector.starwatchBlocks.halTerminal.defaultOrientation;
    blockMetadataStore.setOrientation(
      {
        kind: ctx.sector.starwatchBlocks.halTerminal.kind,
        x: terminal.position[0],
        y: terminal.position[1],
        z: terminal.position[2],
      },
      orientation,
    );
    ensureBlockPlacement(ctx.sector.starwatchBlocks.halTerminal.id, terminal.position);
    ctx.energy.registerTerminal(terminal.position);
    ctx.terminals.registerBlock(ctx.sector.starwatchBlocks.halTerminal.kind, terminal.position);
  }

  rehydrateHotbar(ctx.hotbar, snapshot.hotbar);

  if (pendingPlacements.size > 0) {
    attachChunkListener();
    tryPlacePending();
  } else {
    detachChunkListener();
  }
}
