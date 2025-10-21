import { Color3, Color4, Engine, GlowLayer, Mesh, MeshBuilder, Scene, Vector3, PBRMaterial, StandardMaterial } from "babylonjs";
import {
  GRID_SIZE,
  HULL_DIMENSIONS,
  WALL_DIMENSIONS,
  LIGHTING_LIMITS,
} from "../constants";
import type { BuilderLamp } from "../types";
import { createSurfaceRegistry } from "../placement/surfaces/surfaceRegistry";
import type { SurfaceRegistry } from "../placement/surfaces/surfaceRegistry";
import { FloorSurface } from "../placement/surfaces/floorSurface";
import { WallSurface } from "../placement/surfaces/wallSurface";
import { createRectAreaLamp } from "../lighting/rectAreaLamp";
import {
  applyHangarTextures,
  disposeHangarMaterial,
  disposeHangarTextureCache,
  getHangarTextureSet,
  type HangarTextureSet,
} from "./hangarTextures";

export interface SceneContext {
  engine: Engine;
  scene: Scene;
  glowLayer: GlowLayer;
  floor: Mesh;
  staticMeshes: Mesh[];
  structuralLamps: BuilderLamp[];
  surfaceRegistry: SurfaceRegistry;
  dispose(): void;
}

export function createSceneContext(canvas: HTMLCanvasElement): SceneContext {
  const engine = new Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
    doNotHandleContextLost: true,
  });
  engine.disableUniformBuffers = true;

  const scene = new Scene(engine);
  scene.clearColor = new Color4(5 / 255, 6 / 255, 10 / 255, 1);
  scene.ambientColor = Color3.Black();
  scene.gravity = new Vector3(0, -9.81, 0);
  scene.collisionsEnabled = true;
  scene.imageProcessingConfiguration.toneMappingEnabled = true;
  scene.imageProcessingConfiguration.exposure = 1.08;
  scene.imageProcessingConfiguration.contrast = 1.04;

  const glowLayer = new GlowLayer("hangar-glow", scene);
  glowLayer.intensity = 0.18;

  const floorTextures = getHangarTextureSet(scene, "metal");
  const wallTextures = getHangarTextureSet(scene, "armor");

  const { floor, ceiling, walls } = buildHangar(scene, {
    floor: floorTextures,
    wall: wallTextures,
  });
  const surfaceRegistry = createSurfaceRegistry();
  surfaceRegistry.register(
    new FloorSurface({
      id: "hangar-floor",
      mesh: floor,
      up: Vector3.Up(),
      forward: new Vector3(0, 0, 1),
    }),
  );
  walls.forEach((wall) => {
    const inward = new Vector3(-wall.position.x, 0, -wall.position.z);
    if (inward.lengthSquared() < 1e-4) {
      const normal = Vector3.TransformNormal(Vector3.Forward(), wall.getWorldMatrix());
      inward.copyFrom(normal.scale(-1));
      inward.y = 0;
    }
    if (inward.lengthSquared() < 1e-4) {
      inward.copyFrom(Vector3.Forward());
    }
    surfaceRegistry.register(
      new WallSurface({
        id: wall.name ?? `wall-${wall.uniqueId}`,
        mesh: wall,
        inward,
        up: Vector3.Up(),
      }),
    );
  });
  const staticMeshes = [...walls, ceiling];
  floor.receiveShadows = true;
  floor.checkCollisions = true;
  staticMeshes.forEach((mesh) => {
    mesh.receiveShadows = true;
    mesh.checkCollisions = true;
  });

  const structuralLamps = createStructuralLamps(scene);
  structuralLamps.forEach((lamp) => {
    lamp.mesh.checkCollisions = false;
    lamp.mesh.isPickable = false;
  });

  engine.runRenderLoop(() => {
    scene.render();
  });

  const resize = () => {
    engine.resize();
  };
  window.addEventListener("resize", resize);

  const sceneContext: SceneContext = {
    engine,
    scene,
    glowLayer,
    floor,
    staticMeshes,
    structuralLamps,
    surfaceRegistry,
    dispose: () => {
      window.removeEventListener("resize", resize);
      glowLayer.dispose();
      structuralLamps.forEach((lamp) => {
        lamp.shadow.dispose();
        lamp.light.dispose();
        lamp.areaLight?.dispose();
        lamp.fillLight?.dispose();
        lamp.auxiliaryLights?.forEach((aux) => aux.dispose());
        if (lamp.gi) {
          lamp.gi.solution.dispose();
          lamp.gi.rsm.dispose();
        }
        lamp.mesh.dispose(false, true);
      });
      surfaceRegistry.dispose();
      disposeHangarMaterials([floor, ceiling, ...walls]);
      disposeHangarTextureCache(scene);
      scene.dispose();
      engine.dispose();
    },
  };
  return sceneContext;
}

