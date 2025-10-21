import {
  Color3,
  Light,
  Matrix,
  PointLight,
  Quaternion,
  RectAreaLight,
  ReflectiveShadowMap,
  Scene,
  ShadowGenerator,
  ShadowLight,
  SpotLight,
  TransformNode,
  Vector3,
  GIRSM,
} from "babylonjs";
import type { Mesh } from "babylonjs";
import type { BuilderLamp } from "../types";

export interface RectAreaLampOptions {
  name: string;
  scene: Scene;
  fixture: Mesh;
  position: Vector3;
  right: Vector3;
  up: Vector3;
  forward: Vector3;
  areaSize: { width: number; height: number };
  color: Color3;
  range: number;
  tilt?: number;
  twoSided?: boolean;
  areaIntensity?: number;
  shadowIntensity?: number;
  ambientIntensity?: number;
  ambientRangeMultiplier?: number;
  ambientAttenuation?: number;
  shadowAngle?: number;
  shadowExponent?: number;
  shadowMapSize?: number;
  shadowBias?: number;
  shadowNormalBias?: number;
  forceBackFacesOnly?: boolean;
  shadowMinZ?: number;
  shadowMaxZ?: number;
  areaOffset?: number;
  enableRsm?: boolean;
  rsmTextureSize?: number;
  rsmNumSamples?: number;
  rsmRadius?: number;
  rsmIntensity?: number;
  rsmEdgeCorrection?: number;
  rsmRotateSample?: boolean;
  rsmNoiseFactor?: number;
  rsmUseFullTexture?: boolean;
}

const DEFAULT_AREA_OFFSET = 0.015;
const DEFAULT_SHADOW_BIAS = 0.00022;
const DEFAULT_SHADOW_NORMAL_BIAS = 0.0035;
const DEFAULT_FORCE_BACK_FACES_ONLY = false;
const DEFAULT_SHADOW_MIN_Z = 0.01;
const SHADOW_MAX_Z_MULTIPLIER = 1.35;

function safeOrthonormalBasis(forward: Vector3, upHint: Vector3, rightHint: Vector3) {
  const forwardNorm = forward.clone();
  forwardNorm.normalize();

  const upCandidate = upHint.clone().normalize();
  let right = Vector3.Cross(upCandidate, forwardNorm);
  if (right.lengthSquared() < 1e-4) {
    right = rightHint.clone();
  }
  right.normalize();

  let up = Vector3.Cross(forwardNorm, right);
  if (up.lengthSquared() < 1e-4) {
    up = upCandidate;
  }
  up.normalize();

  return { forward: forwardNorm, up, right };
}

