import { Engine } from 'noa-engine';
import { FLY_SYSTEM_ID } from '../../core/constants';

const TOGGLE_ACTION = 'toggle-fly';
const DESCEND_ACTION = 'fly-down';
const FLY_SPEED_BLOCKS = 200; // ~60 m/s with 0.3 m grid
const SMOOTHING = 8;

interface PhysicsBody {
  gravityMultiplier: number;
  velocity: [number, number, number];
  friction?: number;
}

function getPlayerBody(noa: Engine): PhysicsBody | null {
  const physics = noa.entities.getPhysics(noa.playerEntity);
  if (!physics) return null;
  return physics.body as PhysicsBody;
}

export function initializeFlightControls(noa: Engine) {
  const inputs = noa.inputs;
  inputs.bind(TOGGLE_ACTION, ['KeyF']);
  inputs.bind(DESCEND_ACTION, ['ShiftLeft', 'ControlLeft']);

  let enabled = false;
  let previousGravity = 2;

  const setFlightState = (next: boolean) => {
    const body = getPlayerBody(noa);
    if (!body) return;
    enabled = next;
    if (enabled) {
      previousGravity = body.gravityMultiplier ?? previousGravity;
      body.gravityMultiplier = 0;
      console.log('[Flight] Enabled');
    } else {
      body.gravityMultiplier = previousGravity;
      body.velocity[1] = 0;
      console.log('[Flight] Disabled');
    }
  };

  inputs.down.on(TOGGLE_ACTION, () => {
    setFlightState(!enabled);
  });

  return {
    id: FLY_SYSTEM_ID,
    update: (dt: number) => {
      const body = getPlayerBody(noa);
      if (!body) return;
      if (!enabled) return;

      body.gravityMultiplier = 0;

      const state = noa.inputs.state as Record<string, boolean>;
      const ascend = !!state.jump;
      const descend = !!state[DESCEND_ACTION];
      const targetVelocity = ascend ? FLY_SPEED_BLOCKS : descend ? -FLY_SPEED_BLOCKS : 0;
      const lerpFactor = Math.min((dt / 1000) * SMOOTHING, 1);
      body.velocity[1] = body.velocity[1] + (targetVelocity - body.velocity[1]) * lerpFactor;
    },
  };
}
