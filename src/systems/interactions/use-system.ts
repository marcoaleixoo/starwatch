import type { Engine } from 'noa-engine';
import type { OverlayApi } from '../../hud/overlay';
import type { SectorResources } from '../../sector';
import type { BlockKind } from '../../blocks/types';
import type { TerminalSystem } from '../terminals';
import { TERMINAL_INTERACTION_OPTIONS } from '../../config/terminal-options';

interface UseSystemDependencies {
  noa: Engine;
  overlay: OverlayApi;
  sector: SectorResources;
  terminals: TerminalSystem;
}

const {
  useRange,
  proximityRange,
  disengageRange,
  disengageGraceTicks,
} = TERMINAL_INTERACTION_OPTIONS;
const USE_RANGE_SQ = useRange * useRange;
const PROXIMITY_RANGE_SQ = proximityRange * proximityRange;
const DISENGAGE_RANGE_SQ = disengageRange * disengageRange;

type TargetedBlock = {
  position: number[];
  blockID: number;
};

export function initializeUseSystem({ noa, overlay, sector, terminals }: UseSystemDependencies): void {
  const terminalId = sector.starwatchBlocks.halTerminal.id;
  const batteryId = sector.starwatchBlocks.battery.id;
  const panelId = sector.starwatchBlocks.solarPanel.id;
  const interactiveIds = new Set([terminalId, batteryId, panelId]);
  const interactivePriority = new Map([
    [terminalId, 0],
    [batteryId, 1],
    [panelId, 2],
  ]);

  let highlighted: { position: [number, number, number]; blockID: number; kind: BlockKind } | null = null;
  let disengageBuffer = 0;

  const isInputCaptured = (): boolean => overlay.controller.getState().captureInput || terminals.isCapturingInput();

  const getPlayerPosition = (): number[] | null => {
    const data = noa.entities.getPositionData(noa.playerEntity);
    return data?.position ?? null;
  };

  const distanceSqToBlock = (playerPos: number[], blockPosition: number[]): number => {
    const dx = playerPos[0] - (blockPosition[0] + 0.5);
    const dy = playerPos[1] - (blockPosition[1] + 0.5);
    const dz = playerPos[2] - (blockPosition[2] + 0.5);
    return dx * dx + dy * dy + dz * dz;
  };

  const getTargetedBlock = (): TargetedBlock | null => {
    const targeted = noa.targetedBlock;
    if (!targeted) {
      return null;
    }
    return {
      position: targeted.position,
      blockID: targeted.blockID,
    };
  };

  const findNearestInteractive = (
    playerPos: number[],
    maxDistance: number,
    maxDistanceSq: number,
  ): TargetedBlock | null => {
    let best: { position: [number, number, number]; blockID: number; distanceSq: number; priority: number } | null = null;

    const radius = Math.ceil(maxDistance);
    const baseX = Math.floor(playerPos[0]);
    const baseY = Math.floor(playerPos[1]);
    const baseZ = Math.floor(playerPos[2]);

    const minX = baseX - radius;
    const maxX = baseX + radius;
    const minY = baseY - 1;
    const maxY = baseY + 1;
    const minZ = baseZ - radius;
    const maxZ = baseZ + radius;

    for (let x = minX; x <= maxX; x += 1) {
      for (let y = minY; y <= maxY; y += 1) {
        for (let z = minZ; z <= maxZ; z += 1) {
          const blockID = noa.world.getBlockID(x, y, z);
          if (!interactiveIds.has(blockID)) {
            continue;
          }
          const candidatePosition: [number, number, number] = [x, y, z];
          const distanceSq = distanceSqToBlock(playerPos, candidatePosition);
          if (distanceSq > maxDistanceSq) {
            continue;
          }
          const priority = interactivePriority.get(blockID) ?? interactivePriority.size;
          if (
            !best
            || priority < best.priority
            || (priority === best.priority && distanceSq < best.distanceSq)
          ) {
            best = {
              position: candidatePosition,
              blockID,
              distanceSq,
              priority,
            };
          }
        }
      }
    }

    return best
      ? {
          position: best.position,
          blockID: best.blockID,
        }
      : null;
  };

  const sameLocation = (a: [number, number, number], b: [number, number, number]): boolean => (
    a[0] === b[0] && a[1] === b[1] && a[2] === b[2]
  );

  const updateHighlight = (candidate: TargetedBlock | null): void => {
    if (!candidate) {
      if (!highlighted) {
        return;
      }
      highlighted = null;
      terminals.setHighlightedTerminal(null);
      return;
    }
    const definition = sector.starwatchBlocks.byId.get(candidate.blockID);
    if (!definition) {
      if (highlighted) {
        highlighted = null;
        terminals.setHighlightedTerminal(null);
      }
      return;
    }
    const nextPosition: [number, number, number] = [
      candidate.position[0],
      candidate.position[1],
      candidate.position[2],
    ];
    if (
      highlighted
      && highlighted.blockID === candidate.blockID
      && highlighted.kind === definition.kind
      && sameLocation(highlighted.position, nextPosition)
    ) {
      return;
    }
    highlighted = {
      position: nextPosition,
      blockID: candidate.blockID,
      kind: definition.kind,
    };
    terminals.setHighlightedTerminal({
      kind: definition.kind,
      position: nextPosition,
    });
  };

  const handleUse = () => {
    if (isInputCaptured()) {
      return;
    }

    const playerPos = getPlayerPosition();
    if (!playerPos) {
      return;
    }

    let target: TargetedBlock | null = getTargetedBlock();
    if (!target || !interactiveIds.has(target.blockID)) {
      target = highlighted
        ? {
            position: [
              highlighted.position[0],
              highlighted.position[1],
              highlighted.position[2],
            ],
            blockID: highlighted.blockID,
          }
        : null;
    }

    if (!target) {
      const nearest = findNearestInteractive(playerPos, useRange, USE_RANGE_SQ);
      if (nearest) {
        target = nearest;
      }
    }

    if (!target) {
      return;
    }

    if (!interactiveIds.has(target.blockID)) {
      return;
    }

    if (distanceSqToBlock(playerPos, target.position) > USE_RANGE_SQ) {
      return;
    }

    const blockDefinition = sector.starwatchBlocks.byId.get(target.blockID);
    if (!blockDefinition) {
      return;
    }

    const position: [number, number, number] = [
      target.position[0],
      target.position[1],
      target.position[2],
    ];

    terminals.openTerminal(blockDefinition.kind, position);
  };

  const handleCancel = () => {
    if (!terminals.isCapturingInput()) {
      return;
    }
    terminals.closeActiveTerminal();
  };

  const handleProximityTick = () => {
    const playerPos = getPlayerPosition();
    if (!playerPos) {
      if (!terminals.isCapturingInput()) {
        updateHighlight(null);
      }
      return;
    }

    if (terminals.isCapturingInput()) {
      const active = terminals.getActiveTerminal();
      if (!active) {
        disengageBuffer = 0;
        return;
      }
      const distanceSq = distanceSqToBlock(playerPos, active.position);
      if (distanceSq > DISENGAGE_RANGE_SQ) {
        disengageBuffer += 1;
        if (disengageBuffer >= disengageGraceTicks) {
          terminals.closeActiveTerminal();
          disengageBuffer = 0;
        }
      } else {
        disengageBuffer = 0;
      }
      return;
    }

    disengageBuffer = 0;

    if (overlay.controller.getState().captureInput) {
      updateHighlight(null);
      return;
    }

    const nearby = findNearestInteractive(playerPos, proximityRange, PROXIMITY_RANGE_SQ);
    updateHighlight(nearby);

    if (!nearby) {
      return;
    }

    const definition = sector.starwatchBlocks.byId.get(nearby.blockID);
    if (!definition) {
      return;
    }

    terminals.openTerminal(
      definition.kind,
      [
        nearby.position[0],
        nearby.position[1],
        nearby.position[2],
      ] as [number, number, number],
    );
  };

  noa.inputs.bind('use', ['KeyE']);
  noa.inputs.down.on('use', handleUse);
  noa.inputs.bind('terminal-cancel', ['Escape']);
  noa.inputs.down.on('terminal-cancel', handleCancel);
  if (noa.inputs.up && typeof noa.inputs.up.on === 'function') {
    noa.inputs.up.on('use', () => {
      /* noop */
    });
    noa.inputs.up.on('terminal-cancel', () => {
      /* noop */
    });
  }

  noa.on('tick', handleProximityTick);
}
