export interface RemovalHoldState {
  active: boolean;
  progress: number;
}

type Listener = () => void;

const PROGRESS_EPSILON = 0.001;

export class RemovalHoldTracker {
  private state: RemovalHoldState = {
    active: false,
    progress: 0,
  };

  private listeners = new Set<Listener>();

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getState(): RemovalHoldState {
    return this.state;
  }

  setState(nextState: RemovalHoldState): void {
    const clampedProgress = Math.min(1, Math.max(0, nextState.progress));
    const normalized: RemovalHoldState = {
      active: nextState.active,
      progress: clampedProgress,
    };

    const prev = this.state;
    const progressDelta = Math.abs(prev.progress - normalized.progress);
    const changed = prev.active !== normalized.active || progressDelta > PROGRESS_EPSILON;
    if (!changed) {
      return;
    }

    this.state = normalized;
    for (const listener of this.listeners) {
      listener();
    }
  }
}
