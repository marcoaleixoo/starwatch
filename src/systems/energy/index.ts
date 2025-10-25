import type { Engine } from 'noa-engine';
import type { WorldResources } from '../../world';
import { EnergyNetworkManager } from './energy-network-manager';

export interface EnergySystem {
  networks: EnergyNetworkManager;
}

export function initializeEnergySystem(_noa: Engine, _world: WorldResources): EnergySystem {
  const networks = new EnergyNetworkManager();
  return {
    networks,
  };
}
