import { Color3 } from '@babylonjs/core/Maths/math.color';
import { BaseTerminalDisplay, type BaseTerminalDisplayOptions } from './terminal-display';
import type { SolarTerminalData } from './types';
import { clearContent, drawCenteredMessage, drawMetricList, type MetricRow, type MetricVariant } from './render-helpers';
import { formatDelta, formatPercent, formatWatts } from './format';

type SolarOptions = BaseTerminalDisplayOptions<SolarTerminalData>;

export class SolarTerminalDisplay extends BaseTerminalDisplay<SolarTerminalData> {
  constructor(options: SolarOptions) {
    super(options);
    this.createSupport(options);
  }

  protected drawContent(activeTabId: string | null, data: SolarTerminalData): void {
    const area = this.contentArea;
    const ctx = this.ctx;
    clearContent(ctx, area);

    if (!data.snapshot) {
      drawCenteredMessage(ctx, area, ['PAINEL INATIVO', 'VERIFIQUE OBSTRUÇÕES']);
      return;
    }

    if (activeTabId === 'network') {
      this.drawNetwork(ctx, area, data);
    } else {
      this.drawStatus(ctx, area, data);
    }
  }

  private drawStatus(ctx: CanvasRenderingContext2D, area: { x: number; y: number; width: number; height: number }, data: SolarTerminalData): void {
    const { snapshot } = data;
    if (!snapshot) {
      drawCenteredMessage(ctx, area, ['SEM DADOS DISPONÍVEIS']);
      return;
    }
    const rows: MetricRow[] = [
      { label: 'SAÍDA ATUAL', value: formatWatts(snapshot.outputW), variant: 'accent' },
      { label: 'SOMBREAMENTO', value: formatPercent(snapshot.shade) },
    ];
    drawMetricList(ctx, area, rows);
  }

  private drawNetwork(ctx: CanvasRenderingContext2D, area: { x: number; y: number; width: number; height: number }, data: SolarTerminalData): void {
    const { overview } = data;
    if (!overview) {
      drawCenteredMessage(ctx, area, ['SEM REDE']);
      return;
    }
    const deltaVariant: MetricVariant = overview.metrics.deltaW >= 0 ? 'positive' : 'negative';
    const rows: MetricRow[] = [
      { label: 'REDE', value: `#${overview.id.toString().padStart(4, '0')}`, variant: 'accent' },
      { label: 'GERAÇÃO TOTAL', value: formatWatts(overview.metrics.totalGenW) },
      { label: 'CONSUMO', value: formatWatts(overview.metrics.totalLoadW) },
      { label: 'Δ', value: formatDelta(overview.metrics.deltaW), variant: deltaVariant },
    ];
    drawMetricList(ctx, area, rows);
  }

  private createSupport(options: SolarOptions): void {
    const key = options.position.join(':');
    this.createDecorBox(
      `solar-terminal-frame-${key}`,
      {
        width: options.physicalWidth + 0.14,
        height: options.physicalHeight + 0.14,
        depth: 0.08,
      },
      {
        distance: this.mountOffset - 0.04,
        color: new Color3(0.07, 0.12, 0.22),
        emissive: new Color3(0.05, 0.08, 0.16),
        renderingGroupId: 2,
      },
    );

    this.createDecorBox(
      `solar-terminal-bracket-${key}`,
      {
        width: 0.18,
        height: options.physicalHeight + 0.06,
        depth: 0.18,
      },
      {
        distance: this.mountOffset - 0.16,
        color: new Color3(0.05, 0.09, 0.15),
        emissive: new Color3(0.03, 0.05, 0.09),
        renderingGroupId: 1,
      },
    );

    this.createDecorBox(
      `solar-terminal-backplate-${key}`,
      {
        width: options.physicalWidth + 0.22,
        height: options.physicalHeight + 0.22,
        depth: 0.06,
      },
      {
        distance: this.mountOffset - 0.24,
        color: new Color3(0.04, 0.07, 0.12),
        emissive: new Color3(0.02, 0.04, 0.08),
        renderingGroupId: 1,
      },
    );
  }
}
