import { useEffect, useMemo } from 'react';
import { useSyncExternalStore } from 'react';
import { useOverlayContext } from '../overlay-context';
import type { EnergySystem, NetworkOverview } from '../../../systems/energy';
import type { VoxelPosition } from '../../../systems/energy/energy-network-manager';

interface TerminalPanelProps {
  energy: EnergySystem;
  position: VoxelPosition;
}

function useEnergyVersion(energy: EnergySystem): number {
  return useSyncExternalStore(
    (listener) => energy.subscribe(listener),
    () => energy.getVersion(),
    () => energy.getVersion(),
  );
}

function formatWatts(value: number): string {
  const sign = value > 0 ? '+' : value < 0 ? '−' : '';
  const magnitude = Math.abs(value);
  if (magnitude >= 1000) {
    return `${sign}${(magnitude / 1000).toFixed(2)} kW`;
  }
  return `${sign}${magnitude.toFixed(0)} W`;
}

function formatMegajoules(value: number): string {
  return `${value.toFixed(2)} MJ`;
}

function formatDelta(deltaW: number): string {
  if (Math.abs(deltaW) < 0.5) {
    return '±0 W';
  }
  return formatWatts(deltaW);
}

export function TerminalPanel({ energy, position }: TerminalPanelProps): JSX.Element {
  const { controller } = useOverlayContext();
  useEnergyVersion(energy); // used only to trigger re-render

  const snapshot = energy.getTerminalSnapshot(position);
  const overview: NetworkOverview | null = snapshot?.networkId != null ? energy.getNetworkOverview(snapshot.networkId) : null;

  const metrics = overview?.metrics ?? null;

  const stats = useMemo(() => {
    if (!metrics) {
      return {
        gen: '--',
        load: '--',
        delta: '--',
        stored: '--',
        capacity: '--',
      };
    }
    return {
      gen: formatWatts(metrics.totalGenW),
      load: formatWatts(metrics.totalLoadW),
      delta: formatDelta(metrics.deltaW),
      stored: formatMegajoules(metrics.totalStoredMJ),
      capacity: formatMegajoules(metrics.totalCapMJ),
    };
  }, [metrics]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        controller.closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [controller]);

  return (
    <section className="terminal-panel" role="dialog" aria-modal="true">
      <header className="terminal-panel__header">
        <h1>HAL-9001 TERM // CRT</h1>
        <button type="button" onClick={() => controller.closeModal()}>
          Fechar
        </button>
      </header>
      {snapshot?.networkId != null && overview ? (
        <div className="terminal-panel__content">
          <div className="terminal-panel__row">
            <span className="terminal-label">Rede</span>
            <span className="terminal-value">#{overview.id.toString().padStart(4, '0')}</span>
          </div>
          <div className="terminal-panel__row">
            <span className="terminal-label">Geração</span>
            <span className="terminal-value">{stats.gen}</span>
          </div>
          <div className="terminal-panel__row">
            <span className="terminal-label">Consumo</span>
            <span className="terminal-value">{stats.load}</span>
          </div>
          <div className="terminal-panel__row">
            <span className="terminal-label">Δ</span>
            <span className={`terminal-value ${metrics!.deltaW >= 0 ? 'is-positive' : 'is-negative'}`}>{stats.delta}</span>
          </div>
          <div className="terminal-panel__divider" />
          <div className="terminal-panel__row">
            <span className="terminal-label">Armazenado</span>
            <span className="terminal-value">{stats.stored}</span>
          </div>
          <div className="terminal-panel__row">
            <span className="terminal-label">Capacidade</span>
            <span className="terminal-value">{stats.capacity}</span>
          </div>
          <div className="terminal-panel__divider" />
          <div className="terminal-panel__row">
            <span className="terminal-label">Painéis</span>
            <span className="terminal-value">{overview.panelCount}</span>
          </div>
          <div className="terminal-panel__row">
            <span className="terminal-label">Baterias</span>
            <span className="terminal-value">{overview.batteryCount}</span>
          </div>
          <div className="terminal-panel__row">
            <span className="terminal-label">Terminais</span>
            <span className="terminal-value">{overview.terminalCount}</span>
          </div>
        </div>
      ) : (
        <div className="terminal-panel__content terminal-panel__content--empty">
          <p>Nenhuma rede condutiva detectada.</p>
          <p>Conecte este terminal a um Deck.</p>
        </div>
      )}
      <footer className="terminal-panel__footer">
        <span>[ESC]</span>
        <span>[↑][↓][ENTER]</span>
        <span>[MOUSE]</span>
      </footer>
    </section>
  );
}
