import { Matrix, MeshBuilder, PBRMaterial, Vector3 } from "babylonjs";
import type { Scene } from "babylonjs";
import { GRID_SIZE, HULL_DIMENSIONS, WALL_DIMENSIONS, LIGHTING_LIMITS } from "../constants";
import type { BuilderWall } from "../types";
import { clamp, degreesToRadians } from "../utils/math";
import { applyHangarTextures, disposeHangarMaterial, getHangarTextureSet } from "../core/hangarTextures";

export function snapWallPosition(point: Vector3) {
  const halfWidth = HULL_DIMENSIONS.width / 2 - WALL_DIMENSIONS.width / 2;
  const halfLength = HULL_DIMENSIONS.length / 2 - WALL_DIMENSIONS.width / 2;

  const snappedX = clamp(
    Math.round(point.x / GRID_SIZE) * GRID_SIZE,
    -halfWidth,
    halfWidth,
  );
  const snappedZ = clamp(
    Math.round(point.z / GRID_SIZE) * GRID_SIZE,
    -halfLength,
    halfLength,
  );

  return new Vector3(snappedX, WALL_DIMENSIONS.height / 2, snappedZ);
}

export function wallKey(position: Vector3, rotation: number) {
  return `${position.x}:${position.y}:${position.z}:${rotation}`;
}

export function createWall(scene: Scene, position: Vector3, rotation: number): BuilderWall {
  const wallMesh = MeshBuilder.CreateBox(
    `builder-wall-${Date.now()}`,
    {
      width: WALL_DIMENSIONS.width,
      height: WALL_DIMENSIONS.height,
      depth: WALL_DIMENSIONS.thickness,
    },
    scene,
  );

  wallMesh.position = position.clone();
  wallMesh.rotation.y = degreesToRadians(rotation);
  wallMesh.checkCollisions = true;

  const armorTextures = getHangarTextureSet(scene, "armor");
  const material = new PBRMaterial(`builder-wall-pbr-${Date.now()}`, scene);
  const tileU = Math.max(WALL_DIMENSIONS.width, WALL_DIMENSIONS.height) * 0.9;
  const tileV = WALL_DIMENSIONS.height * 0.95;
  applyHangarTextures(material, armorTextures, { u: tileU, v: tileV });
  material.ambientTextureStrength = 0.94;
  material.useAmbientInGrayScale = true;
  material.metallic = 0.36;
  material.roughness = 0.88;
  material.microSurface = 0.8;
  material.environmentIntensity = 0.7;
  material.specularIntensity = 1.0;
  material.backFaceCulling = false;
  material.maxSimultaneousLights = LIGHTING_LIMITS.maxSimultaneousLights;
  wallMesh.material = material;

  const key = wallKey(position, rotation);
  const rotationMatrix = Matrix.RotationY(wallMesh.rotation.y);
  const inward = Vector3.TransformNormal(Vector3.Forward(), rotationMatrix).scale(-1).normalize();
  const up = Vector3.Up();

  wallMesh.metadata = {
    toolId: "wall",
    key,
    lampOrientation: {
      forward: inward.asArray(),
      up: up.asArray(),
    },
    textureTiling: { u: tileU, v: tileV },
  };

  wallMesh.onDisposeObservable.add(() => {
    disposeHangarMaterial(material);
  });

  return {
    mesh: wallMesh,
    key,
  };
}
