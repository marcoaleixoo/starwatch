import type { VoxelPosition } from '../systems/energy/energy-network-manager';

export type LookAtKind = 'solar-panel' | 'battery';

export interface LookAtState {
  kind: LookAtKind | null;
  position: VoxelPosition | null;
  networkId: number | null;
  distance: number;
}

type Listener = () => void;

export class LookAtTracker {
  private state: LookAtState = {
    kind: null,
    position: null,
    networkId: null,
    distance: 0,
  };

  private listeners = new Set<Listener>();

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getState(): LookAtState {
    return this.state;
  }

  setState(nextState: LookAtState): void {
    const prev = this.state;
    const changed =
      prev.kind !== nextState.kind ||
      prev.networkId !== nextState.networkId ||
      prev.distance !== nextState.distance ||
      !samePosition(prev.position, nextState.position);

    if (!changed) {
      return;
    }

    this.state = nextState;
    for (const listener of this.listeners) {
      listener();
    }
  }
}

function samePosition(a: VoxelPosition | null, b: VoxelPosition | null): boolean {
  if (!a || !b) {
    return a === b;
  }
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}
