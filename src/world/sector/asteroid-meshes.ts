import type { Engine } from 'noa-engine';
import { CreateIcoSphere } from '@babylonjs/core/Meshes/Builders/icoSphereBuilder';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import type { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';
import { SeededRandom } from '../../utils/seeded-random';
import type { AsteroidCluster } from './asteroid-field';

interface ClusterMeshData {
  parent: TransformNode;
  instances: AbstractMesh[];
  baseOffsets: Vector3[];
  phases: number[];
  speeds: number[];
  amplitudes: number[];
  globalCenter: Vector3;
}

export class AsteroidMeshController {
  private readonly baseMesh: Mesh;

  private readonly clusters = new Map<string, ClusterMeshData>();

  private readonly globalScratch: [number, number, number] = [0, 0, 0];

  private readonly localScratch: [number, number, number] = [0, 0, 0];

  constructor(private readonly noa: Engine) {
    const scene = noa.rendering.getScene();
    this.baseMesh = CreateIcoSphere('asteroid-proto', { radius: 1, subdivisions: 1 }, scene);
    const material = noa.rendering.makeStandardMaterial();
    material.name = 'asteroid-mesh';
    material.diffuseColor = new Color3(0.38, 0.34, 0.32);
    material.specularColor = Color3.Black();
    this.baseMesh.material = material;
    this.baseMesh.isVisible = false;
    this.baseMesh.isPickable = false;
    this.baseMesh.doNotSyncBoundingInfo = true;
  }

  enable(cluster: AsteroidCluster) {
    if (this.clusters.has(cluster.hash)) {
      return;
    }

    const scene = this.noa.rendering.getScene();
    const parent = new TransformNode(`cluster-mesh-${cluster.hash}`, scene);
    parent.position.set(0, 0, 0);

    const random = new SeededRandom(cluster.hash);
    const instances: AbstractMesh[] = [];
    const baseOffsets: Vector3[] = [];
    const phases: number[] = [];
    const speeds: number[] = [];
    const amplitudes: number[] = [];

    for (let i = 0; i < cluster.blobs.length; i += 1) {
      const blob = cluster.blobs[i];
      const offset = new Vector3(
        blob.center.x - cluster.center.x,
        blob.center.y - cluster.center.y,
        blob.center.z - cluster.center.z,
      );
      const instance = this.baseMesh.createInstance(`cluster-mesh-${cluster.hash}-${i}`);
      instance.parent = parent;
      const scale = Math.max(blob.radius * 0.75, 1.2);
      instance.scaling = new Vector3(scale, scale, scale);
      instance.position = offset.clone();
      instance.rotation = new Vector3(random.nextFloat(0, Math.PI), random.nextFloat(0, Math.PI), random.nextFloat(0, Math.PI));

      instances.push(instance);
      baseOffsets.push(offset);
      phases.push(random.nextFloat(0, Math.PI * 2));
      speeds.push(random.nextFloat(0.25, 0.55));
      amplitudes.push(Math.min(blob.radius * 0.32, 4.5));
    }

    this.clusters.set(cluster.hash, {
      parent,
      instances,
      baseOffsets,
      phases,
      speeds,
      amplitudes,
      globalCenter: cluster.center.clone(),
    });
  }

  disable(cluster: AsteroidCluster) {
    const entry = this.clusters.get(cluster.hash);
    if (!entry) {
      return;
    }
    entry.instances.forEach((instance) => instance.dispose());
    entry.parent.dispose();
    this.clusters.delete(cluster.hash);
  }

  update(dt: number) {
    if (this.clusters.size === 0) {
      return;
    }
    const delta = dt / 1000;
    for (const entry of this.clusters.values()) {
      this.globalScratch[0] = entry.globalCenter.x;
      this.globalScratch[1] = entry.globalCenter.y;
      this.globalScratch[2] = entry.globalCenter.z;
      const local = this.noa.globalToLocal(
        this.globalScratch,
        null,
        this.localScratch,
      ) as [number, number, number];
      entry.parent.position.x = local[0];
      entry.parent.position.y = local[1];
      entry.parent.position.z = local[2];
      for (let i = 0; i < entry.instances.length; i += 1) {
        entry.phases[i] += entry.speeds[i] * delta;
        const base = entry.baseOffsets[i];
        const amplitude = entry.amplitudes[i];
        const phase = entry.phases[i];
        const offsetX = Math.sin(phase) * amplitude;
        const offsetY = Math.cos(phase * 0.7) * amplitude * 0.6;
        const offsetZ = Math.sin(phase * 1.3) * amplitude * 0.8;

        const instance = entry.instances[i];
        instance.position.x = base.x + offsetX;
        instance.position.y = base.y + offsetY;
        instance.position.z = base.z + offsetZ;
        instance.rotation.x += delta * 0.2;
        instance.rotation.y += delta * 0.3;
      }
    }
  }
}
