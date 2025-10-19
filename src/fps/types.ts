import type { AbstractMesh, Mesh, PointLight, ShadowGenerator, SpotLight, Vector3 } from "babylonjs";

export type PlacementMode = "wall" | "lamp" | "delete";

export interface BuilderWall {
  mesh: Mesh;
  key: string;
}

export interface BuilderLamp {
  mesh: Mesh;
  light: SpotLight;
  shadow: ShadowGenerator;
  fillLight?: PointLight;
  key: string;
}

export interface PlacementState {
  mode: PlacementMode;
  rotation: number;
  lampColorIndex: number;
}

export interface WallLampPlacement {
  mesh: AbstractMesh;
  position: Vector3;
  forward: Vector3;
  right: Vector3;
  up: Vector3;
  local: { x: number; y: number };
}
