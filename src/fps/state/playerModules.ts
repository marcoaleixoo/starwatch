import type { PlayerStore } from "./playerStore";
import type { PlayerModuleDefinition } from "./playerStore";

interface HealthModuleState {
  current: number;
  max: number;
  [key: string]: unknown;
}

interface EnergyModuleState {
  current: number;
  max: number;
  regenPerSecond: number;
  [key: string]: unknown;
}

interface HungerModuleState {
  value: number;
  threshold: number;
  [key: string]: unknown;
}

interface InventorySlot {
  id: string;
  quantity: number;
  [key: string]: unknown;
}

interface InventoryModuleState {
  capacity: number;
  slots: InventorySlot[];
  [key: string]: unknown;
}

const healthModule: PlayerModuleDefinition<HealthModuleState> = {
  id: "vitals.health",
  version: 1,
  createInitialState: () => ({
    current: 100,
    max: 100,
  }),
  onRegister: (context) => {
    context.emit({ type: "player.module.ready", payload: { moduleId: "vitals.health" } });
  },
};

const energyModule: PlayerModuleDefinition<EnergyModuleState> = {
  id: "vitals.energy",
  version: 1,
  createInitialState: () => ({
    current: 100,
    max: 100,
    regenPerSecond: 2,
  }),
  onRegister: (context) => {
    context.emit({ type: "player.module.ready", payload: { moduleId: "vitals.energy" } });
  },
};

const hungerModule: PlayerModuleDefinition<HungerModuleState> = {
  id: "vitals.hunger",
  version: 1,
  createInitialState: () => ({
    value: 0,
    threshold: 100,
  }),
  onRegister: (context) => {
    context.emit({ type: "player.module.ready", payload: { moduleId: "vitals.hunger" } });
  },
};

const inventoryModule: PlayerModuleDefinition<InventoryModuleState> = {
  id: "inventory.core",
  version: 1,
  createInitialState: () => ({
    capacity: 24,
    slots: [],
  }),
  onRegister: (context) => {
    context.emit({ type: "player.module.ready", payload: { moduleId: "inventory.core" } });
  },
};

export function registerBaselinePlayerModules(store: PlayerStore) {
  const actions = store.getActions();
  actions.registerModule(healthModule);
  actions.registerModule(energyModule);
  actions.registerModule(hungerModule);
  actions.registerModule(inventoryModule);
}
