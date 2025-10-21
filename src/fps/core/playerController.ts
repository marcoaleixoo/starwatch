import { KeyboardEventTypes, Quaternion, UniversalCamera, Vector3, type Scene } from "babylonjs";
import { CAMERA_SETTINGS, INPUT_KEYS } from "../constants";
import type { PlayerStore } from "../state/playerStore";
import type {
  PlayerState,
  PlayerTransformState,
  QuaternionSerialized,
  Vector3Serialized,
} from "../state/playerState";
import { serializeQuaternion, serializeVector3 } from "../state/playerState";

const KEYBOARD_MOVE_MAP: Record<string, { axis: "x" | "z"; direction: number }> = {
  KeyW: { axis: "z", direction: 1 },
  ArrowUp: { axis: "z", direction: 1 },
  KeyS: { axis: "z", direction: -1 },
  ArrowDown: { axis: "z", direction: -1 },
  KeyA: { axis: "x", direction: -1 },
  ArrowLeft: { axis: "x", direction: -1 },
  KeyD: { axis: "x", direction: 1 },
  ArrowRight: { axis: "x", direction: 1 },
};

const CROUCH_KEYS = new Set(["ControlLeft", "ControlRight"]);
const JUMP_KEYS = new Set(["Space"]);

interface PlayerControllerOptions {
  scene: Scene;
  canvas: HTMLCanvasElement;
  store: PlayerStore;
}

export interface PlayerController {
  camera: UniversalCamera;
  dispose(): void;
  teleport(position: Vector3Serialized, orientation?: QuaternionSerialized): void;
  setCutsceneLock(locked: boolean): void;
}

