import { HOTBAR_SLOT_COUNT, INITIAL_HOTBAR_ITEMS, type HotbarItemDefinition } from '../config/hud-options';

export interface HotbarSlot {
  index: number;
  item: HotbarItemDefinition | null;
}

export interface HotbarState {
  slots: HotbarSlot[];
  activeIndex: number;
}

type Listener = () => void;

export class HotbarController {
  private state: HotbarState;
  private listeners = new Set<Listener>();

  constructor() {
    const slots: HotbarSlot[] = Array.from({ length: HOTBAR_SLOT_COUNT }, (_, index) => ({
      index,
      item: INITIAL_HOTBAR_ITEMS[index] ?? null,
    }));

    this.state = {
      slots,
      activeIndex: 0,
    };
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getState(): HotbarState {
    return this.state;
  }

  setActiveIndex(index: number): void {
    const normalized = this.normalizeIndex(index);
    if (this.state.activeIndex === normalized) {
      return;
    }
    this.updateState({
      ...this.state,
      activeIndex: normalized,
    });
  }

  stepActiveIndex(delta: number): void {
    const target = this.normalizeIndex(this.state.activeIndex + delta);
    this.setActiveIndex(target);
  }

  setSlotItem(index: number, item: HotbarItemDefinition | null): void {
    const normalized = this.normalizeIndex(index);
    const slot = this.state.slots[normalized];
    if (slot.item?.id === item?.id) {
      return;
    }
    const nextSlots = this.state.slots.slice();
    nextSlots[normalized] = {
      ...slot,
      item,
    };
    this.updateState({
      ...this.state,
      slots: nextSlots,
    });
  }

  getActiveSlot(): HotbarSlot {
    return this.state.slots[this.state.activeIndex];
  }

  reset(): void {
    this.listeners.clear();
  }

  private updateState(nextState: HotbarState): void {
    this.state = nextState;
    for (const listener of this.listeners) {
      listener();
    }
  }

  private normalizeIndex(index: number): number {
    const size = HOTBAR_SLOT_COUNT;
    return ((index % size) + size) % size;
  }
}
