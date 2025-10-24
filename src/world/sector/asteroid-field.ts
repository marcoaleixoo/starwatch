import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import type { Engine } from 'noa-engine';
import { SeededRandom } from '../../utils/seeded-random';
import { AsteroidMeshController } from './asteroid-meshes';
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
  asteroidCountRange: [number, number];
  asteroidRadiusScale: [number, number];
  voidCountRange: [number, number];
  voidRadiusScale: [number, number];
}

interface ClusterBlob {
  center: Vector3;
  radius: number;
  radiusSquared: number;
}

type ClusterMode = 'mesh' | 'voxel';

export interface AsteroidCluster {
  hash: string;
  center: Vector3;
  radius: number;
  radiusSquared: number;
  blockId: number;
  maxSurfaceRadius: number;
  maxSurfaceRadiusSquared: number;
  blobs: ClusterBlob[];
  voids: ClusterBlob[];
  mode: ClusterMode;
}

const CHUNK_SIZE = 32;
const BLOCKS_PER_KM = 1000 / GRID_UNIT_METERS;
const PROTOTYPE_DISTANCE_SCALE = 0.00075; // compress orbital rings so inner belt stays inside default render range
const PROTOTYPE_SIZE_SCALE = 0.005; // shrink prototype asteroid radius further to curb chunk budgets
const MIN_CLUSTER_CELL_SIZE = CHUNK_SIZE * 8;
const BASE_CLUSTER_CELL_SIZE = 4096;
const CLUSTER_CELL_SIZE = Math.max(
  MIN_CLUSTER_CELL_SIZE,
  Math.round(BASE_CLUSTER_CELL_SIZE * PROTOTYPE_DISTANCE_SCALE * 1.6),
);
const CLUSTER_SEPARATION_RATIO = 0.62; // express desired clearance relative to blob envelopes
const CLUSTER_SEPARATION_PADDING = 28; // blocks; ensures a visible gap even for small asteroids

const kmToBlocksDistance = (km: number) =>
  Math.max(1, Math.round(km * BLOCKS_PER_KM * PROTOTYPE_DISTANCE_SCALE));
const kmToBlocksSize = (km: number) =>
  Math.max(1, Math.round(km * BLOCKS_PER_KM * PROTOTYPE_SIZE_SCALE));

const ZONES: ZoneConfig[] = [
  {
    id: 'inner',
    minDistance: kmToBlocksDistance(100),
    maxDistance: kmToBlocksDistance(400),
    spawnProbability: 0.58,
    radiusRange: [kmToBlocksSize(0.6), kmToBlocksSize(1.6)],
    verticalRange: [-kmToBlocksDistance(25), kmToBlocksDistance(25)],
    materials: [
      { key: 'stone', weight: 0.6 },
      { key: 'copper', weight: 0.25 },
      { key: 'iron', weight: 0.15 },
    ],
    asteroidCountRange: [8, 14],
    asteroidRadiusScale: [0.22, 0.38],
    voidCountRange: [0, 1],
    voidRadiusScale: [0.2, 0.45],
  },
  {
    id: 'mid',
    minDistance: kmToBlocksDistance(400),
    maxDistance: kmToBlocksDistance(1200),
    spawnProbability: 0.46,
    radiusRange: [kmToBlocksSize(1.2), kmToBlocksSize(3.2)],
    verticalRange: [-kmToBlocksDistance(45), kmToBlocksDistance(45)],
    materials: [
      { key: 'stone', weight: 0.5 },
      { key: 'iron', weight: 0.3 },
      { key: 'copper', weight: 0.2 },
    ],
    asteroidCountRange: [10, 18],
    asteroidRadiusScale: [0.26, 0.42],
    voidCountRange: [0, 2],
    voidRadiusScale: [0.25, 0.4],
  },
  {
    id: 'outer',
    minDistance: kmToBlocksDistance(1200),
    maxDistance: kmToBlocksDistance(2000),
    spawnProbability: 0.32,
    radiusRange: [kmToBlocksSize(2.0), kmToBlocksSize(5.0)],
    verticalRange: [-kmToBlocksDistance(65), kmToBlocksDistance(65)],
    materials: [
      { key: 'stone', weight: 0.4 },
      { key: 'iron', weight: 0.35 },
      { key: 'copper', weight: 0.25 },
    ],
    asteroidCountRange: [14, 24],
    asteroidRadiusScale: [0.28, 0.45],
    voidCountRange: [1, 3],
    voidRadiusScale: [0.25, 0.45],
  },
];

