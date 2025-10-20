import type {
  AbstractMesh,
  GIRSM,
  Light,
  Mesh,
  RectAreaLight,
  ReflectiveShadowMap,
  ShadowGenerator,
  ShadowLight,
  Vector3,
} from "babylonjs";

export interface BuilderWall {
  mesh: Mesh;
  key: string;
}

export interface BuilderLamp {
  mesh: Mesh;
  light: ShadowLight;
  shadow: ShadowGenerator;
  areaLight?: RectAreaLight;
  fillLight?: Light;
  auxiliaryLights?: Light[];
  gi?: {
    rsm: ReflectiveShadowMap;
    solution: GIRSM;
  };
  key: string;
}

export interface WallLampPlacement {
  mesh: AbstractMesh;
  position: Vector3;
  forward: Vector3;
  right: Vector3;
  up: Vector3;
  local: { x: number; y: number };
}
