import { AbstractMesh, Color3, Matrix, MeshBuilder, PointerEventTypes, Quaternion, StandardMaterial } from "babylonjs";
import type { BuilderLamp, WallLampPlacement } from "../../types";
import { GRID_SIZE, INPUT_KEYS, LAMP_COLOR_PALETTE, WALL_LAMP_PLACEMENT } from "../../constants";
import { createLamp, lampKey, nextLampColor } from "../lampBuilder";
import type {
  PlacementToolDefinition,
  ToolMetadata,
  ToolRuntimeContext,
} from "../placementTypes";
import type { PlacementFrame } from "../surfaces/types";
import type { PlacementProfile } from "../placementSolver";

const TOOL_ID = "lamp";
const LAMP_PROFILE: PlacementProfile = {
  modes: [
    {
      mode: "wall-mount",
      constraints: {
        type: "wall-mount",
        grid: GRID_SIZE,
        itemSize: {
          width: WALL_LAMP_PLACEMENT.width,
          height: WALL_LAMP_PLACEMENT.height,
          depth: WALL_LAMP_PLACEMENT.depth,
        },
        offset: WALL_LAMP_PLACEMENT.offset,
        boundsPadding: {
          horizontal: 0.06,
          vertical: 0.08,
        },
      },
    },
  ],
};

function createPreviewMesh(context: ToolRuntimeContext) {
  const mesh = MeshBuilder.CreateBox(
    "lamp-tool-preview",
    {
      width: WALL_LAMP_PLACEMENT.width,
      height: WALL_LAMP_PLACEMENT.height,
      depth: WALL_LAMP_PLACEMENT.depth,
    },
    context.scene,
  );

  const material = new StandardMaterial("lamp-tool-preview-mat", context.scene);
  material.diffuseColor = new Color3(0.58, 0.78, 0.98);
  material.alpha = 0.38;
  material.specularColor = new Color3(0.2, 0.35, 0.5);
  material.emissiveColor = new Color3(0.32, 0.58, 0.86);
  material.backFaceCulling = false;
  mesh.material = material;
  mesh.isPickable = false;
  mesh.setEnabled(false);
  return mesh;
}

const isLampSurface = (mesh?: AbstractMesh | null) => {
  if (!mesh) {
    return false;
  }
  const metadata = mesh.metadata as Record<string, unknown> | undefined;
  if (!metadata) {
    return false;
  }
  if (metadata.toolId === "wall") {
    return true;
  }
  if (metadata.type === "ship-wall") {
    return true;
  }
  return false;
};

const frameToLampPlacement = (frame: PlacementFrame): WallLampPlacement | null => {
  if (frame.mode !== "wall-mount") {
    return null;
  }
  return {
    mesh: frame.mesh,
    position: frame.position.clone(),
    forward: frame.forward.clone(),
    right: frame.right.clone(),
    up: frame.up.clone(),
    surfaceId: frame.surfaceId,
    local: {
      x: Number(frame.local.x.toFixed(3)),
      y: Number(frame.local.y.toFixed(3)),
      z: Number(frame.local.z.toFixed(3)),
    },
  };
};

