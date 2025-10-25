import { useMemo, useSyncExternalStore } from 'react';
import { useOverlayContext } from '../overlay/overlay-context';

const SVG_SIZE = 40;
const RADIUS = 14;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function useRemovalHoldProgress(): { active: boolean; progress: number } {
  const { removal } = useOverlayContext();
  return useSyncExternalStore(
    (listener) => removal.subscribe(listener),
    () => removal.getState(),
  );
}

export function Crosshair(): JSX.Element {
  const removalState = useRemovalHoldProgress();
  const dashOffset = useMemo(() => {
    const progress = Math.min(1, Math.max(0, removalState.progress));
    return CIRCUMFERENCE * (1 - progress);
  }, [removalState.progress]);
  const hasProgress = removalState.active || removalState.progress > 0.001;

  return (
    <div
      className="crosshair"
      data-removing={removalState.active ? 'true' : 'false'}
      data-progress={hasProgress ? 'true' : 'false'}
    >
      <svg
        className="crosshair__progress"
        width={SVG_SIZE}
        height={SVG_SIZE}
        viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
        aria-hidden="true"
      >
        <circle
          className="crosshair__progress-bg"
          cx={SVG_SIZE / 2}
          cy={SVG_SIZE / 2}
          r={RADIUS}
        />
        <circle
          className="crosshair__progress-ring"
          cx={SVG_SIZE / 2}
          cy={SVG_SIZE / 2}
          r={RADIUS}
          style={{ strokeDasharray: CIRCUMFERENCE, strokeDashoffset: dashOffset }}
        />
      </svg>
      <div className="crosshair__reticle" aria-hidden="true">
        <span className="crosshair__line crosshair__line--horizontal" />
        <span className="crosshair__line crosshair__line--vertical" />
        <span className="crosshair__dot" />
      </div>
    </div>
  );
}
