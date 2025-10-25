import { useCallback, useSyncExternalStore } from 'react';
import type { HotbarController, HotbarState } from '../../player/hotbar-controller';
import { HotbarIcon } from './hotbar-icons';

interface HotbarHudProps {
  controller: HotbarController;
}

function useHotbarState(controller: HotbarController): HotbarState {
  return useSyncExternalStore(
    (listener) => controller.subscribe(listener),
    () => controller.getState(),
  );
}

export function HotbarHud({ controller }: HotbarHudProps): JSX.Element {
  const state = useHotbarState(controller);
  const { slots, activeIndex } = state;
  const activeSlot = slots[activeIndex];

  const handleSlotClick = useCallback(
    (index: number) => {
      controller.setActiveIndex(index);
    },
    [controller],
  );

  return (
    <div className="hotbar-root">
      <div className="hotbar-slots">
        {slots.map((slot) => {
          const isActive = slot.index === activeIndex;
          return (
            <button
              key={slot.index}
              type="button"
              className="hotbar-slot"
              data-active={isActive ? 'true' : 'false'}
              onClick={() => handleSlotClick(slot.index)}
              title={slot.item ? slot.item.label : 'Slot vazio'}
            >
              <span className="hotbar-slot-index">{slot.index + 1}</span>
              <span className="hotbar-slot-icon" data-has-item={slot.item ? 'true' : 'false'}>
                {slot.item ? <HotbarIcon icon={slot.item.icon} /> : null}
              </span>
            </button>
          );
        })}
      </div>
      <div className="hotbar-tooltip" data-visible={activeSlot.item ? 'true' : 'false'}>
        <h2>{activeSlot.item ? activeSlot.item.label : 'Slot vazio'}</h2>
        <p>{activeSlot.item ? activeSlot.item.description : 'Sem item atribuído.'}</p>
      </div>
    </div>
  );
}