export function createRectAreaLamp(options: RectAreaLampOptions): BuilderLamp {
  const {
    name,
    scene,
    fixture,
    position,
    right,
    up,
    forward,
    areaSize,
    color,
    range,
    tilt = 0,
    twoSided = false,
    areaIntensity = 12.5,
    shadowIntensity = 1.35,
    ambientIntensity = 0.32,
    ambientRangeMultiplier = 0.85,
    ambientAttenuation = 0.6,
    shadowAngle = Math.PI / 2.15,
    shadowMapSize = 1024,
    shadowBias = DEFAULT_SHADOW_BIAS,
    shadowNormalBias = DEFAULT_SHADOW_NORMAL_BIAS,
    forceBackFacesOnly = DEFAULT_FORCE_BACK_FACES_ONLY,
    shadowMinZ = DEFAULT_SHADOW_MIN_Z,
    shadowMaxZ,
    areaOffset = DEFAULT_AREA_OFFSET,
    enableRsm = false,
    rsmTextureSize = 256,
    rsmNumSamples = 240,
    rsmRadius = 0.22,
    rsmIntensity = 0.22,
    rsmEdgeCorrection = 0.08,
    rsmRotateSample = true,
    rsmNoiseFactor = 80,
    rsmUseFullTexture = false,
  } = options;

  const forwardDir = forward.clone().normalize();
  const upDir = up.clone().normalize();
  const rightDir = right.clone().normalize();

  const emissionForward = forwardDir.add(upDir.scale(-tilt)).normalize();
  const emissionDir = emissionForward.clone();
  const { up: basisUp, right: basisRight } = safeOrthonormalBasis(emissionForward, upDir, rightDir);

  const pivotForwardWorld = emissionDir.clone().scale(-1);
  const areaBasisWorld = new Matrix();
  Matrix.FromXYZAxesToRef(basisRight, basisUp, pivotForwardWorld, areaBasisWorld);

  const areaPositionWorld = position.add(emissionDir.clone().scale(areaOffset));

  const fixtureWorld = fixture.computeWorldMatrix(true);
  const fixtureWorldInverse = fixtureWorld.clone();
  fixtureWorldInverse.invert();

  const areaPositionLocal = Vector3.TransformCoordinates(areaPositionWorld, fixtureWorldInverse);
  const areaBasisLocal = areaBasisWorld.multiply(fixtureWorldInverse);
  const areaRotationLocal = Quaternion.FromRotationMatrix(areaBasisLocal);

  const areaPivot = new TransformNode(`${name}-area-pivot`, scene);
  areaPivot.parent = fixture;
  areaPivot.position.copyFrom(areaPositionLocal);
  areaPivot.rotationQuaternion = areaRotationLocal;

  const areaLight = new RectAreaLight(`${name}-area`, Vector3.Zero(), areaSize.width, areaSize.height, scene);
  areaLight.diffuse = color.clone();
  areaLight.specular = color.scale(0.25);
  areaLight.intensity = areaIntensity;
  areaLight.range = range;
  areaLight.falloffType = Light.FALLOFF_PHYSICAL;
  areaLight.intensityMode = Light.INTENSITYMODE_LUMINANCE;
  if (twoSided) {
    areaLight.radius = Math.max(areaSize.width, areaSize.height) * 0.5;
  }
  areaLight.parent = areaPivot;

  const shadowLight = new SpotLight(
    `${name}-shadow`,
    Vector3.Zero(),
    Vector3.Backward(),
    shadowAngle,
    1.0,
    scene,
  );
  shadowLight.diffuse = color;
  shadowLight.specular = color.scale(0.34);
  shadowLight.intensity = shadowIntensity;
  shadowLight.falloffType = Light.FALLOFF_PHYSICAL;
  shadowLight.range = range * 1.08;
  shadowLight.shadowEnabled = true;
  shadowLight.shadowMinZ = shadowMinZ;
  shadowLight.shadowMaxZ = shadowMaxZ ?? range * SHADOW_MAX_Z_MULTIPLIER;
  shadowLight.parent = areaPivot;

  const shadow = new ShadowGenerator(shadowMapSize, shadowLight);
  shadow.usePercentageCloserFiltering = true;
  shadow.filteringQuality = ShadowGenerator.QUALITY_HIGH;
  shadow.bias = shadowBias;
  shadow.normalBias = Math.min(Math.max(shadowNormalBias, 0), 0.1);
  shadow.forceBackFacesOnly = forceBackFacesOnly;
  shadow.contactHardeningLightSizeUVRatio = 0.28;
  shadow.darkness = 0.18;
  shadow.frustumEdgeFalloff = 0.18;

  const ambientLight = new PointLight(`${name}-ambient`, Vector3.Zero(), scene);
  ambientLight.diffuse = color.scale(ambientAttenuation);
  ambientLight.specular = color.scale(0.06);
  ambientLight.intensity = ambientIntensity;
  ambientLight.range = range * ambientRangeMultiplier;
  ambientLight.falloffType = Light.FALLOFF_PHYSICAL;
  ambientLight.shadowEnabled = false;
  ambientLight.parent = areaPivot;

  let giState: BuilderLamp["gi"];
  if (enableRsm) {
    const rsm = new ReflectiveShadowMap(scene, shadowLight, { width: rsmTextureSize, height: rsmTextureSize });
    rsm.enable = true;
    rsm.addMesh();
    const solution = new GIRSM(rsm);
    solution.numSamples = rsmNumSamples;
    solution.radius = rsmRadius;
    solution.intensity = rsmIntensity;
    solution.edgeArtifactCorrection = rsmEdgeCorrection;
    solution.rotateSample = rsmRotateSample;
    solution.noiseFactor = rsmNoiseFactor;
    solution.useFullTexture = rsmUseFullTexture;
    giState = { rsm, solution };
  }

  return {
    mesh: fixture,
    light: shadowLight,
    shadow,
    areaLight,
    auxiliaryLights: [ambientLight],
    gi: giState,
    key: "",
  };
}