const MAX_CLUSTER_RADIUS = Math.ceil(
  Math.max(...ZONES.map((zone) => zone.radiusRange[1] * 2.1)),
);

const getChunkBase = (value: number) => Math.floor(value / CHUNK_SIZE) * CHUNK_SIZE;

export class AsteroidField {
  private readonly noa: Engine;

  private readonly sectorSeed: string;

  private readonly materialIds: AsteroidMaterialIds;

  private readonly clusterModes = new Map<string, ClusterMode>();

  private readonly meshController: AsteroidMeshController;

  constructor(noa: Engine, materialIds: AsteroidMaterialIds, options?: { sectorSeed?: string }) {
    this.noa = noa;
    this.materialIds = materialIds;
    this.sectorSeed = options?.sectorSeed ?? 'sector.001';
    this.meshController = new AsteroidMeshController(noa);
  }

  sample(x: number, y: number, z: number): number {
    const clusters = this.computeClustersForChunk(
      getChunkBase(x),
      getChunkBase(y),
      getChunkBase(z),
    );
    return this.sampleWithinClusters(x, y, z, clusters);
  }

  sampleWithinClusters(x: number, y: number, z: number, clusters: AsteroidCluster[]): number {
    if (clusters.length === 0) {
      return 0;
    }
    for (let i = 0; i < clusters.length; i += 1) {
      const cluster = clusters[i];
      if (cluster.mode !== 'voxel') {
        continue;
      }
      const dx = x - cluster.center.x;
      const dy = y - cluster.center.y;
      const dz = z - cluster.center.z;
      const radialDistanceSquared = dx * dx + dy * dy + dz * dz;
      if (radialDistanceSquared > cluster.maxSurfaceRadiusSquared) {
        continue;
      }
      let filled = false;
      for (let b = 0; b < cluster.blobs.length; b += 1) {
        const blob = cluster.blobs[b];
        const bx = x - blob.center.x;
        const by = y - blob.center.y;
        const bz = z - blob.center.z;
        if (bx * bx + by * by + bz * bz <= blob.radiusSquared) {
          filled = true;
          break;
        }
      }
      if (!filled) {
        continue;
      }
      let carved = false;
      for (let v = 0; v < cluster.voids.length; v += 1) {
        const voidBlob = cluster.voids[v];
        const vx = x - voidBlob.center.x;
        const vy = y - voidBlob.center.y;
        const vz = z - voidBlob.center.z;
        if (vx * vx + vy * vy + vz * vz <= voidBlob.radiusSquared) {
          carved = true;
          break;
        }
      }
      if (carved) {
        continue;
      }
      return cluster.blockId;
    }
    return 0;
  }

  getClustersForChunk(chunkX: number, chunkY: number, chunkZ: number): AsteroidCluster[] {
    return this.computeClustersForChunk(
      getChunkBase(chunkX),
      getChunkBase(chunkY),
      getChunkBase(chunkZ),
    ).filter((cluster) => cluster.mode === 'voxel');
  }

  getCacheStats(): { cachedChunks: number; queueSize: number } {
    return { cachedChunks: 0, queueSize: 0 };
  }

  getClustersWithinRadius(center: Vector3, radius: number): AsteroidCluster[] {
    const min = new Vector3(center.x - radius, center.y - radius, center.z - radius);
    const max = new Vector3(center.x + radius, center.y + radius, center.z + radius);
    return this.generateClustersForBounds(min, max);
  }

  setClusterMode(cluster: AsteroidCluster, mode: ClusterMode) {
    const previous = this.clusterModes.get(cluster.hash);
    if (previous === mode) {
      return;
    }

    if (mode === 'mesh') {
      this.meshController.enable(cluster);
    } else {
      this.meshController.disable(cluster);
    }

    cluster.mode = mode;
    this.clusterModes.set(cluster.hash, mode);
    this.invalidateCluster(cluster);
  }

  updateMeshes(dt: number) {
    this.meshController.update(dt);
  }

