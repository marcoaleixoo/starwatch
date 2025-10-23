import { Engine } from 'noa-engine';

export interface TickSystem {
  id: string;
  update(dt: number): void;
}

export function initializeTickLoop(noa: Engine, systems: TickSystem[]) {
  noa.on('tick', (dt) => {
    systems.forEach((system) => {
      system.update(dt);
    });
  });
}
