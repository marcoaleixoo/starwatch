import {
  Color3,
  Mesh,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Vector3,
} from "babylonjs";
import { LAMP_DIMENSIONS, WALL_DIMENSIONS } from "../constants";
import type { PlacementMode } from "../types";
import { degreesToRadians } from "../utils/math";

export interface GhostSet {
  showWall(position: Vector3, rotation: number): void;
  showLamp(position: Vector3): void;
  hide(): void;
  setMode(mode: PlacementMode): void;
  dispose(): void;
}

export function createGhostSet(scene: Scene): GhostSet {
  const ghostWall = MeshBuilder.CreateBox(
    "ghost-wall",
    {
      width: WALL_DIMENSIONS.width,
      height: WALL_DIMENSIONS.height,
      depth: WALL_DIMENSIONS.thickness,
    },
    scene,
  );
  const ghostWallMaterial = new StandardMaterial("ghost-wall-mat", scene);
  ghostWallMaterial.diffuseColor = new Color3(0.35, 0.77, 0.93);
  ghostWallMaterial.alpha = 0.32;
  ghostWallMaterial.specularColor = Color3.Black();
  ghostWallMaterial.emissiveColor = new Color3(0.1, 0.25, 0.36);
  ghostWall.material = ghostWallMaterial;
  ghostWall.isPickable = false;

  const ghostLamp = MeshBuilder.CreateCylinder(
    "ghost-lamp",
    {
      height: LAMP_DIMENSIONS.height,
      diameter: LAMP_DIMENSIONS.radius * 2,
      tessellation: 16,
    },
    scene,
  );

  const ghostLampMaterial = new StandardMaterial("ghost-lamp-mat", scene);
  ghostLampMaterial.diffuseColor = new Color3(0.98, 0.85, 0.5);
  ghostLampMaterial.alpha = 0.45;
  ghostLampMaterial.specularColor = new Color3(0.2, 0.2, 0.2);
  ghostLampMaterial.emissiveColor = new Color3(0.75, 0.62, 0.3);
  ghostLamp.material = ghostLampMaterial;
  ghostLamp.isPickable = false;

  let mode: PlacementMode = "wall";

  const syncVisibility = () => {
    if (mode === "wall") {
      ghostWall.setEnabled(true);
      ghostWallMaterial.alpha = 0.32;
      ghostLamp.setEnabled(false);
      ghostLampMaterial.alpha = 0;
    } else {
      ghostWall.setEnabled(false);
      ghostWallMaterial.alpha = 0;
      ghostLamp.setEnabled(true);
      ghostLampMaterial.alpha = 0.45;
    }
  };

  const hide = () => {
    ghostWall.setEnabled(false);
    ghostLamp.setEnabled(false);
    ghostWallMaterial.alpha = 0;
    ghostLampMaterial.alpha = 0;
  };

  hide();

  return {
    showWall: (position: Vector3, rotation: number) => {
      mode = "wall";
      ghostWall.position.copyFrom(position);
      ghostWall.rotation.y = degreesToRadians(rotation);
      syncVisibility();
    },
    showLamp: (position: Vector3) => {
      mode = "lamp";
      ghostLamp.position.copyFrom(position);
      syncVisibility();
    },
    hide: () => {
      hide();
    },
    setMode: (nextMode: PlacementMode) => {
      mode = nextMode;
      hide();
    },
    dispose: () => {
      ghostWall.dispose(false, true);
      ghostLamp.dispose(false, true);
    },
  };
}
