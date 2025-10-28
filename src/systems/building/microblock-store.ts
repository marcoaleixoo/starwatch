import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import type { InstancedMesh } from '@babylonjs/core/Meshes/instancedMesh';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import type { Engine } from 'noa-engine';
import type { BlockDefinition, BlockKind, BlockOrientation } from '../../blocks/types';
import { blockMetadataStore } from '../../blocks/metadata-store';
import type { GridScaleId } from '../../config/build-options';
import { GRID_SCALE_OPTIONS } from '../../config/build-options';
import {
  MICROBLOCK_COLLISION_PADDING,
  MICROBLOCK_PANEL_SCALE_PADDING,
  MICROBLOCK_PANEL_THICKNESS,
} from '../../config/microblock-options';

export const MAX_MICRO_LEVELS_PER_CELL = 8;

interface MicroblockRuntimeLevel {
  mesh: Mesh | InstancedMesh;
  colliderId: number | null;
  levelIndex: number;
}

interface MicroblockRuntimeCell {
  levels: MicroblockRuntimeLevel[];
}

interface MicroblockRuntimeEntry {
  scaleId: GridScaleId;
  cells: Map<number, MicroblockRuntimeCell>;
}

type BaseCoordinate = [number, number, number];

type PositionStateLike = {
  width: number;
  height: number;
  position: number[] | null;
  _localPosition: number[] | null;
  _renderPosition: number[] | null;
  _extents: Float32Array | number[];
};

const MATERIAL_COLOR_BY_KIND: Record<BlockKind, [number, number, number]> = {
  'starwatch:deck': [0.15, 0.7, 1.0],
  'starwatch:deck-micro-host': [0.52, 0.58, 0.62],
  'starwatch:solar-panel': [0.15, 0.35, 0.72],
  'starwatch:battery': [0.18, 0.24, 0.36],
  'starwatch:hal-terminal': [0.12, 0.2, 0.36],
};

const DECK_ALBEDO_URL = new URL('../../assets/metalgrid3-bl/metalgrid3_basecolor.png', import.meta.url).href;
const DECK_NORMAL_URL = new URL('../../assets/metalgrid3-bl/metalgrid3_normal-ogl.png', import.meta.url).href;
const DECK_METALLIC_URL = new URL('../../assets/metalgrid3-bl/metalgrid3_metallic.png', import.meta.url).href;
const DECK_AO_URL = new URL('../../assets/metalgrid3-bl/metalgrid3_AO.png', import.meta.url).href;

function makeRuntimeKey([x, y, z]: BaseCoordinate): string {
  return `${x}:${y}:${z}`;
}

export interface MicroblockDescriptor {
  definition: BlockDefinition;
  scaleId: GridScaleId;
  cellIndex: number;
  orientation: BlockOrientation;
}

export class MicroblockStore {
  private noa: Engine;
  private runtimeEntries = new Map<string, MicroblockRuntimeEntry>();
  private materialByKind = new Map<BlockKind, StandardMaterial>();
  private templateByKind = new Map<BlockKind, Mesh>();
  private scene: any;
  private deckMaterial: StandardMaterial | null;
  private colliderIds = new Set<number>();

  constructor(noa: Engine, deckMaterial: StandardMaterial | null) {
    this.noa = noa;
    this.scene = noa.rendering.getScene();
    this.deckMaterial = deckMaterial;
  }

  clear(): void {
    for (const entry of this.runtimeEntries.values()) {
      for (const cell of entry.cells.values()) {
        for (const level of cell.levels) {
          level.mesh.dispose(false, true);
          if (typeof level.colliderId === 'number') {
            this.noa.entities.deleteEntity(level.colliderId);
            this.colliderIds.delete(level.colliderId);
          }
        }
      }
    }
    this.runtimeEntries.clear();
    this.colliderIds.clear();
    blockMetadataStore.clearMicroblocks();
  }

