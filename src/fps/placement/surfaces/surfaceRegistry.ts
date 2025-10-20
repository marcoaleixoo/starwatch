import type { AbstractMesh, PickingInfo } from "babylonjs";
import type { PlacementSurface } from "./placementSurface";

export interface SurfaceRegistry {
  register(surface: PlacementSurface): void;
  unregister(mesh: AbstractMesh): void;
  resolveFromMesh(mesh?: AbstractMesh | null): PlacementSurface | null;
  resolveFromPick(pick?: PickingInfo | null): PlacementSurface | null;
  list(): PlacementSurface[];
  dispose(): void;
}

export function createSurfaceRegistry(): SurfaceRegistry {
  const surfacesById = new Map<string, PlacementSurface>();
  const surfacesByMesh = new Map<number, PlacementSurface>();

  const register = (surface: PlacementSurface) => {
    surfacesById.set(surface.id, surface);
    surfacesByMesh.set(surface.mesh.uniqueId, surface);
  };

  const unregister = (mesh: AbstractMesh) => {
    const surface = surfacesByMesh.get(mesh.uniqueId);
    if (!surface) {
      return;
    }
    surfacesByMesh.delete(mesh.uniqueId);
    surfacesById.delete(surface.id);
    surface.dispose();
  };

  return {
    register,
    unregister,
    resolveFromMesh: (mesh?: AbstractMesh | null) => {
      if (!mesh) {
        return null;
      }
      return surfacesByMesh.get(mesh.uniqueId) ?? null;
    },
    resolveFromPick: (pick?: PickingInfo | null) => {
      if (!pick) {
        return null;
      }
      return surfacesByMesh.get(pick.pickedMesh?.uniqueId ?? -1) ?? null;
    },
    list: () => Array.from(surfacesById.values()),
    dispose: () => {
      surfacesByMesh.forEach((surface) => {
        surface.dispose();
      });
      surfacesByMesh.clear();
      surfacesById.clear();
    },
  };
}
