import type { Engine } from 'noa-engine';
import type { OverlayApi } from '../../hud/overlay';
import type { HotbarApi } from '../../player/hotbar';
import type { SectorResources } from '../../sector';
import type { BlockCatalog, BlockDefinition, BlockKind, BlockOrientation, PlacementShape } from '../../blocks/types';
import { blockMetadataStore } from '../../blocks/metadata-store';
import type { EnergySystem } from '../energy';
import type { TerminalSystem } from '../terminals';
import { GhostRenderer } from './ghost-renderer';
import { BuildState } from './build-state';
import { BUILD_INPUT_BINDINGS, DEFAULT_GRID_SCALE_ID, getGridScaleOption, type GridScaleId } from '../../config/build-options';
import { MicroblockStore } from './microblock-store';

const ORIENTATIONS: BlockOrientation[] = ['north', 'east', 'south', 'west'];
const REMOVE_HOLD_DURATION_MS = 1000;
const placementDebugEnabled = import.meta.env.VITE_DEBUG_BUILDING === '1';
let lastPreviewDebugKey: string | null = null;
const previewSkipLogCache = new Set<string>();

function logPlacement(message: string, details?: Record<string, unknown>): void {
  if (!placementDebugEnabled) {
    return;
  }
  if (details) {
    console.log('[building] placement', message, details);
  } else {
    console.log('[building] placement', message);
  }
}

function logPreview(details: Record<string, unknown>): void {
  if (!placementDebugEnabled) {
    return;
  }
  const key = JSON.stringify(details);
  if (key === lastPreviewDebugKey) {
    return;
  }
  lastPreviewDebugKey = key;
  logPlacement('preview', details);
}

function logPreviewSkip(details: Record<string, unknown>): void {
  if (!placementDebugEnabled) {
    return;
  }
  const key = JSON.stringify(details);
  if (previewSkipLogCache.has(key)) {
    return;
  }
  previewSkipLogCache.add(key);
  if (previewSkipLogCache.size > 32) {
    previewSkipLogCache.clear();
    previewSkipLogCache.add(key);
  }
  logPlacement('preview-skip', details);
}

interface PlacementSystemDependencies {
  noa: Engine;
  overlay: OverlayApi;
  hotbar: HotbarApi;
  sector: SectorResources;
  energy: EnergySystem;
  terminals: TerminalSystem;
}

interface NoaTargetBlock {
  position: number[];
  normal: number[];
  adjacent: number[];
  blockID: number;
}

interface PlacementTarget {
  position: [number, number, number];
  normal: [number, number, number];
  adjacent: [number, number, number];
  hitPosition: [number, number, number];
}

interface PlacementPreview {
  definition: BlockDefinition;
  orientation: BlockOrientation;
  scaleId: GridScaleId;
  shape: PlacementShape;
  target: PlacementTarget;
  base: [number, number, number];
  center: [number, number, number];
  position: [number, number, number];
  rotationY: number;
  available: boolean;
  cellIndex: number;
  existingBlockId: number;
}

function getActiveBlockDefinition(hotbar: HotbarApi, catalog: BlockCatalog): BlockDefinition | null {
  const slot = hotbar.controller.getActiveSlot();
  if (!slot.item) {
    return null;
  }
  return catalog.byKind.get(slot.item.blockKind as BlockKind) ?? null;
}

function getPlacementTarget(noa: Engine): PlacementTarget | null {
  const targeted = noa.targetedBlock as NoaTargetBlock | null;
  if (!targeted) {
    return null;
  }
  const pick = noa.pick();
  const hitPosition: [number, number, number] = pick
    ? [pick.position[0], pick.position[1], pick.position[2]]
    : [targeted.adjacent[0] + 0.5, targeted.adjacent[1] + 0.5, targeted.adjacent[2] + 0.5];
  return {
    position: [targeted.position[0], targeted.position[1], targeted.position[2]],
    normal: [targeted.normal[0], targeted.normal[1], targeted.normal[2]],
    adjacent: [targeted.adjacent[0], targeted.adjacent[1], targeted.adjacent[2]],
    hitPosition,
  };
}

function nextOrientation(current: BlockOrientation): BlockOrientation {
  const index = ORIENTATIONS.indexOf(current);
  const nextIndex = (index + 1) % ORIENTATIONS.length;
  return ORIENTATIONS[nextIndex];
}

