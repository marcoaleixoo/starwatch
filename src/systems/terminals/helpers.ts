import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import type { BlockOrientation } from '../../blocks/types';

export function orientationToYaw(orientation: BlockOrientation): number {
  switch (orientation) {
    case 'north':
      return Math.PI;
    case 'east':
      return Math.PI / 2;
    case 'south':
      return 0;
    case 'west':
      return -Math.PI / 2;
    default:
      return 0;
  }
}

export function orientationToNormal(orientation: BlockOrientation): Vector3 {
  switch (orientation) {
    case 'north':
      return new Vector3(0, 0, -1);
    case 'east':
      return new Vector3(1, 0, 0);
    case 'south':
      return new Vector3(0, 0, 1);
    case 'west':
      return new Vector3(-1, 0, 0);
    default:
      return new Vector3(0, 0, 1);
  }
}
