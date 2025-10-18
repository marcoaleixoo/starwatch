import {
  Color3,
  Light,
  Mesh,
  MeshBuilder,
  PointLight,
  Scene,
  ShadowGenerator,
  SpotLight,
  StandardMaterial,
  Vector3,
} from "babylonjs";
import { GRID_SIZE, HULL_DIMENSIONS, LAMP_COLOR_PALETTE, LAMP_DIMENSIONS } from "../constants";
import type { BuilderLamp } from "../types";
import { clamp } from "../utils/math";

interface LampOptions {
  shadowMapSize?: number;
  contactHardening?: boolean;
  spotAngle?: number;
  spotInnerRatio?: number;
  spotExponent?: number;
  spotIntensity?: number;
  spotRange?: number;
  fillIntensity?: number;
  fillRange?: number;
}

export function snapLampPosition(point: Vector3) {
  const halfWidth = HULL_DIMENSIONS.width / 2 - LAMP_DIMENSIONS.radius;
  const halfLength = HULL_DIMENSIONS.length / 2 - LAMP_DIMENSIONS.radius;

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

  return new Vector3(snappedX, LAMP_DIMENSIONS.height / 2, snappedZ);
}

export function lampKey(position: Vector3) {
  return `${position.x}:${position.y}:${position.z}`;
}

export function nextLampColor(index: number) {
  return LAMP_COLOR_PALETTE[index % LAMP_COLOR_PALETTE.length];
}

export function createLamp(
  scene: Scene,
  position: Vector3,
  color: Color3,
  options: LampOptions = {},
): BuilderLamp {
  const {
    shadowMapSize = 512,
    contactHardening = false,
    spotAngle = Math.PI / 1.4,
    spotInnerRatio = 0.62,
    spotExponent = 0.95,
    spotIntensity = 2.25,
    spotRange = 16,
    fillIntensity = 0.58,
    fillRange = 8.5,
  } = options;

  const stemHeight = LAMP_DIMENSIONS.height - LAMP_DIMENSIONS.radius * 2;

  const stand = MeshBuilder.CreateCylinder(
    `lamp-stand-${Date.now()}`,
    {
      height: stemHeight,
      diameter: LAMP_DIMENSIONS.stemRadius * 2,
      tessellation: 18,
    },
    scene,
  );
  stand.position = new Vector3(0, stemHeight / 2, 0);

  const standMaterial = new StandardMaterial(`lamp-stand-mat-${Date.now()}`, scene);
  standMaterial.diffuseColor = new Color3(0.28, 0.31, 0.35);
  standMaterial.specularColor = new Color3(0.46, 0.48, 0.52);
  stand.material = standMaterial;

  const bulb = MeshBuilder.CreateSphere(
    `lamp-bulb-${Date.now()}`,
    {
      diameter: LAMP_DIMENSIONS.radius * 2,
      segments: 24,
    },
    scene,
  );
  bulb.position = new Vector3(0, stemHeight + LAMP_DIMENSIONS.radius, 0);

  const bulbMaterial = new StandardMaterial(`lamp-bulb-mat-${Date.now()}`, scene);
  bulbMaterial.diffuseColor = color.scale(0.85);
  bulbMaterial.emissiveColor = color.scale(1.4);
  bulbMaterial.specularColor = color;
  bulbMaterial.alpha = 0.92;
  bulbMaterial.backFaceCulling = false;
  bulb.material = bulbMaterial;

  const merged = Mesh.MergeMeshes([stand, bulb], true, true, undefined, false, true);
  if (!merged) {
    throw new Error("Failed to create lamp mesh");
  }

  const lampName = `builder-lamp-${Date.now()}`;
  merged.name = lampName;
  merged.position = position.clone();
  merged.checkCollisions = true;

  const key = lampKey(position);
  merged.metadata = { type: "builder-lamp", key };

  const light = new SpotLight(
    `${lampName}-light`,
    merged.position.clone(),
    new Vector3(0, -1, 0),
    spotAngle,
    spotExponent,
    scene,
  );
  light.diffuse = color;
  light.specular = color.scale(0.9);
  light.intensity = spotIntensity;
  light.innerAngle = light.angle * spotInnerRatio;
  light.exponent = spotExponent;
  light.falloffType = Light.FALLOFF_PHYSICAL;
  light.range = spotRange;
  light.shadowEnabled = true;
  light.shadowMinZ = 0.1;
  light.shadowMaxZ = spotRange * 1.05;
  light.parent = merged;
  light.position = new Vector3(0, LAMP_DIMENSIONS.height / 2 - LAMP_DIMENSIONS.radius * 0.6, 0);
  light.setDirectionToTarget(new Vector3(0, -1, 0));

  const fillLight = new PointLight(
    `${lampName}-fill`,
    merged.position.clone(),
    scene,
  );
  fillLight.diffuse = color.scale(0.55);
  fillLight.specular = color.scale(0.18);
  fillLight.intensity = fillIntensity;
  fillLight.range = fillRange;
  fillLight.parent = merged;
  fillLight.position = new Vector3(0, LAMP_DIMENSIONS.height * 0.15, 0);
  fillLight.falloffType = Light.FALLOFF_PHYSICAL;
  fillLight.shadowEnabled = false;

  const shadow = new ShadowGenerator(shadowMapSize, light);
  shadow.bias = 0.0006;
  shadow.darkness = 0.2;
  shadow.normalBias = 0.22;
  shadow.frustumEdgeFalloff = 0.18;
  shadow.filteringQuality = ShadowGenerator.QUALITY_HIGH;

  if (contactHardening) {
    shadow.useContactHardeningShadow = true;
    shadow.contactHardeningLightSizeUVRatio = 0.4;
  } else {
    shadow.usePercentageCloserFiltering = true;
  }

  return {
    mesh: merged,
    light,
    shadow,
    fillLight,
    key,
  };
}
