import { useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import { OverlayContext } from './overlay-context';
import type { OverlayController, OverlayState } from './overlay-controller';
import type { HotbarController } from '../../player/hotbar-controller';
import { DummyPanel } from './panels/dummy-panel';
import { HotbarHud } from '../components/hotbar-hud';
import type { EnergySystem } from '../../systems/energy';
import { TerminalPanel } from './panels/terminal-panel';
import type { LookAtTracker } from '../look-at-tracker';
import { LookAtBadge } from '../components/look-at-badge';

interface OverlayAppProps {
  controller: OverlayController;
  hotbarController: HotbarController;
  energy: EnergySystem;
  lookAt: LookAtTracker;
}

function useOverlayState(controller: OverlayController): OverlayState {
  return useSyncExternalStore(
    (listener) => controller.subscribe(listener),
    () => controller.getState(),
  );
}

function renderModal(state: OverlayState, energy: EnergySystem): JSX.Element | null {
  if (!state.modal) {
    return null;
  }

  switch (state.modal.id) {
    case 'dummy':
      return <DummyPanel />;
    case 'terminal':
      return <TerminalPanel energy={energy} position={state.modal.position} />;
    default:
      return null;
  }
}

export function OverlayApp({ controller, hotbarController, energy, lookAt }: OverlayAppProps): JSX.Element {
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
      lookAt,
    }),
    [controller, state, energy, lookAt],
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
          <LookAtBadge lookAt={lookAt} energy={energy} />
        </div>
        <div className="overlay-modal-layer" data-visible={state.modal ? 'true' : 'false'}>
          {renderModal(state, energy)}
        </div>
      </div>
    </OverlayContext.Provider>
  );
}
