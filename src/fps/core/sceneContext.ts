import {
  Color3,
  Color4,
  Engine,
  GlowLayer,
  Light,
  Mesh,
  MeshBuilder,
  Scene,
  ShadowGenerator,
  SpotLight,
  StandardMaterial,
  UniversalCamera,
  Vector3,
} from "babylonjs";
import { CAMERA_SETTINGS, GRID_SIZE, HULL_DIMENSIONS, INPUT_KEYS, WALL_DIMENSIONS } from "../constants";
import type { BuilderLamp } from "../types";

export interface SceneContext {
  engine: Engine;
  scene: Scene;
  camera: UniversalCamera;
  glowLayer: GlowLayer;
  floor: Mesh;
  staticMeshes: Mesh[];
  structuralLamps: BuilderLamp[];
  dispose(): void;
}

export function createSceneContext(canvas: HTMLCanvasElement): SceneContext {
  const engine = new Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
    doNotHandleContextLost: true,
  });

  const scene = new Scene(engine);
  scene.clearColor = new Color4(5 / 255, 6 / 255, 10 / 255, 1);
  scene.ambientColor = Color3.Black();
  scene.gravity = new Vector3(0, -9.81, 0);
  scene.collisionsEnabled = true;
  scene.imageProcessingConfiguration.toneMappingEnabled = true;
  scene.imageProcessingConfiguration.exposure = 1.08;
  scene.imageProcessingConfiguration.contrast = 1.04;

  const camera = new UniversalCamera(
    "fpCam",
    new Vector3(0, CAMERA_SETTINGS.eyeLevel, -HULL_DIMENSIONS.length / 2 + 4),
    scene,
  );
  camera.minZ = CAMERA_SETTINGS.minZ;
  camera.maxZ = CAMERA_SETTINGS.maxZ;
  camera.speed = CAMERA_SETTINGS.speed;
  camera.angularSensibility = CAMERA_SETTINGS.angularSensibility;
  camera.inertia = CAMERA_SETTINGS.inertia;
  camera.applyGravity = true;
  camera.checkCollisions = true;
  camera.ellipsoid = new Vector3(
    CAMERA_SETTINGS.ellipsoid.x,
    CAMERA_SETTINGS.ellipsoid.y,
    CAMERA_SETTINGS.ellipsoid.z,
  );
  camera.ellipsoidOffset = new Vector3(
    CAMERA_SETTINGS.ellipsoidOffset.x,
    CAMERA_SETTINGS.ellipsoidOffset.y,
    CAMERA_SETTINGS.ellipsoidOffset.z,
  );
  camera.keysUp.push(INPUT_KEYS.move.forward);
  camera.keysLeft.push(INPUT_KEYS.move.left);
  camera.keysDown.push(INPUT_KEYS.move.backward);
  camera.keysRight.push(INPUT_KEYS.move.right);
  camera.attachControl(canvas, true);

  const glowLayer = new GlowLayer("hangar-glow", scene);
  glowLayer.intensity = 0.18;

  const { floor, staticMeshes } = buildHangar(scene);
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

  return {
    engine,
    scene,
    camera,
    glowLayer,
    floor,
    staticMeshes,
    structuralLamps,
    dispose: () => {
      window.removeEventListener("resize", resize);
      glowLayer.dispose();
      structuralLamps.forEach((lamp) => {
        lamp.shadow.dispose();
        lamp.light.dispose();
        lamp.fillLight?.dispose();
        lamp.mesh.dispose(false, true);
      });
      scene.dispose();
      engine.dispose();
    },
  };
}

