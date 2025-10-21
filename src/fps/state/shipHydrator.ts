import { Color3, Matrix, Quaternion, Vector3 } from "babylonjs";
import type { Scene, AbstractMesh } from "babylonjs";
import { createWall } from "../placement/wallBuilder";
import { createLamp } from "../placement/lampBuilder";
import type { BuilderLamp, BuilderWall, WallLampPlacement } from "../types";
import type { ShipState } from "./shipState";

export interface HydratedShipAssets {
  walls: BuilderWall[];
  lamps: BuilderLamp[];
}

export function hydrateShipAssets(scene: Scene, shipState: ShipState): HydratedShipAssets {
  const walls: BuilderWall[] = [];
  const lamps: BuilderLamp[] = [];

  const wallMeshBySurface = new Map<string, AbstractMesh>();

  Object.values(shipState.walls).forEach((wallState) => {
    if (!wallState) {
      return;
    }
    const position = new Vector3(wallState.position.x, wallState.position.y, wallState.position.z);
    const wall = createWall(scene, position, wallState.rotation);
    walls.push(wall);
    wallMeshBySurface.set(wallState.id, wall.mesh);
  });

  Object.values(shipState.lamps).forEach((lampState) => {
    if (!lampState) {
      return;
    }
    if (lampState.enabled === false) {
      return;
    }
    if (lampState.structural) {
      return;
    }
    const anchorMesh =
      wallMeshBySurface.get(lampState.anchorSurfaceId) ??
      (scene.getMeshByName(lampState.anchorSurfaceId) as AbstractMesh | null);
    if (!anchorMesh) {
      return;
    }

    const rotation = new Quaternion(
      lampState.rotation.x,
      lampState.rotation.y,
      lampState.rotation.z,
      lampState.rotation.w,
    );
    const rotationMatrix = Matrix.Identity();
    rotation.toRotationMatrix(rotationMatrix);

    const forward = Vector3.TransformNormal(Vector3.Forward(), rotationMatrix).normalize();
    const up = Vector3.TransformNormal(Vector3.Up(), rotationMatrix).normalize();
    const right = Vector3.TransformNormal(Vector3.Right(), rotationMatrix).normalize();

    const placement: WallLampPlacement = {
      mesh: anchorMesh,
      position: new Vector3(lampState.position.x, lampState.position.y, lampState.position.z),
      forward,
      up,
      right,
      surfaceId: lampState.anchorSurfaceId,
      local: {
        x: lampState.local.x,
        y: lampState.local.y,
        z: lampState.local.z,
      },
    };

    const color = new Color3(lampState.color.r, lampState.color.g, lampState.color.b);
    const lamp = createLamp(scene, placement, color);
    lamp.mesh.metadata = {
      ...(lamp.mesh.metadata as Record<string, unknown> | undefined),
      structural: lampState.structural ?? false,
      surfaceId: lampState.anchorSurfaceId,
      local: { ...lampState.local },
    };
    lamps.push(lamp);
  });

  return { walls, lamps };
}
