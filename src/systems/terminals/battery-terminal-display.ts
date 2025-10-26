import { Color3 } from '@babylonjs/core/Maths/math.color';
import { BaseTerminalDisplay, type BaseTerminalDisplayOptions } from './terminal-display';
import type { BatteryTerminalData } from './types';
import { clearContent, drawCenteredMessage, drawMetricList, drawProgressBar, type MetricRow, type MetricVariant } from './render-helpers';
import { formatDelta, formatMegajoules, formatWatts, formatPercent } from './format';

type BatteryOptions = BaseTerminalDisplayOptions<BatteryTerminalData>;

export class BatteryTerminalDisplay extends BaseTerminalDisplay<BatteryTerminalData> {
  constructor(options: BatteryOptions) {
    super(options);
    this.createSupport(options);
  }

  protected drawContent(activeTabId: string | null, data: BatteryTerminalData): void {
    const area = this.contentArea;
    const ctx = this.ctx;
    clearContent(ctx, area);

    if (!data.snapshot) {
      drawCenteredMessage(ctx, area, ['BATERIA OFFLINE', 'CONECTE AO DECK']);
      return;
    }

    if (activeTabId === 'network') {
      this.drawNetwork(ctx, area, data);
    } else {
      this.drawStatus(ctx, area, data);
    }
  }

  private drawStatus(ctx: CanvasRenderingContext2D, area: { x: number; y: number; width: number; height: number }, data: BatteryTerminalData): void {
    const { snapshot } = data;
    if (!snapshot) {
      drawCenteredMessage(ctx, area, ['SEM DADOS']);
      return;
    }
    const fill = snapshot.storedMJ / snapshot.capacityMJ;
    drawProgressBar(ctx, area, fill, {
      label: `${formatPercent(fill)} (${formatMegajoules(snapshot.storedMJ)} / ${formatMegajoules(snapshot.capacityMJ)})`,
      color: fill > 0.8 ? 'rgba(120, 225, 160, 0.9)' : 'rgba(120, 200, 255, 0.9)',
    });
  }

  private drawNetwork(ctx: CanvasRenderingContext2D, area: { x: number; y: number; width: number; height: number }, data: BatteryTerminalData): void {
    const { overview } = data;
    if (!overview) {
      drawCenteredMessage(ctx, area, ['REDE NÃO DETECTADA']);
      return;
    }
    const deltaVariant: MetricVariant = overview.metrics.deltaW >= 0 ? 'positive' : 'negative';
    const rows: MetricRow[] = [
      { label: 'REDE', value: `#${overview.id.toString().padStart(4, '0')}`, variant: 'accent' },
      { label: 'RESERVA TOTAL', value: formatMegajoules(overview.metrics.totalStoredMJ) },
      { label: 'GERAÇÃO', value: formatWatts(overview.metrics.totalGenW) },
      { label: 'CONSUMO', value: formatWatts(overview.metrics.totalLoadW) },
      { label: 'Δ', value: formatDelta(overview.metrics.deltaW), variant: deltaVariant },
    ];
    drawMetricList(ctx, area, rows);
  }

  private createSupport(options: BatteryOptions): void {
    const key = options.position.join(':');
    this.createDecorBox(
      `battery-terminal-frame-${key}`,
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
      `battery-terminal-bracket-${key}`,
      {
        width: 0.2,
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
      `battery-terminal-backplate-${key}`,
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
