import { Engine } from 'noa-engine';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import type { TickSystem } from '../core/loop';
import type { AsteroidField } from '../world/sector/asteroid-field';

const VOXEL_LOD_RADIUS = 24 * 32; // blocks (≈12 chunks)
const MESH_LOD_RADIUS = 32 * 32; // blocks (≈18 chunks)
const LOD_SEARCH_RADIUS = MESH_LOD_RADIUS + 4096;

interface LODCluster {
  hash: string;
  mode: 'mesh' | 'voxel';
  center: Vector3;
}

export function initializeAsteroidLOD(
  noa: Engine,
  field: AsteroidField,
): TickSystem {
  const lodState = new Map<string, LODCluster>();

  const getPlayerPosition = () => {
    const pos = noa.entities.getPositionData(noa.playerEntity).position;
    return new Vector3(pos[0], pos[1], pos[2]);
  };

  return {
    id: 'asteroid-lod',
    update: (dt: number) => {
      field.updateMeshes(dt);
      const playerPos = getPlayerPosition();
      const clusters = field.getClustersWithinRadius(playerPos, LOD_SEARCH_RADIUS);
      const seen = new Set<string>();

      for (let i = 0; i < clusters.length; i += 1) {
        const cluster = clusters[i];
        const hash = cluster.hash;
        seen.add(hash);
        const state = lodState.get(hash);
        const distance = Vector3.Distance(cluster.center, playerPos);

        if (!state) {
          const mode = distance <= VOXEL_LOD_RADIUS ? 'voxel' : 'mesh';
          field.setClusterMode(cluster, mode);
          lodState.set(hash, { hash, mode, center: cluster.center.clone() });
          continue;
        }

        if (state.mode === 'mesh' && distance <= VOXEL_LOD_RADIUS) {
          field.setClusterMode(cluster, 'voxel');
          lodState.set(hash, { hash, mode: 'voxel', center: cluster.center.clone() });
        } else if (state.mode === 'voxel' && distance >= MESH_LOD_RADIUS) {
          field.setClusterMode(cluster, 'mesh');
          lodState.set(hash, { hash, mode: 'mesh', center: cluster.center.clone() });
        }
      }

      for (const [hash] of Array.from(lodState.entries())) {
        if (!seen.has(hash)) {
          lodState.delete(hash);
        }
      }
    },
  };
}
