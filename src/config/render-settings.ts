import defaults from './render-settings.json';

export type RenderSettingsState = typeof defaults;

export const RENDER_SETTINGS_DEFAULTS: RenderSettingsState = defaults;

export function getRenderSettings(): RenderSettingsState {
  return RENDER_SETTINGS_DEFAULTS;
}