  add(base: BaseCoordinate, descriptor: MicroblockDescriptor): void {
    const divisions = GRID_SCALE_OPTIONS[descriptor.scaleId]?.divisions ?? 1;
    const cellSize = 1 / divisions;
    const cellX = descriptor.cellIndex % divisions;
    const cellZ = Math.floor(descriptor.cellIndex / divisions);

    const key = makeRuntimeKey(base);
    const runtime = this.runtimeEntries.get(key);
    if (runtime && runtime.scaleId !== descriptor.scaleId) {
      this.removeAll(base);
    }

    const targetEntry =
      this.runtimeEntries.get(key) ?? {
        scaleId: descriptor.scaleId,
        cells: new Map<number, MicroblockRuntimeCell>(),
      };
    targetEntry.scaleId = descriptor.scaleId;

    const runtimeCell = targetEntry.cells.get(descriptor.cellIndex) ?? { levels: [] };
    if (runtimeCell.levels.length >= MAX_MICRO_LEVELS_PER_CELL) {
      return;
    }

    const levelIndex = blockMetadataStore.pushMicroblockLevel(
      { x: base[0], y: base[1], z: base[2] },
      descriptor.scaleId,
      descriptor.cellIndex,
      {
        kind: descriptor.definition.kind,
        level: { orientation: descriptor.orientation },
      },
    );

    const template = this.getOrCreateTemplate(descriptor.definition.kind);
    const instanceName = `microblock:${descriptor.definition.kind}:${descriptor.scaleId}:${base.join(',')}:${descriptor.cellIndex}:${levelIndex}`;
    const mesh = template.createInstance(instanceName);
    mesh.isPickable = true;
    mesh.alwaysSelectAsActiveMesh = true;
    mesh.rotationQuaternion = null;

    const scale = cellSize * MICROBLOCK_PANEL_SCALE_PADDING;
    mesh.scaling.x = scale;
    mesh.scaling.y = MICROBLOCK_PANEL_THICKNESS;
    mesh.scaling.z = scale;

    const centerX = base[0] + cellX * cellSize + cellSize / 2;
    const centerZ = base[2] + cellZ * cellSize + cellSize / 2;
    const centerY = base[1] + 1 + levelIndex * MICROBLOCK_PANEL_THICKNESS + MICROBLOCK_PANEL_THICKNESS / 2;

    mesh.position.x = centerX;
    mesh.position.y = centerY;
    mesh.position.z = centerZ;
    mesh.rotation.y = 0;
    mesh.visibility = 1;
    mesh.isVisible = true;
    this.noa.rendering.addMeshToScene(mesh, false);

    const colliderId = this.noa.entities.add(
      [centerX, centerY - MICROBLOCK_PANEL_THICKNESS / 2, centerZ],
      scale,
      MICROBLOCK_PANEL_THICKNESS,
      null,
      null,
      false,
      false,
    );
    this.noa.entities.addComponent(colliderId, this.noa.entities.names.collideEntities, {
      collideBits: 0,
      collideMask: 1,
      callback: (otherId: number) => this.handleColliderContact(colliderId, otherId),
    });
    this.colliderIds.add(colliderId);

    runtimeCell.levels.push({
      mesh,
      colliderId,
      levelIndex,
    });
    targetEntry.cells.set(descriptor.cellIndex, runtimeCell);
    this.runtimeEntries.set(key, targetEntry);
  }

  remove(base: BaseCoordinate, cellIndex: number): boolean {
    const key = makeRuntimeKey(base);
    const entry = this.runtimeEntries.get(key);
    if (!entry) {
      return false;
    }
    const cell = entry.cells.get(cellIndex);
    if (!cell || cell.levels.length === 0) {
      return false;
    }

    const popped = blockMetadataStore.popMicroblockLevel(
      { x: base[0], y: base[1], z: base[2] },
      cellIndex,
    );
    if (!popped) {
      return false;
    }

    const level = cell.levels.pop()!;
    level.mesh.dispose(false, true);
    if (typeof level.colliderId === 'number') {
      this.noa.entities.deleteEntity(level.colliderId);
      this.colliderIds.delete(level.colliderId);
    }

    if (cell.levels.length === 0) {
      entry.cells.delete(cellIndex);
    } else {
      entry.cells.set(cellIndex, cell);
    }
    if (entry.cells.size === 0) {
      this.runtimeEntries.delete(key);
    } else {
      this.runtimeEntries.set(key, entry);
    }
    return true;
  }

