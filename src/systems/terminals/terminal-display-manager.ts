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

interface DisplayEntry {
  display: TerminalInstance;
  blockKind: BlockKind;
  position: VoxelPosition;
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
  private readonly displays = new Map<string, DisplayEntry>();

  private disposeEnergyListener: (() => void) | null = null;
  private activeKey: string | null = null;
  private activeContext: { blockKind: BlockKind; position: VoxelPosition } | null = null;
  private highlightedKey: string | null = null;

  private readonly handlePointerDown = (event: PointerEvent) => this.onPointerDown(event);
  private readonly handleKeyDown = (event: KeyboardEvent) => this.onKeyDown(event);
  private readonly handleAimUpdate = () => this.updateAimHover();
  private readonly handleFireDown = (event: MouseEvent) => this.onFireDown(event);
  private detachFireListener: (() => void) | null = null;

  constructor(options: TerminalManagerOptions) {
    this.noa = options.noa;
    this.energy = options.energy;
    this.overlay = options.overlay;
    this.scene = options.noa.rendering.getScene();

    this.disposeEnergyListener = this.energy.subscribe(() => {
      this.refreshAll();
    });
    this.noa.on('beforeRender', this.handleAimUpdate);
    const fireDown = this.noa.inputs?.down as { on?: (action: string, handler: (...args: any[]) => void) => void; off?: (action: string, handler: (...args: any[]) => void) => void } | undefined;
    if (fireDown?.on) {
      fireDown.on('fire', this.handleFireDown);
      this.detachFireListener = () => {
        fireDown.off?.('fire', this.handleFireDown);
      };
    }
  }