export const lampToolDefinition: PlacementToolDefinition = {
  id: TOOL_ID,
  label: "Lâmpada",
  icon: "◎",
  hotkey: INPUT_KEYS.lampMode,
  create: (context: ToolRuntimeContext, bootstrap?: unknown) => {
    const preview = createPreviewMesh(context);
    const lamps = new Map<string, BuilderLamp>();
    const initialLamps = Array.isArray(bootstrap) ? (bootstrap as BuilderLamp[]) : [];
    initialLamps.forEach((lamp) => {
      lamps.set(lamp.key, lamp);
      const metadata = (lamp.mesh.metadata as Record<string, unknown>) ?? {};
      const surfaceId =
        typeof metadata.surfaceId === "string" && metadata.surfaceId.length > 0
          ? metadata.surfaceId
          : lamp.anchorSurfaceId;
      const local = (metadata.local as WallLampPlacement["local"] | undefined) ?? lamp.local;
      lamp.mesh.metadata = { ...metadata, toolId: TOOL_ID, key: lamp.key, surfaceId, local };
      context.shadowNetwork.registerDynamic(lamp.mesh);
      context.shadowNetwork.attachLamp(lamp);
      context.shipState.upsertLamp({
        id: lamp.key,
        anchorSurfaceId: surfaceId,
        position: {
          x: Number(lamp.mesh.position.x.toFixed(5)),
          y: Number(lamp.mesh.position.y.toFixed(5)),
          z: Number(lamp.mesh.position.z.toFixed(5)),
        },
        rotation: {
          x: Number(lamp.rotation.x.toFixed(5)),
          y: Number(lamp.rotation.y.toFixed(5)),
          z: Number(lamp.rotation.z.toFixed(5)),
          w: Number(lamp.rotation.w.toFixed(5)),
        },
        color: {
          r: Number(lamp.color.r.toFixed(5)),
          g: Number(lamp.color.g.toFixed(5)),
          b: Number(lamp.color.b.toFixed(5)),
        },
        local: { ...local },
      });
    });

    let pendingPlacement: WallLampPlacement | null = null;
    let colorIndex = initialLamps.length % Math.max(LAMP_COLOR_PALETTE.length, 1);

    const hidePreview = () => {
      pendingPlacement = null;
      context.ghost.hide();
    };

    const updatePreview = (placement: WallLampPlacement | null) => {
      if (!placement) {
        hidePreview();
        return;
      }
      pendingPlacement = placement;
      preview.position.copyFrom(placement.position);

      const basis = new Matrix();
      Matrix.FromXYZAxesToRef(placement.right, placement.up, placement.forward, basis);
      const rotation = Quaternion.FromRotationMatrix(basis);
      preview.rotationQuaternion = rotation;
      context.ghost.show(preview);
    };

    const placeLamp = (placement: WallLampPlacement) => {
      const key = lampKey(placement);
      if (lamps.has(key)) {
        return;
      }

      const color = nextLampColor(colorIndex);
      colorIndex = (colorIndex + 1) % LAMP_COLOR_PALETTE.length;

      const lamp = createLamp(context.scene, placement, color);
      lamp.mesh.metadata = {
        toolId: TOOL_ID,
        key,
        surfaceId: placement.surfaceId,
        local: placement.local,
      };
      lamps.set(key, lamp);
      context.shadowNetwork.registerDynamic(lamp.mesh);
      context.shadowNetwork.attachLamp(lamp);
      context.shipState.upsertLamp({
        id: key,
        anchorSurfaceId: placement.surfaceId,
        position: {
          x: Number(placement.position.x.toFixed(5)),
          y: Number(placement.position.y.toFixed(5)),
          z: Number(placement.position.z.toFixed(5)),
        },
        rotation: {
          x: Number(lamp.rotation.x.toFixed(5)),
          y: Number(lamp.rotation.y.toFixed(5)),
          z: Number(lamp.rotation.z.toFixed(5)),
          w: Number(lamp.rotation.w.toFixed(5)),
        },
        color: {
          r: Number(lamp.color.r.toFixed(5)),
          g: Number(lamp.color.g.toFixed(5)),
          b: Number(lamp.color.b.toFixed(5)),
        },
        local: { ...lamp.local },
      });
    };

    const pickSurface = () =>
      context.scene.pick(
        context.scene.pointerX,
        context.scene.pointerY,
        (mesh) => isLampSurface(mesh),
        false,
      );

    return {
      id: TOOL_ID,
      onActivate: () => {
        hidePreview();
      },
      onDeactivate: () => {
        hidePreview();
      },
      onPointerLockChange: (isLocked: boolean) => {
        if (!isLocked) {
          hidePreview();
        }
      },
      onPointerMove: (pointerInfo) => {
        if (pointerInfo.type !== PointerEventTypes.POINTERMOVE) {
          return;
        }

        const pick = pickSurface();
        if (!context.withinRange(pick?.pickedPoint)) {
          updatePreview(null);
          return;
        }

        if (!pick || !pick.hit) {
          updatePreview(null);
          return;
        }

        const frame = context.placementSolver.solve(LAMP_PROFILE, pick);
        const placement = frame ? frameToLampPlacement(frame) : null;
        if (!placement) {
          updatePreview(null);
          return;
        }

        updatePreview(placement);
      },
      onPointerDown: (pointerInfo) => {
        if (pointerInfo.type !== PointerEventTypes.POINTERDOWN) {
          return;
        }

        if (pointerInfo.event.button !== 0) {
          return;
        }

        const placement =
          pendingPlacement ??
          (() => {
            const pick = pickSurface();
            if (!context.withinRange(pick?.pickedPoint)) {
              return null;
            }
            const frame = context.placementSolver.solve(LAMP_PROFILE, pick ?? null);
            return frame ? frameToLampPlacement(frame) : null;
          })();

        if (!placement) {
          return;
        }

        placeLamp(placement);
        updatePreview(placement);
      },
      remove: (metadata: ToolMetadata) => {
        if (metadata.toolId !== TOOL_ID) {
          return false;
        }
        const entry = lamps.get(metadata.key);
        if (!entry) {
          return false;
        }
        context.shadowNetwork.detachLamp(entry);
        context.shadowNetwork.unregisterDynamic(entry.mesh);
        entry.shadow.dispose();
        entry.light.dispose();
        entry.areaLight?.dispose();
        entry.fillLight?.dispose();
        entry.auxiliaryLights?.forEach((aux) => aux.dispose());
        if (entry.gi) {
          entry.gi.solution.dispose();
          entry.gi.rsm.dispose();
        }
        entry.mesh.dispose(false, true);
        lamps.delete(metadata.key);
        context.shipState.removeLamp(metadata.key);
        return true;
      },
      dispose: () => {
        context.ghost.hide();
        preview.dispose(false, true);
        lamps.forEach((lamp) => {
          context.shadowNetwork.detachLamp(lamp);
          context.shadowNetwork.unregisterDynamic(lamp.mesh);
          lamp.shadow.dispose();
          lamp.light.dispose();
          lamp.areaLight?.dispose();
          lamp.fillLight?.dispose();
          lamp.auxiliaryLights?.forEach((aux) => aux.dispose());
          if (lamp.gi) {
            lamp.gi.solution.dispose();
            lamp.gi.rsm.dispose();
          }
          lamp.mesh.dispose(false, true);
        });
        lamps.clear();
        pendingPlacement = null;
      },
    };
  },
};
