import type {
  AbstractMesh,
  Color3,
  GIRSM,
  Light,
  Mesh,
  RectAreaLight,
  ReflectiveShadowMap,
  ShadowGenerator,
  ShadowLight,
  Quaternion,
  Vector3,
} from "babylonjs";

export interface BuilderWall {
  mesh: Mesh;
  key: string;
  rotation: number; // degrees around Y
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
  color: Color3;
  anchorSurfaceId: string;
  local: { x: number; y: number; z: number };
  rotation: Quaternion;
}

export interface WallLampPlacement {
  mesh: AbstractMesh;
  position: Vector3;
  forward: Vector3;
  right: Vector3;
  up: Vector3;
  surfaceId: string;
  local: { x: number; y: number; z: number };
}