  removeAll(base: BaseCoordinate): void {
    const key = makeRuntimeKey(base);
    const entry = this.runtimeEntries.get(key);
    if (!entry) {
      blockMetadataStore.deleteMicroblockEntry({ x: base[0], y: base[1], z: base[2] });
      return;
    }
    for (const cell of entry.cells.values()) {
      for (const level of cell.levels) {
        level.mesh.dispose(false, true);
        if (typeof level.colliderId === 'number') {
          this.noa.entities.deleteEntity(level.colliderId);
          this.colliderIds.delete(level.colliderId);
        }
      }
    }
    this.runtimeEntries.delete(key);
    blockMetadataStore.deleteMicroblockEntry({ x: base[0], y: base[1], z: base[2] });
  }

  private handleColliderContact(colliderId: number, otherId: number): void {
    if (colliderId === otherId || !this.noa.entities.getPositionData(colliderId)) {
      return;
    }
    if (this.colliderIds.has(otherId)) {
      return;
    }
    const colliderState = this.noa.entities.getPositionData(colliderId) as PositionStateLike | null;
    const otherState = this.noa.entities.getPositionData(otherId) as PositionStateLike | null;
    if (!colliderState || !otherState || !colliderState._extents || !otherState._extents) {
      return;
    }
    if (!colliderState._localPosition || !otherState._localPosition) {
      return;
    }

    const overlapX = Math.min(colliderState._extents[3], otherState._extents[3]) - Math.max(colliderState._extents[0], otherState._extents[0]);
    const overlapY = Math.min(colliderState._extents[4], otherState._extents[4]) - Math.max(colliderState._extents[1], otherState._extents[1]);
    const overlapZ = Math.min(colliderState._extents[5], otherState._extents[5]) - Math.max(colliderState._extents[2], otherState._extents[2]);

    if (overlapX <= 0 || overlapY <= 0 || overlapZ <= 0) {
      return;
    }

    const overlaps: Array<{ axis: 'x' | 'y' | 'z'; value: number }> = [
      { axis: 'x', value: overlapX },
      { axis: 'y', value: overlapY },
      { axis: 'z', value: overlapZ },
    ];
    overlaps.sort((a, b) => a.value - b.value);

    for (const entry of overlaps) {
      if (this.separateEntityAlongAxis(colliderState, otherId, entry.axis, entry.value)) {
        break;
      }
    }
  }

