import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import type { Engine } from 'noa-engine';
import { Scene } from '@babylonjs/core/scene';
import type { FreeCamera } from '@babylonjs/core/Cameras/freeCamera';
import { SectorSkybox } from './skybox';
import { SunEntity, DEFAULT_SUN_DISTANCE_BLOCKS } from './sun';
import { AsteroidField, AsteroidMaterialIds } from './asteroid-field';
import { SECTOR_SKYBOX_SYSTEM_ID, SECTOR_SUN_SYSTEM_ID } from '../../core/constants';

export interface SectorTickSystem {
  id: string;
  update(dt: number): void;
}

export interface SectorEnvironment {
  getSolarFactor(): number;
  getSunPosition(): Vector3;
}

interface SectorOptions {
  sectorSeed: string;
  sunPosition: Vector3;
}

const DEFAULT_SECTOR_OPTIONS: SectorOptions = {
  sectorSeed: 'sector.001',
  sunPosition: new Vector3(DEFAULT_SUN_DISTANCE_BLOCKS, 0, 0),
};

class SolarRadiation implements SectorEnvironment {
  private solarFactor = 0;

  private lastLoggedFactor = -1;

  constructor(private readonly noa: Engine, private readonly sun: SunEntity) {}

  update() {
    const playerData = this.noa.entities.getPositionData(this.noa.playerEntity);
    const [px, py, pz] = playerData.position;
    const sunPosition = this.sun.getPosition();

    const dx = sunPosition.x - px;
    const dy = sunPosition.y - py;
    const dz = sunPosition.z - pz;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const clampedDistance = Math.max(distance, 1);
    const factor = 1 / (clampedDistance * clampedDistance);
    this.solarFactor = factor;

    if (Math.abs(factor - this.lastLoggedFactor) > 0.05) {
      console.log(
        `[Sector] solar factor updated -> ${factor.toFixed(3)} (distance ${clampedDistance.toFixed(1)})`,
      );
      this.lastLoggedFactor = factor;
    }
  }

  getSolarFactor(): number {
    return this.solarFactor;
  }

  getSunPosition(): Vector3 {
    return this.sun.getPosition();
  }
}

export interface SectorSetupResult {
  field: AsteroidField;
  systems: SectorTickSystem[];
  environment: SectorEnvironment;
  sun: SunEntity;
}

export function initializeSector(
  noa: Engine,
  materialIds: AsteroidMaterialIds,
  options?: Partial<SectorOptions>,
): SectorSetupResult {
  const mergedOptions = { ...DEFAULT_SECTOR_OPTIONS, ...options };
  const scene = noa.rendering.getScene() as Scene;
  scene.fogMode = Scene.FOGMODE_NONE;
  scene.fogEnabled = false;
  scene.fogDensity = 0;
  const camera = scene.activeCamera as FreeCamera | null;
  if (camera) {
    const desiredMaxZ = Math.max(50000, DEFAULT_SUN_DISTANCE_BLOCKS * 2);
    camera.maxZ = desiredMaxZ;
  }

  const skybox = new SectorSkybox(noa, scene, mergedOptions.sectorSeed);
  const sun = new SunEntity(noa, scene, mergedOptions.sunPosition);
  const field = new AsteroidField(materialIds, {
    sectorSeed: mergedOptions.sectorSeed,
  });
  const solarRadiation = new SolarRadiation(noa, sun);

  const systems: SectorTickSystem[] = [
    {
      id: SECTOR_SKYBOX_SYSTEM_ID,
      update: (dt) => {
        skybox.update(dt);
      },
    },
    {
      id: SECTOR_SUN_SYSTEM_ID,
      update: (dt) => {
        sun.update(dt);
        solarRadiation.update();
      },
    },
  ];

  return {
    field,
    systems,
    environment: solarRadiation,
    sun,
  };
}
