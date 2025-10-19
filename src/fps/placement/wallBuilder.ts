import { Color3, MeshBuilder, StandardMaterial, Vector3 } from "babylonjs";
import type { Scene } from "babylonjs";
import { GRID_SIZE, HULL_DIMENSIONS, WALL_DIMENSIONS } from "../constants";
import type { BuilderWall } from "../types";
import { clamp, degreesToRadians } from "../utils/math";

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

  const material = new StandardMaterial(`builder-wall-mat-${Date.now()}`, scene);
  material.diffuseColor = new Color3(0.72, 0.74, 0.78);
  material.specularColor = new Color3(0.24, 0.26, 0.28);
  material.emissiveColor = new Color3(0.08, 0.1, 0.12);
  material.backFaceCulling = false;
  wallMesh.material = material;

  const key = wallKey(position, rotation);
  wallMesh.metadata = { type: "builder-wall", key };

  return {
    mesh: wallMesh,
    key,
  };
}
