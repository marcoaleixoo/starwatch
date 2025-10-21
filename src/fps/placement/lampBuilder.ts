import { Color3, Matrix, MeshBuilder, Quaternion, Scene, StandardMaterial, Vector3 } from "babylonjs";
import { LAMP_COLOR_PALETTE, WALL_LAMP_PLACEMENT, LIGHTING_LIMITS } from "../constants";
import type { BuilderLamp, WallLampPlacement } from "../types";
import { createRectAreaLamp } from "../lighting/rectAreaLamp";

export function nextLampColor(index: number) {
  return LAMP_COLOR_PALETTE[index % LAMP_COLOR_PALETTE.length];
}

export function lampKey(placement: WallLampPlacement) {
  // Local coordinates are already snapped, so we can use them for deterministic keys.
  return `${placement.surfaceId}:${placement.local.x}:${placement.local.y}`;
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

  const forwardDir = placement.forward.clone();
  const upDir = placement.up.clone();
  const rightDir = placement.right.clone();

  const basis = new Matrix();
  Matrix.FromXYZAxesToRef(rightDir, upDir, forwardDir, basis);
  const rotation = Quaternion.FromRotationMatrix(basis);

  fixture.rotationQuaternion = rotation;
  const anchoredPosition = placement.position.clone();
  fixture.position = anchoredPosition;
  fixture.isPickable = true;
  fixture.checkCollisions = false;

  const material = new StandardMaterial(`lamp-fixture-mat-${Date.now()}`, scene);
  material.diffuseColor = color.scale(0.18);
  material.specularColor = color.scale(0.24);
  material.emissiveColor = color.scale(1.18);
  material.backFaceCulling = false;
  material.maxSimultaneousLights = LIGHTING_LIMITS.maxSimultaneousLights;
  fixture.material = material;

  const lampKeyValue = lampKey(placement);
  fixture.metadata = { toolId: "lamp", key: lampKeyValue };

  const lamp = createRectAreaLamp({
    name: `lamp-${lampKeyValue}`,
    scene,
    fixture,
    position: anchoredPosition.clone(),
    right: rightDir,
    up: upDir,
    forward: forwardDir,
    areaSize: { width: WALL_LAMP_PLACEMENT.width, height: WALL_LAMP_PLACEMENT.height },
    color,
    range: WALL_LAMP_PLACEMENT.range,
    tilt: WALL_LAMP_PLACEMENT.tilt,
    twoSided: false,
    areaIntensity: WALL_LAMP_PLACEMENT.intensity * 8,
    shadowIntensity: WALL_LAMP_PLACEMENT.intensity,
    ambientIntensity: WALL_LAMP_PLACEMENT.intensity * 0.28,
    ambientRangeMultiplier: 0.7,
    ambientAttenuation: 0.52,
    shadowAngle: Math.PI / 2.35,
    shadowMapSize: WALL_LAMP_PLACEMENT.shadowMapSize,
    shadowBias: 0.00008,
    shadowNormalBias: 0.0014,
    forceBackFacesOnly: false,
    shadowMinZ: 0.004,
    areaOffset: WALL_LAMP_PLACEMENT.depth * 0.42,
    enableRsm: true,
    rsmTextureSize: 192,
    rsmNumSamples: 160,
    rsmRadius: 0.18,
    rsmIntensity: 0.22,
    rsmEdgeCorrection: 0.1,
    rsmNoiseFactor: 70,
  });
  lamp.key = lampKeyValue;
  lamp.mesh.metadata = { toolId: "lamp", key: lampKeyValue };
  lamp.color = color.clone();
  lamp.anchorSurfaceId = placement.surfaceId;
  lamp.local = { x: placement.local.x, y: placement.local.y, z: placement.local.z };
  lamp.rotation = rotation.clone();
  return lamp;
}
