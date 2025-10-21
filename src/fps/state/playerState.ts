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

export interface PlayerTransformState {
  position: Vector3Serialized;
  orientation: QuaternionSerialized;
  velocity: Vector3Serialized;
}

export interface PlayerMovementIntent {
  move: {
    x: number;
    z: number;
  };
  sprint: boolean;
  jump: boolean;
  crouch: boolean;
}

export interface PlayerInputState {
  pointerLocked: boolean;
  movementLocked: boolean;
  cameraLocked: boolean;
}

export interface PlayerModuleSnapshot<TState = Record<string, unknown>> {
  id: string;
  version: number;
  state: TState;
}

export interface PlayerState {
  version: number;
  transform: PlayerTransformState;
  movementIntent: PlayerMovementIntent;
  input: PlayerInputState;
  modules: Record<string, PlayerModuleSnapshot>;
}

export const PLAYER_STATE_VERSION = 1;

export function createEmptyPlayerState(): PlayerState {
  return {
    version: PLAYER_STATE_VERSION,
    transform: {
      position: serializeVector3(0, 0, 0),
      orientation: serializeQuaternion(0, 0, 0, 1),
      velocity: serializeVector3(0, 0, 0),
    },
    movementIntent: {
      move: { x: 0, z: 0 },
      sprint: false,
      jump: false,
      crouch: false,
    },
    input: {
      pointerLocked: false,
      movementLocked: false,
      cameraLocked: false,
    },
    modules: {},
  };
}

export function serializeVector3(x: number, y: number, z: number): Vector3Serialized {
  return {
    x: round(x),
    y: round(y),
    z: round(z),
  };
}

export function serializeQuaternion(
  x: number,
  y: number,
  z: number,
  w: number,
): QuaternionSerialized {
  return {
    x: round(x),
    y: round(y),
    z: round(z),
    w: round(w),
  };
}

function round(value: number) {
  return Number(value.toFixed(5));
}
