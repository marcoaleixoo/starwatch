import { useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import { OverlayContext } from './overlay-context';
import type { OverlayController, OverlayState } from './overlay-controller';
import type { HotbarController } from '../../player/hotbar-controller';
import { DummyPanel } from './panels/dummy-panel';
import { HotbarHud } from '../components/hotbar-hud';

interface OverlayAppProps {
  controller: OverlayController;
  hotbarController: HotbarController;
}

function useOverlayState(controller: OverlayController): OverlayState {
  return useSyncExternalStore(
    (listener) => controller.subscribe(listener),
    () => controller.getState(),
  );
}

function renderModal(state: OverlayState): JSX.Element | null {
  if (!state.modal) {
    return null;
  }

  switch (state.modal) {
    case 'dummy':
      return <DummyPanel />;
    default:
      return null;
  }
}

export function OverlayApp({ controller, hotbarController }: OverlayAppProps): JSX.Element {
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
    }),
    [controller, state],
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
          <HotbarHud controller={hotbarController} />
        </div>
        <div className="overlay-modal-layer" data-visible={state.modal ? 'true' : 'false'}>
          {renderModal(state)}
        </div>
      </div>
    </OverlayContext.Provider>
  );
}
