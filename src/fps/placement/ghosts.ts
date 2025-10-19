import {
  Color3,
  Matrix,
  Mesh,
  MeshBuilder,
  Quaternion,
  Scene,
  StandardMaterial,
  Vector3,
} from "babylonjs";
import { WALL_DIMENSIONS, WALL_LAMP_PLACEMENT } from "../constants";
import type { PlacementMode, WallLampPlacement } from "../types";
import { degreesToRadians } from "../utils/math";

export interface GhostSet {
  showWall(position: Vector3, rotation: number): void;
  showLamp(placement: WallLampPlacement): void;
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

  const ghostLamp = MeshBuilder.CreateBox(
    "ghost-lamp",
    {
      width: WALL_LAMP_PLACEMENT.width,
      height: WALL_LAMP_PLACEMENT.height,
      depth: WALL_LAMP_PLACEMENT.depth,
    },
    scene,
  );

  const ghostLampMaterial = new StandardMaterial("ghost-lamp-mat", scene);
  ghostLampMaterial.diffuseColor = new Color3(0.58, 0.78, 0.98);
  ghostLampMaterial.alpha = 0.38;
  ghostLampMaterial.specularColor = new Color3(0.2, 0.35, 0.5);
  ghostLampMaterial.emissiveColor = new Color3(0.32, 0.58, 0.86);
  ghostLampMaterial.backFaceCulling = false;
  ghostLamp.material = ghostLampMaterial;
  ghostLamp.isPickable = false;

  let mode: PlacementMode = "wall";

  const syncVisibility = () => {
    if (mode === "wall") {
      ghostWall.setEnabled(true);
      ghostWallMaterial.alpha = 0.32;
      ghostLamp.setEnabled(false);
      ghostLampMaterial.alpha = 0;
    } else if (mode === "lamp") {
      ghostWall.setEnabled(false);
      ghostWallMaterial.alpha = 0;
      ghostLamp.setEnabled(true);
      ghostLampMaterial.alpha = 0.38;
    } else {
      hide();
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
    showLamp: (placement: WallLampPlacement) => {
      mode = "lamp";
      ghostLamp.position.copyFrom(placement.position);

      const basis = new Matrix();
      Matrix.FromXYZAxesToRef(placement.right, placement.up, placement.forward, basis);
      const rotation = Quaternion.FromRotationMatrix(basis);
      ghostLamp.rotationQuaternion = rotation;

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