  destroy(): void {
    this.disposeEnergyListener?.();
    this.disposeEnergyListener = null;
    this.noa.off('beforeRender', this.handleAimUpdate);
    this.detachFireListener?.();
    this.detachFireListener = null;
    this.endSession();
    this.overlay.controller.setPointerPassthrough(false);
    this.setHighlightKey(null);
    for (const entry of this.displays.values()) {
      entry.display.dispose();
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
    this.displays.set(key, {
      display,
      blockKind: kind,
      position: [position[0], position[1], position[2]] as VoxelPosition,
    });
    if (this.highlightedKey === key) {
      display.setHighlighted(true);
    }
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
    const entry = this.displays.get(key);
    if (!entry) {
      return;
    }
    entry.display.dispose();
    this.displays.delete(key);
    if (this.highlightedKey === key) {
      this.highlightedKey = null;
    }
  }

  refreshAll(): void {
    for (const entry of this.displays.values()) {
      entry.display.refresh();
    }
  }

  tryOpenTerminal(position: VoxelPosition, kind: BlockKind): boolean {
    const displayKind = BLOCK_KIND_TO_DISPLAY[kind];
    if (!displayKind) {
      return false;
    }
    const key = makePositionKey(position, displayKind);
    const entry = this.displays.get(key);
    if (!entry) {
      return false;
    }
    this.setHighlightKey(key);
    this.beginSession(key, entry);
    return true;
  }

  isCapturingInput(): boolean {
    return this.activeKey !== null;
  }

  closeActiveTerminal(): void {
    this.endSession();
  }

  setHighlightedTerminal(target: { kind: BlockKind; position: VoxelPosition } | null): void {
    if (!target) {
      this.setHighlightKey(null);
      return;
    }
    const displayKind = BLOCK_KIND_TO_DISPLAY[target.kind];
    if (!displayKind) {
      this.setHighlightKey(null);
      return;
    }
    const key = makePositionKey(target.position, displayKind);
    this.setHighlightKey(key);
  }

  getActiveTerminal(): { kind: BlockKind; position: VoxelPosition } | null {
    if (!this.activeContext) {
      return null;
    }
    return {
      kind: this.activeContext.blockKind,
      position: [
        this.activeContext.position[0],
        this.activeContext.position[1],
        this.activeContext.position[2],
      ] as VoxelPosition,
    };
  }

  private beginSession(key: string, entry: DisplayEntry): void {
    if (this.activeKey === key) {
      entry.display.setSessionActive(true);
      this.overlay.controller.setPointerPassthrough(true);
      this.overlay.controller.setCapture(true);
      this.activeContext = {
        blockKind: entry.blockKind,
        position: [
          entry.position[0],
          entry.position[1],
          entry.position[2],
        ] as VoxelPosition,
      };
      this.setHighlightKey(key);
      entry.display.setHoverByUV(this.pickCrosshairUV(entry.display));
      return;
    }
    this.endSession();
    this.activeKey = key;
    entry.display.setSessionActive(true);
    this.overlay.controller.setPointerPassthrough(true);
    this.overlay.controller.setCapture(true);
    this.activeContext = {
      blockKind: entry.blockKind,
      position: [
        entry.position[0],
        entry.position[1],
        entry.position[2],
      ] as VoxelPosition,
    };
    this.setHighlightKey(key);
    entry.display.setHoverByUV(this.pickCrosshairUV(entry.display));
    const canvas = this.noa.container.canvas;
    canvas.addEventListener('pointerdown', this.handlePointerDown, true);
    window.addEventListener('keydown', this.handleKeyDown, true);
  }

  private endSession(): void {
    if (!this.activeKey) {
      return;
    }
    const canvas = this.noa.container.canvas;
    canvas.removeEventListener('pointerdown', this.handlePointerDown, true);
    window.removeEventListener('keydown', this.handleKeyDown, true);

    const entry = this.displays.get(this.activeKey);
    if (entry) {
      entry.display.setHoverByUV(null);
      entry.display.setSessionActive(false);
    }
    this.activeKey = null;
    this.activeContext = null;
    this.overlay.controller.setCapture(false);
    this.overlay.controller.setPointerPassthrough(false);
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
    const activeEntry = this.getActiveEntry();
    if (!activeEntry) {
      return;
    }
    const uv = this.pickCrosshairUV(activeEntry.entry.display);
    if (!uv) {
      activeEntry.entry.display.setHoverByUV(null);
      return;
    }
    const handled = activeEntry.entry.display.handlePointer({
      uv,
      button: event.button,
    });
    if (handled) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  private onKeyDown(event: KeyboardEvent): void {
    const activeEntry = this.getActiveEntry();
    if (!activeEntry) {
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      this.endSession();
      return;
    }
    const handled = activeEntry.entry.display.handleKeyDown(event);
    if (handled) {
      event.preventDefault();
    }
  }

  private getActiveEntry(): { key: string; entry: DisplayEntry } | null {
    if (!this.activeKey) {
      return null;
    }
    const entry = this.displays.get(this.activeKey);
    if (!entry) {
      return null;
    }
    return { key: this.activeKey, entry };
  }

  private pickCrosshairUV(display: TerminalInstance): { u: number; v: number } | null {
    const canvas = this.noa.container.canvas;
    const rect = canvas.getBoundingClientRect();
    const pointerX = rect.width / 2;
    const pointerY = rect.height / 2;
    const pick = this.scene.pick(pointerX, pointerY, (mesh) => mesh === display.getMesh());
    if (!pick || !pick.hit) {
      return null;
    }
    const coords = pick.getTextureCoordinates();
    if (!coords) {
      return null;
    }
    return { u: coords.x, v: coords.y };
  }

  private setHighlightKey(key: string | null): void {
    if (this.highlightedKey === key) {
      if (key) {
        const entry = this.displays.get(key);
        entry?.display.setHighlighted(true);
      }
      return;
    }
    if (this.highlightedKey) {
      const previous = this.displays.get(this.highlightedKey);
      if (previous && this.highlightedKey !== this.activeKey) {
        previous.display.setHighlighted(false);
      } else if (!previous) {
        // nothing to do
      }
    }
    this.highlightedKey = null;
    if (!key) {
      return;
    }
    const entry = this.displays.get(key);
    if (!entry) {
      return;
    }
    entry.display.setHighlighted(true);
    this.highlightedKey = key;
  }

  private updateAimHover(): void {
    if (!this.activeKey) {
      return;
    }
    const entry = this.displays.get(this.activeKey);
    if (!entry) {
      return;
    }
    const uv = this.pickCrosshairUV(entry.display);
    entry.display.setHoverByUV(uv);
  }

  private onFireDown(event: MouseEvent): void {
    if (!this.activeKey) {
      return;
    }
    if (!this.overlay.controller.getState().captureInput) {
      return;
    }
    const entry = this.displays.get(this.activeKey);
    if (!entry) {
      return;
    }
    const uv = this.pickCrosshairUV(entry.display);
    entry.display.setHoverByUV(uv);
    if (!uv) {
      return;
    }
    const handled = entry.display.handlePointer({
      uv,
      button: 0,
    });
    if (handled) {
      event.preventDefault?.();
      event.stopPropagation?.();
    }
  }
}