function orientationToRadians(orientation: BlockOrientation): number {
  switch (orientation) {
    case 'north':
      return 0;
    case 'east':
      return Math.PI / 2;
    case 'south':
      return Math.PI;
    case 'west':
      return (3 * Math.PI) / 2;
    default:
      return 0;
  }
}

function getPlacementShapeForScale(definition: BlockDefinition, scaleId: GridScaleId): PlacementShape | null {
  const shape = definition.placement.shapes[scaleId] ?? null;
  if (!shape) {
    return null;
  }
  return shape;
}

interface PlacementCenter {
  center: [number, number, number];
  cellIndex: number;
}

function resolveBaseCoordinate(
  noa: Engine,
  target: PlacementTarget,
  scaleId: GridScaleId,
): [number, number, number] {
  if (scaleId === DEFAULT_GRID_SCALE_ID) {
    return [target.adjacent[0], target.adjacent[1], target.adjacent[2]];
  }
  const option = getGridScaleOption(scaleId);
  if (option.divisions <= 1) {
    return [target.adjacent[0], target.adjacent[1], target.adjacent[2]];
  }
  const targetedBlockId = noa.world.getBlockID(target.position[0], target.position[1], target.position[2]);
  if (targetedBlockId !== 0) {
    return [target.position[0], target.position[1], target.position[2]];
  }
  return [target.adjacent[0], target.adjacent[1], target.adjacent[2]];
}

function resolvePlacementCenter(
  target: PlacementTarget,
  scaleId: GridScaleId,
  base: [number, number, number],
): PlacementCenter | null {
  const option = getGridScaleOption(scaleId);
  if (option.divisions <= 1) {
    return {
      center: [base[0] + 0.5, base[1] + 0.5, base[2] + 0.5],
      cellIndex: 0,
    };
  }

  const divisions = option.divisions;
  const cellSize = 1 / divisions;

  const offsetX = target.hitPosition[0] - base[0];
  const offsetZ = target.hitPosition[2] - base[2];

  const clamp = (value: number) => Math.min(Math.max(value, 0), 0.999);
  const localX = clamp(offsetX);
  const localZ = clamp(offsetZ);

  const cellX = Math.min(divisions - 1, Math.floor(localX * divisions));
  const cellZ = Math.min(divisions - 1, Math.floor(localZ * divisions));
  const index = cellZ * divisions + cellX;

  const centerX = base[0] + cellX * cellSize + cellSize / 2;
  const centerZ = base[2] + cellZ * cellSize + cellSize / 2;
  const centerY = base[1] + 0.5;

  return {
    center: [centerX, centerY, centerZ],
    cellIndex: index,
  };
}

function applyOffset(
  base: [number, number, number],
  offset: [number, number, number] | undefined,
  rotationY: number,
): [number, number, number] {
  if (!offset) {
    return base;
  }
  const cos = Math.cos(rotationY);
  const sin = Math.sin(rotationY);
  const rotatedX = offset[0] * cos - offset[2] * sin;
  const rotatedZ = offset[0] * sin + offset[2] * cos;
  return [base[0] + rotatedX, base[1] + offset[1], base[2] + rotatedZ];
}

