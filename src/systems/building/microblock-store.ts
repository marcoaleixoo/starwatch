import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import type { Engine } from 'noa-engine';
import type { BlockDefinition, BlockKind, BlockOrientation } from '../../blocks/types';
import { blockMetadataStore } from '../../blocks/metadata-store';
import type { GridScaleId } from '../../config/build-options';
import { GRID_SCALE_OPTIONS } from '../../config/build-options';

interface MicroblockRuntimeCell {
  mesh: Mesh;
}

interface MicroblockRuntimeEntry {
  scaleId: GridScaleId;
  cells: Map<number, MicroblockRuntimeCell>;
}

type BaseCoordinate = [number, number, number];

const MATERIAL_COLOR_BY_KIND: Record<BlockKind, [number, number, number]> = {
  'starwatch:deck': [0.15, 0.7, 1],
  'starwatch:deck-micro-host': [0.52, 0.58, 0.62],
  'starwatch:solar-panel': [0.15, 0.35, 0.72],
  'starwatch:battery': [0.18, 0.24, 0.36],
  'starwatch:hal-terminal': [0.12, 0.2, 0.36],
};

function makeRuntimeKey([x, y, z]: BaseCoordinate): string {
  return `${x}:${y}:${z}`;
}

export interface MicroblockDescriptor {
  definition: BlockDefinition;
  scaleId: GridScaleId;
  cellIndex: number;
  orientation: BlockOrientation;
  size: [number, number, number];
  position: [number, number, number];
  rotationY: number;
}

export class MicroblockStore {
  private noa: Engine;
  private runtimeEntries = new Map<string, MicroblockRuntimeEntry>();
  private materialByKind = new Map<BlockKind, StandardMaterial>();
  private templateByKindAndScale = new Map<string, Mesh>();
  private scene: any;

  constructor(noa: Engine) {
    this.noa = noa;
    this.scene = noa.rendering.getScene();
  }

  clear(): void {
    for (const entry of this.runtimeEntries.values()) {
      for (const cell of entry.cells.values()) {
        cell.mesh.dispose(false, true);
      }
    }
    this.runtimeEntries.clear();
  }

  add(base: BaseCoordinate, descriptor: MicroblockDescriptor): void {
    const key = makeRuntimeKey(base);
    const runtime = this.runtimeEntries.get(key);
    if (runtime && runtime.scaleId !== descriptor.scaleId) {
      this.removeAll(base);
    }

    const targetEntry = this.runtimeEntries.get(key) ?? {
      scaleId: descriptor.scaleId,
      cells: new Map(),
    };
    targetEntry.scaleId = descriptor.scaleId;

    const template = this.getOrCreateTemplate(descriptor.definition.kind, descriptor.scaleId);
    const instanceName = `microblock:${descriptor.definition.kind}:${descriptor.scaleId}:${base.join(',')}:${descriptor.cellIndex}`;
    const mesh = template.createInstance(instanceName);
    mesh.isPickable = false;
    mesh.alwaysSelectAsActiveMesh = true;
    mesh.rotationQuaternion = null;
    const divisions = GRID_SCALE_OPTIONS[descriptor.scaleId]?.divisions ?? 1;
    const cellSize = 1 / divisions;
    const cellX = descriptor.cellIndex % divisions;
    const cellZ = Math.floor(descriptor.cellIndex / divisions);
    const thickness = 0.1;

    const centerX = base[0] + cellX * cellSize + cellSize / 2;
    const centerZ = base[2] + cellZ * cellSize + cellSize / 2;
    const centerY = base[1] + 1 + thickness / 2;

    mesh.scaling.x = cellSize * 0.95;
    mesh.scaling.y = thickness;
    mesh.scaling.z = cellSize * 0.95;
    mesh.position.x = centerX;
    mesh.position.y = centerY;
    mesh.position.z = centerZ;
    mesh.rotation.y = descriptor.rotationY;
    mesh.visibility = 1;
    mesh.isVisible = true;
    this.noa.rendering.addMeshToScene(mesh, false);

    targetEntry.cells.set(descriptor.cellIndex, { mesh });
    this.runtimeEntries.set(key, targetEntry);

    blockMetadataStore.setMicroblockCell(
      { x: base[0], y: base[1], z: base[2] },
      descriptor.scaleId,
      descriptor.cellIndex,
      { kind: descriptor.definition.kind, orientation: descriptor.orientation },
    );
  }

  remove(base: BaseCoordinate, cellIndex: number): void {
    const key = makeRuntimeKey(base);
    const entry = this.runtimeEntries.get(key);
    if (!entry) {
      return;
    }
    const cell = entry.cells.get(cellIndex);
    if (cell) {
      cell.mesh.dispose(false, true);
      entry.cells.delete(cellIndex);
      blockMetadataStore.deleteMicroblockCell({ x: base[0], y: base[1], z: base[2] }, cellIndex);
    }
    if (entry.cells.size === 0) {
      this.runtimeEntries.delete(key);
    }
  }

  removeAll(base: BaseCoordinate): void {
    const key = makeRuntimeKey(base);
    const entry = this.runtimeEntries.get(key);
    if (!entry) {
      return;
    }
    for (const cell of entry.cells.values()) {
      cell.mesh.dispose(false, true);
    }
    this.runtimeEntries.delete(key);
    blockMetadataStore.deleteMicroblockEntry({ x: base[0], y: base[1], z: base[2] });
  }

  getRuntimeEntry(base: BaseCoordinate): MicroblockRuntimeEntry | null {
    const key = makeRuntimeKey(base);
    const entry = this.runtimeEntries.get(key);
    if (!entry) {
      return null;
    }
    return {
      scaleId: entry.scaleId,
      cells: new Map(entry.cells),
    };
  }

  private getOrCreateTemplate(kind: BlockKind, scaleId: GridScaleId): Mesh {
    const key = `${kind}:${scaleId}`;
    const cached = this.templateByKindAndScale.get(key);
    if (cached) {
      return cached;
    }
    const material = this.getOrCreateMaterial(kind);
    const mesh = MeshBuilder.CreateBox(`micro-template:${key}`, { size: 1 }, this.scene);
    mesh.isPickable = false;
    mesh.alwaysSelectAsActiveMesh = true;
    mesh.rotationQuaternion = null;
    mesh.material = material;
    mesh.renderingGroupId = 2;
    mesh.isVisible = false;
    this.templateByKindAndScale.set(key, mesh);
    return mesh;
  }

  private getOrCreateMaterial(kind: BlockKind): StandardMaterial {
    const existing = this.materialByKind.get(kind);
    if (existing) {
      return existing;
    }
    const color = MATERIAL_COLOR_BY_KIND[kind] ?? [0.4, 0.4, 0.4];
    const material = new StandardMaterial(`microblock-material:${kind}`, this.scene);
    material.diffuseColor = new Color3(color[0], color[1], color[2]);
    material.specularColor = new Color3(0.1, 0.15, 0.22);
    material.emissiveColor = new Color3(color[0], color[1], color[2]).scale(0.95);
    material.disableLighting = true;
    material.backFaceCulling = false;
    material.alpha = 1;
    material.freeze();
    this.materialByKind.set(kind, material);
    return material;
  }
}
