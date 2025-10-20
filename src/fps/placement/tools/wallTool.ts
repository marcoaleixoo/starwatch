import {
  Color3,
  MeshBuilder,
  PointerEventTypes,
  StandardMaterial,
  Vector3,
} from "babylonjs";
import { INPUT_KEYS, WALL_DIMENSIONS } from "../../constants";
import type { BuilderWall } from "../../types";
import { degreesToRadians } from "../../utils/math";
import { createWall, snapWallPosition, wallKey } from "../wallBuilder";
import type {
  PlacementToolDefinition,
  ToolMetadata,
  ToolRuntimeContext,
} from "../placementTypes";
import { WallSurface } from "../surfaces/wallSurface";

const TOOL_ID = "wall";

function createPreviewMesh(context: ToolRuntimeContext) {
  const mesh = MeshBuilder.CreateBox(
    "wall-tool-preview",
    {
      width: WALL_DIMENSIONS.width,
      height: WALL_DIMENSIONS.height,
      depth: WALL_DIMENSIONS.thickness,
    },
    context.scene,
  );
  const material = new StandardMaterial("wall-tool-preview-mat", context.scene);
  material.diffuseColor = new Color3(0.35, 0.77, 0.93);
  material.alpha = 0.32;
  material.specularColor = Color3.Black();
  material.emissiveColor = new Color3(0.1, 0.25, 0.36);
  material.backFaceCulling = false;
  mesh.material = material;
  mesh.isPickable = false;
  mesh.setEnabled(false);
  return mesh;
}

export const wallToolDefinition: PlacementToolDefinition = {
  id: TOOL_ID,
  label: "Parede",
  icon: "▭",
  hotkey: INPUT_KEYS.wallMode,
  create: (context: ToolRuntimeContext, bootstrap?: unknown) => {
    const preview = createPreviewMesh(context);
    const walls = new Map<string, BuilderWall>();
    const initialWalls = Array.isArray(bootstrap) ? (bootstrap as BuilderWall[]) : [];
    initialWalls.forEach((wall) => {
      walls.set(wall.key, wall);
      wall.mesh.metadata = { toolId: TOOL_ID, key: wall.key };
    });

    let rotation = 0;
    let lastPreviewPosition: Vector3 | null = null;

    const hidePreview = () => {
      context.ghost.hide();
      lastPreviewPosition = null;
    };

    const updatePreview = (snapped: Vector3 | null) => {
      if (!snapped) {
        hidePreview();
        return;
      }
      lastPreviewPosition = snapped.clone();
      preview.position.copyFrom(snapped);
      preview.rotation.y = degreesToRadians(rotation);
      context.ghost.show(preview);
    };

    const placeWall = (point: Vector3) => {
      const snapped = snapWallPosition(point);
      const key = wallKey(snapped, rotation);
      if (walls.has(key)) {
        return;
      }

      const wall = createWall(context.scene, snapped, rotation);
      walls.set(key, wall);
      context.shadowNetwork.registerDynamic(wall.mesh);

      const surfaceId = `wall-${wall.mesh.uniqueId}`;
      const inward = Vector3.TransformNormal(
        Vector3.Forward(),
        wall.mesh.computeWorldMatrix(true),
      ).scale(-1);
      inward.y = 0;
      if (inward.lengthSquared() < 1e-4) {
        inward.copyFrom(Vector3.Forward());
      }
      context.surfaceRegistry.register(
        new WallSurface({
          id: surfaceId,
          mesh: wall.mesh,
          inward,
          up: Vector3.Up(),
        }),
      );
      const metadata = wall.mesh.metadata as Record<string, unknown> | undefined;
      if (metadata) {
        metadata.surfaceId = surfaceId;
      } else {
        wall.mesh.metadata = { toolId: TOOL_ID, key, surfaceId };
      }
    };

    const pickFloor = () =>
      context.scene.pick(
        context.scene.pointerX,
        context.scene.pointerY,
        (mesh) => mesh?.name === "hangar-floor",
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

        const pick = pickFloor();
        if (!context.withinRange(pick?.pickedPoint)) {
          hidePreview();
          return;
        }

        const point = pick?.pickedPoint;
        if (!point) {
          hidePreview();
          return;
        }

        const snapped = snapWallPosition(point);
        updatePreview(snapped);
      },
      onPointerDown: (pointerInfo) => {
        if (pointerInfo.type !== PointerEventTypes.POINTERDOWN) {
          return;
        }

        const event = pointerInfo.event;
        if (event.button !== 0) {
          return;
        }

        const pick = pickFloor();
        if (!context.withinRange(pick?.pickedPoint)) {
          return;
        }

        const point = pick?.pickedPoint;
        if (!point) {
          return;
        }

        placeWall(point);
        const snapped = snapWallPosition(point);
        updatePreview(snapped);
      },
      onKeyDown: (event: KeyboardEvent) => {
        if (event.code === INPUT_KEYS.rotate) {
          rotation = (rotation + 90) % 360;
          if (lastPreviewPosition) {
            preview.rotation.y = degreesToRadians(rotation);
            context.ghost.show(preview);
          }
        }
      },
      remove: (metadata: ToolMetadata, mesh) => {
        if (metadata.toolId !== TOOL_ID) {
          return false;
        }
        const entry = walls.get(metadata.key);
        if (!entry) {
          return false;
        }
        context.shadowNetwork.unregisterDynamic(entry.mesh);
        context.surfaceRegistry.unregister(entry.mesh);
        entry.mesh.dispose(false, true);
        walls.delete(metadata.key);
        if (mesh === preview) {
          hidePreview();
        }
        return true;
      },
      dispose: () => {
        context.ghost.hide();
        preview.dispose(false, true);
        walls.forEach((wall) => {
          context.shadowNetwork.unregisterDynamic(wall.mesh);
          context.surfaceRegistry.unregister(wall.mesh);
          wall.mesh.dispose(false, true);
        });
        walls.clear();
      },
    };
  },
};