interface HangarAssets {
  floor: Mesh;
  ceiling: Mesh;
  walls: Mesh[];
}

function buildHangar(
  scene: Scene,
  textures: {
    floor: HangarTextureSet;
    wall: HangarTextureSet;
  },
): HangarAssets {
  const floor = createHangarFloor(scene, textures.floor);
  const ceiling = createHangarCeiling(scene, textures.floor);
  const walls = createHangarWalls(scene, textures.wall);
  return { floor, ceiling, walls };
}

function createHangarFloor(scene: Scene, textures: HangarTextureSet): Mesh {
  const subdivisionsX = Math.max(1, Math.round(HULL_DIMENSIONS.width / GRID_SIZE));
  const subdivisionsZ = Math.max(1, Math.round(HULL_DIMENSIONS.length / GRID_SIZE));

  const floor = MeshBuilder.CreateGround(
    "hangar-floor",
    {
      width: HULL_DIMENSIONS.width,
      height: HULL_DIMENSIONS.length,
      subdivisionsX,
      subdivisionsY: subdivisionsZ,
    },
    scene,
  );
  floor.position.y = 0;
  floor.metadata = { type: "ship-foundation", textureTiling: { u: 4.2, v: 6.0 } };

  const floorMaterial = new PBRMaterial("floor-pbr", scene);
  applyHangarTextures(floorMaterial, textures, (floor.metadata as { textureTiling: { u: number; v: number } }).textureTiling);
  floorMaterial.ambientTextureStrength = 0.92;
  floorMaterial.useAmbientInGrayScale = true;
  floorMaterial.metallic = 0.42;
  floorMaterial.roughness = 0.84;
  floorMaterial.microSurface = 0.86;
  floorMaterial.environmentIntensity = 0.72;
  floorMaterial.specularIntensity = 1.1;
  floorMaterial.backFaceCulling = true;
  floorMaterial.maxSimultaneousLights = LIGHTING_LIMITS.maxSimultaneousLights;
  floor.material = floorMaterial;

  return floor;
}

function createHangarCeiling(scene: Scene, textures: HangarTextureSet): Mesh {
  const subdivisionsX = Math.max(1, Math.round(HULL_DIMENSIONS.width / GRID_SIZE));
  const subdivisionsZ = Math.max(1, Math.round(HULL_DIMENSIONS.length / GRID_SIZE));

  const ceiling = MeshBuilder.CreateGround(
    "hangar-ceiling",
    {
      width: HULL_DIMENSIONS.width,
      height: HULL_DIMENSIONS.length,
      subdivisionsX,
      subdivisionsY: subdivisionsZ,
    },
    scene,
  );
  ceiling.position.y = HULL_DIMENSIONS.height;
  ceiling.rotation.x = Math.PI;
  ceiling.metadata = { type: "ship-foundation", textureTiling: { u: 3.4, v: 5.0 } };

  const ceilingMaterial = new PBRMaterial("ceiling-pbr", scene);
  applyHangarTextures(
    ceilingMaterial,
    textures,
    (ceiling.metadata as { textureTiling: { u: number; v: number } }).textureTiling,
  );
  ceilingMaterial.ambientTextureStrength = 0.85;
  ceilingMaterial.useAmbientInGrayScale = true;
  ceilingMaterial.metallic = 0.28;
  ceilingMaterial.roughness = 0.9;
  ceilingMaterial.microSurface = 0.78;
  ceilingMaterial.environmentIntensity = 0.66;
  ceilingMaterial.specularIntensity = 0.9;
  ceilingMaterial.maxSimultaneousLights = LIGHTING_LIMITS.maxSimultaneousLights;
  ceiling.material = ceilingMaterial;

  return ceiling;
}

