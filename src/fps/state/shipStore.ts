import { createEmptyShipState, type ShipLampState, type ShipState, type ShipWallState } from "./shipState";

type ShipStateListener = (state: ShipState) => void;

export class ShipStore {
  private state: ShipState;
  private listeners: Set<ShipStateListener>;

  constructor(initialState?: ShipState) {
    this.state = initialState ? { ...initialState } : createEmptyShipState();
    this.listeners = new Set();
  }

  getSnapshot(): ShipState {
    return cloneState(this.state);
  }

  subscribe(listener: ShipStateListener): () => void {
    this.listeners.add(listener);
    listener(this.getSnapshot());
    return () => {
      this.listeners.delete(listener);
    };
  }

  replace(state: ShipState) {
    this.state = cloneState(state);
    this.notify();
  }

  upsertWall(wall: ShipWallState) {
    const existing = this.state.walls[wall.id];
    if (existing && wallEquals(existing, wall)) {
      return;
    }
    const walls = { ...this.state.walls, [wall.id]: { ...wall } };
    this.state = { ...this.state, walls };
    this.notify();
  }

  removeWall(wallId: string) {
    if (!(wallId in this.state.walls)) {
      return;
    }
    const walls = { ...this.state.walls };
    delete walls[wallId];
    this.state = { ...this.state, walls };
    this.notify();
  }

  upsertLamp(lamp: ShipLampState) {
    const existing = this.state.lamps[lamp.id];
    if (existing && lampEquals(existing, lamp)) {
      return;
    }
    const lamps = { ...this.state.lamps, [lamp.id]: { ...lamp } };
    this.state = { ...this.state, lamps };
    this.notify();
  }

  removeLamp(lampId: string) {
    if (!(lampId in this.state.lamps)) {
      return;
    }
    const lamps = { ...this.state.lamps };
    delete lamps[lampId];
    this.state = { ...this.state, lamps };
    this.notify();
  }

  markStructuralLampRemoved(lampId: string) {
    if (this.state.removedStructuralLamps[lampId]) {
      return;
    }
    const removedStructuralLamps = { ...this.state.removedStructuralLamps, [lampId]: true as const };
    this.state = { ...this.state, removedStructuralLamps };
    this.notify();
  }

  clearStructuralLampRemoval(lampId: string) {
    if (!this.state.removedStructuralLamps[lampId]) {
      return;
    }
    const removedStructuralLamps = { ...this.state.removedStructuralLamps };
    delete removedStructuralLamps[lampId];
    this.state = { ...this.state, removedStructuralLamps };
    this.notify();
  }

  isStructuralLampRemoved(lampId: string): boolean {
    return Boolean(this.state.removedStructuralLamps[lampId]);
  }

  reset() {
    this.state = createEmptyShipState();
    this.notify();
  }

  private notify() {
    const snapshot = this.getSnapshot();
    this.listeners.forEach((listener) => listener(snapshot));
  }
}

function cloneState(state: ShipState): ShipState {
  return {
    version: state.version,
    walls: cloneRecord(state.walls),
    lamps: cloneRecord(state.lamps),
    removedStructuralLamps: { ...state.removedStructuralLamps },
  };
}

function cloneRecord<T extends { id: string }>(record: Record<string, T>) {
  const copy: Record<string, T> = {};
  Object.keys(record).forEach((key) => {
    copy[key] = { ...record[key] };
  });
  return copy;
}

function wallEquals(a: ShipWallState, b: ShipWallState) {
  return (
    a.rotation === b.rotation &&
    almostEqual(a.position.x, b.position.x) &&
    almostEqual(a.position.y, b.position.y) &&
    almostEqual(a.position.z, b.position.z)
  );
}

function lampEquals(a: ShipLampState, b: ShipLampState) {
  return (
    a.anchorSurfaceId === b.anchorSurfaceId &&
    almostEqual(a.position.x, b.position.x) &&
    almostEqual(a.position.y, b.position.y) &&
    almostEqual(a.position.z, b.position.z) &&
    almostEqual(a.rotation.x, b.rotation.x) &&
    almostEqual(a.rotation.y, b.rotation.y) &&
    almostEqual(a.rotation.z, b.rotation.z) &&
    almostEqual(a.rotation.w, b.rotation.w) &&
    almostEqual(a.color.r, b.color.r) &&
    almostEqual(a.color.g, b.color.g) &&
    almostEqual(a.color.b, b.color.b) &&
    almostEqual(a.local.x, b.local.x) &&
    almostEqual(a.local.y, b.local.y) &&
    almostEqual(a.local.z, b.local.z)
  );
}

function almostEqual(a: number, b: number) {
  return Math.abs(a - b) <= 1e-5;
}
