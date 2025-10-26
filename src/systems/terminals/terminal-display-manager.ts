import type { Engine } from 'noa-engine';
import type { Scene } from '@babylonjs/core/scene';
import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import type { OverlayApi } from '../../hud/overlay';
import type { EnergySystem } from '../energy';
import type { VoxelPosition } from '../energy/energy-network-manager';
import { blockMetadataStore } from '../../blocks/metadata-store';
import type { BlockKind, BlockOrientation } from '../../blocks/types';
import {
  BatteryTerminalDisplay,
} from './battery-terminal-display';
import {
  BaseTerminalDisplay,
  type BaseTerminalDisplayOptions,
} from './terminal-display';
import {
  HalTerminalDisplay,
} from './hal-terminal-display';
import {
  SolarTerminalDisplay,
} from './solar-terminal-display';
import type {
  BatteryTerminalData,
  HalTerminalData,
  SolarTerminalData,
  TerminalDisplayKind,
  TerminalPointerEvent,
} from './types';

type TerminalInstance = BaseTerminalDisplay<HalTerminalData | BatteryTerminalData | SolarTerminalData>;

interface TerminalManagerOptions {
  noa: Engine;
  energy: EnergySystem;
  overlay: OverlayApi;
}

const BLOCK_KIND_TO_DISPLAY: Record<BlockKind, TerminalDisplayKind | null> = {
  'starwatch:deck': null,
  'starwatch:solar-panel': 'solar-panel',
  'starwatch:battery': 'battery',
  'starwatch:hal-terminal': 'hal-terminal',
};

function makePositionKey(position: VoxelPosition, kind: TerminalDisplayKind): string {
  return `${kind}:${position[0]}:${position[1]}:${position[2]}`;
}

export class TerminalDisplayManager {
  private readonly noa: Engine;
  private readonly scene: Scene;
  private readonly energy: EnergySystem;
  private readonly overlay: OverlayApi;
  private readonly displays = new Map<string, TerminalInstance>();

  private disposeEnergyListener: (() => void) | null = null;
  private activeKey: string | null = null;

  private readonly handlePointerDown = (event: PointerEvent) => this.onPointerDown(event);
  private readonly handlePointerMove = (event: PointerEvent) => this.onPointerMove(event);
  private readonly handleKeyDown = (event: KeyboardEvent) => this.onKeyDown(event);

  constructor(options: TerminalManagerOptions) {
    this.noa = options.noa;
    this.energy = options.energy;
    this.overlay = options.overlay;
    this.scene = options.noa.rendering.getScene();

    this.disposeEnergyListener = this.energy.subscribe(() => {
      this.refreshAll();
    });
  }

  destroy(): void {
    this.disposeEnergyListener?.();
    this.disposeEnergyListener = null;
    this.endSession();
    for (const display of this.displays.values()) {
      display.dispose();
    }
    this.displays.clear();
  }

  registerBlock(kind: BlockKind, position: VoxelPosition): void {
    const displayKind = BLOCK_KIND_TO_DISPLAY[kind];
    if (!displayKind) {
      return;
    }
    const key = makePositionKey(position, displayKind);
    if (this.displays.has(key)) {
      return;
    }
    const orientation = this.resolveOrientation(kind, position);
    const display = this.createDisplay(displayKind, {
      position,
      orientation,
    });
    if (!display) {
      return;
    }
    for (const mesh of display.getMeshes()) {
      const rendering: any = this.noa.rendering;
      if (rendering && typeof rendering.addMeshToScene === 'function') {
        rendering.addMeshToScene(mesh, false);
      }
    }
    this.displays.set(key, display);
  }

  unregisterBlock(kind: BlockKind, position: VoxelPosition): void {
    const displayKind = BLOCK_KIND_TO_DISPLAY[kind];
    if (!displayKind) {
      return;
    }
    const key = makePositionKey(position, displayKind);
    if (this.activeKey === key) {
      this.endSession();
    }
    const display = this.displays.get(key);
    if (!display) {
      return;
    }
    display.dispose();
    this.displays.delete(key);
  }

  refreshAll(): void {
    for (const display of this.displays.values()) {
      display.refresh();
    }
  }

  tryOpenTerminal(position: VoxelPosition, kind: BlockKind): boolean {
    const displayKind = BLOCK_KIND_TO_DISPLAY[kind];
    if (!displayKind) {
      return false;
    }
    const key = makePositionKey(position, displayKind);
    const display = this.displays.get(key);
    if (!display) {
      return false;
    }
    this.beginSession(key, display);
    return true;
  }

  isCapturingInput(): boolean {
    return this.activeKey !== null;
  }

  private beginSession(key: string, display: TerminalInstance): void {
    if (this.activeKey === key) {
      return;
    }
    this.endSession();
    this.activeKey = key;
    display.setSessionActive(true);
    this.overlay.controller.setCapture(true);
    const canvas = this.noa.container.canvas;
    canvas.addEventListener('pointerdown', this.handlePointerDown, true);
    canvas.addEventListener('pointermove', this.handlePointerMove, true);
    window.addEventListener('keydown', this.handleKeyDown, true);
  }

  private endSession(): void {
    if (!this.activeKey) {
      return;
    }
    const canvas = this.noa.container.canvas;
    canvas.removeEventListener('pointerdown', this.handlePointerDown, true);
    canvas.removeEventListener('pointermove', this.handlePointerMove, true);
    window.removeEventListener('keydown', this.handleKeyDown, true);

    const display = this.displays.get(this.activeKey);
    if (display) {
      display.setSessionActive(false);
    }
    this.activeKey = null;
    this.overlay.controller.setCapture(false);
  }