function createHangarWalls(scene: Scene, textures: HangarTextureSet): Mesh[] {
  const halfHeight = HULL_DIMENSIONS.height / 2;
  const thickness = WALL_DIMENSIONS.thickness;
  const footingDepth = WALL_DIMENSIONS.footingDepth ?? 0;
  const wallHeight = HULL_DIMENSIONS.height + footingDepth;
  const centerY = halfHeight - footingDepth / 2;

  return [
    createHangarWall(scene, textures, {
      name: "wall-north",
      size: { width: HULL_DIMENSIONS.width, height: wallHeight, depth: thickness },
      position: new Vector3(0, centerY, -HULL_DIMENSIONS.length / 2),
      inward: new Vector3(0, 0, 1),
    }),
    createHangarWall(scene, textures, {
      name: "wall-south",
      size: { width: HULL_DIMENSIONS.width, height: wallHeight, depth: thickness },
      position: new Vector3(0, centerY, HULL_DIMENSIONS.length / 2),
      inward: new Vector3(0, 0, -1),
    }),
    createHangarWall(scene, textures, {
      name: "wall-east",
      size: { width: HULL_DIMENSIONS.length, height: wallHeight, depth: thickness },
      position: new Vector3(HULL_DIMENSIONS.width / 2, centerY, 0),
      rotationY: Math.PI / 2,
      inward: new Vector3(-1, 0, 0),
    }),
    createHangarWall(scene, textures, {
      name: "wall-west",
      size: { width: HULL_DIMENSIONS.length, height: wallHeight, depth: thickness },
      position: new Vector3(-HULL_DIMENSIONS.width / 2, centerY, 0),
      rotationY: Math.PI / 2,
      inward: new Vector3(1, 0, 0),
    }),
  ];
}

function createHangarWall(
  scene: Scene,
  textures: HangarTextureSet,
  config: {
    name: string;
    size: { width: number; height: number; depth: number };
    position: Vector3;
    inward: Vector3;
    rotationY?: number;
  },
): Mesh {
  const wall = MeshBuilder.CreateBox(
    config.name,
    {
      width: config.size.width,
      height: config.size.height,
      depth: config.size.depth,
    },
    scene,
  );

  wall.position = config.position.clone();
  if (typeof config.rotationY === "number") {
    wall.rotation.y = config.rotationY;
  }
  wall.checkCollisions = true;
  wall.isPickable = true;

  const wallMaterial = new PBRMaterial(`${config.name}-pbr`, scene);
  const footingDepth = WALL_DIMENSIONS.footingDepth ?? 0;
  const visibleHeight = config.size.height - footingDepth;
  const tileU = Math.max(config.size.width, visibleHeight) * 0.9;
  const tileV = visibleHeight * 0.95;
  applyHangarTextures(wallMaterial, textures, { u: tileU, v: tileV });
  wallMaterial.ambientTextureStrength = 0.94;
  wallMaterial.useAmbientInGrayScale = true;
  wallMaterial.metallic = 0.36;
  wallMaterial.roughness = 0.88;
  wallMaterial.microSurface = 0.8;
  wallMaterial.environmentIntensity = 0.7;
  wallMaterial.specularIntensity = 1.0;
  wallMaterial.backFaceCulling = true;
  wallMaterial.twoSidedLighting = false;
  wallMaterial.maxSimultaneousLights = LIGHTING_LIMITS.maxSimultaneousLights;
  wall.material = wallMaterial;

  const inward = config.inward.clone().normalize();
  const up = Vector3.Up();
  const existingMetadata = (wall.metadata as Record<string, unknown>) ?? {};
  wall.metadata = {
    ...existingMetadata,
    type: "ship-wall",
    lampOrientation: {
      forward: inward.asArray(),
      up: up.asArray(),
    },
    textureTiling: { u: tileU, v: tileV },
  };

  return wall;
}

function disposeHangarMaterials(meshes: Mesh[]) {
  meshes.forEach((mesh) => {
    const material = mesh.material;
    if (material instanceof PBRMaterial) {
      disposeHangarMaterial(material);
      material.dispose(false, true);
    }
  });
}

