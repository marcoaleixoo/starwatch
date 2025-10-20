import { Color3, Light, Matrix, MeshBuilder, PointLight, Quaternion, Scene, ShadowGenerator, SpotLight, StandardMaterial, Vector3 } from "babylonjs";
import { LAMP_COLOR_PALETTE, WALL_LAMP_PLACEMENT } from "../constants";
import type { BuilderLamp, WallLampPlacement } from "../types";

export function nextLampColor(index: number) {
  return LAMP_COLOR_PALETTE[index % LAMP_COLOR_PALETTE.length];
}

export function lampKey(placement: WallLampPlacement) {
  // Local coordinates are already snapped, so we can use them for deterministic keys.
  return `${placement.mesh.uniqueId}:${placement.local.x}:${placement.local.y}`;
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
  fixture.metadata = { toolId: "lamp", key: lampKeyValue };

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

  const fillLight = new PointLight(
    `lamp-fill-${Date.now()}`,
    placement.position.clone(),
    scene,
  );
  fillLight.diffuse = color.scale(0.52);
  fillLight.specular = color.scale(0.12);
  fillLight.intensity = WALL_LAMP_PLACEMENT.intensity * 0.22;
  fillLight.range = WALL_LAMP_PLACEMENT.range * 0.75;
  fillLight.parent = fixture;

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
    fillLight,
    key: lampKeyValue,
  };
}