function buildHangar(scene: Scene) {
  const floorSubdivisionsX = Math.max(1, Math.round(HULL_DIMENSIONS.width / GRID_SIZE));
  const floorSubdivisionsZ = Math.max(1, Math.round(HULL_DIMENSIONS.length / GRID_SIZE));

  const floor = MeshBuilder.CreateGround(
    "hangar-floor",
    {
      width: HULL_DIMENSIONS.width,
      height: HULL_DIMENSIONS.length,
      subdivisionsX: floorSubdivisionsX,
      subdivisionsY: floorSubdivisionsZ,
    },
    scene,
  );
  floor.position.y = 0;

  const floorMaterial = new StandardMaterial("floor-mat", scene);
  floorMaterial.diffuseColor = new Color3(0.12, 0.14, 0.18);
  floorMaterial.specularColor = new Color3(0.26, 0.29, 0.33);
  floorMaterial.specularPower = 48;
  floorMaterial.emissiveColor = new Color3(0.015, 0.02, 0.026);
  floor.material = floorMaterial;

  const walls = [
    createHullWall(scene, {
      name: "wall-north",
      width: HULL_DIMENSIONS.width,
      height: HULL_DIMENSIONS.height,
      depth: WALL_DIMENSIONS.thickness,
      position: new Vector3(0, HULL_DIMENSIONS.height / 2, -HULL_DIMENSIONS.length / 2),
    }),
    createHullWall(scene, {
      name: "wall-south",
      width: HULL_DIMENSIONS.width,
      height: HULL_DIMENSIONS.height,
      depth: WALL_DIMENSIONS.thickness,
      position: new Vector3(0, HULL_DIMENSIONS.height / 2, HULL_DIMENSIONS.length / 2),
    }),
    createHullWall(scene, {
      name: "wall-east",
      width: HULL_DIMENSIONS.length,
      height: HULL_DIMENSIONS.height,
      depth: WALL_DIMENSIONS.thickness,
      position: new Vector3(HULL_DIMENSIONS.width / 2, HULL_DIMENSIONS.height / 2, 0),
      rotationY: Math.PI / 2,
    }),
    createHullWall(scene, {
      name: "wall-west",
      width: HULL_DIMENSIONS.length,
      height: HULL_DIMENSIONS.height,
      depth: WALL_DIMENSIONS.thickness,
      position: new Vector3(-HULL_DIMENSIONS.width / 2, HULL_DIMENSIONS.height / 2, 0),
      rotationY: Math.PI / 2,
    }),
  ];

  const ceiling = MeshBuilder.CreateGround(
    "hangar-ceiling",
    {
      width: HULL_DIMENSIONS.width,
      height: HULL_DIMENSIONS.length,
      subdivisionsX: floorSubdivisionsX,
      subdivisionsY: floorSubdivisionsZ,
    },
    scene,
  );
  ceiling.position.y = HULL_DIMENSIONS.height;
  ceiling.rotation.x = Math.PI;

  const ceilingMaterial = new StandardMaterial("ceiling-mat", scene);
  ceilingMaterial.diffuseColor = new Color3(0.14, 0.17, 0.22);
  ceilingMaterial.specularColor = new Color3(0.16, 0.18, 0.23);
  ceilingMaterial.specularPower = 34;
  ceiling.material = ceilingMaterial;

  return {
    floor,
    staticMeshes: [...walls, ceiling],
  };
}

function createHullWall(
  scene: Scene,
  options: {
    name: string;
    width: number;
    height: number;
    depth: number;
    position: Vector3;
    rotationY?: number;
  },
) {
  const wall = MeshBuilder.CreateBox(
    options.name,
    {
      width: options.width,
      height: options.height,
      depth: options.depth,
    },
    scene,
  );

  wall.position = options.position;
  if (options.rotationY !== undefined) {
    wall.rotation.y = options.rotationY;
  }

  const material = new StandardMaterial(`${options.name}-mat`, scene);
  material.diffuseColor = new Color3(0.09, 0.11, 0.15);
  material.specularColor = new Color3(0.17, 0.21, 0.26);
  material.specularPower = 36;
  material.emissiveColor = new Color3(0.012, 0.018, 0.024);
  wall.material = material;

  createWindowCutout(scene, wall, options);

  return wall;
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
  fixture.isPickable = false;
  fixture.checkCollisions = false;
  fixture.metadata = { type: "structural-lamp", key: config.name };

  const fixtureMaterial = new StandardMaterial(`${config.name}-mat`, scene);
  fixtureMaterial.diffuseColor = config.color.scale(0.18);
  fixtureMaterial.specularColor = config.color.scale(0.26);
  fixtureMaterial.emissiveColor = config.color.scale(1.2);
  fixtureMaterial.backFaceCulling = false;
  fixture.material = fixtureMaterial;

  const direction = Vector3.Normalize(config.direction);
  const light = new SpotLight(
    `${config.name}-light`,
    fixture.position.add(direction.scale(0.05)),
    direction,
    config.angle ?? Math.PI / 2.6,
    1.05,
    scene,
  );
  light.diffuse = config.color;
  light.specular = config.color.scale(0.32);
  light.intensity = 1.85;
  light.range = config.range;
  light.falloffType = Light.FALLOFF_PHYSICAL;
  light.shadowEnabled = true;
  light.shadowMinZ = 0.1;
  light.shadowMaxZ = config.range * 1.08;

  const shadow = new ShadowGenerator(config.shadowMapSize ?? 640, light);
  shadow.usePercentageCloserFiltering = true;
  shadow.filteringQuality = ShadowGenerator.QUALITY_HIGH;
  shadow.bias = 0.00055;
  shadow.normalBias = 0.16;
  shadow.darkness = 0.17;
  shadow.frustumEdgeFalloff = 0.16;

  return {
    mesh: fixture,
    light,
    shadow,
    key: config.name,
  };
}
function createWindowCutout(
  scene: Scene,
  wall: Mesh,
  options: {
    width: number;
    height: number;
  },
) {
  if (options.width < 8) {
    return;
  }

  const windowWidth = options.width * 0.35;
  const windowHeight = options.height * 0.3;

  const window = MeshBuilder.CreatePlane(
    `${wall.name}-window`,
    {
      width: windowWidth,
      height: windowHeight,
    },
    scene,
  );

  window.parent = wall;
  window.position = new Vector3(0, windowHeight, 0.21);

  const material = new StandardMaterial(`${wall.name}-window-mat`, scene);
  material.emissiveColor = new Color3(0.2, 0.45, 0.75);
  material.alpha = 0.55;
  window.material = material;
}