  private separateEntityAlongAxis(
    colliderState: PositionStateLike,
    entityId: number,
    axis: 'x' | 'y' | 'z',
    overlap: number,
  ): boolean {
    if (overlap <= 0) {
      return false;
    }
    const entityState = this.noa.entities.getPositionData(entityId) as PositionStateLike | null;
    if (!entityState || !entityState._localPosition || !entityState._extents) {
      return false;
    }

    const [minIdx, maxIdx] = this.getAxisIndices(axis);
    const colliderExt = colliderState._extents;
    const entityExt = entityState._extents;
    const colliderCenter = (colliderExt[minIdx] + colliderExt[maxIdx]) / 2;
    const entityCenter = (entityExt[minIdx] + entityExt[maxIdx]) / 2;

    if (axis === 'y') {
      if (entityCenter >= colliderCenter) {
        const targetBottom = colliderExt[maxIdx] + MICROBLOCK_COLLISION_PADDING;
        const delta = targetBottom - entityExt[minIdx];
        if (delta <= 0) {
          return false;
        }
        this.translateEntityState(entityId, entityState, 0, delta, 0, { axis: 'y', restingDirection: -1 });
        return true;
      }
      const targetTop = colliderExt[minIdx] - MICROBLOCK_COLLISION_PADDING;
      const delta = targetTop - entityExt[maxIdx];
      if (delta >= 0) {
        return false;
      }
      this.translateEntityState(entityId, entityState, 0, delta, 0, { axis: 'y', restingDirection: 1 });
      return true;
    }

    if (axis === 'x') {
      if (entityCenter >= colliderCenter) {
        const targetMin = colliderExt[maxIdx] + MICROBLOCK_COLLISION_PADDING;
        const delta = targetMin - entityExt[minIdx];
        if (delta <= 0) {
          return false;
        }
        this.translateEntityState(entityId, entityState, delta, 0, 0, { axis: 'x' });
        return true;
      }
      const targetMax = colliderExt[minIdx] - MICROBLOCK_COLLISION_PADDING;
      const delta = targetMax - entityExt[maxIdx];
      if (delta >= 0) {
        return false;
      }
      this.translateEntityState(entityId, entityState, delta, 0, 0, { axis: 'x' });
      return true;
    }

    if (entityCenter >= colliderCenter) {
      const targetMin = colliderExt[maxIdx] + MICROBLOCK_COLLISION_PADDING;
      const delta = targetMin - entityExt[minIdx];
      if (delta <= 0) {
        return false;
      }
      this.translateEntityState(entityId, entityState, 0, 0, delta, { axis: 'z' });
      return true;
    }
    const targetMax = colliderExt[minIdx] - MICROBLOCK_COLLISION_PADDING;
    const delta = targetMax - entityExt[maxIdx];
    if (delta >= 0) {
      return false;
    }
    this.translateEntityState(entityId, entityState, 0, 0, delta, { axis: 'z' });
    return true;
  }

  private translateEntityState(
    entityId: number,
    state: PositionStateLike,
    dx: number,
    dy: number,
    dz: number,
    options: { axis: 'x' | 'y' | 'z'; restingDirection?: number },
  ): void {
    const local = state._localPosition;
    if (!local) {
      return;
    }
    local[0] += dx;
    local[1] += dy;
    local[2] += dz;
    if (state._renderPosition) {
      state._renderPosition[0] += dx;
      state._renderPosition[1] += dy;
      state._renderPosition[2] += dz;
    }
    if (state.position) {
      state.position[0] += dx;
      state.position[1] += dy;
      state.position[2] += dz;
    }
    this.updateExtents(state);

    const physics = this.noa.entities.getPhysics(entityId);
    if (physics) {
      const body = physics.body as any;
      const base = body.aabb.base;
      base[0] = state._extents[0];
      base[1] = state._extents[1];
      base[2] = state._extents[2];
      const sizeVec = body.aabb.vec;
      const max = body.aabb.max;
      max[0] = base[0] + sizeVec[0];
      max[1] = base[1] + sizeVec[1];
      max[2] = base[2] + sizeVec[2];
      const axisIndex = options.axis === 'x' ? 0 : options.axis === 'y' ? 1 : 2;
      body.velocity[axisIndex] = 0;
      if (options.axis === 'y' && typeof options.restingDirection === 'number') {
        body.resting[1] = options.restingDirection;
        if (body.velocity[1] < 0) {
          body.velocity[1] = 0;
        }
      }
    }
  }

  private updateExtents(state: PositionStateLike): void {
    const local = state._localPosition;
    if (!local) {
      return;
    }
    const halfWidth = state.width / 2;
    const ext = state._extents;
    ext[0] = local[0] - halfWidth;
    ext[1] = local[1];
    ext[2] = local[2] - halfWidth;
    ext[3] = local[0] + halfWidth;
    ext[4] = local[1] + state.height;
    ext[5] = local[2] + halfWidth;
  }

  private getAxisIndices(axis: 'x' | 'y' | 'z'): [number, number] {
    switch (axis) {
      case 'x':
        return [0, 3];
      case 'y':
        return [1, 4];
      default:
        return [2, 5];
    }
  }

