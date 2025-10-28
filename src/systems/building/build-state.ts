import { DEFAULT_GRID_SCALE_ID, GRID_SCALE_SEQUENCE, GRID_SCALE_OPTIONS, type GridScaleId } from '../../config/build-options';
import type { BlockDefinition, BlockKind } from '../../blocks/types';

export interface BuildStateSnapshot {
  activeDefinition: BlockDefinition | null;
  activeScaleId: GridScaleId;
  availableScales: GridScaleId[];
}

type Listener = (snapshot: BuildStateSnapshot) => void;

export class BuildState {
  private activeDefinition: BlockDefinition | null = null;
  private activeScaleId: GridScaleId = DEFAULT_GRID_SCALE_ID;
  private scaleByKind = new Map<BlockKind, GridScaleId>();
  private listeners = new Set<Listener>();

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getSnapshot(): BuildStateSnapshot {
    return {
      activeDefinition: this.activeDefinition,
      activeScaleId: this.activeScaleId,
      availableScales: this.getAvailableScales(this.activeDefinition),
    };
  }

  setActiveDefinition(definition: BlockDefinition | null): void {
    const previousDefinition = this.activeDefinition;
    this.activeDefinition = definition;
    if (!definition) {
      this.activeScaleId = DEFAULT_GRID_SCALE_ID;
      if (previousDefinition !== definition) {
        this.emit();
      }
      return;
    }
    const nextScale = this.resolveScaleForDefinition(definition);
    if (nextScale !== this.activeScaleId || previousDefinition !== definition) {
      this.applyScale(nextScale, true);
    } else {
      this.scaleByKind.set(definition.kind, nextScale);
      this.emit();
    }
  }

  cycleScale(direction: number): void {
    if (!this.activeDefinition) {
      return;
    }
    const available = this.getAvailableScales(this.activeDefinition);
    if (available.length === 0) {
      return;
    }
    const currentIndex = available.indexOf(this.activeScaleId);
    const nextIndex = (currentIndex + direction + available.length) % available.length;
    const nextScale = available[nextIndex];
    this.applyScale(nextScale);
  }

  setScale(scaleId: GridScaleId): void {
    if (!this.activeDefinition) {
      return;
    }
    const available = this.getAvailableScales(this.activeDefinition);
    if (!available.includes(scaleId)) {
      return;
    }
    this.applyScale(scaleId);
  }

  private resolveScaleForDefinition(definition: BlockDefinition): GridScaleId {
    const available = this.getAvailableScales(definition);
    if (available.length === 0) {
      return DEFAULT_GRID_SCALE_ID;
    }
    const stored = this.scaleByKind.get(definition.kind);
    if (stored && available.includes(stored)) {
      return stored;
    }
    if (available.includes(definition.placement.defaultScale)) {
      return definition.placement.defaultScale;
    }
    return available[0];
  }

  private getAvailableScales(definition: BlockDefinition | null): GridScaleId[] {
    if (!definition) {
      return [DEFAULT_GRID_SCALE_ID];
    }
    const filtered = definition.placement.supportedScales.filter(
      (scaleId) => GRID_SCALE_OPTIONS[scaleId]?.enabled && definition.placement.shapes[scaleId],
    );
    if (filtered.length > 0) {
      return filtered.sort((a, b) => GRID_SCALE_SEQUENCE.indexOf(a) - GRID_SCALE_SEQUENCE.indexOf(b));
    }
    return [DEFAULT_GRID_SCALE_ID];
  }

  private applyScale(scaleId: GridScaleId, forceEmit = false): void {
    if (this.activeDefinition) {
      this.scaleByKind.set(this.activeDefinition.kind, scaleId);
    }
    if (this.activeScaleId !== scaleId) {
      this.activeScaleId = scaleId;
      this.emit();
      return;
    }
    if (forceEmit) {
      this.emit();
    }
  }

  private emit(): void {
    const snapshot = this.getSnapshot();
    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }
}
