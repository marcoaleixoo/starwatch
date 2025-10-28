import { useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import { OverlayContext } from './overlay-context';
import type { OverlayController, OverlayState } from './overlay-controller';
import type { HotbarController } from '../../player/hotbar-controller';
import { HotbarHud } from '../components/hotbar-hud';
import type { EnergySystem } from '../../systems/energy';
import type { RemovalHoldTracker } from '../removal-hold-tracker';
import type { BuildScaleTracker } from '../build-scale-tracker';
import { Crosshair } from '../components/crosshair';
import { BuildScaleIndicator } from '../components/build-scale-indicator';

interface OverlayAppProps {
  controller: OverlayController;
  hotbarController: HotbarController;
  energy: EnergySystem;
  removalHold: RemovalHoldTracker;
  buildScale: BuildScaleTracker;
}

function useOverlayState(controller: OverlayController): OverlayState {
  return useSyncExternalStore(
    (listener) => controller.subscribe(listener),
    () => controller.getState(),
  );
}

export function OverlayApp({ controller, hotbarController, energy, removalHold, buildScale }: OverlayAppProps): JSX.Element {
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
      buildScale,
    }),
    [controller, state, energy, removalHold, buildScale],
  );

  return (
    <OverlayContext.Provider value={contextValue}>
      <div
        ref={focusRef}
        className="overlay-root"
        tabIndex={-1}
        data-capture={state.captureInput ? 'true' : 'false'}
        data-pointer-pass={state.pointerPassthrough ? 'true' : 'false'}
      >
        <div className="overlay-hud-layer" data-visible="true">
          <Crosshair />
          <HotbarHud controller={hotbarController} />
          <BuildScaleIndicator />
        </div>
      </div>
    </OverlayContext.Provider>
  );
}
