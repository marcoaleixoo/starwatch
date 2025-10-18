import {
  AbstractMesh,
  PointerEventTypes,
  PointerInfo,
  Scene,
  UniversalCamera,
  Vector3,
} from "babylonjs";
import { CAMERA_SETTINGS, INPUT_KEYS, SELECTION_OUTLINE_COLOR } from "../constants";
import { createLamp, lampKey, nextLampColor, snapLampPosition } from "./lampBuilder";
import { createWall, snapWallPosition, wallKey } from "./wallBuilder";
import type { BuilderLamp, BuilderWall, PlacementMode, PlacementState } from "../types";
import type { GhostSet } from "./ghosts";
import type { ShadowNetwork } from "../lighting/shadowNetwork";

interface PlacementControllerOptions {
  scene: Scene;
  canvas: HTMLCanvasElement;
  camera: UniversalCamera;
  ghostSet: GhostSet;
  shadowNetwork: ShadowNetwork;
  initialWalls?: BuilderWall[];
  initialLamps?: BuilderLamp[];
}

export interface PlacementController {
  getState(): PlacementState;
  setMode(mode: PlacementMode): void;
  subscribe(listener: (state: PlacementState) => void): () => void;
  dispose(): void;
}

export function createPlacementController(options: PlacementControllerOptions): PlacementController {
  const {
    scene,
    canvas,
    camera,
    ghostSet,
    shadowNetwork,
    initialWalls = [],
    initialLamps = [],
  } = options;

  const state: PlacementState = {
    mode: "wall",
    rotation: 0,
    lampColorIndex: 0,
  };

  const walls = new Map<string, BuilderWall>();
  const lamps = new Map<string, BuilderLamp>();
  const baseCameraSpeed = CAMERA_SETTINGS.speed;
  const sprintKeys = new Set<string>(Array.from(INPUT_KEYS.sprint));
  const listeners = new Set<(state: PlacementState) => void>();
  let highlighted: AbstractMesh | null = null;

  const notify = () => {
    const snapshot = { ...state };
    listeners.forEach((listener) => listener(snapshot));
  };

  const clearHighlight = () => {
    if (!highlighted) {
      return;
    }
    highlighted.renderOutline = false;
    highlighted = null;
  };

  const applyHighlight = (mesh?: AbstractMesh | null) => {
    const target = mesh ?? null;
    if (!target || target === highlighted) {
      if (!target) {
        clearHighlight();
      }
      return;
    }

    clearHighlight();
    target.renderOutline = true;
    target.outlineColor = SELECTION_OUTLINE_COLOR;
    target.outlineWidth = 0.018;
    highlighted = target;
  };

  const pickRemovable = () =>
    scene.pick(
      scene.pointerX,
      scene.pointerY,
      (mesh?: AbstractMesh) => {
        const type = mesh?.metadata?.type;
        return type === "builder-wall" || type === "builder-lamp";
      },
    );

  const setMode = (mode: PlacementMode) => {
    if (state.mode === mode) {
      return;
    }
    state.mode = mode;
    ghostSet.setMode(mode);
    clearHighlight();
    notify();
  };

  initialWalls.forEach((wall) => {
    walls.set(wall.key, wall);
  });

  initialLamps.forEach((lamp) => {
    lamps.set(lamp.key, lamp);
  });

  const showPlacementPreview = (point: Vector3) => {
    if (state.mode === "wall") {
      const snapped = snapWallPosition(point);
      ghostSet.showWall(snapped, state.rotation);
    } else {
      const snapped = snapLampPosition(point);
      ghostSet.showLamp(snapped);
    }
  };

  const pointerMoveObserver = scene.onPointerObservable.add((pointerInfo: PointerInfo) => {
    if (pointerInfo.type !== PointerEventTypes.POINTERMOVE) {
      return;
    }

    if (state.mode === "delete") {
      const pick = pickRemovable();
      const targetMesh = pick?.pickedMesh;
      if (targetMesh) {
        applyHighlight(targetMesh);
      } else {
        clearHighlight();
      }
      ghostSet.hide();
      return;
    }

    clearHighlight();

    const pick = scene.pick(
      scene.pointerX,
      scene.pointerY,
      (mesh?: AbstractMesh) => mesh?.name === "hangar-floor",
    );
    const point = pick?.pickedPoint;

    if (!point) {
      ghostSet.hide();
      return;
    }

    showPlacementPreview(point);
  });

  const placeWall = (point: Vector3) => {
    const snapped = snapWallPosition(point);
    const key = wallKey(snapped, state.rotation);
    if (walls.has(key)) {
      return;
    }

    const wall = createWall(scene, snapped, state.rotation);
    walls.set(key, wall);
    shadowNetwork.registerDynamic(wall.mesh);
  };

  const placeLamp = (point: Vector3) => {
    const snapped = snapLampPosition(point);
    const key = lampKey(snapped);
    if (lamps.has(key)) {
      return;
    }

    const color = nextLampColor(state.lampColorIndex);
    state.lampColorIndex = (state.lampColorIndex + 1) % Number.MAX_SAFE_INTEGER;

    const lamp = createLamp(scene, snapped, color);
    lamps.set(key, lamp);
    shadowNetwork.registerDynamic(lamp.mesh);
    shadowNetwork.attachLamp(lamp);
  };

  const removeTarget = (mesh?: AbstractMesh) => {
    if (!mesh || !mesh.metadata) {
      return;
    }

    if (mesh === highlighted) {
      highlighted.renderOutline = false;
      highlighted = null;
    }

    const meta = mesh.metadata as { type: string; key: string };
    if (meta.type === "builder-wall") {
      const entry = walls.get(meta.key);
      if (!entry) {
        return;
      }
      shadowNetwork.unregisterDynamic(entry.mesh);
      entry.mesh.dispose(false, true);
      walls.delete(meta.key);
    } else if (meta.type === "builder-lamp") {
      const entry = lamps.get(meta.key);
      if (!entry) {
        return;
      }
      shadowNetwork.detachLamp(entry);
      shadowNetwork.unregisterDynamic(entry.mesh);
      entry.shadow.dispose();
      entry.light.dispose();
      entry.fillLight?.dispose();
      entry.mesh.dispose(false, true);
      lamps.delete(meta.key);
    }
    clearHighlight();
  };

  const pointerDownObserver = scene.onPointerObservable.add((pointerInfo: PointerInfo) => {
    if (pointerInfo.type !== PointerEventTypes.POINTERDOWN) {
      return;
    }

    const event = pointerInfo.event;

    if (event.button === 0) {
      if (document.pointerLockElement !== canvas) {
        canvas.requestPointerLock();
      }

      if (state.mode === "delete") {
        const pick = pickRemovable();
        const mesh = pick?.pickedMesh;
        if (mesh) {
          removeTarget(mesh);
        }
        return;
      }

      const pick = scene.pick(
        scene.pointerX,
        scene.pointerY,
        (mesh?: AbstractMesh) => mesh?.name === "hangar-floor",
      );
      const point = pick?.pickedPoint;
      if (!point) {
        return;
      }

      if (state.mode === "wall") {
        placeWall(point);
      } else {
        placeLamp(point);
      }

      showPlacementPreview(point);
    } else if (event.button === 2) {
      event.preventDefault();

      const pick = scene.pick(
        scene.pointerX,
        scene.pointerY,
        (mesh?: AbstractMesh) => {
          const type = mesh?.metadata?.type;
          return type === "builder-wall" || type === "builder-lamp";
        },
      );

      removeTarget(pick?.pickedMesh ?? undefined);
    }
  });

  const handleContextMenu = (event: MouseEvent) => {
    event.preventDefault();
  };

  canvas.addEventListener("contextmenu", handleContextMenu);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.code === INPUT_KEYS.rotate && state.mode === "wall") {
      state.rotation = (state.rotation + 90) % 360;
    }

    if (sprintKeys.has(event.code)) {
      camera.speed = baseCameraSpeed * CAMERA_SETTINGS.sprintMultiplier;
    }

    if (event.code === INPUT_KEYS.wallMode) {
      setMode("wall");
    }

    if (event.code === INPUT_KEYS.lampMode) {
      setMode("lamp");
    }

    if (event.code === INPUT_KEYS.deleteMode) {
      setMode("delete");
    }
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    if (sprintKeys.has(event.code)) {
      camera.speed = baseCameraSpeed;
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);

  const handlePointerLockChange = () => {
    if (document.pointerLockElement !== canvas) {
      ghostSet.hide();
      clearHighlight();
    }
  };

  document.addEventListener("pointerlockchange", handlePointerLockChange);

  return {
    getState: () => ({ ...state }),
    setMode,
    subscribe: (listener: (snapshot: PlacementState) => void) => {
      listeners.add(listener);
      listener({ ...state });
      return () => {
        listeners.delete(listener);
      };
    },
    dispose: () => {
      scene.onPointerObservable.remove(pointerMoveObserver);
      scene.onPointerObservable.remove(pointerDownObserver);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("pointerlockchange", handlePointerLockChange);
      canvas.removeEventListener("contextmenu", handleContextMenu);

      walls.forEach((wall) => wall.mesh.dispose(false, true));
      lamps.forEach((lamp) => {
        lamp.shadow.dispose();
        lamp.light.dispose();
        lamp.fillLight?.dispose();
        lamp.mesh.dispose(false, true);
      });
      walls.clear();
      lamps.clear();
      listeners.clear();
      clearHighlight();
    },
  };
}
