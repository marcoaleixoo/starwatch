import { createContext, useContext } from 'react';
import type { OverlayController, OverlayState } from './overlay-controller';
import type { EnergySystem } from '../../systems/energy';
import type { LookAtTracker } from '../look-at-tracker';

export interface OverlayContextValue {
  controller: OverlayController;
  state: OverlayState;
  energy: EnergySystem;
  lookAt: LookAtTracker;
}

export const OverlayContext = createContext<OverlayContextValue | null>(null);

export function useOverlayContext(): OverlayContextValue {
  const value = useContext(OverlayContext);
  if (!value) {
    throw new Error('useOverlayContext deve ser usado dentro de OverlayContext.Provider');
  }
  return value;
}
