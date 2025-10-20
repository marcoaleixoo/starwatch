import { Matrix, Vector3 } from "babylonjs";
import type { AbstractMesh, PickingInfo } from "babylonjs";
import type { PlacementSurface } from "./placementSurface";
import type {
  PlacementFrame,
  PlacementMode,
  SurfaceSampleRequest,
  WallMountConstraints,
} from "./types";
import { clamp } from "../../utils/math";

export interface WallSurfaceOptions {
  id: string;
  mesh: AbstractMesh;
  inward: Vector3;
  up?: Vector3;
}

export class WallSurface implements PlacementSurface {
  public readonly id: string;
  public readonly mesh: AbstractMesh;
  private readonly inward: Vector3;
  private readonly up: Vector3;

  constructor(options: WallSurfaceOptions) {
    this.id = options.id;
    this.mesh = options.mesh;
    this.inward = options.inward.normalize();
    this.up = (options.up ?? Vector3.Up()).normalize();
  }

  supports(mode: PlacementMode) {
    return mode === "wall-mount";
  }

  sample(request: SurfaceSampleRequest): PlacementFrame | null {
    if (request.mode !== "wall-mount") {
      return null;
    }

    const constraints = request.constraints as WallMountConstraints;
    if (constraints.type !== "wall-mount") {
      return null;
    }

    return this.sampleWallMount(request.pick, constraints);
  }

  dispose() {
    // Nothing to release for now.
  }

  private sampleWallMount(pick: PickingInfo, constraints: WallMountConstraints): PlacementFrame | null {
    const { mesh } = this;
    if (!pick.hit || pick.pickedMesh?.uniqueId !== mesh.uniqueId || !pick.pickedPoint) {
      return null;
    }

    const worldMatrix = mesh.getWorldMatrix();
    const inverse = Matrix.Identity();
    worldMatrix.invertToRef(inverse);

    const localPoint = Vector3.TransformCoordinates(pick.pickedPoint, inverse);
    const bounds = mesh.getBoundingInfo().boundingBox.extendSize;

    const halfWidth = bounds.x;
    const halfHeight = bounds.y;
    const paddingX = constraints.boundsPadding.horizontal;
    const paddingY = constraints.boundsPadding.vertical;

    const allowedHalfWidth = Math.max(halfWidth - (constraints.itemSize.width / 2 + paddingX), 0);
    const allowedHalfHeight = Math.max(halfHeight - (constraints.itemSize.height / 2 + paddingY), 0);

    const snap = constraints.grid > 0 ? constraints.grid : 0;
    const snappedX = snap
      ? clamp(Math.round(localPoint.x / snap) * snap, -allowedHalfWidth, allowedHalfWidth)
      : clamp(localPoint.x, -allowedHalfWidth, allowedHalfWidth);
    const snappedY = snap
      ? clamp(Math.round(localPoint.y / snap) * snap, -allowedHalfHeight, allowedHalfHeight)
      : clamp(localPoint.y, -allowedHalfHeight, allowedHalfHeight);

    const baseLocal = new Vector3(snappedX, snappedY, 0);
    const baseWorld = Vector3.TransformCoordinates(baseLocal, worldMatrix);

    const forward = this.inward.clone();
    if (pick.ray && Vector3.Dot(forward, pick.ray.direction) > 0) {
      forward.scaleInPlace(-1);
    }

    const right = Vector3.Cross(this.up, forward).normalize();
    const up = Vector3.Cross(forward, right).normalize();

    const depthOffset = constraints.itemSize.depth / 2 + constraints.offset;
    const position = baseWorld.add(forward.scale(depthOffset));

    return {
      surfaceId: this.id,
      mesh,
      mode: "wall-mount",
      position,
      forward,
      up,
      right,
      local: {
        x: Number(snappedX.toFixed(3)),
        y: Number(snappedY.toFixed(3)),
        z: 0,
      },
    };
  }
}
