import {
  Color3,
  Color4,
  Engine,
  GlowLayer,
  Mesh,
  MeshBuilder,
  Scene,
  StandardMaterial,
  UniversalCamera,
  Vector3,
} from "babylonjs";
import {
  CAMERA_SETTINGS,
  GRID_SIZE,
  HULL_DIMENSIONS,
  INPUT_KEYS,
  LAMP_DIMENSIONS,
  WALL_DIMENSIONS,
} from "../constants";
import { createLamp, nextLampColor } from "../placement/lampBuilder";
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
  glowLayer.intensity = 0.25;

  const { floor, staticMeshes } = buildHangar(scene);
  floor.receiveShadows = true;
  floor.checkCollisions = true;
  staticMeshes.forEach((mesh) => {
    mesh.receiveShadows = true;
    mesh.checkCollisions = true;
  });

  const structuralLamps = createStructuralLamps(scene);
  structuralLamps.forEach((lamp) => {
    lamp.mesh.checkCollisions = true;
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
  floorMaterial.diffuseColor = new Color3(0.07, 0.09, 0.12);
  floorMaterial.specularColor = new Color3(0.32, 0.36, 0.42);
  floorMaterial.specularPower = 64;
  floorMaterial.emissiveColor = new Color3(0.02, 0.03, 0.04);
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

function createStructuralLamps(scene: Scene): BuilderLamp[] {
  const centerY = LAMP_DIMENSIONS.height / 2;
  const halfLength = HULL_DIMENSIONS.length / 2 - LAMP_DIMENSIONS.radius;
  const longitudinalOffsets = [-0.35, 0, 0.35].map((ratio) => HULL_DIMENSIONS.length * ratio);

  return longitudinalOffsets.map((offset, index) => {
    const clampedOffset = Math.max(-halfLength, Math.min(halfLength, offset));
    const position = new Vector3(0, centerY, clampedOffset);
    const lamp = createLamp(scene, position, nextLampColor(index));
    lamp.mesh.metadata = { type: "structural-lamp", key: lamp.key };
    lamp.light.intensity = 2.1;
    lamp.light.range = Math.max(HULL_DIMENSIONS.length, HULL_DIMENSIONS.width) * 1.35;
    lamp.shadow.darkness = 0.26;
    return lamp;
  });
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
