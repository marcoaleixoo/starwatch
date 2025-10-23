import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { SeededRandom, pseudoNoise3D } from '../../utils/seeded-random';

export interface AsteroidMaterialIds {
  stone: number;
  iron: number;
  copper: number;
}

interface AsteroidCluster {
  center: Vector3;
  radius: number;
  blockId: number;
  shapeSeed: number;
  noiseAmplitude: number;
  voidFactor: number;
}

export interface AsteroidFieldOptions {
  sectorSeed: string;
  clusterCount: [number, number];
  radiusRange: [number, number];
  verticalRange: [number, number];
  horizontalSpread: number;
  exclusionZones: Array<{ center: Vector3; radius: number }>;
}

const DEFAULT_OPTIONS: AsteroidFieldOptions = {
  sectorSeed: 'sector.001',
  clusterCount: [5, 15],
  radiusRange: [30, 60],
  verticalRange: [12, 120],
  horizontalSpread: 220,
  exclusionZones: [],
};

export class AsteroidField {
  private readonly clusters: AsteroidCluster[];

  private readonly noiseSeed: number;

  constructor(materialIds: AsteroidMaterialIds, options?: Partial<AsteroidFieldOptions>) {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    this.noiseSeed = new SeededRandom(`${mergedOptions.sectorSeed}-noise`).nextInt(1, 1_000_000);
    this.clusters = this.generateClusters(materialIds, mergedOptions);
  }

  sample(x: number, y: number, z: number): number {
    for (let i = 0; i < this.clusters.length; i += 1) {
      const cluster = this.clusters[i];
      const dx = x - cluster.center.x;
      const dy = y - cluster.center.y;
      const dz = z - cluster.center.z;

      const radialDistance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (radialDistance > cluster.radius * 1.4) {
        continue;
      }

      const noise = pseudoNoise3D(
        Math.floor(x * 0.5),
        Math.floor(y * 0.5),
        Math.floor(z * 0.5),
        cluster.shapeSeed,
      );
      const surfaceThreshold = cluster.radius * (0.6 + noise * cluster.noiseAmplitude);
      if (radialDistance <= surfaceThreshold) {
        const voidNoise = pseudoNoise3D(x + 97, y + 211, z + 389, cluster.shapeSeed ^ this.noiseSeed);
        if (voidNoise > cluster.voidFactor) {
          return 0;
        }
        return cluster.blockId;
      }
    }
    return 0;
  }

  private generateClusters(
    materialIds: AsteroidMaterialIds,
    options: AsteroidFieldOptions,
  ): AsteroidCluster[] {
    const random = new SeededRandom(options.sectorSeed);
    const [clusterMin, clusterMax] = options.clusterCount;
    const clusterCount = random.nextInt(clusterMin, clusterMax + 1);
    const clusters: AsteroidCluster[] = [];

    const materialPool = [materialIds.stone, materialIds.iron, materialIds.copper].filter((id) => id > 0);

    for (let i = 0; i < clusterCount; i += 1) {
      const clusterRandom = random.fork(`cluster-${i}`);
      const radius = clusterRandom.nextFloat(options.radiusRange[0], options.radiusRange[1]);
      let center: Vector3 | null = null;
      const maxAttempts = 12;
      for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        const candidate = new Vector3(
          clusterRandom.nextFloat(-options.horizontalSpread, options.horizontalSpread),
          clusterRandom.nextFloat(options.verticalRange[0], options.verticalRange[1]),
          clusterRandom.nextFloat(-options.horizontalSpread, options.horizontalSpread),
        );
        const insideZone = options.exclusionZones.some((zone) => {
          const distanceSquared = Vector3.DistanceSquared(candidate, zone.center);
          return distanceSquared < zone.radius * zone.radius;
        });
        if (!insideZone) {
          center = candidate;
          break;
        }
      }

      if (!center) {
        continue;
      }

      const materialIndex = clusterRandom.nextInt(0, materialPool.length);
      const blockId = materialPool[materialIndex] ?? materialIds.stone;
      clusters.push({
        center,
        radius,
        blockId,
        shapeSeed: clusterRandom.nextInt(1, 2_147_483_647),
        noiseAmplitude: 0.25 + clusterRandom.nextFloat(0, 0.25),
        voidFactor: 0.5 + clusterRandom.nextFloat(0, 0.2),
      });
    }

    return clusters;
  }
}
