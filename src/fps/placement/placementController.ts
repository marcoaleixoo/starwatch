import {
  AbstractMesh,
  PointerEventTypes,
  PointerInfo,
  Scene,
  UniversalCamera,
  Vector3,
} from "babylonjs";
import { CAMERA_SETTINGS, INPUT_KEYS, INTERACTION_RANGE, SELECTION_OUTLINE_COLOR } from "../constants";
import type { ShadowNetwork } from "../lighting/shadowNetwork";
import type { BuilderLamp, BuilderWall } from "../types";
import type { GhostHost } from "./ghosts";
import type {
  PlacementState,
  PlacementToolInstance,
  ShipStateActions,
  ToolMetadata,
  ToolRuntimeContext,
} from "./placementTypes";
import { TOOL_DEFINITION_BY_ID, TOOL_DEFINITIONS } from "./tools";
import type { SurfaceRegistry } from "./surfaces/surfaceRegistry";
import { createPlacementSolver } from "./placementSolver";
import type { ShipStore } from "../state/shipStore";

interface PlacementControllerOptions {
  scene: Scene;
  canvas: HTMLCanvasElement;
  camera: UniversalCamera;
  ghost: GhostHost;
  shadowNetwork: ShadowNetwork;
  surfaceRegistry: SurfaceRegistry;
  initialWalls?: BuilderWall[];
  initialLamps?: BuilderLamp[];
  shipStore: ShipStore;
}

export interface PlacementController {
  getState(): PlacementState;
  setActiveTool(toolId: string): void;
  subscribe(listener: (state: PlacementState) => void): () => void;
  dispose(): void;
}

