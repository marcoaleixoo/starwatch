import { Engine } from 'noa-engine';
import { GRID_UNIT_METERS } from '../config/constants';

const STORAGE_KEY = 'starwatch.settings.render-distance';
const SUN_DISTANCE_STORAGE_KEY = 'starwatch.settings.sun-distance';
const SUN_SIZE_STORAGE_KEY = 'starwatch.settings.sun-size';

const DEFAULT_HORIZONTAL = 2.5;
const VERTICAL_RATIO = 0.6;
const REMOVE_OFFSET = 1;

interface StoredRenderSettings {
  horizontal: number;
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
    if (typeof parsed.horizontal !== 'number' || Number.isNaN(parsed.horizontal)) {
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

function formatMeters(horizontalDistance: number, chunkSize: number): string {
  const meters = horizontalDistance * chunkSize * GRID_UNIT_METERS;
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${meters.toFixed(0)} m`;
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
  const defaultHorizontal = defaults.horizontal || DEFAULT_HORIZONTAL;
  const initialHorizontal = clamp(
    stored?.horizontal ?? defaultHorizontal,
    Number(slider.min),
    Number(slider.max),
  );

  slider.value = initialHorizontal.toString();

  const applyDistance = (horizontal: number) => {
    const clampedHorizontal = clamp(horizontal, Number(slider.min), Number(slider.max));
    const vertical = Math.max(1, Math.round(clampedHorizontal * VERTICAL_RATIO));
    const removeHorizontal = clampedHorizontal + REMOVE_OFFSET;
    const removeVertical = vertical + REMOVE_OFFSET;

    noa.world.setAddRemoveDistance([clampedHorizontal, vertical], [removeHorizontal, removeVertical]);

    const formatted = formatMeters(clampedHorizontal, chunkSize);
    readout.textContent = `${clampedHorizontal.toFixed(1)} chunks • ${formatted}`;

    if (hint) {
      hint.textContent = `Vertical draw ${vertical.toFixed(0)} chunks`;
    }

    window.localStorage?.setItem(
      STORAGE_KEY,
      JSON.stringify({
        horizontal: clampedHorizontal,
      }),
    );
  };

  applyDistance(initialHorizontal);

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
    const applySunDistance = (distance: number) => {
      const clampedDistance = clamp(distance, Number(sunDistanceSlider.min), Number(sunDistanceSlider.max));
      sunControls.setDistance(clampedDistance);
      sunDistanceReadout.textContent = `${clampedDistance.toFixed(1)} blocks • ${formatWorldUnits(clampedDistance)}`;
      window.localStorage?.setItem(SUN_DISTANCE_STORAGE_KEY, clampedDistance.toString());
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
