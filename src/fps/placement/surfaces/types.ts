import type { AbstractMesh, PickingInfo, Vector3 } from "babylonjs";

export type PlacementMode = "wall-mount" | "floor-mount" | "ceiling-mount";

export interface PlacementFrame {
  surfaceId: string;
  mesh: AbstractMesh;
  mode: PlacementMode;
  position: Vector3;
  forward: Vector3;
  up: Vector3;
  right: Vector3;
  local: {
    x: number;
    y: number;
    z: number;
  };
}

export interface WallMountConstraints {
  type: "wall-mount";
  grid: number;
  itemSize: {
    width: number;
    height: number;
    depth: number;
  };
  offset: number;
  boundsPadding: {
    horizontal: number;
    vertical: number;
  };
}

export interface FloorMountConstraints {
  type: "floor-mount";
  grid: number;
  itemSize: {
    width: number;
    depth: number;
    height: number;
  };
  heightOffset: number;
}

export type PlacementConstraints = WallMountConstraints | FloorMountConstraints;

export interface SurfaceSampleRequest {
  mode: PlacementMode;
  constraints: PlacementConstraints;
  pick: PickingInfo;
}
