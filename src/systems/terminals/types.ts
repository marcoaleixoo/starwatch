import type { Scene } from '@babylonjs/core/scene';
import type { VoxelPosition } from '../energy/energy-network-manager';
import type { BlockOrientation } from '../../blocks/types';
import type { BatterySnapshot, NetworkOverview, SolarPanelSnapshot, TerminalSnapshot } from '../energy';

export type TerminalDisplayKind = 'hal-terminal' | 'battery' | 'solar-panel';

export interface TerminalDisplayKey {
  kind: TerminalDisplayKind;
  position: VoxelPosition;
}

export interface TerminalTab {
  id: string;
  label: string;
}

export interface TerminalPointerTarget {
  tabIndex: number | null;
}

export interface TerminalPointerEvent {
  uv: { u: number; v: number };
  button: number;
}

export interface TerminalDisplayDependencies {
  scene: Scene;
  position: VoxelPosition;
  orientation: BlockOrientation;
  kind: TerminalDisplayKind;
}

export interface HalTerminalData {
  terminal: TerminalSnapshot | null;
  overview: NetworkOverview | null;
}

export interface BatteryTerminalData {
  snapshot: BatterySnapshot | null;
  overview: NetworkOverview | null;
}

export interface SolarTerminalData {
  snapshot: SolarPanelSnapshot | null;
  overview: NetworkOverview | null;
}

export type TerminalDisplayData = HalTerminalData | BatteryTerminalData | SolarTerminalData;
