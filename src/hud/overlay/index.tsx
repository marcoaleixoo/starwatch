import { createRoot, type Root } from 'react-dom/client';
import type { Engine } from 'noa-engine';
import { OverlayController } from './overlay-controller';
import { OverlayApp } from './OverlayApp';
import type { HotbarController } from '../../player/hotbar-controller';
import type { EnergySystem } from '../../systems/energy';
import type { SectorResources } from '../../sector';
import type { VoxelPosition } from '../../systems/energy/energy-network-manager';
import { LookAtTracker } from '../look-at-tracker';
import { RemovalHoldTracker } from '../removal-hold-tracker';

export interface OverlayApi {
  controller: OverlayController;
  removalHold: RemovalHoldTracker;
  destroy(): void;
}

export interface OverlayDependencies {
  hotbarController: HotbarController;
  sector: SectorResources;
  energy: EnergySystem;
}

export function initializeOverlay(noa: Engine, deps: OverlayDependencies): OverlayApi {
  const mountNode = document.getElementById('starwatch-overlay-root');
  if (!mountNode) {
    throw new Error('Host DOM node #starwatch-overlay-root não encontrado.');
  }

  const controller = new OverlayController();
  const root: Root = createRoot(mountNode);
  const lookAt = new LookAtTracker();
  const removalHold = new RemovalHoldTracker();

  controller.registerCaptureHandler((capture) => {
    const canvas = noa.container.canvas;
    if (capture) {
      noa.container.setPointerLock(false);
      if (typeof canvas.blur === 'function') {
        canvas.blur();
      }
    } else {
      noa.container.setPointerLock(true);
      if (typeof canvas.focus === 'function') {
        canvas.focus();
      }
    }
  });

  root.render(
    <OverlayApp
      controller={controller}
      hotbarController={deps.hotbarController}
      energy={deps.energy}
      lookAt={lookAt}
      removalHold={removalHold}
    />,
  );

  const panelId = deps.sector.starwatchBlocks.solarPanel.id;
  const batteryId = deps.sector.starwatchBlocks.battery.id;

  const emptyState = {
    kind: null,
    position: null,
    networkId: null,
    distance: 0,
  } as const;

  const updateLookAt = () => {
    if (controller.getState().captureInput) {
      lookAt.setState(emptyState);
      return;
    }

    const targeted = noa.targetedBlock;
    if (!targeted) {
      lookAt.setState(emptyState);
      return;
    }

    const blockId = targeted.blockID;
    if (blockId !== panelId && blockId !== batteryId) {
      lookAt.setState(emptyState);
      return;
    }

    const position: VoxelPosition = [
      targeted.position[0],
      targeted.position[1],
      targeted.position[2],
    ];

    const playerPos = noa.entities.getPositionData(noa.playerEntity)?.position;
    if (!playerPos) {
      lookAt.setState(emptyState);
      return;
    }

    const dx = playerPos[0] - (position[0] + 0.5);
    const dy = playerPos[1] - (position[1] + 0.5);
    const dz = playerPos[2] - (position[2] + 0.5);
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (distance > 3) {
      lookAt.setState(emptyState);
      return;
    }

    if (blockId === panelId) {
      const snapshot = deps.energy.getSolarPanelSnapshot(position);
      lookAt.setState({
        kind: 'solar-panel',
        position,
        networkId: snapshot?.networkId ?? null,
        distance,
      });
      return;
    }

    const batterySnapshot = deps.energy.getBatterySnapshot(position);
    lookAt.setState({
      kind: 'battery',
      position,
      networkId: batterySnapshot?.networkId ?? null,
      distance,
    });
  };

  noa.on('beforeRender', updateLookAt);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.code === 'KeyT' && event.altKey) {
      event.preventDefault();
      controller.toggleModal({ id: 'dummy' });
    }
  };

  window.addEventListener('keydown', handleKeyDown, { capture: true });

  const api: OverlayApi = {
    controller,
    removalHold,
    destroy() {
      window.removeEventListener('keydown', handleKeyDown, true);
      noa.off('beforeRender', updateLookAt);
      controller.reset();
      root.unmount();
    },
  };

  return api;
}
