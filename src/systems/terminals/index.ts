import type { Engine } from 'noa-engine';
import type { OverlayApi } from '../../hud/overlay';
import type { EnergySystem } from '../energy';
import type { BlockKind } from '../../blocks/types';
import type { VoxelPosition } from '../energy/energy-network-manager';
import { TerminalDisplayManager } from './terminal-display-manager';

export interface TerminalSystem {
  registerBlock(kind: BlockKind, position: VoxelPosition): void;
  unregisterBlock(kind: BlockKind, position: VoxelPosition): void;
  openTerminal(kind: BlockKind, position: VoxelPosition): boolean;
  closeActiveTerminal(): void;
  getActiveTerminal(): { kind: BlockKind; position: VoxelPosition } | null;
  isCapturingInput(): boolean;
  setHighlightedTerminal(target: { kind: BlockKind; position: VoxelPosition } | null): void;
  destroy(): void;
}

interface TerminalSystemOptions {
  noa: Engine;
  overlay: OverlayApi;
  energy: EnergySystem;
}

export function initializeTerminalSystem(options: TerminalSystemOptions): TerminalSystem {
  const manager = new TerminalDisplayManager({
    noa: options.noa,
    energy: options.energy,
    overlay: options.overlay,
  });

  for (const terminal of options.energy.listTerminals()) {
    manager.registerBlock('starwatch:hal-terminal', terminal.position);
  }
  for (const battery of options.energy.listBatteries()) {
    manager.registerBlock('starwatch:battery', battery.position);
  }
  for (const panel of options.energy.listSolarPanels()) {
    manager.registerBlock('starwatch:solar-panel', panel.position);
  }

  return {
    registerBlock(kind, position) {
      manager.registerBlock(kind, position);
    },
    unregisterBlock(kind, position) {
      manager.unregisterBlock(kind, position);
    },
    openTerminal(kind, position) {
      return manager.tryOpenTerminal(position, kind);
    },
    closeActiveTerminal() {
      manager.closeActiveTerminal();
    },
    getActiveTerminal() {
      return manager.getActiveTerminal();
    },
    isCapturingInput() {
      return manager.isCapturingInput();
    },
    setHighlightedTerminal(target) {
      manager.setHighlightedTerminal(target);
    },
    destroy() {
      manager.destroy();
    },
  };
}
