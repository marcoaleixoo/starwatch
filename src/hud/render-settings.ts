import { Engine } from 'noa-engine';
import { GRID_UNIT_METERS } from '../config/constants';

const STORAGE_KEY = 'starwatch.settings.render-distance';
const SUN_DISTANCE_STORAGE_KEY = 'starwatch.settings.sun-distance';
const SUN_SIZE_STORAGE_KEY = 'starwatch.settings.sun-size';

const DEFAULT_HORIZONTAL = 2.5;
const VERTICAL_RATIO = 0.6;
const REMOVE_OFFSET = 1;

interface StoredRenderSettings {
  viewKm: number;
}

interface SunAdjustment {
  getDistance(): number;
  setDistance(distance: number): void;
  getDiameter(): number;
  setDiameter(diameter: number): void;
}

function parseStoredSettings(raw: string | null): StoredRenderSettings | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredRenderSettings;
    if (typeof parsed.viewKm !== 'number' || Number.isNaN(parsed.viewKm)) {
      return null;
    }
    return parsed;
  } catch (error) {
    console.warn('[RenderSettings] Failed to parse stored settings', error);
    return null;
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function parseStoredNumber(raw: string | null): number | null {
  if (!raw) return null;
  const value = Number(raw);
  if (Number.isFinite(value)) return value;
  return null;
}

function formatWorldUnits(value: number): string {
  const meters = value * GRID_UNIT_METERS;
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)} km`;
  }
  return `${meters.toFixed(1)} m`;
}

export function initializeRenderSettingsDrawer(
  noa: Engine,
  chunkSize: number,
  defaults: { horizontal: number },
  sunControls?: SunAdjustment,
) {
  if (typeof window === 'undefined') return;

  const toggleButton = document.getElementById('render-settings-toggle');
  const drawer = document.getElementById('render-settings');
  const slider = document.getElementById('render-settings-distance') as HTMLInputElement | null;
  const readout = document.getElementById('render-settings-distance-readout');
  const hint = document.getElementById('render-settings-hint');
  const sunDistanceSlider = document.getElementById('render-settings-sun-distance') as HTMLInputElement | null;
  const sunDistanceReadout = document.getElementById('render-settings-sun-distance-readout');
  const sunSizeSlider = document.getElementById('render-settings-sun-size') as HTMLInputElement | null;
  const sunSizeReadout = document.getElementById('render-settings-sun-size-readout');

  if (!toggleButton || !drawer || !slider || !readout) {
    return;
  }

  const stored = parseStoredSettings(window.localStorage?.getItem(STORAGE_KEY) ?? null);
  const kmFromChunks = (chunks: number) => (chunks * chunkSize * GRID_UNIT_METERS) / 1000;

  const sliderMinChunks = Number(slider.min);
  const sliderMaxChunks = Number(slider.max);
  const HARD_MAX_CHUNKS = 120;
  const storedChunks = stored?.horizontalChunks ?? defaults.horizontal ?? DEFAULT_HORIZONTAL;
  const initialChunks = clamp(storedChunks, sliderMinChunks, Math.min(sliderMaxChunks, HARD_MAX_CHUNKS));
  slider.value = initialChunks.toString();

  const applyDistance = (horizontalChunksRaw: number) => {
    const horizontalChunks = clamp(horizontalChunksRaw, sliderMinChunks, Math.min(sliderMaxChunks, HARD_MAX_CHUNKS));
    const verticalChunks = Math.max(1, Math.round(horizontalChunks * VERTICAL_RATIO));
    const removeHorizontal = horizontalChunks + REMOVE_OFFSET;
    const removeVertical = verticalChunks + REMOVE_OFFSET;

    noa.world.setAddRemoveDistance([horizontalChunks, verticalChunks], [removeHorizontal, removeVertical]);

    const km = kmFromChunks(horizontalChunks);
    readout.textContent = `${km.toFixed(2)} km • ${horizontalChunks.toFixed(0)} chunks`;

    if (hint) {
      hint.textContent = `Vertical draw ~${verticalChunks.toFixed(0)} chunks`;
    }

    window.localStorage?.setItem(
      STORAGE_KEY,
      JSON.stringify({
        horizontalChunks,
      }),
    );
  };

  applyDistance(initialChunks);

  slider.addEventListener('input', () => {
    applyDistance(Number(slider.value));
  });

  if (sunControls && sunDistanceSlider && sunDistanceReadout) {
    const storedDistance = parseStoredNumber(window.localStorage?.getItem(SUN_DISTANCE_STORAGE_KEY) ?? null);
    const defaultDistance = sunControls.getDistance();
    const initialDistance = clamp(
      storedDistance ?? defaultDistance ?? Number(sunDistanceSlider.value),
      Number(sunDistanceSlider.min),
      Number(sunDistanceSlider.max),
    );
    const updateFarPlane = (distance: number) => {
      const scene = noa.rendering.getScene();
      const camera = scene?.activeCamera as { maxZ?: number } | undefined;
      if (!camera) return;
      const desired = Math.max(distance * 1.5, 50000);
      if (!camera.maxZ || camera.maxZ < desired) {
        camera.maxZ = desired;
      }
    };
    const applySunDistance = (distance: number) => {
      const clampedDistance = clamp(distance, Number(sunDistanceSlider.min), Number(sunDistanceSlider.max));
      sunControls.setDistance(clampedDistance);
      sunDistanceReadout.textContent = `${clampedDistance.toFixed(1)} blocks • ${formatWorldUnits(clampedDistance)}`;
      window.localStorage?.setItem(SUN_DISTANCE_STORAGE_KEY, clampedDistance.toString());
      updateFarPlane(clampedDistance);
    };
    sunDistanceSlider.value = initialDistance.toString();
    applySunDistance(initialDistance);
    sunDistanceSlider.addEventListener('input', () => {
      applySunDistance(Number(sunDistanceSlider.value));
    });
  }

  if (sunControls && sunSizeSlider && sunSizeReadout) {
    const storedDiameter = parseStoredNumber(window.localStorage?.getItem(SUN_SIZE_STORAGE_KEY) ?? null);
    const defaultDiameter = sunControls.getDiameter();
    const initialDiameter = clamp(
      storedDiameter ?? defaultDiameter ?? Number(sunSizeSlider.value),
      Number(sunSizeSlider.min),
      Number(sunSizeSlider.max),
    );
    const applySunSize = (diameter: number) => {
      const clampedDiameter = clamp(diameter, Number(sunSizeSlider.min), Number(sunSizeSlider.max));
      sunControls.setDiameter(clampedDiameter);
      sunSizeReadout.textContent = `${clampedDiameter.toFixed(1)} blocks • ${formatWorldUnits(clampedDiameter)}`;
      window.localStorage?.setItem(SUN_SIZE_STORAGE_KEY, clampedDiameter.toString());
    };
    sunSizeSlider.value = initialDiameter.toString();
    applySunSize(initialDiameter);
    sunSizeSlider.addEventListener('input', () => {
      applySunSize(Number(sunSizeSlider.value));
    });
  }

  const setDrawerState = (open: boolean) => {
    if (open) {
      drawer.classList.add('is-open');
    } else {
      drawer.classList.remove('is-open');
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
    if (event.key === 'Escape' && drawer.classList.contains('is-open')) {
      setDrawerState(false);
    }
  });

  document.addEventListener('click', (event) => {
    if (!drawer.classList.contains('is-open')) return;
    const target = event.target as HTMLElement;
    if (drawer.contains(target) || target === toggleButton) {
      return;
    }
    setDrawerState(false);
  });

  setDrawerState(false);
}