function createStructuralLamps(scene: Scene): BuilderLamp[] {
  const color = new Color3(0.6, 0.78, 1);
  const height = HULL_DIMENSIONS.height - 0.22;
  const bandDepth = 0.22;
  const bandThickness = 0.12;
  const inset = bandDepth / 2 + 0.015;
  const spanX = HULL_DIMENSIONS.width * 0.62;
  const spanZ = HULL_DIMENSIONS.length * 0.62;
  const range = Math.max(HULL_DIMENSIONS.length, HULL_DIMENSIONS.width) * 1.25;

  return [
    createWallBandLamp(scene, {
      name: "structural-light-north",
      span: spanX,
      thickness: bandThickness,
      depth: bandDepth,
      position: new Vector3(0, height, -HULL_DIMENSIONS.length / 2 + inset),
      direction: new Vector3(0, -0.45, 1),
      color,
      range,
    }),
    createWallBandLamp(scene, {
      name: "structural-light-south",
      span: spanX,
      thickness: bandThickness,
      depth: bandDepth,
      position: new Vector3(0, height, HULL_DIMENSIONS.length / 2 - inset),
      direction: new Vector3(0, -0.45, -1),
      color,
      range,
    }),
    createWallBandLamp(scene, {
      name: "structural-light-east",
      span: spanZ,
      thickness: bandThickness,
      depth: bandDepth,
      position: new Vector3(HULL_DIMENSIONS.width / 2 - inset, height, 0),
      rotationY: Math.PI / 2,
      direction: new Vector3(-1, -0.45, 0),
      color,
      range,
    }),
    createWallBandLamp(scene, {
      name: "structural-light-west",
      span: spanZ,
      thickness: bandThickness,
      depth: bandDepth,
      position: new Vector3(-HULL_DIMENSIONS.width / 2 + inset, height, 0),
      rotationY: Math.PI / 2,
      direction: new Vector3(1, -0.45, 0),
      color,
      range,
    }),
  ];
}

function createWallBandLamp(
  scene: Scene,
  config: {
    name: string;
    span: number;
    thickness: number;
    depth: number;
    position: Vector3;
    direction: Vector3;
    color: Color3;
    range: number;
    rotationY?: number;
    angle?: number;
    shadowMapSize?: number;
  },
): BuilderLamp {
  const fixture = MeshBuilder.CreateBox(
    `${config.name}-fixture`,
    {
      width: config.span,
      height: config.thickness,
      depth: config.depth,
    },
    scene,
  );

  fixture.position = config.position.clone();
  if (config.rotationY !== undefined) {
    fixture.rotation.y = config.rotationY;
  }
  fixture.isPickable = true;
  fixture.checkCollisions = false;
  fixture.metadata = { type: "builder-lamp", key: config.name };

  const fixtureMaterial = new StandardMaterial(`${config.name}-mat`, scene);
  fixtureMaterial.diffuseColor = config.color.scale(0.18);
  fixtureMaterial.specularColor = config.color.scale(0.26);
  fixtureMaterial.emissiveColor = config.color.scale(1.12);
  fixtureMaterial.backFaceCulling = false;
  fixtureMaterial.maxSimultaneousLights = LIGHTING_LIMITS.maxSimultaneousLights;
  fixture.material = fixtureMaterial;

  const forward = Vector3.Normalize(config.direction);
  let right = Vector3.Cross(Vector3.Up(), forward);
  if (right.lengthSquared() < 1e-4) {
    right = new Vector3(1, 0, 0);
  }
  right.normalize();

  const lamp = createRectAreaLamp({
    name: config.name,
    scene,
    fixture,
    position: fixture.position.clone(),
    right,
    up: Vector3.Up(),
    forward,
    areaSize: { width: config.span, height: config.thickness },
    color: config.color,
    range: config.range,
    tilt: 0.4,
    twoSided: false,
    areaIntensity: 24,
    shadowIntensity: 1.6,
    ambientIntensity: 0.42,
    ambientRangeMultiplier: 0.76,
    ambientAttenuation: 0.58,
    shadowAngle: config.angle ?? Math.PI / 2.3,
    shadowMapSize: config.shadowMapSize ?? 1024,
    shadowBias: 0.00022,
    shadowNormalBias: 0.0035,
    forceBackFacesOnly: false,
    shadowMinZ: 0.008,
    areaOffset: config.depth * 0.45,
    enableRsm: true,
    rsmTextureSize: 256,
    rsmNumSamples: 220,
    rsmRadius: 0.24,
    rsmIntensity: 0.26,
    rsmEdgeCorrection: 0.09,
    rsmRotateSample: true,
    rsmNoiseFactor: 90,
  });
  lamp.key = config.name;
  return lamp;
}
