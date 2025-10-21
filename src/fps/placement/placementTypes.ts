import type { AbstractMesh, PointerInfo, Scene, UniversalCamera, Vector3 } from "babylonjs";
import type { ShadowNetwork } from "../lighting/shadowNetwork";
import type { GhostHost } from "./ghosts";
import type { SurfaceRegistry } from "./surfaces/surfaceRegistry";
import type { PlacementSolver } from "./placementSolver";
import type { ShipLampState, ShipWallState } from "../state/shipState";

export interface ShipStateActions {
  upsertWall(wall: ShipWallState): void;
  removeWall(wallId: string): void;
  upsertLamp(lamp: ShipLampState): void;
  removeLamp(lampId: string): void;
}

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
  shipState: ShipStateActions;
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
