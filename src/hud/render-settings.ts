import { Engine } from 'noa-engine';
import { GRID_UNIT_METERS } from '../config/constants';
import {
  clampRenderSettingValue,
  RENDER_SETTINGS_BOUNDS,
  RENDER_SETTINGS_STORAGE_KEY,
  serializeRenderSettings,
  subscribeRenderSettings,
  type RenderSettingsState,
  updateRenderSettings,
} from '../config/render-settings';

const SUN_DISTANCE_STORAGE_KEY = 'starwatch.settings.sun-distance';
const SUN_SIZE_STORAGE_KEY = 'starwatch.settings.sun-size';

interface SunAdjustment {
  getDistance(): number;
  setDistance(distance: number): void;
  getDiameter(): number;
  setDiameter(diameter: number): void;
}

interface SliderDescriptor {
  key: keyof RenderSettingsState;
  elementId: string;
  readoutId: string;
  format(state: RenderSettingsState, chunkSize: number): string;
  getDynamicMin?: (state: RenderSettingsState) => number;
}

function kmFromChunks(chunks: number, chunkSize: number): number {
  return (chunks * chunkSize * GRID_UNIT_METERS) / 1000;
}

function formatChunkDistance(chunks: number, chunkSize: number): string {
  return `${chunks.toFixed(0)} chunks • ${kmFromChunks(chunks, chunkSize).toFixed(2)} km`;
}

function formatRemovalMargin(
  base: number,
  offset: number,
  chunkSize: number,
): string {
  const margin = offset;
  const removeAt = base + offset;
  return `+${margin.toFixed(1)} chunks → remove @ ${removeAt.toFixed(1)} chunks • ${kmFromChunks(removeAt, chunkSize).toFixed(2)} km`;
}

function formatSearchMargin(
  margin: number,
  chunkSize: number,
): string {
  return `${margin.toFixed(0)} chunks extra • ${kmFromChunks(margin, chunkSize).toFixed(2)} km beyond mesh radius`;
}

function formatProcessingTick(ms: number): string {
  return `${ms.toFixed(0)} ms por tick • acelera geração`;
}

function formatProcessingRender(ms: number): string {
  return `${ms.toFixed(0)} ms por frame • aplicações durante render`;
}

function formatChunkLimit(limit: number): string {
  return `${limit.toFixed(0)} chunks em paralelo`;
}

function formatNeighborRequirement(neighbors: number): string {
  if (neighbors <= 0) return 'Sem espera por vizinhos';
  if (neighbors === 1) return 'Exige 1 vizinho antes de meshar';
  return `Exige ${neighbors.toFixed(0)} vizinhos antes de meshar`;
}

function formatRenderFps(value: number): string {
  if (value <= 0) return 'Vinculado ao VSync';
  return `${value.toFixed(0)} FPS máx.`;
}

