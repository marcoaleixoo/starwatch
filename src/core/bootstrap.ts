import { Engine } from 'noa-engine';
import { DEFAULT_BLOCK_SELECTION_INDEX, ENGINE_OPTIONS } from '../config/constants';
import { initializeWorld } from '../world/world';
import type { WorldContext } from '../world/world';
import { initializePlayer } from '../player/player';
import { initializePointerLock } from '../player/input/pointerLock';
import { initializeInteractions } from '../player/input/interactions';
import { initializeTickLoop, TickSystem } from './loop';
import { CROSSHAIR_SYSTEM_ID, HUD_SYSTEM_ID } from './constants';
import { createHudController } from '../hud/hud';
import { createCrosshairController } from '../hud/crosshair';
import { CROSSHAIR_STATE_IDLE, CROSSHAIR_STATE_TARGET } from '../hud/constants';
import { initializeToolbar } from '../hud/toolbar';
import { PersistenceManager } from '../persistence/manager';

export interface StarwatchContext {
  noa: Engine;
  persistence: PersistenceManager;
  sector: WorldContext['sector'];
}

export function bootstrapStarwatch(): StarwatchContext {
  const noa = new Engine(ENGINE_OPTIONS);
  const persistence = new PersistenceManager(noa, 'sector.001');

  const worldContext = initializeWorld(noa, persistence);
  initializePlayer(noa);
  persistence.applyPlayerSnapshot();
  initializePointerLock(noa);

  let selectedIndex = DEFAULT_BLOCK_SELECTION_INDEX;

  const resolveBlockId = () => worldContext.blockPalette[selectedIndex]?.id ?? 0;
  const hud = createHudController();
  const crosshair = createCrosshairController();
  const palette = worldContext.blockPalette;

  const applySelection = () => {
    const label = palette[selectedIndex]?.label ?? '---';
    hud.updateSelected(label);
    toolbar.render(selectedIndex);
  };

  const toolbar = initializeToolbar(palette, (index) => {
    if (index < 0 || index >= palette.length) return;
    selectedIndex = index;
    applySelection();
  });

  applySelection();

  initializeInteractions(noa, resolveBlockId, (mutation) => {
    persistence.registerBlockMutation(mutation);
  });

  const systems: TickSystem[] = [
    ...worldContext.systems,
    {
      id: HUD_SYSTEM_ID,
      update: () => {
        const position = noa.entities.getPositionData(noa.playerEntity).position;
        hud.updatePosition(position);
      },
    },
    {
      id: CROSSHAIR_SYSTEM_ID,
      update: () => {
        crosshair.setState(noa.targetedBlock ? CROSSHAIR_STATE_TARGET : CROSSHAIR_STATE_IDLE);
      },
    },
    persistence.createTickSystem(),
  ];

  initializeTickLoop(noa, systems);

  return { noa, persistence, sector: worldContext.sector };
}