function evaluatePlacement(
  noa: Engine,
  target: PlacementTarget,
  definition: BlockDefinition,
  orientation: BlockOrientation,
  scaleId: GridScaleId,
  shape: PlacementShape,
  canPlaceFullBlock: (position: [number, number, number]) => boolean,
  catalog: BlockCatalog,
): PlacementPreview | null {
  const base = resolveBaseCoordinate(noa, target, scaleId);
  const centerInfo = resolvePlacementCenter(target, scaleId, base);
  if (!centerInfo) {
    logPreviewSkip({
      reason: 'no-center',
      kind: definition.kind,
      scaleId,
      base,
      normal: target.normal,
      hitPosition: target.hitPosition,
    });
    return null;
  }
  const rotationY = orientationToRadians(orientation);
  const position = applyOffset(centerInfo.center, shape.offset, rotationY);

  let available = false;
  const existingBlockId = noa.world.getBlockID(base[0], base[1], base[2]);
  const existingDefinition = existingBlockId === 0 ? null : catalog.byId.get(existingBlockId) ?? null;
  const microEntry = blockMetadataStore.getMicroblockEntry({
    x: base[0],
    y: base[1],
    z: base[2],
  });
  let availabilityReason = 'ok';
  if (scaleId === DEFAULT_GRID_SCALE_ID) {
    if (!canPlaceFullBlock(base)) {
      available = false;
      availabilityReason = 'blocked-solid';
    } else {
      available = !microEntry || microEntry.cells.size === 0;
      if (!available) {
        availabilityReason = 'micro-occupied';
      }
    }
  } else {
    const isDeckMicro = definition.kind === 'starwatch:deck';
    if (!isDeckMicro) {
      available = false;
      availabilityReason = 'unsupported-kind';
    } else {
      const baseKind = existingDefinition?.kind ?? null;
      availabilityReason = `host-kind:${baseKind ?? 'empty'}`;
      const supportsMicroHost = baseKind === 'starwatch:deck' || baseKind === 'starwatch:deck-micro-host' || baseKind === null;
      if (!supportsMicroHost) {
        available = false;
        availabilityReason = 'host-incompatible';
      } else {
        if (!microEntry) {
          available = true;
          availabilityReason = 'empty';
        } else if (microEntry.scaleId !== scaleId) {
          available = microEntry.cells.size === 0;
          availabilityReason = available ? 'rescale-permitted' : 'rescale-occupied';
        } else {
          available = !microEntry.cells.has(centerInfo.cellIndex);
          availabilityReason = available ? 'slot-free' : 'slot-occupied';
        }
      }
    }
  }

  logPreview({
    kind: definition.kind,
    scaleId,
    base,
    center: centerInfo.center,
    cellIndex: centerInfo.cellIndex,
    available,
    availabilityReason,
    existingBlockId,
    existingKind: existingDefinition?.kind ?? null,
    hasMicro: !!microEntry,
    microCellCount: microEntry?.cells.size ?? 0,
  });

  return {
    definition,
    orientation,
    scaleId,
    shape,
    target,
    base,
    center: centerInfo.center,
    position,
    rotationY,
    available,
    cellIndex: centerInfo.cellIndex,
    existingBlockId,
  };
}

