import { useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import { OverlayContext } from './overlay-context';
import type { OverlayController, OverlayState } from './overlay-controller';
import type { HotbarController } from '../../player/hotbar-controller';
import { HotbarHud } from '../components/hotbar-hud';
import type { EnergySystem } from '../../systems/energy';
import type { RemovalHoldTracker } from '../removal-hold-tracker';
import { Crosshair } from '../components/crosshair';

interface OverlayAppProps {
  controller: OverlayController;
  hotbarController: HotbarController;
  energy: EnergySystem;
  removalHold: RemovalHoldTracker;
}

function useOverlayState(controller: OverlayController): OverlayState {
  return useSyncExternalStore(
    (listener) => controller.subscribe(listener),
    () => controller.getState(),
  );
}

export function OverlayApp({ controller, hotbarController, energy, removalHold }: OverlayAppProps): JSX.Element {
  const state = useOverlayState(controller);
  const focusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = focusRef.current;
    if (!node) {
      return;
    }
    if (state.captureInput) {
      node.focus({ preventScroll: true });
    } else {
      node.blur();
    }
  }, [state.captureInput]);

  const contextValue = useMemo(
    () => ({
      controller,
      state,
      energy,
      removal: removalHold,
    }),
    [controller, state, energy, removalHold],
  );

  return (
    <OverlayContext.Provider value={contextValue}>
      <div
        ref={focusRef}
        className="overlay-root"
        tabIndex={-1}
        data-capture={state.captureInput ? 'true' : 'false'}
      >
        <div className="overlay-hud-layer" data-visible="true">
          <Crosshair />
          <HotbarHud controller={hotbarController} />
        </div>
      </div>
    </OverlayContext.Provider>
  );
}
