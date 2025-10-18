import {
  AbstractMesh,
  Color3,
  Color4,
  Engine,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  PointerEventTypes,
  PointerInfo,
  Scene,
  StandardMaterial,
  UniversalCamera,
  Vector3,
} from "babylonjs";
import { useEffect, useRef } from "react";

type BuilderMesh = {
  mesh: Mesh;
  key: string;
};

const GRID_SIZE = 2;
const WALL_WIDTH = 2;
const WALL_HEIGHT = 3;
const WALL_THICKNESS = 0.3;

const HULL_WIDTH = 18;
const HULL_LENGTH = 26;
const HULL_HEIGHT = 6;

export function ShipBuilderCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rotationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      doNotHandleContextLost: true,
    });

    const scene = new Scene(engine);
    scene.clearColor = new Color4(5 / 255, 6 / 255, 10 / 255, 1);

    const camera = new UniversalCamera(
      "fpCam",
      new Vector3(0, 1.6, -HULL_LENGTH / 2 + 4),
      scene,
    );
    camera.minZ = 0.05;
    camera.maxZ = 250;
    camera.speed = 0.5;
    camera.angularSensibility = 3500;
    camera.inertia = 0.05;
    camera.keysUp.push(87); // W
    camera.keysLeft.push(65); // A
    camera.keysDown.push(83); // S
    camera.keysRight.push(68); // D
    camera.attachControl(canvas, true);

    const baseSpeed = camera.speed;

    const light = new HemisphericLight("hangarLight", new Vector3(0, 1, 0), scene);
    light.intensity = 0.9;

    createHangar(scene);

    const { ghost, material: ghostMaterial } = createGhostWall(scene);
    const walls = new Map<string, BuilderMesh>();

    const updateGhostVisibility = (visible: boolean) => {
      ghost.setEnabled(visible);
      ghostMaterial.alpha = visible ? 0.28 : 0;
    };

    updateGhostVisibility(false);

    const pointerMoveObserver = scene.onPointerObservable.add((pointerInfo: PointerInfo) => {
      if (pointerInfo.type !== PointerEventTypes.POINTERMOVE) {
        return;
      }

      const pick = scene.pick(
        scene.pointerX,
        scene.pointerY,
        (mesh?: AbstractMesh) => mesh?.name === "hangar-floor",
      );
      const point = pick?.pickedPoint;

      if (!point) {
        updateGhostVisibility(false);
        return;
      }

      const snapped = snapToInterior(point);
      ghost.position.copyFrom(snapped);
      ghost.rotation.y = degreesToRadians(rotationRef.current);
      updateGhostVisibility(true);
    });

    const pointerDownObserver = scene.onPointerObservable.add((pointerInfo: PointerInfo) => {
      if (pointerInfo.type !== PointerEventTypes.POINTERDOWN) {
        return;
      }

      const event = pointerInfo.event;

      if (event.button === 0) {
        if (document.pointerLockElement !== canvas) {
          canvas.requestPointerLock();
        }

        const pick = scene.pick(
          scene.pointerX,
          scene.pointerY,
          (mesh?: AbstractMesh) => mesh?.name === "hangar-floor",
        );
        const point = pick?.pickedPoint;

        if (!point) {
          return;
        }

        const snapped = snapToInterior(point);
        const wallKey = wallKeyFrom(snapped, rotationRef.current);

        if (walls.has(wallKey)) {
          return;
        }

        const wall = buildWall(scene, snapped, rotationRef.current);
        walls.set(wallKey, wall);
        updateGhostVisibility(true);
      } else if (event.button === 2) {
        event.preventDefault();
        const pick = scene.pick(
          scene.pointerX,
          scene.pointerY,
          (mesh?: AbstractMesh) => mesh?.metadata?.type === "builder-wall",
        );
        const mesh = pick?.pickedMesh;

        if (!mesh || !mesh.metadata) {
          return;
        }

        const meshKey = mesh.metadata.key as string;
        const builderMesh = walls.get(meshKey);
        builderMesh?.mesh.dispose(false, true);
        walls.delete(meshKey);
      }
    });

    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };

    canvas.addEventListener("contextmenu", handleContextMenu);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "KeyR") {
        rotationRef.current = (rotationRef.current + 90) % 360;
        ghost.rotation.y = degreesToRadians(rotationRef.current);
      }

      if (event.code === "ShiftLeft" || event.code === "ShiftRight") {
        camera.speed = baseSpeed * 2.2;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === "ShiftLeft" || event.code === "ShiftRight") {
        camera.speed = baseSpeed;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    const handlePointerLockChange = () => {
      if (document.pointerLockElement !== canvas) {
        updateGhostVisibility(false);
      }
    };

    document.addEventListener("pointerlockchange", handlePointerLockChange);

    engine.runRenderLoop(() => {
      scene.render();
    });

    const resize = () => {
      engine.resize();
    };

    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("pointerlockchange", handlePointerLockChange);
      canvas.removeEventListener("contextmenu", handleContextMenu);
      scene.onPointerObservable.remove(pointerMoveObserver);
      scene.onPointerObservable.remove(pointerDownObserver);
      ghost.dispose(false, true);
      walls.forEach((builderMesh) => builderMesh.mesh.dispose(false, true));
      scene.dispose();
      engine.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
      }}
    />
  );
}

function degreesToRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

function snapToInterior(point: Vector3) {
  const halfWidth = HULL_WIDTH / 2 - GRID_SIZE / 2;
  const halfLength = HULL_LENGTH / 2 - GRID_SIZE / 2;

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

  return new Vector3(snappedX, WALL_HEIGHT / 2, snappedZ);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function wallKeyFrom(position: Vector3, rotation: number) {
  return `${position.x}:${position.y}:${position.z}:${rotation}`;
}

function createHangar(scene: Scene) {
  const floor = MeshBuilder.CreateGround(
    "hangar-floor",
    {
      width: HULL_WIDTH,
      height: HULL_LENGTH,
      subdivisions: HULL_WIDTH,
    },
    scene,
  );
  floor.position.y = 0;

  const floorMaterial = new StandardMaterial("floor-mat", scene);
  floorMaterial.diffuseColor = new Color3(0.07, 0.09, 0.12);
  floorMaterial.specularColor = new Color3(0.2, 0.2, 0.25);
  floor.material = floorMaterial;

  createHullWall(scene, {
    name: "wall-north",
    width: HULL_WIDTH,
    height: HULL_HEIGHT,
    depth: 0.4,
    position: new Vector3(0, HULL_HEIGHT / 2, -HULL_LENGTH / 2),
  });

  createHullWall(scene, {
    name: "wall-south",
    width: HULL_WIDTH,
    height: HULL_HEIGHT,
    depth: 0.4,
    position: new Vector3(0, HULL_HEIGHT / 2, HULL_LENGTH / 2),
  });

  createHullWall(scene, {
    name: "wall-east",
    width: HULL_LENGTH,
    height: HULL_HEIGHT,
    depth: 0.4,
    position: new Vector3(HULL_WIDTH / 2, HULL_HEIGHT / 2, 0),
    rotationY: Math.PI / 2,
  });

  createHullWall(scene, {
    name: "wall-west",
    width: HULL_LENGTH,
    height: HULL_HEIGHT,
    depth: 0.4,
    position: new Vector3(-HULL_WIDTH / 2, HULL_HEIGHT / 2, 0),
    rotationY: Math.PI / 2,
  });

  const ceiling = MeshBuilder.CreateGround(
    "hangar-ceiling",
    {
      width: HULL_WIDTH,
      height: HULL_LENGTH,
      subdivisions: HULL_WIDTH,
    },
    scene,
  );
  ceiling.position.y = HULL_HEIGHT;
  ceiling.rotation.x = Math.PI;

  const ceilingMaterial = new StandardMaterial("ceiling-mat", scene);
  ceilingMaterial.diffuseColor = new Color3(0.12, 0.15, 0.18);
  ceilingMaterial.specularColor = new Color3(0.12, 0.15, 0.18);
  ceiling.material = ceilingMaterial;
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
  if (options.rotationY) {
    wall.rotation.y = options.rotationY;
  }

  const material = new StandardMaterial(`${options.name}-mat`, scene);
  material.diffuseColor = new Color3(0.05, 0.08, 0.11);
  material.specularColor = new Color3(0.06, 0.08, 0.1);
  wall.material = material;

  createWindowCutout(scene, wall, options);
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

  window.position = new Vector3(0, windowHeight, 0);
  window.parent = wall;

  const mat = new StandardMaterial(`${wall.name}-window-mat`, scene);
  mat.emissiveColor = new Color3(0.2, 0.45, 0.75);
  mat.alpha = 0.4;
  window.material = mat;
}

function createGhostWall(scene: Scene) {
  const ghost = MeshBuilder.CreateBox(
    "ghost-wall",
    {
      width: WALL_WIDTH,
      height: WALL_HEIGHT,
      depth: WALL_THICKNESS,
    },
    scene,
  );

  const material = new StandardMaterial("ghost-wall-mat", scene);
  material.diffuseColor = new Color3(0.35, 0.77, 0.93);
  material.alpha = 0.28;
  material.specularColor = Color3.Black();
  material.emissiveColor = new Color3(0.1, 0.25, 0.36);
  material.wireframe = false;
  ghost.material = material;
  ghost.isPickable = false;

  return { ghost, material };
}

function buildWall(scene: Scene, position: Vector3, rotation: number): BuilderMesh {
  const wallMesh = MeshBuilder.CreateBox(
    `builder-wall-${Date.now()}`,
    {
      width: WALL_WIDTH,
      height: WALL_HEIGHT,
      depth: WALL_THICKNESS,
    },
    scene,
  );

  wallMesh.position = position.clone();
  wallMesh.rotation.y = degreesToRadians(rotation);

  const material = new StandardMaterial(`builder-wall-mat-${Date.now()}`, scene);
  material.diffuseColor = new Color3(0.7, 0.72, 0.75);
  material.specularColor = new Color3(0.2, 0.22, 0.24);
  material.emissiveColor = new Color3(0.05, 0.1, 0.12);

  wallMesh.material = material;
  wallMesh.metadata = { type: "builder-wall", key: wallKeyFrom(position, rotation) };

  return {
    mesh: wallMesh,
    key: wallKeyFrom(position, rotation),
  };
}