  populateChunk(
    target: {
      shape: number[];
      set(x: number, y: number, z: number, value: number): void;
    },
    chunkX: number,
    chunkY: number,
    chunkZ: number,
    clusters: AsteroidCluster[],
  ) {
    if (clusters.length === 0) {
      return;
    }

    const sizeX = target.shape[0];
    const sizeY = target.shape[1];
    const sizeZ = target.shape[2];

    for (let c = 0; c < clusters.length; c += 1) {
      const cluster = clusters[c];
      if (cluster.mode !== 'voxel') {
        continue;
      }
      const maxRadius = cluster.maxSurfaceRadius;
      const minWorldX = Math.max(chunkX, Math.floor(cluster.center.x - maxRadius - 1));
      const maxWorldX = Math.min(chunkX + sizeX - 1, Math.ceil(cluster.center.x + maxRadius + 1));
      const minWorldY = Math.max(chunkY, Math.floor(cluster.center.y - maxRadius - 1));
      const maxWorldY = Math.min(chunkY + sizeY - 1, Math.ceil(cluster.center.y + maxRadius + 1));
      const minWorldZ = Math.max(chunkZ, Math.floor(cluster.center.z - maxRadius - 1));
      const maxWorldZ = Math.min(chunkZ + sizeZ - 1, Math.ceil(cluster.center.z + maxRadius + 1));

      if (minWorldX > maxWorldX || minWorldY > maxWorldY || minWorldZ > maxWorldZ) {
        continue;
      }

      for (let worldX = minWorldX; worldX <= maxWorldX; worldX += 1) {
        const dx = worldX - cluster.center.x;
        const dxSquared = dx * dx;
        if (dxSquared > cluster.maxSurfaceRadiusSquared) {
          continue;
        }
        const localX = worldX - chunkX;

        for (let worldY = minWorldY; worldY <= maxWorldY; worldY += 1) {
          const dy = worldY - cluster.center.y;
          const dySquared = dy * dy;
          const partialDistanceSquared = dxSquared + dySquared;
          if (partialDistanceSquared > cluster.maxSurfaceRadiusSquared) {
            continue;
          }
          const localY = worldY - chunkY;

          for (let worldZ = minWorldZ; worldZ <= maxWorldZ; worldZ += 1) {
            const dz = worldZ - cluster.center.z;
            const radialDistanceSquared = partialDistanceSquared + dz * dz;
            if (radialDistanceSquared > cluster.maxSurfaceRadiusSquared) {
              continue;
            }
            const localZ = worldZ - chunkZ;

            let filled = false;
            for (let b = 0; b < cluster.blobs.length; b += 1) {
              const blob = cluster.blobs[b];
              const bx = worldX - blob.center.x;
              const by = worldY - blob.center.y;
              const bz = worldZ - blob.center.z;
              if (bx * bx + by * by + bz * bz <= blob.radiusSquared) {
                filled = true;
                break;
              }
            }
            if (!filled) {
              continue;
            }

            let carved = false;
            for (let v = 0; v < cluster.voids.length; v += 1) {
              const voidBlob = cluster.voids[v];
              const vx = worldX - voidBlob.center.x;
              const vy = worldY - voidBlob.center.y;
              const vz = worldZ - voidBlob.center.z;
              if (vx * vx + vy * vy + vz * vz <= voidBlob.radiusSquared) {
                carved = true;
                break;
              }
            }
            if (carved) {
              continue;
            }

            target.set(localX, localY, localZ, cluster.blockId);
          }
        }
      }
    }
  }

  private computeClustersForChunk(chunkX: number, chunkY: number, chunkZ: number): AsteroidCluster[] {
    const chunkMin = new Vector3(chunkX, chunkY, chunkZ);
    const chunkMax = new Vector3(chunkX + CHUNK_SIZE, chunkY + CHUNK_SIZE, chunkZ + CHUNK_SIZE);
    return this.generateClustersForBounds(chunkMin, chunkMax);
  }

