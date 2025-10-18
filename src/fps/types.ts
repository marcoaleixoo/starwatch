import type { Mesh, PointLight, ShadowGenerator, SpotLight } from "babylonjs";

export type PlacementMode = "wall" | "lamp";

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
