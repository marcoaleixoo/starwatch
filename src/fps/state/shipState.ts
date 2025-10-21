export interface Vector3Serialized {
  x: number;
  y: number;
  z: number;
}

export interface QuaternionSerialized {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface ColorSerialized {
  r: number;
  g: number;
  b: number;
}

export interface ShipWallState {
  id: string;
  position: Vector3Serialized;
  rotation: number; // degrees around Y
}

export interface ShipLampState {
  id: string;
  anchorSurfaceId: string;
  position: Vector3Serialized;
  rotation: QuaternionSerialized;
  color: ColorSerialized;
  local: {
    x: number;
    y: number;
    z: number;
  };
}

export interface ShipState {
  version: number;
  walls: Record<string, ShipWallState>;
  lamps: Record<string, ShipLampState>;
  removedStructuralLamps: Record<string, true>;
}

export const SHIP_STATE_VERSION = 1;

export function createEmptyShipState(): ShipState {
  return {
    version: SHIP_STATE_VERSION,
    walls: {},
    lamps: {},
    removedStructuralLamps: {},
  };
}

export function serializeVector3(x: number, y: number, z: number): Vector3Serialized {
  return { x: round(x), y: round(y), z: round(z) };
}

export function serializeQuaternion(
  x: number,
  y: number,
  z: number,
  w: number,
): QuaternionSerialized {
  return { x: round(x), y: round(y), z: round(z), w: round(w) };
}

export function serializeColor(r: number, g: number, b: number): ColorSerialized {
  return { r: clamp01(r), g: clamp01(g), b: clamp01(b) };
}

function round(value: number) {
  return Number(value.toFixed(5));
}

function clamp01(value: number) {
  if (value < 0) {
    return 0;
  }
  if (value > 1) {
    return 1;
  }
  return round(value);
}