  private resolveOrientation(kind: BlockKind, position: VoxelPosition): BlockOrientation {
    const stored = blockMetadataStore.getOrientation({ kind, x: position[0], y: position[1], z: position[2] });
    return stored ?? 'south';
  }

  private createDisplay(displayKind: TerminalDisplayKind, params: { position: VoxelPosition; orientation: BlockOrientation }): TerminalInstance | null {
    const { position, orientation } = params;
    const scene = this.scene;
    switch (displayKind) {
      case 'hal-terminal':
        return new HalTerminalDisplay(this.buildHalOptions(scene, position, orientation));
      case 'battery':
        return new BatteryTerminalDisplay(this.buildBatteryOptions(scene, position, orientation));
      case 'solar-panel':
        return new SolarTerminalDisplay(this.buildSolarOptions(scene, position, orientation));
      default:
        return null;
    }
  }

  private buildHalOptions(scene: Scene, position: VoxelPosition, orientation: BlockOrientation): BaseTerminalDisplayOptions<HalTerminalData> {
    return {
      scene,
      position,
      orientation,
      kind: 'hal-terminal',
      physicalWidth: 0.8,
      physicalHeight: 0.58,
      textureWidth: 1024,
      textureHeight: 768,
      elevation: 1.5,
      mountOffset: 0.52,
      title: 'HAL-9001 // CRT',
      accentColor: 'rgba(150, 220, 255, 0.9)',
      dataProvider: () => this.collectHalData(position),
      tabs: [
        { id: 'overview', label: 'Rede' },
        { id: 'power', label: 'Energia' },
        { id: 'devices', label: 'Inventário' },
      ],
    };
  }

  private buildBatteryOptions(scene: Scene, position: VoxelPosition, orientation: BlockOrientation): BaseTerminalDisplayOptions<BatteryTerminalData> {
    return {
      scene,
      position,
      orientation,
      kind: 'battery',
      physicalWidth: 0.48,
      physicalHeight: 0.32,
      textureWidth: 640,
      textureHeight: 420,
      elevation: 0.8,
      mountOffset: 0.51,
      title: 'BTR NODE',
      accentColor: 'rgba(120, 200, 255, 0.85)',
      dataProvider: () => this.collectBatteryData(position),
      tabs: [
        { id: 'status', label: 'Status' },
        { id: 'network', label: 'Rede' },
      ],
    };
  }

  private buildSolarOptions(scene: Scene, position: VoxelPosition, orientation: BlockOrientation): BaseTerminalDisplayOptions<SolarTerminalData> {
    return {
      scene,
      position,
      orientation,
      kind: 'solar-panel',
      physicalWidth: 0.52,
      physicalHeight: 0.34,
      textureWidth: 640,
      textureHeight: 420,
      elevation: 0.9,
      mountOffset: 0.51,
      title: 'SOL-LINK',
      accentColor: 'rgba(120, 205, 255, 0.85)',
      dataProvider: () => this.collectSolarData(position),
      tabs: [
        { id: 'status', label: 'Status' },
        { id: 'network', label: 'Rede' },
      ],
    };
  }

  private collectHalData(position: VoxelPosition): HalTerminalData {
    const terminal = this.energy.getTerminalSnapshot(position);
    const overview = terminal?.networkId != null ? this.energy.getNetworkOverview(terminal.networkId) : null;
    return { terminal, overview };
  }

  private collectBatteryData(position: VoxelPosition): BatteryTerminalData {
    const snapshot = this.energy.getBatterySnapshot(position);
    const overview = snapshot?.networkId != null ? this.energy.getNetworkOverview(snapshot.networkId) : null;
    return { snapshot, overview };
  }

  private collectSolarData(position: VoxelPosition): SolarTerminalData {
    const snapshot = this.energy.getSolarPanelSnapshot(position);
    const overview = snapshot?.networkId != null ? this.energy.getNetworkOverview(snapshot.networkId) : null;
    return { snapshot, overview };
  }

  private onPointerDown(event: PointerEvent): void {
    const activeDisplay = this.getActiveDisplay();
    if (!activeDisplay) {
      return;
    }
    const pick = this.pickOnDisplay(activeDisplay.display, event);
    if (!pick || !pick.hit) {
      return;
    }
    const coords = pick.getTextureCoordinates();
    if (!coords) {
      return;
    }
    const handled = activeDisplay.display.handlePointer({
      uv: { u: coords.x, v: coords.y },
      button: event.button,
    });
    if (handled) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  private onPointerMove(event: PointerEvent): void {
    // We only use pointer move to keep Babylon pointerX/Y updated for picks; no hover state for now.
    const activeDisplay = this.getActiveDisplay();
    if (!activeDisplay) {
      return;
    }
    this.pickOnDisplay(activeDisplay.display, event);
  }

  private onKeyDown(event: KeyboardEvent): void {
    const activeDisplay = this.getActiveDisplay();
    if (!activeDisplay) {
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      this.endSession();
      return;
    }
    const handled = activeDisplay.display.handleKeyDown(event);
    if (handled) {
      event.preventDefault();
    }
  }

  private getActiveDisplay(): { key: string; display: TerminalInstance } | null {
    if (!this.activeKey) {
      return null;
    }
    const display = this.displays.get(this.activeKey);
    if (!display) {
      return null;
    }
    return { key: this.activeKey, display };
  }

  private pickOnDisplay(display: TerminalInstance, event: PointerEvent) {
    const canvas = this.noa.container.canvas;
    const rect = canvas.getBoundingClientRect();
    const pointerX = event.clientX - rect.left;
    const pointerY = event.clientY - rect.top;
    return this.scene.pick(pointerX, pointerY, (mesh) => mesh === display.getMesh());
  }
}
