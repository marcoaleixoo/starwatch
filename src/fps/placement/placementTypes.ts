import type { AbstractMesh, PointerInfo, Scene, UniversalCamera, Vector3 } from "babylonjs";
import type { ShadowNetwork } from "../lighting/shadowNetwork";
import type { GhostHost } from "./ghosts";
import type { SurfaceRegistry } from "./surfaces/surfaceRegistry";
import type { PlacementSolver } from "./placementSolver";

export interface ToolMetadata {
  toolId: string;
  key: string;
}

export interface ToolRuntimeContext {
  scene: Scene;
  camera: UniversalCamera;
  canvas: HTMLCanvasElement;
  shadowNetwork: ShadowNetwork;
  ghost: GhostHost;
  surfaceRegistry: SurfaceRegistry;
  placementSolver: PlacementSolver;
  withinRange(point?: Vector3 | null): boolean;
  requestPointerLock(): void;
  highlight(mesh?: AbstractMesh | null): void;
  removeMesh(mesh?: AbstractMesh | null): boolean;
}

export interface PlacementToolInstance {
  id: string;
  onActivate?(): void;
  onDeactivate?(): void;
  onPointerMove?(info: PointerInfo): void;
  onPointerDown?(info: PointerInfo): void;
  onPointerUp?(info: PointerInfo): void;
  onPointerLockChange?(isLocked: boolean): void;
  onKeyDown?(event: KeyboardEvent): void;
  onKeyUp?(event: KeyboardEvent): void;
  remove?(metadata: ToolMetadata, mesh: AbstractMesh): boolean;
  dispose?(): void;
}

export interface PlacementToolDefinition {
  id: string;
  label: string;
  icon: string;
  hotkey: string;
  create(context: ToolRuntimeContext, bootstrap?: unknown): PlacementToolInstance;
}

export interface PlacementState {
  activeToolId: string;
}
