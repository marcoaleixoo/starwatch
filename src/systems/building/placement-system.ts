import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import type { Engine } from 'noa-engine';
import type { OverlayApi } from '../../hud/overlay';
import type { HotbarApi } from '../../player/hotbar';
import type { SectorResources } from '../../sector';
import type { BlockCatalog, BlockDefinition, BlockKind, BlockOrientation } from '../../blocks/types';
import { blockMetadataStore } from '../../blocks/metadata-store';
import type { EnergySystem } from '../energy';
import type { TerminalSystem } from '../terminals';

const ORIENTATIONS: BlockOrientation[] = ['north', 'east', 'south', 'west'];
const REMOVE_HOLD_DURATION_MS = 1000;

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
}

interface GhostResources {
  materialValid: StandardMaterial;
  materialInvalid: StandardMaterial;
  meshes: Map<BlockKind, Mesh>;
}

function createGhostResources(noa: Engine): GhostResources {
  const scene = noa.rendering.getScene();

  const materialValid = new StandardMaterial('placement-ghost-valid', scene);
  materialValid.diffuseColor = Color3.FromHexString('#4ade80').scale(0.6);
  materialValid.alpha = 0.35;
  materialValid.emissiveColor = Color3.FromHexString('#22c55e').scale(0.5);

  const materialInvalid = new StandardMaterial('placement-ghost-invalid', scene);
  materialInvalid.diffuseColor = Color3.FromHexString('#f87171').scale(0.7);
  materialInvalid.alpha = 0.35;
  materialInvalid.emissiveColor = Color3.FromHexString('#dc2626').scale(0.5);

  const meshes = new Map<BlockKind, Mesh>();

  const createBox = (key: BlockKind, height = 1) => {
    const mesh = MeshBuilder.CreateBox(`ghost-${key}`, { width: 1, depth: 1, height }, scene);
    mesh.isVisible = false;
    mesh.isPickable = false;
    mesh.alwaysSelectAsActiveMesh = true;
    mesh.rotationQuaternion = null;
    meshes.set(key, mesh);
  };

  createBox('starwatch:deck');
  createBox('starwatch:solar-panel');
  createBox('starwatch:battery');
  createBox('starwatch:hal-terminal');

  return {
    materialValid,
    materialInvalid,
    meshes,
  };
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
  return {
    position: [targeted.position[0], targeted.position[1], targeted.position[2]],
    normal: [targeted.normal[0], targeted.normal[1], targeted.normal[2]],
    adjacent: [targeted.adjacent[0], targeted.adjacent[1], targeted.adjacent[2]],
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

function setGhostTransform(mesh: Mesh, target: PlacementTarget, orientation: BlockOrientation): void {
  mesh.position.x = target.adjacent[0] + 0.5;
  mesh.position.y = target.adjacent[1] + 0.5;
  mesh.position.z = target.adjacent[2] + 0.5;
  mesh.rotation.y = orientationToRadians(orientation);
}

export function initializePlacementSystem({ noa, overlay, hotbar, sector, energy, terminals }: PlacementSystemDependencies): void {
  const ghost = createGhostResources(noa);
  let activeGhost: Mesh | null = null;
  let currentDefinition: BlockDefinition | null = null;
  const orientationByKind = new Map<BlockKind, BlockOrientation>();
  let lastHotbarIndex = hotbar.controller.getState().activeIndex;
  let removeHoldTarget: PlacementTarget | null = null;
  let removeHoldTriggered = false;
  let removeHoldActive = false;
  let removeHoldElapsed = 0;
  let removalHoldResetTimeout: ReturnType<typeof setTimeout> | null = null;

  const removalHold = overlay.removalHold;

  const updateActiveDefinition = () => {
    currentDefinition = getActiveBlockDefinition(hotbar, sector.starwatchBlocks);
    if (currentDefinition && !orientationByKind.has(currentDefinition.kind)) {
      orientationByKind.set(currentDefinition.kind, currentDefinition.defaultOrientation);
    }
  };

  hotbar.controller.subscribe(() => {
    const state = hotbar.controller.getState();
    if (state.activeIndex !== lastHotbarIndex) {
      lastHotbarIndex = state.activeIndex;
      updateActiveDefinition();
    }
  });

  updateActiveDefinition();

  const hideGhost = () => {
    if (activeGhost) {
      activeGhost.isVisible = false;
    }
    activeGhost = null;
  };

  const canPlaceAt = (position: [number, number, number]): boolean => {
    const blockId = noa.world.getBlockID(position[0], position[1], position[2]);
    return blockId === 0;
  };

  const placeBlock = (target: PlacementTarget, definition: BlockDefinition, orientation: BlockOrientation) => {
    const [x, y, z] = target.adjacent;
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
    const [x, y, z] = target.position;
    const existingId = noa.world.getBlockID(x, y, z);
    if (existingId !== 0) {
      const def = sector.starwatchBlocks.byId.get(existingId);
      noa.setBlock(0, x, y, z);
      if (def?.orientable) {
        blockMetadataStore.deleteOrientation({ kind: def.kind, x, y, z });
      }
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
    }
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
      return;
    }
    if (!currentDefinition) {
      return;
    }
    const target = getPlacementTarget(noa);
    if (!target) {
      return;
    }
    const orientation = orientationByKind.get(currentDefinition.kind) ?? currentDefinition.defaultOrientation;
    if (!canPlaceAt(target.adjacent)) {
      return;
    }
    placeBlock(target, currentDefinition, orientation);
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
    removeBlock(target);
  };

  noa.inputs.bind('build-place', ['Mouse3']);
  noa.inputs.bind('build-place-alt', ['Enter']);
  noa.inputs.bind('build-remove-hold', ['Mouse1']);
  noa.inputs.bind('build-remove-alt', ['KeyX']);
  noa.inputs.bind('build-rotate', ['KeyR']);

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

    const orientation = orientationByKind.get(definition.kind) ?? definition.defaultOrientation;
    const available = canPlaceAt(target.adjacent);

    const mesh = ghost.meshes.get(definition.kind) ?? null;
    if (!mesh) {
      hideGhost();
      return;
    }

    if (activeGhost && activeGhost !== mesh) {
      activeGhost.isVisible = false;
    }
    activeGhost = mesh;
    mesh.isVisible = true;
    mesh.material = available ? ghost.materialValid : ghost.materialInvalid;
    setGhostTransform(mesh, target, orientation);
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
