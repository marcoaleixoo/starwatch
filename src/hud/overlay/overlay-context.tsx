import { createContext, useContext } from 'react';
import type { OverlayController, OverlayState } from './overlay-controller';

export interface OverlayContextValue {
  controller: OverlayController;
  state: OverlayState;
}

export const OverlayContext = createContext<OverlayContextValue | null>(null);

export function useOverlayContext(): OverlayContextValue {
  const value = useContext(OverlayContext);
  if (!value) {
    throw new Error('useOverlayContext deve ser usado dentro de OverlayContext.Provider');
  }
  return value;
}