export function createPlacementController(options: PlacementControllerOptions): PlacementController {
  const { scene, canvas, camera, ghost, shadowNetwork, surfaceRegistry, shipStore } = options;
  const initialWalls = options.initialWalls ?? [];
  const initialLamps = options.initialLamps ?? [];
  const placementSolver = createPlacementSolver(surfaceRegistry);
  const shipActions: ShipStateActions = {
    upsertWall: (wall) => shipStore.upsertWall(wall),
    removeWall: (wallId) => shipStore.removeWall(wallId),
    upsertLamp: (lamp) => shipStore.upsertLamp(lamp),
    removeLamp: (lampId) => shipStore.removeLamp(lampId),
    markStructuralLampRemoved: (lampId) => shipStore.markStructuralLampRemoved(lampId),
    clearStructuralLampRemoval: (lampId) => shipStore.clearStructuralLampRemoval(lampId),
  };

  const defaultToolId = TOOL_DEFINITIONS[0]?.id ?? "wall";

  const state: PlacementState = {
    activeToolId: defaultToolId,
  };

  const toolBootstrap = new Map<string, unknown>();
  if (initialWalls.length > 0) {
    toolBootstrap.set("wall", initialWalls);
  }
  if (initialLamps.length > 0) {
    toolBootstrap.set("lamp", initialLamps);
  }

  const listeners = new Set<(snapshot: PlacementState) => void>();
  const toolInstances = new Map<string, PlacementToolInstance>();
  const sprintKeys = new Set<string>(Array.from(INPUT_KEYS.sprint));
  const hotkeyToToolId = new Map<string, string>();
  const baseCameraSpeed = CAMERA_SETTINGS.speed;

  let activeTool: PlacementToolInstance | null = null;
  let highlighted: AbstractMesh | null = null;

  const notify = () => {
    const snapshot: PlacementState = { ...state };
    listeners.forEach((listener) => listener(snapshot));
  };

  const clearHighlight = () => {
    if (!highlighted || highlighted.isDisposed()) {
      highlighted = null;
      return;
    }
    highlighted.renderOutline = false;
    highlighted = null;
  };

  const applyHighlight = (mesh?: AbstractMesh | null) => {
    const target = mesh ?? null;
    if (!target) {
      clearHighlight();
      return;
    }

    if (highlighted === target) {
      return;
    }

    clearHighlight();
    target.renderOutline = true;
    target.outlineColor = SELECTION_OUTLINE_COLOR;
    target.outlineWidth = 0.018;
    highlighted = target;
  };

  const withinRange = (point?: Vector3 | null) => {
    if (!point) {
      return false;
    }
    return Vector3.Distance(camera.position, point) <= INTERACTION_RANGE;
  };

  hotkeyToToolId.clear();
  TOOL_DEFINITIONS.forEach((definition) => {
    hotkeyToToolId.set(definition.hotkey, definition.id);
  });

  const runtimeContext: ToolRuntimeContext = {
    scene,
    camera,
    canvas,
    shadowNetwork,
    ghost,
    surfaceRegistry,
    placementSolver,
    shipState: shipActions,
    withinRange,
    requestPointerLock: () => {
      if (document.pointerLockElement !== canvas) {
        canvas.requestPointerLock();
      }
    },
    highlight: (mesh?: AbstractMesh | null) => {
      if (!mesh) {
        clearHighlight();
        return;
      }
      applyHighlight(mesh);
    },
    removeMesh: (mesh?: AbstractMesh | null) => {
      const removed = removeMesh(mesh);
      if (removed) {
        clearHighlight();
      }
      return removed;
    },
  };

  const getToolInstance = (toolId: string): PlacementToolInstance | null => {
    const existing = toolInstances.get(toolId);
    if (existing) {
      return existing;
    }

    const definition = TOOL_DEFINITION_BY_ID.get(toolId);
    if (!definition) {
      return null;
    }

    const bootstrap = toolBootstrap.get(toolId);
    const instance = definition.create(runtimeContext, bootstrap);
    toolInstances.set(toolId, instance);
    return instance;
  };

  toolBootstrap.forEach((_, toolId) => {
    if (toolId !== state.activeToolId) {
      getToolInstance(toolId);
    }
  });

  const removeMesh = (mesh?: AbstractMesh | null): boolean => {
    if (!mesh) {
      return false;
    }

    const metadata = mesh.metadata as ToolMetadata | undefined;
    if (
      !metadata ||
      typeof metadata.toolId !== "string" ||
      typeof metadata.key !== "string"
    ) {
      return false;
    }

    const tool = getToolInstance(metadata.toolId);
    if (!tool || !tool.remove) {
      return false;
    }

    const removed = tool.remove(metadata, mesh);
    if (removed && mesh === highlighted) {
      clearHighlight();
    }
    return removed;
  };

  const setActiveToolInternal = (toolId: string, fromHotkey = false) => {
    if (state.activeToolId === toolId && !fromHotkey) {
      return;
    }

    const next = getToolInstance(toolId);
    if (!next) {
      return;
    }

    if (activeTool && activeTool.onDeactivate) {
      activeTool.onDeactivate();
    }

    activeTool = next;
    state.activeToolId = toolId;
    if (activeTool.onActivate) {
      activeTool.onActivate();
    }
    notify();
  };

  const attemptRemoveAtPointer = () => {
    const pick = scene.pick(
      scene.pointerX,
      scene.pointerY,
      (mesh) => {
        const metadata = mesh?.metadata as { toolId?: unknown } | undefined;
        return typeof metadata?.toolId === "string";
      },
    );

    if (!withinRange(pick?.pickedPoint)) {
      return false;
    }

    return removeMesh(pick?.pickedMesh ?? null);
  };

  const pointerObserver = scene.onPointerObservable.add((pointerInfo: PointerInfo) => {
    switch (pointerInfo.type) {
      case PointerEventTypes.POINTERMOVE:
        activeTool?.onPointerMove?.(pointerInfo);
        break;
      case PointerEventTypes.POINTERDOWN: {
        if (pointerInfo.event.button === 0) {
          runtimeContext.requestPointerLock();
        }

        if (pointerInfo.event.button === 2) {
          pointerInfo.event.preventDefault();
          attemptRemoveAtPointer();
          return;
        }

        activeTool?.onPointerDown?.(pointerInfo);
        break;
      }
      case PointerEventTypes.POINTERUP:
        activeTool?.onPointerUp?.(pointerInfo);
        break;
      default:
        break;
    }
  });

  const handleKeyDown = (event: KeyboardEvent) => {
    if (sprintKeys.has(event.code)) {
      camera.speed = baseCameraSpeed * CAMERA_SETTINGS.sprintMultiplier;
    }

    const toolId = hotkeyToToolId.get(event.code);
    if (toolId) {
      setActiveToolInternal(toolId, true);
      return;
    }

    activeTool?.onKeyDown?.(event);
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    if (sprintKeys.has(event.code)) {
      camera.speed = baseCameraSpeed;
    }

    activeTool?.onKeyUp?.(event);
  };

  const handlePointerLockChange = () => {
    const locked = document.pointerLockElement === canvas;
    if (!locked) {
      ghost.hide();
      clearHighlight();
    }
    activeTool?.onPointerLockChange?.(locked);
  };

  const handleContextMenu = (event: MouseEvent) => {
    event.preventDefault();
  };

  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  document.addEventListener("pointerlockchange", handlePointerLockChange);
  canvas.addEventListener("contextmenu", handleContextMenu);

  const initialTool = getToolInstance(state.activeToolId);
  activeTool = initialTool;
  activeTool?.onActivate?.();

  return {
    getState: () => ({ ...state }),
    setActiveTool: (toolId: string) => {
      setActiveToolInternal(toolId);
    },
    subscribe: (listener: (snapshot: PlacementState) => void) => {
      listeners.add(listener);
      listener({ ...state });
      return () => {
        listeners.delete(listener);
      };
    },
    dispose: () => {
      scene.onPointerObservable.remove(pointerObserver);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("pointerlockchange", handlePointerLockChange);
      canvas.removeEventListener("contextmenu", handleContextMenu);

      if (activeTool && activeTool.onDeactivate) {
        activeTool.onDeactivate();
      }

      toolInstances.forEach((tool) => {
        tool.dispose?.();
      });
      toolInstances.clear();

      ghost.clear();
      clearHighlight();
      listeners.clear();
      hotkeyToToolId.clear();
    },
  };
}
