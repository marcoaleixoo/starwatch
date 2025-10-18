import type { Mesh } from "babylonjs";
import type { BuilderLamp } from "../types";
import type { ShadowGenerator } from "babylonjs";

export interface ShadowNetwork {
  registerStatic(meshes: Mesh[]): void;
  registerDynamic(mesh: Mesh): void;
  unregisterDynamic(mesh: Mesh): void;
  attachLamp(lamp: BuilderLamp): void;
  detachLamp(lamp: BuilderLamp): void;
  dispose(): void;
}

export function createShadowNetwork(keyShadow: ShadowGenerator): ShadowNetwork {
  const staticCasters = new Set<Mesh>();
  const dynamicCasters = new Set<Mesh>();
  const lamps = new Set<BuilderLamp>();

  const addCasterToLamp = (lamp: BuilderLamp, mesh: Mesh) => {
    lamp.shadow.addShadowCaster(mesh, true);
  };

  const removeCasterFromLamp = (lamp: BuilderLamp, mesh: Mesh) => {
    lamp.shadow.removeShadowCaster(mesh);
  };

  const registerMeshes = (set: Set<Mesh>, meshes: Mesh[]) => {
    meshes.forEach((mesh) => {
      if (set.has(mesh)) {
        return;
      }

      set.add(mesh);
      keyShadow.addShadowCaster(mesh, true);
      lamps.forEach((lamp) => addCasterToLamp(lamp, mesh));
    });
  };

  const unregisterMesh = (set: Set<Mesh>, mesh: Mesh) => {
    if (!set.delete(mesh)) {
      return;
    }

    keyShadow.removeShadowCaster(mesh);
    lamps.forEach((lamp) => removeCasterFromLamp(lamp, mesh));
  };

  return {
    registerStatic: (meshes: Mesh[]) => {
      registerMeshes(staticCasters, meshes);
    },
    registerDynamic: (mesh: Mesh) => {
      registerMeshes(dynamicCasters, [mesh]);
    },
    unregisterDynamic: (mesh: Mesh) => {
      unregisterMesh(dynamicCasters, mesh);
    },
    attachLamp: (lamp: BuilderLamp) => {
      if (lamps.has(lamp)) {
        return;
      }

      lamps.add(lamp);
      keyShadow.addShadowCaster(lamp.mesh, true);
      staticCasters.forEach((mesh) => addCasterToLamp(lamp, mesh));
      dynamicCasters.forEach((mesh) => addCasterToLamp(lamp, mesh));
    },
    detachLamp: (lamp: BuilderLamp) => {
      if (!lamps.delete(lamp)) {
        return;
      }

      keyShadow.removeShadowCaster(lamp.mesh);
    },
    dispose: () => {
      staticCasters.clear();
      dynamicCasters.clear();
      lamps.clear();
    },
  };
}
