import {
  Color3,
  Color4,
  Engine,
  GlowLayer,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  Scene,
  ShadowGenerator,
  SpotLight,
  StandardMaterial,
  UniversalCamera,
  Vector3,
} from "babylonjs";
import { CAMERA_SETTINGS, HULL_DIMENSIONS, INPUT_KEYS } from "../constants";

export interface SceneContext {
  engine: Engine;
  scene: Scene;
  camera: UniversalCamera;
  glowLayer: GlowLayer;
  ambientLight: HemisphericLight;
  keyLight: SpotLight;
  keyShadow: ShadowGenerator;
  floor: Mesh;
  staticMeshes: Mesh[];
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
  scene.ambientColor = new Color3(0.06, 0.12, 0.18);
  scene.gravity = new Vector3(0, -0.9, 0);
  scene.collisionsEnabled = true;

  const camera = new UniversalCamera("fpCam", new Vector3(0, 1.7, -HULL_DIMENSIONS.length / 2 + 4), scene);
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
  glowLayer.intensity = 0.35;

  const ambientLight = new HemisphericLight("ambient", new Vector3(0, 1, 0), scene);
  ambientLight.diffuse = new Color3(0.35, 0.52, 0.76);
  ambientLight.specular = new Color3(0.22, 0.38, 0.54);
  ambientLight.groundColor = new Color3(0.05, 0.09, 0.14);
  ambientLight.intensity = 0.65;

  const keyLight = new SpotLight(
    "key-light",
    new Vector3(0, HULL_DIMENSIONS.height - 0.3, 0),
    new Vector3(0, -1, 0),
    Math.PI / 2.5,
    2,
    scene,
  );
  keyLight.diffuse = new Color3(1, 0.86, 0.64);
  keyLight.specular = new Color3(1, 0.92, 0.78);
  keyLight.intensity = 1.35;
  keyLight.range = 35;

  const keyShadow = new ShadowGenerator(2048, keyLight);
  keyShadow.usePercentageCloserFiltering = true;
  keyShadow.filteringQuality = ShadowGenerator.QUALITY_HIGH;
  keyShadow.darkness = 0.45;
  keyShadow.bias = 0.0006;

  const { floor, staticMeshes } = buildHangar(scene);
  floor.receiveShadows = true;
  floor.checkCollisions = true;
  staticMeshes.forEach((mesh) => {
    mesh.receiveShadows = true;
    mesh.checkCollisions = true;
    keyShadow.addShadowCaster(mesh, true);
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
    ambientLight,
    keyLight,
    keyShadow,
    floor,
    staticMeshes,
    dispose: () => {
      window.removeEventListener("resize", resize);
      glowLayer.dispose();
      scene.dispose();
      engine.dispose();
    },
  };
}

function buildHangar(scene: Scene) {
  const floor = MeshBuilder.CreateGround(
    "hangar-floor",
    {
      width: HULL_DIMENSIONS.width,
      height: HULL_DIMENSIONS.length,
      subdivisions: HULL_DIMENSIONS.width,
    },
    scene,
  );
  floor.position.y = 0;

  const floorMaterial = new StandardMaterial("floor-mat", scene);
  floorMaterial.diffuseColor = new Color3(0.07, 0.09, 0.12);
  floorMaterial.specularColor = new Color3(0.18, 0.2, 0.24);
  floorMaterial.emissiveColor = new Color3(0.02, 0.03, 0.04);
  floor.material = floorMaterial;

  const walls = [
    createHullWall(scene, {
      name: "wall-north",
      width: HULL_DIMENSIONS.width,
      height: HULL_DIMENSIONS.height,
      depth: 0.4,
      position: new Vector3(0, HULL_DIMENSIONS.height / 2, -HULL_DIMENSIONS.length / 2),
    }),
    createHullWall(scene, {
      name: "wall-south",
      width: HULL_DIMENSIONS.width,
      height: HULL_DIMENSIONS.height,
      depth: 0.4,
      position: new Vector3(0, HULL_DIMENSIONS.height / 2, HULL_DIMENSIONS.length / 2),
    }),
    createHullWall(scene, {
      name: "wall-east",
      width: HULL_DIMENSIONS.length,
      height: HULL_DIMENSIONS.height,
      depth: 0.4,
      position: new Vector3(HULL_DIMENSIONS.width / 2, HULL_DIMENSIONS.height / 2, 0),
      rotationY: Math.PI / 2,
    }),
    createHullWall(scene, {
      name: "wall-west",
      width: HULL_DIMENSIONS.length,
      height: HULL_DIMENSIONS.height,
      depth: 0.4,
      position: new Vector3(-HULL_DIMENSIONS.width / 2, HULL_DIMENSIONS.height / 2, 0),
      rotationY: Math.PI / 2,
    }),
  ];

  const ceiling = MeshBuilder.CreateGround(
    "hangar-ceiling",
    {
      width: HULL_DIMENSIONS.width,
      height: HULL_DIMENSIONS.length,
      subdivisions: HULL_DIMENSIONS.width,
    },
    scene,
  );
  ceiling.position.y = HULL_DIMENSIONS.height;
  ceiling.rotation.x = Math.PI;

  const ceilingMaterial = new StandardMaterial("ceiling-mat", scene);
  ceilingMaterial.diffuseColor = new Color3(0.11, 0.13, 0.18);
  ceilingMaterial.specularColor = new Color3(0.09, 0.1, 0.13);
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
  material.diffuseColor = new Color3(0.05, 0.08, 0.11);
  material.specularColor = new Color3(0.08, 0.1, 0.14);
  material.emissiveColor = new Color3(0.01, 0.02, 0.03);
  wall.material = material;

  createWindowCutout(scene, wall, options);

  return wall;
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
