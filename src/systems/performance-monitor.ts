import { Engine } from 'noa-engine';
import type { TickSystem } from '../core/loop';
import type { AsteroidField } from '../world/sector/asteroid-field';
import type { PerformancePanelController } from '../hud/performance-panel';

const SAMPLE_INTERVAL_MS = 1000;
const FPS_SMOOTHING = 0.18;
const MB = 1024 * 1024;

type LocationQueueLike = { count?: () => number };

const countQueue = (queue: LocationQueueLike | undefined): number => {
  if (!queue || typeof queue.count !== 'function') {
    return 0;
  }
  return queue.count();
};

const collectMeshStats = (noa: Engine) => {
  const scene = noa.rendering.getScene();
  if (!scene?.meshes) {
    return { terrain: 0, vertices: 0 };
  }
  let terrain = 0;
  let vertices = 0;
  for (let i = 0; i < scene.meshes.length; i += 1) {
    const mesh = scene.meshes[i];
    if (mesh?.metadata && (mesh.metadata as Record<string, unknown>).noa_chunk_terrain_mesh) {
      terrain += 1;
      if (typeof mesh.getTotalVertices === 'function') {
        vertices += mesh.getTotalVertices() ?? 0;
      }
    }
  }
  return { terrain, vertices };
};

const collectMemoryStats = () => {
  const perf = performance as Performance & {
    memory?: {
      usedJSHeapSize?: number;
      jsHeapSizeLimit?: number;
    };
  };
  const memory = perf.memory;
  if (!memory) {
    return { usedMB: null, totalMB: null };
  }
  const used =
    typeof memory.usedJSHeapSize === 'number' && Number.isFinite(memory.usedJSHeapSize)
      ? memory.usedJSHeapSize / MB
      : null;
  const total =
    typeof memory.jsHeapSizeLimit === 'number' && Number.isFinite(memory.jsHeapSizeLimit)
      ? memory.jsHeapSizeLimit / MB
      : null;
  return { usedMB: used, totalMB: total };
};

export interface PerformanceSnapshot {
  fps: number | null;
  frameTime: number | null;
  chunks: {
    loaded: number;
  };
  queues: {
    toRequest: number;
    toMesh: number;
    toRemove: number;
  };
  meshes: {
    terrain: number;
  };
  vertices: {
    terrain: number;
  };
  memory: {
    usedMB: number | null;
    totalMB: number | null;
  };
  asteroids: {
    cached: number;
    queue: number;
  };
}

export function initializePerformanceMonitor(
  noa: Engine,
  field: AsteroidField,
  panel: PerformancePanelController,
): TickSystem {
  let fpsEstimate: number | null = null;
  let frameTimeEstimate: number | null = null;
  let lastSample = performance.now();

  noa.on('afterRender', (dt: number) => {
    if (!Number.isFinite(dt) || dt <= 0) return;
    const instantaneousFps = 1000 / dt;
    fpsEstimate =
      fpsEstimate === null ? instantaneousFps : fpsEstimate + (instantaneousFps - fpsEstimate) * FPS_SMOOTHING;
    frameTimeEstimate =
      frameTimeEstimate === null ? dt : frameTimeEstimate + (dt - frameTimeEstimate) * FPS_SMOOTHING;
  });

  const gatherSnapshot = (): PerformanceSnapshot => {
    const world = noa.world as unknown as Record<string, unknown>;
    const storage = world?._storage as { hash?: Record<string, unknown> } | undefined;
    const loaded = storage?.hash ? Object.keys(storage.hash).length : 0;

    const queues = {
      toRequest:
        countQueue(world?._chunksToRequest as LocationQueueLike) +
        countQueue(world?._chunksPending as LocationQueueLike),
      toMesh:
        countQueue(world?._chunksToMesh as LocationQueueLike) +
        countQueue(world?._chunksToMeshFirst as LocationQueueLike),
      toRemove: countQueue(world?._chunksToRemove as LocationQueueLike),
    };

    const meshStats = collectMeshStats(noa);
    const memoryStats = collectMemoryStats();
    const asteroidStats = field.getCacheStats();

    return {
      fps: fpsEstimate,
      frameTime: frameTimeEstimate,
      chunks: { loaded },
      queues,
      meshes: {
        terrain: meshStats.terrain,
      },
      vertices: {
        terrain: meshStats.vertices,
      },
      memory: memoryStats,
      asteroids: {
        cached: asteroidStats.cachedChunks,
        queue: asteroidStats.queueSize,
      },
    };
  };

  return {
    id: 'performance-monitor',
    update: () => {
      const now = performance.now();
      if (now - lastSample < SAMPLE_INTERVAL_MS) {
        return;
      }
      lastSample = now;
      panel.update(gatherSnapshot());
    },
  };
}
