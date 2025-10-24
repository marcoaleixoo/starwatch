import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { SeededRandom, pseudoNoise3D } from '../../utils/seeded-random';
import { GRID_UNIT_METERS } from '../../config/constants';

export interface AsteroidMaterialIds {
  stone: number;
  iron: number;
  copper: number;
}

interface MaterialWeight {
  key: keyof AsteroidMaterialIds;
  weight: number;
}

interface ZoneConfig {
  id: string;
  minDistance: number; // blocks
  maxDistance: number; // blocks
  spawnProbability: number;
  radiusRange: [number, number]; // blocks
  verticalRange: [number, number]; // blocks relative to origin
  materials: MaterialWeight[];
  noiseAmplitude: [number, number];
  voidFactor: [number, number];
}

interface AsteroidCluster {
  center: Vector3;
  radius: number;
  radiusSquared: number;
  blockId: number;
  shapeSeed: number;
  noiseAmplitude: number;
  voidFactor: number;
  voidSeed: number;
}

const CHUNK_SIZE = 32;
const BLOCKS_PER_KM = 1000 / GRID_UNIT_METERS;
const CLUSTER_CELL_SIZE = 4096; // blocks (~1.2 km)

const kmToBlocks = (km: number) => Math.round(km * BLOCKS_PER_KM);

const ZONES: ZoneConfig[] = [
  {
    id: 'inner',
    minDistance: kmToBlocks(100),
    maxDistance: kmToBlocks(400),
    spawnProbability: 0.85,
    radiusRange: [kmToBlocks(0.8), kmToBlocks(2.4)],
    verticalRange: [-kmToBlocks(5), kmToBlocks(5)],
    materials: [
      { key: 'stone', weight: 0.6 },
      { key: 'copper', weight: 0.25 },
      { key: 'iron', weight: 0.15 },
    ],
    noiseAmplitude: [0.35, 0.55],
    voidFactor: [0.45, 0.65],
  },
  {
    id: 'mid',
    minDistance: kmToBlocks(400),
    maxDistance: kmToBlocks(1200),
    spawnProbability: 0.65,
    radiusRange: [kmToBlocks(1.5), kmToBlocks(4.0)],
    verticalRange: [-kmToBlocks(10), kmToBlocks(10)],
    materials: [
      { key: 'stone', weight: 0.5 },
      { key: 'iron', weight: 0.3 },
      { key: 'copper', weight: 0.2 },
    ],
    noiseAmplitude: [0.3, 0.6],
    voidFactor: [0.4, 0.6],
  },
  {
    id: 'outer',
    minDistance: kmToBlocks(1200),
    maxDistance: kmToBlocks(2000),
    spawnProbability: 0.4,
    radiusRange: [kmToBlocks(2.5), kmToBlocks(6.0)],
    verticalRange: [-kmToBlocks(15), kmToBlocks(15)],
    materials: [
      { key: 'stone', weight: 0.4 },
      { key: 'iron', weight: 0.35 },
      { key: 'copper', weight: 0.25 },
    ],
    noiseAmplitude: [0.35, 0.65],
    voidFactor: [0.4, 0.55],
  },
];

const MAX_CLUSTER_RADIUS = Math.max(...ZONES.map((zone) => zone.radiusRange[1]));

const getChunkBase = (value: number) => Math.floor(value / CHUNK_SIZE) * CHUNK_SIZE;

export class AsteroidField {
  private readonly sectorSeed: string;

  private readonly materialIds: AsteroidMaterialIds;

  private readonly chunkCache = new Map<string, AsteroidCluster[]>();

  private readonly cacheQueue: string[] = [];

  private readonly maxCacheSize = 2048;

  private readonly lastChunk: { key: string | null; clusters: AsteroidCluster[] } = {
    key: null,
    clusters: [],
  };

  constructor(materialIds: AsteroidMaterialIds, options?: { sectorSeed?: string }) {
    this.materialIds = materialIds;
    this.sectorSeed = options?.sectorSeed ?? 'sector.001';
  }

  sample(x: number, y: number, z: number): number {
    const chunkX = getChunkBase(x);
    const chunkY = getChunkBase(y);
    const chunkZ = getChunkBase(z);
    const chunkKey = `${chunkX}:${chunkY}:${chunkZ}`;

    let clusters: AsteroidCluster[];
    if (this.lastChunk.key === chunkKey) {
      clusters = this.lastChunk.clusters;
    } else {
      clusters = this.getClustersForChunk(chunkX, chunkY, chunkZ);
      this.lastChunk.key = chunkKey;
      this.lastChunk.clusters = clusters;
    }

    for (let i = 0; i < clusters.length; i += 1) {
      const cluster = clusters[i];
      const dx = x - cluster.center.x;
      const dy = y - cluster.center.y;
      const dz = z - cluster.center.z;
      const radialDistanceSquared = dx * dx + dy * dy + dz * dz;
      if (radialDistanceSquared > cluster.radiusSquared * 1.96) {
        continue;
      }
      const radialDistance = Math.sqrt(radialDistanceSquared);
      const baseRadius = cluster.radius;
      const noise = pseudoNoise3D(
        Math.floor(x * 0.2),
        Math.floor(y * 0.2),
        Math.floor(z * 0.2),
        cluster.shapeSeed,
      );
      const surfaceThreshold = baseRadius * (0.55 + noise * cluster.noiseAmplitude);
      if (radialDistance <= surfaceThreshold) {
      const voidNoise = pseudoNoise3D(x + 97, y + 211, z + 389, cluster.voidSeed);
      if (voidNoise > cluster.voidFactor) {
        return 0;
      }
      return cluster.blockId;
    }
    }

    return 0;
  }

