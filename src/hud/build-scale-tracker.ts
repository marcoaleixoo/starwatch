import { DEFAULT_GRID_SCALE_ID, GRID_SCALE_OPTIONS, type GridScaleId } from '../config/build-options';
import type { BlockKind } from '../blocks/types';

export interface BuildScaleState {
  blockKind: BlockKind | null;
  scaleId: GridScaleId;
  label: string;
  divisions: number;
  availableScaleIds: GridScaleId[];
}

type Listener = () => void;

export class BuildScaleTracker {
  private state: BuildScaleState = {
    blockKind: null,
    scaleId: DEFAULT_GRID_SCALE_ID,
    label: GRID_SCALE_OPTIONS[DEFAULT_GRID_SCALE_ID].label,
    divisions: GRID_SCALE_OPTIONS[DEFAULT_GRID_SCALE_ID].divisions,
    availableScaleIds: [DEFAULT_GRID_SCALE_ID],
  };

  private listeners = new Set<Listener>();

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getState(): BuildScaleState {
    return this.state;
  }

  setState(nextState: BuildScaleState): void {
    const prev = this.state;
    const changed =
      prev.blockKind !== nextState.blockKind ||
      prev.scaleId !== nextState.scaleId ||
      prev.label !== nextState.label ||
      prev.divisions !== nextState.divisions ||
      prev.availableScaleIds.length !== nextState.availableScaleIds.length ||
      prev.availableScaleIds.some((value, index) => nextState.availableScaleIds[index] !== value);

    if (!changed) {
      return;
    }

    this.state = {
      blockKind: nextState.blockKind,
      scaleId: nextState.scaleId,
      label: nextState.label,
      divisions: nextState.divisions,
      availableScaleIds: [...nextState.availableScaleIds],
    };

    for (const listener of this.listeners) {
      listener();
    }
  }
}