  private generateClustersForBounds(min: Vector3, max: Vector3): AsteroidCluster[] {
    const clusters: AsteroidCluster[] = [];
    const seen = new Set<string>();

    const cellMinX = Math.floor((min.x - MAX_CLUSTER_RADIUS) / CLUSTER_CELL_SIZE);
    const cellMaxX = Math.floor((max.x + MAX_CLUSTER_RADIUS) / CLUSTER_CELL_SIZE);
    const cellMinZ = Math.floor((min.z - MAX_CLUSTER_RADIUS) / CLUSTER_CELL_SIZE);
    const cellMaxZ = Math.floor((max.z + MAX_CLUSTER_RADIUS) / CLUSTER_CELL_SIZE);

    for (let cx = cellMinX; cx <= cellMaxX; cx += 1) {
      for (let cz = cellMinZ; cz <= cellMaxZ; cz += 1) {
        this.tryAddClusterForCell(cx, cz, min, max, clusters, seen);
      }
    }

    return clusters;
  }

  private tryAddClusterForCell(
    cellX: number,
    cellZ: number,
    boundsMin: Vector3,
    boundsMax: Vector3,
    clusters: AsteroidCluster[],
    seen: Set<string>,
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

    const attempts = 1;
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const radius = random.nextFloat(zone.radiusRange[0], zone.radiusRange[1]);
      const centerY = random.nextFloat(zone.verticalRange[0], zone.verticalRange[1]);
      const center = new Vector3(
        candidateX + random.nextFloat(-radius, radius) * 0.2,
        centerY,
        candidateZ + random.nextFloat(-radius, radius) * 0.2,
      );
      const candidate = this.createCluster(cellSeed, attempt, center, radius, zone, random);
      if (!candidate) {
        continue;
      }

      const maxSurfaceRadius = candidate.maxSurfaceRadius;
      const minX = candidate.center.x - maxSurfaceRadius;
      const maxX = candidate.center.x + maxSurfaceRadius;
      const minY = candidate.center.y - maxSurfaceRadius;
      const maxY = candidate.center.y + maxSurfaceRadius;
      const minZ = candidate.center.z - maxSurfaceRadius;
      const maxZ = candidate.center.z + maxSurfaceRadius;

      if (
        maxX < boundsMin.x ||
        minX > boundsMax.x ||
        maxY < boundsMin.y ||
        minY > boundsMax.y ||
        maxZ < boundsMin.z ||
        minZ > boundsMax.z
      ) {
        continue;
      }

      if (seen.has(candidate.hash)) {
        continue;
      }

      const tooCloseToExisting = clusters.some((existing) => {
        if (existing.hash === candidate.hash) {
          return false;
        }
        const dx = candidate.center.x - existing.center.x;
        const dy = candidate.center.y - existing.center.y;
        const dz = candidate.center.z - existing.center.z;
        const minAllowed =
          (candidate.maxSurfaceRadius + existing.maxSurfaceRadius) * CLUSTER_SEPARATION_RATIO + CLUSTER_SEPARATION_PADDING;
        const minAllowedSquared = minAllowed * minAllowed;
        return dx * dx + dy * dy + dz * dz < minAllowedSquared;
      });
      if (tooCloseToExisting) {
        continue;
      }

      seen.add(candidate.hash);
      clusters.push(candidate);
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

  private createCluster(
    cellSeed: string,
    attempt: number,
    center: Vector3,
    radius: number,
    zone: ZoneConfig,
    random: SeededRandom,
  ): AsteroidCluster | null {
    const clusterHash = `${cellSeed}:${attempt}`;
    const materialId = this.pickMaterial(zone, random);
    if (!materialId) {
      return null;
    }
    const blobs = this.createBlobSet(center, radius, zone, random);
    const voids = this.createVoidSet(center, radius, zone, random);
    let maxSurfaceRadius = radius;
    for (let i = 0; i < blobs.length; i += 1) {
      const blob = blobs[i];
      const offsetVector = blob.center.subtract(center);
      const offset = offsetVector.length();
      if (blob.radius + offset > maxSurfaceRadius) {
        maxSurfaceRadius = blob.radius + offset;
      }
    }
    const cluster: AsteroidCluster = {
      hash: clusterHash,
      center,
      radius,
      radiusSquared: radius * radius,
      blockId: materialId,
      maxSurfaceRadius,
      maxSurfaceRadiusSquared: maxSurfaceRadius * maxSurfaceRadius,
      blobs,
      voids,
      mode: this.clusterModes.get(clusterHash) ?? 'mesh',
    };
    return cluster;
  }

  private createBlobSet(
    center: Vector3,
    radius: number,
    zone: ZoneConfig,
    random: SeededRandom,
  ): ClusterBlob[] {
    const blobs: ClusterBlob[] = [];
    const min = Math.max(zone.asteroidCountRange[0], 1);
    const max = Math.max(zone.asteroidCountRange[1], min);
    const count = random.nextInt(min, max + 1);
    const attempts = Math.max(count * 5, count + 4);
    let placed = 0;
    for (let i = 0; i < attempts && placed < count; i += 1) {
      const direction = this.randomUnitVector(random);
      const offsetMagnitude = random.nextFloat(radius * 0.4, radius * 1.0);
      const scale = random.nextFloat(zone.asteroidRadiusScale[0], zone.asteroidRadiusScale[1]);
      const blobRadius = Math.max(1, radius * scale);
      const blobCenter = new Vector3(
        center.x + direction.x * offsetMagnitude,
        center.y + direction.y * offsetMagnitude,
        center.z + direction.z * offsetMagnitude,
      );
      let overlaps = false;
      for (let b = 0; b < blobs.length; b += 1) {
        const other = blobs[b];
        const ox = blobCenter.x - other.center.x;
        const oy = blobCenter.y - other.center.y;
        const oz = blobCenter.z - other.center.z;
        const minGap = other.radius + blobRadius + Math.max(radius * 0.1, 2);
        if (ox * ox + oy * oy + oz * oz < minGap * minGap) {
          overlaps = true;
          break;
        }
      }
      if (overlaps) {
        continue;
      }
      blobs.push({ center: blobCenter, radius: blobRadius, radiusSquared: blobRadius * blobRadius });
      placed += 1;
    }
    if (blobs.length === 0) {
      const fallbackRadius = Math.max(1, radius * zone.asteroidRadiusScale[0]);
      blobs.push({
        center: center.clone(),
        radius: fallbackRadius,
        radiusSquared: fallbackRadius * fallbackRadius,
      });
    }
    return blobs;
  }

  private createVoidSet(
    center: Vector3,
    radius: number,
    zone: ZoneConfig,
    random: SeededRandom,
  ): ClusterBlob[] {
    const voids: ClusterBlob[] = [];
    const min = Math.max(zone.voidCountRange[0], 0);
    const max = Math.max(zone.voidCountRange[1], min);
    const count = random.nextInt(min, max + 1);
    if (count === 0) {
      return voids;
    }
    const sampleBlobs = Math.max(1, Math.round(count * 1.5));
    for (let i = 0; i < sampleBlobs; i += 1) {
      const direction = this.randomUnitVector(random);
      const offsetMagnitude = random.nextFloat(radius * 0.1, radius * 0.8);
      const scale = random.nextFloat(zone.voidRadiusScale[0], zone.voidRadiusScale[1]);
      const voidRadius = Math.max(1, radius * scale);
      const voidCenter = new Vector3(
        center.x + direction.x * offsetMagnitude,
        center.y + direction.y * offsetMagnitude,
        center.z + direction.z * offsetMagnitude,
      );
      voids.push({ center: voidCenter, radius: voidRadius, radiusSquared: voidRadius * voidRadius });
      if (voids.length >= count) {
        break;
      }
    }
    return voids;
  }

  private randomUnitVector(random: SeededRandom): Vector3 {
    let x: number;
    let y: number;
    let z: number;
    let lengthSquared: number;
    do {
      x = random.nextSigned();
      y = random.nextSigned();
      z = random.nextSigned();
      lengthSquared = x * x + y * y + z * z;
    } while (lengthSquared <= 0.0001);
    const lengthInv = 1 / Math.sqrt(lengthSquared);
    return new Vector3(x * lengthInv, y * lengthInv, z * lengthInv);
  }

  private invalidateCluster(cluster: AsteroidCluster) {
    const radius = cluster.maxSurfaceRadius + 4;
    const base = [
      cluster.center.x - radius,
      cluster.center.y - radius,
      cluster.center.z - radius,
    ];
    const max = [
      cluster.center.x + radius,
      cluster.center.y + radius,
      cluster.center.z + radius,
    ];
    const world = this.noa.world as unknown as {
      invalidateVoxelsInAABB(box: { base: number[]; max: number[] }): void;
    };
    world.invalidateVoxelsInAABB({ base, max });
  }

}
