import type { Mesh } from "babylonjs";
import type { BuilderLamp } from "../types";
import type { ShadowGenerator } from "babylonjs";

export interface ShadowNetwork {
  registerStatic(meshes: Mesh[]): void;
  registerDynamic(mesh: Mesh): void;
  unregisterDynamic(mesh: Mesh): void;
  registerGenerator(generator: ShadowGenerator): void;
  attachLamp(lamp: BuilderLamp): void;
  detachLamp(lamp: BuilderLamp): void;
  dispose(): void;
}

export function createShadowNetwork(initialGenerators: ShadowGenerator[] = []): ShadowNetwork {
  const staticCasters = new Set<Mesh>();
  const dynamicCasters = new Set<Mesh>();
  const lamps = new Set<BuilderLamp>();
  const generators = new Set<ShadowGenerator>(initialGenerators);

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
      generators.forEach((generator) => {
        generator.addShadowCaster(mesh, true);
      });
      lamps.forEach((lamp) => addCasterToLamp(lamp, mesh));
    });
  };

  const unregisterMesh = (set: Set<Mesh>, mesh: Mesh) => {
    if (!set.delete(mesh)) {
      return;
    }

    generators.forEach((generator) => {
      generator.removeShadowCaster(mesh);
    });
    lamps.forEach((lamp) => removeCasterFromLamp(lamp, mesh));
  };

  const addGenerator = (generator: ShadowGenerator) => {
    if (generators.has(generator)) {
      return;
    }

    generators.add(generator);
    staticCasters.forEach((mesh) => generator.addShadowCaster(mesh, true));
    dynamicCasters.forEach((mesh) => generator.addShadowCaster(mesh, true));
    lamps.forEach((lamp) => {
      if (lamp.shadow !== generator) {
        generator.addShadowCaster(lamp.mesh, true);
      }
    });
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
    registerGenerator: (generator: ShadowGenerator) => {
      addGenerator(generator);
    },
    attachLamp: (lamp: BuilderLamp) => {
      if (lamps.has(lamp)) {
        return;
      }

      lamps.add(lamp);
      addGenerator(lamp.shadow);
      generators.forEach((generator) => {
        if (generator !== lamp.shadow) {
          generator.addShadowCaster(lamp.mesh, true);
        }
      });
      staticCasters.forEach((mesh) => addCasterToLamp(lamp, mesh));
      dynamicCasters.forEach((mesh) => addCasterToLamp(lamp, mesh));
    },
    detachLamp: (lamp: BuilderLamp) => {
      if (!lamps.delete(lamp)) {
        return;
      }

      generators.forEach((generator) => {
        generator.removeShadowCaster(lamp.mesh);
      });
      generators.delete(lamp.shadow);
      staticCasters.forEach((mesh) => removeCasterFromLamp(lamp, mesh));
      dynamicCasters.forEach((mesh) => removeCasterFromLamp(lamp, mesh));
    },
    dispose: () => {
      staticCasters.clear();
      dynamicCasters.clear();
      lamps.clear();
      generators.clear();
    },
  };
}
