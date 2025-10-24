import { Engine } from 'noa-engine';
import { FLY_SYSTEM_ID } from '../../core/constants';

const TOGGLE_ACTION = 'toggle-fly';
const DESCEND_ACTION = 'fly-down';
const VERTICAL_SPEED_BLOCKS = 420; // ≈126 m/s with 0.3 m grid
const HORIZONTAL_MAX_SPEED_BLOCKS = 140; // ≈42 m/s
const HORIZONTAL_MOVE_FORCE = 180;
const HORIZONTAL_RESPONSIVENESS = 24;
const SMOOTHING = 8;

interface PhysicsBody {
  gravityMultiplier: number;
  velocity: [number, number, number];
  friction?: number;
}

interface MovementState {
  maxSpeed: number;
  moveForce: number;
  responsiveness: number;
  airMoveMult: number;
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
  let previousMovement: MovementState | null = null;

  const getPlayerMovement = (): MovementState | null => {
    const accessor = (noa.entities as {
      getMovement?: (id: number) => MovementState;
    }).getMovement;
    if (typeof accessor !== 'function') {
      return null;
    }
    return accessor(noa.playerEntity) ?? null;
  };

  const setFlightState = (next: boolean) => {
    const body = getPlayerBody(noa);
    const movement = getPlayerMovement();
    if (!body || !movement) return;
    enabled = next;
    if (enabled) {
      previousGravity = body.gravityMultiplier ?? previousGravity;
      body.gravityMultiplier = 0;
      if (!previousMovement) {
        previousMovement = {
          maxSpeed: movement.maxSpeed,
          moveForce: movement.moveForce,
          responsiveness: movement.responsiveness,
          airMoveMult: movement.airMoveMult,
        };
      }
      movement.maxSpeed = HORIZONTAL_MAX_SPEED_BLOCKS;
      movement.moveForce = HORIZONTAL_MOVE_FORCE;
      movement.responsiveness = HORIZONTAL_RESPONSIVENESS;
      movement.airMoveMult = 1.5;
      console.log('[Flight] Enabled');
    } else {
      body.gravityMultiplier = previousGravity;
      body.velocity[1] = 0;
      if (previousMovement) {
        movement.maxSpeed = previousMovement.maxSpeed;
        movement.moveForce = previousMovement.moveForce;
        movement.responsiveness = previousMovement.responsiveness;
        movement.airMoveMult = previousMovement.airMoveMult;
        previousMovement = null;
      }
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
      const targetVelocity = ascend
        ? VERTICAL_SPEED_BLOCKS
        : descend
          ? -VERTICAL_SPEED_BLOCKS
          : 0;
      const lerpFactor = Math.min((dt / 1000) * SMOOTHING, 1);
      body.velocity[1] = body.velocity[1] + (targetVelocity - body.velocity[1]) * lerpFactor;
    },
  };
}
