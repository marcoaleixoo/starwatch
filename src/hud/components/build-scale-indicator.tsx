import { useSyncExternalStore } from 'react';
import { useOverlayContext } from '../overlay/overlay-context';

export function BuildScaleIndicator(): JSX.Element {
  const { buildScale } = useOverlayContext();
  const state = useSyncExternalStore(
    (listener) => buildScale.subscribe(listener),
    () => buildScale.getState(),
  );

  const visible = state.blockKind !== null;

  return (
    <div className="build-scale-indicator" data-visible={visible ? 'true' : 'false'}>
      <span className="build-scale-indicator__label">{state.label}</span>
    </div>
  );
}
