import type { Engine } from 'noa-engine';
import type { WorldResources } from '../../world';
import {
  ENERGY_TICK_INTERVAL_SEC,
  PANEL_BASE_W,
  PANEL_RAY_COUNT,
  PANEL_MAX_RAY_DISTANCE,
  PANEL_RAY_STEP,
  PANEL_SAMPLE_OFFSETS,
  SUN_DIRECTION,
  BATTERY_SMALL_MJ,
  ENERGY_EPSILON,
} from '../../config/energy-options';
import { EnergyNetworkManager, type VoxelPosition } from './energy-network-manager';

interface SolarPanelEntry {
  key: string;
  position: VoxelPosition;
  networkId: number | null;
  outputW: number;
  shade: number;
}

interface BatteryEntry {
  key: string;
  position: VoxelPosition;
  networkId: number | null;
  capacityMJ: number;
  storedMJ: number;
}

interface TerminalEntry {
  key: string;
  position: VoxelPosition;
  networkId: number | null;
}

export interface SolarPanelSnapshot {
  position: VoxelPosition;
  networkId: number | null;
  outputW: number;
  shade: number;
}

export interface BatterySnapshot {
  position: VoxelPosition;
  networkId: number | null;
  capacityMJ: number;
  storedMJ: number;
}

export interface TerminalSnapshot {
  position: VoxelPosition;
  networkId: number | null;
}

export interface NetworkOverview {
  id: number;
  metrics: {
    totalGenW: number;
    totalLoadW: number;
    totalCapMJ: number;
    totalStoredMJ: number;
    deltaW: number;
  };
  panelCount: number;
  batteryCount: number;
  terminalCount: number;
}

export interface EnergySystem {
  networks: EnergyNetworkManager;
  registerSolarPanel(position: VoxelPosition): void;
  unregisterSolarPanel(position: VoxelPosition): void;
  registerBattery(position: VoxelPosition): void;
  unregisterBattery(position: VoxelPosition): void;
  registerTerminal(position: VoxelPosition): void;
  unregisterTerminal(position: VoxelPosition): void;
  getSolarPanelSnapshot(position: VoxelPosition): SolarPanelSnapshot | null;
  getBatterySnapshot(position: VoxelPosition): BatterySnapshot | null;
  getTerminalSnapshot(position: VoxelPosition): TerminalSnapshot | null;
  listSolarPanels(): SolarPanelSnapshot[];
  listBatteries(): BatterySnapshot[];
  listTerminals(): TerminalSnapshot[];
  getNetworkOverview(networkId: number): NetworkOverview | null;
  subscribe(listener: () => void): () => void;
  getVersion(): number;
}

const NEIGHBOR_OFFSETS: ReadonlyArray<VoxelPosition> = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1],
];

function makeKey([x, y, z]: VoxelPosition): string {
  return `${x}:${y}:${z}`;
}

