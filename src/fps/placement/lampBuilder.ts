import {
  AbstractMesh,
  Color3,
  Light,
  Matrix,
  MeshBuilder,
  PickingInfo,
  Quaternion,
  Scene,
  ShadowGenerator,
  SpotLight,
  StandardMaterial,
  Vector3,
} from "babylonjs";
import { GRID_SIZE, LAMP_COLOR_PALETTE, WALL_LAMP_PLACEMENT } from "../constants";
import type { BuilderLamp, WallLampPlacement } from "../types";
import { clamp } from "../utils/math";

const LOCAL_RIGHT = Vector3.Right();
const LOCAL_UP = Vector3.Up();

export function nextLampColor(index: number) {
  return LAMP_COLOR_PALETTE[index % LAMP_COLOR_PALETTE.length];
}

export function lampKey(placement: WallLampPlacement) {
  // Local coordinates are already snapped, so we can use them for deterministic keys.
  return `${placement.mesh.uniqueId}:${placement.local.x}:${placement.local.y}`;
}

export function computeWallLampPlacement(pick: PickingInfo): WallLampPlacement | null {
  const mesh = pick.pickedMesh as AbstractMesh | undefined;
  if (!mesh || !pick.hit || !pick.pickedPoint) {
    return null;
  }

  const type = mesh.metadata?.type;
  if (type !== "ship-wall" && type !== "builder-wall") {
    return null;
  }

  const worldMatrix = mesh.getWorldMatrix();
  const inverse = new Matrix();
  worldMatrix.invertToRef(inverse);

  const localPoint = Vector3.TransformCoordinates(pick.pickedPoint, inverse);
  const bounds = mesh.getBoundingInfo().boundingBox.extendSize;

  const halfWidth = bounds.x;
  const halfHeight = bounds.y;

  const minWidth = Math.max(halfWidth - (WALL_LAMP_PLACEMENT.width / 2 + 0.06), 0);
  const minHeight = Math.max(halfHeight - (WALL_LAMP_PLACEMENT.height / 2 + 0.08), 0);

  const snappedLocalX = clamp(
    Math.round(localPoint.x / GRID_SIZE) * GRID_SIZE,
    -minWidth,
    minWidth,
  );

  const snappedLocalY = clamp(
    Math.round(localPoint.y / GRID_SIZE) * GRID_SIZE,
    -minHeight,
    minHeight,
  );

  const baseLocal = new Vector3(snappedLocalX, snappedLocalY, 0);
  const baseWorld = Vector3.TransformCoordinates(baseLocal, worldMatrix);

  const axisX = Vector3.TransformNormal(LOCAL_RIGHT, worldMatrix).normalize();
  const axisY = Vector3.TransformNormal(LOCAL_UP, worldMatrix).normalize();
  const axisZ = Vector3.TransformNormal(Vector3.Forward(), worldMatrix).normalize();

  const faceSign = localPoint.z >= 0 ? 1 : -1;
  const forward = axisZ.scale(-faceSign).normalize();
  const right = axisX.normalize();
  const up = axisY.normalize();

  const depthOffset = WALL_LAMP_PLACEMENT.depth / 2 + WALL_LAMP_PLACEMENT.offset;
  const position = baseWorld.add(forward.scale(depthOffset));

  return {
    mesh,
    position,
    forward,
    right,
    up,
    local: {
      x: Number(snappedLocalX.toFixed(3)),
      y: Number(snappedLocalY.toFixed(3)),
    },
  };
}

export function createLamp(scene: Scene, placement: WallLampPlacement, color: Color3): BuilderLamp {
  const fixture = MeshBuilder.CreateBox(
    `lamp-fixture-${Date.now()}`,
    {
      width: WALL_LAMP_PLACEMENT.width,
      height: WALL_LAMP_PLACEMENT.height,
      depth: WALL_LAMP_PLACEMENT.depth,
    },
    scene,
  );

  const basis = new Matrix();
  Matrix.FromXYZAxesToRef(placement.right, placement.up, placement.forward, basis);
  const rotation = Quaternion.FromRotationMatrix(basis);

  fixture.rotationQuaternion = rotation;
  fixture.position = placement.position.clone();
  fixture.isPickable = true;
  fixture.checkCollisions = false;

  const material = new StandardMaterial(`lamp-fixture-mat-${Date.now()}`, scene);
  material.diffuseColor = color.scale(0.18);
  material.specularColor = color.scale(0.24);
  material.emissiveColor = color.scale(1.18);
  material.backFaceCulling = false;
  fixture.material = material;

  const lampKeyValue = lampKey(placement);
  fixture.metadata = { type: "builder-lamp", key: lampKeyValue };

  const tiltDirection = Vector3.Normalize(
    placement.forward.scale(1).add(placement.up.scale(-WALL_LAMP_PLACEMENT.tilt)),
  );

  const light = new SpotLight(
    `lamp-light-${Date.now()}`,
    placement.position.clone(),
    tiltDirection,
    Math.PI / 2.45,
    1.05,
    scene,
  );
  light.diffuse = color;
  light.specular = color.scale(0.32);
  light.intensity = WALL_LAMP_PLACEMENT.intensity;
  light.falloffType = Light.FALLOFF_PHYSICAL;
  light.range = WALL_LAMP_PLACEMENT.range;
  light.shadowEnabled = true;
  light.shadowMinZ = 0.1;
  light.shadowMaxZ = WALL_LAMP_PLACEMENT.range * 1.05;
  light.parent = fixture;

  const shadow = new ShadowGenerator(WALL_LAMP_PLACEMENT.shadowMapSize, light);
  shadow.usePercentageCloserFiltering = true;
  shadow.filteringQuality = ShadowGenerator.QUALITY_HIGH;
  shadow.bias = 0.00052;
  shadow.normalBias = 0.16;
  shadow.darkness = 0.18;
  shadow.frustumEdgeFalloff = 0.14;

  return {
    mesh: fixture,
    light,
    shadow,
    key: lampKeyValue,
  };
}
