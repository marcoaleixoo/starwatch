import type { Engine } from 'noa-engine';
import type { OverlayApi } from '../../hud/overlay';
import type { SectorResources } from '../../sector';
import type { TerminalSystem } from '../terminals';

interface UseSystemDependencies {
  noa: Engine;
  overlay: OverlayApi;
  sector: SectorResources;
  terminals: TerminalSystem;
}

const USE_RANGE = 3;
const USE_RANGE_SQ = USE_RANGE * USE_RANGE;

type TargetedBlock = {
  position: number[];
  blockID: number;
};

export function initializeUseSystem({ noa, overlay, sector, terminals }: UseSystemDependencies): void {
  const terminalId = sector.starwatchBlocks.halTerminal.id;
  const batteryId = sector.starwatchBlocks.battery.id;
  const panelId = sector.starwatchBlocks.solarPanel.id;

  const isInputCaptured = (): boolean => overlay.controller.getState().captureInput || terminals.isCapturingInput();

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

  const computeDistanceSq = (blockPosition: number[]): number => {
    const playerPos = noa.entities.getPositionData(noa.playerEntity)?.position;
    if (!playerPos) {
      return Number.POSITIVE_INFINITY;
    }
    const dx = playerPos[0] - (blockPosition[0] + 0.5);
    const dy = playerPos[1] - (blockPosition[1] + 0.5);
    const dz = playerPos[2] - (blockPosition[2] + 0.5);
    return dx * dx + dy * dy + dz * dz;
  };

  const handleUse = () => {
    if (isInputCaptured()) {
      return;
    }

    const targeted = getTargetedBlock();
    if (!targeted) {
      return;
    }

    if (targeted.blockID !== terminalId && targeted.blockID !== batteryId && targeted.blockID !== panelId) {
      return;
    }

    if (computeDistanceSq(targeted.position) > USE_RANGE_SQ) {
      return;
    }

    const blockDefinition = sector.starwatchBlocks.byId.get(targeted.blockID);
    if (!blockDefinition) {
      return;
    }

    const position: [number, number, number] = [
      targeted.position[0],
      targeted.position[1],
      targeted.position[2],
    ];

    terminals.openTerminal(blockDefinition.kind, position);
  };

  noa.inputs.bind('use', ['KeyE']);
  noa.inputs.down.on('use', handleUse);
  if (noa.inputs.up && typeof noa.inputs.up.on === 'function') {
    noa.inputs.up.on('use', () => {
      /* noop */
    });
  }
}