export function initializeEnergySystem(noa: Engine, world: WorldResources): EnergySystem {
  const networks = new EnergyNetworkManager();
  const solarPanels = new Map<string, SolarPanelEntry>();
  const batteries = new Map<string, BatteryEntry>();
  const terminals = new Map<string, TerminalEntry>();
  const listeners = new Set<() => void>();
  let version = 0;

  const sampleCount = Math.min(PANEL_RAY_COUNT, PANEL_SAMPLE_OFFSETS.length);
  const panelSamples = PANEL_SAMPLE_OFFSETS.slice(0, sampleCount);
  const solarOpacityByBlockId = buildSolarOpacityLookup(world);
  const deckBlockId = world.starwatchBlocks.deck.id;

  let tickAccumulator = 0;

  const emitUpdate = () => {
    version += 1;
    for (const listener of listeners) {
      listener();
    }
  };

  const resolveNetworkId = (position: VoxelPosition): number | null => {
    for (const offset of NEIGHBOR_OFFSETS) {
      const nx = position[0] + offset[0];
      const ny = position[1] + offset[1];
      const nz = position[2] + offset[2];
      const blockId = noa.world.getBlockID(nx, ny, nz);
      if (blockId === deckBlockId) {
        const networkId = networks.getNetworkIdForPosition([nx, ny, nz]);
        if (networkId !== null) {
          return networkId;
        }
      }
    }
    return null;
  };

  const getSolarOpacity = (blockId: number): number => solarOpacityByBlockId.get(blockId) ?? 1;

  const sampleSolarShade = (entry: SolarPanelEntry): number => {
    let totalShade = 0;
    const [baseX, baseY, baseZ] = entry.position;
    const startY = baseY + 1;

    for (const [offsetX, offsetZ] of panelSamples) {
      const origin: [number, number, number] = [
        baseX + 0.5 + offsetX,
        startY + 0.01,
        baseZ + 0.5 + offsetZ,
      ];

      let travelled = 0;
      let transmittance = 1;
      let lastKey: string | null = null;

      while (travelled < PANEL_MAX_RAY_DISTANCE && transmittance > ENERGY_EPSILON) {
        const sampleX = origin[0] + SUN_DIRECTION[0] * travelled;
        const sampleY = origin[1] + SUN_DIRECTION[1] * travelled;
        const sampleZ = origin[2] + SUN_DIRECTION[2] * travelled;

        const voxelX = Math.floor(sampleX);
        const voxelY = Math.floor(sampleY);
        const voxelZ = Math.floor(sampleZ);
        const currentKey = makeKey([voxelX, voxelY, voxelZ]);

        if (currentKey !== lastKey) {
          lastKey = currentKey;
          const blockId = noa.world.getBlockID(voxelX, voxelY, voxelZ);
          if (blockId !== 0) {
            const opacity = getSolarOpacity(blockId);
            transmittance *= 1 - opacity;
            if (transmittance <= ENERGY_EPSILON) {
              transmittance = 0;
              break;
            }
          }
        }

        travelled += PANEL_RAY_STEP;
      }

      totalShade += 1 - transmittance;
    }

    return totalShade / panelSamples.length;
  };

  const updateSolarPanel = (entry: SolarPanelEntry): void => {
    const previousNetworkId = entry.networkId;
    const previousOutput = entry.outputW;

    const networkId = resolveNetworkId(entry.position);
    entry.networkId = networkId;

    const shade = sampleSolarShade(entry);
    entry.shade = shade;
    const outputW = PANEL_BASE_W * Math.max(0, 1 - shade);
    entry.outputW = outputW;

    if (previousNetworkId !== null) {
      networks.adjustNetworkMetrics(previousNetworkId, { totalGenW: -previousOutput });
    }
    if (networkId !== null) {
      networks.adjustNetworkMetrics(networkId, { totalGenW: outputW });
    }
  };

  const updateBatteryNetwork = (entry: BatteryEntry, nextNetworkId: number | null): void => {
    if (entry.networkId === nextNetworkId) {
      return;
    }

    if (entry.networkId !== null) {
      networks.adjustNetworkMetrics(entry.networkId, {
        totalCapMJ: -entry.capacityMJ,
        totalStoredMJ: -entry.storedMJ,
      });
    }

    entry.networkId = nextNetworkId;

    if (entry.networkId !== null) {
      networks.adjustNetworkMetrics(entry.networkId, {
        totalCapMJ: entry.capacityMJ,
        totalStoredMJ: entry.storedMJ,
      });
    }
  };

  const updateTerminalNetwork = (entry: TerminalEntry): void => {
    entry.networkId = resolveNetworkId(entry.position);
  };

  const distributeEnergyToBatteries = (networkId: number, entries: BatteryEntry[], deltaMJ: number): void => {
    if (entries.length === 0 || Math.abs(deltaMJ) < ENERGY_EPSILON) {
      return;
    }

    let remaining = deltaMJ;

    if (deltaMJ > 0) {
      for (const battery of entries) {
        if (remaining <= 0) break;
        const space = battery.capacityMJ - battery.storedMJ;
        if (space <= 0) continue;
        const added = Math.min(space, remaining);
        battery.storedMJ += added;
        remaining -= added;
        networks.adjustNetworkMetrics(networkId, { totalStoredMJ: added });
      }
    } else {
      remaining = Math.abs(deltaMJ);
      for (const battery of entries) {
        if (remaining <= 0) break;
        if (battery.storedMJ <= 0) continue;
        const consumed = Math.min(battery.storedMJ, remaining);
        battery.storedMJ -= consumed;
        remaining -= consumed;
        networks.adjustNetworkMetrics(networkId, { totalStoredMJ: -consumed });
      }
    }
  };

  const runEnergyTick = () => {
    for (const entry of solarPanels.values()) {
      updateSolarPanel(entry);
    }

    const batteriesByNetwork = new Map<number, BatteryEntry[]>();

    for (const entry of batteries.values()) {
      const nextNetworkId = resolveNetworkId(entry.position);
      updateBatteryNetwork(entry, nextNetworkId);
      if (entry.networkId !== null) {
        const bucket = batteriesByNetwork.get(entry.networkId) ?? [];
        bucket.push(entry);
        batteriesByNetwork.set(entry.networkId, bucket);
      }
    }

    for (const entry of terminals.values()) {
      updateTerminalNetwork(entry);
    }

    for (const [networkId, batteryEntries] of batteriesByNetwork.entries()) {
      const snapshot = networks.getNetworkSnapshot(networkId);
      if (!snapshot) {
        continue;
      }
      const deltaW = snapshot.metrics.totalGenW - snapshot.metrics.totalLoadW;
      const deltaMJ = deltaW / 1_000_000;
      distributeEnergyToBatteries(networkId, batteryEntries, deltaMJ);
    }

    emitUpdate();
  };

  noa.on('tick', (dt: number) => {
    tickAccumulator += dt;
    if (tickAccumulator >= ENERGY_TICK_INTERVAL_SEC) {
      tickAccumulator -= ENERGY_TICK_INTERVAL_SEC;
      runEnergyTick();
    }
  });

  return {
    networks,
    registerSolarPanel(position) {
      const key = makeKey(position);
      if (solarPanels.has(key)) {
        return;
      }
      const entry: SolarPanelEntry = {
        key,
        position: [...position],
        networkId: null,
        outputW: 0,
        shade: 1,
      };
      solarPanels.set(key, entry);
      updateSolarPanel(entry);
      emitUpdate();
    },
    unregisterSolarPanel(position) {
      const key = makeKey(position);
      const entry = solarPanels.get(key);
      if (!entry) {
        return;
      }
      if (entry.networkId !== null && entry.outputW !== 0) {
        networks.adjustNetworkMetrics(entry.networkId, { totalGenW: -entry.outputW });
      }
      solarPanels.delete(key);
      emitUpdate();
    },
    registerBattery(position) {
      const key = makeKey(position);
      if (batteries.has(key)) {
        return;
      }
      const entry: BatteryEntry = {
        key,
        position: [...position],
        networkId: null,
        capacityMJ: BATTERY_SMALL_MJ,
        storedMJ: 0,
      };
      batteries.set(key, entry);
      updateBatteryNetwork(entry, resolveNetworkId(entry.position));
      emitUpdate();
    },
    unregisterBattery(position) {
      const key = makeKey(position);
      const entry = batteries.get(key);
      if (!entry) {
        return;
      }
      if (entry.networkId !== null) {
        networks.adjustNetworkMetrics(entry.networkId, {
          totalCapMJ: -entry.capacityMJ,
          totalStoredMJ: -entry.storedMJ,
        });
      }
      batteries.delete(key);
      emitUpdate();
    },
    registerTerminal(position) {
      const key = makeKey(position);
      if (terminals.has(key)) {
        return;
      }
      const entry: TerminalEntry = {
        key,
        position: [...position],
        networkId: null,
      };
      terminals.set(key, entry);
      updateTerminalNetwork(entry);
      emitUpdate();
    },
    unregisterTerminal(position) {
      const key = makeKey(position);
      if (!terminals.has(key)) {
        return;
      }
      terminals.delete(key);
      emitUpdate();
    },
    getSolarPanelSnapshot(position) {
      const entry = solarPanels.get(makeKey(position));
      return entry
        ? {
            position: [...entry.position] as VoxelPosition,
            networkId: entry.networkId,
            outputW: entry.outputW,
            shade: entry.shade,
          }
        : null;
    },
    getBatterySnapshot(position) {
      const entry = batteries.get(makeKey(position));
      return entry
        ? {
            position: [...entry.position] as VoxelPosition,
            networkId: entry.networkId,
            capacityMJ: entry.capacityMJ,
            storedMJ: entry.storedMJ,
          }
        : null;
    },
    getTerminalSnapshot(position) {
      const entry = terminals.get(makeKey(position));
      return entry
        ? {
            position: [...entry.position] as VoxelPosition,
            networkId: entry.networkId,
          }
        : null;
    },
    listSolarPanels() {
      return Array.from(solarPanels.values()).map((entry) => ({
        position: [...entry.position] as VoxelPosition,
        networkId: entry.networkId,
        outputW: entry.outputW,
        shade: entry.shade,
      }));
    },
    listBatteries() {
      return Array.from(batteries.values()).map((entry) => ({
        position: [...entry.position] as VoxelPosition,
        networkId: entry.networkId,
        capacityMJ: entry.capacityMJ,
        storedMJ: entry.storedMJ,
      }));
    },
    listTerminals() {
      return Array.from(terminals.values()).map((entry) => ({
        position: [...entry.position] as VoxelPosition,
        networkId: entry.networkId,
      }));
    },
    getNetworkOverview(networkId) {
      const snapshot = networks.getNetworkSnapshot(networkId);
      if (!snapshot) {
        return null;
      }
      let panelCount = 0;
      let batteryCount = 0;
      let terminalCount = 0;

      for (const panel of solarPanels.values()) {
        if (panel.networkId === networkId) panelCount += 1;
      }
      for (const battery of batteries.values()) {
        if (battery.networkId === networkId) batteryCount += 1;
      }
      for (const terminal of terminals.values()) {
        if (terminal.networkId === networkId) terminalCount += 1;
      }

      const deltaW = snapshot.metrics.totalGenW - snapshot.metrics.totalLoadW;

      return {
        id: snapshot.id,
        metrics: {
          totalGenW: snapshot.metrics.totalGenW,
          totalLoadW: snapshot.metrics.totalLoadW,
          totalCapMJ: snapshot.metrics.totalCapMJ,
          totalStoredMJ: snapshot.metrics.totalStoredMJ,
          deltaW,
        },
        panelCount,
        batteryCount,
        terminalCount,
      };
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getVersion() {
      return version;
    },
  };
}

function buildSolarOpacityLookup(world: WorldResources): Map<number, number> {
  const lookup = new Map<number, number>();
  lookup.set(0, 0);

  lookup.set(world.terrainBlocks.dirt, world.materials.dirt.solarOpacity);

  for (const block of world.terrainBlocks.asteroidVariants) {
    const material = world.materials.asteroidVariants.find((variant) => variant.id === block.id);
    if (material) {
      lookup.set(block.blockId, material.material.solarOpacity);
    }
  }

  lookup.set(world.starwatchBlocks.deck.id, world.materials.deck.solarOpacity);
  lookup.set(world.starwatchBlocks.solarPanel.id, world.materials.solarPanel.solarOpacity);
  lookup.set(world.starwatchBlocks.battery.id, world.materials.battery.solarOpacity);
  lookup.set(world.starwatchBlocks.halTerminal.id, world.materials.terminal.solarOpacity);

  return lookup;
}