export function createPlayerController(options: PlayerControllerOptions): PlayerController {
  const { scene, canvas, store } = options;
  const engine = scene.getEngine();
  const initialState = store.getSnapshot();

  const camera = new UniversalCamera(
    "fpCam",
    new Vector3(
      initialState.transform.position.x,
      initialState.transform.position.y || CAMERA_SETTINGS.eyeLevel,
      initialState.transform.position.z,
    ),
    scene,
  );
  camera.minZ = CAMERA_SETTINGS.minZ;
  camera.maxZ = CAMERA_SETTINGS.maxZ;
  camera.speed = CAMERA_SETTINGS.speed;
  camera.angularSensibility = CAMERA_SETTINGS.angularSensibility;
  camera.inertia = CAMERA_SETTINGS.inertia;
  camera.applyGravity = true;
  camera.checkCollisions = true;
  camera.ellipsoid = new Vector3(
    CAMERA_SETTINGS.ellipsoid.x,
    CAMERA_SETTINGS.ellipsoid.y,
    CAMERA_SETTINGS.ellipsoid.z,
  );
  camera.ellipsoidOffset = new Vector3(
    CAMERA_SETTINGS.ellipsoidOffset.x,
    CAMERA_SETTINGS.ellipsoidOffset.y,
    CAMERA_SETTINGS.ellipsoidOffset.z,
  );
  camera.keysUp.push(INPUT_KEYS.move.forward);
  camera.keysLeft.push(INPUT_KEYS.move.left);
  camera.keysDown.push(INPUT_KEYS.move.backward);
  camera.keysRight.push(INPUT_KEYS.move.right);

  const initialQuaternion = new Quaternion(
    initialState.transform.orientation.x,
    initialState.transform.orientation.y,
    initialState.transform.orientation.z,
    initialState.transform.orientation.w,
  );
  applyQuaternionToCamera(camera, initialQuaternion);

  let controlsAttached = false;
  const attachControls = () => {
    if (controlsAttached) {
      return;
    }
    camera.attachControl(canvas, true);
    controlsAttached = true;
  };
  const detachControls = () => {
    if (!controlsAttached) {
      return;
    }
    camera.detachControl();
    controlsAttached = false;
    if (document.pointerLockElement === canvas) {
      try {
        document.exitPointerLock();
      } catch {
        // ignore pointer lock failures
      }
    }
  };

  if (!initialState.input.cameraLocked && !initialState.input.movementLocked) {
    attachControls();
  }

  const actions = store.getActions();
  let isPushingFromCamera = false;
  let lastTransformSignature = transformSignature(initialState.transform);
  let lastFramePosition = camera.position.clone();

  const pointerLockListener = () => {
    const pointerLocked = document.pointerLockElement === canvas;
    actions.patchInput({ pointerLocked });
  };
  document.addEventListener("pointerlockchange", pointerLockListener);

  const pressedKeys = new Set<string>();
  let lastMovementIntent = initialState.movementIntent;

  const updateMovementIntent = () => {
    const move = { x: 0, z: 0 };
    pressedKeys.forEach((code) => {
      const mapping = KEYBOARD_MOVE_MAP[code];
      if (!mapping) {
        return;
      }
      move[mapping.axis] += mapping.direction;
    });

    const length = Math.hypot(move.x, move.z);
    if (length > 1e-3) {
      move.x /= Math.max(1, length);
      move.z /= Math.max(1, length);
    } else {
      move.x = 0;
      move.z = 0;
    }

    const sprint = INPUT_KEYS.sprint.some((code) => pressedKeys.has(code));
    const jump = Array.from(JUMP_KEYS).some((code) => pressedKeys.has(code));
    const crouch = Array.from(CROUCH_KEYS).some((code) => pressedKeys.has(code));

    if (
      almostEqual(move.x, lastMovementIntent.move.x) &&
      almostEqual(move.z, lastMovementIntent.move.z) &&
      sprint === lastMovementIntent.sprint &&
      jump === lastMovementIntent.jump &&
      crouch === lastMovementIntent.crouch
    ) {
      return;
    }

    const next = {
      move,
      sprint,
      jump,
      crouch,
    };
    actions.setMovementIntent({
      move,
      sprint,
      jump,
      crouch,
    });
    lastMovementIntent = next;
  };

  const keyboardObserver = scene.onKeyboardObservable.add((info) => {
    const event = info.event;
    if (info.type === KeyboardEventTypes.KEYDOWN) {
      pressedKeys.add(event.code);
    } else if (info.type === KeyboardEventTypes.KEYUP) {
      pressedKeys.delete(event.code);
    }
    updateMovementIntent();
  });

  const applyInputState = (state: PlayerState) => {
    const { cameraLocked, movementLocked } = state.input;
    if (cameraLocked || movementLocked) {
      detachControls();
    } else {
      attachControls();
    }
  };

  const subscription = store.subscribe((state) => {
    applyInputState(state);
    lastMovementIntent = state.movementIntent;

    const signature = transformSignature(state.transform);
    if (isPushingFromCamera) {
      lastTransformSignature = signature;
      return;
    }
    if (signature === lastTransformSignature) {
      return;
    }
    lastTransformSignature = signature;
    applyTransformToCamera(camera, state.transform);
    lastFramePosition = camera.position.clone();
  });

  const transformObserver = scene.onBeforeRenderObservable.add(() => {
    const deltaSeconds = engine.getDeltaTime() / 1000;
    const currentPosition = camera.position;
    const velocity = deltaSeconds > 1e-4 ? currentPosition.subtract(lastFramePosition).scale(1 / deltaSeconds) : Vector3.Zero();
    lastFramePosition = currentPosition.clone();

    if (Math.abs(camera.rotation.z) > 1e-4) {
      camera.rotation.z = 0;
    }
    const quaternion = Quaternion.RotationYawPitchRoll(
      camera.rotation.y,
      camera.rotation.x,
      0,
    );

    const nextTransform: PlayerTransformState = {
      position: serializeVector3(currentPosition.x, currentPosition.y, currentPosition.z),
      orientation: serializeQuaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w),
      velocity: serializeVector3(velocity.x, velocity.y, velocity.z),
    };

    const signature = transformSignature(nextTransform);
    if (signature === lastTransformSignature) {
      return;
    }
    isPushingFromCamera = true;
    actions.setTransform(nextTransform);
    isPushingFromCamera = false;
    lastTransformSignature = signature;
  });

  const teleport = (position: Vector3Serialized, orientation?: QuaternionSerialized) => {
    const quaternion = orientation
      ? new Quaternion(orientation.x, orientation.y, orientation.z, orientation.w)
      : Quaternion.RotationYawPitchRoll(camera.rotation.y, camera.rotation.x, camera.rotation.z);

    applyTransformToCamera(camera, {
      position,
      orientation: orientation
        ? orientation
        : {
            x: quaternion.x,
            y: quaternion.y,
            z: quaternion.z,
            w: quaternion.w,
          },
      velocity: serializeVector3(0, 0, 0),
    });
    lastFramePosition = camera.position.clone();
    const sanitized = Quaternion.RotationYawPitchRoll(camera.rotation.y, camera.rotation.x, 0);
    const transform: PlayerTransformState = {
      position: serializeVector3(position.x, position.y, position.z),
      orientation: serializeQuaternion(sanitized.x, sanitized.y, sanitized.z, sanitized.w),
      velocity: serializeVector3(0, 0, 0),
    };
    isPushingFromCamera = true;
    actions.setTransform(transform);
    isPushingFromCamera = false;
    lastTransformSignature = transformSignature(transform);
  };

  const setCutsceneLock = (locked: boolean) => {
    actions.patchInput({
      movementLocked: locked,
      cameraLocked: locked,
    });
    if (locked) {
      detachControls();
    } else {
      attachControls();
    }
  };

  const dispose = () => {
    document.removeEventListener("pointerlockchange", pointerLockListener);
    scene.onBeforeRenderObservable.remove(transformObserver);
    scene.onKeyboardObservable.remove(keyboardObserver);
    subscription();
    if (controlsAttached) {
      detachControls();
    }
    camera.dispose();
  };

  return {
    camera,
    dispose,
    teleport,
    setCutsceneLock,
  };
}

function transformSignature(transform: PlayerTransformState): string {
  return [
    transform.position.x,
    transform.position.y,
    transform.position.z,
    transform.orientation.x,
    transform.orientation.y,
    transform.orientation.z,
    transform.orientation.w,
    transform.velocity.x,
    transform.velocity.y,
    transform.velocity.z,
  ].join("|");
}

function applyTransformToCamera(camera: UniversalCamera, transform: PlayerTransformState) {
  camera.position.set(transform.position.x, transform.position.y, transform.position.z);
  const quaternion = new Quaternion(
    transform.orientation.x,
    transform.orientation.y,
    transform.orientation.z,
    transform.orientation.w,
  );
  applyQuaternionToCamera(camera, quaternion);
}

function applyQuaternionToCamera(camera: UniversalCamera, quaternion: Quaternion) {
  const euler = quaternion.toEulerAngles();
  camera.rotation.set(euler.x, euler.y, 0);
}

function almostEqual(a: number, b: number) {
  return Math.abs(a - b) <= 1e-5;
}
