import type { AbstractMesh } from "babylonjs";
import type { PlacementFrame, PlacementMode, SurfaceSampleRequest } from "./types";

export interface PlacementSurface {
  readonly id: string;
  readonly mesh: AbstractMesh;
  supports(mode: PlacementMode): boolean;
  sample(request: SurfaceSampleRequest): PlacementFrame | null;
  dispose(): void;
}
