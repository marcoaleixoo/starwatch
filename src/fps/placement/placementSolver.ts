import type { PickingInfo } from "babylonjs";
import type { SurfaceRegistry } from "./surfaces/surfaceRegistry";
import type {
  PlacementConstraints,
  PlacementFrame,
  PlacementMode,
} from "./surfaces/types";

export interface PlacementModeEntry<C extends PlacementConstraints = PlacementConstraints> {
  mode: PlacementMode;
  constraints: C;
}

export interface PlacementProfile {
  modes: PlacementModeEntry[];
}

export interface PlacementSolver {
  solve(profile: PlacementProfile, pick: PickingInfo | null): PlacementFrame | null;
}

export function createPlacementSolver(surfaceRegistry: SurfaceRegistry): PlacementSolver {
  return {
    solve: (profile: PlacementProfile, pick: PickingInfo | null) => {
      if (!pick) {
        return null;
      }
      const surface = surfaceRegistry.resolveFromPick(pick);
      if (!surface) {
        return null;
      }

      for (const entry of profile.modes) {
        if (!surface.supports(entry.mode)) {
          continue;
        }
        const frame = surface.sample({
          mode: entry.mode,
          constraints: entry.constraints,
          pick,
        });
        if (frame) {
          return frame;
        }
      }

      return null;
    },
  };
}
