import type { EnergySystem } from './index';

interface DebugOverlayState {
  networks: string[];
  panelOutputs: string[];
  lastEventMs: number;
}

const PRINT_INTERVAL_MS = 5000;

export class EnergyDebugOverlay {
  private visible = false;
  private readonly element: HTMLDivElement;
  private readonly energy: EnergySystem;
  private lastPrint = 0;

  constructor(energy: EnergySystem) {
    this.energy = energy;
    this.element = document.createElement('div');
    this.element.id = 'energy-debug-overlay';
    this.element.setAttribute('hidden', 'true');
    document.body.appendChild(this.element);
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
    if (visible) {
      this.element.removeAttribute('hidden');
      this.render();
    } else {
      this.element.setAttribute('hidden', 'true');
    }
  }

  handleTick(dt: number): void {
    if (!this.visible) {
      return;
    }
    this.render();
    this.lastPrint += dt * 1000;
    if (this.lastPrint >= PRINT_INTERVAL_MS) {
      this.lastPrint = 0;
      this.printToConsole();
    }
  }

  dispose(): void {
    this.element.remove();
  }

  private render(): void {
    if (!this.visible) {
      return;
    }
    const state = this.collectState();
    this.element.innerHTML = `
      <div class="energy-debug">
        <h2>Energy Debug</h2>
        <section>
          <h3>Redes (${state.networks.length})</h3>
          <ul>
            ${state.networks.map((line) => `<li>${line}</li>`).join('')}
          </ul>
        </section>
        <section>
          <h3>Painéis (${state.panelOutputs.length})</h3>
          <ul>
            ${state.panelOutputs.map((line) => `<li>${line}</li>`).join('')}
          </ul>
        </section>
      </div>
    `;
  }

  private collectState(): DebugOverlayState {
    const networks = this.energy.networks
      .listNetworks()
      .map((network) => {
        const delta = network.metrics.totalGenW - network.metrics.totalLoadW;
        return `#${network.id} nodes=${network.nodeCount} gen=${network.metrics.totalGenW.toFixed(
          2,
        )}W load=${network.metrics.totalLoadW.toFixed(2)}W Δ=${delta.toFixed(2)}W stored=${network.metrics.totalStoredMJ.toFixed(
          3,
        )}MJ`;
      });

    const panels = this.energy.listSolarPanels().map((panel) => {
      const shadePct = Math.round(panel.shade * 100);
      return `(${panel.position.join(',')}) ${panel.outputW.toFixed(2)}W shade=${shadePct}% net=${
        panel.networkId ?? '—'
      }`;
    });

    return {
      networks,
      panelOutputs: panels,
      lastEventMs: 0,
    };
  }

  private printToConsole(): void {
    const state = this.collectState();
    console.group('[energy/debug] snapshot');
    state.networks.forEach((line) => console.log(line));
    state.panelOutputs.forEach((line) => console.log(line));
    console.groupEnd();
  }
}
