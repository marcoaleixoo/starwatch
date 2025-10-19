import type { AbstractMesh } from "babylonjs";

export interface GhostHost {
  show(mesh: AbstractMesh): void;
  hide(): void;
  clear(): void;
  dispose(): void;
}

export function createGhostHost(): GhostHost {
  let active: AbstractMesh | null = null;

  const disable = (mesh: AbstractMesh | null) => {
    if (!mesh || mesh.isDisposed()) {
      return;
    }
    mesh.setEnabled(false);
  };

  return {
    show: (mesh: AbstractMesh) => {
      if (active === mesh) {
        if (!mesh.isDisposed()) {
          mesh.setEnabled(true);
        }
        return;
      }

      disable(active);
      active = mesh;
      if (!active.isDisposed()) {
        active.isPickable = false;
        active.setEnabled(true);
      }
    },
    hide: () => {
      disable(active);
    },
    clear: () => {
      disable(active);
      active = null;
    },
    dispose: () => {
      active = null;
    },
  };
}
