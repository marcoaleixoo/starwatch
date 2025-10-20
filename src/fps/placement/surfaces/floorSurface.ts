import { Matrix, Vector3 } from "babylonjs";
import type { AbstractMesh, PickingInfo } from "babylonjs";
import type { PlacementSurface } from "./placementSurface";
import type {
  FloorMountConstraints,
  PlacementFrame,
  PlacementMode,
  SurfaceSampleRequest,
} from "./types";
import { clamp } from "../../utils/math";

export interface FloorSurfaceOptions {
  id: string;
  mesh: AbstractMesh;
  up?: Vector3;
  forward?: Vector3;
}

export class FloorSurface implements PlacementSurface {
  public readonly id: string;
  public readonly mesh: AbstractMesh;
  private readonly up: Vector3;
  private readonly forward: Vector3;

  constructor(options: FloorSurfaceOptions) {
    this.id = options.id;
    this.mesh = options.mesh;
    this.up = (options.up ?? Vector3.Up()).normalize();
    const forward = options.forward ?? new Vector3(0, 0, 1);
    this.forward = forward.normalize();
  }

  supports(mode: PlacementMode) {
    return mode === "floor-mount";
  }

  sample(request: SurfaceSampleRequest): PlacementFrame | null {
    if (request.mode !== "floor-mount") {
      return null;
    }

    const constraints = request.constraints as FloorMountConstraints;
    if (constraints.type !== "floor-mount") {
      return null;
    }

    return this.sampleFloorMount(request.pick, constraints);
  }

  dispose() {
    // Nothing to release for now.
  }

  private sampleFloorMount(pick: PickingInfo, constraints: FloorMountConstraints): PlacementFrame | null {
    if (!pick.hit || pick.pickedMesh?.uniqueId !== this.mesh.uniqueId || !pick.pickedPoint) {
      return null;
    }

    const mesh = this.mesh;
    const worldMatrix = mesh.getWorldMatrix();
    const inverse = Matrix.Identity();
    worldMatrix.invertToRef(inverse);

    const localPoint = Vector3.TransformCoordinates(pick.pickedPoint, inverse);
    const bounds = mesh.getBoundingInfo().boundingBox.extendSize;

    const halfWidth = bounds.x;
    const halfDepth = bounds.z;

    const snap = constraints.grid > 0 ? constraints.grid : 0;
    const maxX = Math.max(halfWidth - constraints.itemSize.width / 2, 0);
    const maxZ = Math.max(halfDepth - constraints.itemSize.depth / 2, 0);

    const snappedX = snap
      ? clamp(Math.round(localPoint.x / snap) * snap, -maxX, maxX)
      : clamp(localPoint.x, -maxX, maxX);
    const snappedZ = snap
      ? clamp(Math.round(localPoint.z / snap) * snap, -maxZ, maxZ)
      : clamp(localPoint.z, -maxZ, maxZ);

    const baseLocal = new Vector3(snappedX, 0, snappedZ);
    const baseWorld = Vector3.TransformCoordinates(baseLocal, worldMatrix);

    const up = this.up.clone();
    const forward = this.forward.clone();
    const right = Vector3.Cross(up, forward).normalize();
    const heightOffset = constraints.heightOffset + constraints.itemSize.height / 2;
    const position = baseWorld.add(up.scale(heightOffset));

    return {
      surfaceId: this.id,
      mesh,
      mode: "floor-mount",
      position,
      forward,
      up,
      right,
      local: {
        x: Number(snappedX.toFixed(3)),
        y: 0,
        z: Number(snappedZ.toFixed(3)),
      },
    };
  }
}
