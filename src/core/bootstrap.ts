import { Engine } from 'noa-engine';
import { initializeSector, type SectorResources } from '../sector';
import { initializePlayer } from '../player';
import { ENGINE_OPTIONS } from '../config/engine-options';
import { initializeOverlay, type OverlayApi } from '../hud/overlay';
import { initializeHotbar, type HotbarApi } from '../player/hotbar';
import { initializePlacementSystem } from '../systems/building/placement-system';
import { initializeEnergySystem, type EnergySystem } from '../systems/energy';
import { initializeUseSystem } from '../systems/interactions/use-system';
import { EnergyDebugOverlay } from '../systems/energy/debug-overlay';
import { LocalStorageAdapter } from '../persistence/local-storage-adapter';
import { ensurePlayerId, PersistenceManager } from '../persistence/manager';
import { DEFAULT_SECTOR_ID } from '../config/sector-options';

export interface StarwatchContext {
  noa: Engine;
  sector: SectorResources;
  world: SectorResources; // @deprecated manter até migrarmos tooling externo
  energy: EnergySystem;
  overlay: OverlayApi;
  hotbar: HotbarApi;
  debug?: {
    energyOverlay?: EnergyDebugOverlay;
  };
  persistence?: PersistenceManager;
}

export function bootstrapStarwatch(): StarwatchContext {
  const mountElement = document.getElementById('starwatch-canvas-host');
  if (!mountElement) {
    throw new Error('Host DOM node #starwatch-canvas-host não encontrado.');
  }

  const noa = new Engine({
    ...ENGINE_OPTIONS,
    domElement: mountElement,
    debug: import.meta.env.DEV,
    showFPS: import.meta.env.DEV,
  });

  const sector = initializeSector(noa);
  const energy = initializeEnergySystem(noa, sector);

  const hotbar = initializeHotbar();
  const overlay = initializeOverlay(noa, { hotbarController: hotbar.controller, sector, energy });
  hotbar.attachOverlay(overlay);

  initializePlayer(noa, { hotbar, overlay });
  initializePlacementSystem({ noa, overlay, hotbar, sector, energy });
  initializeUseSystem({ noa, overlay, sector });

  const playerId = ensurePlayerId();
  const persistence = new PersistenceManager({
    adapter: new LocalStorageAdapter(),
    playerId,
    sectorId: DEFAULT_SECTOR_ID,
    context: { noa, sector, energy, hotbar },
    autosaveIntervalMs: 30000,
  });
  persistence.load();

  let energyDebug: EnergyDebugOverlay | undefined;
  if (import.meta.env.VITE_DEBUG_ENERGY === '1') {
    energyDebug = new EnergyDebugOverlay(energy);
    energyDebug.setVisible(true);
    noa.on('tick', (dt: number) => {
      energyDebug?.handleTick(dt);
    });
  }

  noa.container.setPointerLock(true);
  noa.container.on('DOMready', () => {
    document.getElementById('boot-status')?.setAttribute('hidden', 'true');
    console.log('[starwatch] DOM pronto, pointer lock disponível?', noa.container.supportsPointerLock);
  });

  console.log(`[starwatch] noa-engine inicializada v${noa.version}`);

  if (typeof window !== 'undefined') {
    // Expor para debug manual.
    (window as any).starwatchPersistence = persistence;
  }

  return {
    noa,
    sector,
    world: sector,
    energy,
    overlay,
    hotbar,
    debug: {
      energyOverlay: energyDebug,
    },
    persistence,
  };
}
