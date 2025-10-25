import { useMemo } from 'react';
import { useSyncExternalStore } from 'react';
import type { EnergySystem, NetworkOverview, BatterySnapshot, SolarPanelSnapshot } from '../../systems/energy';
import type { LookAtTracker, LookAtState } from '../look-at-tracker';

interface LookAtBadgeProps {
  lookAt: LookAtTracker;
  energy: EnergySystem;
}

const MJ_TO_J = 1_000_000;

function useLookAtState(tracker: LookAtTracker): LookAtState {
  return useSyncExternalStore(
    (listener) => tracker.subscribe(listener),
    () => tracker.getState(),
    () => tracker.getState(),
  );
}

function useEnergyVersion(energy: EnergySystem): number {
  return useSyncExternalStore(
    (listener) => energy.subscribe(listener),
    () => energy.getVersion(),
    () => energy.getVersion(),
  );
}

function formatPower(value: number): string {
  const sign = value > 0 ? '+' : value < 0 ? '−' : '';
  const magnitude = Math.abs(value);
  if (magnitude >= 1000) {
    return `${sign}${(magnitude / 1000).toFixed(1)} kW`;
  }
  return `${sign}${magnitude.toFixed(0)} W`;
}

function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

function formatSeconds(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '—';
  }
  if (seconds > 7200) {
    const hours = seconds / 3600;
    return `${hours.toFixed(1)} h`;
  }
  if (seconds > 120) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${minutes}m ${secs.toString().padStart(2, '0')}s`;
  }
  return `${Math.round(seconds)}s`;
}

function resolvePanelInfo(
  snapshot: SolarPanelSnapshot,
  network: NetworkOverview | null,
): { output: string; shade: string; status: string } {
  const output = formatPower(snapshot.outputW);
  const shade = `${Math.round(snapshot.shade * 100)}%`;
  const status = snapshot.networkId != null && network ? 'Conectado' : 'Sem rede';
  return { output, shade, status };
}

function resolveBatteryInfo(
  snapshot: BatterySnapshot,
  network: NetworkOverview | null,
): {
  stored: string;
  capacity: string;
  percent: string;
  delta: string;
  timeFull: string;
  timeEmpty: string;
} {
  const storedMJ = snapshot.storedMJ;
  const capacityMJ = snapshot.capacityMJ;
  const percent = capacityMJ > 0 ? formatPercent((storedMJ / capacityMJ) * 100) : '0%';

  const deltaW = network?.metrics.deltaW ?? 0;
  const deltaMJPerSec = deltaW / MJ_TO_J;

  const spaceMJ = Math.max(0, capacityMJ - storedMJ);

  const timeFull = deltaMJPerSec > 0 ? formatSeconds(spaceMJ / deltaMJPerSec) : '—';
  const timeEmpty = deltaMJPerSec < 0 ? formatSeconds(storedMJ / Math.abs(deltaMJPerSec)) : '—';

  return {
    stored: `${storedMJ.toFixed(2)} MJ`,
    capacity: `${capacityMJ.toFixed(2)} MJ`,
    percent,
    delta: formatPower(deltaW),
    timeFull,
    timeEmpty,
  };
}

export function LookAtBadge({ lookAt, energy }: LookAtBadgeProps): JSX.Element | null {
  const state = useLookAtState(lookAt);
  useEnergyVersion(energy);

  if (!state.kind || !state.position) {
    return null;
  }

  if (state.kind === 'solar-panel') {
    const panel = energy.getSolarPanelSnapshot(state.position);
    if (!panel) {
      return null;
    }
    const overview = panel.networkId != null ? energy.getNetworkOverview(panel.networkId) : null;
    const info = resolvePanelInfo(panel, overview);
    return (
      <div className="lookat-badge" data-visible="true">
        <div className="lookat-badge__title">Painel Solar</div>
        <div className="lookat-badge__row">
          <span className="label">Saída</span>
          <span className="value is-positive">{info.output}</span>
        </div>
        <div className="lookat-badge__row">
          <span className="label">Sombra</span>
          <span className="value">{info.shade}</span>
        </div>
        <div className="lookat-badge__row">
          <span className="label">Rede</span>
          <span className="value">{info.status}</span>
        </div>
      </div>
    );
  }

  const battery = energy.getBatterySnapshot(state.position);
  if (!battery) {
    return null;
  }
  const overview = battery.networkId != null ? energy.getNetworkOverview(battery.networkId) : null;
  const info = resolveBatteryInfo(battery, overview);

  return (
    <div className="lookat-badge" data-visible="true">
      <div className="lookat-badge__title">Bateria 5 MJ</div>
      <div className="lookat-badge__row">
        <span className="label">Carga</span>
        <span className="value">{info.percent}</span>
      </div>
      <div className="lookat-badge__row">
        <span className="label">Armazenado</span>
        <span className="value">{info.stored}</span>
      </div>
      <div className="lookat-badge__row">
        <span className="label">Δ Rede</span>
        <span className={`value ${overview && overview.metrics.deltaW >= 0 ? 'is-positive' : 'is-negative'}`}>
          {info.delta}
        </span>
      </div>
      <div className="lookat-badge__hint">
        <span>Full: {info.timeFull}</span>
        <span>Empty: {info.timeEmpty}</span>
      </div>
    </div>
  );
}