export function initializeRenderSettingsDrawer(
  noa: Engine,
  chunkSize: number,
  sunControls?: SunAdjustment,
) {
  if (typeof window === 'undefined') return;

  const toggleButton = document.getElementById('render-settings-toggle');
  const drawer = document.getElementById('render-settings');
  const sunDistanceSlider = document.getElementById('render-settings-sun-distance') as HTMLInputElement | null;
  const sunDistanceReadout = document.getElementById('render-settings-sun-distance-readout');
  const sunSizeSlider = document.getElementById('render-settings-sun-size') as HTMLInputElement | null;
  const sunSizeReadout = document.getElementById('render-settings-sun-size-readout');
  const summary = document.getElementById('render-settings-summary');

  if (!toggleButton || !drawer || !summary) {
    return;
  }

  const popoverButtons = Array.from(
    document.querySelectorAll('[data-popover-target]'),
  ) as HTMLButtonElement[];
  let activePopover: HTMLElement | null = null;
  let activeTrigger: HTMLButtonElement | null = null;

  const closeActivePopover = () => {
    if (!activePopover || !activeTrigger) return;
    activePopover.classList.remove('is-open');
    activePopover.setAttribute('aria-hidden', 'true');
    activeTrigger.setAttribute('aria-expanded', 'false');
    activePopover = null;
    activeTrigger = null;
  };

  const openPopover = (trigger: HTMLButtonElement, popover: HTMLElement) => {
    if (activePopover === popover) {
      closeActivePopover();
      return;
    }
    closeActivePopover();
    popover.classList.add('is-open');
    popover.setAttribute('aria-hidden', 'false');
    trigger.setAttribute('aria-expanded', 'true');
    activePopover = popover;
    activeTrigger = trigger;
  };

  popoverButtons.forEach((button) => {
    const targetId = button.dataset.popoverTarget;
    if (!targetId) {
      return;
    }
    const popover = document.getElementById(targetId);
    if (!popover) {
      return;
    }
    popover.setAttribute('aria-hidden', popover.classList.contains('is-open') ? 'false' : 'true');
    popover.addEventListener('click', (event) => {
      event.stopPropagation();
    });
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      openPopover(button, popover);
    });
    button.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeActivePopover();
      }
    });
  });

  const sliderDescriptors: SliderDescriptor[] = [
    {
      key: 'chunkHorizontalAddChunks',
      elementId: 'render-settings-horizontal',
      readoutId: 'render-settings-horizontal-readout',
      format: (state) => formatChunkDistance(state.chunkHorizontalAddChunks, chunkSize),
    },
    {
      key: 'chunkVerticalAddChunks',
      elementId: 'render-settings-vertical',
      readoutId: 'render-settings-vertical-readout',
      format: (state) => formatChunkDistance(state.chunkVerticalAddChunks, chunkSize),
    },
    {
      key: 'chunkRemoveHorizontalOffsetChunks',
      elementId: 'render-settings-remove-horizontal',
      readoutId: 'render-settings-remove-horizontal-readout',
      format: (state) =>
        formatRemovalMargin(state.chunkHorizontalAddChunks, state.chunkRemoveHorizontalOffsetChunks, chunkSize),
    },
    {
      key: 'chunkRemoveVerticalOffsetChunks',
      elementId: 'render-settings-remove-vertical',
      readoutId: 'render-settings-remove-vertical-readout',
      format: (state) =>
        formatRemovalMargin(state.chunkVerticalAddChunks, state.chunkRemoveVerticalOffsetChunks, chunkSize),
    },
    {
      key: 'asteroidVoxelLodChunks',
      elementId: 'render-settings-voxel',
      readoutId: 'render-settings-voxel-readout',
      format: (state) => formatChunkDistance(state.asteroidVoxelLodChunks, chunkSize),
    },
    {
      key: 'asteroidMeshLodChunks',
      elementId: 'render-settings-mesh',
      readoutId: 'render-settings-mesh-readout',
      format: (state) =>
        `${formatChunkDistance(state.asteroidMeshLodChunks, chunkSize)} • fallback to meshes`,
      getDynamicMin: (state) => state.asteroidVoxelLodChunks + 1,
    },
    {
      key: 'asteroidSearchMarginChunks',
      elementId: 'render-settings-search-margin',
      readoutId: 'render-settings-search-margin-readout',
      format: (state) => formatSearchMargin(state.asteroidSearchMarginChunks, chunkSize),
    },
    {
      key: 'chunkProcessingMaxTickMs',
      elementId: 'render-settings-processing-tick',
      readoutId: 'render-settings-processing-tick-readout',
      format: (state) => formatProcessingTick(state.chunkProcessingMaxTickMs),
    },
    {
      key: 'chunkProcessingMaxRenderMs',
      elementId: 'render-settings-processing-render',
      readoutId: 'render-settings-processing-render-readout',
      format: (state) => formatProcessingRender(state.chunkProcessingMaxRenderMs),
    },
    {
      key: 'chunkPendingCreationLimit',
      elementId: 'render-settings-creation-limit',
      readoutId: 'render-settings-creation-limit-readout',
      format: (state) => formatChunkLimit(state.chunkPendingCreationLimit),
    },
    {
      key: 'chunkPendingMeshingLimit',
      elementId: 'render-settings-meshing-limit',
      readoutId: 'render-settings-meshing-limit-readout',
      format: (state) => formatChunkLimit(state.chunkPendingMeshingLimit),
    },
    {
      key: 'chunkMinNeighborsToMesh',
      elementId: 'render-settings-neighbors',
      readoutId: 'render-settings-neighbors-readout',
      format: (state) => formatNeighborRequirement(state.chunkMinNeighborsToMesh),
    },
    {
      key: 'renderMaxFps',
      elementId: 'render-settings-render-fps',
      readoutId: 'render-settings-render-fps-readout',
      format: (state) => formatRenderFps(state.renderMaxFps),
    },
  ];

  const sliderElements = sliderDescriptors.map((descriptor) => {
    const input = document.getElementById(descriptor.elementId) as HTMLInputElement | null;
    const readout = document.getElementById(descriptor.readoutId);
    if (input) {
      const bounds = RENDER_SETTINGS_BOUNDS[descriptor.key];
      input.min = bounds.min.toString();
      input.max = bounds.max.toString();
      input.step = bounds.step.toString();
    }
    return { descriptor, input, readout };
  });

  let lastAppliedAdd: [number, number] | null = null;
  let lastAppliedRemove: [number, number] | null = null;

  const applyWorldStreaming = (state: RenderSettingsState) => {
    const addDistances: [number, number] = [
      state.chunkHorizontalAddChunks,
      state.chunkVerticalAddChunks,
    ];
    const removeDistances: [number, number] = [
      state.chunkHorizontalAddChunks + state.chunkRemoveHorizontalOffsetChunks,
      state.chunkVerticalAddChunks + state.chunkRemoveVerticalOffsetChunks,
    ];
    const addChanged =
      !lastAppliedAdd ||
      addDistances[0] !== lastAppliedAdd[0] ||
      addDistances[1] !== lastAppliedAdd[1];
    const removeChanged =
      !lastAppliedRemove ||
      removeDistances[0] !== lastAppliedRemove[0] ||
      removeDistances[1] !== lastAppliedRemove[1];
    if (addChanged || removeChanged) {
      noa.world.setAddRemoveDistance(addDistances, removeDistances);
      console.log(
        `[Streaming] add H${addDistances[0].toFixed(1)}c/V${addDistances[1].toFixed(
          1,
        )} remove H${removeDistances[0].toFixed(1)}c/V${removeDistances[1].toFixed(1)}c`,
      );
      lastAppliedAdd = [...addDistances];
      lastAppliedRemove = [...removeDistances];
    }
  };

  let lastProcessing: {
    tick: number;
    render: number;
    creation: number;
    meshing: number;
    neighbors: number;
    fps: number;
  } | null = null;

  const applyPipelineSettings = (state: RenderSettingsState) => {
    const world = noa.world as unknown as {
      maxProcessingPerTick?: number;
      maxProcessingPerRender?: number;
      maxChunksPendingCreation?: number;
      maxChunksPendingMeshing?: number;
      minNeighborsToMesh?: number;
      worldGenWhilePaused?: boolean;
    };

    const current = lastProcessing;
    const next = {
      tick: state.chunkProcessingMaxTickMs,
      render: state.chunkProcessingMaxRenderMs,
      creation: state.chunkPendingCreationLimit,
      meshing: state.chunkPendingMeshingLimit,
      neighbors: state.chunkMinNeighborsToMesh,
      fps: state.renderMaxFps,
    };

    const changed =
      !current ||
      current.tick !== next.tick ||
      current.render !== next.render ||
      current.creation !== next.creation ||
      current.meshing !== next.meshing ||
      current.neighbors !== next.neighbors ||
      current.fps !== next.fps;

    if (!changed) {
      return;
    }

    world.maxProcessingPerTick = next.tick;
    world.maxProcessingPerRender = next.render;
    world.maxChunksPendingCreation = next.creation;
    world.maxChunksPendingMeshing = next.meshing;
    world.minNeighborsToMesh = next.neighbors;
    world.worldGenWhilePaused = true;
    const shell = (noa.container as unknown as {
      _shell?: {
        maxRenderRate?: number;
      };
    })?._shell;
    if (shell) {
      shell.maxRenderRate = next.fps;
    }

    console.log(
      `[Streaming] throughput -> tick ${next.tick}ms, render ${next.render}ms, pending ${next.creation}/${next.meshing}, neighbors ${next.neighbors}, fpsCap ${next.fps}`,
    );

    lastProcessing = next;
  };

  const updateSummary = (state: RenderSettingsState) => {
    summary.textContent = `H ${state.chunkHorizontalAddChunks.toFixed(0)}c • V ${state.chunkVerticalAddChunks.toFixed(0)}c`;
  };

  const updateSliderViews = (state: RenderSettingsState) => {
    for (let i = 0; i < sliderElements.length; i += 1) {
      const { descriptor, input, readout } = sliderElements[i];
      const value = state[descriptor.key];
      if (input) {
        const bounds = RENDER_SETTINGS_BOUNDS[descriptor.key];
        const dynamicMin = descriptor.getDynamicMin ? descriptor.getDynamicMin(state) : bounds.min;
        input.min = Math.max(bounds.min, dynamicMin).toString();
        if (value < Number(input.min)) {
          input.value = input.min;
        } else {
          input.value = value.toString();
        }
      }
      if (readout) {
        readout.textContent = descriptor.format(state, chunkSize);
      }
    }
  };

  const persistState = (state: RenderSettingsState) => {
    window.localStorage?.setItem(
      RENDER_SETTINGS_STORAGE_KEY,
      serializeRenderSettings(state),
    );
  };

  subscribeRenderSettings((state) => {
    updateSliderViews(state);
    updateSummary(state);
    applyWorldStreaming(state);
    applyPipelineSettings(state);
    persistState(state);
  });

  sliderElements.forEach(({ descriptor, input }) => {
    if (!input) {
      return;
    }
    input.addEventListener('input', () => {
      const rawValue = Number(input.value);
      if (!Number.isFinite(rawValue)) {
        return;
      }
      const clamped = clampRenderSettingValue(descriptor.key, rawValue);
      if (clamped !== rawValue) {
        input.value = clamped.toString();
      }
      updateRenderSettings({
        [descriptor.key]: clamped,
      } as Partial<RenderSettingsState>);
    });
  });

  const setDrawerState = (open: boolean) => {
    if (open) {
      drawer.classList.add('is-open');
    } else {
      drawer.classList.remove('is-open');
      closeActivePopover();
    }
    const expanded = drawer.classList.contains('is-open');
    toggleButton.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    drawer.setAttribute('aria-hidden', expanded ? 'false' : 'true');
  };

  const toggleDrawer = () => {
    setDrawerState(!drawer.classList.contains('is-open'));
  };

  toggleButton.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggleDrawer();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (activePopover) {
        closeActivePopover();
        event.stopPropagation();
        return;
      }
      if (drawer.classList.contains('is-open')) {
        setDrawerState(false);
      }
    }
  });

  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    if (activePopover && activeTrigger) {
      if (
        target !== activeTrigger &&
        !activeTrigger.contains(target) &&
        !activePopover.contains(target)
      ) {
        closeActivePopover();
      }
    }
    if (!drawer.classList.contains('is-open')) return;
    if (drawer.contains(target) || target === toggleButton) {
      return;
    }
    setDrawerState(false);
  });

  setDrawerState(false);

  if (sunControls && sunDistanceSlider && sunDistanceReadout) {
    const storedDistance = Number(window.localStorage?.getItem(SUN_DISTANCE_STORAGE_KEY) ?? '');
    const defaultDistance = Number.isFinite(storedDistance) ? storedDistance : sunControls.getDistance();
    const applySunDistance = (distance: number) => {
      const clamped = Math.min(
        Math.max(distance, Number(sunDistanceSlider.min)),
        Number(sunDistanceSlider.max),
      );
      sunControls.setDistance(clamped);
      sunDistanceReadout.textContent = `${clamped.toFixed(1)} blocks • ${(clamped * GRID_UNIT_METERS).toFixed(1)} m`;
      window.localStorage?.setItem(SUN_DISTANCE_STORAGE_KEY, clamped.toString());
      const scene = noa.rendering.getScene();
      const camera = scene?.activeCamera as { maxZ?: number } | undefined;
      if (camera) {
        const desired = Math.max(clamped * 1.5, 50000);
        if (!camera.maxZ || camera.maxZ < desired) {
          camera.maxZ = desired;
        }
      }
    };
    sunDistanceSlider.value = defaultDistance.toString();
    applySunDistance(defaultDistance);
    sunDistanceSlider.addEventListener('input', () => {
      applySunDistance(Number(sunDistanceSlider.value));
    });
  }

  if (sunControls && sunSizeSlider && sunSizeReadout) {
    const storedDiameter = Number(window.localStorage?.getItem(SUN_SIZE_STORAGE_KEY) ?? '');
    const defaultDiameter = Number.isFinite(storedDiameter) ? storedDiameter : sunControls.getDiameter();
    const applySunSize = (diameter: number) => {
      const clamped = Math.min(
        Math.max(diameter, Number(sunSizeSlider.min)),
        Number(sunSizeSlider.max),
      );
      sunControls.setDiameter(clamped);
      sunSizeReadout.textContent = `${clamped.toFixed(1)} blocks • ${(clamped * GRID_UNIT_METERS).toFixed(1)} m`;
      window.localStorage?.setItem(SUN_SIZE_STORAGE_KEY, clamped.toString());
    };
    sunSizeSlider.value = defaultDiameter.toString();
    applySunSize(defaultDiameter);
    sunSizeSlider.addEventListener('input', () => {
      applySunSize(Number(sunSizeSlider.value));
    });
  }
}