  getRuntimeEntry(base: BaseCoordinate): MicroblockRuntimeEntry | null {
    const key = makeRuntimeKey(base);
    const entry = this.runtimeEntries.get(key);
    if (!entry) {
      return null;
    }

    const cells = new Map<number, MicroblockRuntimeCell>();
    for (const [index, cell] of entry.cells.entries()) {
      cells.set(index, {
        levels: cell.levels.map((level) => ({
          mesh: level.mesh,
          colliderId: level.colliderId,
          levelIndex: level.levelIndex,
        })),
      });
    }

    return {
      scaleId: entry.scaleId,
      cells,
    };
  }

  private getOrCreateTemplate(kind: BlockKind): Mesh {
    const cached = this.templateByKind.get(kind);
    if (cached) {
      return cached;
    }
    const material = this.getOrCreateMaterial(kind);
    const mesh = MeshBuilder.CreateBox(`micro-template:${kind}`, { size: 1 }, this.scene);
    mesh.isPickable = false;
    mesh.alwaysSelectAsActiveMesh = true;
    mesh.rotationQuaternion = null;
    mesh.material = material;
    mesh.renderingGroupId = 2;
    mesh.isVisible = false;
    this.templateByKind.set(kind, mesh);
    return mesh;
  }

  private getOrCreateMaterial(kind: BlockKind): StandardMaterial {
    const existing = this.materialByKind.get(kind);
    if (existing) {
      return existing;
    }
    if (kind === 'starwatch:deck' && this.deckMaterial) {
      const cloned = this.deckMaterial.clone(`microblock-material:${kind}`) as StandardMaterial | null;
      if (cloned) {
        cloned.backFaceCulling = false;
        cloned.alpha = 1;
        cloned.freeze();
        this.materialByKind.set(kind, cloned);
        return cloned;
      }
    }
    const color = MATERIAL_COLOR_BY_KIND[kind] ?? [0.4, 0.4, 0.4];
    const material = new StandardMaterial(`microblock-material:${kind}`, this.scene);
    if (kind === 'starwatch:deck') {
      const diffuseTexture = new Texture(DECK_ALBEDO_URL, this.scene, false, false, Texture.BILINEAR_SAMPLINGMODE);
      diffuseTexture.wrapU = Texture.WRAP_ADDRESSMODE;
      diffuseTexture.wrapV = Texture.WRAP_ADDRESSMODE;
      material.diffuseTexture = diffuseTexture;

      const normalTexture = new Texture(DECK_NORMAL_URL, this.scene, false, false, Texture.BILINEAR_SAMPLINGMODE);
      normalTexture.level = 0.9;
      material.bumpTexture = normalTexture;

      const specularTexture = new Texture(DECK_METALLIC_URL, this.scene, false, false, Texture.BILINEAR_SAMPLINGMODE);
      specularTexture.wrapU = Texture.WRAP_ADDRESSMODE;
      specularTexture.wrapV = Texture.WRAP_ADDRESSMODE;
      material.specularTexture = specularTexture;

      const aoTexture = new Texture(DECK_AO_URL, this.scene, false, false, Texture.BILINEAR_SAMPLINGMODE);
      aoTexture.wrapU = Texture.WRAP_ADDRESSMODE;
      aoTexture.wrapV = Texture.WRAP_ADDRESSMODE;
      material.ambientTexture = aoTexture;

      material.diffuseColor = Color3.White();
      material.disableLighting = false;
      material.specularColor = new Color3(0.65, 0.7, 0.75);
      material.emissiveColor = new Color3(0.04, 0.06, 0.08);
      material.roughness = 0.45;
    } else {
      material.diffuseColor = new Color3(color[0], color[1], color[2]);
      material.specularColor = new Color3(0.1, 0.15, 0.22);
      material.emissiveColor = new Color3(color[0], color[1], color[2]).scale(0.95);
      material.disableLighting = true;
    }
    material.backFaceCulling = false;
    material.alpha = 1;
    material.freeze();
    this.materialByKind.set(kind, material);
    return material;
  }
}

let activeMicroblockStore: MicroblockStore | null = null;

export function setActiveMicroblockStore(store: MicroblockStore | null): void {
  activeMicroblockStore = store;
}

export function getActiveMicroblockStore(): MicroblockStore | null {
  return activeMicroblockStore;
}
