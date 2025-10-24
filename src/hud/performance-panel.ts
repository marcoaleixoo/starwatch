import type { PerformanceSnapshot } from '../systems/performance-monitor';

const metricsElements = {
  fps: document.getElementById('metric-fps'),
  frame: document.getElementById('metric-frame'),
  chunks: document.getElementById('metric-chunks'),
  queues: document.getElementById('metric-queues'),
  meshes: document.getElementById('metric-meshes'),
  vertices: document.getElementById('metric-vertices'),
  memory: document.getElementById('metric-memory'),
  asteroids: document.getElementById('metric-asteroids'),
} as const;

const formatNumber = (value: number, digits: number = 0): string => value.toFixed(digits);

const formatThousands = (value: number): string => {
  if (!Number.isFinite(value)) {
    return 'n/a';
  }
  if (Math.abs(value) >= 1000000) {
    return `${(value / 1000000).toFixed(2)}M`;
  }
  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return value.toString();
};

const formatMemory = (usedMB: number | null, totalMB: number | null): string => {
  if (!Number.isFinite(usedMB ?? NaN)) {
    return 'n/a';
  }
  if (Number.isFinite(totalMB ?? NaN)) {
    return `${usedMB!.toFixed(1)} / ${totalMB!.toFixed(0)} MB`;
  }
  return `${usedMB!.toFixed(1)} MB`;
};

export interface PerformancePanelController {
  update(snapshot: PerformanceSnapshot): void;
}

export function createPerformancePanel(): PerformancePanelController {
  const hasMetrics = Object.values(metricsElements).every((element) => element);
  if (!hasMetrics) {
    return {
      update() {
        /* no-op when HUD is not mounted */
      },
    };
  }

  return {
    update(snapshot) {
      const {
        fps,
        frameTime,
        chunks,
        queues,
        meshes,
        vertices,
        memory,
        asteroids,
      } = snapshot;

      if (metricsElements.fps) {
        metricsElements.fps.textContent = Number.isFinite(fps ?? NaN) ? formatNumber(fps!, 0) : 'n/a';
      }

      if (metricsElements.frame) {
        metricsElements.frame.textContent = Number.isFinite(frameTime ?? NaN)
          ? `${frameTime!.toFixed(1)} ms`
          : 'n/a';
      }

      if (metricsElements.chunks) {
        metricsElements.chunks.textContent = `${chunks.loaded} stored`;
      }

      if (metricsElements.queues) {
        metricsElements.queues.textContent = `req ${queues.toRequest} • mesh ${queues.toMesh} • rem ${queues.toRemove}`;
      }

      if (metricsElements.meshes) {
        metricsElements.meshes.textContent = `${meshes.terrain}`;
      }

      if (metricsElements.vertices) {
        metricsElements.vertices.textContent = formatThousands(vertices.terrain);
      }

      if (metricsElements.memory) {
        metricsElements.memory.textContent = formatMemory(memory.usedMB, memory.totalMB);
      }

      if (metricsElements.asteroids) {
        metricsElements.asteroids.textContent = `cache ${asteroids.cached} • queue ${asteroids.queue}`;
      }
    },
  };
}