  private getClustersForChunk(chunkX: number, chunkY: number, chunkZ: number): AsteroidCluster[] {
    const key = `${chunkX}:${chunkY}:${chunkZ}`;
    const cached = this.chunkCache.get(key);
    if (cached) {
      return cached;
    }

    const clusters: AsteroidCluster[] = [];

    const chunkMin = new Vector3(chunkX, chunkY, chunkZ);
    const chunkMax = new Vector3(chunkX + CHUNK_SIZE, chunkY + CHUNK_SIZE, chunkZ + CHUNK_SIZE);

    const cellMinX = Math.floor((chunkMin.x - MAX_CLUSTER_RADIUS) / CLUSTER_CELL_SIZE);
    const cellMaxX = Math.floor((chunkMax.x + MAX_CLUSTER_RADIUS) / CLUSTER_CELL_SIZE);
    const cellMinZ = Math.floor((chunkMin.z - MAX_CLUSTER_RADIUS) / CLUSTER_CELL_SIZE);
    const cellMaxZ = Math.floor((chunkMax.z + MAX_CLUSTER_RADIUS) / CLUSTER_CELL_SIZE);

    for (let cx = cellMinX; cx <= cellMaxX; cx += 1) {
      for (let cz = cellMinZ; cz <= cellMaxZ; cz += 1) {
        this.tryAddClusterForCell(cx, cz, chunkMin, chunkMax, clusters);
      }
    }

    this.storeInCache(key, clusters);
    return clusters;
  }

  private tryAddClusterForCell(
    cellX: number,
    cellZ: number,
    chunkMin: Vector3,
    chunkMax: Vector3,
    clusters: AsteroidCluster[],
  ) {
    const cellSeed = `${this.sectorSeed}:${cellX}:${cellZ}`;
    const random = new SeededRandom(cellSeed);
    const cellOriginX = cellX * CLUSTER_CELL_SIZE;
    const cellOriginZ = cellZ * CLUSTER_CELL_SIZE;
    const candidateX = cellOriginX + random.nextFloat(0, CLUSTER_CELL_SIZE);
    const candidateZ = cellOriginZ + random.nextFloat(0, CLUSTER_CELL_SIZE);
    const horizontalDistance = Math.sqrt(candidateX * candidateX + candidateZ * candidateZ);
    const zone = this.resolveZone(horizontalDistance);
    if (!zone) {
      return;
    }
    if (random.next() > zone.spawnProbability) {
      return;
    }

    const attempts = random.next() > 0.7 ? 2 : 1;
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const radius = random.nextFloat(zone.radiusRange[0], zone.radiusRange[1]);
      const centerY = random.nextFloat(zone.verticalRange[0], zone.verticalRange[1]);
      const center = new Vector3(candidateX + random.nextFloat(-radius, radius) * 0.2, centerY, candidateZ + random.nextFloat(-radius, radius) * 0.2);

      const minX = center.x - radius;
      const maxX = center.x + radius;
      const minY = center.y - radius;
      const maxY = center.y + radius;
      const minZ = center.z - radius;
      const maxZ = center.z + radius;

      if (maxX < chunkMin.x || minX > chunkMax.x || maxY < chunkMin.y || minY > chunkMax.y || maxZ < chunkMin.z || minZ > chunkMax.z) {
        continue;
      }

      const materialId = this.pickMaterial(zone, random);
      if (!materialId) {
        continue;
      }

      clusters.push({
        center,
        radius,
        radiusSquared: radius * radius,
        blockId: materialId,
        shapeSeed: random.nextInt(1, 2_147_483_647),
        noiseAmplitude: random.nextFloat(zone.noiseAmplitude[0], zone.noiseAmplitude[1]),
        voidFactor: random.nextFloat(zone.voidFactor[0], zone.voidFactor[1]),
        voidSeed: random.nextInt(1, 2_147_483_647),
      });
    }
  }

  private resolveZone(distance: number): ZoneConfig | null {
    for (let i = 0; i < ZONES.length; i += 1) {
      const zone = ZONES[i];
      if (distance >= zone.minDistance && distance <= zone.maxDistance) {
        return zone;
      }
    }
    return null;
  }

  private pickMaterial(zone: ZoneConfig, random: SeededRandom): number | null {
    const totalWeight = zone.materials.reduce((sum, entry) => sum + entry.weight, 0);
    let roll = random.nextFloat(0, totalWeight);
    for (let i = 0; i < zone.materials.length; i += 1) {
      const entry = zone.materials[i];
      if (roll <= entry.weight) {
        return this.materialIds[entry.key];
      }
      roll -= entry.weight;
    }
    return this.materialIds[zone.materials[zone.materials.length - 1].key] ?? null;
  }

  private storeInCache(key: string, clusters: AsteroidCluster[]) {
    this.chunkCache.set(key, clusters);
    this.cacheQueue.push(key);
    if (this.cacheQueue.length > this.maxCacheSize) {
      const oldest = this.cacheQueue.shift();
      if (oldest) {
        this.chunkCache.delete(oldest);
      }
    }
  }
}
