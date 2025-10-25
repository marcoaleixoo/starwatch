import { Engine } from 'noa-engine';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import type { TickSystem } from '../core/loop';
import type { AsteroidCluster, AsteroidField } from '../world/sector/asteroid-field';
import {
  getRenderSettings,
  subscribeRenderSettings,
  type RenderSettingsState,
} from '../config/render-settings';

interface LODCluster {
  hash: string;
  mode: 'mesh' | 'voxel';
  center: Vector3;
  cluster: AsteroidCluster;
}

export function initializeAsteroidLOD(
  noa: Engine,
  field: AsteroidField,
  options?: { chunkSize?: number },
): TickSystem {
  const lodState = new Map<string, LODCluster>();
  const chunkSize =
    options?.chunkSize ??
    ((noa.world as unknown as { _chunkSize?: number })._chunkSize ?? 32);

  let voxelRadiusBlocks = 0;
  let meshRadiusBlocks = 0;
  let searchRadiusBlocks = 0;

  const applySettings = (settings: RenderSettingsState) => {
    voxelRadiusBlocks = settings.asteroidVoxelLodChunks * chunkSize;
    meshRadiusBlocks = settings.asteroidMeshLodChunks * chunkSize;
    searchRadiusBlocks = meshRadiusBlocks + settings.asteroidSearchMarginChunks * chunkSize;
    console.log(
      `[AsteroidLOD] thresholds -> voxel:${settings.asteroidVoxelLodChunks.toFixed(0)}c mesh:${settings.asteroidMeshLodChunks.toFixed(
        0,
      )}c search margin:${settings.asteroidSearchMarginChunks.toFixed(0)}c`,
    );
  };

  applySettings(getRenderSettings());
  subscribeRenderSettings(applySettings);

  const getPlayerPosition = () => {
    const pos = noa.entities.getPositionData(noa.playerEntity).position;
    return new Vector3(pos[0], pos[1], pos[2]);
  };

  return {
    id: 'asteroid-lod',
    update: (dt: number) => {
      field.updateMeshes(dt);
      const playerPos = getPlayerPosition();
      const clusters = field.getClustersWithinRadius(playerPos, searchRadiusBlocks);
      const seen = new Set<string>();

      for (let i = 0; i < clusters.length; i += 1) {
        const cluster = clusters[i];
        const hash = cluster.hash;
        seen.add(hash);
        const state = lodState.get(hash);
        const distance = Vector3.Distance(cluster.center, playerPos);

        if (!state) {
          const mode = distance <= voxelRadiusBlocks ? 'voxel' : 'mesh';
          field.setClusterMode(cluster, mode);
          lodState.set(hash, { hash, mode, center: cluster.center.clone(), cluster });
          continue;
        }

        state.cluster = cluster;
        state.center.copyFrom(cluster.center);

        if (state.mode === 'mesh' && distance <= voxelRadiusBlocks) {
          field.setClusterMode(cluster, 'voxel');
          state.mode = 'voxel';
          state.center.copyFrom(cluster.center);
        } else if (state.mode === 'voxel' && distance >= meshRadiusBlocks) {
          field.setClusterMode(cluster, 'mesh');
          state.mode = 'mesh';
          state.center.copyFrom(cluster.center);
        }
      }

      for (const [hash, state] of Array.from(lodState.entries())) {
        if (!seen.has(hash)) {
          field.setClusterMode(state.cluster, 'voxel');
          lodState.delete(hash);
        }
      }
    },
  };
}
