import './styles.css';
import { Engine } from 'noa-engine';
import { CreateBox } from '@babylonjs/core/Meshes/Builders/boxBuilder';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import '@babylonjs/core/Materials/standardMaterial';

const crosshairEl = document.querySelector<HTMLDivElement>('.crosshair');
const energyEl = document.getElementById('status-energy');
const heatEl = document.getElementById('status-heat');

const engineOptions = {
  debug: true,
  showFPS: true,
  chunkSize: 32,
  chunkAddDistance: 1.5,
  chunkRemoveDistance: 2.1,
  playerStart: [0, 6, 0],
};

const noa = new Engine(engineOptions);

const DIRT_NAME = 'dirt';
const GRASS_NAME = 'grass';
const ROCK_NAME = 'rock';

noa.registry.registerMaterial(DIRT_NAME, { color: [0.36, 0.29, 0.19] });
noa.registry.registerMaterial(GRASS_NAME, { color: [0.12, 0.45, 0.24] });
noa.registry.registerMaterial(ROCK_NAME, { color: [0.4, 0.4, 0.46] });

const dirtID = noa.registry.registerBlock(1, { material: DIRT_NAME });
const grassID = noa.registry.registerBlock(2, { material: GRASS_NAME });
const rockID = noa.registry.registerBlock(3, { material: ROCK_NAME });

type PaletteEntry = {
  id: number;
  label: string;
  hotkey: string;
};

const buildPalette: PaletteEntry[] = [
  { id: rockID, label: 'ROCK', hotkey: '1' },
  { id: grassID, label: 'GRASS', hotkey: '2' },
];

let selectedIndex = 0;

const PLATFORM_HALF = 5; // creates 10x10 area centered at origin
const PLATFORM_Y = 1;

function withinPlatform(x: number, z: number) {
  return x >= -PLATFORM_HALF && x < PLATFORM_HALF && z >= -PLATFORM_HALF && z < PLATFORM_HALF;
}

function getVoxelId(x: number, y: number, z: number) {
  if (!withinPlatform(x, z)) {
    return 0;
  }

  if (y === PLATFORM_Y) {
    return rockID;
  }

  return 0;
}

noa.world.on('worldDataNeeded', (id, data, x, y, z) => {
  for (let i = 0; i < data.shape[0]; i += 1) {
    for (let j = 0; j < data.shape[1]; j += 1) {
      for (let k = 0; k < data.shape[2]; k += 1) {
        const voxel = getVoxelId(x + i, y + j, z + k);
        data.set(i, j, k, voxel);
      }
    }
  }

  noa.world.setChunkData(id, data);
});

const playerEntity = noa.playerEntity;
const positionData = noa.entities.getPositionData(playerEntity);
const scene = noa.rendering.getScene();

const toolbarEl = document.getElementById('toolbar');
const toolbarButtons: HTMLButtonElement[] = [];

const playerMesh = CreateBox('player-box', { size: 1 }, scene);
playerMesh.scaling = new Vector3(positionData.width, positionData.height, positionData.width);
playerMesh.material = noa.rendering.makeStandardMaterial();

noa.entities.addComponent(playerEntity, noa.entities.names.mesh, {
  mesh: playerMesh,
  offset: [0, positionData.height / 2, 0],
});

noa.inputs.down.on('fire', () => {
  if (!noa.targetedBlock) return;
  const [x, y, z] = noa.targetedBlock.position;
  noa.setBlock(0, x, y, z);
});

noa.inputs.down.on('alt-fire', () => {
  if (!noa.targetedBlock) return;
  const [x, y, z] = noa.targetedBlock.adjacent;
  const blockId = buildPalette[selectedIndex]?.id ?? rockID;
  noa.setBlock(blockId, x, y, z);
});

noa.inputs.bind('alt-fire', ['Mouse2', 'KeyE']);
noa.inputs.bind('jump', ['Space']);

noa.on('tick', (dt) => {
  updateHud();
  updateCrosshair();
});

if (toolbarEl) {
  initializeToolbar();
} else {
  window.addEventListener('DOMContentLoaded', initializeToolbar, { once: true });
}

function updateCrosshair() {
  if (!crosshairEl) return;
  const state = noa.targetedBlock ? 'target' : 'idle';
  crosshairEl.dataset.state = state;
}

function updateHud() {
  const pos = noa.entities.getPositionData(playerEntity).position;
  if (energyEl) energyEl.textContent = `POS ${pos.map((n) => n.toFixed(1)).join(' ')}`;
  if (heatEl) heatEl.textContent = `BLOCK ${buildPalette[selectedIndex]?.label ?? '---'}`;
}

window.addEventListener('keydown', (event) => {
  if (event.code === 'Digit1') selectPaletteIndex(0);
  if (event.code === 'Digit2') selectPaletteIndex(1);
});

const canvas = noa.container?.canvas;

if (canvas) {
  canvas.addEventListener('click', () => {
    if (canvas.requestPointerLock) {
      canvas.requestPointerLock();
    }
  });
}

window.addEventListener('blur', () => {
  if (document.pointerLockElement) {
    try {
      document.exitPointerLock();
    } catch (error) {
      // ignore
    }
  }
});

declare global {
  interface Window {
    noa?: typeof noa;
  }
}

window.noa = noa;

function initializeToolbar() {
  if (!toolbarEl) return;
  toolbarEl.innerHTML = '';
  toolbarButtons.length = 0;
  buildPalette.forEach((entry, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'toolbar__slot';
    button.dataset.index = String(index);
    button.innerHTML = `<sup>${entry.hotkey}</sup>${entry.label}`;
    button.addEventListener('click', (event) => {
      event.preventDefault();
      selectPaletteIndex(index);
    });
    toolbarButtons.push(button);
    toolbarEl.appendChild(button);
  });
  renderToolbar();
}

function selectPaletteIndex(index: number) {
  if (index < 0 || index >= buildPalette.length) return;
  if (selectedIndex === index) return;
  selectedIndex = index;
  updateHud();
  renderToolbar();
}

function renderToolbar() {
  toolbarButtons.forEach((button, index) => {
    if (index === selectedIndex) {
      button.classList.add('is-active');
    } else {
      button.classList.remove('is-active');
    }
  });
}