export function initializePlacementSystem({ noa, overlay, hotbar, sector, energy, terminals }: PlacementSystemDependencies): void {
  const ghostRenderer = new GhostRenderer(noa);
  const buildState = new BuildState();
  const microblockStore = new MicroblockStore(noa);
  const deckDefinition = sector.starwatchBlocks.deck;
  const deckMicroHostId = sector.starwatchBlocks.deckMicroHost.id;
  const deckBlockId = sector.starwatchBlocks.deck.id;
  let currentDefinition: BlockDefinition | null = null;
  const orientationByKind = new Map<BlockKind, BlockOrientation>();
  let lastHotbarIndex = hotbar.controller.getState().activeIndex;
  let removeHoldTarget: PlacementTarget | null = null;
  let removeHoldTriggered = false;
  let removeHoldActive = false;
  let removeHoldElapsed = 0;
  let removalHoldResetTimeout: ReturnType<typeof setTimeout> | null = null;
  let currentPreview: PlacementPreview | null = null;

  const removalHold = overlay.removalHold;

  const updateActiveDefinition = () => {
    currentDefinition = getActiveBlockDefinition(hotbar, sector.starwatchBlocks);
    buildState.setActiveDefinition(currentDefinition);
    if (currentDefinition && !orientationByKind.has(currentDefinition.kind)) {
      orientationByKind.set(currentDefinition.kind, currentDefinition.defaultOrientation);
    }
  };

  const pushBuildScaleState = () => {
    const snapshot = buildState.getSnapshot();
    const option = getGridScaleOption(snapshot.activeScaleId);
    overlay.buildScale.setState({
      blockKind: snapshot.activeDefinition?.kind ?? null,
      scaleId: snapshot.activeScaleId,
      label: option.label,
      divisions: option.divisions,
      availableScaleIds: snapshot.availableScales,
    });
  };

  buildState.subscribe(() => {
    pushBuildScaleState();
  });

  hotbar.controller.subscribe(() => {
    const state = hotbar.controller.getState();
    if (state.activeIndex !== lastHotbarIndex) {
      lastHotbarIndex = state.activeIndex;
      updateActiveDefinition();
    }
  });

  updateActiveDefinition();
  pushBuildScaleState();

  const hideGhost = () => {
    ghostRenderer.hide();
    currentPreview = null;
    lastPreviewDebugKey = null;
  };

  const canPlaceFullBlock = (position: [number, number, number]): boolean => {
    const blockId = noa.world.getBlockID(position[0], position[1], position[2]);
    return blockId === 0;
  };

  const ensureMicroHost = (preview: PlacementPreview): boolean => {
    if (preview.scaleId === DEFAULT_GRID_SCALE_ID) {
      return true;
    }
    if (preview.definition.kind !== 'starwatch:deck') {
      logPlacement('ensure-host-skip', {
        reason: 'non-deck',
        kind: preview.definition.kind,
      });
      return false;
    }
    const [x, y, z] = preview.base;
    const existingId = noa.world.getBlockID(x, y, z);
    if (existingId === deckMicroHostId) {
      logPlacement('ensure-host', { status: 'already-host', base: preview.base });
      return true;
    }
    if (existingId === deckBlockId || existingId === 0) {
      noa.setBlock(deckMicroHostId, x, y, z);
      energy.networks.addDeck([x, y, z]);
      logPlacement('ensure-host', { status: 'converted', from: existingId, base: preview.base });
      return true;
    }
    logPlacement('ensure-host-fail', { base: preview.base, existingId });
    return false;
  };

  const getMicroEntry = (coord: [number, number, number]) =>
    blockMetadataStore.getMicroblockEntry({ x: coord[0], y: coord[1], z: coord[2] });

  const tryRemoveMicroblock = (target: PlacementTarget): boolean => {
    let base: [number, number, number] = [target.adjacent[0], target.adjacent[1], target.adjacent[2]];
    let entry = getMicroEntry(base);
    if (!entry) {
      base = [target.position[0], target.position[1], target.position[2]];
      entry = getMicroEntry(base);
    }
    if (!entry) {
      logPlacement('remove-micro-skip', { reason: 'no-entry', base });
      return false;
    }
    const centerInfo = resolvePlacementCenter(target, entry.scaleId, base);
    if (!centerInfo) {
      logPlacement('remove-micro-skip', { reason: 'no-center', base, normal: target.normal });
      return false;
    }
    const cellState = entry.cells.get(centerInfo.cellIndex);
    if (!cellState) {
      logPlacement('remove-micro-skip', { reason: 'cell-empty', base, cellIndex: centerInfo.cellIndex });
      return false;
    }
    microblockStore.remove(base, centerInfo.cellIndex);
    const updated = getMicroEntry(base);
    if (!updated || updated.cells.size === 0) {
      const currentId = noa.world.getBlockID(base[0], base[1], base[2]);
      if (currentId === deckMicroHostId) {
        noa.setBlock(deckBlockId, base[0], base[1], base[2]);
        logPlacement('micro-host-reverted', { base });
      }
      terminals.unregisterBlock(cellState.kind, [base[0], base[1], base[2]]);
    }
    logPlacement('remove-micro', {
      base,
      cellIndex: centerInfo.cellIndex,
      remaining: updated?.cells.size ?? 0,
      kind: cellState.kind,
    });
    return true;
  };

  const removeFullBlockAt = (coord: [number, number, number]) => {
    const [x, y, z] = coord;
    const existingId = noa.world.getBlockID(x, y, z);
    if (existingId === 0) {
      return;
    }
    const def = sector.starwatchBlocks.byId.get(existingId);
    noa.setBlock(0, x, y, z);
    if (def?.orientable) {
      blockMetadataStore.deleteOrientation({ kind: def.kind, x, y, z });
    }
    microblockStore.removeAll([x, y, z]);
    if (def?.kind === 'starwatch:deck') {
      energy.networks.removeDeck([x, y, z]);
    } else if (def?.kind === 'starwatch:solar-panel') {
      energy.unregisterSolarPanel([x, y, z]);
    } else if (def?.kind === 'starwatch:battery') {
      energy.unregisterBattery([x, y, z]);
    } else if (def?.kind === 'starwatch:hal-terminal') {
      energy.unregisterTerminal([x, y, z]);
    }
    if (def) {
      terminals.unregisterBlock(def.kind, [x, y, z]);
    }
  };

  const placeBlock = (target: PlacementTarget, base: [number, number, number], definition: BlockDefinition, orientation: BlockOrientation) => {
    const [x, y, z] = base;
    noa.setBlock(definition.id, x, y, z);
    if (definition.orientable) {
      blockMetadataStore.setOrientation({ kind: definition.kind, x, y, z }, orientation);
    }
    if (definition.kind === 'starwatch:deck') {
      energy.networks.addDeck([x, y, z]);
    } else if (definition.kind === 'starwatch:solar-panel') {
      energy.registerSolarPanel([x, y, z]);
    } else if (definition.kind === 'starwatch:battery') {
      energy.registerBattery([x, y, z]);
    } else if (definition.kind === 'starwatch:hal-terminal') {
      energy.registerTerminal([x, y, z]);
    }
    terminals.registerBlock(definition.kind, [x, y, z]);
  };

  const removeBlock = (target: PlacementTarget) => {
    removeFullBlockAt(target.position);
  };

  const clearRemovalHoldReset = () => {
    if (removalHoldResetTimeout !== null) {
      clearTimeout(removalHoldResetTimeout);
      removalHoldResetTimeout = null;
    }
  };

  const cancelRemoveHold = (preserveTriggered = false, emitIdle = true) => {
    removeHoldActive = false;
    removeHoldElapsed = 0;
    removeHoldTarget = null;
    if (!preserveTriggered) {
      removeHoldTriggered = false;
    }
    clearRemovalHoldReset();
    if (emitIdle) {
      removalHold.setState({ active: false, progress: 0 });
    }
  };

  const scheduleRemoveHold = (target: PlacementTarget) => {
    removeHoldTarget = {
      position: [...target.position],
      normal: [...target.normal],
      adjacent: [...target.adjacent],
      hitPosition: [...target.hitPosition],
    };
    removeHoldTriggered = false;
    removeHoldActive = true;
    removeHoldElapsed = 0;
    clearRemovalHoldReset();
    removalHold.setState({ active: true, progress: 0 });
  };

  const handleRemoveHoldStart = () => {
    cancelRemoveHold();
    if (overlay.controller.getState().captureInput) {
      return;
    }
    const target = getPlacementTarget(noa);
    if (!target) {
      return;
    }
    scheduleRemoveHold(target);
  };

  const handleRemoveHoldEnd = () => {
    const wasTriggered = removeHoldTriggered;
    cancelRemoveHold();
    if (!wasTriggered) {
      return;
    }
  };

  const handlePlace = () => {
    if (overlay.controller.getState().captureInput) {
      logPlacement('place-skip', { reason: 'overlay-capture' });
      return;
    }
    const preview = currentPreview;
    if (!preview || !preview.available) {
      logPlacement('place-skip', { reason: 'no-preview' });
      return;
    }
    if (preview.scaleId !== DEFAULT_GRID_SCALE_ID) {
      if (!ensureMicroHost(preview)) {
        logPlacement('place-skip', { reason: 'ensure-host-failed', base: preview.base });
        return;
      }
      const beforeEntry = getMicroEntry(preview.base);
      microblockStore.add(preview.base, {
        definition: preview.definition,
        scaleId: preview.scaleId,
        cellIndex: preview.cellIndex,
        orientation: preview.orientation,
        size: preview.shape.size,
        position: preview.position,
        rotationY: preview.rotationY,
      });
      const afterEntry = getMicroEntry(preview.base);
      if (preview.definition.kind === 'starwatch:deck') {
        if (afterEntry && afterEntry.cells.size > 0) {
          energy.networks.addDeck([preview.base[0], preview.base[1], preview.base[2]]);
        } else if (!afterEntry && beforeEntry && beforeEntry.cells.size > 0) {
          energy.networks.removeDeck([preview.base[0], preview.base[1], preview.base[2]]);
        }
      }
      if (!beforeEntry || beforeEntry.cells.size === 0) {
        terminals.registerBlock(preview.definition.kind, [
          preview.base[0],
          preview.base[1],
          preview.base[2],
        ]);
      }
      logPlacement('place-micro', {
        base: preview.base,
        cellIndex: preview.cellIndex,
        microCount: afterEntry?.cells.size ?? 0,
      });
      return;
    }
    placeBlock(preview.target, preview.base, preview.definition, preview.orientation);
    logPlacement('place-full', {
      base: preview.base,
      kind: preview.definition.kind,
    });
  };

  const handleRemove = () => {
    cancelRemoveHold();
    if (overlay.controller.getState().captureInput) {
      return;
    }
    const target = getPlacementTarget(noa);
    if (!target) {
      return;
    }
    if (tryRemoveMicroblock(target)) {
      return;
    }
    removeBlock(target);
  };

  noa.inputs.bind('build-place', ['Mouse3']);
  noa.inputs.bind('build-place-alt', ['Enter']);
  noa.inputs.bind('build-remove-hold', ['Mouse1']);
  noa.inputs.bind('build-remove-alt', ['KeyX']);
  noa.inputs.bind('build-rotate', ['KeyR']);
  noa.inputs.bind('build-cycle-scale-forward', [...BUILD_INPUT_BINDINGS.cycleScaleForward]);
  noa.inputs.bind('build-cycle-scale-backward', [...BUILD_INPUT_BINDINGS.cycleScaleBackward]);

  noa.inputs.down.on('build-place', handlePlace);
  noa.inputs.down.on('build-place-alt', handlePlace);
  noa.inputs.down.on('build-remove-alt', handleRemove);
  noa.inputs.down.on('build-remove-hold', handleRemoveHoldStart);
  noa.inputs.up.on('build-remove-hold', handleRemoveHoldEnd);

  noa.inputs.down.on('build-rotate', () => {
    if (overlay.controller.getState().captureInput) {
      return;
    }
    if (!currentDefinition || !currentDefinition.orientable) {
      return;
    }
    const next = nextOrientation(orientationByKind.get(currentDefinition.kind) ?? currentDefinition.defaultOrientation);
    orientationByKind.set(currentDefinition.kind, next);
  });

  noa.inputs.down.on('build-cycle-scale-forward', () => {
    if (overlay.controller.getState().captureInput) {
      return;
    }
    buildState.cycleScale(1);
  });

  noa.inputs.down.on('build-cycle-scale-backward', () => {
    if (overlay.controller.getState().captureInput) {
      return;
    }
    buildState.cycleScale(-1);
  });

  noa.on('beforeRender', () => {
    if (overlay.controller.getState().captureInput) {
      hideGhost();
      return;
    }

    const definition = getActiveBlockDefinition(hotbar, sector.starwatchBlocks);
    if (!definition) {
      hideGhost();
      return;
    }

    const target = getPlacementTarget(noa);
    if (!target) {
      hideGhost();
      return;
    }

    const snapshot = buildState.getSnapshot();
    const scaleId = snapshot.activeScaleId;
    const shape = getPlacementShapeForScale(definition, scaleId);
    if (!shape) {
      hideGhost();
      return;
    }

    const orientation = orientationByKind.get(definition.kind) ?? definition.defaultOrientation;
    const preview = evaluatePlacement(
      noa,
      target,
      definition,
      orientation,
      scaleId,
      shape,
      canPlaceFullBlock,
      sector.starwatchBlocks,
    );
    if (!preview) {
      hideGhost();
      return;
    }

    currentPreview = preview;
    ghostRenderer.render({
      definition,
      scaleId,
      size: shape.size,
      position: preview.position,
      rotationY: preview.rotationY,
      valid: preview.available,
    });
  });

  noa.on('tick', (dt: number) => {
    // `dt` is provided in milliseconds by MicroGameShell's fixed tick loop.
    if (!removeHoldActive || !removeHoldTarget) {
      return;
    }
    if (overlay.controller.getState().captureInput) {
      cancelRemoveHold();
      return;
    }
    const [x, y, z] = removeHoldTarget.position;
    if (noa.world.getBlockID(x, y, z) === 0) {
      cancelRemoveHold();
      return;
    }
    removeHoldElapsed += dt;
    const progress = Math.min(1, removeHoldElapsed / REMOVE_HOLD_DURATION_MS);
    removalHold.setState({ active: true, progress });
    if (removeHoldElapsed < REMOVE_HOLD_DURATION_MS) {
      return;
    }
    removeBlock(removeHoldTarget);
    removeHoldTriggered = true;
    cancelRemoveHold(true, false);
    removalHold.setState({ active: false, progress: 1 });
    removalHoldResetTimeout = setTimeout(() => {
      removalHold.setState({ active: false, progress: 0 });
      removalHoldResetTimeout = null;
    }, 160);
  });
}
